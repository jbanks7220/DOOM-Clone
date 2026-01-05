import { GameLoop } from "./engine/gameLoop.js";
import { Input } from "./engine/input.js";
import { Renderer } from "./engine/renderer.js";
import { Player } from "./engine/player.js";
import { map } from "./world/map.js";
import { enemies } from "./world/level01.js";
import { pickups } from "./world/pickups.js";
import { AudioManager } from "./engine/audio.js";

const canvas = document.getElementById("game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

const input = new Input(canvas);
const player = new Player(3.5, 3.5);
const audio = new AudioManager();
const renderer = new Renderer(ctx, canvas, map, player, enemies, pickups, audio);

const gameOverDiv = document.getElementById("gameOver");
const reloadBtn = document.getElementById("reloadBtn");
reloadBtn.addEventListener("click", () => window.location.reload());

new GameLoop((delta) => {
  if (player.health <= 0) {
    gameOverDiv.style.display = "flex";
    return;
  }
  player.update(input, map, enemies, audio, delta);
  renderer.render(delta);
});
