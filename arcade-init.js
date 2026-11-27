(function(){
"use strict";
const byId=id=>document.getElementById(id);
let info;
function initializeArcade(){info=window.Arcade.mount();if(!info)return;startGameIntro()}
function startGameIntro(){
const [id,title,description,icon,mode]=info;
const help={
"typing":"Type the highlighted passage. Your speed and accuracy improve with practice. Choose a 30 or 60 second round.",
"2048":"Use the arrow keys or swipe to combine equal tiles and reach 2048.",
"wordle":"Find today's five-letter word in six tries. Green means correct, yellow means misplaced. One puzzle each day.",
"mines":"Reveal safe squares. Right-click to flag suspected mines, or turn on Flag mode for touchscreens.",
"snake":"Play solo against rivals or host and join an online arena. Steer smoothly with the mouse, arrow keys or WASD.",
"pong":"Choose Singleplayer, LAN for two people sharing a keyboard, or Multiplayer to host or join a room. First to 7 wins.",
"combat":"Choose solo to battle a bot, or host and join an online battle from two phones. Take turns using attacks, healing and guard.",
"headsup":"Choose a category and round length first. Hold the phone facing your team; tilt down for correct and up to pass.",
"uno":"Choose solo bot matches or multiplayer rooms for friends on other phones. Rooms support up to four players; bots take over disconnected seats.",
"ladders":"Pick two to four players, then race to square 100. Roll the die, climb ladders and slide down snakes. Exact roll to win."
};
byId("introTitle").textContent=title;
byId("introDescription").textContent=description;
byId("introIcon").textContent=icon;
byId("introCategory").textContent=mode==="party"?"LOCAL MULTIPLAYER":"SINGLEPLAYER";
byId("introControls").textContent=help[id]||"Play the game.";
const intro=byId("gameIntro"),game=byId("game");
function closeIntro(){
intro.hidden=true;
if(id==="pong"){
const start=[...game.querySelectorAll("button")].find(b=>/^(Start game|Start \/ Restart|Start new round|Start 60-second round)$/.test(b.textContent.trim()));
start?.click();
}
game.querySelector("textarea")?.focus();
}
byId("playGame").addEventListener("click",closeIntro);
document.addEventListener("keydown",event=>{
if(event.key!=="Escape")return;
if(!intro.hidden)intro.hidden=true;
});
intro.hidden=mode!=="party"||id==="uno"||id==="combat"||id==="ladders"||id==="pong"||id==="snake";
if(!intro.hidden)byId("playGame").focus();

else game.querySelector("textarea")?.focus();
}
initializeArcade();
})();
