/*
  This file contains the OverworldEvent class, which is used to handle events that occur on the overworld map.
*/
class OverworldEvent {
  constructor({ map, event }) {
    this.map = map;
    this.event = event;
  }

  // when a game object is standing
  stand(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior({
      map: this.map
    }, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time
    });

    // set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    };
    document.addEventListener("PersonStandComplete", completeHandler);
  }

  // when a game object is walking
  walk(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    });

    // set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    };
    document.addEventListener("PersonWalkingComplete", completeHandler);
  }

  // text message that can appear on the screen
  textMessage(resolve) {
    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve()
    });
    message.init(document.querySelector(".game-container"));
  }

  // change the current map
  changeMap(resolve) {
    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap(window.OverworldMaps[this.event.map]);
      resolve();

      sceneTransition.fadeOut();
    });
  }

  // puts the game into battle mode
  battle(resolve) {
    const battle = new Battle({
      enemy: Enemies[this.event.enemyId],
      onComplete: () => {
        resolve();
      }
    });

    battle.init(document.querySelector(".game-container"));
  }

  // initiates the desired event
  init() {
    return new Promise(resolve => {
      this[this.event.type](resolve);
    });
  }
}