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
