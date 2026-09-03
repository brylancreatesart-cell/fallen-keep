import { GAME } from './config.js';
import { dist, norm } from './utils.js';

export class Hero {
  constructor(x, y) { this.x=x; this.y=y; this.r=18; this.dir={x:1,y:0}; this.lastAttack=-9999; }
  update(dt, input, bounds) {
    const len = Math.hypot(input.x, input.y);
    if (len > .05) {
      const n = norm(input.x, input.y); this.dir=n;
      this.x += n.x * GAME.heroSpeed * dt; this.y += n.y * GAME.heroSpeed * dt;
    }
    this.x = Math.max(bounds.left, Math.min(bounds.right, this.x));
    this.y = Math.max(bounds.top, Math.min(bounds.bottom, this.y));
  }
}

export class Enemy {
  constructor(path) { this.path=path; this.pathIndex=1; this.x=path[0].x; this.y=path[0].y; this.hp=GAME.enemyHp; this.maxHp=GAME.enemyHp; this.r=15; this.dead=false; }
  update(dt) {
    if (this.dead || this.pathIndex >= this.path.length) return false;
    const target = this.path[this.pathIndex]; const dx=target.x-this.x, dy=target.y-this.y; const d=Math.hypot(dx,dy);
    if (d < GAME.enemySpeed * dt + 2) { this.x=target.x; this.y=target.y; this.pathIndex++; return this.pathIndex >= this.path.length; }
    this.x += dx/d * GAME.enemySpeed * dt; this.y += dy/d * GAME.enemySpeed * dt; return false;
  }
  damage(v) { this.hp -= v; if (this.hp <= 0) { this.hp=0; this.dead=true; } }
}

export class Tower {
  constructor(x,y) { this.x=x; this.y=y; this.r=18; this.lastFire=-9999; }
  findTarget(enemies) {
    let best=null, bestD=Infinity;
    for (const e of enemies) if (!e.dead) { const d=dist(this,e); if (d<GAME.towerRange && d<bestD) { best=e; bestD=d; } }
    return best;
  }
}

export class Projectile {
  constructor(x,y,target) { this.x=x; this.y=y; this.target=target; this.r=5; this.dead=false; }
  update(dt) {
    if (!this.target || this.target.dead) { this.dead=true; return; }
    const dx=this.target.x-this.x, dy=this.target.y-this.y; const d=Math.hypot(dx,dy);
    if (d < GAME.projectileSpeed*dt + this.target.r) { this.target.damage(GAME.towerDamage); this.dead=true; return true; }
    this.x += dx/d*GAME.projectileSpeed*dt; this.y += dy/d*GAME.projectileSpeed*dt; return false;
  }
}
