// Drop for 1.5 seconds, then use the normal smart-swing selector.
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
 const trials=[];
 for(const altitude of [180,260,350])for(const heading of [0,Math.PI]){
  releaseSwing();Object.keys(keys).forEach(k=>delete keys[k]);lastTraversal=false;
  P.pos.set(-184,altitude,-250);P.vel.set(0,0,Math.cos(heading)*25);P.state='air';P.cooldowns.swing=0;P.activeSwingHand=null;yaw=heading;pitch=0;updateCamera(1);
  for(let i=0;i<90;i++){updatePlayer(1/60);updateCamera(1/60);}
  const before=P.vel.toArray(),catchPosition=P.pos.toArray();
  const attached=trySmartSwing();
  if(!attached){trials.push({altitude,heading,before,catchPosition,attached:false});continue;}
  const anchor=P.swingWebs[P.activeSwingHand].anchor.toArray();lastTraversal=true;keys[bindings.traversal]=true;P.traversalSwingStarted=true;
  const samples=[];
  for(let i=0;i<180;i++){
   const old=P.vel.clone();updatePlayer(1/60);updateCamera(1/60);
   if(i%15===0 || old.length()-P.vel.length()>5)samples.push({frame:i,state:P.state,position:P.pos.toArray(),velocity:P.vel.toArray(),speed:P.vel.length(),lost:old.length()-P.vel.length()});
  }
  trials.push({altitude,heading,before,catchPosition,anchor,samples});
 }
 return trials;
});

console.log(JSON.stringify({result,errors},null,2));await browser.close();
if(!process.env.BASELINE_SOURCE){
 const assert=require('node:assert/strict');assert.deepEqual(errors,[]);
 for(const trial of result){
  assert.ok(trial.samples?.length,'high fall finds a usable anchor');
  const incoming=Math.hypot(...trial.before);
  assert.ok(trial.samples[0].speed>=incoming*.9,'assisted catch retains high-drop momentum');
  for(const sample of trial.samples)assert.ok(Number.isFinite(sample.speed),'trajectory remains finite');
 }
}
})().catch(e=>{console.error(e);process.exit(1)});
