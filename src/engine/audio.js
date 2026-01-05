export class AudioManager {
  constructor(){
    this.sounds = { shoot:new Audio(), hit:new Audio(), pickup:new Audio() };
  }
  play(name){ const s=this.sounds[name]; if(s) s.play().catch(()=>{}); }
}
