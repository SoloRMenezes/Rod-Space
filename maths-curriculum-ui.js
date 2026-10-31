// Bookshelf chapter navigation and study guides; existing P1/D1 skill lessons remain intact.
(function(){
'use strict';
const catalogue=window.mathsCurriculum;
if(!catalogue)return;
const legacy={p1:courses.p1.topics.slice(),d1:courses.d1.topics.slice()};
for(const [code,book] of Object.entries(catalogue)){
 const skills=legacy[code]||[];
 courses[code]={
  name:book.name,short:book.short,color:book.color,boundaries:gradeBoundaries[code]||null,
  chapters:book.chapters,skills:skills,
  topics:book.chapters.map(ch=>[ch.id,ch.title]).concat(skills)
 };
}
const safe=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const sid=(ch,i)=>'maths-section-'+ch.id+'-'+i;
const originalText=renderText,originalExercise=renderExercise;
const css=document.createElement('style');
css.textContent='.maths-subsections{margin:0 0 10px 34px;padding:1px 0 8px 11px;border-left:2px solid #cfc7ba}.maths-subsections a{display:flex;justify-content:space-between;gap:10px;padding:5px 3px;color:#697185;text-decoration:none;font-size:11px;line-height:1.4}.maths-subsections a:hover{text-decoration:underline;color:#17213b}.maths-section-list{list-style:none;margin:12px 0 32px;padding:0}.maths-section-list li{display:flex;gap:15px;align-items:baseline;justify-content:space-between;border-bottom:1px solid #d7dce5;padding:12px 4px;font-size:15px;scroll-margin-top:120px}.maths-section-list li span{flex:1}.maths-section-list li small{white-space:nowrap;color:#778194;font-weight:800}.maths-section-list li b{font-size:13px;color:var(--book-color)}.maths-keypoints{padding-left:25px;margin:15px 0 22px}.maths-keypoints li{margin:8px 0}.maths-source-note{font-size:13px;color:#6d7481;margin:22px 0;padding:12px 15px;border-left:3px solid var(--book-color);background:#f3f5fa}.maths-study-action{border:0;color:#fff;background:var(--book-color);padding:12px 16px;font-weight:800;cursor:pointer}.maths-status-line{font-size:13px;color:#5e6570;margin:12px 0 18px}.maths-page-number{color:#8791a1;font-size:10px}';
document.head.append(css);
function chapterRow(id,title,num,finished,isActive){
 return '<button class="chapter '+(isActive?'active':'')+'" data-topic="'+safe(id)+'"><span class="status-dot '+(finished?'complete':'')+'" data-complete-toggle="'+safe(id)+'" title="Toggle completed"></span><span class="chapter-number">'+String(num).padStart(2,'0')+'</span><span class="chapter-title">'+safe(title)+'</span></button>';
}
renderContents=function(){
 const c=courses[state.course],finished=new Set(done(state.mode,state.course)),b=c.boundaries;
 bookChip.textContent=c.short+' '+(state.mode==='textbook'?'TEXTBOOK':'EXERCISES');
 bookChip.style.background=c.color;
 edgeCourse.textContent='TEXTBOOK';edgeMode.textContent='EXERCISES';
 edgeCourse.classList.toggle('muted',state.mode!=='textbook');
 edgeMode.classList.toggle('muted',state.mode!=='exercise');
 edgeCourse.title='Open textbook for this topic';edgeMode.title='Open exercises for this topic';
 gradeCard.style.display=b?'':'none';
 if(b){gradeCard.innerHTML='<div class="grade-card-head"><strong>June 2026 boundaries</strong><span>RAW / '+b.max+'</span></div><div class="grade-row">'+['A','B','C','D','E'].map(g=>'<div class="grade-boundary"><b>'+g+'</b><span>'+b[g]+'</span></div>').join('')+'</div>';}
 let html='<div class="part">TEXTBOOK CHAPTERS</div>';
 c.chapters.forEach((ch,i)=>{
  const active=ch.id===state.topic;
  html+=chapterRow(ch.id,ch.title,i+1,finished.has(ch.id),active);
  if(active){html+='<div class="maths-subsections">'+ch.sections.map((s,j)=>'<a href="#'+sid(ch,j)+'"><span>'+safe(s.number)+' '+safe(s.title)+'</span><span class="maths-page-number">p.'+s.page+'</span></a>').join('')+'</div>';}
 });
 if(c.skills.length){html+='<div class="part">EXTRA INTERACTIVE SKILL LESSONS</div>';c.skills.forEach(([id,title],i)=>html+=chapterRow(id,title,i+1,finished.has(id),id===state.topic));}
 chapterList.innerHTML=html;
};
function chapterSectionRows(ch){
 return '<ul class="maths-section-list">'+ch.sections.map((s,i)=>'<li id="'+sid(ch,i)+'"><b>'+safe(s.number)+'</b><span>'+safe(s.title)+'</span><small>p. '+s.page+'</small></li>').join('')+'</ul>';
}
renderText=function(c,i){
 const ch=c.chapters.find(ch=>ch.id===state.topic);
 if(!ch)return originalText(c,i);
 lesson.innerHTML='<h1>'+safe(ch.title)+'</h1><p class="lead">'+safe(ch.intro)+'</p><div class="rule"></div><h2>Chapter contents</h2>'+chapterSectionRows(ch)+
  '<h2>Core facts</h2><ul class="maths-keypoints">'+ch.facts.map(f=>'<li>'+safe(f)+'</li>').join('')+'</ul>'+
  '<div class="formula">'+safe(ch.formula)+'</div>'+
  '<div class="maths-source-note"><b>Source:</b> Pearson Edexcel IAL '+safe(c.short)+' student book, chapter '+String(ch.id).split('-c')[1]+', from printed page '+ch.page+'. This is a chapter guide, not a reproduction of the full PDF.</div>'+footer(i);
};
renderExercise=function(c,i){
 const ch=c.chapters.find(ch=>ch.id===state.topic);
 if(!ch)return originalExercise(c,i);
 const isDone=done('exercise',state.course).includes(ch.id);
 lesson.innerHTML='<h1>'+safe(ch.title)+' — exercises</h1><p class="lead">Use the chapter exercises in your original Pearson Edexcel '+safe(c.short)+' PDF. The section and starting page references below match your copy.</p>'+
  '<div class="rule"></div><h2>Practice by section</h2>'+chapterSectionRows(ch)+
  '<div class="maths-source-note">Open your '+safe(c.short)+' PDF in Desktop/Rodrigo/School/Maths/Books. These are page references, not embedded textbook questions or an automatically graded test.</div>'+
  '<p class="maths-status-line">'+(isDone?'Marked completed.':'When you finish the chapter exercises, mark them completed here.')+'</p>'+
  '<button class="maths-study-action" data-complete-chapter="'+safe(ch.id)+'">'+(isDone?'Mark incomplete':'Mark exercises completed')+'</button>'+footer(i);
};
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-complete-chapter]');
 if(!button)return;
 const id=button.dataset.completeChapter,finished=done('exercise',state.course).includes(id);
 complete('exercise',state.course,id,!finished);renderContents();renderLesson();
});
})();
