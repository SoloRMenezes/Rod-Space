// Original mixed practice for Pearson Edexcel IAL P2, P3, P4, and S1.
// Questions are generated from transparent worked templates, not copied from textbooks.
// Ten normal + ten hard + twenty exam + ten A* = fifty questions per exercise book.
(function(){
'use strict';
const out=window.mathsMixedExercises=window.mathsMixedExercises||{};
const levels=['Normal questions','Hard questions','Exam questions','A* questions'];
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){let t=a%b;a=b;b=t;}return a||1};
const frac=(a,b)=>{if(b<0){a=-a;b=-b;}let g=gcd(a,b);return b/g===1?String(a/g):a/g+'/'+(b/g)};
const comb=(n,k)=>{let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return Math.round(r)};
const sign=n=>n<0?' − '+Math.abs(n):' + '+n;
const num=n=>Number(n.toFixed(4)).toString();
const q=(topic,question,answer,steps,level)=>({
 topic,q:question,a:String(answer),w:steps,m:[2,3,4,6][level],d:levels[level]
});
const p2=[
 (l,v)=>{
  let r=1+v%5,a=2+v%7,b=3+v%4,A=b-a-r,B=r*a-b*(a+r),C=r*a*b+(l+1)*(v+2);
  if(l>=2){
   let c=2+v%5,d=3+v%6,need=-(r**3+c*r*r+d*r);
   return q('Algebraic methods','Find k so (x − '+r+') is a factor of f(x) = x³ + '+c+'x² + '+d+'x + k.', 'k = '+need,
    ['By the factor theorem, a factor (x − '+r+') requires f('+r+') = 0.',
     'Substitute: '+r+'³ + '+c+'('+r+')² + '+d+'('+r+') + k = 0.',
     'Rearrange to obtain k = −('+r**3+' + '+c*r*r+' + '+d*r+') = '+need+'.'],l);
  }
  return q('Algebraic methods','Find the remainder when f(x) = x³'+sign(A)+'x²'+sign(B)+'x + '+C+' is divided by (x − '+r+').',
   (l+1)*(v+2),['The remainder theorem gives remainder = f('+r+').',
   'Evaluate '+r+'³'+sign(A)+'('+r+')²'+sign(B)+'('+r+') + '+C+'.',
   'The result is '+((l+1)*(v+2))+'.'],l);
 },
 (l,v)=>{
  let x=1+v%6,y=2+v%7,t=1+l+v%4,Px=x+3*t,Py=y+4*t,R=5*t;
  if(l===0)return q('Circle geometry','A circle has centre ('+x+', '+y+') and passes through ('+Px+', '+Py+'). Find its radius.',
   R,['Find the displacement from the centre: ('+3*t+', '+4*t+').',
   'Apply Pythagoras: r = √(('+3*t+')² + ('+4*t+')²).','The radius is '+R+'.'],l);
  return q('Circle geometry','A circle has centre ('+x+', '+y+') and touches the tangent at ('+Px+', '+Py+'). Find the tangent equation.',
   '3x + 4y = '+(3*x+4*y+25*t),
   ['The radius to the point has direction ('+3*t+', '+4*t+'), equivalent to (3, 4).',
   'A tangent is perpendicular to the radius, so 3(x − '+Px+') + 4(y − '+Py+') = 0.',
   'Expand: 3x + 4y = '+(3*x+4*y+25*t)+'.'],l);
 },
 (l,v)=>{
  let n=3+v%4;
  if(l===0)return q('Logarithms','Evaluate log₂(2^'+n+').',
   n,['Use logₐ(a^k) = k.','Here the base and the power both use 2.','The answer is '+n+'.'],l);
  let k=2+Math.floor(v/6),x=2**k,p=x/2,z=2*k-1;
  return q('Logarithms','Solve log₂(x) + log₂(x − '+p+') = '+z+' for x > '+p+'.',
   'x = '+x,['Combine logs: log₂(x(x − '+p+')) = '+z+'.',
   'Therefore x(x − '+p+') = 2^'+z+' = '+2**z+'.',
   'Solving the quadratic and keeping x > '+p+' gives x = '+x+'.'],l);
 },
 (l,v)=>{
  let a=1+v%5+l,n=4+l+v%3,k=l<2?2:3,coef=comb(n,k)*a**k;
  return q('Binomial expansion','Find the coefficient of x^'+k+' in (1 + '+a+'x)^'+n+'.',
   coef,['The general binomial term is C('+n+',k)('+a+'x)^k.',
   'Choose k = '+k+': coefficient = C('+n+','+k+') × '+a+'^'+k+'.',
   'This is '+comb(n,k)+' × '+a**k+' = '+coef+'.'],l);
 },
 (l,v)=>{
  let a=2+v%9,d=1+l+v%4,n=5+l+v%8,term=a+(n-1)*d,sum=n*(2*a+(n-1)*d)/2;
  if(l%2===0)return q('Sequences and series','An arithmetic sequence begins '+a+', '+(a+d)+', '+(a+2*d)+', … Find its '+n+'th term.',
   term,['First term a = '+a+' and common difference d = '+d+'.',
   'Use uₙ = a + (n − 1)d.',
   'u'+n+' = '+a+' + ('+(n-1)+')('+d+') = '+term+'.'],l);
  return q('Sequences and series','An arithmetic sequence has first term '+a+', common difference '+d+'. Find the sum of its first '+n+' terms.',
   sum,['Use Sₙ = n[2a + (n − 1)d]/2.',
   'Substitute S'+n+' = '+n+'[2('+a+') + ('+(n-1)+')('+d+')]/2.',
   'The sum is '+sum+'.'],l);
 },
 (l,v)=>{
  let deg=[30,45,60,120,135,150,210,225,240,300,315,330][v%12],multiple=1+Math.floor(v/12);
  const sin={30:'1/2',45:'√2/2',60:'√3/2',120:'√3/2',135:'√2/2',150:'1/2',210:'−1/2',225:'−√2/2',240:'−√3/2',300:'−√3/2',315:'−√2/2',330:'−1/2'};
  const cos={30:'√3/2',45:'√2/2',60:'1/2',120:'−1/2',135:'−√2/2',150:'−√3/2',210:'−√3/2',225:'−√2/2',240:'−1/2',300:'1/2',315:'√2/2',330:'√3/2'};
  const pick=l%2===0?'sin':'cos',val=pick==='sin'?sin[deg]:cos[deg];
  return q('Trigonometric identities','Find the exact value of '+multiple+' × '+pick+'('+deg+'°).',
   multiple+' × ('+val+')',['Find the reference angle and determine the quadrant of '+deg+'°.',
   'Use the special triangle values for 30°, 45° or 60°.',
   'Apply the correct quadrant sign, then multiply by '+multiple+': '+multiple+' × ('+val+').'],l);
 },
 (l,v)=>{
  let a=1+l+v%3,b=2+v%5,c=1+v%7,x=1+v%4,gradient=3*a*x*x-2*b*x+c;
  if(l>=2){let k=1+v%5,A=1+l,c2=3+v%9,val=c2-A*k*k;
   return q('Differentiation','Find the stationary point of y = '+A+'x² − '+2*A*k+'x + '+c2+'.',
    '('+k+', '+val+')',['Differentiate: dy/dx = '+2*A+'x − '+2*A*k+'.',
    'At a stationary point set dy/dx=0, giving x = '+k+'.',
    'Substitute x = '+k+' into the original equation: y = '+val+'.'],l);
  }
  return q('Differentiation','Find dy/dx at x = '+x+' for y = '+a+'x³ − '+b+'x² + '+c+'x.',
   gradient,['Differentiate: dy/dx = '+3*a+'x² − '+2*b+'x + '+c+'.',
   'Substitute x = '+x+': '+3*a+'('+x+')² − '+2*b+'('+x+') + '+c+'.',
   'The gradient is '+gradient+'.'],l);
 },
 (l,v)=>{
  let a=1+l+v%4,b=1+v%5,t=1+v%4+l,result=a*t**3+b*t*t;
  return q('Integration','Evaluate ∫₀^'+t+' ('+3*a+'x² + '+2*b+'x) dx.',
   result,['Integrate each term: an antiderivative is '+a+'x³ + '+b+'x².',
   'Apply the limits 0 and '+t+'.',
   'The result is '+a+'('+t+')³ + '+b+'('+t+')² = '+result+'.'],l);
 }
];
const p3=[
 (l,v)=>{
  let a=1+v%7,b=2+l+v%4;
  return q('Algebraic fractions','Simplify (x²'+sign(b-a)+'x − '+a*b+')/(x − '+a+'), for x ≠ '+a+'.',
   'x + '+b,['Find two numbers whose product is −'+a*b+' and whose sum is '+(b-a)+'.',
   'Factor the numerator as (x − '+a+')(x + '+b+').',
   'Cancel the common factor (x − '+a+'), giving x + '+b+' (x ≠ '+a+').'],l);
 },
 (l,v)=>{
  let a=1+l+v%3,b=1+v%7,c=1+v%3,x=1+v%5,first=a*(x*x+c)+b,second=(a*x+b)**2+c;
  if(l%2===0)return q('Composite functions','Let f(x) = '+a+'x + '+b+' and g(x) = x² + '+c+'. Calculate f(g('+x+')).',
   first,['Evaluate the inside function: g('+x+') = '+(x*x+c)+'.',
   'Apply f to the result: f('+(x*x+c)+') = '+a+' × '+(x*x+c)+' + '+b+'.',
   'Therefore f(g('+x+')) = '+first+'.'],l);
  return q('Composite functions','Let f(x) = '+a+'x + '+b+' and g(x) = x² + '+c+'. Calculate g(f('+x+')).',
   second,['Evaluate the inside function: f('+x+') = '+(a*x+b)+'.',
   'Apply g: ('+(a*x+b)+')² + '+c+'.',
   'Therefore g(f('+x+')) = '+second+'.'],l);
 },
 (l,v)=>{
  let scale=1+Math.floor(v/2),x=(3+(v%2)*2)*scale,y=(4+(v%2)*8)*scale,z=(v%2?13:5)*scale;
  let topic=l%2===0?'sec':'cot',answer=topic==='sec'?frac(z,y):frac(y,x);
  return q('Trigonometric functions','In a right triangle, opposite = '+x+', adjacent = '+y+', hypotenuse = '+z+'. Find '+topic+' θ.',
   answer,['Use the reciprocal definitions: sec θ = hypotenuse/adjacent, cot θ = adjacent/opposite.',
   'Substitute the relevant lengths.',
   'Simplify to '+answer+'.'],l);
 },
 (l,v)=>{
  let triangles=[[3,4,5],[5,12,13],[8,15,17],[7,24,25],[20,21,29],[9,40,41],[12,35,37],[11,60,61],[28,45,53],[33,56,65],[16,63,65],[13,84,85]];let triple=[triangles[v%triangles.length],triangles[(v+2)%triangles.length]];
  let [s1,c1,h1]=triple[0],[s2,c2,h2]=triple[1];
  let sinN=s1*c2+c1*s2,cosN=c1*c2-s1*s2,factor=1+Math.floor(v/12);
  if(l%2===0)return q('Trigonometric addition','Angles A and B are acute, with sin A='+s1+'/'+h1+', cos A='+c1+'/'+h1+', sin B='+s2+'/'+h2+', cos B='+c2+'/'+h2+'. Find '+factor+' sin(A+B).',
   frac(factor*sinN,h1*h2),['Use sin(A+B)=sin A cos B + cos A sin B.',
    'Substitute to get ('+s1+'×'+c2+' + '+c1+'×'+s2+')/('+h1+'×'+h2+').',
    'Multiply by '+factor+' and simplify to '+frac(factor*sinN,h1*h2)+'.'],l);
  return q('Trigonometric addition','Angles A and B are acute, with sin A='+s1+'/'+h1+', cos A='+c1+'/'+h1+', sin B='+s2+'/'+h2+', cos B='+c2+'/'+h2+'. Find '+factor+' cos(A+B).',
   frac(factor*cosN,h1*h2),['Use cos(A+B)=cos A cos B − sin A sin B.',
    'Substitute: ('+c1+'×'+c2+' − '+s1+'×'+s2+')/('+h1+'×'+h2+').',
    'Multiply by '+factor+' and simplify to '+frac(factor*cosN,h1*h2)+'.'],l);
 },
 (l,v)=>{
  let a=2+l+v%4,x=1+v%5,b=1+v%4,c=a*x+b;
  return q('Exponentials and logarithms','Solve e^('+a+'x + '+b+') = e^'+c+'.',
   'x = '+x,['Take natural logarithms on both sides: '+a+'x + '+b+' = '+c+'.',
    'Rearrange: '+a+'x = '+(c-b)+'.',
    'Divide by '+a+' to obtain x = '+x+'.'],l);
 },
 (l,v)=>{
  let a=1+l+v%3,b=1+v%5,n=2+l+v%3,x=1+v%3,t=a*x+b,der=n*a*t**(n-1);
  return q('Differentiation','Find dy/dx at x = '+x+' for y = ('+a+'x + '+b+')^'+n+'.',
   der,['Use the chain rule with u = '+a+'x + '+b+', so du/dx = '+a+'.',
    'Then dy/dx = '+n+'('+a+')('+a+'x + '+b+')^'+(n-1)+'.',
    'At x='+x+', this equals '+n*a+' × '+t+'^'+(n-1)+' = '+der+'.'],l);
 },
 (l,v)=>{
  let a=1+l+v%3,b=1+v,n=1+l+v%3,c=frac(1,a*(n+1));
  return q('Integration','Find ∫('+a+'x + '+b+')^'+n+' dx.',
   '('+a+'x + '+b+')^'+(n+1)+'/('+a*(n+1)+') + C',
   ['Use the reverse chain rule; the derivative of the inner expression is '+a+'.',
   'Increase the outer power from '+n+' to '+(n+1)+'.',
   'Divide by '+(n+1)+' × '+a+'; include + C.'],l);
 },
 (l,v)=>{
  let n=[2,3,5,7][v%4],x=1+Math.floor(v/3)+l,one=(x+n/x)/2,two=(one+n/one)/2;
  return q('Numerical methods','Use xₙ₊₁ = (xₙ + '+n+'/xₙ)/2 with x₀ = '+x+'. Find x₂ to 3 decimal places.',
   two.toFixed(3),['First iteration: x₁ = ('+x+' + '+n+'/'+x+')/2 = '+one.toFixed(5)+'.',
   'Second iteration: x₂ = (x₁ + '+n+'/x₁)/2 = '+two.toFixed(6)+'.',
   'Round x₂ to three decimal places: '+two.toFixed(3)+'.'],l);
 }
];
const p4=[
 (l,v)=>{
  let p=[2,3,5,7,11][v%5],offset=1+Math.floor(v/5);
  return q('Proof','Prove by contradiction that √'+p+' + '+offset+' is irrational.',
   '√'+p+' + '+offset+' is irrational.',
   ['Suppose √'+p+' + '+offset+' is rational. Subtract the integer '+offset+' to deduce √'+p+' is rational.',
    'Write √'+p+' = a/b with a,b integers in lowest terms. Squaring gives a² = '+p+'b².',
    'The prime '+p+' divides a², hence divides a.',
    'Writing a='+p+'k also forces '+p+' to divide b, contradicting lowest terms.'],l);
 },
 (l,v)=>{
  let r=1+v%4,s=r+2+v%3,A=1+l+v%4,B=2+v%5,n=A+B,k=A*s+B*r;
  return q('Partial fractions','Write ('+n+'x − '+k+')/((x − '+r+')(x − '+s+')) as partial fractions.',
   A+'/(x − '+r+') + '+B+'/(x − '+s+')',
   ['Assume A/(x − '+r+') + B/(x − '+s+').',
   'Combine numerators to get (A+B)x − (A×'+s+' + B×'+r+').',
   'Comparing coefficients gives A='+A+', B='+B+'; substitute to obtain the answer.'],l);
 },
 (l,v)=>{
  let a=1+l+v%3,b=1+v%4,c=2+v%6,d=1+v%5,t=1+v%5,result=frac(3*c*t,2*a);
  return q('Parametric differentiation','x = '+a+'t² + '+b+', y = '+c+'t³ + '+d+'. Find dy/dx when t = '+t+'.',
   result,['Differentiate with respect to t: dx/dt = '+2*a+'t; dy/dt = '+3*c+'t².',
   'Use dy/dx = (dy/dt)/(dx/dt) = '+3*c+'t/('+2*a+').',
   'At t='+t+', the gradient is '+result+'.'],l);
 },
 (l,v)=>{
  let a=1+l+v%3,n=1+l+v%4,k=l<2?2:3;
  let c=k===2?comb(n+1,2)*a*a:-comb(n+2,3)*a*a*a;
  return q('Binomial expansion','Find the coefficient of x^'+k+' in (1 + '+a+'x)^−'+n+'.',
   c,['For negative n, the coefficient of u^k is (−1)^k C(n+k−1,k)u^k.',
   'Substitute u = '+a+'x and k = '+k+'.',
   'The coefficient is '+c+' (valid for |'+a+'x| < 1).'],l);
 },
 (l,v)=>{
  let a=2+v%5+Math.floor(v/10),b=2+v%4,k=1+l+v%3,R=a*a+k*b*b;
  return q('Implicit differentiation','For x² + '+k+'y² = '+R+', find dy/dx at ('+a+', '+b+').',
   frac(-a,k*b),['Differentiate implicitly: 2x + '+2*k+'y(dy/dx) = 0.',
   'Rearrange: dy/dx = −x/('+k+'y).',
   'At ('+a+', '+b+'), the gradient is '+frac(-a,k*b)+'.'],l);
 },
 (l,v)=>{
  let t=1+Math.floor(v/4)+l;
  return q('Integration by parts','Evaluate ∫₀^'+t+' x eˣ dx exactly.',
   '('+(t-1)+')e^'+t+' + 1',
   ['Choose u=x and dv=eˣ dx; then du=dx and v=eˣ.',
    'Integration by parts gives ∫xeˣ dx = xeˣ−eˣ+C = (x−1)eˣ+C.',
    'Evaluate at '+t+' and 0: ('+(t-1)+')e^'+t+' − (−1) = ('+(t-1)+')e^'+t+' + 1.'],l);
 },
 (l,v)=>{
  let u=1+v%5,a=1+l+v%4,b=2+v%6,c=1+v%3;
  if(l>=2){
   let want=-(a*b+u*c);
   return q('Vectors','For a = ('+u+', '+a+', '+u+') and b = (λ, '+b+', '+c+'), find λ so a·b = 0.',
    frac(want,u),['Perpendicular vectors have zero scalar product.',
    'Set '+u+'λ + ('+a+'×'+b+') + ('+u+'×'+c+') = 0.',
    'Solve for λ: '+u+'λ = '+want+', so λ = '+frac(want,u)+'.'],l);
  }
  let w=3+v%5,d=1+v%4,dot=u*w+a*d+b*c;
  return q('Vectors','Find the scalar product of a = ('+u+', '+a+', '+b+') and b = ('+w+', '+d+', '+c+').',
   dot,['Multiply corresponding components: '+u+'×'+w+', '+a+'×'+d+', '+b+'×'+c+'.',
   'Add the products: '+u*w+' + '+a*d+' + '+b*c+'.',
   'The scalar product is '+dot+'.'],l);
 }
];
const s1=[
 (l,v)=>{
  let a=1+v,d=1+l+v%5;
  if(l%2===0)return q('Measures of location','Find the mean of '+a+', '+(a+d)+', '+(a+2*d)+', '+(a+3*d)+', '+(a+4*d)+'.',
   a+2*d,['Add the five observations: '+(5*a+10*d)+'.',
   'Mean = total ÷ 5.',
   'The mean is '+(a+2*d)+'.'],l);
  let ss=2*d*d;
  return q('Measures of spread','Find the population variance of the data '+(a-d)+', '+a+', '+(a+d)+'.',
   frac(ss,3),['The mean of the three values is '+a+'.',
   'Squared deviations are '+d*d+', 0 and '+d*d+'.',
   'Variance = ('+ss+')/3 = '+frac(ss,3)+'.'],l);
 },
 (l,v)=>{
  let width=2+l+v%5,density=2+v,f=width*density;
  return q('Histograms','A histogram class has width '+width+' and frequency '+f+'. Find its frequency density.',
   density,['Frequency density = frequency ÷ class width.',
   'Substitute '+f+' ÷ '+width+'.',
   'The bar height is '+density+'.'],l);
 },
 (l,v)=>{
  let r=3+l+v%6,b=2+v%6,p=frac(r*(r-1),(r+b)*(r+b-1));
  return q('Probability','A bag has '+r+' red and '+b+' blue counters. Two are drawn without replacement. Find P(both red).',
   p,['First red has probability '+r+'/'+(r+b)+'.',
    'After removing a red, second red has probability '+(r-1)+'/'+(r+b-1)+'.',
    'Multiply: '+r+'/'+(r+b)+' × '+(r-1)+'/'+(r+b-1)+' = '+p+'.'],l);
 },
 (l,v)=>{
  let a=1+l+v%4,b=1+v%6;
  return q('Correlation and regression','Three points lie on a straight line: (0, '+b+'), (1, '+(a+b)+'), (2, '+(2*a+b)+'). Find its regression line equation.',
   'y = '+a+'x + '+b,['The data follow a perfect increasing line.',
   'Find the gradient: ('+(a+b)+'−'+b+')/(1−0) = '+a+'.',
   'The y-intercept is '+b+', giving y = '+a+'x + '+b+'.'],l);
 },
 (l,v)=>{
  let m=2+v%7,d=1+l+v%4,varValue=frac(d*d,2);
  return q('Discrete random variables','X takes '+(m-d)+', '+m+', '+(m+d)+' with probabilities 1/4, 1/2, 1/4. Find E(X) and Var(X).',
   'E(X) = '+m+', Var(X) = '+varValue,
   ['E(X) = ('+(m-d)+')/4 + '+m+'/2 + ('+(m+d)+')/4 = '+m+'.',
    'The deviations from the mean are −'+d+', 0, +'+d+'.',
    'Var(X) = ('+d*d+'/4) + 0 + ('+d*d+'/4) = '+varValue+'.'],l);
 },
 (l,v)=>{
  let mean=40+v%30,sigma=4+l+v%5,z=[-2,-1,0,1,2][v%5];
  const CDF={'-2':'0.0228','-1':'0.1587','0':'0.5000','1':'0.8413','2':'0.9772'};
  let bound=mean+z*sigma;
  if(l>=2&&v%2===0)
   return q('Normal distribution','X ~ N('+mean+', '+sigma+'²). Find P('+mean+' − '+sigma+' < X < '+mean+' + '+sigma+').',
    '0.6826',['Standardise using Z = (X − μ)/σ.',
    'The bounds become −1 < Z < 1.',
    'P(−1 < Z < 1) = Φ(1) − Φ(−1) ≈ 0.8413 − 0.1587 = 0.6826.'],l);
  return q('Normal distribution','X ~ N('+mean+', '+sigma+'²). Find P(X < '+bound+') to 4 decimal places.',
   CDF[String(z)],['Standardise: z = ('+bound+' − '+mean+')/'+sigma+' = '+z+'.',
    'Use the standard normal distribution: P(Z < '+z+') = Φ('+z+').',
    'From a Z table, the probability is '+CDF[String(z)]+'.'],l);
 },
 (l,v)=>{
  let original=35+v%20,shift=2+l+v%8,scale=2+v%4,coded=frac(original-shift,scale);
  return q('Statistical coding','Data are coded by y = (x − '+shift+')/'+scale+'. If the mean of x is '+original+', find the mean of y.',
   coded,['For a linear coding, mean(y) = (mean(x) − '+shift+')/'+scale+'.',
    'Substitute ('+original+' − '+shift+')/'+scale+'.',
    'The coded mean is '+coded+'.'],l);
 },
 (l,v)=>{
  let a=2+v%6,b=3+l+v%7,m=1+v%4,total=a+b,ratio=frac(a,total);
  return q('Probability modelling','A sample contains '+a+' items of type A and '+b+' of type B. Estimate P(A) from relative frequency.',
   ratio,['Use the relative frequency estimate P(A) ≈ frequency(A)/total.',
    'The total number observed is '+a+' + '+b+' = '+total+'.',
    'Therefore P(A) ≈ '+a+'/'+total+' = '+ratio+'.'],l);
 }
];
for(const [course,gens] of Object.entries({p2,p3,p4,s1})){
 const result=[];
 for(const [level,count] of [10,10,20,10].entries()){
  for(let i=0;i<count;i++){
   const g=gens[(i+level)%gens.length],v=level*21+i;
   result.push(g(level,v));
  }
 }
 if(result.length!==50||result.some(x=>!x.q||!x.a||!Array.isArray(x.w)||x.w.length<3))throw Error('Invalid '+course+' question bank');
 out[course]=result;
}
})();