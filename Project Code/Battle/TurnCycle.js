/*
  This file contains the TurnCycle class, which is used to manage the turn cycle in the game.
*/
class TurnCycle {
  constructor({ battle, onNewEvent, onWinner, map }) {
    this.battle = battle;
    this.onNewEvent = onNewEvent;
    this.onWinner = onWinner;
    this.map = map;
    this.currentTeam = "player"; // or "enemy"
  }

  async turn() {
    // Get the caster and enemy
    const casterId = this.battle.activeCombatants[this.currentTeam];
    const caster = this.battle.combatants[casterId];
    const enemyId =
      this.battle.activeCombatants[
        caster.team === "player" ? "enemy" : "player"
      ];
    const enemy = this.battle.combatants[enemyId];

    const submission = await this.onNewEvent({
      type: "submissionMenu",
      caster,
      enemy,
    });

    // Stop here if we are replacing this evolisk
    if (submission.replacement) {
      await this.onNewEvent({
        type: "replace",
        replacement: submission.replacement,
      });
      await this.onNewEvent({
        type: "textMessage",
        text: `Go get 'em, ${submission.replacement.name}!`,
      });
      this.nextTurn();
      return;
    }

    if (submission.instanceId) {
      // Add to List to Persist to PlayerState
      this.battle.usedInstanceIds[submission.instanceId] = true;

      // Removing Item from Battle State
      this.battle.items = this.battle.items.filter(
        (i) => i.instanceId !== submission.instanceId
      );
    }

    const resultingEvents = caster.getReplacedEvents(submission.action.success);

    for (let i = 0; i < resultingEvents.length; i++) {
      const event = {
        ...resultingEvents[i],
        submission,
        action: submission.action,
        caster,
        target: submission.target,
      };
      const result = await this.onNewEvent(event);

      if (result?.caught) {
        this.onWinner("player");
        return;
      }
    }

    // Did the target die?
    const targetDead = submission.target.hp <= 0;
    if (targetDead) {
      await this.onNewEvent({
        type: "textMessage",
        text: `${submission.target.name} has fainted!`,
      });

      if (submission.target.team === "enemy") {
        const playerActiveEvoliskId = this.battle.activeCombatants.player;
        const xp = submission.target.givesXp;

        await this.onNewEvent({
          type: "textMessage",
          text: `Gained ${xp} XP!`,
        });
        await this.onNewEvent({
          type: "giveXP",
          xp,
          combatant: this.battle.combatants[playerActiveEvoliskId],
        });
      }
    }

    // Check if all player Evolisks are fainted
    const allFainted = Object.values(this.battle.combatants)
      .filter((combatant) => combatant.team === "player")
      .every((combatant) => combatant.hp <= 0);

      if (allFainted) {
      
        this.map.teleportToHealingArea();
        this.onWinner("enemy");
        return; // Stop the turn if all Evolisks faint
      }

    // Do we have a winning team?
    const winner = this.getWinningTeam();
    if (winner) {
      await this.onNewEvent({
        type: "textMessage",
        text: "Winner!",
      });
      this.onWinner(winner);
      return;
    }

    // We have a dead target, but still no winner, so bring in a replacement
    if (targetDead) {
      const replacement = await this.onNewEvent({
        type: "replacementMenu",
        team: submission.target.team,
      });
      await this.onNewEvent({
        type: "replace",
        replacement: replacement,
      });
      await this.onNewEvent({
        type: "textMessage",
        text: `${replacement.name} appears!`,
      });
    }

    // Check for post events (e.g., after effects, statuses)
    const postEvents = caster.getPostEvents();
    for (let i = 0; i < postEvents.length; i++) {
      const event = {
        ...postEvents[i],
        submission,
        action: submission.action,
        caster,
        target: submission.target,
      };
      await this.onNewEvent(event);
    }

    // Check for status expire (e.g., poison, etc.)
    const expiredEvent = caster.decrementStatus();
    if (expiredEvent) {
      await this.onNewEvent(expiredEvent);
    }

    this.nextTurn();
  }

  async teleportToHealingArea() {
    // Example healing area coordinates (can be adjusted)
    const healingSpotX = 5;  // Change this to your healing area X-coordinate
    const healingSpotY = 5;  // Change this to your healing area Y-coordinate

    // Teleport the player to the healing area
    this.battle.map.gameObjects["hero"].x = healingSpotX * 16; // 16px per tile
    this.battle.map.gameObjects["hero"].y = healingSpotY * 16; // 16px per tile

    // Optionally show a healing message
    const healingMessage = new TextMessage({
      text: "You've been teleported to a healing area to revive your Evolisks.",
      onComplete: () => {
        // Heal the player's Evolisks
        this.healPlayerEvolisks();
      },
    });
    healingMessage.init(this.battle.element);
  }

  healPlayerEvolisks() {
    const playerState = window.playerState;
    
    // Restore all Evolisks' HP to full
    Object.keys(playerState.evolisks).forEach((id) => {
      const combatant = this.battle.combatants[id];
      if (combatant) {
        combatant.hp = combatant.maxHp; // Full restore
      }
    });

  }

  nextTurn() {
    this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
    this.turn();
  }

  getWinningTeam() {
    let aliveTeams = {};
    Object.values(this.battle.combatants).forEach((c) => {
      if (c.hp > 0) {
        aliveTeams[c.team] = true;
      }
    });
    if (!aliveTeams["player"]) {
      return "enemy";
    }
    if (!aliveTeams["enemy"]) {
      return "player";
    }
    return null;
  }

  async init() {
    await this.onNewEvent({
      type: "textMessage",
      text: `${this.battle.enemy.name} wants to fight!`,
    });

    this.turn();
  }



}

