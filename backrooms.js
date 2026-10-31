let camera, scene, renderer, clock, audioCtx;
        let keys = { w: false, a: false, s: false, d: false, e: false, shift: false };
        let velocity = new THREE.Vector3();
        let pitch = 0, yaw = 0;
        let sanity = 100;
        let stamina = 100;
        let startTime = Date.now();
        let gameActive = false;
        let brDirector=null;
        let crouching=false;

        let glitchTimer = 0;
        let isGlitching = false;
        let glitchIntensity = 0;

        // Level Mechanics
        let exitSpawned = false;

        // Entity Logic
        let entity = null;
        let entityChasing = false;
        let entityTimer = 0;
        let lastScreech = 0;

        const CHUNK_SIZE = 36;
        const RENDER_DISTANCE = 1;
        const CELL_SIZE = 6;
        const chunks = new Map();

        let wallMat, floorMat, ceilMat, drawingMat;
        let stepCounter = 0, stateTime = 0;

        function init() {
            scene = new THREE.Scene();
            BackroomsUpgrade.markRun(0);
            yaw=(BackroomsUpgrade.hash(0,0,31)-.5)*Math.PI*2;
            scene.background = new THREE.Color(0x1a1a00);
            scene.fog = new THREE.FogExp2(0x1a1a00, 0.052);

            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
            camera.position.set(0, 1.7, 0);

            renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.5));
            document.body.appendChild(renderer.domElement);

            clock = new THREE.Clock();

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.41);
            scene.add(ambientLight);

            const pointLight = new THREE.PointLight(0xffffcc, 1.25, 23);
            camera.add(pointLight);
            scene.add(camera);

            floorMat = new THREE.MeshLambertMaterial({ map: createFloorTexture() });
            ceilMat = new THREE.MeshLambertMaterial({ map: createCeilingTexture() });
            wallMat = new THREE.MeshLambertMaterial({ map: createCrackedWallTexture() });
            drawingMat = createDrawingMaterial();

            updateProceduralWorld();
            brDirector=BackroomsUpgrade.director(scene,camera,0,damage=>{
              sanity=Math.max(0,sanity-damage);
              showMessage('CONTACT · SANITY -'+damage);
            },checkCollision);
            setupControls();
            window.addEventListener('resize', onWindowResize, false);
            animate();
        }

        function playScreech() {
            if (!audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(900, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 1.2);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 1.2);
        }

        function createDrawingMaterial() {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0,0,256,256);
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(50, 50); ctx.lineTo(50, 150);
            ctx.moveTo(80, 50); ctx.lineTo(80, 150);
            ctx.moveTo(110, 50); ctx.lineTo(110, 150);
            ctx.moveTo(140, 50); ctx.lineTo(140, 150);
            ctx.moveTo(40, 100); ctx.lineTo(150, 80);
            ctx.stroke();
            const tex = new THREE.CanvasTexture(canvas);
            return new THREE.MeshBasicMaterial({ map: tex, transparent: true, polygonOffset: true, polygonOffsetFactor: -1 });
        }

        function createCrackedWallTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 512; canvas.height = 512;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#d4c08e';
            ctx.fillRect(0, 0, 512, 512);
            ctx.strokeStyle = '#c0ad78';
            ctx.lineWidth = 1;
            for(let i=0; i<512; i+=40) {
                ctx.beginPath();
                ctx.moveTo(i, 0); ctx.lineTo(i, 512);
                ctx.stroke();
            }
            for(let i=0; i<5; i++) {
                ctx.fillStyle = `rgba(100, 80, 40, ${Math.random()*0.2})`;
                ctx.beginPath();
                ctx.arc(Math.random()*512, Math.random()*512, Math.random()*100, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.strokeStyle = 'rgba(40, 30, 10, 0.6)';
            ctx.lineWidth = 1.5;
            for(let i=0; i<2; i++) {
                let x = Math.random() * 512;
                let y = Math.random() * 512;
                ctx.beginPath();
                ctx.moveTo(x, y);
                for(let j=0; j<8; j++) {
                    x += (Math.random() - 0.5) * 60;
                    y += Math.random() * 60;
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            return texture;
        }

        function createCeilingTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#e0e0e0'; ctx.fillRect(0, 0, 256, 256);
            ctx.strokeStyle = '#bbb'; ctx.lineWidth = 4;
            ctx.strokeRect(5, 5, 246, 246);
            ctx.fillStyle = '#ffffdd'; ctx.fillRect(80, 80, 96, 96);
            return new THREE.CanvasTexture(canvas);
        }

        function createFloorTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#7d6b4a'; ctx.fillRect(0, 0, 256, 256);
            for(let i=0; i<1000; i++) {
                ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.1})`;
                ctx.fillRect(Math.random()*256, Math.random()*256, 2, 2);
            }
            return new THREE.CanvasTexture(canvas);
        }

        function spawnEntity() {
            if (entity) return;
            const group = new THREE.Group();
            const bodyGeo = new THREE.CylinderGeometry(0.03, 0.03, 4);
            const bodyMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            group.add(body);
            for(let i=0; i<4; i++) {
                const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 3), bodyMat);
                limb.position.y = 1;
                limb.rotation.z = (Math.random() - 0.5) * 2;
                limb.rotation.x = (Math.random() - 0.5) * 2;
                group.add(limb);
            }
            const eyeGeo = new THREE.SphereGeometry(0.04);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
            eyeL.position.set(-0.1, 1.8, 0.1);
            const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
            eyeR.position.set(0.1, 1.8, 0.1);
            group.add(eyeL, eyeR);
            group.userData.limbs=group.children.slice(1,5);
            const angle = Math.random() * Math.PI * 2;
            const dist = 18;
            group.position.set(camera.position.x + Math.cos(angle) * dist, 1.75, camera.position.z + Math.sin(angle) * dist);
            // Never materialise inside a wall; rotate the spawn around the player
            // until a valid point in the existing procedural layout is found.
            for(let tries=0;tries<12 && checkCollision(group.position);tries++){
                const retry=angle+(tries+1)*Math.PI/6;
                group.position.set(camera.position.x+Math.cos(retry)*dist,1.75,camera.position.z+Math.sin(retry)*dist);
            }
            scene.add(group);
            entity = group;
            entityChasing = true;
            entityTimer = 10;
            document.getElementById('entity-status').style.display = 'block';
            playScreech();
            showMessage("IT'S HERE");
        }

        function spawnDecor(group, x, z) {
            const roll = Math.random();
            if (roll > 0.95) {
                const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), drawingMat);
                plane.position.set(x, 2, z);
                plane.rotation.y = Math.random() * Math.PI * 2;
                group.add(plane);
            } else if (roll > 0.90) {
                const chair = new THREE.Group();
                const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.7), wallMat);
                seat.position.y = 0.4;
                chair.add(seat);
                chair.position.set(x, 0, z);
                group.add(chair);
            }
        }

        function spawnExit(group, x, z) {
            const exitGroup = new THREE.Group();
            const frame = new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 16, 32), new THREE.MeshBasicMaterial({ color: 0x000000 }));
            exitGroup.add(frame);
            const portal = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.8 }));
            exitGroup.add(portal);
            const light = new THREE.PointLight(0xffff00, 2, 5);
            exitGroup.add(light);

            exitGroup.position.set(x, 1.7, z);
            exitGroup.rotation.y = Math.random() * Math.PI;
            exitGroup.name = "EXIT_PORTAL";
            group.add(exitGroup);
            exitSpawned = true;
            showMessage("THE WAY OUT IS OPEN");
        }

        const visitedChunks=new Set();
        const collectedBottles=new Set();
        function generateChunk(cx,cz){
          const key=cx+','+cz;
          if(chunks.has(key))return;
          visitedChunks.add(key);
          const group=new THREE.Group();
          group.position.set(cx*CHUNK_SIZE,0,cz*CHUNK_SIZE);
          const floor=new THREE.Mesh(new THREE.PlaneGeometry(CHUNK_SIZE,CHUNK_SIZE),floorMat);
          floor.rotation.x=-Math.PI/2;group.add(floor);
          const ceiling=new THREE.Mesh(new THREE.PlaneGeometry(CHUNK_SIZE,CHUNK_SIZE),ceilMat);
          ceiling.rotation.x=Math.PI/2;ceiling.position.y=4;group.add(ceiling);
          const cells=CHUNK_SIZE/CELL_SIZE,blocks=[];
          for(let x=0;x<cells;x++)for(let z=0;z<cells;z++){
            const gx=cx*cells+x,gz=cz*cells+z;
            const posX=(x+.5)*CELL_SIZE-CHUNK_SIZE/2;
            const posZ=(z+.5)*CELL_SIZE-CHUNK_SIZE/2;
            const worldX=cx*CHUNK_SIZE+posX,worldZ=cz*CHUNK_SIZE+posZ;
            if(Math.abs(worldX)<8&&Math.abs(worldZ)<8)continue;
            const tile=BackroomsUpgrade.cell(gx,gz,0);
            if(tile.wall)blocks.push([posX,posZ]);
            else{
              const pick=BackroomsUpgrade.hash(gx,gz,0*17+17);
              const eligibleExit=gameActive&&!exitSpawned&&
                (Date.now()-startTime)>95000&&visitedChunks.size>=16&&
                Math.abs(cx)+Math.abs(cz)>1;
              if(eligibleExit&&tile.feature==='main-corridor'&&pick<.44){
                spawnExit(group,posX,posZ);
              }else if(pick<.025 && !collectedBottles.has(gx+','+gz)){
                spawnAlmondWater(group,posX,posZ,gx+','+gz);
              }else if(pick>.935&&pick<.989){
                BackroomsUpgrade.addProp(group,posX,posZ,0,pick);
              }
            }
          }
          const walls=new THREE.InstancedMesh(
            new THREE.BoxGeometry(CELL_SIZE,4,CELL_SIZE),wallMat,blocks.length);
          const dummy=new THREE.Object3D();
          blocks.forEach(([x,z],i)=>{
            dummy.position.set(x,2,z);dummy.updateMatrix();
            walls.setMatrixAt(i,dummy.matrix);
          });
          walls.instanceMatrix.needsUpdate=true;
          walls.frustumCulled=false;
          group.add(walls);
          group.userData.region=BackroomsUpgrade.roomType(cx,cz,0);
          const tileVariant=Math.floor(BackroomsUpgrade.hash(cx,cz,54)*4);
          const palette=[0xffffe2,0xe2dcc4,0xe9e4c3,0xbec6ae];
          floor.material=floorMat.clone();
          floor.userData.uniqueMaterial=true;
          floor.material.color.setHex(palette[tileVariant]);
          const lightBox=new THREE.Mesh(
            new THREE.BoxGeometry(1.65,.09,.55),
            new THREE.MeshBasicMaterial({color:0xffedba}));
          lightBox.position.set(0,3.95,0);group.add(lightBox);
          if(BackroomsUpgrade.hash(cx,cz,79)>.82){
            const lamp=new THREE.PointLight(0xffe9b0,.58,14);
            lamp.position.set(0,3.65,0);group.add(lamp);
          }
          scene.add(group);chunks.set(key,group);
        }

        function spawnAlmondWater(group, x, z, pickupId) {
            const bottleGroup = new THREE.Group();
            const bottle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.4),
                new THREE.MeshPhongMaterial({ color: 0x88ffff, emissive: 0x00ffff, emissiveIntensity: 0.3 })
            );
            bottleGroup.add(bottle);
            bottleGroup.position.set(x, 0.2, z);
            bottleGroup.name = "ALMOND_WATER";
            bottleGroup.userData.pickupId=pickupId;
            group.add(bottleGroup);
        }

        function updateProceduralWorld() {
            const pX = Math.floor(camera.position.x / CHUNK_SIZE);
            const pZ = Math.floor(camera.position.z / CHUNK_SIZE);
            for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
                for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
                    generateChunk(pX + x, pZ + z);
                }
            }
            for (const [key, chunk] of chunks) {
                const [cx, cz] = key.split(',').map(Number);
                if (Math.abs(cx - pX) > RENDER_DISTANCE + 1 || Math.abs(cz - pZ) > RENDER_DISTANCE + 1) {
                    BackroomsUpgrade.disposeChunk(chunk);
                    scene.remove(chunk);
                    chunks.delete(key);
                }
            }
        }

        function setupControls() {
            const inst=document.getElementById('instructions');
            const startBtn=document.getElementById('start-btn');
            let everLocked=false,dragLook=false,lastX=0,lastY=0;
            const launch=()=>{
              // Pointer lock is optional in the macOS app. Starting the game
              // must not depend on whether WebKit grants pointer capture.
              startTime=Date.now();
              gameActive=true;
              inst.style.display='none';
              if(typeof audioCtx!=='undefined'&&!audioCtx){
                try{audioCtx=new (window.AudioContext||window.webkitAudioContext)();}
                catch(err){console.warn('Audio unavailable:',err.message);}
              }
              try{
                const target=renderer?.domElement||document.body;
                const request=target.requestPointerLock?.();
                if(request&&typeof request.catch==='function')
                  request.catch(()=>{console.info('Mouse: drag-to-look fallback enabled');});
              }catch(err){console.info('Pointer lock unavailable: using drag-to-look');}
            };
            startBtn.addEventListener('click',launch);
            document.addEventListener('pointerlockchange',()=>{
              const locked=!!document.pointerLockElement;
              if(locked){everLocked=true;inst.style.display='none';gameActive=true;}
              else if(everLocked&&gameActive){
                gameActive=false;
                inst.style.display='flex';
                Object.keys(keys).forEach(k=>keys[k]=false);
              }
            });
            document.addEventListener('mousedown',e=>{
              if(gameActive&&!document.pointerLockElement&&e.button===0){
                dragLook=true;lastX=e.clientX;lastY=e.clientY;
              }
            });
            document.addEventListener('mouseup',()=>{dragLook=false;});
            document.addEventListener('mousemove',e=>{
              if(!gameActive||document.pointerLockElement||!dragLook)return;
              yaw-=(e.clientX-lastX)*.003;
              pitch=Math.max(-Math.PI/2.3,Math.min(Math.PI/2.3,pitch-(e.clientY-lastY)*.003));
              lastX=e.clientX;lastY=e.clientY;
            });
            document.addEventListener('keydown',e=>{
              if(e.code==='Escape'&&gameActive&&!document.pointerLockElement){
                gameActive=false;inst.style.display='flex';dragLook=false;
              }
            });
            document.addEventListener('mousemove', (e) => {
                if (gameActive && document.pointerLockElement) {
                    yaw -= e.movementX * 0.0025;
                    pitch -= e.movementY * 0.0025;
                    pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch));
                }
            });
            document.addEventListener('keydown', (e) => {
                const key=e.key.toLowerCase();
                if(key==='c'&&!e.repeat)crouching=!crouching;
                if(key==='f'&&!e.repeat&&camera.children[0])
                  camera.children[0].visible=!camera.children[0].visible;
                if(keys.hasOwnProperty(key))keys[key]=true;
            });
            document.addEventListener('keyup', (e) => {
                const key = e.key.toLowerCase();
                if (keys.hasOwnProperty(key)) keys[key] = false;
            });
            window.addEventListener('blur',()=>Object.keys(keys).forEach(key=>keys[key]=false));
        }

        function handleInteractions() {
            const prompt = document.getElementById('interaction-prompt');
            prompt.style.display = 'none';
            let minDist = 2.5;
            chunks.forEach(chunk => {
                chunk.children.forEach(child => {
                    if (child.name === "ALMOND_WATER" || child.name === "EXIT_PORTAL") {
                        const worldPos = new THREE.Vector3();
                        child.getWorldPosition(worldPos);
                        const dist = camera.position.distanceTo(worldPos);
                        if (dist < minDist) {
                            if (child.name === "ALMOND_WATER") {
                                prompt.innerText = "PRESS [E] TO TAKE ALMOND WATER";
                                prompt.style.display = 'block';
                                if (keys.e) {
                                    sanity = Math.min(100, sanity + 35);
                                    collectedBottles.add(child.userData.pickupId);
                            chunk.remove(child);
                                    showMessage("DRANK ALMOND WATER");
                                    keys.e = false;
                                }
                            } else if (child.name === "EXIT_PORTAL") {
                                prompt.innerText = "NO-CLIP TO EXIT";
                                prompt.style.display = 'block';
                                // Teleport if close enough
                                if (dist < 1.2) {
                                    winGame();
                                }
                            }
                        }
                    }
                });
            });
        }

        function winGame() {
            if (!gameActive) return;
            gameActive = false;

            const fade = document.getElementById('fade-out');
            fade.style.opacity = '1';

            if (audioCtx) {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(40, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 2);
                gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 2);
            }

            // Perform the redirection after the fade
            setTimeout(() => {
                window.location.href = "./backrooms-level1.html";
            }, 2000);
        }

        function showMessage(txt) {
            const msg = document.getElementById('message');
            msg.innerText = txt; msg.style.opacity = '1';
            setTimeout(() => { msg.style.opacity = '0'; }, 3000);
        }

        function checkCollision(pos){
          const radius=.42;
          const center=n=>Math.floor((n+CHUNK_SIZE/2)/CELL_SIZE);
          const gx=center(pos.x),gz=center(pos.z);
          for(let x=gx-1;x<=gx+1;x++)for(let z=gz-1;z<=gz+1;z++){
            const tile=BackroomsUpgrade.cell(x,z,0);
            if(!tile.wall)continue;
            const wx=x*CELL_SIZE-CHUNK_SIZE/2+CELL_SIZE/2;
            const wz=z*CELL_SIZE-CHUNK_SIZE/2+CELL_SIZE/2;
            if(Math.abs(pos.x-wx)<CELL_SIZE/2+radius &&
               Math.abs(pos.z-wz)<CELL_SIZE/2+radius)return true;
          }
          return false;
        }

        function moveWithCollision(object, displacement) {
            const nextX=object.position.clone();nextX.x+=displacement.x;
            if(!checkCollision(nextX))object.position.x=nextX.x;
            const nextZ=object.position.clone();nextZ.z+=displacement.z;
            if(!checkCollision(nextZ))object.position.z=nextZ.z;
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function handleGlitches(delta) {
            const overlay = document.getElementById('glitch-overlay');
            if (!isGlitching) {
                const chance = 0.001 + (1 - (sanity / 100)) * 0.03;
                if (Math.random() < chance) {
                    isGlitching = true;
                    glitchTimer = 0.2;
                    glitchIntensity = 0.1;
                    document.body.classList.add('glitch-active');
                    overlay.style.display = 'block';
                }
            } else {
                glitchTimer -= delta;
                if (glitchTimer <= 0) {
                    isGlitching = false;
                    document.body.classList.remove('glitch-active');
                    overlay.style.display = 'none';
                }
            }
        }

        function handleEntity(delta) {
            if (sanity < 30 && !entityChasing && Math.random() < delta*0.09) {
                spawnEntity();
            }
            if (entity && entityChasing) {
                entityTimer -= delta;
                const dir = camera.position.clone().sub(entity.position).normalize();
                const speed = 5.2;
                moveWithCollision(entity,dir.multiplyScalar(speed * delta));
                entity.lookAt(camera.position.x, 1.75, camera.position.z);
                entity.userData.limbs.forEach((limb,index)=>{limb.rotation.x=Math.sin(stateTime*10+index*Math.PI)*.7;});
                const dist = entity.position.distanceTo(camera.position);
                if (Date.now() - lastScreech > 2500) {
                    playScreech();
                    lastScreech = Date.now();
                }
                if (dist < 1.3) {
                    sanity = Math.max(0, sanity - 15);
                    entityChasing = false;
                    scene.remove(entity);
                    entity = null;
                    document.getElementById('entity-status').style.display = 'none';
                    showMessage("IT HURTS");
                    isGlitching = true; glitchTimer = 0.8;
                } else if (entityTimer <= 0) {
                    entityChasing = false;
                    scene.remove(entity);
                    entity = null;
                    document.getElementById('entity-status').style.display = 'none';
                }
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            if (gameActive) {
                const delta = Math.min(clock.getDelta(),0.1);
                stateTime+=delta;
                const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
                const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
                forward.y = 0; right.y = 0;
                forward.normalize(); right.normalize();
                const moveDir = new THREE.Vector3(0, 0, 0);
                if (keys.w) moveDir.add(forward);
                if (keys.s) moveDir.sub(forward);
                if (keys.a) moveDir.sub(right);
                if (keys.d) moveDir.add(right);
                if (moveDir.length() > 0) {
                    const sprinting=keys.shift&&!crouching&&stamina>0;
                    stamina=Math.max(0,stamina-(sprinting?34:0)*delta);
                    moveDir.normalize().multiplyScalar((crouching?2.6:sprinting?7.5:5.0)*delta);
                    moveWithCollision(camera,moveDir);
                    stepCounter += delta * 11;
                    camera.position.y = (crouching?1.2:1.7)+Math.sin(stepCounter)*.04;
                } else {
                    stamina=Math.min(100,stamina+24*delta);
                    camera.position.y = (crouching?1.2:1.7)+Math.sin(Date.now()*.001)*.012;
                }
                camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
                if(brDirector)brDirector.update(delta,keys.shift&&!crouching,crouching);
                window.brGameElapsed=(Date.now()-startTime)/1000;
                BackroomsUpgrade.updateZone(camera.position,0,visitedChunks.size);
                handleGlitches(delta);
                updateProceduralWorld();
                handleInteractions();
                if(!keys.shift)stamina=Math.min(100,stamina+18*delta);
                sanity -= delta*.48;
if (sanity <= 0) {
    gameActive = false;
    showMessage("YOUR MIND HAS SHATTERED...");
    document.exitPointerLock();
    setTimeout(() => window.location.reload(), 2500);
    return;
}
document.getElementById('sanity-bar').style.width = Math.max(0, sanity) + '%';
document.getElementById('stamina-bar').style.width = stamina + '%';

                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                document.getElementById('timer').innerText = `TIME: ${Math.floor(elapsed/60).toString().padStart(2, '0')}:${(elapsed%60).toString().padStart(2, '0')}`;
            }
            renderer.render(scene, camera);
        }
        window.onload = init;
