/*
  This file holds animations for Evolisk attacks.
*/

window.BattleAnimations = {
  async spin(event, onComplete) {
    const element = event.caster.evoliskElement;
    const animationClassName =
      event.caster.team === "player" ? "battle-spin-right" : "battle-spin-left";
    element.classList.add(animationClassName);

    // Remove class when animation is fully complete
    element.addEventListener(
      "animationend",
      () => {
        element.classList.remove(animationClassName);
      },
      { once: true }
    );

    // Continue battle cycle right around when the evolisks collide
    await utils.wait(100);
    onComplete();
  },

  async glob(event, onComplete) {
    const { caster } = event;
    let div = document.createElement("div");
    div.classList.add("glob-orb");
    div.classList.add(
      caster.team === "player" ? "battle-glob-right" : "battle-glob-left"
    );

    div.innerHTML = `
        <svg viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="16" fill="${event.color}" />
        </svg>
        `;

    // Remove class when animation is fully complete
    div.addEventListener("animationend", () => {
      div.remove();
    });

    // Add to scene
    document.querySelector(".Battle").appendChild(div);

    await utils.wait(820);
    onComplete();
  },

  async phantomCharge(event, onComplete) {
    const element = event.caster.evoliskElement;
    element.classList.add("battle-phantom-charge");

    element.addEventListener(
      "animationend",
      () => {
        element.classList.remove("battle-phantom-charge");
        onComplete();
      },
      { once: true }
    );
  },

  async voidHowl(event, onComplete) {
    const element = event.caster.evoliskElement;
    element.classList.add("battle-void-howl");

    element.addEventListener(
      "animationend",
      () => {
        element.classList.remove("battle-void-howl");
        onComplete();
      },
      { once: true }
    );
  },

  async starShatter(event, onComplete) {
    const { caster } = event;

    const container = document.querySelector(".Battle");

    for (let i = 0; i < 5; i++) {
      const star = document.createElement("div");
      star.classList.add("battle-star");

      // Offset starting positions slightly for variety
      const offsetX = Math.random() * 10 - 5;
      const offsetY = Math.random() * 10 - 5;

      star.style.left = `${
        caster.team === "player" ? 70 + offsetX : 180 + offsetX
      }px`;
      star.style.top = `${
        caster.team === "player" ? 105 + offsetY : 65 + offsetY
      }px`;

      // Add a star shape (use emoji or SVG for now)
      star.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="#331944" d="M12 0L14.8 7H22L16 11.2L18.8 18.5L12 14.3L5.2 18.5L8 11.2L2 7H9.2L12 0Z" />
        </svg>
      `;

      container.appendChild(star);

      // Clean up after animation
      star.addEventListener("animationend", () => {
        star.remove();
      });

      // Stagger star launch timing a bit
      await utils.wait(80);
    }

    // Wait until the last star would hit, then continue
    await utils.wait(700);
    onComplete();
  },
};
