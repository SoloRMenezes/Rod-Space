// Focused chapter practice for P2, P3, P4, S1.
// Original questions built from verifiable worked templates (not copied textbook questions).
// 50 per chapter: 10 normal, 10 hard, 20 exam-style, 10 A*.
(function(){
'use strict';
const bank=window.mathsFocusedExercises={};
const generators=window.mathsTopicGenerators;
const catalogue=window.mathsCurriculum;
if(!generators||!catalogue)return;
const q=generators.makeQuestion;
const modelling=(level,v)=>{
  const fixed=10+v*3+level,per=2+v%8,units=3+v%11+level,total=fixed+per*units;
  if(level<=1)return q('Mathematical modelling',
   'A delivery company models its cost by C = '+fixed+' + '+per+'n, where n is the number of deliveries. Find C when n = '+units+'.',
   total,['Identify fixed charge '+fixed+' and cost per delivery '+per+'.',
    'Substitute n = '+units+': C = '+fixed+' + '+per+' × '+units+'.',
    'Total modelled cost C = '+total+'.'],level);
  const start=50+v*2,rate=1+(v%12),years=2+v%5;
  const result=(start*Math.pow(1+rate/100,years)).toFixed(2);
  return q('Mathematical modelling',
   'A population starts at '+start+' and grows '+rate+'% annually. Model it by P(t) = '+start+'(1 + '+rate+'/100)^t. Estimate P('+years+') to 2 decimal places.',
   result,['For constant percentage growth, multiply by (1 + '+rate+'/100) each year.',
    'Substitute t = '+years+': P('+years+') = '+start+' × '+(1+rate/100)+'^'+years+'.',
    'The estimate is '+result+'; the model assumes the growth rate stays constant.'],level);
};
const parametric=(level,v)=>{
 const a=2+v%8,b=1+Math.floor(v/8),c=1+v%5;
 if(level===0)return q('Parametric curves',
  'The curve is x = t + '+a+', y = t² + '+b+'. Eliminate t to write y in terms of x.',
  'y = (x − '+a+')² + '+b,
  ['Rearrange x = t + '+a+' to get t = x − '+a+'.',
   'Substitute this into y = t² + '+b+'.',
   'Therefore y = (x − '+a+')² + '+b+'.'],level);
 if(level===1)return q('Parametric curves',
  'The curve has x = '+a+'t and y = '+b+'t + '+c+'. Find its Cartesian equation.',
  'y = ('+b+'/'+a+')x + '+c,
  ['From x = '+a+'t, t = x/'+a+'.',
   'Insert this into y = '+b+'t + '+c+'.',
   'Therefore y = ('+b+'/'+a+')x + '+c+'.'],level);
 if(level===2){
  const d=3+v%7,e=4+Math.floor(v/7);
  return q('Parametric curves',
   'For x = '+d+' cos t and y = '+e+' sin t, eliminate t and state the type of curve.',
   'x²/'+(d*d)+' + y²/'+(e*e)+' = 1 (ellipse)',
   ['Divide the equations: cos t = x/'+d+' and sin t = y/'+e+'.',
    'Apply sin²t + cos²t = 1.',
    'The curve is x²/'+(d*d)+' + y²/'+(e*e)+' = 1, an ellipse.'],level);
 }
 const d=2+v%8,e=2+Math.floor(v/8);
 return q('Parametric curves',
  'For x = '+d+'t² and y = '+e+'t³, eliminate t to obtain a relation between x and y.',
  'y² = ('+(e*e)+'/'+(d*d*d)+')x³',
  ['Cube x: x³ = '+(d*d*d)+'t⁶.',
   'Square y: y² = '+(e*e)+'t⁶.',
   'Eliminate t⁶ to obtain y² = ('+(e*e)+'/'+(d*d*d)+')x³.'],level);
};
const outliers=(level,v)=>{
 const low=4+v,q3=low+4+level+v%6,iqr=q3-low,top=q3+1.5*iqr,ob=top+(v%4)+1;
 return q('Data representation',
  'A data set has Q₁ = '+low+', Q₃ = '+q3+'. Using the 1.5 × IQR rule, find the upper outlier fence and decide whether '+ob+' is an outlier.',
  'Upper fence = '+top+'; '+ob+' is an outlier',
  ['Compute IQR = Q₃ − Q₁ = '+q3+' − '+low+' = '+iqr+'.',
   'Upper fence = Q₃ + 1.5 × IQR = '+q3+' + 1.5 × '+iqr+' = '+top+'.',
   'Since '+ob+' > '+top+', it lies above the upper fence and is an outlier.'],level);
};
const layouts={
 p2:[ [generators.p2[0]], [generators.p2[1]], [generators.p2[2]], [generators.p2[3]],
      [generators.p2[4]], [generators.p2[5]], [generators.p2[6]], [generators.p2[7]] ],
 p3:generators.p3.map(fn=>[fn]),
 p4:[ [generators.p4[0]], [generators.p4[1]], [parametric], [generators.p4[3]],
      [generators.p4[2],generators.p4[4]], [generators.p4[5]], [generators.p4[6]] ],
 s1:[ [modelling,generators.s1[7]], [generators.s1[0],generators.s1[6]],
      [generators.s1[1],outliers], [generators.s1[2]], [generators.s1[3]],
      [generators.s1[4]], [generators.s1[5]] ]
};
for(const [course,chapters] of Object.entries(layouts)){
 if(chapters.length!==catalogue[course].chapters.length)throw Error('Chapter mismatch '+course);
 for(let ch=0;ch<chapters.length;ch++){
  const generatorsForChapter=chapters[ch],items=[],used=new Set();
  const sizes=[10,10,20,10];
  for(let level=0;level<4;level++){
   let added=0,attempt=0;
   while(added<sizes[level] && attempt<1800){
    const selected=generatorsForChapter[added%generatorsForChapter.length];
    const variant=attempt+level*13+ch*7;
    attempt++;
    const item=selected(level,variant);
    if(!item||!item.q||!item.a||!Array.isArray(item.w)||item.w.length<3)throw Error('Incomplete question '+course+'/'+ch);
    if(used.has(item.q))continue;
    used.add(item.q);items.push(item);added++;
   }
   if(added!==sizes[level])throw Error('Not enough unique questions '+course+'/'+ch+'/'+level+'/'+added);
  }
  bank[catalogue[course].chapters[ch].id]=items;
 }
}
})();