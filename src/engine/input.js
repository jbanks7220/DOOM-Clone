export class Input {
  constructor(canvas) {
    this.keys = {};
    this.mouseDeltaX = 0;
    this.mouseClicked = false;

    // Key down/up
    window.addEventListener("keydown", e => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener("keyup", e => this.keys[e.key.toLowerCase()] = false);

    // Pointer lock
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
    canvas.addEventListener("click", () => canvas.requestPointerLock());

    document.addEventListener("pointerlockchange", () => {
      this.isLocked = document.pointerLockElement === canvas;
    });

    // Mouse movement
    document.addEventListener("mousemove", e => {
      if (this.isLocked) this.mouseDeltaX = e.movementX;
    });

    // Mouse click for fire
    document.addEventListener("mousedown", e => {
      if (e.button === 0) this.mouseClicked = true; // left button
    });
    document.addEventListener("mouseup", e => {
      if (e.button === 0) this.mouseClicked = false;
    });
  }

  // Movement keys
  get forward() { return this.keys["w"]; }
  get backward() { return this.keys["s"]; }
  get left() { return this.keys["a"]; }
  get right() { return this.keys["d"]; }

  // Mouse turn
  get turn() {
    const delta = this.mouseDeltaX * 0.002; // sensitivity
    this.mouseDeltaX = 0;
    return delta;
  }

  // Fire with left click
  get fire() { return this.mouseClicked; }
}
