window.Actions = {
    //Attacks
    phantomCharge: {
        name: "Phantom Charge",
        description: "The user calls upon their powers of Shadow to travel at high speeds towards the enemy, dealing damage.",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
            { type: "animation", animation: "spin" },
            { type: "stateChange", damage: 10 }
        ]
    },
    voidHowl: {
        name: "Void Howl",
        description: "The user lets out a screeching howl channeling the depths of the void to deal heavy damage to the enemy.",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
            { type: "stateChange", damage: 30 }
        ]
    },
    starShatter: {
        name: "Star Shatter",
        description: "The user sends forth a whirl of starts from the shadow realm dealing damage to the enemy and leaving them dazzed.",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
            { type: "animation", animation: "glob", color: "#dafd2a" },
            { type: "stateChange", status: { type: "dazed", expiresIn: 3 } },
            { type: "textMessage", text: "{TARGET} is dazed! They may be unable to move." },
        ]
    },
    astralCoil: {
        name: "Astral Coil",
        description: "The user wraps their body around the enemy squeezing them tightly and dealing damage.",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
            { type: "animation", animation: "spin" },
            { type: "stateChange", damage: 10 }
        ]
    },
    ghostFang: {
        name: "Ghost Fang",
        description: "The user channels their mythic abilities to bite the enemy from a distance dealing large amounts of damage.",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
            { type: "stateChange", damage: 30 }
        ]
    },
    paralyzingSpit: {
        name: "Paralyzing Spit",
        description: "The user spits violently at the enemy, leaving the enemy dazed.",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
            { type: "animation", animation: "glob", color: "#dafd2a" },
            { type: "stateChange", status: { type: "dazed", expiresIn: 3 } },
            { type: "textMessage", text: "{TARGET} is dazed! They may be unable to move." },
        ]
    },
    // Items
    item_recoverStatus: {
        name: "Heating Lamp",
        description: "Feeling fresh and warm the user is no longer affected by status effects.",
        targetType: "friendly",
        success: [
            { type: "textMessage", text: "{CASTER} uses a {ACTION}!" },
            { type: "stateChange", status: null },
            { type: "textMessage", text: "Feeling fresh!" },
        ]
    },
    item_recoverHp: {
        name: "Red Potion",
        description: "The user may drinks this potion to recover 40 lost health.",
        targetType: "friendly",
        success: [
            { type: "textMessage", text: "{CASTER} drinks some {ACTION}!", },
            { type: "stateChange", recover: 40, },
            { type: "textMessage", text: "{CASTER} recovers health!", },
        ]
    },
}