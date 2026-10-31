// Readable mathematical layout for Bookshelf, including the original question banks.
// Split chains of calculations vertically instead of displaying long equations sideways.
(function(){
'use strict';
const escape=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function exponents(value){
  return value.replace(/\^\(([^()]*)\)/g,(_,exp)=>'<sup>'+exp+'</sup>')
    .replace(/\^([+\-]?[A-Za-z0-9]+(?:\/[A-Za-z0-9]+)?)/g,(_,exp)=>'<sup>'+exp+'</sup>');
}
function math(value,{trusted=false}={}){
 const input=String(value??'');
 return exponents(trusted?input:escape(input));
}
function formulaRows(value){
 return String(value||'').split(/;\s*/).map(v=>v.trim()).filter(Boolean)
  .map(v=>'<div class="bookshelf-math-row">'+math(v)+'</div>').join('');
}
function splitSteps(text){
 const initial=String(text??'')
  .replace(/;\s+/g,'\n')
  .replace(/\.\s+(?=[A-Z][a-z]|[A-Z][A-Z])/g,'.\n')
  .replace(/,\s+(?=(?:therefore|hence|so|then|finally|now|with|where|since)\b)/gi,'\n')
  .replace(/,\s+(?=(?:[a-z]\([^)]+\)\s*=))/gi,'\n')
  .replace(/:\s+(?=\S)/g,':\n')
  .replace(/(?<=\d)\.\s+(?=[A-Z])/g,'.\n');
 const chunks=initial.split('\n').map(v=>v.trim()).filter(Boolean);
 const result=[];
 for(const chunk of chunks){
  // For f(2) = 16 + 2 − 4 = 14, move '= 14' onto its own line.
  const positions=[...chunk.matchAll(/(?<![<>])\s=\s/g)].map(m=>m.index);
  if(positions.length>=2){
   const first=chunk.slice(0,positions[1]).trim();
   result.push(first);
   let remainder=chunk.slice(positions[1]).trim();
   // Preserve an equation chain on separate lines, keeping its equality signs.
   for(const piece of remainder.split(/\s(?==\s)/).map(v=>v.trim()).filter(Boolean))result.push(piece);
  }else result.push(chunk);
 }
 if(result.length===1){
  const line=result[0];
  // A one-line calculation should not stay a horizontal wall of text.
  const equals=line.indexOf(' = ');
  if(equals>14 && equals<line.length-10){
   return [line.slice(0,equals).trim()+':','='+line.slice(equals+2).trim()];
  }
  const comma=line.indexOf(', ');
  if(comma>20&&comma<line.length-20){
   return [line.slice(0,comma).trim(),line.slice(comma+2).trim()];
  }
 }
 return result;
}
function stepsMarkup(example){
 const steps=splitSteps(example);
 return '<ol class="bookshelf-working-steps">'+steps.map(step=>
  '<li><span class="bookshelf-step-content">'+math(step)+'</span></li>'
 ).join('')+'</ol>';
}
window.bookshelfMathHTML=math;
window.bookshelfFormulaRows=formulaRows;
window.bookshelfWorkedSteps=stepsMarkup;
window.bookshelfPolishLegacy=function(root){
 for(const block of root.querySelectorAll('.formula:not(.bookshelf-formula-stack)')){
  const source=block.innerHTML;
  if(!/(?:&nbsp;|\u00a0){2,}/i.test(source))continue;
  const rows=source.split(/(?:&nbsp;|\u00a0){2,}/i).map(row=>row.trim()).filter(Boolean);
  if(rows.length<2)continue;
  block.classList.add('bookshelf-formula-stack');
  block.innerHTML=rows.map(row=>'<div class="bookshelf-math-row">'+row+'</div>').join('');
 }
};
const styles=document.createElement('style');
styles.textContent=[
 '.maths-lesson-formula,.bookshelf-formula-stack{display:grid!important;grid-template-columns:minmax(0,1fr);gap:0!important;font-style:normal!important;font-weight:500!important;letter-spacing:normal!important}',
 '.bookshelf-math-row{display:block;min-width:0;width:100%;padding:10px 0;font:500 clamp(17px,1.7vw,22px)/1.65 "Cambria Math","STIX Two Math",Georgia,serif;letter-spacing:.01em;overflow-wrap:anywhere;word-break:normal}',
 '.bookshelf-math-row + .bookshelf-math-row{border-top:1px solid #bccde6}',
 '.bookshelf-math-row sup,.bookshelf-working-steps sup,.bookshelf-step-stack sup{font-size:.68em;vertical-align:super;line-height:0}',
 '.bookshelf-working-steps,.bookshelf-step-stack{list-style:none;counter-reset:bookshelfsteps;padding:0;margin:12px 0 0!important;max-width:100%}',
 '.bookshelf-working-steps li,.bookshelf-step-stack li{counter-increment:bookshelfsteps;display:grid!important;grid-template-columns:27px minmax(0,1fr);align-items:start;gap:12px;margin:0!important;padding:12px 0!important;line-height:1.65!important;border-bottom:1px solid #b69c6e30;min-width:0}',
 '.bookshelf-working-steps li:before,.bookshelf-step-stack li:before{content:counter(bookshelfsteps,decimal-leading-zero);color:#9c6a24;font:800 11px/1.7 system-ui,sans-serif;margin-top:4px}',
 '.bookshelf-step-content{min-width:0;overflow-wrap:anywhere;white-space:normal;font:500 16px/1.7 "Cambria Math",Georgia,serif}',
 '.maths-worked{min-width:0;max-width:100%;overflow-wrap:anywhere}',
 '.maths-worked .bookshelf-working-steps{margin-top:8px!important}',
 '.reveal.working .bookshelf-step-stack{margin:8px 0 0!important}',
 '.reveal.working .bookshelf-step-stack li{border-color:#ccd3e0}',
 '.reveal.answer{overflow-wrap:anywhere;line-height:1.7}',
 '.maths-lesson-formula .bookshelf-math-row:first-child{padding-top:2px}',
 '.maths-lesson-formula .bookshelf-math-row:last-child{padding-bottom:2px}',
 '@media(max-width:650px){.bookshelf-math-row{font-size:17px;line-height:1.65}.bookshelf-step-content{font-size:15px}.bookshelf-working-steps li,.bookshelf-step-stack li{gap:8px}}'
].join('');
document.head.append(styles);

// 'reveals' is defined in the original page script; preserve the original buttons and IDs.
reveals=function(question,prefix,index){
 const answer=math(question.a,{trusted:/<(?:sup|sub|span|div|strong|em)\b/i.test(String(question.a))});
 let lines=Array.isArray(question.w)?question.w.flatMap(splitSteps):splitSteps(question.w);
 if(!lines.length)lines=['No working available.'];
 const rawHTML=/(?:<(?:sup|sub|span|div|strong|em)\b|&(?:gt|lt|nbsp);)/i;
 const working='<ol class="bookshelf-step-stack">'+lines.map(line=>
  '<li><span class="bookshelf-step-content">'+math(line,{trusted:rawHTML.test(line)})+'</span></li>'
 ).join('')+'</ol>';
 return '<div class="q-actions"><button data-reveal="'+prefix+'a'+index+'">Show answer</button>'+
 '<button data-reveal="'+prefix+'w'+index+'">Show working</button></div>'+
 '<div class="reveal answer" id="'+prefix+'a'+index+'"><b>Answer:</b> '+answer+'</div>'+
 '<div class="reveal working" id="'+prefix+'w'+index+'"><b>Working:</b> '+working+'</div>';
};
})();