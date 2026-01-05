import { Raycaster } from "./raycaster.js";
import { Physics } from "./physics.js";

export class Renderer {
  constructor(ctx, canvas, map, player, enemies, pickups, audio) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.map = map;
    this.player = player;
    this.enemies = enemies;
    this.pickups = pickups;
    this.audio = audio;

    this.raycaster = new Raycaster(map);

    // Spawn timer
    this.spawnTimer = 0;
    this.spawnDelay = this.getRandomSpawnDelay(); // initial spawn delay
    this.killCount = 0;
    this.bossSpawned = false;
  }

  // Returns random delay between 3.5–5.5s
  getRandomSpawnDelay() {
    return 3.5 + Math.random() * 2;
  }

  // Spawn enemy in a walkable tile
  spawnEnemy(isBoss = false) {
    let x, y;
    do {
      x = Math.random() * this.map[0].length;
      y = Math.random() * this.map.length;
    } while (!Physics.canMoveTo(x, y, this.map));

    const enemy = {
      x, y,
      speed: isBoss ? 0.6 : 0.35,
      maxHealth: isBoss ? 400 : 100,
      health: isBoss ? 400 : 100,
      state: "alive",
      deathTimer: 0,
      attackCooldown: 0,
      isBoss
    };
    this.enemies.push(enemy);
  }

  updateEnemies(delta) {
    this.spawnTimer += delta;

    // SPAWN NEW ENEMY IF TIME ELAPSED
    if (!this.bossSpawned && this.spawnTimer >= this.spawnDelay) {
      this.spawnEnemy();
      this.spawnTimer = 0;
      this.spawnDelay = this.getRandomSpawnDelay(); // new random interval
    }

    // Update all enemies
    for (const enemy of this.enemies) {
      if (enemy.state === "alive") {
        enemy.attackCooldown -= delta;

        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // Move toward player
        if (dist > 0.6) {
          const nx = enemy.x + (dx / dist) * enemy.speed * delta;
          const ny = enemy.y + (dy / dist) * enemy.speed * delta;

          if (Physics.canMoveTo(nx, ny, this.map)) {
            enemy.x = nx;
            enemy.y = ny;
          }
        }

        // Attack player
        if (dist < 0.6 && enemy.attackCooldown <= 0) {
          this.player.health -= enemy.isBoss ? 20 : 10;
          enemy.attackCooldown = 1.2;
        }
      }

      // DYING ANIMATION
      if (enemy.state === "dying") {
        enemy.deathTimer += delta;
        if (enemy.deathTimer > 1) {
          enemy.state = "dead";
          this.killCount++;
          if (this.killCount >= 5 && !this.bossSpawned) {
            this.spawnEnemy(true); // spawn boss
            this.bossSpawned = true;
          }
        }
      }
    }
  }

  render(delta = 0.016) {
    this.updateEnemies(delta);

    const { ctx, canvas, player } = this;

    // SKY
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

    // FLOOR
    ctx.fillStyle = "#444";
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    // WALLS
    for (let x = 0; x < canvas.width; x++) {
      const rayAngle = player.angle - player.fov/2 + (x / canvas.width) * player.fov;
      const hit = this.raycaster.cast(player.x, player.y, rayAngle);
      const dist = hit.distance * Math.cos(rayAngle - player.angle);
      const h = canvas.height / Math.max(dist, 0.01);
      ctx.fillStyle = "#888";
      ctx.fillRect(x, canvas.height / 2 - h / 2, 1, h);
    }

    // ENEMIES
    for (const enemy of this.enemies) {
      if (enemy.state === "dead") continue;

      ctx.globalAlpha = 1; // reset alpha for each enemy

      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 0.01) continue;

      const angle = Math.atan2(dy, dx) - player.angle;
      if (Math.abs(angle) > player.fov/2) continue;

      // Clamp size so enemies are always visible
      const size = Math.min(Math.max(canvas.height / dist, 10), canvas.height * 2);
      const screenX = ((angle + player.fov/2) / player.fov) * canvas.width;

      if (enemy.state === "dying") {
        const t = Math.min(enemy.deathTimer, 1);
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = "gray";
        ctx.fillRect(
          screenX - size/4,
          canvas.height/2 - size/2 + t*50,
          size/2,
          size*(1-t)
        );
      } else {
        ctx.fillStyle = enemy.isBoss ? "purple" : "red";
        ctx.fillRect(
          screenX - size/4,
          canvas.height/2 - size/2,
          size/2,
          size
        );
      }

      ctx.globalAlpha = 1; // reset alpha after drawing
    }

    // PICKUPS
    for (const p of this.pickups) {
      if (p.taken) continue;

      if (Physics.distance(player, p) < 0.5) {
        p.taken = true;
        this.audio.play("pickup");

        if (p.type === "ammo") player.ammo += 10;
        if (p.type === "health")
          player.health = Math.min(100, player.health + 25);
      }
    }

    // HUD
    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    ctx.fillText(`HP: ${player.health}`, 20, 25);
    ctx.fillText(`AMMO: ${player.ammo}`, 20, 45);
    ctx.fillText(`KILLS: ${this.killCount}`, 20, 65);

    // CROSSHAIR
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(canvas.width/2 - 5, canvas.height/2);
    ctx.lineTo(canvas.width/2 + 5, canvas.height/2);
    ctx.moveTo(canvas.width/2, canvas.height/2 - 5);
    ctx.lineTo(canvas.width/2, canvas.height/2 + 5);
    ctx.stroke();
  }
}
