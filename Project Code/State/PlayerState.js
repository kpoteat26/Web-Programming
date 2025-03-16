class PlayerState {
    constructor() {
      this.pizzas = {
        "e1": {
          pizzaId: "ep001",
          hp: 30,
          maxHp: 50,
          xp: 90,
          maxXp: 100,
          level: 1,
          status: null,
        },
        "e2": {
          pizzaId: "ep002",
          hp: 50,
          maxHp: 50,
          xp: 75,
          maxXp: 100,
          level: 1,
          status: null,
        }
      }
      this.lineup = ["e2", "e1"];
      this.items = [
        { actionId: "item_recoverHp", instanceId: "item1" },
        { actionId: "item_recoverHp", instanceId: "item2" },
        { actionId: "item_recoverHp", instanceId: "item3" },
      ]
    }
  }
  window.playerState = new PlayerState();