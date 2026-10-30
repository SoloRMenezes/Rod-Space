// Real city anchor matrix: low-altitude recovery at two speeds and four headings.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('fs');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
const page=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
if(process.env.BASELINE_SOURCE) await page.route('**/web_weavers.js?*',r=>r.fulfill({body:fs.readFileSync(process.env.BASELINE_SOURCE,'utf8'),contentType:'application/javascript'}));
await page.goto(process.env.GAME_URL || 'http://127.0.0.1:8765/web_weavers.html');await page.waitForFunction(()=>typeof r15Ready!=='undefined'&&r15Ready);await page.click('#btnPlay');
const result=await page.evaluate(()=>{
 const cases=[];
 for(const altitude of [0,8,20])for(const speed of [15,40])for(const direction of [0,Math.PI/2,Math.PI,-Math.PI/2]){
  releaseSwing();Object.keys(keys).forEach(k=>delete keys[k]);
  P.pos.set(-184,altitude,-250);P.vel.set(Math.sin(direction)*speed,altitude?-8:0,Math.cos(direction)*speed);P.state=altitude?'air':'ground';P.cooldowns.swing=0;P.activeSwingHand=null;yaw=direction;pitch=0;cameraCollisionDistance=null;updateCamera(1);
  const chosen=findAssistedSwingAnchor('left')||findAssistedSwingAnchor('right');
  if(!chosen){cases.push({altitude,speed,direction,attached:false});continue;}
  const anchor=chosen.point.toArray(),initialDistance=P.pos.distanceTo(chosen.point);
  const attached=trySwing('left','abSwingLeft',chosen);
  lastTraversal=true;keys[bindings.traversal]=true;P.traversalSwingStarted=attached;
  let groundFrames=0,swingFrames=0,minClearance=Infinity,maxSpeed=0;
  for(let i=0;i<180;i++){
   updatePlayer(1/60);maxSpeed=Math.max(maxSpeed,P.vel.length());
   if(P.state==='swing'){
    swingFrames++;const clearance=P.pos.y-heightAt(P.pos.x,P.pos.z,P.pos.y+2);
    minClearance=Math.min(minClearance,clearance);if(clearance<=2.801)groundFrames++;
   }
  }
  cases.push({altitude,speed,direction,anchor,initialDistance,chosenLength:chosen.length,attached,swingFrames,groundFrames,minClearance,maxSpeed});
 }
 return cases;
});

console.log(JSON.stringify({result,errors},null,2));await browser.close();
if(!process.env.BASELINE_SOURCE){
 const assert=require('node:assert/strict');
 assert.deepEqual(errors,[]);
 assert.equal(result.length,24);
 for(const trial of result){
  assert.ok(trial.attached && trial.swingFrames>150,'real city anchors support sustained swinging');
  assert.ok(trial.groundFrames<=3,'low swings recover instead of skimming the floor');
  assert.ok(Number.isFinite(trial.maxSpeed) && trial.maxSpeed<=60.01,'recovery respects the traversal speed limit');
 }
}
})().catch(e=>{console.error(e);process.exit(1)});
