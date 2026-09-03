import { Renderer } from './renderer.js';
import { InputSystem } from './input.js';
import { GameController } from './game.js';

function boot() {
  const canvas=document.querySelector('#game');
  const renderer=new Renderer(canvas);
  renderer.resize();
  const ui={crystal:document.querySelector('#crystalHp'),mana:document.querySelector('#mana'),enemies:document.querySelector('#enemies'),status:document.querySelector('#statusText'),buildBtn:document.querySelector('#buildBtn'),overlay:document.querySelector('#overlay'),overlayTitle:document.querySelector('#overlayTitle'),overlayBody:document.querySelector('#overlayBody')};
  const input=new InputSystem(canvas,document.querySelector('#joystick'),document.querySelector('#stick'),document.querySelector('#attackBtn'));
  const game=new GameController(renderer,input,ui);
  let last=performance.now();
  function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;game.update(dt,now);renderer.draw(game);requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
  ui.buildBtn.addEventListener('click',()=>game.toggleBuild());
  const restart=()=>game.reset();
  document.querySelector('#restartBtn').addEventListener('click',restart);
  document.querySelector('#overlayRestart').addEventListener('click',restart);
  const resize=()=>{renderer.resize();game.onResize();};
  addEventListener('resize',resize);
  addEventListener('orientationchange',()=>setTimeout(resize,150));
  canvas.addEventListener('dblclick',e=>{e.preventDefault();input.attackQueued=true;});
}

const start=()=>requestAnimationFrame(()=>requestAnimationFrame(boot));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
