/*
  This file contains the Combatant class, which is used to create combatants in the game.
*/

class Combatant {
  constructor(config, battle) {
    Object.keys(config).forEach((key) => {
      this[key] = config[key];
    });
    this.hp = typeof this.hp === "undefined" ? this.maxHp : this.hp;
    this.battle = battle;
    this.mutatedSrc = config.mutatedSrc || null;
    this.isMutated = false;

  }

  // Getter for hp percentage
  get hpPercent() {
    const percent = (this.hp / this.maxHp) * 100;
    return percent > 0 ? percent : 0;
  }

  // Getter for xp percentage
  get xpPercent() {
    return (this.xp / this.maxXp) * 100;
  }

  // Getter for active combatant
  get isActive() {
    return this.battle?.activeCombatants[this.team] === this.id;
  }

  get givesXp() {
    return this.level * 20;
  }

  // Create the element
  createElement() {
    // Draw the hud element
    this.hudElement = document.createElement("div");
    this.hudElement.classList.add("Combatant");
    this.hudElement.setAttribute("data-combatant", this.id);
    this.hudElement.setAttribute("data-team", this.team);
    this.hudElement.innerHTML = `
            <p class="Combatant_name">${this.name}</p>
            <p class="Combatant_level"></p>
            <img class="Combatant_type" src="${this.icon}" alt="${this.type}" />
            <svg viewBox="0 0 26 3" class="Combatant_life-container">
              <rect x=0 y=0 width="0%" height=1 fill="#82ff71" />
              <rect x=0 y=1 width="0%" height=2 fill="#3ef126" />
            </svg>
            <svg viewBox="0 0 26 2" class="Combatant_xp-container">
              <rect x=0 y=0 width="0%" height=1 fill="#ffd76a" />
              <rect x=0 y=1 width="0%" height=1 fill="#ffc934" />
            </svg>
            <p class="Combatant_status"></p>
        `;
// ✅ Create the image manually and store it
this.spriteImg = document.createElement("img");
this.spriteImg.classList.add("Combatant_character");
this.spriteImg.alt = this.name;
this.spriteImg.src = this.src;

const cropDiv = document.createElement("div");
cropDiv.classList.add("Combatant_character_crop");
cropDiv.appendChild(this.spriteImg);

// ✅ Append cropDiv into this.hudElement
this.hudElement.appendChild(cropDiv);

    // Draw the evolisk element
    this.evoliskElement = document.createElement("img");
    this.evoliskElement.classList.add("Evolisk");
    this.evoliskElement.setAttribute("src", this.src);
    this.evoliskElement.setAttribute("alt", this.name);
    this.evoliskElement.setAttribute("data-team", this.team);

    // Draw the hp and xp fills
    this.hpFills = this.hudElement.querySelectorAll(
      ".Combatant_life-container > rect"
    );
    this.xpFills = this.hudElement.querySelectorAll(
      ".Combatant_xp-container > rect"
    );
  }

  update(changes = {}) {
    // Update anything incoming
    Object.keys(changes).forEach((key) => {
      this[key] = changes[key];
    });
  
    // Update active flag to show correct evolisk & hud
    this.hudElement.setAttribute("data-active", this.isActive);
    this.evoliskElement.setAttribute("data-active", this.isActive);
  
    // Update sprite image if src changed
    if (this.spriteImg && this.src) {
      this.spriteImg.src = this.src + `?v=${Date.now()}`; // force reload to bust cache
    }
  
    // Update hp & xp percent fills
    this.hpFills.forEach((rect) => (rect.style.width = `${this.hpPercent}%`));
    this.xpFills.forEach((rect) => (rect.style.width = `${this.xpPercent}%`));
  
    // Update level on screen
    this.hudElement.querySelector(".Combatant_level").innerText = this.level;
  
    // Update status
    const statusElement = this.hudElement.querySelector(".Combatant_status");
    if (this.status) {
      statusElement.innerText = this.status.type;
      statusElement.style.display = "block";
    } else {
      statusElement.innerText = "";
      statusElement.style.display = "none";
    }
  }
  

  getReplacedEvents(originalEvents) {
    if (
      this.status?.type === "dazed" &&
      utils.randomFromArray([true, false, false])
    ) {
      return [{
        type: "textMessage",
        text: `${this.name} is dazed!`,
        caster: this,
      }];
    }
  
    return originalEvents;
  }

  getPostEvents() {
    if (this.status?.type === "recover") {
      return [
        { type: "textMessage", text: `${this.name} is recovered some health!` },
        { type: "stateChange", recover: 10, onCaster: true },
      ];
    }
    return [];
  }

  decrementStatus() {
    if (this.status && this.status.expiresIn > 0) {
      this.status.expiresIn -= 1;
      if (this.status.expiresIn === 0) {
        const expiredStatus = this.status.type; // Save the status type before clearing
        this.update({
          status: null,
        });
        return {
          type: "textMessage",
          text: `${this.name}'s ${expiredStatus} wore off!`,
        };
      }
    }
    return null;
  }

  mutate() {
    if (this.mutatedSrc && !this.isMutated) {
      this.spriteImg.src = this.mutatedSrc;
      this.evoliskElement.src = this.mutatedSrc;
      this.isMutated = true;
    }
  }

  // Calls class functions
  init(container) {
    this.createElement();
    container.appendChild(this.hudElement);
    container.appendChild(this.evoliskElement);
    this.update();
  }
}
