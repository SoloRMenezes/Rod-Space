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

export function mouseYawDelta(deltaX, viewportWidth) {
  return viewportWidth > 0 ? -(deltaX / viewportWidth) * Math.PI * 0.9 : 0;
}

export function shouldDrive(mousePressed, touchDriving, keyboardDirection) {
  return !mousePressed && (touchDriving || keyboardDirection !== 0);
}

export function cycleParkId(parkIds, selectedId, direction) {
  if (!parkIds.length) return null;
  const selectedIndex = parkIds.indexOf(selectedId);
  const index = selectedIndex < 0 ? 0 : (selectedIndex + Math.sign(direction) + parkIds.length) % parkIds.length;
  return parkIds[index];
}
