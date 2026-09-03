export class InputSystem {
  constructor(canvas, joystick, stick, attackBtn) {
    this.keys = new Set(); this.joy={x:0,y:0}; this.attackQueued=false; this.pointer={x:0,y:0}; this.pointerDown=false;
    addEventListener('keydown', e => { this.keys.add(e.key.toLowerCase()); if (e.code==='Space') this.attackQueued=true; });
    addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    attackBtn.addEventListener('pointerdown', e => { e.preventDefault(); this.attackQueued=true; });
    const center = () => { const r=joystick.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,max:r.width*.34}; };
    const moveJoy = e => { const c=center(); let dx=e.clientX-c.x,dy=e.clientY-c.y; const d=Math.hypot(dx,dy)||1; const mag=Math.min(1,d/c.max); this.joy={x:dx/d*mag,y:dy/d*mag}; stick.style.transform=`translate(${this.joy.x*c.max}px,${this.joy.y*c.max}px)`; };
    joystick.addEventListener('pointerdown', e=>{joystick.setPointerCapture(e.pointerId);moveJoy(e);});
    joystick.addEventListener('pointermove', e=>{if(joystick.hasPointerCapture(e.pointerId))moveJoy(e);});
    const resetJoy=()=>{this.joy={x:0,y:0};stick.style.transform='translate(0,0)';};
    joystick.addEventListener('pointerup', resetJoy); joystick.addEventListener('pointercancel', resetJoy);
    canvas.addEventListener('pointermove', e=>{const r=canvas.getBoundingClientRect();this.pointer={x:e.clientX-r.left,y:e.clientY-r.top};});
    canvas.addEventListener('pointerdown', e=>{this.pointerDown=true;const r=canvas.getBoundingClientRect();this.pointer={x:e.clientX-r.left,y:e.clientY-r.top};});
    canvas.addEventListener('pointerup', ()=>this.pointerDown=false);
  }
  movement() {
    let x=this.joy.x,y=this.joy.y; if(this.keys.has('a')||this.keys.has('arrowleft'))x-=1; if(this.keys.has('d')||this.keys.has('arrowright'))x+=1; if(this.keys.has('w')||this.keys.has('arrowup'))y-=1; if(this.keys.has('s')||this.keys.has('arrowdown'))y+=1; return {x,y};
  }
  consumeAttack(){ const v=this.attackQueued; this.attackQueued=false; return v; }
}
