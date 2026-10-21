(function () {
  'use strict';
  // Original questions: these are difficulty-matched practice, not copied textbook or past-paper questions.
  const question = (q, a, w, m) => ({q, a, w, m});
  const make = (core, hard, exam, challenge) => [
    ...Array.from({length: 10}, (_, i) => ({...core(i), d: 'Book practice'})),
    ...Array.from({length: 10}, (_, i) => ({...hard(i), d: 'Hard book practice'})),
    ...Array.from({length: 20}, (_, i) => ({...exam(i), d: 'Past-paper style'})),
    ...Array.from({length: 10}, (_, i) => ({...challenge(i), d: 'A* challenge'}))
  ];
  const fmt = n => Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
  const sign = n => n < 0 ? `− ${-n}` : `+ ${n}`;
  const sum = values => values.reduce((a, b) => a + b, 0);
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const fraction = (n, d) => {const g = gcd(Math.abs(n), Math.abs(d)); const top = n / g * Math.sign(d), bottom = Math.abs(d) / g; return bottom === 1 ? String(top) : `${top}/${bottom}`;};
  const bubble = values => {const a = [...values]; for (let j = 0; j < a.length - 1; j++) if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]]; return a;};
  const trace = (values, target) => {let lo = 0, hi = values.length - 1; const seen = []; while (lo <= hi) {const mid = Math.floor((lo + hi) / 2); seen.push(values[mid]); if (values[mid] === target) break; if (values[mid] < target) lo = mid + 1; else hi = mid - 1;} return seen;};
  const firstFit = (items, cap) => {const bins = []; for (const item of items) {let bin = bins.find(b => sum(b) + item <= cap); if (!bin) {bin = []; bins.push(bin);} bin.push(item);} return bins;};
  const bins = result => result.map(b => `(${b.join(', ')})`).join(', ');
  const bank = {};

  bank.surds = make(
    i => {const r = [2, 3, 5, 6, 7][i % 5], a = i + 2, n = a * a * r; return question(`Simplify √${n}.`, `${a}√${r}`, [`Find a square factor: ${n} = ${a * a} × ${r}.`, `Split the root: √${n} = √${a * a} × √${r}.`, `Evaluate √${a * a} = ${a}, giving ${a}√${r}.`], 2);},
    i => {const r = [2, 3, 5, 7, 11][i % 5], a = i + 2, b = i % 4 + 1, c = i % 3 + 2; return question(`Simplify ${b}√${a*a*r} + ${c}√${r}.`, `${b*a+c}√${r}`, [`Write √${a*a*r} = ${a}√${r}.`, `Multiply: ${b} × ${a}√${r} = ${b*a}√${r}.`, `Add like surds: (${b*a} + ${c})√${r} = ${b*a+c}√${r}.`], 3);},
    i => {const r = [2, 3, 5, 6, 7][i % 5], n = i + 2, g=gcd(n,r), top=n/g, bottom=r/g, result=bottom===1?`${top===1?'':top}√${r}`:`${top===1?'':top}√${r}/${bottom}`; return i < 10 ? question(`Rationalise ${n}/√${r}.`, result, [`Multiply top and bottom by √${r}.`, `The numerator becomes ${n}√${r}; the denominator becomes ${r}.`, `Cancel the common factor ${g}: ${result}.`], 3) : question(`Expand (√${r}+${n})(√${r}−${n}).`, `${r-n*n}`, [`Recognise (a+b)(a−b)=a²−b².`, `Here a²=${r} and b²=${n*n}.`, `Subtract: ${r}−${n*n}=${r-n*n}.`], 3);},
    i => {const a = i + 2, r = [2, 3, 5, 6, 7][i % 5], den = a*a-r; return question(`Rationalise 1/(${a}+√${r}).`, `(${a}−√${r})/${den}`, [`Multiply numerator and denominator by the conjugate (${a}−√${r}).`, `The denominator is ${a}²−(√${r})²=${a*a}−${r}=${den}.`, `Keep the conjugate in the numerator: (${a}−√${r})/${den}.`], 5);}
  );
  bank.quadratics = make(
    i => {const p = i+1, r = i%4+2, b = p+r, c = p*r; return question(`Solve x² − ${b}x + ${c} = 0.`, `x=${p} or x=${r}`, [`Find two numbers with sum ${b} and product ${c}: ${p} and ${r}.`, `Factorise: (x−${p})(x−${r})=0.`, `Set each factor to zero: x=${p} or x=${r}.`], 2);},
    i => {const h = i-4, k = i%5-3, b = -2*h, c = h*h+k; return question(`Complete the square: x² ${sign(b)}x ${sign(c)}.`, `(x ${sign(-h)})² ${sign(k)}`, [`Half the x coefficient ${b} to get ${-h}.`, `Form (x ${sign(-h)})² = x² ${sign(b)}x + ${h*h}.`, `Adjust the constant by ${k}: (x ${sign(-h)})² ${sign(k)}.`], 3);},
    i => {const p = i%7-3, r = p+(i%5+2), b = -(p+r), c = p*r; return question(`Solve x² ${sign(b)}x ${sign(c)} = 0 and check both roots.`, `x=${p} or x=${r}`, [`Look for two numbers whose sum is ${p+r} and product is ${c}.`, `Factorise as (x−(${p}))(x−(${r}))=0.`, `Set each factor to zero, then substitute both values into the original equation.`], 4);},
    i => {const a = i%3+1, b = i+3, c = -(i%5+1), d = b*b-4*a*c; return question(`Solve ${a}x² + ${b}x ${sign(c)} = 0 exactly.`, `x=(−${b} ± √${d})/${2*a}`, [`Identify a=${a}, b=${b}, c=${c}.`, `Calculate Δ=b²−4ac=${b*b}−4(${a})(${c})=${d}.`, `Substitute into x=(−b±√Δ)/(2a): x=(−${b}±√${d})/${2*a}.`], 5);}
  );
  bank.sketching = make(
    i => {const p=i-4, r=p+i%4+2, axis=(p+r)/2; return question(`For y=(x−(${p}))(x−(${r})), state both roots and the axis.`, `Roots ${p}, ${r}; axis x=${fmt(axis)}`, [`Set each factor to zero to obtain x=${p} and x=${r}.`, `Average the roots: (${p}+${r})/2=${fmt(axis)}.`, `The symmetry axis is x=${fmt(axis)}.`], 2);},
    i => {const h=i-5,k=i%7-3,a=i%2?2:-2; return question(`Give the vertex, direction and range of y=${a}(x−(${h}))² ${sign(k)}.`, `Vertex (${h},${k}); opens ${a>0?'up':'down'}; ${a>0?'y≥':'y≤'}${k}`, [`Read the vertex from completed-square form: (${h},${k}).`, `The leading coefficient ${a} is ${a>0?'positive':'negative'}, so the curve opens ${a>0?'up':'down'}.`, `Its ${a>0?'minimum':'maximum'} y-value is ${k}.`], 3);},
    i => {const p=i%8-3,r=p+i%5+2,h=(p+r)/2,k=(h-p)*(h-r); return question(`Sketch y=(x−(${p}))(x−(${r})). State roots, axis and turning point.`, `Roots ${p}, ${r}; axis x=${fmt(h)}; turning point (${fmt(h)},${fmt(k)})`, [`The factors give roots x=${p} and x=${r}.`, `The axis is halfway between them: x=(${p}+${r})/2=${fmt(h)}.`, `Substitute x=${fmt(h)} to get y=${fmt(k)}; mark the point and draw an upward parabola.`], 4);},
    i => {const h=i-4,k=-(i%5),a=i%3+1,c=a*h*h+k,t=fraction(-k,a),root=k===0?`(${h},0)`:`(${h}−√(${t}),0) and (${h}+√(${t}),0)`; return question(`Find all intercepts of y=${a}(x−(${h}))² ${sign(k)}.`, `y-intercept (0,${c}); x-intercept${k===0?'':'s'} ${root}`, [`Set x=0: y=${a}(${h*h}) ${sign(k)}=${c}.`, `Set y=0: (x−${h})²=${t}.`, k===0?`Therefore x=${h}.`:`Take both square roots: x=${h}±√(${t}).`], 5);}
  );
  bank.discriminant = make(
    i => {const a=i%3+1,b=i+1,c=i%5-2,d=b*b-4*a*c; return question(`Find Δ for ${a}x² + ${b}x ${sign(c)} = 0.`, `${d}`, [`Identify a=${a}, b=${b}, c=${c}.`, `Substitute into Δ=b²−4ac: ${b*b}−4(${a})(${c}).`, `Evaluate to get Δ=${d}.`], 2);},
    i => {const a=i%4+1,b=i+2,c=i%6+1,d=b*b-4*a*c; return question(`How many real roots has ${a}x² + ${b}x + ${c} = 0?`, d>0?'Two distinct real roots':d===0?'One repeated real root':'No real roots', [`Calculate Δ=${b}²−4(${a})(${c})=${d}.`, `Compare Δ with zero.`, d>0?'Positive Δ means two distinct real roots.':d===0?'Zero Δ means one repeated real root.':'Negative Δ means no real roots.'], 3);},
    i => {const a=i%3+1,b=i%7+2,c=i%5+1,d=b*b-4*a*c; return question(`Without solving, classify the roots of ${a}x²−${b}x+${c}=0.`, d>0?'Two distinct real roots':d===0?'One repeated real root':'No real roots', [`Take the signed coefficient b=−${b}.`, `Calculate Δ=(−${b})²−4(${a})(${c})=${d}.`, `Use the sign of Δ to classify the roots.`], 4);},
    i => {const a=i%3+1,c=i+2,n=4*a*c; return question(`Find all k for which ${a}x²+kx+${c}=0 has a repeated root.`, `k=±√${n}`, [`A repeated root requires Δ=0.`, `So k²−4(${a})(${c})=0, giving k²=${n}.`, `Take both square roots: k=±√${n}.`], 5);}
  );
  bank.graphs = make(
    i => {const m=i%7-3||2,c=i-5,x=fraction(-c,m); return question(`Find both intercepts of y=${m}x ${sign(c)}.`, `(0,${c}) and (${x},0)`, [`Set x=0 to get the y-intercept (0,${c}).`, `Set y=0 and solve ${m}x ${sign(c)}=0.`, `This gives x=${x} for the x-intercept.`], 2);},
    i => {const a=i%5+1,h=i-4,k=i%7-3; return question(`State both asymptotes of y=${a}/(x−(${h})) ${sign(k)}.`, `x=${h}, y=${k}`, [`The denominator is zero at x=${h}, so this is the vertical asymptote.`, `As |x| becomes large, ${a}/(x−(${h})) approaches zero.`, `Therefore the horizontal asymptote is y=${k}.`], 3);},
    i => {const p=i-7,r=p+i%4+1,c=p*r,b=p+r; return question(`Find the intersections of y=x² and y=${b}x ${sign(-c)}.`, `(${p},${p*p}) and (${r},${r*r})`, [`Set the y-values equal: x²=${b}x ${sign(-c)}.`, `Rearrange and factorise: (x−(${p}))(x−(${r}))=0.`, `Substitute x=${p} and x=${r} into y=x² to get both coordinates.`], 4);},
    i => {const p=i%5+1,h=i-5,k=i%5-2; return question(`For y=${i%2?'−':''}${p}(x−(${h}))³ ${sign(k)}, give the inflection point and end behaviour.`, `Inflection point (${h},${k}); ${i%2?'falls':'rises'} from left to right`, [`Start with y=x³, whose inflection point is (0,0).`, `Translate by (${h},${k}) and scale vertically by ${p}.`, i%2?'The minus sign reflects it in the x-axis, so it falls from left to right.':'The positive coefficient preserves its rising end behaviour.'], 5);}
  );
  bank.transformations = make(
    i => {const a=i-5,b=i%7-3; return question(`Describe y=f(x−(${a})) ${sign(b)} from y=f(x).`, `Translation by (${a},${b})`, [`The inside change x−(${a}) shifts the graph horizontally by ${a}.`, `The outside change ${sign(b)} shifts it vertically by ${b}.`, `Combine them into translation vector (${a},${b}).`], 2);},
    i => {const a=i+2,inside=i%3===0,negative=i%2===1; return question(`Describe y=${negative?'−':''}${a}f(${inside?'−x':'x'}).`, `${inside?'Reflect in the y-axis; ':''}${negative?'reflect in the x-axis; ':''}vertical stretch factor ${a}`, [`${inside?'The −x inside f reflects the graph in the y-axis.':'The input x is unchanged.'}`, `${negative?'The negative sign outside f reflects it in the x-axis.':'There is no x-axis reflection.'}`, `Multiply all y-values by ${a} for a vertical stretch.`], 3);},
    i => {const x=i%9-4,y=i*3%11-5,a=i%4+1,b=i%7-3; return question(`(${x},${y}) lies on y=f(x). Map it onto y=${a}f(x−(${b})).`, `(${x+b},${a*y})`, [`The inside translation changes x from ${x} to ${x}+(${b})=${x+b}.`, `The outside factor multiplies y: ${a}×(${y})=${a*y}.`, `The mapped point is (${x+b},${a*y}).`], 4);},
    i => {const h=i-5,k=i%5-2,a=i%3+2; return question(`Transform y=x² by reflection in the x-axis, vertical stretch ${a}, then translation (${h},${k}). Give the equation.`, `y=−${a}(x−(${h}))² ${sign(k)}`, [`Reflect: y=−x².`, `Stretch vertically: y=−${a}x².`, `Translate by (${h},${k}): y=−${a}(x−(${h}))² ${sign(k)}.`], 5);}
  );
  bank.sorting = make(
    i => {const v=[i+5,i%4+1,i+7,i%6+2]; return question(`Perform one bubble-sort pass on ${v.join(', ')}.`, bubble(v).join(', '), [`Compare the first adjacent pair and swap if out of order.`, `Continue left to right, comparing each new pair.`, `After the last comparison the list is ${bubble(v).join(', ')}.`], 2);},
    i => {const v=[i+8,i%5+2,i+3,i%7+1,i+10], n=v.reduce((s,x,j)=>s+v.slice(j+1).filter(y=>y<x).length,0); return question(`How many swaps does bubble sort need for ${v.join(', ')}?`, `${n} swaps`, [`Count each inversion: a larger value before a smaller one.`, `Every adjacent swap removes exactly one inversion.`, `There are ${n} inversions, so ${n} swaps are needed.`], 3);},
    i => {const p=i+4,v=[i%3+1,p+3,p,p-2,p+6,p-1],lo=v.filter(x=>x<p),hi=v.filter(x=>x>p); return question(`Quick-sort partition ${v.join(', ')} using ${p} as pivot.`, `${lo.join(', ')} | ${p} | ${hi.join(', ')}`, [`Take ${p} out as the pivot.`, `Place values smaller than ${p} to the left: ${lo.join(', ')}.`, `Place larger values to the right: ${hi.join(', ')}.`], 4);},
    i => {const n=i+6,total=n*(n-1)/2; return question(`A reverse-ordered list has ${n} items. Derive the total bubble-sort swaps.`, `${total} swaps`, [`Every pair is inverted in a reverse-ordered list.`, `There are ${n}×(${n}−1)/2 unordered pairs.`, `Evaluate ${n}×${n-1}/2=${total} swaps.`], 5);}
  );
  bank.searching = make(
    i => {const v=Array.from({length:7},(_,j)=>j*3+i),t=v[i%7],seen=trace(v,t); return question(`Binary-search for ${t} in ${v.join(', ')}. List checked values.`, seen.join(' → '), [`Check the middle value ${seen[0]}.`, `After each comparison, keep only the half that can contain ${t}.`, `The checked values are ${seen.join(' → ')}.`], 2);},
    i => {const n=2**(i+4),checks=Math.floor(Math.log2(n))+1; return question(`What is the maximum number of comparisons in a successful binary search of ${n} sorted items?`, `${checks}`, [`After one check, at most half the candidates remain.`, `Keep halving until one candidate remains.`, `For ${n} items, a successful search can take ${checks} comparisons.`], 3);},
    i => {const v=Array.from({length:15},(_,j)=>2*j+i),t=v[i*3%15],seen=trace(v,t); return question(`Trace binary search for ${t} in ${v.join(', ')} using the lower middle at each step.`, seen.join(' → '), [`Begin with all 15 sorted values and check the middle.`, `Discard the half impossible after each comparison.`, `The checks in order are ${seen.join(' → ')}.`], 4);},
    i => {const n=1000*(i+1),k=Math.ceil(Math.log2(n)); return question(`Find the least integer k such that 2ᵏ≥${n}, and explain its use in binary search.`, `k=${k}`, [`Compare consecutive powers of two around ${n}.`, `2^${k-1}=${2**(k-1)}<${n}≤${2**k}=2^${k}.`, `Thus k=${k} is the least such integer; it estimates halvings needed.`], 5);}
  );
  bank.packing = make(
    i => {const cap=10+i,v=[6+i,4-i%2,3,2+i%2],result=firstFit(v,cap); return question(`First-fit ${v.join(', ')} into bins of capacity ${cap}.`, bins(result), [`Read items in the stated order.`, `For each item, scan open bins from the first and use the first with room.`, `The resulting bins are ${bins(result)}.`], 2);},
    i => {const cap=10+i,v=[7+i,6+i,i%4+2,5,4,3],sorted=[...v].sort((a,b)=>b-a),result=firstFit(sorted,cap); return question(`Apply first-fit decreasing to ${v.join(', ')} with capacity ${cap}.`, bins(result), [`Sort decreasing: ${sorted.join(', ')}.`, `Place each item in the first bin with enough room.`, `The final bins are ${bins(result)}.`], 3);},
    i => {const cap=12+i,v=[i+2,7+i,4,6,i%4+1,5],result=firstFit(v,cap),bound=Math.ceil(sum(v)/cap); return question(`First-fit ${v.join(', ')} into capacity-${cap} bins; find a lower bound.`, `${bins(result)}; lower bound ${bound}`, [`Place items in order by first fit: ${bins(result)}.`, `Their total size is ${sum(v)}.`, `Divide by capacity and round up: ⌈${sum(v)}/${cap}⌉=${bound}.`], 4);},
    i => {const cap=12+i,v=[8+i,7,6,5,4,3,i%3+2],sorted=[...v].sort((a,b)=>b-a),result=firstFit(sorted,cap),bound=Math.ceil(sum(v)/cap); return question(`Find an FFD packing for ${v.join(', ')} in capacity-${cap} bins. Does it meet the size lower bound?`, `${bins(result)}; ${result.length===bound?'yes':'no'} (${result.length} versus ${bound})`, [`Sort decreasing: ${sorted.join(', ')}.`, `Apply first fit: ${bins(result)} (${result.length} bins).`, `The size lower bound is ⌈${sum(v)}/${cap}⌉=${bound}; compare the counts.`], 5);}
  );
  bank.critical = make(
    i => {const paths=[i+7,i+10,i+5],long=Math.max(...paths); return question(`Three start-to-finish paths last ${paths.join(', ')} days. Find the project duration.`, `${long} days`, [`List all path lengths: ${paths.join(', ')}.`, `Every path must finish before the project ends.`, `The longest is ${long}, so duration is ${long} days.`], 2);},
    i => {const es=i,d=i%5+3,lf=es+d+i%4,float=lf-d-es; return question(`An activity has earliest start ${es}, duration ${d}, latest finish ${lf}. Find total float.`, `${float}`, [`Use float = latest finish − duration − earliest start.`, `Substitute: ${lf}−${d}−${es}.`, `The activity has ${float} time units of float.`], 3);},
    i => {const times=[i+4,i+7,i%3+i+5],latest=Math.max(...times); return question(`A network merge receives finish times ${times.join(', ')}. Find the earliest event time.`, `${latest}`, [`All incoming activities must finish.`, `Take the maximum of ${times.join(', ')}.`, `The earliest event time is ${latest}.`], 4);},
    i => {const lf=i+18,d=i%6+3,float=i%4,es=lf-d-float; return question(`An activity has latest finish ${lf}, duration ${d}, total float ${float}. Find its earliest start and decide if it is critical.`, `Earliest start ${es}; ${float===0?'critical':'not critical'}`, [`Rearrange float = LF − duration − ES.`, `ES = ${lf}−${d}−${float}=${es}.`, `${float===0?'Zero float makes the activity critical.':'Positive float means it is not critical.'}`], 5);}
  );
  bank.scheduling = make(
    i => {const a=i%5+2,b=i%4+3,c=i%3+2; return question(`A and B run in parallel for ${a} and ${b} days; C follows both for ${c}. Find duration.`, `${Math.max(a,b)+c} days`, [`A and B both start at time 0.`, `C waits until both finish, at time max(${a},${b})=${Math.max(a,b)}.`, `Add C's ${c} days: ${Math.max(a,b)+c}.`], 2);},
    i => {const demand=[i%3+1,i%4+1,i%5+1]; return question(`Three simultaneous activities need ${demand.join(', ')} workers. Find peak demand.`, `${sum(demand)} workers`, [`The activities overlap, so their workers are needed at once.`, `Add ${demand.join(' + ')}.`, `Peak demand is ${sum(demand)} workers.`], 3);},
    i => {const total=60+i*7,duration=10+i%6,bound=Math.ceil(total/duration); return question(`Activities total ${total} worker-days and project duration is ${duration} days. Find lower bound method 1.`, `${bound} workers`, [`One worker can supply at most ${duration} worker-days.`, `Divide total work by time: ${total}/${duration}=${fmt(total/duration)}.`, `Round up: at least ${bound} workers.`], 4);},
    i => {const overlaps=[i%4+2,i%5+3,i%3+4],bound=Math.max(...overlaps); return question(`Vertical tests on a Gantt chart find unavoidable overlaps of ${overlaps.join(', ')}. Give method-2 lower bound and explain why it may not be achievable.`, `${bound} workers`, [`At each test time, count activities that cannot move clear using float.`, `The greatest unavoidable overlap is max(${overlaps.join(', ')})=${bound}.`, `This is only a lower bound; dependencies or other times may require more workers.`], 5);}
  );

  window.mathsQuestionBank = bank;
})();
