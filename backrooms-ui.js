// Shared Backrooms introduction and survival interface.
(function(){
  const presets={
    0:['00','THE YELLOW ROOMS','Familiar rooms. Impossible architecture. No clear way back.','ENTER LEVEL 00','Explore unfamiliar rooms','Avoid the Surveyor','Find a marked exit'],
    1:['01','HABITABLE ZONE','The lights change. The halls are no longer empty.','DESCEND TO LEVEL 01','Explore service routes','Avoid the Hound','Find the way down'],
    2:['02','PIPE DREAMS','Heat, metal, and a labyrinth of maintenance corridors.','ENTER THE TUNNELS','Navigate shifting pipes','Search for supplies','Find the service gate'],
    7:['07','THALASSOPHOBIA','The rooms are flooded. Something moves below the surface.','ENTER LEVEL 07','Explore the flooded rooms','Avoid the Drowned','Find the hatch']
  };
  function build(){
    const level=Number(location.pathname.match(/backrooms-level(\d+)\.html/)?.[1]||document.documentElement.dataset.brLevel||0);
    const d=presets[level],panel=document.getElementById('instructions');
    if(!d||!panel)return;
    const items=[d[4],d[5],d[6]].map((s,i)=>'<li><b>0'+(i+1)+'</b><span>'+s+'</span></li>').join('');
    panel.innerHTML=[
      '<div class="br-menu-ambient" aria-hidden="true"><div class="br-lines"></div></div>',
      '<main class="br-menu-frame">',
      '<header class="br-menu-top"><div class="br-brand"><span class="br-brand-mark">B<span>_</span></span><span>ROD SPACE<small>EXPERIMENTAL ARCHIVES</small></span></div>',
      '<span class="br-top-ref">ANOMALOUS LOCATION / SECTOR '+d[0]+'</span><span class="br-signal">● &nbsp; SIGNAL LOST</span></header>',
      '<div class="br-menu-main"><section class="br-menu-story">',
      '<div class="br-topline"><span>CLASSIFIED FIELD RECORD</span><span>ENTRY '+d[0]+' / 05</span></div>',
      '<div class="br-menu-title"><span>THE</span><h1>BACK<br><em>ROOMS</em></h1></div>',
      '<div class="br-level-marker"><span></span> LEVEL '+d[0]+' &nbsp; / &nbsp; '+d[1]+'</div>',
      '<p class="br-lead">'+d[2]+'</p>',
      '<div class="br-menu-action"><button id="start-btn" class="br-start" type="button"><span><small>READY TO DESCEND?</small><strong>'+d[3]+'</strong></span><span class="br-start-arrow">↗</span></button>',
      '<span class="br-entry-note">Every entry is different.<br>There is no reliable map.</span></div></section>',
      '<aside class="br-menu-panel"><div class="br-panel-header">FIELD GUIDE <span>01 / SURVIVAL</span></div>',
      '<div class="br-survey" aria-hidden="true"><div class="br-survey-cross"></div><div class="br-survey-pulse"></div>',
      '<div class="br-survey-text">LOCATION UNKNOWN <b>?</b></div></div>',
      '<div class="br-panel-label">YOUR OBJECTIVES <span>— '+d[1]+'</span></div>',
      '<ol class="br-tasks">'+items+'</ol>',
      '<div class="br-alert"><b>!</b><span>The environment is unstable.<br>Do not trust the silence.</span></div>',
      '<div class="br-controls-title">CONTROLS <span>QUICK REFERENCE</span></div>',
      '<div class="br-hotkeys"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> MOVE</span>',
      '<span><kbd>SHIFT</kbd> SPRINT</span><span><kbd>C</kbd> CROUCH</span>',
      '<span><kbd>F</kbd> LIGHT</span><span><kbd>E</kbd> INTERACT</span></div></aside></div>',
      '<footer class="br-menu-footer"><span>ROD SPACE / BACKROOMS SIMULATION</span>',
      '<span>PROCEDURAL ENVIRONMENT · RUN-BASED EXPLORATION</span><span>REV. 02</span></footer>',
      '</main>'
    ].join('');
    panel.classList.add('br-menu-enhanced');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});
  else build();
})();
