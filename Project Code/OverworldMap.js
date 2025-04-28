/*
  This file contains the OverworldMap class, which is used to manage the overworld map in the game.
*/

class OverworldMap {
  constructor(config) {
    // Set up the map and objects
    this.overworld = null;
    this.gameObjects = {}; // Live Objects are in here
    this.configObjects = config.configObjects; //Configuration content
    this.wildEncounterAreas = config.wildEncounterAreas || []; //Encounter Tiles
    this.healingSpot = config.healingSpot


    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};
    

    // Load the images
    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;
    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;
    this.battleBackgroundSrc = config.battleBackgroundSrc;

    // Determine if a cutscene is playing
    this.isCutscenePlaying = false;
    this.isPaused = false;
  }

  // Draw the lower half of the map
  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  // Draw the upper half of the map
  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  // Collision detection
  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);
    if (this.walls[`${x},${y}`]) {
      return true;
    }

    // Check for Game Objects at this Position
    return Object.values(this.gameObjects).find((obj) => {
      if (obj.x === x && obj.y === y) {
        return true;
      }
      if (
        obj.intentPosition &&
        obj.intentPosition[0] === x &&
        obj.intentPosition[0] === y
      ) {
        return true;
      }
      return false;
    });
  }

  mountObjects() {
    Object.keys(this.configObjects).forEach((key) => {
      let object = this.configObjects[key];
      object.id = key;

      let instance;
      if (object.type === "Person") {
        instance = new Person(object);
      }

      if (object.type === "EvoliskStone") {
        instance = new EvoliskStone(object);
      }

      this.gameObjects[key] = instance;
      this.gameObjects[key].id = key;
      instance.mount(this);
    });
  }

  // Puts the game into "cutscene mode"
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

    // Reset NPCS to do their idle behavior
    Object.values(this.gameObjects).forEach((object) =>
      object.doBehaviorEvent(this)
    );
  }

  // Checks for objects that can trigger a cutscene
  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find((object) => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
    });

    if (!this.isCutscenePlaying && match && match.talking.length) {
      const relevantScenario = match.talking.find((scenario) => {
        return (scenario.required || []).every((sf) => {
          return playerState.storyFlags[sf];
        });
      });

      relevantScenario && this.startCutscene(relevantScenario.events);
    }
  }

  // Checks for player's position to trigger a cutscene
  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene(match[0].events);
    }
  }

  teleportToHealingArea() {
    const healingSpot = this.healingSpot || {
      x: 5,
      y: 5,
      message: "You feel mysteriously refreshed.",
      heal: "full"
    };
  
    if (!this.gameObjects["hero"]) {
      console.error("Hero object not found!");
      return;
    }
  
    this.gameObjects["hero"].x = healingSpot.x * 16;
    this.gameObjects["hero"].y = healingSpot.y * 16;
  
    const healingMessage = new TextMessage({
      text: healingSpot.message,
      onComplete: () => {
        this.healPlayerEvolisks(healingSpot.heal);
      },
    });
  
    healingMessage.init(document.querySelector(".game-container"));
  }
  
  

  healPlayerEvolisks(healType) {
    const playerState = window.playerState;
  
    if (healType === "full") {
      Object.values(playerState.evolisks).forEach(evolisk => {
        evolisk.hp = evolisk.maxHp;
      });
      console.log(" All Evolisks healed to full HP!");
    }
    else if (healType === "partial") {
      Object.values(playerState.evolisks).forEach(evolisk => {
        evolisk.hp = Math.floor(evolisk.maxHp / 2);
      });
      console.log(" All Evolisks healed to 50% HP!");
    }
  }

}

// Collection of overworld maps
window.OverworldMaps = {
  
  ForestVillage: {
    id: "ForestVillage",
    lowerSrc: "./images/maps/ForestLower.png",
    upperSrc: "./images/maps/ForestUpper.png",
    gameObjects: {},
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(23),
        y: utils.withGrid(30),
      },
    },
  },


  MushroomWild: {
    id: "MushroomWild",
    lowerSrc: "./images/maps/MushroomLower.png",
    upperSrc: "./images/maps/MushroomUpper.png",
    battleBackgroundSrc: "./images/maps/MushroomBattleMap.png",
    gameObjects: {},

    //Configure Objects in Map
    configObjects: {

      //Create Hero & NPCs
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(18),
        y: utils.withGrid(1),
      },
      npcA: {
        type:"Person",
        x: utils.withGrid(12),
        y: utils.withGrid(11),
        src: "./images/characters/people/Squelchy_NPC.png",
        talking: [
          {
            events: [
              {type: "textMessage", text: "Hello!", faceHero: "npcA"},
            ]
          }
        ]
      },      
    },
    //Create Walls
    walls: {

      //Mushrooms
      [utils.asGridCoord(16, 1)]: true,

      [utils.asGridCoord(20, 2)]: true,

      [utils.asGridCoord(13, 2)]: true,

      [utils.asGridCoord(11, 3)]: true,
      [utils.asGridCoord(12, 3)]: true,
      [utils.asGridCoord(13, 3)]: true,
      [utils.asGridCoord(11, 4)]: true,
      [utils.asGridCoord(12, 4)]: true,

      [utils.asGridCoord(21, 3)]: true,
      [utils.asGridCoord(22, 3)]: true,
      [utils.asGridCoord(23, 3)]: true,
      [utils.asGridCoord(22, 4)]: true,
      [utils.asGridCoord(23, 4)]: true,

      [utils.asGridCoord(23, 7)]: true,

      [utils.asGridCoord(6, 8)]: true,

      [utils.asGridCoord(8, 13)]: true,

      [utils.asGridCoord(10, 15)]: true,

      [utils.asGridCoord(18, 15)]: true,

      [utils.asGridCoord(23, 16)]: true,

      [utils.asGridCoord(19, 8)]: true,

      [utils.asGridCoord(16, 9)]: true,
      [utils.asGridCoord(17, 9)]: true,
      [utils.asGridCoord(18, 9)]: true,
      [utils.asGridCoord(16, 10)]: true,
      [utils.asGridCoord(17, 10)]: true,

      [utils.asGridCoord(19, 11)]: true,
      [utils.asGridCoord(20, 11)]: true,
      [utils.asGridCoord(21, 11)]: true,
      [utils.asGridCoord(20, 12)]: true,

      [utils.asGridCoord(3, 13)]: true,
      [utils.asGridCoord(4, 13)]: true,
      [utils.asGridCoord(5, 13)]: true,
      [utils.asGridCoord(4, 14)]: true,
      [utils.asGridCoord(5, 14)]: true,

      [utils.asGridCoord(13, 18)]: true,
      [utils.asGridCoord(14, 18)]: true,
      [utils.asGridCoord(15, 18)]: true,
      [utils.asGridCoord(13, 19)]: true,
      [utils.asGridCoord(14, 19)]: true,

      [utils.asGridCoord(5, 18)]: true,
      [utils.asGridCoord(6, 18)]: true,
      [utils.asGridCoord(5, 19)]: true,
      [utils.asGridCoord(6, 19)]: true,

      [utils.asGridCoord(22, 19)]: true,
      [utils.asGridCoord(23, 19)]: true,
      [utils.asGridCoord(22, 20)]: true,
      [utils.asGridCoord(23, 20)]: true,


      //Rocks
      [utils.asGridCoord(3, 4)]: true,
      [utils.asGridCoord(3, 4)]: true,
      [utils.asGridCoord(4, 3)]: true,
      [utils.asGridCoord(4, 4)]: true,
      [utils.asGridCoord(11, 6)]: true,
      [utils.asGridCoord(12, 6)]: true,
      [utils.asGridCoord(19, 17)]: true,
      [utils.asGridCoord(19, 18)]: true,
      [utils.asGridCoord(20, 17)]: true,
      [utils.asGridCoord(20, 18)]: true,


      //Left Wall
      [utils.asGridCoord(0, 0)]: true,
      [utils.asGridCoord(0, 1)]: true,
      [utils.asGridCoord(0, 2)]: true,
      [utils.asGridCoord(0, 3)]: true,
      [utils.asGridCoord(0, 4)]: true,
      [utils.asGridCoord(0, 5)]: true,
      [utils.asGridCoord(0, 6)]: true,
      [utils.asGridCoord(0, 7)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 9)]: true,
      [utils.asGridCoord(0, 10)]: true,
      [utils.asGridCoord(0, 11)]: true,
      [utils.asGridCoord(0, 12)]: true,
      [utils.asGridCoord(0, 13)]: true,
      [utils.asGridCoord(0, 14)]: true,
      [utils.asGridCoord(0, 15)]: true,
      [utils.asGridCoord(0, 16)]: true,
      [utils.asGridCoord(0, 17)]: true,
      [utils.asGridCoord(0, 18)]: true,
      [utils.asGridCoord(0, 19)]: true,
      [utils.asGridCoord(0, 20)]: true,
      [utils.asGridCoord(0, 21)]: true,
      [utils.asGridCoord(0, 22)]: true,
      [utils.asGridCoord(0, 23)]: true,
      [utils.asGridCoord(0, 24)]: true,

      //Top Wall
      [utils.asGridCoord(1, 0)]: true,
      [utils.asGridCoord(2, 0)]: true,
      [utils.asGridCoord(3, 0)]: true,
      [utils.asGridCoord(4, 0)]: true,
      [utils.asGridCoord(5, 0)]: true,
      [utils.asGridCoord(6, 0)]: true,
      [utils.asGridCoord(7, 0)]: true,
      [utils.asGridCoord(8, 0)]: true,
      [utils.asGridCoord(9, 0)]: true,
      [utils.asGridCoord(10, 0)]: true,
      [utils.asGridCoord(11, 0)]: true,
      [utils.asGridCoord(12, 0)]: true,
      [utils.asGridCoord(13, 0)]: true,
      [utils.asGridCoord(14, 0)]: true,
      [utils.asGridCoord(15, 0)]: true,
      [utils.asGridCoord(16, 0)]: true,
      [utils.asGridCoord(17, 0)]: true,
      [utils.asGridCoord(18, 0)]: true,
      [utils.asGridCoord(19, 0)]: true,
      [utils.asGridCoord(20, 0)]: true,
      [utils.asGridCoord(21, 0)]: true,
      [utils.asGridCoord(22, 0)]: true,
      [utils.asGridCoord(23, 0)]: true,
      [utils.asGridCoord(24, 0)]: true,
      [utils.asGridCoord(25, 0)]: true,

      //Bottom Wall
      [utils.asGridCoord(0, 23)]: true,
      [utils.asGridCoord(1, 23)]: true,
      [utils.asGridCoord(2, 23)]: true,
      [utils.asGridCoord(3, 23)]: true,
      [utils.asGridCoord(4, 23)]: true,
      [utils.asGridCoord(5, 23)]: true,
      [utils.asGridCoord(6, 23)]: true,
      [utils.asGridCoord(7, 23)]: true,
      [utils.asGridCoord(8, 23)]: true,
      [utils.asGridCoord(9, 23)]: true,
      [utils.asGridCoord(10, 23)]: true,
      [utils.asGridCoord(11, 23)]: true,
      [utils.asGridCoord(12, 23)]: true,
      [utils.asGridCoord(13, 23)]: true,
      [utils.asGridCoord(14, 23)]: true,
      [utils.asGridCoord(15, 23)]: true,
      [utils.asGridCoord(16, 23)]: true,
      [utils.asGridCoord(17, 23)]: true,
      [utils.asGridCoord(18, 23)]: true,
      [utils.asGridCoord(19, 23)]: true,
      [utils.asGridCoord(20, 23)]: true,
      [utils.asGridCoord(21, 23)]: true,
      [utils.asGridCoord(22, 23)]: true,
      [utils.asGridCoord(23, 23)]: true,
      [utils.asGridCoord(24, 23)]: true,
      [utils.asGridCoord(25, 23)]: true,
      [utils.asGridCoord(26, 23)]: true,
   

      //Right Wall
      [utils.asGridCoord(25, 0)]: true,
      [utils.asGridCoord(25, 1)]: true,
      [utils.asGridCoord(25, 2)]: true,
      [utils.asGridCoord(25, 3)]: true,
      [utils.asGridCoord(25, 4)]: true,
      [utils.asGridCoord(25, 5)]: true,
      [utils.asGridCoord(25, 6)]: true,
      [utils.asGridCoord(25, 7)]: true,
      [utils.asGridCoord(25, 8)]: true,
      [utils.asGridCoord(25, 9)]: true,
      [utils.asGridCoord(25, 10)]: true,
      [utils.asGridCoord(25, 11)]: true,
      [utils.asGridCoord(25, 12)]: true,
      [utils.asGridCoord(25, 13)]: true,
      [utils.asGridCoord(25, 14)]: true,
      [utils.asGridCoord(25, 15)]: true,
      [utils.asGridCoord(25, 16)]: true,
      [utils.asGridCoord(25, 17)]: true,
      [utils.asGridCoord(25, 18)]: true,
      [utils.asGridCoord(25, 19)]: true,
      [utils.asGridCoord(25, 20)]: true,
      [utils.asGridCoord(25, 21)]: true,
      [utils.asGridCoord(25, 22)]: true,
      [utils.asGridCoord(25, 23)]: true,
      [utils.asGridCoord(25, 24)]: true,
    
  
  
    },
    cutsceneSpaces: {

      [utils.asGridCoord(18, 1)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "ForestVillage",
              x: utils.withGrid(53),
              y: utils.withGrid(59),
              direction: "up",
            },
          ],
        },
      ],

    },

    wildEncounterAreas: [
      // Full encounter area from (1,1) to (24,22)
      { xMin: 1, xMax: 24, yMin: 1, yMax: 22 },
      
      // Excluded area from (11,1) to (24,13)
      // This won't be a valid encounter area
      { xMin: 11, xMax: 24, yMin: 1, yMax: 13, exclude: true },
    ],

    healingSpot: {
      x: 23,  // Healing area X-coordinate
      y: 11,  // Healing area Y-coordinate
      message: "You've been teleported to a healing area in the Mushroom Wild!",
      heal: "partial",  // Healing type ("full" or "partial")
    },

  },

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
            ],
          },
        ],
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
          ],
        },
      ],
      [utils.asGridCoord(5, 10)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "AlchemyRoom",
              x: utils.withGrid(2),
              y: utils.withGrid(2),
              direction: "down",
            },
          ],
        },
      ],
    },

    wildEncounterAreas: [
      {
        xMin: utils.withGrid(0),
        xMax: utils.withGrid(10),
        yMin: utils.withGrid(0),
        yMax: utils.withGrid(10),
      },
    ],

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
              {
                type: "textMessage",
                text: "You should touch that weird stone over there!",
                faceHero: "npcA",
              },
              { type: "addStoryFlag", flag: "TALKED_TO_NPC1" },
            ],
          },
        ],
      },
      npcB: {
        type: "Person",
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "./images/characters/people/Froggert_Enemy.png",
        talking: [
          {
            required: ["TALKED_TO_NPC1"],
            events: [
              {
                type: "textMessage",
                text: "Squelchy looks kinda funny...",
                faceHero: "npcB",
              },
            ],
          },
          {
            events: [
              {
                type: "textMessage",
                text: "I'm bored, battle me!",
                faceHero: "npcB",
              },
              { type: "battle", enemyId: "Froggert" },
              { type: "addStoryFlag", flag: "DEFEATED_FROGGERT" },
              {
                type: "textMessage",
                text: "You defeated me!",
                faceHero: "npcB",
              },
            ],
          },
        ],
      },
      evoliskStone: {
        type: "EvoliskStone",
        x: utils.withGrid(4),
        y: utils.withGrid(8),
        storyFlag: "USED_EVOLISK_STONE",
        evolisks: ["ep002", "ep003"],
      },
    },

    walls: {
      // Objects
      // Tables
      [utils.asGridCoord(2, 4)]: true,
      [utils.asGridCoord(3, 4)]: true,

      [utils.asGridCoord(6, 4)]: true,
      [utils.asGridCoord(7, 4)]: true,

      [utils.asGridCoord(10, 4)]: true,
      [utils.asGridCoord(11, 4)]: true,

      // Counter
      [utils.asGridCoord(1, 5)]: true,
      [utils.asGridCoord(1, 6)]: true,
      [utils.asGridCoord(1, 7)]: true,

      [utils.asGridCoord(6, 7)]: true,
      [utils.asGridCoord(7, 7)]: true,

      [utils.asGridCoord(9, 7)]: true,
      [utils.asGridCoord(10, 7)]: true,

      [utils.asGridCoord(9, 9)]: true,
      [utils.asGridCoord(10, 9)]: true,

      // Crates
      [utils.asGridCoord(1, 9)]: true,
      [utils.asGridCoord(2, 9)]: true,

      // Walls
      // Upper Wall
      [utils.asGridCoord(1, 3)]: true,
      [utils.asGridCoord(2, 3)]: true,
      [utils.asGridCoord(3, 3)]: true,
      [utils.asGridCoord(4, 3)]: true,
      [utils.asGridCoord(5, 3)]: true,
      [utils.asGridCoord(6, 3)]: true,
      [utils.asGridCoord(7, 3)]: true,
      [utils.asGridCoord(8, 3)]: true,
      [utils.asGridCoord(9, 3)]: true,
      [utils.asGridCoord(10, 3)]: true,
      [utils.asGridCoord(11, 3)]: true,
      [utils.asGridCoord(12, 3)]: true,

      // Left Wall
      [utils.asGridCoord(0, 0)]: true,
      [utils.asGridCoord(0, 1)]: true,
      [utils.asGridCoord(0, 2)]: true,
      [utils.asGridCoord(0, 3)]: true,
      [utils.asGridCoord(0, 4)]: true,
      [utils.asGridCoord(0, 5)]: true,
      [utils.asGridCoord(0, 6)]: true,
      [utils.asGridCoord(0, 7)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 9)]: true,

      // Right Wall
      [utils.asGridCoord(13, 0)]: true,
      [utils.asGridCoord(13, 1)]: true,
      [utils.asGridCoord(13, 2)]: true,
      [utils.asGridCoord(13, 3)]: true,
      [utils.asGridCoord(13, 4)]: true,
      [utils.asGridCoord(13, 5)]: true,
      [utils.asGridCoord(13, 6)]: true,
      [utils.asGridCoord(13, 7)]: true,
      [utils.asGridCoord(13, 8)]: true,
      [utils.asGridCoord(13, 9)]: true,

      // Bottom
      [utils.asGridCoord(1, 10)]: true,
      [utils.asGridCoord(2, 10)]: true,
      [utils.asGridCoord(3, 10)]: true,
      [utils.asGridCoord(4, 10)]: true,
      [utils.asGridCoord(5, 11)]: true,
      [utils.asGridCoord(6, 10)]: true,
      [utils.asGridCoord(7, 10)]: true,
      [utils.asGridCoord(8, 10)]: true,
      [utils.asGridCoord(9, 10)]: true,
      [utils.asGridCoord(10, 10)]: true,
      [utils.asGridCoord(11, 10)]: true,
      [utils.asGridCoord(12, 10)]: true,
    },


  },


};
