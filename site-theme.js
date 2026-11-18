(function(){
"use strict";
const key="rodspace.arcade.theme";
let stored="dark";try{stored=localStorage.getItem(key)||"dark"}catch{}
const style=document.createElement("style");
style.textContent='html.rod-light{color-scheme:light}html.rod-light body{background:#f4f7fc!important;color:#1f2937!important}html.rod-light header,html.rod-light footer{background:#fff!important;border-color:#cbd5e1!important}html.rod-light [class*="bg-[#161b22]"]{background:#fff!important}html.rod-light [class*="bg-[#0d1117]"]{background:#f1f5f9!important}html.rod-light h1,html.rod-light h2,html.rod-light h3,html.rod-light h4{color:#0f172a!important}html.rod-light input,html.rod-light select{color:#0f172a!important}html.rod-light [class*="border-slate-800"]{border-color:#cbd5e1!important}html.rod-light [class*="text-slate-500"]{color:#475569!important}';
document.head.append(style);
const toggle=document.getElementById("homeThemeToggle");
const settingsToggle=document.getElementById("homeSettingsToggle"),settingsMenu=document.getElementById("homeSettingsMenu"),themeLabel=toggle?.querySelector("span");
function setTheme(theme){document.documentElement.classList.toggle("rod-light",theme==="light");if(themeLabel)themeLabel.textContent=theme==="light"?"☾ Dark":"☀ Light";try{localStorage.setItem(key,theme)}catch{}}
setTheme(stored==="light"?"light":"dark");
toggle?.addEventListener("click",()=>setTheme(document.documentElement.classList.contains("rod-light")?"dark":"light"));
function closeSettings(){if(!settingsMenu||!settingsToggle)return;settingsMenu.classList.add("hidden");settingsToggle.setAttribute("aria-expanded","false")}
settingsToggle?.addEventListener("click",()=>{const open=settingsToggle.getAttribute("aria-expanded")!=="true";settingsToggle.setAttribute("aria-expanded",String(open));settingsMenu?.classList.toggle("hidden",!open)});
document.addEventListener("click",event=>{if(!settingsMenu?.contains(event.target)&&!settingsToggle?.contains(event.target))closeSettings()});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&settingsToggle?.getAttribute("aria-expanded")==="true"){closeSettings();settingsToggle.focus()}});
})();
