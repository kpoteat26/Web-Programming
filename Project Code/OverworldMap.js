/*
  This file contains the OverworldMap class, which is used to manage the overworld map in the game.
*/
class OverworldMap {
  constructor(config) {
    // set up the map and objects
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    // load the images
    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;
    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    // determine if a cutscene is playing
    this.isCutscenePlaying = false;
    this.isPaused = false;
  }

  // draw the lower half of the map
  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  // draw the upper half of the map
  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  // collision detection
  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {
      let object = this.gameObjects[key];
      object.id = key;

      // TODO: determine if this object should actually mount
      object.mount(this);
    });
  }

  // puts the game into "cutscene mode"
  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      });
      const result = await eventHandler.init();
      if (result === "LOST_BATTLE") {
        break;
      }
    }

    console.log("Cutscene finished! Enabling movement.");
    this.isCutscenePlaying = false;

    // reset NPCS to do their idle behavior
    Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this));
  }

  // checks for objects that can trigger a cutscene
  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
    });

    if (!this.isCutscenePlaying && match && match.talking.length) {

      const relevantScenario = match.talking.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })

      relevantScenario && this.startCutscene(relevantScenario.events);
    }
  }

  // checks for player's position to trigger a cutscene
  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene(match[0].events);
    }
  }

  // adds a wall to the map
  addWall(x, y) {
    this.walls[`${x},${y}`] = true;
  }

  // removes a wall from the map
  removeWall(x, y) {
    delete this.walls[`${x},${y}`];
  }

  // moves a wall from one position to another
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const { x, y } = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x, y);
  }
}

// collection of overworld maps
window.OverworldMaps = {
  DemoRoom: {
    id: "DemoRoom",
    lowerSrc: "./images/maps/DemoLower.png",
    upperSrc: "./images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      npcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: "./images/characters/people/Squelchy_NPC.png",
        behaviorLoop: [
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "up", time: 800 },
          { type: "stand", direction: "right", time: 1200 },
          { type: "stand", direction: "up", time: 300 },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Hello!", faceHero: "npcA" },
              { type: "textMessage", text: "Hello again!" },
              { who: "hero", type: "walk", direction: "up" },
            ]
          }
        ]
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "./images/characters/people/Froggert_Enemy.png",
        /* behaviorLoop: [
          { type: "walk", direction: "left" },
          { type: "stand", direction: "up", time: 800 },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "down" },
        ] */
      }),
    },
    walls: {
      [utils.asGridCoord(7, 6)]: true,
      [utils.asGridCoord(8, 6)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(8, 7)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 4)]: [
        {
          events: [
            { who: "npcB", type: "walk", direction: "left" },
            { who: "npcB", type: "stand", direction: "up", time: 500 },
            { type: "textMessage", text: "You can't be in there!" },
            { who: "npcB", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "left" },
          ]
        }
      ],
      [utils.asGridCoord(5, 10)]: [
        {
          events: [
            { type: "changeMap", 
              map: "AlchemyRoom",
              x: utils.withGrid(2),
              y: utils.withGrid(2), 
              direction: "down" }
          ]
        }
      ]
    }
  },
  AlchemyRoom: {
    id: "AlchemyRoom",
    lowerSrc: "./images/maps/AlchemyLower.png",
    upperSrc: "./images/maps/AlchemyUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      npcA: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "./images/characters/people/npc1.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Hi!", faceHero: "npcA" },
              { type: "addStoryFlag", flag: "TALKED_TO_NPC1"}
            ]
          }
        ]
      }),
      npcB: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "./images/characters/people/Froggert_Enemy.png",
        talking: [
          {
            required: ["TALKED_TO_NPC1"],
            events: [
              { type: "textMessage", text: "Isn't she the coolest?", faceHero: "npcB" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "Go talk to that girl over there!", faceHero: "npcB" },
              { type: "battle", enemyId: "Froggert"},
              { type: "addStoryFlag", flag: "DEFEATED_FROGGERT"},
              { type: "textMessage", text: "You defeated me!", faceHero: "npcB" },
            ]
          }
        ]
      }),
      pizzaStone: new PizzaStone({
        x: utils.withGrid(4),
        y: utils.withGrid(8),
        storyFlag: "USED_PIZZA_STONE",
        pizzas: ["ep001", "ep002"]
      })
    },

    walls: {
      

    },

    cutsceneSpaces: {
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Street",
              x: utils.withGrid(29),
              y: utils.withGrid(9),
              direction: "down"
            }
          ]
        }
      ]
    }
  },

  Street: {
    id: "Street",
    lowerSrc: "./images/maps/StreetLower.png",
    upperSrc: "./images/maps/StreetUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(30),
        y: utils.withGrid(10),

      })
    },
    cutsceneSpaces: {
      [utils.asGridCoord(29,9)]: [
        {
          events: [
            {
            type: "changeMap",
            map: "AlchemyRoom",
            x: utils.withGrid(5),
            y: utils.withGrid(10),
            direction: "up",
            }
          ]
        }
      ]

    }

  }
};