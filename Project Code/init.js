/*
  This file is the entry point for the game. It initializes the Overworld class and starts the game.
  Our game closely follows this guide for most of it's functionality:
  https://www.youtube.com/playlist?list=PLcjhmZ8oLT0r9dSiIK6RB_PuBWlG1KSq_
*/

(function () {
  const overworld = new Overworld({
    element: document.querySelector(".game-container"),
  });
  overworld.init();
})();
