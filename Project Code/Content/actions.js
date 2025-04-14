/*
  This file contains the actions that can be performed in the game.
*/

window.Actions = {
  // Attacks
  phantomCharge: {
    name: "Phantom Charge",
    description:
      "The user calls upon their powers of Shadow to travel at high speeds towards the enemy, dealing damage.",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
      { type: "animation", animation: "phantomCharge" },
      { type: "stateChange", damage: 10 },
    ],
  },
  voidHowl: {
    name: "Void Howl",
    description:
      "The user lets out a screeching howl channeling the depths of the void to deal heavy damage to the enemy.",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
      { type: "animation", animation: "voidHowl" },
      { type: "stateChange", damage: 30 },
    ],
  },
  starShatter: {
    name: "Star Shatter",
    description:
      "The user sends forth a whirl of stars from the shadow realm dealing damage to the enemy and leaving them dazed.",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
      { type: "animation", animation: "starShatter" },
      { type: "stateChange", status: { type: "dazed", expiresIn: 3 } },
      {
        type: "textMessage",
        text: "{TARGET} is dazed! They may be unable to move.",
      },
    ],
  },
  astralCoil: {
    name: "Astral Coil",
    description:
      "The user wraps their body around the enemy squeezing them tightly and dealing damage.",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
      { type: "animation", animation: "spin" },
      { type: "stateChange", damage: 10 },
    ],
  },
  ghostFang: {
    name: "Ghost Fang",
    description:
      "The user channels their mythic abilities to bite the enemy from a distance dealing large amounts of damage.",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
      { type: "stateChange", damage: 30 },
    ],
  },
  paralyzingSpit: {
    name: "Paralyzing Spit",
    description: "The user spits poison at the enemy, leaving the enemy dazed.",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
      { type: "animation", animation: "glob", color: "#dafd2a" },
      { type: "stateChange", status: { type: "dazed", expiresIn: 3 } },
      {
        type: "textMessage",
        text: "{TARGET} is dazed! They may be unable to move.",
      },
    ],
  },
  paralyzingDust: {
    name: "Paralyzing Dust",
    description:
      "The user flaps their wings, scattering dust around the environment and leaving the enemy dazed.",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
      { type: "animation", animation: "glob", color: "#dafd2a" },
      { type: "stateChange", status: { type: "dazed", expiresIn: 3 } },
      {
        type: "textMessage",
        text: "{TARGET} is dazed! They may be unable to move.",
      },
    ],
  },
  windCutter: {
    name: "Wind Cutter",
    description:
      "The user flaps their wings violently in an X pattern to send gusts of waves at the enemy.",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
      { type: "animation", animation: "spin" },
      { type: "stateChange", damage: 30 },
    ],
  },
  mesmerizingGaze: {
    name: "Mesmerizing Gaze",
    description:
      "The user users their psychic abilities to send harmful waves to the enemy.",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
      { type: "animation", animation: "voidHowl" },
      { type: "stateChange", damage: 20 },
    ],
  },

  // Items
  item_recoverStatus: {
    name: "Heating Lamp",
    description:
      "Feeling fresh and warm the user is no longer affected by status effects.",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} uses a {ACTION}!" },
      { type: "stateChange", status: null },
      { type: "textMessage", text: "Feeling fresh!" },
    ],
  },
  item_recoverHp: {
    name: "Red Potion",
    description: "The user may drink this potion to recover 40 lost health.",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} drinks some {ACTION}!" },
      { type: "stateChange", recover: 40 },
      { type: "textMessage", text: "{CASTER} recovers health!" },
    ],
  },
};
