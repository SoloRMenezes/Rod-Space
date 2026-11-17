(function(){
"use strict";
const themeKey="rodspace.arcade.theme",toggle=document.getElementById("themeToggle");
function setTheme(theme){document.documentElement.dataset.theme=theme;toggle.textContent=theme==="light"?"☾ Dark mode":"☀ Light mode";try{localStorage.setItem(themeKey,theme)}catch{}}
let saved=null;try{saved=localStorage.getItem(themeKey)}catch{}
setTheme(saved==="light"||saved==="dark"?saved:"dark");
toggle.addEventListener("click",()=>setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));
window.Arcade.mount();
})();
