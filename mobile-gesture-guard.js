/* Keep rapid game taps from becoming browser zoom gestures on mobile. */
(()=>{
  let lastTouchEnd=0;
  const stopZoom=event=>event.preventDefault();
  document.addEventListener('gesturestart',stopZoom,{passive:false});
  document.addEventListener('gesturechange',stopZoom,{passive:false});
  document.addEventListener('gestureend',stopZoom,{passive:false});
  document.addEventListener('touchend',event=>{
    const now=performance.now();
    if(now-lastTouchEnd<350)event.preventDefault();
    lastTouchEnd=now;
  },{passive:false});
})();
