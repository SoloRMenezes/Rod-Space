(function () {
  'use strict';
  const topics = window.mathsTopicContent;
  const path = (fn, from, to, step, ox, oy, sx, sy) => {let d = ''; for (let x = from; x <= to + step / 2; x += step) {const y = fn(x); if (!Number.isFinite(y)) continue; d += `${d ? 'L' : 'M'}${(ox + x * sx).toFixed(1)} ${(oy - y * sy).toFixed(1)} `;} return d;};
  const figure = (body, viewBox, label) => `<figure class="topic-diagram"><svg viewBox="${viewBox}" role="img" aria-label="${label}">${body}</svg></figure>`;
  const axis = (x1, x2, y1, y2, ox, oy) => `<path class="axis" d="M${x1} ${oy}H${x2}M${ox} ${y1}V${y2}"/><text x="${x2-12}" y="${oy-8}">x</text><text x="${ox+8}" y="${y1+17}">y</text>`;
  const curve = (d, colour = '#3159d8') => `<path d="${d}" fill="none" stroke="${colour}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  const dot = (x, y, label, tx = x + 8, ty = y - 9) => `<circle cx="${x}" cy="${y}" r="5" fill="#17213b"/><text x="${tx}" y="${ty}">${label}</text>`;

  // Coordinates are sampled from the stated equations, so intersections and vertices actually line up.
  const family = (x, y, label, fn, colour, from = -2, to = 2) => `<g transform="translate(${x} ${y})">${axis(10,190,12,168,100,90)}${curve(path(fn,from,to,.04,100,90,40,35),colour)}<text x="100" y="193" text-anchor="middle">${label}</text></g>`;
  topics.graphs.sections[0].diagram = figure(
    family(0,0,'y=x',x=>x,'#3159d8')+
    family(225,0,'y=x²',x=>x*x,'#d96c42',-1.4,1.4)+
    family(450,0,'y=√x',x=>Math.sqrt(x),'#2a9b61',0,2.2)+
    family(112,235,'y=x³',x=>x*x*x,'#8a5eb5',-1.3,1.3)+
    `<g transform="translate(337 235)">${axis(10,190,12,168,100,90)}${curve(path(x=>1/x,-2,-.5,.025,100,90,40,35),'#b35172')}${curve(path(x=>1/x,.5,2,.025,100,90,40,35),'#b35172')}<text x="100" y="193" text-anchor="middle">y=1/x</text></g>`,
    '0 0 650 440','Five separate, correctly plotted graph families');

  topics.sketching.sections[0].diagram = figure(
    axis(58,604,25,315,150,180)+`<path class="guide" d="M390 35V305"/>`+
    curve(path(x=>(x-1)*(x-5),0,6,.035,150,180,80,25))+
    dot(230,180,'(1,0)',184,164)+dot(550,180,'(5,0)',510,164)+
    dot(390,280,'(3,−4)',406,284)+dot(150,55,'(0,5)',159,49)+
    `<text x="304" y="29">y=(x−1)(x−5)</text><text x="397" y="64">x=3</text>`,
    '0 0 640 340','Quadratic y equals x minus one times x minus five, with correctly positioned roots, vertex and y-intercept');

  topics.quadratics.sections[0].diagram = figure(
    axis(44,600,18,270,480,180)+curve(path(x=>x*x+5*x+6,-4.1,-.9,.025,480,180,100,50))+
    dot(180,180,'(−3,0)',112,170)+dot(280,180,'(−2,0)',291,170)+
    `<text x="68" y="45">y=x²+5x+6</text>`,
    '0 0 640 300','Quadratic y equals x squared plus five x plus six, crossing at minus three and minus two');

  const casePanel = (x, title, offset, colour) => `<g transform="translate(${x} 0)">${axis(10,190,18,175,100,105)}${curve(path(t=>t*t+offset,-1.1,1.1,.025,100,105,43,45),colour)}<text x="100" y="205" text-anchor="middle">${title}</text><text x="100" y="228" text-anchor="middle">y=x² ${offset<0?'− 1':offset>0?'+ 1':''}</text></g>`;
  topics.discriminant.sections[0].diagram = figure(
    casePanel(0,'Δ &gt; 0',-1,'#3159d8')+casePanel(215,'Δ = 0',0,'#d96c42')+casePanel(430,'Δ &lt; 0',1,'#2a9b61'),
    '0 0 640 250','Three separate parabolas showing two, one and zero x-axis intersections');

  topics.transformations.sections[0].diagram = figure(
    axis(35,605,18,335,150,310)+curve(path(x=>x*x,-1.5,2.5,.025,150,310,55,24))+
    curve(path(x=>(x-3)*(x-3)+2,.5,5.5,.025,150,310,55,24),'#d96c42')+
    dot(150,310,'(0,0)',68,300)+dot(315,262,'(3,2)',326,252)+
    `<defs><marker id="move-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0L9 4.5 0 9Z" fill="#d96c42"/></marker></defs><path d="M165 300 300 266" fill="none" stroke="#d96c42" stroke-width="3" marker-end="url(#move-arrow)"/><text x="40" y="40">y=x²</text><text x="366" y="40">y=(x−3)²+2</text>`,
    '0 0 640 355','The parabola y equals x squared translated right three and up two');

  // The small surds check in the textbook also needs a full worked method.
  topics.surds.checks[0].w = [
    'Find a square factor: 45 = 9 × 5.',
    'Split the root: √45 = √9 × √5.',
    'Evaluate √9 = 3, so √45 = 3√5.'
  ];
})();
