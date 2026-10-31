// Restores mixed 50-question practice using the original, fully-worked P1/D1 banks.
// Each course interleaves topics within 10 normal, 10 hard, 20 exam and 10 A* questions.
(function(){
'use strict';
const source=window.mathsQuestionBank||{};
const oldIndices=typeof exercises!=='undefined'?exercises:[];
const selections={
 p1:[['Indices',oldIndices],['Surds',source.surds],['Quadratics',source.quadratics],
     ['Sketching',source.sketching],['Discriminant',source.discriminant],
     ['Graphs',source.graphs],['Transformations',source.transformations]],
 d1:[['Sorting',source.sorting],['Searching',source.searching],['Bin packing',source.packing],
     ['Critical path',source.critical],['Scheduling',source.scheduling]]
};
const bands=[[0,10],[10,20],[20,40],[40,50]];
window.mathsMixedExercises=window.mathsMixedExercises||{};
for(const [course,sources] of Object.entries(selections)){
 const output=[];
 for(const [begin,end] of bands){
  for(let i=begin;i<end;i++){
   const sourceIndex=(i-begin)%sources.length;
   const position=begin+Math.floor((i-begin)/sources.length);
   const [topic,questions]=sources[sourceIndex];
   if(!questions||!questions[position])throw Error('Missing practice question: '+course+'/'+topic+'/'+position);
   output.push({...questions[position],topic});
  }
 }
 if(output.length!==50||output.some(q=>!q.q||!q.a||!q.w))throw Error('Invalid mixed practice: '+course);
 window.mathsMixedExercises[course]=output;
}
})();