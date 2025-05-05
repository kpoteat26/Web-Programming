/*
  This file contains the Overworld class, which is used to manage the overworld map.
*/

class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;
  }

  gameLoopStepWork(delta) {
    // Clear off the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Establish the camera person
    const cameraPerson = this.map.gameObjects.hero;

    // Update all objects
    Object.values(this.map.gameObjects).forEach((object) => {
      object.update({
        delta,
        arrow: this.directionInput.direction,
        map: this.map,
      });
    });

    // Draw lower layer
    this.map.drawLowerImage(this.ctx, cameraPerson);

    // Draw game objects
    Object.values(this.map.gameObjects)
      .sort((a, b) => {
        return a.y - b.y;
      })
      .forEach((object) => {
        object.sprite.draw(this.ctx, cameraPerson);
      });

    // Draw upper layer
    this.map.drawUpperImage(this.ctx, cameraPerson);
  }

  // Starts the main game loop
  startGameLoop() {
    let previousMs;
    const step = 1 / 60;

    const stepFn = (timestampMs) => {
      if (this.map.isPaused) {
        return;
      }
      if (previousMs === undefined) {
        previousMs = timestampMs;
      }

      let delta = (timestampMs - previousMs) / 1000;
      while (delta >= step) {
        this.gameLoopStepWork(delta);
        delta -= step;
      }
      previousMs = timestampMs - delta * 1000;

      // Business as usual tick
      requestAnimationFrame(stepFn);
    };
    // First kickoff tick
    requestAnimationFrame(stepFn);
  }

  // Binds the action input
  bindActionInput() {
    new KeyPressListener("Enter", () => {
      this.map.checkForActionCutscene();
    });
    new KeyPressListener("Escape", () => {
      if (!this.map.isCutscenePlaying) {
        this.map.startCutscene([{ type: "pause" }]);
      }
    });
  }

  // Binds the hero position check
  bindHeroPositionCheck() {
    document.addEventListener("PersonWalkingComplete", (e) => {
      if (e.detail.whoId === "hero") {
        // hero's position has changed
        this.map.checkForFootstepCutscene();
      }
    });
  }

  // Binds the wild encounter check
  bindWildEncounterCheck() {
    document.addEventListener("WildEncounter", async () => {
      if (!this.map.isCutscenePlaying) {
        this.map.startCutscene([{ type: "wildBattle" }]);
      }
    });
  }

  // Starts the map
  startMap(mapConfig, heroInitialState = null) {
    this.map = new OverworldMap(mapConfig);
    this.map.overworld = this;
    this.map.mountObjects();

    if (heroInitialState) {
      const { hero } = this.map.gameObjects;
      hero.x = heroInitialState.x;
      hero.y = heroInitialState.y;
      hero.direction = heroInitialState.direction;
    }

    this.progress.mapId = mapConfig.id;
    this.progress.startingHeroX = this.map.gameObjects.hero.x;
    this.progress.startingHeroY = this.map.gameObjects.hero.y;
    this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
  }

  // Initializes the overworld
  async init() {
    const container = document.querySelector(".game-container");

    // Create a new Progress tracker
    this.progress = new Progress();

    // Show the Title Screen
    this.titleScreen = new TitleScreen({
      progress: this.progress,
    });
    const useSaveFile = await this.titleScreen.init(container);

    // Potentially Load Saved Data
    let initialHeroState = null;
    if (useSaveFile) {
      this.progress.load();
      initialHeroState = {
        x: this.progress.startingHeroX,
        y: this.progress.startingHeroY,
        direction: this.progress.startingHeroDirection,
      };
    }
    else {
      window.playerState.isNewGame = true;
    }

    // Load the HUD
    this.hud = new Hud();
    this.hud.init(container);

    // Start the First Map
    this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);

    // Create Controls
    this.bindActionInput();
    this.bindHeroPositionCheck();
    this.bindWildEncounterCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    // Start The Game!!
    this.startGameLoop();

    // cutscenes to play immediately
    if(window.playerState.isNewGame) {
    this.map.startCutscene([
      {
        type: "textMessage",
        text: "Welcome to the wonderful world of Evoltama!",
      },
      {
        type: "textMessage",
        text: "Start by using the arrow keys to explore the forest.",
      },
      {
        type: "textMessage",
        text: "I think Elder Beetle is looking for you! He should be in the main village, to the right and up!",
      },
      {
        type: "textMessage",
        text: "You can speak to Elder Beetle by pressing Enter when you face him.",
      },
      {
        type: "textMessage",
        text: "If you ever need to take a break, just hit Escape and save your progress in the Pause Menu!",
      },
      {
        type: "textMessage",
        text: "Additionally, you can move your Evolisk party around in the future through the Pause Menu!",
      },
    ])
  };

    if(!window.playerState.isNewGame) {
      this.map.startCutscene([
        {
          type: "textMessage",
          text: "Welcome Back! Good luck out there!",
        },
      ])
    };
  }
}
