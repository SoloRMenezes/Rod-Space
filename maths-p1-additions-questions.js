(function () {
  'use strict';
  // 50 original parameterised problems per additional Pure 1 topic, with worked answers.
  const make = build => Array.from({length: 50}, (_, i) => {
    const tier = i < 10 ? 0 : i < 20 ? 1 : i < 40 ? 2 : 3;
    const x = build(i % 10, tier, i);
    return {q: x[0], a: x[1], w: x[2], m: [2, 3, 4, 5][tier], d: ['Book practice','Hard book practice','Past-paper style','A* challenge'][tier]};
  });
  const s = n => n < 0 ? '− '+Math.abs(n) : '+ '+n;
  const gcd = (a,b) => b ? gcd(b,a%b) : a;
  const pi = (n,d=1) => {const g=gcd(n,d); n/=g; d/=g; return (n===1?'':n)+'π'+(d===1?'':'/'+d);};
  const pow = (a,n) => a+'x'+(n===1?'':n===0?'⁰':'^'+n);
  const q = {};

  q.algebra = make((i,t) => {
    const a=i+2,b=i%6+2,c=i%3+1,d=i%4+1;
    if(t===0) return ['Expand (x+'+a+')(x+'+b+').','x²+'+(a+b)+'x+'+(a*b),['Multiply each term: x·x, x·'+b+', '+a+'·x and '+a+'·'+b+'.','Combine the x terms: '+a+'x+'+b+'x='+(a+b)+'x.','Constant term is '+a*b+'.']];
    if(t===1) return ['Factorise x²+'+(a+b)+'x+'+(a*b)+'.','(x+'+a+')(x+'+b+')',['Find two integers whose sum is '+(a+b)+' and product '+a*b+'.','They are '+a+' and '+b+'.','Check by expanding (x+'+a+')(x+'+b+').']];
    if(t===2) return ['Simplify (x+'+a+')(x+'+b+')−'+c+'(x+'+d+').','x²+'+(a+b-c)+'x '+s(a*b-c*d),['First bracket expands to x²+'+(a+b)+'x+'+a*b+'.','Subtract '+c+'x+'+(c*d)+'.','Combine like terms to get x²+'+(a+b-c)+'x '+s(a*b-c*d)+'.']];
    return ['Factorise 2x²+'+(2*b+a)+'x+'+(a*b)+'.','(2x+'+a+')(x+'+b+')',['Split the middle term as '+(2*b)+'x+'+a+'x.','Group: 2x(x+'+b+')+'+a+'(x+'+b+').','Take the common bracket (x+'+b+').']];
  });

  q.functions = make((i,t) => {
    const a=i%4+2,b=i+2,c=i%7+1,k=i%5+1;
    if(t===0) return ['f(x)='+a+'x+'+b+'. Evaluate f('+k+').',String(a*k+b),['Replace x by '+k+'.','Calculate '+a+'×'+k+'+'+b+'='+(a*k+b)+'.']];
    if(t===1) return ['f(x)='+a+'x² '+s(b)+'x '+s(c)+'. Find f('+k+').',String(a*k*k+b*k+c),['Substitute x='+k+'.','Evaluate '+a+'('+k+'²)+'+b+'('+k+')+'+c+'.','This is '+(a*k*k+b*k+c)+'.']];
    if(t===2) return ['f(x)='+a+'x+'+b+', g(x)='+k+'x−'+c+'. Find f(g(x)).',a*k+'x '+s(b-a*c),['Substitute g(x) into f: '+a+'('+k+'x−'+c+')+'+b+'.','Expand to '+(a*k)+'x−'+(a*c)+'+'+b+'.','Collect constants: '+(a*k)+'x '+s(b-a*c)+'.']];
    return ['Find the domain of h(x)=√(x−'+a+') + 1/(x−'+b+').','x≥'+a+' and x≠'+b,['Real square roots require x−'+a+'≥0.','Division by zero is forbidden, so x−'+b+'≠0.','Both restrictions apply simultaneously.']];
  });

  q.simultaneous = make((i,t) => {
    const x=i+1,y=i+3,S=x+y,D=x-y;
    if(t===0) return ['Solve x+y='+S+' and x−y='+D+'.','x='+x+', y='+y,['Add the equations: 2x='+(S+D)+'.','Therefore x='+x+'.','Substitute into x+y='+S+' to get y='+y+'.']];
    if(t===1) return ['Solve 2x+3y='+(2*x+3*y)+' and x−y='+D+'.','x='+x+', y='+y,['From x−y='+D+', write x=y '+s(D)+'.','Substitute into 2x+3y='+(2*x+3*y)+'.','Solve 5y='+(5*y)+', then x='+x+'.']];
    const T=x*x+y*y,P=x*y;
    if(t===2) return ['Solve x+y='+S+' and x²+y²='+T+'.','(x,y)=('+x+','+y+') or ('+y+','+x+')',['Set y='+S+'−x and substitute.','x²+('+S+'−x)²='+T+' simplifies to x²−'+S+'x+'+P+'=0.','Factor (x−'+x+')(x−'+y+')=0 and obtain both ordered pairs.']];
    return ['Find all intersections satisfying x+y='+S+' and xy='+P+'.','('+x+','+y+') and ('+y+','+x+')',['Write y='+S+'−x.','Substitute x('+S+'−x)='+P+', hence x²−'+S+'x+'+P+'=0.','Factorise to get x='+x+' or x='+y+'; back-substitute.']];
  });

  q.inequalities = make((i,t) => {
    const a=i+1,b=a+i%4+2,c=i%5+1;
    if(t===0) return ['Solve 3x+'+c+' > '+(3*a+c)+'.','x > '+a,['Subtract '+c+' from both sides.','Divide by positive 3; the sign stays >.','Therefore x > '+a+'.']];
    if(t===1) return ['Solve (x−'+a+')(x−'+b+')≥0.','x≤'+a+' or x≥'+b,['The boundary roots are '+a+' and '+b+'.','The upward quadratic is nonnegative outside the roots.','Include equality at both roots.']];
    if(t===2) return ['Solve (x−'+a+')(x−'+b+')<0.',''+a+'<x<'+b,['Factor sign changes at x='+a+' and '+b+'.','Between these values one factor is negative and one is positive.','Strict inequality excludes the roots.']];
    const px=a,py=2*a+c, rhs=2*px+c;
    return ['Does P('+px+','+py+') lie in the region x≥0, y≥2x+'+c+'?','Yes (on the boundary)',['Check x='+px+'≥0.','The boundary at x='+px+' is y='+rhs+'.','Point P has y='+py+', so it satisfies equality and is included.']];
  });

  q.straightlines = make((i,t) => {
    const m=i%5+1,c=i%7+2,a=i+1,b=i%5+2;
    if(t===0) return ['Find the gradient through ('+a+','+(m*a+c)+') and ('+(a+3)+','+(m*(a+3)+c)+').',String(m),['Use (y₂−y₁)/(x₂−x₁).','Rise='+(3*m)+' and run=3.','Gradient='+(3*m)+'/3='+m+'.']];
    if(t===1) return ['Find the line of gradient '+m+' passing through ('+a+','+(m*a+c)+').','y='+m+'x+'+c,['Use y−'+(m*a+c)+'='+m+'(x−'+a+').','Expand and rearrange to y='+m+'x+'+c+'.']];
    if(t===2) return ['Find a line through (0,'+c+') perpendicular to y=x/'+m+'.','y=−'+m+'x+'+c,['Given line gradient is 1/'+m+'.','Perpendicular gradient is −'+m+'.','Use intercept (0,'+c+') to find y=−'+m+'x+'+c+'.']];
    return ['The line y=x−'+(2*a)+' meets both coordinate axes. Find the area of its intercept triangle.',(2*a*a)+' square units',['At x=0, y=−'+(2*a)+'; at y=0, x='+(2*a)+'.','The perpendicular base and height are both '+(2*a)+'.','Area=½×'+(2*a)+'×'+(2*a)+'='+(2*a*a)+'.']];
  });

  q.trig = make((i,t) => {
    const n=i+2;
    if(t===0) return ['In a right triangle, hypotenuse '+(2*n)+' cm and angle 30°. Find the opposite side.',n+' cm',['sin30°=opposite/hypotenuse=1/2.','Opposite='+(2*n)+'×½='+n+' cm.']];
    if(t===1) return ['Triangle ABC has A=30°, B=90° and side a='+n+' cm. Find b.',(2*n)+' cm',['Use sine rule a/sin A=b/sin B.','sin30°=½ and sin90°=1.','b='+n+'×1/(½)='+(2*n)+' cm.']];
    if(t===2) return ['Two sides are '+(2*n)+' cm and '+(3*n)+' cm with included angle 60°. Find the third side.',n+'√7 cm',['Apply c²=a²+b²−2ab cos60°.','c²='+4*n*n+'+'+9*n*n+'−'+6*n*n+'='+7*n*n+'.','Positive root gives '+n+'√7 cm.']];
    return ['Find the area of a triangle with sides '+(4*n)+' cm and '+(3*n)+' cm and included angle 30°.',(3*n*n)+' cm²',['Use Area=½ab sinC.','Substitute ½×'+(4*n)+'×'+(3*n)+'×½.','Area='+(3*n*n)+' cm².']];
  });

  q.triggraphs = make((i,t) => {
    const b=[1,2,3,4,5,6,8,9,10,12][i],a=i%5+2,shift=(i+1)*10;
    if(t===0) return ['Find amplitude and period of y='+a+'sin('+b+'x) (x in degrees).','Amplitude '+a+'; period '+(360/b)+'°',['The outside factor gives amplitude '+a+'.','The period is 360°/'+b+'='+(360/b)+'°.']];
    if(t===1) return ['Find the period of y=tan('+b+'x) (x in degrees).',(180/b)+'°',['Tangent repeats every 180°.','Divide the parent period by '+b+': '+(180/b)+'°.']];
    const cases=[['sin x=½','30°, 150°','sine positive in quadrants I and II'],['sin x=√3/2','60°, 120°','sine positive in quadrants I and II'],['cos x=½','60°, 300°','cosine positive in quadrants I and IV'],['cos x=−½','120°, 240°','cosine negative in quadrants II and III'],['sin x=−½','210°, 330°','sine negative in quadrants III and IV'],['cos x=0','90°, 270°','cosine zero on the vertical axis'],['tan x=1','45°, 225°','tangent positive in quadrants I and III'],['tan x=−1','135°, 315°','tangent negative in quadrants II and IV'],['sin x=0','0°, 180°','sine zero at integer multiples of 180°'],['cos x=−1','180°','cosine −1 at 180°']];
    if(t===2){const e=cases[i];return ['Solve '+e[0]+' for 0°≤x<360°.',e[1],['Identify the reference angle using the special-angle values.','Check all quadrants between 0° and 360°: '+e[2]+'.','List all solutions: '+e[1]+'.']];}
    return ['For y='+a+'sin('+b+'(x−'+shift+'°)), state amplitude, period and horizontal translation.','Amplitude '+a+'; period '+(360/b)+'°; '+shift+'° right',['Outside multiplier '+a+' gives amplitude '+a+'.','Inside multiplier '+b+' gives period 360°/'+b+'='+(360/b)+'°.','The expression x−'+shift+'° shifts right by '+shift+'°.']];
  });

  q.radians = make((i,t) => {
    const degrees=[30,45,60,90,120,135,150,180,210,270][i],n=i+1,k=i%5+1;
    if(t===0) return ['Convert '+degrees+'° to radians.',pi(degrees,180),['Multiply degrees by π/180.','Simplify '+degrees+'π/180 = '+pi(degrees,180)+'.']];
    if(t===1) return ['Find the arc length of a sector with radius '+(6*n)+' cm and angle '+k+'π/6 radians.',(n*k)+'π cm',['Use s=rθ with θ in radians.','s='+(6*n)+'×('+k+'π/6)='+(n*k)+'π cm.']];
    if(t===2) return ['Find the sector area when radius is '+(6*n)+' cm and angle π/3 radians.',(6*n*n)+'π cm²',['Area=½r²θ.','Substitute ½×'+(36*n*n)+'×π/3.','Simplify to '+(6*n*n)+'π cm².']];
    return ['Find the minor segment area for radius '+(2*n)+' cm and angle π/3 radians.','('+(2*n*n)+'π/3 − '+(n*n)+'√3) cm²',['Area of sector=½r²×π/3='+(2*n*n)+'π/3.','Area of triangle=½r² sin(π/3)='+(n*n)+'√3.','Subtract triangle area from sector.']];
  });

  q.differentiation = make((i,t) => {
    const a=i%5+2,b=i+2,c=i%4+1,n=i%4+2,k=i%5+1;
    if(t===0) return ['Differentiate y='+a+'x^'+n+'.',a*n+'x^'+(n-1),['Apply d/dx(ax^n)=anx^(n−1).','Multiply '+a+'×'+n+'='+(a*n)+' and lower the power to '+(n-1)+'.']];
    if(t===1) return ['For y='+a+'x²+'+b+'x+'+c+', find dy/dx at x='+k+'.',String(2*a*k+b),['Differentiate: dy/dx='+(2*a)+'x+'+b+'.','Substitute x='+k+': '+(2*a*k)+'+'+b+'='+(2*a*k+b)+'.']];
    const h=k,v=c;
    if(t===2) return ['Find the stationary point of y=(x−'+h+')²+'+v+'.','('+h+','+v+')',['Differentiate: dy/dx=2(x−'+h+').','Set derivative to zero: x='+h+'.','Substitute into the curve: y='+v+'.']];
    const m=3*a*k*k+2*b*k+c;
    return ['Differentiate y='+a+'x³+'+b+'x²+'+c+'x+'+k+' and find its gradient at x='+k+'.','dy/dx='+(3*a)+'x²+'+(2*b)+'x+'+c+'; gradient '+m,['Differentiate each term: '+(3*a)+'x²+'+(2*b)+'x+'+c+'.','Substitute x='+k+' into the derivative.','Evaluate '+(3*a*k*k)+'+'+(2*b*k)+'+'+c+'='+m+'.']];
  });

  q.tangents = make((i,t) => {
    const k=i+1,a=i%4+1,b=i%3+1,c=i%5+1;
    if(t===0) return ['Find the tangent to y=x² at x='+k+'.','y='+(2*k)+'x−'+(k*k),['The gradient function is dy/dx=2x, so m='+(2*k)+'.','The curve point is ('+k+','+(k*k)+').','Use y−'+(k*k)+'='+(2*k)+'(x−'+k+'), then simplify.']];
    if(t===1) return ['Find the normal to y=x² at x='+k+'.','y−'+(k*k)+'=−(x−'+k+')/'+(2*k),['Tangent gradient at x='+k+' is '+(2*k)+'.','Normal gradient is the negative reciprocal −1/'+(2*k)+'.','Use the point ('+k+','+(k*k)+') in point–gradient form.']];
    if(t===2) return ['Find the tangent to y=x³ at x='+k+'.','y−'+(k*k*k)+'='+(3*k*k)+'(x−'+k+')',['Differentiate: dy/dx=3x².','At x='+k+', gradient is '+(3*k*k)+' and y='+(k*k*k)+'.','Use y−y₀=m(x−x₀).']];
    const y=a*k*k+b*k+c, m=2*a*k+b;
    return ['Find the normal to y='+a+'x²+'+b+'x+'+c+' at x='+k+'.','y−'+y+'=−(x−'+k+')/'+m,['Point on curve: ('+k+','+y+').','Tangent gradient dy/dx='+(2*a)+'x+'+b+', so m='+m+'.','Normal gradient is −1/'+m+'; use point–gradient form.']];
  });

  q.secondderivative = make((i,t) => {
    const a=i%5+1,b=i+2,h=i+1,k=i%5+1;
    if(t===0) return ['Find d²y/dx² if y='+a+'x³.',(6*a)+'x',['First derivative is '+(3*a)+'x².','Differentiate again: '+(6*a)+'x.']];
    if(t===1) return ['Find d²y/dx² if y='+a+'x⁴+'+b+'x³.',(12*a)+'x²+'+(6*b)+'x',['First derivative: '+(4*a)+'x³+'+(3*b)+'x².','Second derivative: '+(12*a)+'x²+'+(6*b)+'x.']];
    if(t===2) return ['For y=x³−'+(3*h)+'x², find the x-coordinate of the point of inflection.',String(h),['Differentiate twice: y″=6x−'+(6*h)+'.','Solve y″=0: x='+h+'.','Since y‴=6≠0, the concavity changes here. This is an inflection point (not necessarily stationary).']];
    const coeff=i%2===0?a:-a;
    return ['Classify the stationary point of y='+coeff+'(x−'+h+')²+'+k+'.',coeff>0?'Minimum at ('+h+','+k+')':'Maximum at ('+h+','+k+')',['First derivative is '+(2*coeff)+'(x−'+h+'), zero at x='+h+'.','Second derivative is '+(2*coeff)+'.',coeff>0?'It is positive, so the point is a minimum.':'It is negative, so the point is a maximum.']];
  });

  q.integration = make((i,t) => {
    const a=i%4+2,b=i%5+1,c=i+1,n=i%4+1,k=i%4+1,d=i+7;
    if(t===0) return ['Integrate '+((n+1)*a)+'x^'+n+' with respect to x.',a+'x^'+(n+1)+' + C',['Increase the power '+n+' to '+(n+1)+'.','Divide coefficient '+((n+1)*a)+' by '+(n+1)+' to get '+a+'.','Add the integration constant C.']];
    if(t===1) return ['Find ∫('+3*a+'x²+'+2*b+'x+'+c+')dx.',a+'x³+'+b+'x²+'+c+'x+C',['Integrate '+(3*a)+'x² to '+a+'x³.','Integrate '+(2*b)+'x to '+b+'x²; integrate '+c+' to '+c+'x.','Add C.']];
    if(t===2){const K=d-a*k*k-b*k;return ['Given f′(x)='+2*a+'x+'+b+' and f('+k+')='+d+', find f(x).',a+'x²+'+b+'x '+s(K),['Integrate to f(x)='+a+'x²+'+b+'x+C.','Use f('+k+')='+(a*k*k)+'+'+(b*k)+'+C='+d+'.','Solve C='+K+'; hence f(x)='+a+'x²+'+b+'x '+s(K)+'.']];}
    const K=d-a*k*k*k+b*k*k-c*k;
    return ['Given f′(x)='+(3*a)+'x²−'+(2*b)+'x+'+c+' and f('+k+')='+d+', find f(x).',a+'x³−'+b+'x²+'+c+'x '+s(K),['Integrate: f(x)='+a+'x³−'+b+'x²+'+c+'x+C.','At x='+k+', the polynomial without C is '+(a*k*k*k-b*k*k+c*k)+'.','Set this plus C equal to '+d+'; C='+K+'.']];
  });
  Object.assign(window.mathsQuestionBank, q);
})();
