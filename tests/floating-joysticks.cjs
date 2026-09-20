const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=require('path').resolve(__dirname,'..');
function element(size=116){return {style:{},handlers:{},addEventListener(n,f){(this.handlers[n]??=[]).push(f)},setPointerCapture(){},getBoundingClientRect(){return {left:parseFloat(this.style.left)||0,top:parseFloat(this.style.top)||0,width:size,height:size}},classList:{toggle(){}}};}
const elems={},canvas=element(),context={canvas,innerWidth:800,document:{getElementById(id){return elems[id]??=element()}},window:element(),state:{playing:true,paused:false},keys:{},yaw:0,pitch:0,mouseSensitivity:.0025,menuSubtitle:{},btnStart:{},startScreen:{style:{}}};vm.createContext(context);
let source=fs.readFileSync(root+'/pac-man-3d.html','utf8');vm.runInContext(source.slice(source.indexOf('const touchControls ='),source.indexOf('const mouseBase =')),context);
const evt=(id,x,y)=>({pointerId:id,clientX:x,clientY:y,pointerType:'touch',preventDefault(){}});
function fire(type,e){for(const fn of canvas.handlers[type]||[])fn(e);}
fire('pointerdown',evt(1,200,300));assert.equal(elems.moveStick.style.left,'142px');assert.equal(vm.runInContext('touchMove.x',context),0);
fire('pointermove',evt(1,236,300));assert.equal(vm.runInContext('touchMove.x',context),1);
fire('pointerdown',evt(2,600,300));fire('pointermove',evt(2,640,300));assert(context.yaw<0);assert.equal(vm.runInContext('touchMove.x',context),1);
fire('pointerup',evt(2,640,300));assert.equal(vm.runInContext('touchMove.x',context),1);
fire('pointercancel',evt(1,236,300));assert.equal(vm.runInContext('touchMove.x',context),0);assert.equal(elems.moveStick.style.opacity,'');
fire('pointerdown',evt(3,100,400));assert.equal(elems.moveStick.style.left,'42px');
source=fs.readFileSync(root+'/multiplayer.html','utf8');const park={innerWidth:800,homeOpen:false,isMenuOpen:false,playing:true,moveTouchId:null,joystickMove:element(120),knobMove:element(),inputs:{}};vm.createContext(park);vm.runInContext(source.slice(source.indexOf('        function handleMoveStart'),source.indexOf('        // Look Controls (Touch)')),park);
const touch=(id,x,y)=>({changedTouches:[{identifier:id,clientX:x,clientY:y,target:{closest(){return null}}}],preventDefault(){}});
park.handleMoveStart(touch(1,190,250));assert.equal(park.joystickMove.style.left,'130px');assert.equal(park.inputs.mobileMoveX,0);
park.handleMoveDrag(touch(1,250,250));assert.equal(park.inputs.mobileMoveX,1);
park.handleMoveEnd(touch(2,600,250));assert.equal(park.inputs.mobileMoveX,1);
park.handleMoveEnd(touch(1,250,250));assert.equal(park.inputs.mobileMoveX,0);assert.equal(park.joystickMove.style.opacity,'');
console.log('PASS floating centres, neutral touchdown, movement, simultaneous look, independent release, cancellation and recentering');
