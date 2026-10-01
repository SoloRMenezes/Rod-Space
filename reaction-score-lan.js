/* Automatic same-LAN leaderboard sync for Reaction Game. Scores remain cached locally. */
const statusEl=document.getElementById('lanScoreStatus');
const game=window.reactionGame;
let mode='idle',hostSession=null,clientSession=null,latestRooms=[],electionTimer=null,watchStop=null;
const setStatus=(text,connected=false)=>{statusEl.textContent=`LAN scores · ${text}`;statusEl.classList.toggle('connected',connected)};
const playerName=()=>game.leaderboard[0]?.name||`Player ${game.deviceId.slice(0,4).toUpperCase()}`;
const board=()=>game.leaderboard;

function receiveBoard(data){
  if(data?.type!=='scores'||!Array.isArray(data.payload))return;
  const changed=game.mergeScores(data.payload);
  if(changed)setStatus('scores synced and cached',true);
}

function sendBoard(){
  if(mode==='host'&&hostSession)hostSession.lan.broadcast('scores',board());
  else if(mode==='guest'&&clientSession)clientSession.client.send('scores',board());
}

function wireHost(session){
  session.lan.on('message',({data})=>{
    if(data?.type!=='scores')return;
    receiveBoard(data);
    session.lan.broadcast('scores',board());
  });
}

function wireGuest(session){
  session.client.on('message',({data})=>receiveBoard(data));
  session.client.on('close',()=>{mode='idle';clientSession=null;setStatus('nearby player left · scores kept');scheduleElection(500)});
}

async function becomeHost(){
  if(mode!=='idle')return;
  mode='hosting';setStatus('opening a nearby session…');
  try{
    hostSession=await PartyRooms.createHost({
      game:'reaction-scores',name:playerName(),
      onStatus:text=>setStatus(text),
      onConnected:guest=>{hostSession.lan.send(guest,'scores',board());setStatus('connected · scores sync automatically',true)}
    });
    wireHost(hostSession);mode='host';setStatus('ready for nearby players',true);
  }catch(error){mode='idle';setStatus('offline cache active');console.warn('Reaction LAN host:',error)}
}

async function joinRoom(room){
  if(mode!=='idle'||!room)return;
  mode='joining';setStatus(`connecting to ${room.name}…`);
  try{
    clientSession=await PartyRooms.join(room,{name:playerName(),onStatus:text=>setStatus(text)});
    wireGuest(clientSession);mode='guest';sendBoard();setStatus('connected · scores sync automatically',true);
  }catch(error){
    mode='idle';clientSession=null;setStatus('no reachable nearby game · starting one');scheduleElection(300);
  }
}

function scheduleElection(delay=500+Math.random()*900){
  clearTimeout(electionTimer);
  electionTimer=setTimeout(()=>{
    if(mode!=='idle')return;
    const room=latestRooms[0];
    if(room)joinRoom(room);else becomeHost();
  },delay);
}

async function startSync(){
  if(!game||!globalThis.PartyRooms)return;
  try{
    watchStop=await PartyRooms.watch('reaction-scores',rooms=>{
      latestRooms=rooms;
      if(mode!=='idle')return;
      clearTimeout(electionTimer);
      if(rooms.length)joinRoom(rooms[0]);else scheduleElection();
    },()=>{setStatus('offline cache active');scheduleElection()});
  }catch(error){setStatus('offline cache active')}
}

addEventListener('reactionscorechange',sendBoard);
addEventListener('pagehide',()=>{clearTimeout(electionTimer);watchStop?.();hostSession?.stop?.();clientSession?.client?.close?.()},{once:true});
if(globalThis.PartyRooms)startSync();else addEventListener('partyroomsready',startSync,{once:true});
setTimeout(()=>{if(mode==='idle'&&!globalThis.PartyRooms)setStatus('offline cache active')},8000);
