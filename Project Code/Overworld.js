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

  // starts the main game loop
  startGameLoop() {
    const step = () => {
      // clear off the canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // establish the camera person
      const cameraPerson = this.map.gameObjects.hero;

      // update all objects
      Object.values(this.map.gameObjects).forEach(object => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        });
      });

      // draw lower layer
      this.map.drawLowerImage(this.ctx, cameraPerson);

      // draw game objects
      Object.values(this.map.gameObjects).sort((a, b) => {
        return a.y - b.y;
      }).forEach(object => {
        object.sprite.draw(this.ctx, cameraPerson);
      });

      // draw upper layer
      this.map.drawUpperImage(this.ctx, cameraPerson);

      requestAnimationFrame(() => {
        step();
      });
    };
    step();
  }

  // binds the action input
  bindActionInput() {
    new KeyPressListener("Enter", () => {
      this.map.checkForActionCutscene();
    });
  }

  // binds the hero position check
  bindHeroPositionCheck() {
    document.addEventListener("PersonWalkingComplete", e => {
      if (e.detail.whoId === "hero") {
        // hero's position has changed
        this.map.checkForFootstepCutscene();
      }
    });
  }

  // starts the map
  startMap(mapConfig) {
    this.map = new OverworldMap(mapConfig);
    this.map.overworld = this;
    this.map.mountObjects();
  }

  // initializes the overworld
  init() {
    this.startMap(window.OverworldMaps.AlchemyRoom);

    this.bindActionInput();
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    this.startGameLoop();

    // // cutscenes to play immediately
    // this.map.startCutscene([
    //   { type: "battle", enemyId: "beth" },
    //   // { type: "changeMap", map: "DemoRoom" },
    //   // { type: "textMessage", text: "This is my very first message!" },
    // ]);
  }
}