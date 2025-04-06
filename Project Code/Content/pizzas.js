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
    Naturalist: "naturalist",
}

window.Pizzas = {
    //Enemy Evolisks
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
    "ee003": {
        name: "Lumivyre",
        description: "A moth-like creature who senses the intentions of those around it.",
        type: PizzaTypes.naturalist,
        src: "./images/characters/pizzas/LumivyreBattleEnemy.png",
        icon: "./images/icons/Naturalist.png",
        actions: ["astralCoil", "ghostFang", "paralyzingSpit"],
    },

    //Player Evolisks
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
    },
    "ep003": {
        name: "Lumivyre",
        description: "A moth-like creature who senses the intentions of those around it.",
        type: PizzaTypes.naturalist,
        src: "./images/characters/pizzas/LumivyreBattleTamed.png",
        icon: "./images/icons/Naturalist.png",
        actions: ["mesmerizingGaze", "windCutter", "paralyzingDust"],
    }

}