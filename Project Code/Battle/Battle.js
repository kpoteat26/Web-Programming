/*
  This file contains the Battle class, which is used to manage battles in the game.
*/

class Battle {
  constructor({ enemy, onComplete, battleBackgroundSrc, isWildEncounter = false, map }) {
    this.enemy = enemy;
    this.onComplete = onComplete;
    this.map = map;

    this.isWildEncounter = isWildEncounter;

    this.battleBackgroundSrc = battleBackgroundSrc || "./images/maps/DemoBattle.png";

    this.backgroundImage = new Image();
    this.backgroundImage.src = this.battleBackgroundSrc;

    this.combatants = {};

    this.activeCombatants = {
      player: null, // "player1",
      enemy: null, // "enemy1",
    };

    // Dynamically add the player team
    window.playerState.lineup.forEach((id) => {
      this.addCombatant(id, "player", window.playerState.evolisks[id]);
    });

   // Now the enemy team
    Object.keys(this.enemy.evolisks).forEach((key) => {
     this.addCombatant("e_" + key, "enemy", { ...this.enemy.evolisks[key] });
      });

    // Start empty
    this.items = [];

    // Add in player items
    window.playerState.items.forEach((item) => {
      this.items.push({
        ...item,
        team: "player",
      });
    });

    this.usedInstanceIds = {};
  }

  addCombatant(id, team, config) {
    // If it's a wild encounter, and the combatant is a person (trainer), skip adding it
    const isTrainerEvolisk = this.isWildEncounter && config.isPerson;
  
    if (isTrainerEvolisk) {
      return; // Skip adding trainer's Evolisk
    }

    if (config.isMutated && config.mutatedSrc) {
      config.src = config.mutatedSrc;
    }
  
    this.combatants[id] = new Combatant(
      {
        ...Evolisks[config.evoliskId],
        ...config,
        team,
        isPlayerControlled: team === "player",
        isPerson: false, // Ensure that trainers are marked correctly
      },
      this
    );
  
    // Populate first active evolisk for each team
    this.activeCombatants[team] = this.activeCombatants[team] || id;
  }
  

  // Draw the battle element (hero and enemy)
  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("Battle");
  
    if (this.battleBackgroundSrc) {
      this.element.style.backgroundImage = `url(${this.battleBackgroundSrc})`;
    }
  
    // Only show the trainer if NOT a wild battle
    let enemyHTML = "";
    if (!this.isWildEncounter) {
      enemyHTML = `
        <div class="Battle_enemy">
          <img src="${this.enemy.src}" alt="${this.enemy.name}" />
        </div>
      `;
    }
  
    this.element.innerHTML = `
      <div class="Battle_hero">
        <img src="./images/characters/people/Kairo_Hero.png" alt="Hero" />
      </div>
      ${enemyHTML}
    `;
  }
  
  
  init(container) {
    this.createElement();
    container.appendChild(this.element);
  
    this.playerTeam = new Team("player", "Hero");
    this.enemyTeam = new Team("enemy", "Bully");
  
    Object.keys(this.combatants).forEach((key) => {
      let combatant = this.combatants[key];
      combatant.id = key;
  
      //  Skip mounting enemy Person if this is a wild encounter
      if (this.isWildEncounter && combatant.team === "enemy" && combatant.isPerson) {
        return;
      }

  
      combatant.init(this.element, {
        team: combatant.team,
        isWildEncounter: this.isWildEncounter,
      });
  
      if (combatant.team === "player") {
        this.playerTeam.combatants.push(combatant);
      } else if (combatant.team === "enemy") {
        this.enemyTeam.combatants.push(combatant);
      }
    });
  
    this.playerTeam.init(this.element);
    this.enemyTeam.init(this.element);
  
   // Set the first active player Evolisk
this.activeCombatants = {
  player: this.playerTeam.getFirstAlive(),
};

// For wild encounters, find the enemy differently
if (this.isWildEncounter) {
  const enemyIds = Object.keys(this.combatants).filter(id => {
    return this.combatants[id].team !== "player";
  });
  this.activeCombatants.enemy = enemyIds[0];
} else {
  this.activeCombatants.enemy = this.enemyTeam.getFirstAlive();
}
  
    this.turnCycle = new TurnCycle({
      battle: this,
      map: this.map,
      onNewEvent: (event) => {
        return new Promise((resolve) => {
          const battleEvent = new BattleEvent(event, this);
          battleEvent.init(resolve);
        });
      },
      onWinner: (winner) => {
        if (winner === "player") {
          const playerState = window.playerState;
          Object.keys(playerState.evolisks).forEach((id) => {
            const playerStateEvolisk = playerState.evolisks[id];
            const combatant = this.combatants[id];
            if (combatant) {
              playerStateEvolisk.hp = combatant.hp;
              playerStateEvolisk.xp = combatant.xp;
              playerStateEvolisk.maxXp = combatant.maxXp;
              playerStateEvolisk.level = combatant.level;
            }
          });
  
          utils.emitEvent("PlayerStateUpdated");
  
          playerState.items = playerState.items.filter((item) => {
            return !this.usedInstanceIds[item.instanceId];
          });
        }
        this.element.remove();
        this.onComplete(winner === "player");
      },
    });
    
    this.turnCycle.init();
  }


}
