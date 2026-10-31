// Backrooms systems shared by Levels 0, 1, 2, 7 and 10.
// Each entry creates a fresh run seed; chunk results remain stable as the player returns.
(function(){
'use strict';
const runParams=new URLSearchParams(location.search);
const forced=runParams.has('seed')?Number(runParams.get('seed'))>>>0:null;
let rootSeed=forced===null?((Date.now() ^ (Math.random()*0xffffffff))>>>0):forced;
let activeLevel=0;
function hash(x,z,salt=0){
 let n=(Math.imul(x|0,374761393)^Math.imul(z|0,668265263)^
        Math.imul((salt|0)+activeLevel,2246822519)^rootSeed)>>>0;
 n=Math.imul(n^(n>>>13),1274126177)>>>0;
 return ((n^(n>>>16))>>>0)/4294967296;
}
function mod(n,d){return ((n%d)+d)%d}
function seedFor(level){
 activeLevel=level;
 // Consistent within one page/run; a fresh reload creates an independent layout.
 return rootSeed;
}
// A guaranteed connected 2-cell-wide cross corridor every 11 cells, with
// 6 fundamentally different floor plans in each 9x9 interior module.
// Decisions are based on global cell coordinates, never chunk-local ones.
function cell(gx,gz,level=0){
 const ax=mod(gx,11),az=mod(gz,11);
 if(gx>=2&&gx<=3&&gz>=2&&gz<=3)return {wall:false,style:0,feature:'start'};
 const mx=Math.floor(gx/11),mz=Math.floor(gz/11);
 const style=Math.floor(hash(mx,mz,level*67+12)*6);
 if(ax<=1||az<=1)return {wall:false,style,feature:'main-corridor'};
 const h=hash(gx,gz,level*13+5);
 let wall=false;
 switch(style){
  case 0: // grand open rooms with structural support columns
   wall=(ax===4||ax===8)&&(az===4||az===8) || (ax===6&&az===6);
   break;
  case 1: // rows of office cubicles, with offset doorways
   wall=(ax===4||ax===6||ax===8)&&az!==4+Math.floor(hash(mx,mz,42)*4);
   break;
  case 2: // parallel storage bays with varying cross-aisle positions
   wall=(az===4||az===6||az===8)&&ax!==3+Math.floor(hash(mx,mz,43)*5);
   break;
  case 3: // crooked corridors with open ends
   wall=(ax===4&&az>=3&&az<=9&&az!==7)||(ax===7&&az>=3&&az<=9&&az!==4)||(az===6&&ax>=5&&ax<=9&&ax!==8);
   break;
  case 4: // broken/eroded room partitions
   wall=(h>.54) || (ax===5&&az>=4&&az<=9&&az!==7);
   break;
  default: // quiet maze; alternating walls with accessible door gaps
   wall=(az===4&&ax!==4&&ax!==8)||(az===8&&ax!==6)||(ax===7&&az>=5&&az<8);
   break;
 }
 // Preserve a 2-cell ring of cross-connecting routes around every module.
 if(ax===2||ax===10||az===2||az===10)wall=false;
 return {wall,style,feature:style===0?'atrium':style===1?'offices':
    style===2?'storage':style===3?'service passages':
    style===4?'damaged rooms':'maze'};
}
// Small varied objects give each type of region a recognizable silhouette.
// They never become invisible colliders.
const propMaterials={};
function addProp(group,x,z,level,roll){
 const t=Math.floor(roll*7)%7;
 const mat=propMaterials[level]||(propMaterials[level]=new THREE.MeshLambertMaterial({
   color:level===0?0x817251:0x596268
 }));
 const dark=propMaterials['dark']||(propMaterials['dark']=new THREE.MeshLambertMaterial({color:0x343d3c}));
 const insert=(geo,material,px,py,pz)=>{
   const mesh=new THREE.Mesh(geo,material);
   mesh.position.set(px,py,pz);group.add(mesh);return mesh;
 };
 if(t===0||t===1){
   // abandoned desk / pallet
   insert(new THREE.BoxGeometry(1.9,.14,.85),mat,x,.74,z);
   for(const dx of [-.76,.76])for(const dz of [-.31,.31])
     insert(new THREE.BoxGeometry(.12,.68,.13),dark,x+dx,.35,z+dz);
 }else if(t===2){
   // filing cabinets with uneven heights
   const a=insert(new THREE.BoxGeometry(.7,1.5,.58),mat,x,.75,z);
   a.rotation.y=roll*2;
   insert(new THREE.BoxGeometry(.68,.035,.62),dark,x,1.51,z);
 }else if(t===3){
   // old freestanding partition
   const mesh=insert(new THREE.BoxGeometry(2.2,2.15,.11),mat,x,1.08,z);
   mesh.rotation.y=roll*3;
 }else if(t===4){
   // broken furniture with irregular orientation
   const mesh=insert(new THREE.BoxGeometry(1.18,.19,.64),mat,x,.39,z);
   mesh.rotation.z=.24;mesh.rotation.y=roll*5;
 }else if(t===5){
   // tubular ventilation column
   insert(new THREE.CylinderGeometry(.16,.16,3.7,8),dark,x,1.9,z);
   insert(new THREE.BoxGeometry(.8,.17,.8),mat,x,3.74,z);
 }else{
   // ceiling fixture, with a modest light not an expensive point light
   const emissive=propMaterials['emissive']||(propMaterials['emissive']=
     new THREE.MeshBasicMaterial({color:level===0?0xffe5a1:0xc4ebfd}));
   insert(new THREE.BoxGeometry(1.7,.05,.56),emissive,x,3.95,z);
 }
}
function roomType(cx,cz,level){return ['atrium','office maze','storerooms','crooked corridors','broken rooms','labyrinth'][Math.floor(hash(cx,cz,level*59+9)*6)]}
function markRun(level){
 seedFor(level);
 document.documentElement.dataset.brLevel=String(level);
 const label=['THE YELLOW ROOMS','HABITABLE ZONE','PIPE DREAMS',null,null,null,null,'THALASSOPHOBIA',null,null,'ENDLESS FIELDS'][level]||'THE BACKROOMS';
 let hud=document.getElementById('br-objective');
 if(!hud){
  hud=document.createElement('div');hud.id='br-objective';
  document.body.appendChild(hud);
  const lower=document.createElement('div');lower.id='br-lower';
  lower.innerHTML='<span id="br-zone"></span><span id="br-state">WASD MOVE · SHIFT SPRINT · C CROUCH · F LIGHT</span>';
  document.body.appendChild(lower);
  const alert=document.createElement('div');alert.id='br-threat';alert.setAttribute('aria-live','polite');
  document.body.appendChild(alert);
 }
 const descriptions={
  0:'Explore unfamiliar rooms · find the marked exit',
  1:'Follow the service passages · avoid the Hound',
  2:'Navigate the shifting pipes · reach the service gate',
  7:'Explore the flooded chambers · locate the hatch',
  10:'Find the black barn door · do not follow the scarecrow'
 };
 hud.innerHTML='<span class="br-chapter">LEVEL '+level+' / '+label+'</span>'+
  '<strong>'+descriptions[level]+'</strong>';
 const runText=String(rootSeed>>>0).padStart(10,'0');
 document.getElementById('br-zone').textContent='RUN '+runText+' · NEW LAYOUT';
 if(level===10)document.getElementById('br-state').textContent='WASD MOVE · SHIFT RUN · E INTERACT';
 if(level===2)document.getElementById('br-state').textContent='WASD MOVE · C CROUCH · E INTERACT';
 if(level===7)document.getElementById('br-state').textContent='WASD MOVE · E INTERACT';
}
function status(text){
 const el=document.getElementById('br-threat');
 if(!el)return;
 el.textContent=text;
 el.classList.toggle('visible',!!text);
}
function updateZone(pos,level,visited=0){
 const el=document.getElementById('br-zone');
 if(!el||!pos)return;
 const nx=Math.floor(pos.x/40),nz=Math.floor(pos.z/40);
 const style=roomType(nx,nz,level);
 el.textContent='RUN '+rootSeed+' · '+style.toUpperCase()+' · '+nx+','+nz;
 if((level===0||level===1) && visited>0){
   const elapsed=typeof window.brGameElapsed==='number'?window.brGameElapsed:0;
   const pending=Math.max(0,95-elapsed);
   document.getElementById('br-state').textContent=
     'EXPLORED '+Math.min(16,visited)+'/16 SECTORS'+
     (pending>0?' · SIGNAL IN '+Math.ceil(pending)+'S':' · FIND THE OPEN DOOR')+
     ' · C CROUCH · F LIGHT';
 }
}
// Per-chunk geometry is disposable; shared materials and textures stay alive.
function disposeChunk(group){
 group.traverse(node=>{
   if(node.geometry&&node.geometry.dispose)node.geometry.dispose();
   // The floor's per-chunk tinted material is unique; all other mats are shared.
   if(node.userData?.uniqueMaterial&&node.material?.dispose)node.material.dispose();
 });
}
function createEntityVisual(level){
 const g=new THREE.Group();
 const shade={0:0x1b1b17,1:0x2c3035,2:0x4f3025,7:0x142f3c,10:0x383421}[level]||0x222222;
 const skin=new THREE.MeshStandardMaterial({color:shade,roughness:.97});
 const eyes=new THREE.MeshBasicMaterial({color:level===7?0x6af5ff:level===2?0xffad35:0xffdf81});
 const add=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m};
 if(level===0){ // Surveyor: tall, stationary when observed
  add(new THREE.CylinderGeometry(.22,.36,3.1,5),skin,0,1.65,0);
  add(new THREE.SphereGeometry(.32,8,6),skin,0,3.22,0);
  add(new THREE.SphereGeometry(.075,6,4),eyes,-.14,3.26,.25);
  add(new THREE.SphereGeometry(.075,6,4),eyes,.14,3.26,.25);
 } else if(level===1){ // The Hound: low, four-legged, attracted to noise
  add(new THREE.BoxGeometry(1,.65,1.8),skin,0,.8,0);
  for(const x of [-.4,.4])for(const z of [-.57,.57])
    add(new THREE.BoxGeometry(.19,.8,.2),skin,x,.4,z);
  add(new THREE.BoxGeometry(.65,.45,.75),skin,0,1.02,.95);
  add(new THREE.SphereGeometry(.10,6,5),eyes,-.22,1.15,1.3);
  add(new THREE.SphereGeometry(.10,6,5),eyes,.22,1.15,1.3);
 } else if(level===2){ // Pipe Crawler: rusted many-legged thing
  add(new THREE.CylinderGeometry(.32,.25,1.8,8),skin,0,.85,0).rotation.x=Math.PI/2;
  for(let i=0;i<8;i++){const z=(i-3.5)*.22;
    add(new THREE.BoxGeometry(.9,.09,.12),skin,0,.48,z);}
  add(new THREE.SphereGeometry(.10,6,5),eyes,-.18,.8,.85);
  add(new THREE.SphereGeometry(.10,6,5),eyes,.18,.8,.85);
 } else if(level===7){ // Drowned: waterlogged figure that surfaces
  add(new THREE.BoxGeometry(.8,2.1,.45),skin,0,.7,0);
  add(new THREE.SphereGeometry(.36,9,7),skin,0,2.0,0);
  add(new THREE.SphereGeometry(.08,6,5),eyes,-.13,2,.31);
  add(new THREE.SphereGeometry(.08,6,5),eyes,.13,2,.31);
 } else { // Field Mimic: a moving scarecrow
  add(new THREE.CylinderGeometry(.15,.23,3.0,5),skin,0,1.6,0);
  add(new THREE.BoxGeometry(2.2,.2,.2),skin,0,2.55,0);
  add(new THREE.SphereGeometry(.32,7,5),skin,0,3.15,0);
  add(new THREE.ConeGeometry(.74,.36,8),skin,0,3.50,0);
  add(new THREE.SphereGeometry(.08,6,4),eyes,-.13,3.18,.25);
  add(new THREE.SphereGeometry(.08,6,4),eyes,.13,3.18,.25);
 }
 return g;
}
function director(scene,camera,level,onDamage,blocked=null){
 const names={0:'THE SURVEYOR',1:'THE HOUND',2:'PIPE CRAWLER',7:'THE DROWNED',10:'FIELD MIMIC'};
 const g=createEntityVisual(level);g.visible=false;scene.add(g);
 let time=0,phase=0,age=0,cooldown=18,threat=false;
 const sight=new THREE.Vector3(),tmp=new THREE.Vector3();
 function spawn(){
  const a=hash(Math.floor(time),Math.floor(camera.position.z),73)*Math.PI*2;
  const distance=level===10?40:level===2?16:level===7?24:19;
  for(let attempt=0;attempt<20;attempt++){
    const angle=a+attempt*Math.PI*2/19;
    g.position.set(camera.position.x+Math.cos(angle)*distance,
      level===7?-.7:0,camera.position.z+Math.sin(angle)*distance);
    if(level===2)g.position.x=camera.position.x+(hash(Math.floor(time),0,3)-.5)*1.5;
    if(!blocked||!blocked(g.position))break;
  }
  g.visible=true;threat=true;age=0;
  status('SIGNAL DETECTED · '+names[level]);
 }
 function update(dt,noise=0,crouched=false){
  dt=Math.min(.09,Math.max(0,dt));time+=dt;
  if(!g.visible){cooldown-=dt;if(cooldown<=0)spawn();return;}
  age+=dt;
  tmp.copy(camera.position).sub(g.position);tmp.y=0;
  const dist=tmp.length();
  if(dist>0.01)tmp.multiplyScalar(1/dist);
  const look=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
  look.y=0;look.normalize();
  const visibleToPlayer=look.dot(tmp.clone().negate())>.83&&dist<18;
  let speed=1.4;
  if(level===0){speed=visibleToPlayer?.05:2.1;g.position.y=Math.sin(time*1.6)*.15;}
  if(level===1){speed=crouched?1.4:noise>0.6?4.0:2.45;}
  if(level===2){speed=3.8+Math.sin(time*6)*.8;}
  if(level===7){speed=2.1;g.position.y=-.8+Math.sin(time*3)*.38;}
  if(level===10){speed=noise>0.3?3.1:1.65;}
  const step=tmp.clone().multiplyScalar(speed*dt);
  const target=g.position.clone().add(step);
  if(!blocked||!blocked(target))g.position.copy(target);
  else{
    const onlyX=g.position.clone();onlyX.x+=step.x;
    const onlyZ=g.position.clone();onlyZ.z+=step.z;
    if(!blocked(onlyX))g.position.x=onlyX.x;
    if(!blocked(onlyZ))g.position.z=onlyZ.z;
  }
  g.rotation.y=Math.atan2(tmp.x,tmp.z);
  if(level===1)g.rotation.z=Math.sin(time*12)*.035;
  if(level===2)g.rotation.x=Math.sin(time*8)*.07;
  if(dist<1.6){
    if(typeof onDamage==='function')onDamage(level===7?24:level===2?20:16);
    status('CONTACT · '+names[level]);
    g.visible=false;threat=false;cooldown=22+hash(Math.floor(time),level,5)*22;
  }else if(age>(level===0?22:level===10?33:28)){
    g.visible=false;threat=false;cooldown=18+hash(Math.floor(time),level,3)*15;status('');
  } else if(!threat){status('');}
 }
 return {entity:g,update,spawn,level,name:names[level]};
}
window.BackroomsUpgrade={seedFor,hash,cell,roomType,addProp,disposeChunk,markRun,status,updateZone,director,get seed(){return rootSeed},setSeed(n){rootSeed=n>>>0}};
})();
