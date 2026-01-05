export class GameLoop {
  constructor(updateFunc) {
    let last = performance.now();
    const loop = (time) => {
      const delta = (time - last)/1000;
      last = time;
      updateFunc(delta);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
