(function(){
"use strict";
const {register,node,button,highScore}=window.Arcade;
function canvas(root,w,h,cls){const c=node("canvas",{class:"game-canvas"+(cls?" "+cls:""),width:String(w),height:String(h),"aria-label":"Game playfield"});root.append(c);return c}
register("pong",function(root){
const bar=node("div",{class:"toolbar"}),leftScore=node("span",{class:"stat"}),rightScore=node("span",{class:"stat"}),msg=node("p",{class:"message",role:"status"}),mode=node("select",{"aria-label":"Game mode"}),startBtn=button("Start game",start);
mode.append(node("option",{value:"cpu"},"Vs computer"),node("option",{value:"two"},"Two players (same keyboard)"));bar.append(mode,startBtn,leftScore,rightScore);root.append(bar);const c=canvas(root,700,460),ctx=c.getContext("2d");root.append(msg);
const W=c.width,H=c.height,paddleH=85,paddleW=12;
let p1=H/2,p2=H/2,ball={x:W/2,y:H/2,vx:4,vy:2},a=0,b=0,active=false,request=0,last=0,keys={},pointer=null;
function serve(dir){ball={x:W/2,y:H/2,vx:dir*(4+Math.random()),vy:(Math.random()*3+1)*(Math.random()<.5?-1:1)};p1=H/2;p2=H/2}
function start(){a=0;b=0;serve(Math.random()<.5?-1:1);active=true;last=0;msg.textContent="First to 7 wins. Left: W/S. Right: ↑/↓ (or AI).";startBtn.textContent="Restart";updateScores()}
function updateScores(){leftScore.textContent="Player 1: "+a;rightScore.textContent=(mode.value==="cpu"?"Computer: ":"Player 2: ")+b}
function tick(dt){if(!active)return;const speed=6.4*dt;if(keys.KeyW)p1-=speed;if(keys.KeyS)p1+=speed;if(mode.value==="two"){if(keys.ArrowUp)p2-=speed;if(keys.ArrowDown)p2+=speed}else{p2+=Math.max(-3.8*dt,Math.min(3.8*dt,ball.y-p2))}if(pointer!==null)p1+=(pointer-p1)*Math.min(1,.25*dt);p1=Math.max(paddleH/2,Math.min(H-paddleH/2,p1));p2=Math.max(paddleH/2,Math.min(H-paddleH/2,p2));ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.y<9){ball.y=9;ball.vy=Math.abs(ball.vy)}if(ball.y>H-9){ball.y=H-9;ball.vy=-Math.abs(ball.vy)}
if(ball.vx<0&&ball.x<35&&ball.x>20&&Math.abs(ball.y-p1)<paddleH/2+8){ball.x=35;ball.vx=Math.min(10,Math.abs(ball.vx)*1.07);ball.vy+=(ball.y-p1)/27}
if(ball.vx>0&&ball.x>W-35&&ball.x<W-20&&Math.abs(ball.y-p2)<paddleH/2+8){ball.x=W-35;ball.vx=-Math.min(10,Math.abs(ball.vx)*1.07);ball.vy+=(ball.y-p2)/27}
if(ball.x<0||ball.x>W){if(ball.x<0)b++;else a++;updateScores();if(Math.max(a,b)>=7){active=false;msg.textContent=(a>b?"Player 1":mode.value==="cpu"?"Computer":"Player 2")+" wins!";if(a>b)window.RodSpaceAccounts?.recordWin("pong");return}serve(ball.x<0?1:-1)}}
function draw(){
ctx.fillStyle="#08091c";ctx.fillRect(0,0,W,H);
ctx.fillStyle="#1e2147";for(let x=0;x<W;x+=42)ctx.fillRect(x,0,1,H);for(let y=0;y<H;y+=42)ctx.fillRect(0,y,W,1);
ctx.fillStyle="#4c2e76";ctx.fillRect(0,0,W,4);ctx.fillRect(0,H-4,W,4);
ctx.fillStyle="#6d4ba2";for(let y=9;y<H;y+=32)ctx.fillRect(W/2-2,y,4,15);
ctx.fillStyle="#68ddff";ctx.fillRect(20,p1-paddleH/2,paddleW,paddleH);
ctx.fillStyle="#ff7fdf";ctx.fillRect(W-32,p2-paddleH/2,paddleW,paddleH);
ctx.fillStyle="#f8fafc";ctx.beginPath();ctx.arc(ball.x,ball.y,9,0,Math.PI*2);ctx.fill()
}
function loop(t){const dt=Math.min(2.5,(t-(last||t))/16.67);last=t;if(!document.hidden)tick(dt);draw();request=requestAnimationFrame(loop)}
document.addEventListener("keydown",e=>{if(["KeyW","KeyS","ArrowUp","ArrowDown"].includes(e.code)){e.preventDefault();keys[e.code]=true}});document.addEventListener("keyup",e=>{keys[e.code]=false});
c.addEventListener("pointermove",e=>{if(e.pointerType==="mouse"&&e.buttons===0&&mode.value==="two")return;const rect=c.getBoundingClientRect();pointer=(e.clientY-rect.top)*H/rect.height});c.addEventListener("pointerdown",e=>{const rect=c.getBoundingClientRect();pointer=(e.clientY-rect.top)*H/rect.height;c.setPointerCapture(e.pointerId)});c.addEventListener("pointerup",()=>{pointer=null});mode.onchange=()=>{active=false;updateScores();msg.textContent="Press Start game to play.";};updateScores();msg.textContent="Press Start game to play.";request=requestAnimationFrame(loop);
});
register("snake",function(root){
const W=600,H=480,cell=15,C=W/cell,R=H/cell,colors=["#5eead4","#f472b6","#fbbf24","#a78bfa"],bar=node("div",{class:"toolbar"}),scoreEl=node("span",{class:"stat"}),bestEl=node("span",{class:"stat"}),status=node("p",{class:"message",role:"status"}),startBtn=button("Start / Restart",restart),pad=node("div",{class:"direction-pad"});
bar.append(startBtn,scoreEl,bestEl);root.append(bar);const c=canvas(root,W,H),ctx=c.getContext("2d");root.append(status,pad);
let snakes=[],food=[],running=false,points=0,timer=0,headings=[[1,0],[-1,0],[0,1],[0,-1]],queued=[1,0],touchStart=null;
function randomPos(){return{x:Math.floor(Math.random()*C),y:Math.floor(Math.random()*R)}}
function occupied(p){return snakes.some(s=>s.body.some(q=>q.x===p.x&&q.y===p.y))||food.some(q=>q.x===p.x&&q.y===p.y)}
function addFood(){for(let t=0;t<300;t++){const f=randomPos();if(!occupied(f)){food.push(f);return}}}
function makeSnake(x,y,dir,index){const body=[];for(let i=0;i<5;i++)body.push({x:x-dir[0]*i,y:y-dir[1]*i});return{body,dir:[...dir],index,alive:true}}
function restart(){clearInterval(timer);snakes=[makeSnake(6,6,[1,0],0),makeSnake(C-7,8,[-1,0],1),makeSnake(6,R-7,[1,0],2),makeSnake(C-7,R-7,[-1,0],3)];food=[];points=0;queued=[1,0];for(let i=0;i<30;i++)addFood();running=true;status.textContent="Swipe the board or use arrow keys / WASD to steer. Avoid bodies and walls.";renderStats();timer=setInterval(step,110)}
function setDir(dx,dy){if(!running)return;if(queued[0]+dx===0&&queued[1]+dy===0)return;queued=[dx,dy]}
function closestFood(p){return food.reduce((best,f)=>!best||Math.abs(f.x-p.x)+Math.abs(f.y-p.y)<Math.abs(best.x-p.x)+Math.abs(best.y-p.y)?f:best,null)}
function blocked(p){return p.x<0||p.x>=C||p.y<0||p.y>=R||snakes.some(s=>s.body.slice(0,-1).some(q=>q.x===p.x&&q.y===p.y))}
function botDirection(s){const head=s.body[0],foodTarget=closestFood(head);const choices=headings.filter(d=>!(d[0]===-s.dir[0]&&d[1]===-s.dir[1])).filter(d=>!blocked({x:head.x+d[0],y:head.y+d[1]}));if(!choices.length)return s.dir;choices.sort((a,b)=>{const aa=foodTarget?Math.abs(head.x+a[0]-foodTarget.x)+Math.abs(head.y+a[1]-foodTarget.y):0,bb=foodTarget?Math.abs(head.x+b[0]-foodTarget.x)+Math.abs(head.y+b[1]-foodTarget.y):0;return aa-bb});return Math.random()<.82?choices[0]:choices[Math.floor(Math.random()*choices.length)]}
function step(){if(!running)return;snakes.forEach((s,idx)=>{if(!s.alive)return;const dir=idx===0?queued:botDirection(s);if(!(dir[0]===-s.dir[0]&&dir[1]===-s.dir[1]))s.dir=[...dir];const h=s.body[0],next={x:h.x+s.dir[0],y:h.y+s.dir[1]};if(blocked(next)){s.alive=false;if(idx===0){running=false;clearInterval(timer);status.textContent="Game over. Final score: "+points+". Press Restart.";highScore("snake.best",points)}return}const hit=food.findIndex(f=>f.x===next.x&&f.y===next.y);s.body.unshift(next);if(hit<0)s.body.pop();else{food.splice(hit,1);addFood();if(idx===0)points+=10}});if(running){for(let i=1;i<snakes.length;i++)if(!snakes[i].alive)snakes[i]=makeSnake(...(i%2?[C-7,8]:[6,R-7]),i%2?[-1,0]:[1,0],i)}renderStats();draw()}
function renderStats(){scoreEl.textContent="Score "+points;bestEl.textContent="Best "+highScore("snake.best",points)}
function draw(){
ctx.fillStyle="#04160d";ctx.fillRect(0,0,W,H);
ctx.fillStyle="#12321e";for(let x=0;x<W;x+=cell)ctx.fillRect(x,0,1,H);for(let y=0;y<H;y+=cell)ctx.fillRect(0,y,W,1);
ctx.fillStyle="#ffa63e";
food.forEach(f=>{ctx.beginPath();ctx.arc(f.x*cell+cell/2,f.y*cell+cell/2,5.6,0,Math.PI*2);ctx.fill()});
snakes.forEach(s=>{if(!s.alive)return;ctx.fillStyle=colors[s.index];
s.body.forEach((seg,i)=>{ctx.globalAlpha=i===0?1:Math.max(.42,1-i*.027);ctx.fillRect(seg.x*cell+1,seg.y*cell+1,cell-2,cell-2)});
ctx.globalAlpha=1;const h=s.body[0];ctx.fillStyle="#0b2315";
ctx.beginPath();ctx.arc(h.x*cell+5,h.y*cell+5,1.8,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(h.x*cell+10,h.y*cell+5,1.8,0,Math.PI*2);ctx.fill()
})
}
document.addEventListener("keydown",e=>{const map={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]};if(map[e.code]){e.preventDefault();setDir(...map[e.code])}});
[["↑",0,-1],["←",-1,0],["↓",0,1],["→",1,0]].forEach(([symbol,dx,dy])=>pad.append(button(symbol,()=>setDir(dx,dy),"secondary")));
c.addEventListener("pointermove",e=>{if(!running||e.pointerType==="mouse"&&e.buttons===0)return;const r=c.getBoundingClientRect(),head=snakes[0].body[0],dx=(e.clientX-r.left)*W/r.width-head.x*cell,dy=(e.clientY-r.top)*H/r.height-head.y*cell;if(Math.abs(dx)>Math.abs(dy))setDir(Math.sign(dx),0);else setDir(0,Math.sign(dy))});
c.addEventListener("touchstart",e=>{touchStart=[e.touches[0].clientX,e.touches[0].clientY]},{passive:true});c.addEventListener("touchend",e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart[0],dy=e.changedTouches[0].clientY-touchStart[1];if(Math.max(Math.abs(dx),Math.abs(dy))>15)if(Math.abs(dx)>Math.abs(dy))setDir(Math.sign(dx),0);else setDir(0,Math.sign(dy));touchStart=null},{passive:true});
status.textContent="Single-player arena with computer-controlled snakes. Online rooms planned.";draw();
});
})();
