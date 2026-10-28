// Serve the repo locally, then run with Playwright installed externally.
// Optional: GAME_URL, PLAYWRIGHT_MODULE, CHROME_PATH, SCREENSHOT_PATH.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('fs');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
const page=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
if(process.env.BASELINE_SOURCE) await page.route('**/web_weavers.js?*',r=>r.fulfill({body:fs.readFileSync(process.env.BASELINE_SOURCE,'utf8'),contentType:'application/javascript'}));
await page.goto((process.env.GAME_URL || 'http://127.0.0.1:8765/web_weavers.html'));await page.waitForFunction(()=>typeof r15Ready!=='undefined'&&r15Ready);await page.click('#btnPlay');
const result=await page.evaluate(()=>{
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
 const releases=[];
 for(const velocity of [[58,0,0],[40,20,0],[35,-15,20]]){
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
 const b=buildingMeshes.find(b=>b.h>30);
 P.pos.set((b.minX+b.maxX)/2,10,b.maxZ+1);P.vel.set(0,0,0);yaw=0;pitch=0;cameraDistance=7.5;shiftLocked=false;
 cameraCollisionDistance=7.5;updateCamera(1/60);
 const focus=P.pos.clone().add(new THREE.Vector3(0,1.45,0));
 const offset=camera.position.clone().sub(focus);
 raycaster.set(focus,offset.clone().normalize());raycaster.far=offset.length();
 const cameraBlocked=raycaster.intersectObjects(nearbyBuildingMeshes(focus,10),false).length>0;
 raycaster.far=Infinity;
 return {releases,spot,chain,rates,cameraBlocked,rig:r15Ready};
});
if(process.env.SCREENSHOT_PATH) await page.screenshot({path:process.env.SCREENSHOT_PATH});
console.log(JSON.stringify({result,errors},null,2));await browser.close();
if(!process.env.BASELINE_SOURCE){
 assert.deepEqual(errors,[]);
 assert.ok(result.rig);
 for(const release of result.releases){assert.deepEqual(release.immediate,release.before);assert.deepEqual(release.afterClamp,release.before);}
 assert.ok(result.chain?.attached && result.chain.reattached,'rapid held reattachment');
 assert.equal(result.cameraBlocked,false,'camera stays in front of facade');
 for(const rate of result.rates.slice(1)){
  const delta=Math.hypot(...rate.pos.map((x,i)=>x-result.rates[0].pos[i]));
  assert.ok(delta<.05,`trajectory drift at ${rate.hz} Hz: ${delta}`);
 }
}
})().catch(e=>{console.error(e);process.exit(1)});
