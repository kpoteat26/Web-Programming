/*
  This file contains the OverworldMap class, which is used to manage the overworld map in the game.
*/
class OverworldMap {
  constructor(config) {
    // set up the map and objects
    this.overworld = null;
    this.gameObjects = {}; // Live Objects are in here
    this.configObjects = config.configObjects; //Configuration content

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
    if (this.walls[`${x},${y}`]) {
      return true;
    }

    //Check for Game Objects at this Position
    return Object.values(this.gameObjects).find(obj => {
      if (obj.x === x && obj.y === y) {
        return true;
      }
        if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[0] === y) {
          return true;
        }
      return false;
    })
  
  }

  mountObjects() {
    Object.keys(this.configObjects).forEach(key => {
      let object = this.configObjects[key];
      object.id = key;

      let instance;
      if (object.type === "Person") {
        instance = new Person(object);
      }

      if (object.type === "PizzaStone") {
        instance = new PizzaStone(object);
      }

      this.gameObjects[key] = instance;
      this.gameObjects[key].id = key;
      instance.mount(this);
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


}

// collection of overworld maps
window.OverworldMaps = {
  DemoRoom: {
    id: "DemoRoom",
    lowerSrc: "./images/maps/DemoLower.png",
    upperSrc: "./images/maps/DemoUpper.png",
    gameObjects: {},
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      },
      npcA: {
        type: "Person",
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
      },
      npcB: {
        type: "Person",
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
      },
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
    gameObjects: {},
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      },
      npcA: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "./images/characters/people/Squelchy_NPC.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "You should touch that weird stone over there!", faceHero: "npcA" },
              { type: "addStoryFlag", flag: "TALKED_TO_NPC1"}
            ]
          }
        ]
      },
      npcB:{
        type: "Person",
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "./images/characters/people/Froggert_Enemy.png",
        talking: [
          {
            required: ["TALKED_TO_NPC1"],
            events: [
              { type: "textMessage", text: "Squelchy looks kinda funny...", faceHero: "npcB" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "I'm bored, battle me!", faceHero: "npcB" },
              { type: "battle", enemyId: "Froggert"},
              { type: "addStoryFlag", flag: "DEFEATED_FROGGERT"},
              { type: "textMessage", text: "You defeated me!", faceHero: "npcB" },
            ]
          }
        ]
      },
      pizzaStone: {
        type: "PizzaStone",
        x: utils.withGrid(4),
        y: utils.withGrid(8),
        storyFlag: "USED_PIZZA_STONE",
        pizzas: ["ep002", "ep003"]
      }
    },

    walls: {

      //Objects
      //Tables
      [utils.asGridCoord(2,4)]: true,
      [utils.asGridCoord(3,4)]: true,

      [utils.asGridCoord(6,4)]: true,
      [utils.asGridCoord(7,4)]: true,

      [utils.asGridCoord(10,4)]: true,
      [utils.asGridCoord(11,4)]: true,

      //Counter
      [utils.asGridCoord(1,5)]: true,
      [utils.asGridCoord(1,6)]: true,
      [utils.asGridCoord(1,7)]: true,

      [utils.asGridCoord(6,7)]: true,
      [utils.asGridCoord(7,7)]: true,

      [utils.asGridCoord(9,7)]: true,
      [utils.asGridCoord(10,7)]: true,

      [utils.asGridCoord(9,9)]: true,
      [utils.asGridCoord(10,9)]: true,

      //Crates
      [utils.asGridCoord(1,9)]: true,
      [utils.asGridCoord(2,9)]: true,


      //Walls
      //Upper Wall
      [utils.asGridCoord(1,3)]: true,
      [utils.asGridCoord(2,3)]: true,
      [utils.asGridCoord(3,3)]: true,
      [utils.asGridCoord(4,3)]: true,
      [utils.asGridCoord(5,3)]: true,
      [utils.asGridCoord(6,3)]: true,
      [utils.asGridCoord(7,3)]: true,
      [utils.asGridCoord(8,3)]: true,
      [utils.asGridCoord(9,3)]: true,
      [utils.asGridCoord(10,3)]: true,
      [utils.asGridCoord(11,3)]: true,
      [utils.asGridCoord(12,3)]: true,

      //Left Wall
      [utils.asGridCoord(0,0)]: true,
      [utils.asGridCoord(0,1)]: true,
      [utils.asGridCoord(0,2)]: true,
      [utils.asGridCoord(0,3)]: true,
      [utils.asGridCoord(0,4)]: true,
      [utils.asGridCoord(0,5)]: true,
      [utils.asGridCoord(0,6)]: true,
      [utils.asGridCoord(0,7)]: true,
      [utils.asGridCoord(0,8)]: true,
      [utils.asGridCoord(0,9)]: true,

      //Right Wall
      [utils.asGridCoord(13,0)]: true,
      [utils.asGridCoord(13,1)]: true,
      [utils.asGridCoord(13,2)]: true,
      [utils.asGridCoord(13,3)]: true,
      [utils.asGridCoord(13,4)]: true,
      [utils.asGridCoord(13,5)]: true,
      [utils.asGridCoord(13,6)]: true,
      [utils.asGridCoord(13,7)]: true,
      [utils.asGridCoord(13,8)]: true,
      [utils.asGridCoord(13,9)]: true,

      //Bottom
      [utils.asGridCoord(1,10)]: true,
      [utils.asGridCoord(2,10)]: true,
      [utils.asGridCoord(3,10)]: true,
      [utils.asGridCoord(4,10)]: true,
      [utils.asGridCoord(5,11)]: true,
      [utils.asGridCoord(6,10)]: true,
      [utils.asGridCoord(7,10)]: true,
      [utils.asGridCoord(8,10)]: true,
      [utils.asGridCoord(9,10)]: true,
      [utils.asGridCoord(10,10)]: true,
      [utils.asGridCoord(11,10)]: true,
      [utils.asGridCoord(12,10)]: true,

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
    gameObjects: {},
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(30),
        y: utils.withGrid(10),

      }
    },

    walls: function() {
      let walls = {};
      ["4,9", "5,8", "6,9", "7,9", "8,9", "9,9", "10,9", "11,9", "12,9", "13,8", "14,8", "15,7",
        "16,7", "17,7", "18,7", "19,7", "20,7", "21,7", "22,7", "23,7", "24,7", "24,6", "24,5", "26,5", "26,6", "26,7", "27,7", "28,8", "28,9", "29,8", "30,9", "31,9", "32,9", "33,9",
        "16,9", "17,9", "25,9", "26,9", "16,10", "17,10", "25,10", "26,10", "16,11", "17,11", "25,11", "26,11",
        "18,11","19,11",
        "4,14", "5,14", "6,14", "7,14", "8,14", "9,14", "10,14", "11,14", "12,14", "13,14", "14,14", "15,14", "16,14", "17,14", "18,14", "19,14", "20,14", "21,14", "22,14", "23,14",
        "24,14", "25,14", "26,14", "27,14", "28,14", "29,14", "30,14", "31,14", "32,14", "33,14",
        "3,10", "3,11", "3,12", "3,13", "34,10", "34,11", "34,12", "34,13",
          "29,8","25,4",
      ].forEach(coord => {
        let [x,y] = coord.split(",");
        walls[utils.asGridCoord(x,y)] = true;
      })
      return walls;
    }(),
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