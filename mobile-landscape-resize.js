/* Re-measure mobile browser chrome after portrait/landscape transitions settle. */
(()=>{
  let synthetic=false,lastWidth=0,lastHeight=0;
  const measure=()=>{
    const viewport=window.visualViewport;
    const width=Math.max(1,Math.round(viewport?.width||innerWidth||document.documentElement.clientWidth));
    const height=Math.max(1,Math.round(viewport?.height||innerHeight||document.documentElement.clientHeight));
    document.documentElement.style.setProperty('--game-viewport-width',`${width}px`);
    document.documentElement.style.setProperty('--game-viewport-height',`${height}px`);
    document.documentElement.style.width=`${width}px`;
    document.documentElement.style.height=`${height}px`;
    if(document.body){document.body.style.width=`${width}px`;document.body.style.height=`${height}px`}
    if(width===lastWidth&&height===lastHeight)return;
    lastWidth=width;lastHeight=height;
    synthetic=true;
    window.dispatchEvent(new Event('resize'));
    synthetic=false;
  };
  const settle=()=>[0,80,180,350,650].forEach(delay=>setTimeout(measure,delay));
  addEventListener('resize',event=>{if(!synthetic&&event.isTrusted!==false)settle()},{passive:true});
  addEventListener('orientationchange',settle,{passive:true});
  window.visualViewport?.addEventListener('resize',settle,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)settle()});
  addEventListener('pageshow',settle);
  settle();
})();
