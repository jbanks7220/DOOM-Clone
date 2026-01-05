export class Physics {
  static canMoveTo(x,y,map){ if(y<0||y>=map.length||x<0||x>=map[0].length) return false; return map[Math.floor(y)][Math.floor(x)]===0; }
  static distance(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }
  static angleBetween(a,b){ return Math.atan2(b.y-a.y,b.x-a.x); }
}
