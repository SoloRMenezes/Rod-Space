(function(){
"use strict";
const byId=id=>document.getElementById(id);
const info=window.Arcade.mount();if(!info)return;
const [id,title,description,icon,mode]=info;
const help={
"typing":"Type the highlighted passage. Your speed and accuracy improve with practice. Choose a 30 or 60 second round.",
"2048":"Use the arrow keys, swipe, or tap the on-screen arrows. Combine equal tiles to reach 2048.",
"wordle":"Find today's five-letter word in six tries. Green means correct, yellow means misplaced. One puzzle each day.",
"mines":"Reveal safe squares. Right-click to flag suspected mines, or turn on Flag mode for touchscreens.",
"snake":"Steer using arrow keys, WASD or swipes. Collect food, outgrow the rival snakes and avoid collisions.",
"pong":"Move with W and S or drag the left paddle. In two-player mode, Player 2 uses the arrow keys. First to 7 wins.",
"combat":"Choose solo to battle a bot, or host and join an online battle from two phones. Take turns using attacks, healing and guard.",
"headsup":"Hold the screen facing your teammates. They describe the displayed word; press Correct or Pass.",
"uno":"Choose solo bot matches or multiplayer rooms for friends on other phones. Rooms support up to four players; bots take over disconnected seats.",
"ladders":"Take turns rolling the die. Climb ladders, slide down snakes, and land exactly on square 100."
};
byId("introTitle").textContent=title;
byId("introDescription").textContent=description;
byId("introIcon").textContent=icon;
byId("introCategory").textContent=mode==="party"?"LOCAL MULTIPLAYER":"SINGLEPLAYER";
byId("introControls").textContent=help[id]||"Play the game.";
const intro=byId("gameIntro"),game=byId("game");
function closeIntro(){
intro.hidden=true;
if(["pong","snake","headsup"].includes(id)){
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
intro.hidden=mode!=="party"||id==="uno";
if(!intro.hidden)byId("playGame").focus();
else if(id==="snake")closeIntro();
else game.querySelector("textarea")?.focus();
})();
