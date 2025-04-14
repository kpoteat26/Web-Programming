/*
  This file contains the TextMessage class, which is used to display text messages in the game.
*/

class TextMessage {
  constructor({ text, onComplete }) {
    this.text = text;
    this.onComplete = onComplete;
    this.element = null;
  }

  // Creates text message block element in game
  createElement() {
    // Create the element
    this.element = document.createElement("div");
    this.element.classList.add("TextMessage");
    this.element.innerHTML = `
            <p class="TextMessage_p"></p>
            <button class="TextMessage_button">Next</button>
        `;

    // Initiates the typewriter effect
    this.revealingText = new RevealingText({
      element: this.element.querySelector(".TextMessage_p"),
      text: this.text,
    });

    // Close the text message once button is clicked
    this.element.querySelector("button").addEventListener("click", () => {
      this.done();
    });

    // Allow for the "Enter" key to close the text message
    this.actionListener = new KeyPressListener("Enter", () => {
      this.done();
    });
  }

  done() {
    // If the text is done being revealed, remove the element and unbind the action listener
    if (this.revealingText.isDone) {
      this.element.remove();
      this.actionListener.unbind();
      this.onComplete();
    } else {
      this.revealingText.warpToDone();
    }
  }

  // Call class functions
  init(container) {
    this.createElement();
    container.appendChild(this.element);
    this.revealingText.init();
  }
}
