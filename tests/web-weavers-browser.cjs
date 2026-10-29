// Serve the repo locally, then run with Playwright installed externally.
// Optional: GAME_URL, PLAYWRIGHT_MODULE, CHROME_PATH, SCREENSHOT_PATH.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('fs');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
const page=await browser.newPage({viewport:{width:Number(process.env.VIEWPORT_WIDTH)||1280,height:Number(process.env.VIEWPORT_HEIGHT)||800}});const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
if(process.env.BASELINE_SOURCE) await page.route('**/web_weavers.js?*',r=>r.fulfill({body:fs.readFileSync(process.env.BASELINE_SOURCE,'utf8'),contentType:'application/javascript'}));
await page.goto((process.env.GAME_URL || 'http://127.0.0.1:8765/web_weavers.html'));await page.waitForFunction(()=>typeof r15Ready!=='undefined'&&r15Ready);await page.click('#btnPlay');
const result=await page.evaluate(()=>{
 // Sustained real-city turns: check rendered hand-to-anchor lines, not only attachment rays.
 Object.keys(keys).forEach(k=>delete keys[k]);
 P.pos.set(-184,15,-250);P.vel.set(0,0,35);P.state='air';P.cooldowns.swing=0;P.activeSwingHand=null;yaw=0;pitch=.1;updateCamera(1);
 keys[bindings.forward]=true;keys[bindings.traversal]=true;lastTraversal=false;
 let blockedStrands=0,attachedFrames=0;
 for(let i=0;i<600;i++){
  if(i>180)yaw+=.006;
  keys[bindings.traversal]=i%120!==119;
  updatePlayer(1/60);updateCamera(1/60);player.updateMatrixWorld(true);
  if(P.state!=='swing'||!P.activeSwingHand)continue;
  attachedFrames++;
  const origin=visibleWebHandWorld(P.activeSwingHand,handL),anchor=P.swingWebs[P.activeSwingHand].anchor;
  const delta=anchor.clone().sub(origin),distance=delta.length();
  raycaster.set(origin,delta.normalize());raycaster.far=distance-.2;
  if(raycaster.intersectObjects(nearbyBuildingMeshes(origin,distance+2),false).length)blockedStrands++;
  raycaster.far=Infinity;
 }
 const rates=[];
 for(const hz of [30,60,120,144]){
   Object.keys(keys).forEach(k=>delete keys[k]);
   P.pos.set(0,500,-30);P.vel.set(0,0,28);P.state='air';P.cooldowns.swing=0;
   P.activeSwingHand=null;P.swingWebs.left.anchor=P.swingWebs.right.anchor=null;
   yaw=0;pitch=0;updateCamera(1);lastTraversal=true;keys[bindings.traversal]=true;
   trySwing('left','abSwingLeft',{point:new THREE.Vector3(18,550,0),length:61});
   P.traversalSwingStarted=true;
   for(let i=0;i<hz*3;i++)updatePlayer(1/hz);
   rates.push({hz,pos:P.pos.toArray(),vel:P.vel.toArray(),speed:P.vel.length()});
 }
 const armChecks=[];
 for(const hand of ['left','right']){
  P.pos.set(0,500,0);P.vel.set(0,4,28);P.state='air';P.activeSwingHand=null;P.cooldowns.swing=0;
  trySwing(hand,hand==='left'?'abSwingLeft':'abSwingRight',{point:new THREE.Vector3(hand==='left'?25:-25,550,20),length:60});
  for(let i=0;i<60;i++)animatePlayer(1/60,new THREE.Vector3());
  player.updateMatrixWorld(true);
  const shoulder=r15Bone(r15VisualBone[hand+'UpperArm']).getWorldPosition(new THREE.Vector3());
  const wrist=visibleWebHandWorld(hand,handL);
  armChecks.push(wrist.clone().sub(shoulder).normalize().dot(P.swingWebs[hand].anchor.clone().sub(shoulder).normalize()));
  releaseSwing();
 }
 const releases=[];
 for(const velocity of [[58,0,0],[40,20,0],[35,-15,20],[20,50,0],[0,58,0]]){
   P.state='swing';P.swingAssisted=true;P.vel.fromArray(velocity);P.activeSwingHand='left';
   releaseSwing();const immediate=P.vel.toArray();clampPlayerVelocity();releases.push({before:velocity,immediate,afterClamp:P.vel.toArray()});
 }
 // Find a real street with an available anchor, then exercise held/released inputs.
 let spot=null;
 for(let x=-250;x<250&&!spot;x+=25)for(let z=-250;z<250&&!spot;z+=25){
   if(heightAt(x,z,500)>1)continue;
   P.pos.set(x,0,z);P.vel.set(0,0,13);P.state='ground';yaw=0;updateCamera(1);
   const anchor=findAssistedSwingAnchor('left')||findAssistedSwingAnchor('right');if(anchor)spot={x,z,anchor:anchor.point.toArray()};
 }
 let chain=null;
 if(spot){
   P.cooldowns.swing=0;P.traversalSwingStarted=false;lastTraversal=false;keys[bindings.traversal]=true;
   updatePlayer(1/60);const attached=P.state==='swing';
   keys[bindings.traversal]=false;updatePlayer(1/60);
   keys[bindings.traversal]=true;
   for(let i=0;i<24;i++)updatePlayer(1/60);
   chain={attached,reattached:P.state==='swing',pos:P.pos.toArray(),vel:P.vel.toArray()};
   for(let i=0;i<180;i++)updatePlayer(1/60);
   updateCamera(1/60);player.updateMatrixWorld(true);
   if(P.activeSwingHand)setSwingRope(ropeLine,visibleWebHandWorld(P.activeSwingHand,handL),P.swingWebs[P.activeSwingHand].anchor);
   renderer.render(scene,camera);
 }
 const anchorChecks=[];
 for(const altitude of [0,60,180]){
  P.pos.set(-250,altitude,-250);P.vel.set(0,altitude? -20:0,25);P.state=altitude?'air':'ground';yaw=0;pitch=0;updateCamera(1);
  for(const hand of ['left','right']){
   const choice=findAssistedSwingAnchor(hand);if(!choice)continue;
   const eye=P.pos.clone().add(new THREE.Vector3(0,1.35,0)),to=choice.point.clone().sub(eye),distance=to.length();
   raycaster.set(eye,to.normalize());raycaster.far=distance+.2;
   const hit=raycaster.intersectObjects(nearbyBuildingMeshes(eye,distance+2),false)[0];raycaster.far=Infinity;
   anchorChecks.push({altitude,hand,error:hit?Math.abs(hit.distance-distance):null});
  }
 }
 const b=buildingMeshes.find(b=>b.h>50);
 P.pos.set((b.minX+b.maxX)/2,10,b.maxZ+10);P.vel.set(0,0,0);P.state='air';
 camera.position.copy(P.pos).add(new THREE.Vector3(0,1.35,0));
 camera.lookAt((b.minX+b.maxX)/2,35,b.maxZ);camera.updateMatrixWorld(true);
 const aimed=findLookSwingAnchor();
 const aimedOnWall=!!aimed && Math.abs(aimed.point.z-b.maxZ)<.1 && Math.abs(aimed.point.y-b.h)>1;
 P.pos.z=b.maxZ+40;camera.position.z=b.maxZ+40;camera.lookAt((b.minX+b.maxX)/2,16,b.maxZ);camera.updateMatrixWorld(true);
 const lowAimRejected=findLookSwingAnchor()===null;
 P.pos.z=b.maxZ+10;
 camera.position.copy(P.pos).add(new THREE.Vector3(0,1.35,0));camera.lookAt((b.minX+b.maxX)/2,35,b.maxZ);camera.updateMatrixWorld(true);

 Object.keys(keys).forEach(k=>delete keys[k]);lastTraversal=false;
 P.cooldowns.swing=0;P.activeSwingHand=null;
 trySwing('left','abSwingLeft',{point:new THREE.Vector3((b.minX+b.maxX)/2,b.h,b.maxZ),length:30});
 const zipStarted=tryZip();const zipState=P.state;
 const zipClearedSwing=P.activeSwingHand===null && !P.swingWebs.left.anchor && !P.swingWebs.right.anchor;
 for(let i=0;i<10;i++)updatePlayer(1/60);
 const zipMoved=P.pos.distanceTo(new THREE.Vector3((b.minX+b.maxX)/2,10,b.maxZ+10))>1;
 cancelZip();P.cooldowns.swing=0;
 const swingAfterZip=trySwing('right','abSwingRight',{point:new THREE.Vector3((b.minX+b.maxX)/2,b.h,b.maxZ),length:30});
 releaseSwing();
 P.pos.set((b.minX+b.maxX)/2,15,b.maxZ+PLAYER_RADIUS);
 beginTraversalWallRun(new THREE.Vector3(0,0,1),b,new THREE.Vector3(14,4,0));
 const wallBefore=P.pos.clone();
 updatePlayer(1/60);const wallRunning=P.state==='climb';
 const wallDisplacement=P.pos.clone().sub(wallBefore);
 const wallTravelVelocity=P.vel.clone();
 P.jumpChargeT=MAX_JUMP_CHARGE;launchChargedJump();
 const wallJump=P.state==='air' && P.vel.y>JUMP_SPEED && P.wallDetachT>0;
 const wallJumpCarriesSpeed=Math.abs(P.vel.x-wallTravelVelocity.x)<1e-8 && Math.abs(P.vel.x)>8;
 const wallVelocityMatchesMotion=Math.abs(wallDisplacement.x*60-wallTravelVelocity.x)<1e-6;
 // A wall jump must free a strand inherited from a previous swing.
 P.state='air';P.cooldowns.swing=0;P.activeSwingHand=null;
 trySwing('left','abSwingLeft',{point:new THREE.Vector3((b.minX+b.maxX)/2,b.h,b.maxZ),length:30});
 beginTraversalWallRun(new THREE.Vector3(0,0,1),b,new THREE.Vector3(14,4,0));
 P.traversalSwingStarted=true;
 P.jumpChargeT=0;launchChargedJump();
 const wallJumpClearsWeb=P.activeSwingHand===null && !P.swingWebs.left.anchor && !P.swingWebs.right.anchor && !P.traversalSwingStarted;
 P.cooldowns.swing=0;
 const swingAfterWallJump=trySwing('right','abSwingRight',{point:new THREE.Vector3((b.minX+b.maxX)/2,b.h,b.maxZ),length:30});
 releaseSwing();
 const wallContactChecks=[];
 for(const intentional of [false,true]){
  releaseSwing();Object.keys(keys).forEach(k=>delete keys[k]);
  P.pos.set((b.minX+b.maxX)/2,20,b.hitMaxZ+.65);P.vel.set(12,5,-20);P.state='air';P.cooldowns.swing=0;P.activeSwingHand=null;P.wallDetachT=0;yaw=Math.PI;pitch=0;updateCamera(1);
  trySwing('left','abSwingLeft',{point:new THREE.Vector3((b.minX+b.maxX)/2,b.h,b.maxZ+.03),length:100});
  keys[bindings.traversal]=true;lastTraversal=true;P.traversalSwingStarted=true;
  if(intentional)keys[bindings.forward]=true;
  let enteredWall=false;const contactStates=[];let entrySpeed=0;
  for(let i=0;i<60;i++){stepPlayer(1/120,1/120);contactStates.push(P.state);if(P.state==='climb'){enteredWall=true;entrySpeed=P.vel.length();break;}}
  const handFree=!P.activeSwingHand&&!P.swingWebs.left.anchor&&!P.swingWebs.right.anchor;
  let recaught=false;
  if(enteredWall){
   for(let i=0;i<12;i++)updatePlayer(1/60);
   P.jumpChargeT=.2;launchChargedJump();keys[bindings.forward]=false;
   for(let i=0;i<60;i++){updatePlayer(1/60);updateCamera(1/60);if(P.state==='swing'){recaught=true;break;}}
  }
  wallContactChecks.push({intentional,enteredWall,handFree,recaught,contactStates,entrySpeed});
 }
 releaseSwing();Object.keys(keys).forEach(k=>delete keys[k]);lastTraversal=false;
 const wallEntryChecks=[];
 for(const incoming of [new THREE.Vector3(0,18,-25),new THREE.Vector3(18,0,-25),new THREE.Vector3(-18,-8,-25)]){
  P.state='air';
  beginTraversalWallRun(new THREE.Vector3(0,0,1),b,incoming);
  const expected=new THREE.Vector3(incoming.x,incoming.y,0).normalize();
  const actual=new THREE.Vector3(-P.wallRunDirection.x,P.wallRunDirection.y,0);
  wallEntryChecks.push({alignment:actual.dot(expected),velocityAlignment:P.vel.clone().normalize().dot(expected),speed:P.vel.length()});
 }
 P.state='air';P.climbBuilding=null;P.climbNormal=null;
 const skinVelocity=P.vel.clone(),skinPosition=P.pos.clone();
 for(const skin of PLAYER_SKINS)applyPlayerSkin(skin.id);
 applyPlayerSkin(skinSave.selected);
 const cosmeticSkins=P.vel.equals(skinVelocity)&&P.pos.equals(skinPosition);
 const clone=cloneSkinnedAvatar(r15EnemyTemplate),sourceBones=new Set(Object.values(r15Bones));
 let independentSkeleton=true;
 clone.traverse(node=>{if(node.isSkinnedMesh && node.skeleton.bones.some(bone=>sourceBones.has(bone)))independentSkeleton=false;});


 P.pos.set((b.minX+b.maxX)/2,40,b.hitMaxZ+CLIMB_WALL_OFFSET);P.vel.set(0,6.2,0);P.state='climb';P.climbNormal=new THREE.Vector3(0,0,1);P.climbBuilding=b;P.wallRunAutoT=0;P.wallFlipT=0;P.climbVisualAngle=0;P.facing=Math.PI;player.rotation.y=P.facing;running=false;
 const crawlPosition=P.pos.clone(),crawlVelocity=P.vel.clone();let crawlJointClearance=Infinity;
 for(let i=0;i<120;i++){
  animatePlayer(1/60,new THREE.Vector3(0,0,-1));player.updateMatrixWorld(true);
  if(i<60)continue;
  for(const limb of ['leftHand','rightHand','leftFoot','rightFoot'])crawlJointClearance=Math.min(crawlJointClearance,r15Bone(r15VisualBone[limb]).getWorldPosition(new THREE.Vector3()).z-b.maxZ);
 }
 const crawlVisualOnly=P.pos.equals(crawlPosition)&&P.vel.equals(crawlVelocity);
 P.state='air';for(let i=0;i<60;i++)animatePlayer(1/60,new THREE.Vector3());
 const crawlOffsetCleared=Math.abs(playerRig.position.z)<.001;
 P.pos.set((b.minX+b.maxX)/2,10,b.maxZ+1);P.vel.set(0,0,0);yaw=0;pitch=0;cameraDistance=7.5;shiftLocked=false;
 cameraCollisionDistance=7.5;updateCamera(1/60);
 const focus=P.pos.clone().add(new THREE.Vector3(0,1.45,0));
 const offset=camera.position.clone().sub(focus);
 raycaster.set(focus,offset.clone().normalize());raycaster.far=offset.length();
 const cameraBlocked=raycaster.intersectObjects(nearbyBuildingMeshes(focus,10),false).length>0;
 raycaster.far=Infinity;
 const speedLineOverlay=document.getElementById('speedLines');
 const savedActive=gameActive,savedPaused=paused,savedVelocity=P.vel.clone();
 const speedLineCurve=[0,48,58,80,1e9,Number.NaN].map(speedLineIntensityForSpeed);
 gameActive=false;paused=false;P.vel.set(80,0,0);updateSpeedLines(1/60);
 const inactiveOpacity=Number(speedLineOverlay.style.getPropertyValue('--speed-line-opacity'));
 gameActive=true;paused=false;updateSpeedLines(1/60);
 const firstActiveOpacity=Number(speedLineOverlay.style.getPropertyValue('--speed-line-opacity'));
 updateSpeedLines(1/60);
 const secondActiveOpacity=Number(speedLineOverlay.style.getPropertyValue('--speed-line-opacity'));
 paused=true;updateSpeedLines(1/60);
 const pausedOpacity=Number(speedLineOverlay.style.getPropertyValue('--speed-line-opacity'));
 gameActive=savedActive;paused=savedPaused;P.vel.copy(savedVelocity);
 const speedLines={
   edges:speedLineOverlay.querySelectorAll('.speedEdge').length,
   streaks:speedLineOverlay.querySelectorAll('.speedStreak').length,
   curve:speedLineCurve,
   inactiveOpacity,firstActiveOpacity,secondActiveOpacity,pausedOpacity
 };
 return {blockedStrands,attachedFrames,releases,spot,chain,rates,cameraBlocked,anchorChecks,aimedOnWall,lowAimRejected,armChecks,zipStarted,zipState,zipMoved,zipClearedSwing,swingAfterZip,wallRunning,wallJump,wallJumpCarriesSpeed,wallVelocityMatchesMotion,wallJumpClearsWeb,swingAfterWallJump,wallContactChecks,wallEntryChecks,crawlJointClearance,crawlVisualOnly,crawlOffsetCleared,cosmeticSkins,independentSkeleton,speedLines,rig:r15Ready};
});
if(process.env.SCREENSHOT_PATH){
 await page.evaluate(()=>{
  gameActive=true;paused=false;P.vel.set(80,0,0);
  for(let i=0;i<30;i++)updateSpeedLines(1/60);
 });
 await page.screenshot({path:process.env.SCREENSHOT_PATH});
}
console.log(JSON.stringify({result,errors},null,2));await browser.close();
if(!process.env.BASELINE_SOURCE){
 assert.deepEqual(errors,[]);
 assert.ok(result.rig);
 assert.equal(result.blockedStrands,0,'sustained turns never render a strand through a building');
 assert.ok(result.attachedFrames>200,'obstruction recovery maintains useful swinging time');
 assert.ok(result.zipStarted && result.zipState==='zip' && result.zipMoved,'zip starts and moves');
 assert.ok(result.zipClearedSwing && result.swingAfterZip,'swing to zip to swing clears old strand');
 assert.ok(result.wallRunning && result.wallJump,'wall run to charged jump');
 assert.ok(result.wallJumpCarriesSpeed && result.wallVelocityMatchesMotion,'wall velocity represents motion and survives a jump');
 assert.ok(result.wallJumpClearsWeb && result.swingAfterWallJump,'swing to wall to jump frees the hand for another catch');
 assert.ok(!result.wallContactChecks[0].enteredWall,'glancing swing contact does not force a wall run');
 assert.ok(result.wallContactChecks[1].enteredWall && result.wallContactChecks[1].handFree && result.wallContactChecks[1].recaught && result.wallContactChecks[1].entrySpeed>5 && !result.wallContactChecks[1].contactStates.includes('air'),'intentional swing-wall-jump-held catch completes');
 for(const entry of result.wallEntryChecks)assert.ok(entry.alignment>.999 && entry.velocityAlignment>.999 && entry.speed>=11,'wall-run entry follows incoming wall-tangent motion');
 assert.ok(result.crawlJointClearance>0 && result.crawlVisualOnly && result.crawlOffsetCleared,'crawl joints stay outside the wall without changing physics or retaining an airborne offset');
 assert.ok(result.cosmeticSkins && result.independentSkeleton,'cosmetic skins and independent avatar bones');
 assert.equal(result.speedLines.edges,4,'speed lines cover all four viewport edges');
 assert.ok(result.speedLines.streaks>=24 && result.speedLines.streaks<=48,'speed lines use a fixed, modest streak count');
 assert.deepEqual(result.speedLines.curve.slice(0,2),[0,0],'speed lines stay off through speed 48');
 assert.ok(result.speedLines.curve[2]>0 && result.speedLines.curve[3]>result.speedLines.curve[2],'speed lines fade in at 58 and strengthen above it');
 assert.equal(result.speedLines.curve[4],1,'speed-line intensity stays capped at extreme speed');
 assert.equal(result.speedLines.curve[5],0,'invalid speed cannot show the overlay');
 assert.equal(result.speedLines.inactiveOpacity,0,'speed lines stay hidden before gameplay');
 assert.ok(result.speedLines.firstActiveOpacity>0 && result.speedLines.secondActiveOpacity>result.speedLines.firstActiveOpacity && result.speedLines.secondActiveOpacity<1,'active speed lines ramp smoothly instead of flashing on');
 assert.equal(result.speedLines.pausedOpacity,0,'speed lines disappear while paused');
 for(const alignment of result.armChecks) assert.ok(alignment>.98,'both R15 shoulders reach toward their web');
 for(const release of result.releases){assert.deepEqual(release.immediate,release.before);assert.deepEqual(release.afterClamp,release.before);}
 assert.ok(result.chain?.attached && result.chain.reattached,'rapid held reattachment');
 assert.equal(result.cameraBlocked,false,'camera stays in front of facade');
 assert.ok(result.aimedOnWall,'aimed wall hit stays on the wall');
 assert.ok(result.lowAimRejected,'nearly horizontal aimed web defers to assisted targeting');
 assert.ok(result.anchorChecks.length>=3,'street and falling anchors available');
 for(const anchor of result.anchorChecks) assert.ok(anchor.error!==null && anchor.error<.2,'anchor touches first visible surface');
 for(const rate of result.rates.slice(1)){
  const delta=Math.hypot(...rate.pos.map((x,i)=>x-result.rates[0].pos[i]));
  assert.ok(delta<.05,`trajectory drift at ${rate.hz} Hz: ${delta}`);
 }
}
})().catch(e=>{console.error(e);process.exit(1)});
