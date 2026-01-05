import { Physics } from "./physics.js";

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;

    this.speed = 3;
    this.fov = Math.PI / 3;

    this.health = 100;
    this.ammo = Infinity;   // Infinite ammo
    this.cooldown = 0;

    // Display value for HUD
    this.ammoDisplay = "∞";
  }

  update(input, map, enemies, audio, delta) {
    if (this.health <= 0) return; // stop movement when dead

    // Decrease cooldown timer
    this.cooldown -= delta;

    // Mouse turning
    this.angle += input.turn;

    // Movement
    let moveX = 0;
    let moveY = 0;

    if (input.forward)  { moveX += Math.cos(this.angle); moveY += Math.sin(this.angle); }
    if (input.backward) { moveX -= Math.cos(this.angle); moveY -= Math.sin(this.angle); }
    if (input.left)     { moveX += Math.cos(this.angle - Math.PI/2); moveY += Math.sin(this.angle - Math.PI/2); }
    if (input.right)    { moveX += Math.cos(this.angle + Math.PI/2); moveY += Math.sin(this.angle + Math.PI/2); }

    const step = this.speed * delta;
    const nx = this.x + moveX * step;
    const ny = this.y + moveY * step;

    if (Physics.canMoveTo(nx, ny, map)) {
      this.x = nx;
      this.y = ny;
    }

    // Fire bullets
    if (input.fire && this.cooldown <= 0) {
      this.shoot(enemies, audio);
      this.cooldown = 0.3; // shooting cooldown
    }
  }

  shoot(enemies, audio) {
    // Infinite ammo, so we don't decrease anything
    audio.play("shoot");

    for (const enemy of enemies) {
      if (enemy.state !== "alive") continue;

      const dist = Physics.distance(this, enemy);
      if (dist > 6) continue;

      const angleToEnemy = Physics.angleBetween(this, enemy);
      if (Math.abs(angleToEnemy - this.angle) < 0.15) {
        enemy.health -= 25;
        audio.play("hit");

        if (enemy.health <= 0) {
          enemy.state = "dying";
          enemy.deathTimer = 0;
        }

        break; // only hit one enemy per shot
      }
    }
  }
}
