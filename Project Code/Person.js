/*
  This file contains the Person class, which is used to create characters in the game.
*/

class Person extends GameObject {
  constructor(config) {
    super(config);
    this.movingProgressRemaining = 0;
    this.isStanding = false;
    this.intentPosition = null; // [x,y]

    this.isPlayerControlled = config.isPlayerControlled || false;

    this.isPerson = true;

    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };
  }

  mount(map) {
    this.map = map;
    super.mount(map); // <--- call the parent GameObject's mount function too
    console.log("mounting!");
  }

  // Updates the character's state
  update(state) {
    if (this.movingProgressRemaining > 0) {
      this.updatePosition();
    } else {
      // More cases for starting to walk will come here

      // Case: we're keyboard ready and have an arrow pressed
      if (
        !state.map.isCutscenePlaying &&
        this.isPlayerControlled &&
        state.arrow
      ) {
        this.startBehavior(state, {
          type: "walk",
          direction: state.arrow,
        });
      }
      this.updateSprite(state);
    }
  }

  // Starts the character's behavior
  startBehavior(state, behavior) {
    if (!this.isMounted) {
      return;
    }

    // Set character direction to whatever behavior has
    this.direction = behavior.direction;

    if (behavior.type === "walk") {
      // Stop here if space is not free
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
        behavior.retry &&
          setTimeout(() => {
            this.startBehavior(state, behavior);
          }, 10);

        return;
      }

      // Ready to walk!
      this.movingProgressRemaining = 16;

      // Add next position intent
      const intentPosition = utils.nextPosition(this.x, this.y, this.direction);

      this.intentPosition = [intentPosition.x, intentPosition.y];

      this.updateSprite(state);
    }

    if (behavior.type === "stand") {
      this.isStanding = true;
      setTimeout(() => {
        utils.emitEvent("PersonStandComplete", {
          whoId: this.id,
        });
        this.isStanding = false;
      }, behavior.time);
    }
  }

  // Updates the character's position
  updatePosition() {
    const [property, change] = this.directionUpdate[this.direction];
    this[property] += change;
    this.movingProgressRemaining -= 1;

    if (this.movingProgressRemaining === 0) {
      // We finished the walk!
      this.intentPosition = null;
      utils.emitEvent("PersonWalkingComplete", {
        whoId: this.id,
      });

      if (this.isPlayerControlled) {
        const heroTileX = Math.floor(this.x / 16);
        const heroTileY = Math.floor(this.y / 16);
        console.log(`📍 Hero is at tile (${heroTileX}, ${heroTileY})`);

        this.checkForWildEncounter();
      }
      
    }
  }

  // Updates the character's sprite
  updateSprite() {
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-" + this.direction);
      return;
    }
    this.sprite.setAnimation("idle-" + this.direction);
  }

  

  checkForWildEncounter() {
    const hero = this.map.gameObjects["hero"];
    const heroTileX = Math.floor(hero.x / 16);
    const heroTileY = Math.floor(hero.y / 16);
  
    if (!this.map.wildEncounterAreas) {
      return;
    }
  
    // Check if player is in any encounter area, excluding the forbidden zone
    const isInWildEncounterArea = this.map.wildEncounterAreas.some(area => {
      // Skip encounter if inside the exclusion area (11,1) to (24,13)
      if (heroTileX >= 11 && heroTileX <= 24 && heroTileY >= 1 && heroTileY <= 13) {
        return false; // Exclude this area from encounters
      }
      
      // Proceed with the normal encounter check
      return heroTileX >= area.xMin && heroTileX <= area.xMax &&
             heroTileY >= area.yMin && heroTileY <= area.yMax;
    });
  
    // If player is in a valid encounter area, trigger encounter
    if (isInWildEncounterArea) {
      console.log(`Player is inside an encounter zone!`);
  
      // If the player is in a valid zone, and the roll is under the 15% chance
      if (Math.random() < 0.15) {
        console.log("Wild Encounter triggered!");
        utils.emitEvent("WildEncounter");
      }
    } else {
      console.log("Player is not inside any encounter zone.");
    }
  }
  
  
  
  
  
  


  
}


