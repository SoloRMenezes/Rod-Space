/* Firebase room discovery and hidden WebRTC signaling for Rod Space party games. */
import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,signInAnonymously} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,collection,doc,setDoc,updateDoc,deleteDoc,getDocs,onSnapshot,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

const firebaseConfig={
  apiKey:'AIzaSyChsDKOZclM1DpQFaR8YQyS38y4uqK9Blc',
  authDomain:'rod-space-rooms-2026.firebaseapp.com',
  projectId:'rod-space-rooms-2026',
  storageBucket:'rod-space-rooms-2026.firebasestorage.app',
  messagingSenderId:'483176602236',
  appId:'1:483176602236:web:e815f4cd8c6befe69c47f9'
};

const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);
const signedIn=signInAnonymously(auth).then(result=>result.user);
const ROOM_LIFE=90_000;

async function hash(value){
  if(!value)return'';
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');
}

async function cleanExpired(game){
  const user=await signedIn;
  const snapshot=await getDocs(collection(db,'rooms'));
  const now=Date.now();
  await Promise.all(snapshot.docs.filter(item=>{const room=item.data();return room.game===game&&room.ownerUid===user.uid&&room.expiresAt<now}).map(item=>deleteDoc(item.ref).catch(()=>{})));
}

async function watch(game,onRooms,onError=()=>{}){
  await signedIn;
  return onSnapshot(collection(db,'rooms'),snapshot=>{
    const now=Date.now();
    const rooms=snapshot.docs.map(item=>({id:item.id,...item.data()})).filter(room=>room.game===game&&room.expiresAt>now).sort((a,b)=>b.updatedAt-a.updatedAt);
    onRooms(rooms);
  },onError);
}

async function createHost({game,name,pin='',onConnected=()=>{},onStatus=()=>{}}){
  const user=await signedIn;
  await cleanExpired(game);
  const roomRef=doc(collection(db,'rooms'));
  const pinHash=await hash(`${roomRef.id}:${pin}`);
  const lan=PartyLan.host();
  const pending=new Map();
  let stopped=false;
  const publish=()=>setDoc(roomRef,{game,name,ownerUid:user.uid,locked:!!pin,pinHash,players:1,createdAt:serverTimestamp(),updatedAt:Date.now(),expiresAt:Date.now()+ROOM_LIFE});
  await publish();
  const heartbeat=setInterval(()=>updateDoc(roomRef,{updatedAt:Date.now(),expiresAt:Date.now()+ROOM_LIFE,players:1+lan.guests.filter(guest=>guest.channel?.readyState==='open').length}).catch(()=>{}),25_000);
  const stopPeers=onSnapshot(collection(roomRef,'peers'),snapshot=>snapshot.docs.forEach(async item=>{
    const data=item.data();
    if(data.status==='requesting'&&!pending.has(item.id)){
      pending.set(item.id,true);
      if(pinHash&&data.pinHash!==pinHash){await updateDoc(item.ref,{status:'rejected'});return}
      try{
        const invite=await lan.invite({id:item.id,name:data.name});
        pending.set(item.id,invite);
        await updateDoc(item.ref,{offer:invite.code,status:'offered'});
      }catch(error){await updateDoc(item.ref,{status:'error',message:error.message})}
    }
    if(data.status==='answered'&&pending.get(item.id)?.accept){
      const invite=pending.get(item.id);pending.set(item.id,true);
      try{onStatus(`${data.name} is connecting`);const guest=await invite.accept(data.answer);guest.meta.name=data.name;await updateDoc(item.ref,{status:'connecting'})}catch(error){await updateDoc(item.ref,{status:'error',message:error.message})}
    }
  }));
  lan.on('open',async guest=>{
    const peerId=guest.meta.id;
    if(peerId)updateDoc(doc(roomRef,'peers',peerId),{status:'connected'}).catch(()=>{});
    updateDoc(roomRef,{players:1+lan.guests.filter(item=>item.channel?.readyState==='open').length,updatedAt:Date.now(),expiresAt:Date.now()+ROOM_LIFE}).catch(()=>{});
    onConnected(guest);
  });
  const stop=async()=>{if(stopped)return;stopped=true;clearInterval(heartbeat);stopPeers();lan.close();await deleteDoc(roomRef).catch(()=>{})};
  addEventListener('pagehide',()=>{if(!stopped)deleteDoc(roomRef).catch(()=>{})},{once:true});
  return{roomId:roomRef.id,lan,stop};
}

async function join(room,{name,pin='',onStatus=()=>{}}){
  const user=await signedIn;
  const supplied=await hash(`${room.id}:${pin}`);
  if(room.locked&&supplied!==room.pinHash)throw Error('Wrong PIN');
  const roomRef=doc(db,'rooms',room.id);
  const peerRef=doc(collection(roomRef,'peers'));
  await setDoc(peerRef,{guestUid:user.uid,name,pinHash:supplied,status:'requesting',createdAt:serverTimestamp()});
  return new Promise((resolve,reject)=>{
    let client=null,finished=false;
    const stop=onSnapshot(peerRef,async snapshot=>{
      const data=snapshot.data();if(!data)return;
      if(data.status==='rejected'){stop();deleteDoc(peerRef).catch(()=>{});reject(Error('Wrong PIN'));return}
      if(data.status==='error'){stop();reject(Error(data.message||'Could not connect'));return}
      if(data.status==='offered'&&!client){
        try{
          onStatus('Connecting…');
          client=await PartyLan.join(data.offer,{name,roomId:room.id,peerId:peerRef.id});
          await updateDoc(peerRef,{answer:client.answer,status:'answered'});
          client.on('open',()=>{if(finished)return;finished=true;onStatus(`Connected to ${room.name}`);resolve({client,room,peerRef,stop})});
          client.on('close',()=>onStatus('Host disconnected'));
        }catch(error){stop();reject(error)}
      }
    },error=>reject(error));
    setTimeout(()=>{if(!finished){stop();client?.close();reject(Error('The host did not answer'))}},20_000);
  });
}

globalThis.PartyRooms={watch,createHost,join,hash};
dispatchEvent(new Event('partyroomsready'));
