// Maths textbook chapter index + 50-question mixed/focused exercise navigation.
// Keep the original interactive lesson/question/rendering functions as the source of truth.
(function(){
'use strict';
const catalogue=window.mathsCurriculum;
if(!catalogue)return;
const legacy={p1:courses.p1.topics.slice(),d1:courses.d1.topics.slice()};
for(const [code,book] of Object.entries(catalogue)){
 const skills=legacy[code]||[];
 courses[code]={
  name:book.name,short:book.short,color:book.color,
  boundaries:gradeBoundaries[code]||null,
  chapters:book.chapters,skills,
  topics:book.chapters.map(ch=>[ch.id,ch.title]).concat(skills).concat([['mixed','Mixed practice']])
 };
}
const safe=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const sid=(ch,i)=>'maths-section-'+ch.id+'-'+i;
const originalOpenBook=openBook,originalText=renderText,originalExercise=renderExercise;
const originalExercises=activeExercises,originalExerciseQ=exerciseQ;
const css=document.createElement('style');
css.textContent=[
 '.maths-subsections{margin:0 0 10px 34px;padding:1px 0 8px 11px;border-left:2px solid #cfc7ba}',
 '.maths-subsections a{display:flex;justify-content:space-between;gap:10px;padding:5px 3px;color:#697185;text-decoration:none;font-size:11px;line-height:1.4}',
 '.maths-subsections a:hover{text-decoration:underline;color:#17213b}',
 '.maths-section-list{list-style:none;margin:12px 0 32px;padding:0}',
 '.maths-section-list li{display:flex;gap:15px;align-items:baseline;justify-content:space-between;border-bottom:1px solid #d7dce5;padding:12px 4px;font-size:15px;scroll-margin-top:120px}',
 '.maths-section-list li span{flex:1}.maths-section-list li small{white-space:nowrap;color:#778194;font-weight:800}',
 '.maths-section-list li b{font-size:13px;color:var(--book-color)}',
 '.maths-keypoints{padding-left:25px;margin:15px 0 22px}.maths-keypoints li{margin:8px 0}',
 '.maths-source-note{font-size:13px;color:#6d7481;margin:22px 0;padding:12px 15px;border-left:3px solid var(--book-color);background:#f3f5fa}',
 '.maths-page-number{color:#8791a1;font-size:10px}',
 '.maths-topic-tag{font-size:9px;font-weight:800;letter-spacing:.04em;padding:3px 7px;background:#ecf1fc;color:#425377}',
 '.maths-practice-overview{display:flex;gap:9px;flex-wrap:wrap;margin:22px 0 28px}',
 '.maths-practice-overview span{background:#eaf0fa;padding:9px 12px;font-size:12px;font-weight:800;color:#485470}',
 '.maths-question-unavailable{padding:16px;border-left:4px solid var(--book-color);background:#f5f6fa}'
].join('');
document.head.append(css);
function chapterRow(id,title,num,finished,isActive){
 return '<button class="chapter '+(isActive?'active':'')+'" data-topic="'+safe(id)+'">'+
 '<span class="status-dot '+(finished?'complete':'')+'" data-complete-toggle="'+safe(id)+'" title="Toggle completed"></span>'+
 '<span class="chapter-number">'+String(num).padStart(2,'0')+'</span>'+
 '<span class="chapter-title">'+safe(title)+'</span></button>';
}
function practiceTopics(c){
 return [['mixed','Full mixed practice']].concat(c.skills);
}
function currentTopics(c){
 return state.mode==='exercise'?practiceTopics(c):c.chapters.map(ch=>[ch.id,ch.title]).concat(c.skills);
}
openBook=function(code,mode,topic){
 const c=courses[code];
 if(!c)return;
 const allowed=(mode==='exercise'?practiceTopics(c):c.chapters.map(ch=>[ch.id,ch.title]).concat(c.skills)).map(row=>row[0]);
 const stored=topic||localStorage.getItem(placeKey(code,mode));
 const next=allowed.includes(stored)?stored:mode==='exercise'?'mixed':c.chapters[0].id;
 originalOpenBook(code,mode,next);
};
window.openMathsBook=openBook;
renderContents=function(){
 const c=courses[state.course],finished=new Set(done(state.mode,state.course)),b=c.boundaries;
 bookChip.textContent=c.short+' '+(state.mode==='textbook'?'TEXTBOOK':'EXERCISES');
 bookChip.style.background=c.color;
 edgeCourse.textContent='TEXTBOOK';edgeMode.textContent='EXERCISES';
 edgeCourse.classList.toggle('muted',state.mode!=='textbook');
 edgeMode.classList.toggle('muted',state.mode!=='exercise');
 edgeCourse.title='Open textbook';edgeMode.title='Open exercises';
 gradeCard.style.display=b?'':'none';
 if(b)gradeCard.innerHTML='<div class="grade-card-head"><strong>June 2026 boundaries</strong><span>RAW / '+b.max+'</span></div><div class="grade-row">'+
 ['A','B','C','D','E'].map(g=>'<div class="grade-boundary"><b>'+g+'</b><span>'+b[g]+'</span></div>').join('')+'</div>';
 if(state.mode==='exercise'){
  let html='<div class="part">MIXED EXERCISES</div>'+chapterRow('mixed','50 questions · all topics',1,finished.has('mixed'),state.topic==='mixed');
  if(c.skills.length){
   html+='<div class="part">FOCUSED EXERCISES · 50 EACH</div>';
   c.skills.forEach(([id,title],i)=>{html+=chapterRow(id,title,i+1,finished.has(id),state.topic===id);});
  }
  chapterList.innerHTML=html;
  return;
 }
 let html='<div class="part">TEXTBOOK CHAPTERS</div>';
 c.chapters.forEach((ch,i)=>{
  const active=ch.id===state.topic;
  html+=chapterRow(ch.id,ch.title,i+1,finished.has(ch.id),active);
  if(active)html+='<div class="maths-subsections">'+ch.sections.map((s,j)=>
   '<a href="#'+sid(ch,j)+'"><span>'+safe(s.number)+' '+safe(s.title)+'</span><span class="maths-page-number">p.'+s.page+'</span></a>'
  ).join('')+'</div>';
 });
 if(c.skills.length){
  html+='<div class="part">INTERACTIVE SKILL LESSONS</div>';
  c.skills.forEach(([id,title],i)=>{html+=chapterRow(id,title,i+1,finished.has(id),state.topic===id);});
 }
 chapterList.innerHTML=html;
};
function chapterSectionRows(ch){
 return '<ul class="maths-section-list">'+ch.sections.map((s,i)=>
  '<li id="'+sid(ch,i)+'"><b>'+safe(s.number)+'</b><span>'+safe(s.title)+'</span><small>p. '+s.page+'</small></li>'
 ).join('')+'</ul>';
}
footer=function(i){
 const c=courses[state.course],topics=currentTopics(c),index=topics.findIndex(t=>t[0]===state.topic);
 const before=topics[index-1],after=topics[index+1];
 const advance=state.mode==='textbook'?'data-complete-current="true"':'';
 return '<footer class="page-footer"><button class="next" data-topic="'+(before?before[0]:'')+'" '+(before?'':'disabled')+'>'+
 (before?'← '+safe(before[1]):'')+'</button><span class="page-no">'+
 (state.mode==='textbook'?'Chapter ':'Practice set ')+String(index+1).padStart(2,'0')+
 '</span><button class="next" '+advance+' '+(after?'data-topic="'+after[0]+'"':'data-finish-book="true"')+'>'+
 (after?safe(after[1])+' →':'Finish ✓')+'</button></footer>';
};
activeExercises=function(){
 if(state.topic==='mixed')return window.mathsMixedExercises?.[state.course]||[];
 return originalExercises();
};
exerciseQ=function(question,i,total){
 let html=originalExerciseQ(question,i,total);
 if(question.topic)html=html.replace('<span class="marks">','<span class="maths-topic-tag">'+safe(question.topic)+'</span><span class="marks">');
 return html;
};
renderText=function(c,i){
 const ch=c.chapters.find(ch=>ch.id===state.topic);
 if(!ch)return originalText(c,i);
 lesson.innerHTML='<h1>'+safe(ch.title)+'</h1><p class="lead">'+safe(ch.intro)+'</p>'+
 '<div class="rule"></div><h2>Chapter contents</h2>'+chapterSectionRows(ch)+
 '<h2>Core facts</h2><ul class="maths-keypoints">'+ch.facts.map(f=>'<li>'+safe(f)+'</li>').join('')+'</ul>'+
 '<div class="formula">'+safe(ch.formula)+'</div>'+
 '<div class="maths-source-note"><b>Source:</b> Pearson Edexcel IAL '+safe(c.short)+
 ' student book, chapter '+ch.id.split('-c')[1]+', from printed page '+ch.page+
 '. These are original study notes, not a reproduction of the textbook PDF.</div>'+footer(i);
};
renderExercise=function(c,i){
 const items=activeExercises();
 if(!items.length){
  lesson.innerHTML='<h1>'+safe(c.name)+' exercises</h1>'+
  '<p class="maths-question-unavailable">The interactive 50-question set for this course has not been authored yet. The original P1 and D1 question banks are still available.</p>'+footer(i);
  return;
 }
 originalExercise(c,i);
 if(state.topic==='mixed'){
  const title=lesson.querySelector('h1');
  if(title)title.textContent=c.name+' — mixed practice';
  const firstBand=lesson.querySelector('.exercise-intro');
  if(firstBand)firstBand.insertAdjacentHTML('beforebegin',
   '<div class="maths-practice-overview"><span>1–10 Normal</span><span>11–20 Hard</span>'+
   '<span>21–40 Exam</span><span>41–50 A*</span></div>');
 }
};
estimatedGrade=function(course,percentage){
 const b=courses[course]?.boundaries;
 if(!b)return '—';
 const points=percentage/100*b.max;
 for(const grade of ['A','B','C','D','E'])if(points>=b[grade])return grade;
 return 'U';
};
finish=function(){
 const list=activeExercises(),total=list.length;
 if(!total||Object.keys(state.marks).length!==total)return;
 const right=Object.values(state.marks).filter(mark=>mark==='right').length;
 const percent=100*right/total,pass=percent>=70,c=courses[state.course],b=c.boundaries;
 const currentId=state.topic,r=document.getElementById('scoreResult');
 complete('exercise',state.course,currentId,pass);
 r.className='score-result show '+(pass?'pass':'fail');
 document.getElementById('resultTitle').textContent=pass?'Practice complete ✓':'Practice not complete yet';
 document.getElementById('resultScore').textContent=right+' / '+total;
 document.getElementById('resultPercent').textContent=percent.toFixed(1)+'%';
 document.getElementById('resultGrade').textContent=estimatedGrade(state.course,percent);
 document.getElementById('gradeNote').textContent=b?
  'Estimated using June 2026 Pearson Edexcel IAL '+c.short+' raw boundaries out of '+b.max+'.':
  'No official exam grade boundaries have been configured for '+c.short+'.';
 if(pass){
  const practice=practiceTopics(c),idx=practice.findIndex(item=>item[0]===currentId),next=currentId==='mixed'?null:practice[idx+1];
  document.getElementById('resultText').textContent=next?'Opening the next practice set…':'You have completed this practice set.';
  renderContents();
  if(next)setTimeout(()=>{
   if(state.course!==c.short.toLowerCase()||state.mode!=='exercise'||state.topic!==currentId)return;
   state.topic=next[0];
   state.marks=savedMarks(state.course,state.topic);
   localStorage.setItem(placeKey(state.course,state.mode),state.topic);
   renderContents();renderLesson();scrollTo({top:0,behavior:'smooth'});
  },900);
 }else{
  state.marks=Object.fromEntries(Object.entries(state.marks).filter(([,mark])=>mark==='unsure'));
  saveMarks();document.getElementById('liveScore').textContent='0/'+total;
  document.querySelectorAll('.mark').forEach(button=>
   button.classList.toggle('selected',button.dataset.mark==='unsure'&&state.marks[button.dataset.index]==='unsure'));
  document.getElementById('resultText').textContent='Below 70%: retry the set. Your ? markers remain saved for review.';
  renderContents();
 }
};
})();