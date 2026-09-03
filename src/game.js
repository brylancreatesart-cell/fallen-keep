import { GAME } from './config.js';
import { Hero, Enemy, Tower, Projectile } from './entities.js';
import { dist } from './utils.js';

export class GameController {
  constructor(renderer,input,ui){this.renderer=renderer;this.input=input;this.ui=ui;this.lastW=renderer.w;this.lastH=renderer.h;this.reset();}
  reset(){const w=this.renderer.w,h=this.renderer.h;this.lastW=w;this.lastH=h;this.path=this.makePath(w,h);this.crystal={x:w*.84,y:h*.53,hp:GAME.crystalHp};this.hero=new Hero(w*.68,h*.68);this.buildSpots=this.makeSpots(w,h);this.towers=[];this.enemies=[];this.projectiles=[];this.mana=GAME.mana;this.spawned=0;this.spawnTimer=0;this.finished=false;this.buildMode=false;this.ui.overlay.classList.add('hidden');this.ui.buildBtn.classList.remove('active');this.setStatus('Defend the crystal');this.syncUi();}
  makePath(w,h){return [{x:-30,y:h*.48},{x:w*.18,y:h*.48},{x:w*.38,y:h*.37},{x:w*.57,y:h*.55},{x:w*.72,y:h*.53},{x:w*.84,y:h*.53}];}
  makeSpots(w,h){return [{x:w*.24,y:h*.31},{x:w*.34,y:h*.61},{x:w*.49,y:h*.29},{x:w*.57,y:h*.73}].map(p=>({...p,built:false}));}
  onResize(){const oldW=this.lastW||this.renderer.w,oldH=this.lastH||this.renderer.h,w=this.renderer.w,h=this.renderer.h;if(!oldW||!oldH||!w||!h){this.lastW=w;this.lastH=h;return;}const sx=w/oldW,sy=h/oldH;for(const obj of [this.hero,this.crystal,...this.enemies,...this.towers,...this.projectiles,...this.buildSpots]){obj.x*=sx;obj.y*=sy;}this.path=this.path.map(p=>({x:p.x*sx,y:p.y*sy}));for(const e of this.enemies)e.path=this.path;this.lastW=w;this.lastH=h;}
  toggleBuild(){if(this.finished)return;this.buildMode=!this.buildMode;this.ui.buildBtn.classList.toggle('active',this.buildMode);this.setStatus(this.buildMode?'Tap a glowing rune to build':'Defend the crystal');}
  tryBuild(x,y){if(!this.buildMode||this.mana<GAME.towerCost)return false;let spot=null,best=Infinity;for(const s of this.buildSpots)if(!s.built){const d=Math.hypot(x-s.x,y-s.y);if(d<42&&d<best){spot=s;best=d;}}if(!spot)return false;spot.built=true;this.towers.push(new Tower(spot.x,spot.y));this.mana-=GAME.towerCost;this.buildMode=false;this.ui.buildBtn.classList.remove('active');this.renderer.impact(spot.x,spot.y,'#79e8ff');this.setStatus('Archer ward constructed');this.syncUi();return true;}
  attack(now){if(this.finished||now-this.hero.lastAttack<GAME.heroAttackCooldown)return;this.hero.lastAttack=now;let target=null,best=Infinity;for(const e of this.enemies)if(!e.dead){const d=dist(this.hero,e);if(d<GAME.heroAttackRange&&d<best){best=d;target=e;}}if(target){target.damage(GAME.heroAttackDamage);this.renderer.impact(target.x,target.y,'#ffe7b0');if(target.dead)this.onEnemyKilled(target);}else{this.renderer.impact(this.hero.x+this.hero.dir.x*30,this.hero.y+this.hero.dir.y*30,'#e6f7ff');}}
  onEnemyKilled(e){this.mana=Math.min(999,this.mana+7);this.renderer.impact(e.x,e.y,'#9bdc72');this.syncUi();}
  update(dt,now){if(this.finished)return;const bounds={left:24,right:this.renderer.w-24,top:86,bottom:this.renderer.h-24};this.hero.update(dt,this.input.movement(),bounds);if(this.input.consumeAttack())this.attack(now);if(this.buildMode&&this.input.pointerDown){this.tryBuild(this.input.pointer.x,this.input.pointer.y);this.input.pointerDown=false;}
    this.spawnTimer+=dt*1000;if(this.spawned<GAME.waveEnemies&&this.spawnTimer>=GAME.spawnInterval){this.spawnTimer=0;this.spawned++;this.enemies.push(new Enemy(this.path));this.setStatus(`Enemy ${this.spawned} of ${GAME.waveEnemies} entered the keep`);}
    for(const e of this.enemies){const reached=e.update(dt);if(reached&&!e.dead){e.dead=true;this.crystal.hp=Math.max(0,this.crystal.hp-GAME.enemyCrystalDamage);this.renderer.shake=9;this.renderer.flash=.9;this.setStatus('The crystal is under attack!');this.syncUi();if(this.crystal.hp<=0)return this.end(false);}}
    for(const t of this.towers){if(now-t.lastFire>=GAME.towerFireRate){const target=t.findTarget(this.enemies);if(target){t.lastFire=now;this.projectiles.push(new Projectile(t.x,t.y-18,target));}}}
    for(const p of this.projectiles){const hit=p.update(dt);if(hit&&p.target.dead)this.onEnemyKilled(p.target);}
    this.projectiles=this.projectiles.filter(p=>!p.dead);this.enemies=this.enemies.filter(e=>!e.dead);
    if(this.spawned>=GAME.waveEnemies&&this.enemies.length===0)this.end(true);this.renderer.updateFx(dt);this.syncUi();}
  end(win){if(this.finished)return;this.finished=true;this.ui.overlayTitle.textContent=win?'Victory':'The Keep Has Fallen';this.ui.overlayBody.textContent=win?'The crystal still stands. Milestone 1 complete.':'The crystal was shattered. Rebuild the defense and try again.';this.ui.overlay.classList.remove('hidden');this.setStatus(win?'Victory':'Defeat');}
  setStatus(text){this.ui.status.textContent=text;}
  syncUi(){this.ui.crystal.textContent=Math.ceil(this.crystal.hp);this.ui.mana.textContent=Math.floor(this.mana);this.ui.enemies.textContent=this.enemies.filter(e=>!e.dead).length;this.ui.buildBtn.disabled=this.mana<GAME.towerCost||this.finished;}
}
