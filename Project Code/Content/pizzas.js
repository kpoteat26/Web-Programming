/*
    This file contains the pizzas (UPDATE) used in the game.
*/
window.PizzaTypes = {
    normal: "normal",
    spicy: "spicy",
    veggie: "veggie",
    fungi: "fungi",
    chill: "chill",
    Shadow: "shadow",
    Mythic: "mythic",
}

window.Pizzas = {
    "ee001": {
        name: "Luxigon",
        description: "A dark but loyal Evolisk",
        type: PizzaTypes.shadow,
        src: "./images/characters/pizzas/LuxigonBattleEnemy.png",
        icon: "./images/icons/Shadow.png",
        actions: ["phantomCharge", "voidHowl", "starShatter"],
    },
    "ee002": {
        name: "Umbraik",
        description: "A slightly unsettling Evolisk",
        type: PizzaTypes.mythic,
        src: "./images/characters/pizzas/UmbraikBattleEnemy.png",
        icon: "./images/icons/Mythic.png",
        actions: ["astralCoil", "ghostFang", "paralyzingSpit"],
    },
    "ep001": {
        name: "Luxigon",
        description: "A dark but loyal Evolisk",
        type: PizzaTypes.shadow,
        src: "./images/characters/pizzas/LuxigonBattleTamed.png",
        icon: "./images/icons/Shadow.png",
        actions: ["phantomCharge", "voidHowl", "starShatter"],
    },
    "ep002": {
        name: "Umbraik",
        description: "A slightly unsettling Evolisk",
        type: PizzaTypes.mythic,
        src: "./images/characters/pizzas/UmbraikBattleTamed.png",
        icon: "./images/icons/Mythic.png",
        actions: ["astralCoil", "ghostFang", "paralyzingSpit"],
    }
}