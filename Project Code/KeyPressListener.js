/*
  This file contains the KeyPressListener class, which is used to listen for key presses in the game.
*/

class KeyPressListener {
  constructor(keyCode, callback) {
    // Will be disabled until key is released
    let keySafe = true;

    // Key is pressed
    this.keydownFunction = function (event) {
      // If code matches the key code passed in
      if (event.code === keyCode) {
        // Key is free
        if (keySafe) {
          // Disable
          keySafe = false;
          callback();
        }
      }
    };

    // Key is released
    this.keyupFunction = function (event) {
      // If code matched the key code passed in
      if (event.code === keyCode) {
        // Enable
        keySafe = true;
      }
    };

    // Event listeners
    document.addEventListener("keydown", this.keydownFunction);
    document.addEventListener("keyup", this.keyupFunction);
  }

  // Once finished, remove event listeners
  unbind() {
    document.removeEventListener("keydown", this.keydownFunction);
    document.removeEventListener("keyup", this.keyupFunction);
  }
}
