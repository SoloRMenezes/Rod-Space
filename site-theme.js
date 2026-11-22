(function(){
"use strict";
const key="rodspace.arcade.theme";
let stored="dark";try{stored=localStorage.getItem(key)||"dark"}catch{}
const style=document.createElement("style");
style.textContent='html.rod-light{color-scheme:light}html.rod-light body{background:#f4f7fc!important;color:#1f2937!important}html.rod-light header,html.rod-light footer{background:#fff!important;border-color:#cbd5e1!important}html.rod-light [class*="bg-[#161b22]"]{background:#fff!important}html.rod-light [class*="bg-[#0d1117]"]{background:#f1f5f9!important}html.rod-light h1,html.rod-light h2,html.rod-light h3,html.rod-light h4{color:#0f172a!important}html.rod-light input,html.rod-light select{color:#0f172a!important}html.rod-light [class*="border-slate-800"]{border-color:#cbd5e1!important}html.rod-light [class*="text-slate-500"]{color:#475569!important}';
document.head.append(style);
const controlsStyle=document.createElement("style");
controlsStyle.textContent=`
.rs-theme-row{display:flex;align-items:center;justify-content:space-between;gap:24px;width:100%;min-height:48px;padding:10px 12px;border:0;border-radius:8px;background:transparent;color:#e2e8f0;font:600 14px system-ui;text-align:left;cursor:pointer}
.rs-theme-row:hover{background:#33415599}.rs-theme-row:focus-visible{outline:2px solid #60a5fa;outline-offset:-2px}
.rs-theme-pill{position:relative;display:inline-block;flex-shrink:0;width:64px;height:32px;border:1px solid #697586;border-radius:999px;background:#bcc3cd;transition:background .18s}
.rs-theme-pill svg{position:absolute;top:7px;width:16px;height:16px}.rs-theme-moon{left:8px;color:#fff}.rs-theme-sun{right:7px;color:#374151}
.rs-theme-thumb{position:absolute;top:3px;left:3px;width:24px;height:24px;background:#fff;border-radius:50%;box-shadow:0 1px 3px #0003;transition:transform .18s}
.rs-theme-row[aria-checked="true"] .rs-theme-pill{background:#0d1117}.rs-theme-row[aria-checked="true"] .rs-theme-thumb{transform:translateX(32px)}
.rs-home-account{margin-bottom:5px}.rs-home-account>span{font-weight:650}
html.rod-light #homeSettingsMenu,html.rod-light #homeSettingsToggle{color:#1e293b!important;border-color:#cbd5e1!important}
html.rod-light #homeSettingsMenu a,html.rod-light .rs-theme-row,html.rod-light .rs-home-account{color:#1e293b!important}
html.rod-light .rs-theme-row:hover,html.rod-light .rs-home-account:hover{background:#e2e8f0}
html.rod-light #rs-settings-account-summary{color:#475569}
@media(prefers-reduced-motion:reduce){.rs-theme-thumb,.rs-theme-pill{transition:none}}
`;
document.head.append(controlsStyle);
const toggle=document.getElementById("homeThemeToggle");
const settingsToggle=document.getElementById("homeSettingsToggle"),settingsMenu=document.getElementById("homeSettingsMenu");
function setTheme(theme){document.documentElement.classList.toggle("rod-light",theme==="light");toggle?.setAttribute("aria-checked",String(theme!=="light"));toggle?.setAttribute("title",theme==="light"?"Switch to dark theme":"Switch to light theme");try{localStorage.setItem(key,theme)}catch{}}
setTheme(stored==="light"?"light":"dark");
toggle?.addEventListener("click",()=>setTheme(document.documentElement.classList.contains("rod-light")?"dark":"light"));
function closeSettings(){if(!settingsMenu||!settingsToggle)return;settingsMenu.classList.add("hidden");settingsToggle.setAttribute("aria-expanded","false")}
settingsToggle?.addEventListener("click",()=>{const open=settingsToggle.getAttribute("aria-expanded")!=="true";settingsToggle.setAttribute("aria-expanded",String(open));settingsMenu?.classList.toggle("hidden",!open)});
document.addEventListener("click",event=>{if(!settingsMenu?.contains(event.target)&&!settingsToggle?.contains(event.target))closeSettings()});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&settingsToggle?.getAttribute("aria-expanded")==="true"){closeSettings();settingsToggle.focus()}});
})();
