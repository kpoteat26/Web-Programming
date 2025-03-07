/*
  This file contains the Person class, which is used to create characters in the game.
*/
class Person extends GameObject {
  constructor(config) {
    super(config);
    this.movingProgressRemaining = 0;
    this.isStanding = false;
    this.isPlayerControlled = config.isPlayerControlled || false;

    this.directionUpdate = {
      "up": ["y", -1],
      "down": ["y", 1],
      "left": ["x", -1],
      "right": ["x", 1],
    };
  }

  // updates the character's state
  update(state) {
    if (this.movingProgressRemaining > 0) {
      this.updatePosition();
    } else {

      // more cases for starting to walk will come here

      // case: we're keyboard ready and have an arrow pressed
      if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
        this.startBehavior(state, {
          type: "walk",
          direction: state.arrow
        });
      }
      this.updateSprite(state);
    }
  }

  // starts the character's behavior
  startBehavior(state, behavior) {
    // set character direction to whatever behavior has
    this.direction = behavior.direction;

    if (behavior.type === "walk") {
      // stop here if space is not free
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {

        behavior.retry && setTimeout(() => {
          this.startBehavior(state, behavior);
        }, 10);

        return;
      }

      // ready to walk!
      state.map.moveWall(this.x, this.y, this.direction);
      this.movingProgressRemaining = 16;
      this.updateSprite(state);
    }

    if (behavior.type === "stand") {
      this.isStanding = true;
      setTimeout(() => {
        utils.emitEvent("PersonStandComplete", {
          whoId: this.id
        });
        this.isStanding = false;
      }, behavior.time);
    }
  }

  // updates the character's position
  updatePosition() {
    const [property, change] = this.directionUpdate[this.direction];
    this[property] += change;
    this.movingProgressRemaining -= 1;

    if (this.movingProgressRemaining === 0) {
      // we finished the walk!
      utils.emitEvent("PersonWalkingComplete", {
        whoId: this.id
      });
    }
  }

  // updates the character's sprite
  updateSprite() {
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-" + this.direction);
      return;
    }
    this.sprite.setAnimation("idle-" + this.direction);
  }
}