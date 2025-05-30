/*
  This file contains the SceneTransition class, which is used to transition between rooms in the game.
*/

class SceneTransition {
  constructor() {
    this.element = null;
  }

  // Creates an element for the scene transition
  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("SceneTransition");
  }

  // Fades out the scene transition element
  fadeOut() {
    this.element.classList.add("fade-out");
    this.element.addEventListener(
      "animationend",
      () => {
        this.element.remove();
      },
      { once: true }
    );
  }

  // Call class functions
  init(container, callback) {
    this.createElement();
    container.appendChild(this.element);

    this.element.addEventListener(
      "animationend",
      () => {
        callback();
      },
      { once: true }
    );
  }
}
