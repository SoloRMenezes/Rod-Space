export function releaseTrick(sequence, role, time, windowMs = 1000) {
  const recent = sequence.filter(item => time - item.time <= windowMs);
  recent.push({ role, time });
  const pair = recent.slice(-2).map(item => item.role).join(',');
  const trick = pair === 'front,back' ? 'OLLIE' : pair === 'back,front' ? 'NOLLIE' : null;
  return { trick, sequence: trick ? [] : recent.slice(-1) };
}

export function arrowReleaseTrick(sequence, direction, time, windowMs = 1000) {
  const recent = sequence.filter(item => time - item.time <= windowMs);
  recent.push({ direction, time });
  const pair = recent.slice(-2).map(item => item.direction).join(',');
  const trick = pair === 'UP,DOWN' ? 'OLLIE' : pair === 'DOWN,UP' ? 'NOLLIE' : null;
  return { trick, sequence: trick ? [] : recent.slice(-1) };
}

export function airTrickForArrow(code, airborne, alreadyFlipped) {
  if (!airborne || alreadyFlipped) return null;
  return code === 'ArrowLeft' ? 'KICKFLIP' : code === 'ArrowRight' ? 'HEELFLIP' : null;
}

export function airTrickForFlick(deltaX, threshold, airborne, alreadyFlipped) {
  if (!airborne || alreadyFlipped || Math.abs(deltaX) < threshold) return null;
  return deltaX < 0 ? 'KICKFLIP' : 'HEELFLIP';
}

export function mouseYawDelta(deltaX, viewportWidth) {
  return viewportWidth > 0 ? (deltaX / viewportWidth) * Math.PI * 2 : 0;
}

export function mousePointerDelta(event, pointerLocked, lastX) {
  return pointerLocked ? event.movementX : event.clientX - lastX;
}

export function shouldDrive(mousePressed, touchDriving, keyboardDirection) {
  return !mousePressed && (touchDriving || keyboardDirection !== 0);
}
