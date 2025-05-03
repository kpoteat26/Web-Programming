/*
  This file contains the PlayerState class, which is used to manage the player's state in the game.
*/

class PlayerState {
  constructor() {
    this.evolisks = {
      e1: {
        evoliskId: "ep003",
        hp: 50,
        maxHp: 50,
        xp: 0,
        maxXp: 100,
        level: 1,
        status: null,
      },
      // "e2": {
      //   evoliskId: "ep002",
      //   hp: 50,
      //   maxHp: 50,
      //   xp: 75,
      //   maxXp: 100,
      //   level: 1,
      //   status: null,
      // },
      // "e3": {
      //   evoliskId: "ep002",
      //   hp: 50,
      //   maxHp: 100,
      //   xp: 75,
      //   maxXp: 100,
      //   level: 1,
      //   status: null,
      //}
    };
    this.lineup = ["e1"];
    this.items = [
      { actionId: "item_recoverHp", instanceId: "item1" },
      { actionId: "item_recoverHp", instanceId: "item2" },
      { actionId: "catchDisc", instanceId: "item3" },
    ];
    this.storyFlags = {};
  }

  addEvolisk(evoliskId) {
    const newId = `p${Date.now()}` + Math.floor(Math.random() * 99999);
    this.evolisks[newId] = {
      evoliskId,
      hp: 50,
      maxHp: 50,
      xp: 0,
      maxXp: 100,
      level: 1,
      status: null,
    };

    if (this.lineup.length < 3) {
      this.lineup.push(newId);
    }

    utils.emitEvent("LineupChanged");
    console.log(this);
  }

  swapLineup(oldId, incomingId) {
    const oldIndex = this.lineup.indexOf(oldId);
    this.lineup[oldIndex] = incomingId;
    utils.emitEvent("LineupChanged");
  }

  moveToFront(futureFrontId) {
    this.lineup = this.lineup.filter((id) => id !== futureFrontId);
    this.lineup.unshift(futureFrontId);
    utils.emitEvent("LineupChanged");
  }
}
window.playerState = new PlayerState();
