/*
  This file contains the GameObject class, which is used to create game objects in the game.
*/
class GameObject {
  constructor(config) {
    this.id = null;
    this.isMounted = false;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.direction = config.direction || "down";

    // sprite setup
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src || "./images/characters/people/Kairo_Hero.png",
    });

    this.behaviorLoop = config.behaviorLoop || [];
    this.behaviorLoopIndex = 0;

    this.talking = config.talking || [];
  }

  mount(map) {
    console.log("mounting!");
    this.isMounted = true;
    map.addWall(this.x, this.y);

    // if we have a behavior, kick off after a short delay
    setTimeout(() => {
      this.doBehaviorEvent(map);
    }, 10);
  }

  update() {
  }

  async doBehaviorEvent(map) {
    // don't do anything if there is a more important cutscene or i don't have config to do anything
    // anyway.
    if (map.isCutscenePlaying || this.behaviorLoop.length === 0 || this.isStanding) {
      return;
    }

    // setting up our event with relevant info
    let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
    eventConfig.who = this.id;

    // create an event instance out of our next event config
    const eventHandler = new OverworldEvent({ map, event: eventConfig });
    await eventHandler.init();

    // setting the next event to fire
    this.behaviorLoopIndex += 1;
    if (this.behaviorLoopIndex === this.behaviorLoop.length) {
      this.behaviorLoopIndex = 0;
    }

    // do it again!
    this.doBehaviorEvent(map);
  }
}