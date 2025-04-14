/*
  This file contains the creatures used in the game.
*/

window.EvoliskTypes = {
  // Evolisk Types
  Shadow: "shadow",
  Mythic: "mythic",
  Naturalist: "naturalist",
};

window.Evolisks = {
  // Enemy Evolisks
  ee001: {
    name: "Luxigon",
    description: "A dark but loyal Evolisk.",
    type: EvoliskTypes.shadow,
    src: "./images/characters/evolisks/LuxigonBattleEnemy.png",
    icon: "./images/icons/Shadow.png",
    actions: ["phantomCharge", "voidHowl", "starShatter"],
  },
  ee002: {
    name: "Umbraik",
    description: "A slightly unsettling Evolisk.",
    type: EvoliskTypes.mythic,
    src: "./images/characters/evolisks/UmbraikBattleEnemy.png",
    icon: "./images/icons/Mythic.png",
    actions: ["astralCoil", "ghostFang", "paralyzingSpit"],
  },
  ee003: {
    name: "Lumivyre",
    description:
      "A moth-like creature who senses the intentions of those around it.",
    type: EvoliskTypes.naturalist,
    src: "./images/characters/evolisks/LumivyreBattleEnemy.png",
    icon: "./images/icons/Naturalist.png",
    actions: ["astralCoil", "ghostFang", "paralyzingSpit"],
  },

  // Player Evolisks
  ep001: {
    name: "Luxigon",
    description: "A dark but loyal Evolisk.",
    type: EvoliskTypes.shadow,
    src: "./images/characters/evolisks/LuxigonBattleTamed.png",
    icon: "./images/icons/Shadow.png",
    actions: ["phantomCharge", "voidHowl", "starShatter"],
  },
  ep002: {
    name: "Umbraik",
    description: "A slightly unsettling Evolisk.",
    type: EvoliskTypes.mythic,
    src: "./images/characters/evolisks/UmbraikBattleTamed.png",
    icon: "./images/icons/Mythic.png",
    actions: ["astralCoil", "ghostFang", "paralyzingSpit"],
  },
  ep003: {
    name: "Lumivyre",
    description:
      "A moth-like creature who senses the intentions of those around it.",
    type: EvoliskTypes.naturalist,
    src: "./images/characters/evolisks/LumivyreBattleTamed.png",
    icon: "./images/icons/Naturalist.png",
    actions: ["mesmerizingGaze", "windCutter", "paralyzingDust"],
  },
};
