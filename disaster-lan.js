const SpiralLan={
 encode(value){const bytes=new TextEncoder().encode(JSON.stringify(value));let binary='';bytes.forEach(byte=>binary+=String.fromCharCode(byte));return btoa(binary).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');},
 decode(value){let code=value.trim().replaceAll('-','+').replaceAll('_','/');while(code.length%4)code+='=';const binary=atob(code),bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes));},
 async gathered(peer){if(peer.iceGatheringState==='complete')return;await new Promise(resolve=>{const done=()=>{if(peer.iceGatheringState==='complete'){peer.removeEventListener('icegatheringstatechange',done);resolve();}};peer.addEventListener('icegatheringstatechange',done);setTimeout(resolve,5000);});},
 peer(){return new RTCPeerConnection({iceServers:[]});},
 async host(){const peer=this.peer(),channel=peer.createDataChannel('shit-spiral');await peer.setLocalDescription(await peer.createOffer());await this.gathered(peer);return{peer,channel,offer:this.encode(peer.localDescription),async accept(code){await peer.setRemoteDescription(SpiralLan.decode(code));}};},
 async join(code){const peer=this.peer();let channel;const ready=new Promise(resolve=>peer.addEventListener('datachannel',event=>{channel=event.channel;resolve(channel);},{once:true}));await peer.setRemoteDescription(this.decode(code));await peer.setLocalDescription(await peer.createAnswer());await this.gathered(peer);return{peer,ready,answer:this.encode(peer.localDescription),get channel(){return channel;}};}
};
if(typeof module!=='undefined')module.exports=SpiralLan;
