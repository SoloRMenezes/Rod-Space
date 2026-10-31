window.mathsDetailedNotes=window.mathsDetailedNotes||{};
window.mathsDetailedNotes.p3={
  "1.1": {
    "summary": "When adding rational algebraic expressions, use a common denominator; for multiplication, multiply numerators and denominators and factorise to cancel common factors. You may cancel factors but never individual terms from sums. State all values excluded by the original denominators.",
    "rule": "a/b + c/d = (ad+bc)/bd",
    "example": "Simplify 1/x + 2/(x+1) = (x+1+2x)/[x(x+1)] = (3x+1)/[x(x+1)], where x ≠ 0,−1."
  },
  "1.2": {
    "summary": "An improper algebraic fraction has a numerator whose degree is at least as large as the denominator's. Divide polynomials first to obtain a polynomial plus a proper fraction. This can make partial fractions and integration easier later.",
    "rule": "f(x)/g(x) = q(x) + r(x)/g(x), degree r < degree g",
    "example": "Divide (x²+3x+5) by (x+1): quotient x+2 and remainder 3, so x+2+3/(x+1)."
  },
  "2.1": {
    "summary": "A modulus means distance from zero and cannot be negative. The graph y=|f(x)| reflects any portions of y=f(x) below the x-axis upward. An equation |A|=k (k≥0) gives A=±k.",
    "rule": " |x| = x for x≥0, and −x for x<0",
    "example": "Solve |2x−3|=5: 2x−3=5 or −5, so x=4 or x=−1."
  },
  "2.2": {
    "summary": "A mapping sends each permitted input to an output. A function must assign a unique output to each input; domain and range describe allowable inputs and attained outputs. One-to-one functions have distinct outputs for distinct inputs.",
    "rule": "f:A→B, x↦f(x)",
    "example": "For f(x)=x² on all real numbers, f(2)=f(−2)=4; it is not one-to-one. Restricting to x≥0 makes it one-to-one."
  },
  "2.3": {
    "summary": "Composition applies one function after another. In f(g(x)), calculate g(x) first, then apply f to that expression. Domains must be restricted so the inner output is valid for the outer function.",
    "rule": "(f∘g)(x)=f(g(x))",
    "example": "If f(x)=2x+1 and g(x)=x², then f(g(3))=f(9)=19, while g(f(3))=g(7)=49."
  },
  "2.4": {
    "summary": "An inverse function undoes the original function. Swap x and y in y=f(x) and rearrange; ensure f is one-to-one on its stated domain. The graph of f⁻¹ is the reflection of f in y=x.",
    "rule": "f⁻¹(f(x))=x on a valid domain",
    "example": "For f(x)=3x−2, write x=3y−2 and solve y=(x+2)/3; hence f⁻¹(x)=(x+2)/3."
  },
  "2.5": {
    "summary": "For y=|f(x)|, reflect the negative part of y=f(x) above the horizontal axis. For y=f(|x|), take the right-hand half of y=f(x) and reflect it into the left half. These transformations are not the same.",
    "rule": " |f(x)|≥0; f(|−x|)=f(|x|)",
    "example": "For f(x)=x−2, |f(x)|=|x−2| is V-shaped at x=2. But f(|x|)=|x|−2 is symmetric about the y-axis."
  },
  "2.6": {
    "summary": "Combining graph transformations requires careful treatment of inside and outside changes. An inside shift is horizontally reversed in sign, an inside scale acts inversely, and outside operations act vertically. Track key coordinates to avoid errors.",
    "rule": "y = af(b(x−h))+k",
    "example": "If (2,3) lies on y=f(x), then on y=2f(x−4)+1 it becomes (6,7)."
  },
  "2.7": {
    "summary": "To solve an equation with modulus, split into cases based on the sign of the expression inside it. For inequalities, consider the distance interpretation or derive a pair of inequalities. Check each solution against the required sign and domain.",
    "rule": " |x−a|<r ⇒ a−r<x<a+r for r>0",
    "example": "Solve |2x−1|≤3: −3≤2x−1≤3, hence −1≤x≤2."
  },
  "3.1": {
    "summary": "Secant, cosecant and cotangent are reciprocal trigonometric functions. Their values are undefined where the corresponding denominator vanishes. Express them in sine or cosine to simplify most algebra.",
    "rule": "sec x=1/cos x; cosec x=1/sin x; cot x=cos x/sin x",
    "example": "If sinθ=3/5 and cosθ=4/5 (acute θ), then cosecθ=5/3, secθ=5/4 and cotθ=4/3."
  },
  "3.2": {
    "summary": "The graphs of sec and cosec have branches separated by vertical asymptotes where cos or sin is zero. Their ranges are y≤−1 or y≥1. Cotangent has period π and asymptotes at integer multiples of π.",
    "rule": "Period of sec and cosec: 2π; period of cot: π",
    "example": "Sketch y=sec x: it passes through (0,1), has asymptotes at x=π/2 and 3π/2, and passes through (π,−1)."
  },
  "3.3": {
    "summary": "Rewrite reciprocal trig functions as ratios and use standard identities to solve equations. Values outside the allowed range for sec or cosec have no real solutions. Remember to include all answers in the specified interval.",
    "rule": "sec²x=1+tan²x; cosec²x=1+cot²x",
    "example": "Solve sec x=2 for 0≤x<2π: cos x=1/2, so x=π/3 or 5π/3."
  },
  "3.4": {
    "summary": "Trigonometric identities can be proved by replacing sec, cosec, cot and tan with sine and cosine. Use sin²x+cos²x=1 to simplify algebra and identify expressions equal on the common domain.",
    "rule": "1+tan²x=sec²x; 1+cot²x=cosec²x",
    "example": "Prove sec²x−tan²x=1: (1−sin²x)/cos²x = cos²x/cos²x = 1."
  },
  "3.5": {
    "summary": "Inverse trig functions return principal angles, so pay attention to restricted ranges. Arcsin returns an angle from −π/2 to π/2; arccos from 0 to π; arctan from −π/2 to π/2. Use trig symmetry for other solutions.",
    "rule": "sin(arcsin x)=x for −1≤x≤1",
    "example": "arcsin(1/2)=π/6, although sinθ=1/2 also holds at 5π/6 in [0,π]."
  },
  "4.1": {
    "summary": "Addition formulae express the sine and cosine of A±B in terms of the trig values of A and B. Keep signs carefully: cosine has a minus sign for a sum, while sine has a plus sign.",
    "rule": "sin(A±B)=sin A cos B±cos A sin B; cos(A±B)=cos A cos B∓sin A sin B",
    "example": "sin75°=sin(45°+30°)=(√2/2)(√3/2)+(√2/2)(1/2)=(√6+√2)/4."
  },
  "4.2": {
    "summary": "Use compound-angle formulas to obtain exact values or solve equations involving sums and differences of angles. Choose angles with known exact trig values and check the sign in the original quadrant.",
    "rule": "tan(A+B)=(tan A+tan B)/(1−tan A tan B), where defined",
    "example": "cos15°=cos(45°−30°)=√6/4+√2/4=(√6+√2)/4."
  },
  "4.3": {
    "summary": "Double-angle identities arise by setting A=B in the addition formulas. Equivalent forms of cos2x let you rewrite everything in terms of sine alone or cosine alone before solving or integrating.",
    "rule": "sin2x=2sinx cosx; cos2x=cos²x−sin²x=1−2sin²x=2cos²x−1",
    "example": "Given sin x=3/5, cos x=4/5 (acute), sin2x=2×3/5×4/5=24/25."
  },
  "4.4": {
    "summary": "Solve complicated trig equations by first using addition or double-angle identities to express the equation in simpler trigonometric functions. Factor where possible, then list all angles within the interval. Be careful if you divide by a trig function.",
    "rule": "sin2x=2sinx cosx",
    "example": "Solve sin2x=sinx: sinx(2cosx−1)=0. In 0≤x<2π, x=0, π, π/3, 5π/3."
  },
  "4.5": {
    "summary": "Any expression a cos x+b sin x can be written as a single shifted cosine or sine with amplitude R. Determine R using Pythagoras and α from a=Rcosα, b=Rsinα. This makes maximum, minimum and equations easier.",
    "rule": "a cos x+b sin x=R cos(x−α), R=√(a²+b²)",
    "example": "3cos x+4sin x=5cos(x−α), where cosα=3/5, sinα=4/5; maximum value is 5."
  },
  "4.6": {
    "summary": "In a proof, simplify the more complicated side until it matches the other without assuming equality mid-way. Convert to sin and cos, use compound-angle and Pythagorean identities, and state domain restrictions for denominators.",
    "rule": "sin(A+B)+sin(A−B)=2sin A cos B",
    "example": "Expand both sine terms: sinAcosB+cosAsinB + sinAcosB−cosAsinB = 2sinAcosB."
  },
  "5.1": {
    "summary": "The natural exponential eˣ has the remarkable property that its derivative equals itself. General exponentials aˣ can be rewritten using eˣ and the natural logarithm. Growth or decay rates are proportional to the current value.",
    "rule": "d(eˣ)/dx=eˣ; aˣ=e^(x ln a)",
    "example": "If y=3e²ˣ, then at x=0, y=3; after x=1, y=3e²≈22.17."
  },
  "5.2": {
    "summary": "In y=e^(ax+b)+c, a controls horizontal scaling, b shifts the graph horizontally, and c sets the horizontal asymptote y=c. The exponential part stays positive, so y>c. Solve by isolating e and taking ln.",
    "rule": "y=e^(ax+b)+c; horizontal asymptote y=c",
    "example": "Solve e^(2x+1)+3=8: e^(2x+1)=5, so 2x+1=ln5 and x=(ln5−1)/2."
  },
  "5.3": {
    "summary": "The natural logarithm ln x is the inverse of eˣ and is defined only for x>0. Its graph passes through (1,0), grows slowly and has vertical asymptote x=0. Log laws apply just as for other bases.",
    "rule": "ln(eˣ)=x; e^(ln x)=x for x>0",
    "example": "Solve ln x=2: x=e². Solve ln(3x)=ln12: 3x=12 so x=4."
  },
  "5.4": {
    "summary": "Taking logs turns exponential relationships into straight-line forms, allowing parameters to be estimated from data. For y=Aeᵏˣ, graph ln y against x; gradient is k and intercept ln A. For power laws, graph ln y against ln x.",
    "rule": "y=Aeᵏˣ ⇒ ln y=ln A+kx",
    "example": "If ln y=1.5+0.4x, then y=e¹·⁵ e⁰·⁴ˣ, so initial value A=e¹·⁵ and growth constant k=0.4."
  },
  "5.5": {
    "summary": "Exponential models describe growth or decay whose rate is proportional to the current amount. Determine a starting value and growth constant from data, then use logarithms to solve for times or targets. Assess whether extrapolation is reasonable.",
    "rule": "P(t)=P₀eᵏᵗ; doubling time ln2/k if k>0",
    "example": "For P=100e⁰·¹ᵗ, solve P=200: e⁰·¹ᵗ=2 ⇒ t=ln2/0.1≈6.93."
  },
  "6.1": {
    "summary": "When angles are in radians, the derivative of sin x is cos x and that of cos x is −sin x. Apply the chain rule when the angle is multiplied or shifted. These results rely on radian measure.",
    "rule": "d(sinx)/dx=cosx; d(cosx)/dx=−sinx",
    "example": "Differentiate 4sin(3x)−2cosx: 12cos(3x)+2sinx."
  },
  "6.2": {
    "summary": "The derivative of eᵘ is eᵘ times u′. The derivative of ln|u| is u′/u wherever u is nonzero. More general aˣ has derivative aˣ ln a.",
    "rule": "d(eᵘ)/dx=u′eᵘ; d(ln|u|)/dx=u′/u",
    "example": "Differentiate e^(2x)+ln(3x): 2e²ˣ + 1/x."
  },
  "6.3": {
    "summary": "The chain rule differentiates a function inside another function: differentiate the outside, leave the inside in place, then multiply by the derivative of the inside. It is the key rule for powers of brackets and composite trig functions.",
    "rule": "If y=f(g(x)), y′=f′(g(x))g′(x)",
    "example": "If y=(3x²+1)⁴, then y′=4(3x²+1)³×6x=24x(3x²+1)³."
  },
  "6.4": {
    "summary": "The product rule differentiates two variable factors multiplied together. Differentiate one while keeping the other, then swap. Merely multiplying derivatives gives the wrong result.",
    "rule": "(uv)′=u′v+uv′",
    "example": "For y=x²sinx, y′=2xsinx+x²cosx."
  },
  "6.5": {
    "summary": "The quotient rule differentiates a ratio of two functions, provided the denominator is nonzero. Identify numerator u and denominator v and keep the order vu′−uv′. Simplify afterwards.",
    "rule": "(u/v)′=(vu′−uv′)/v²",
    "example": "For y=x/(x+1), y′=[(x+1)×1−x×1]/(x+1)²=1/(x+1)²."
  },
  "6.6": {
    "summary": "Trig functions beyond sine and cosine can be differentiated using reciprocal identities and the chain rule. In particular, tan′=sec², sec′=sec tan and cot′=−cosec². Match the formula to the function and internal angle.",
    "rule": "d(tanx)/dx=sec²x; d(secx)/dx=secx tanx",
    "example": "Differentiate tan(2x): by chain rule, y′=2sec²(2x)."
  },
  "7.1": {
    "summary": "Standard integrals reverse familiar derivative rules for powers, exponentials and trig functions. The integral of 1/x differs from the power rule and is ln|x|+C. Include the constant for indefinite integrals.",
    "rule": "∫eˣdx=eˣ+C; ∫cosx dx=sinx+C; ∫1/x dx=ln|x|+C",
    "example": "∫(2eˣ+3cosx)dx=2eˣ+3sinx+C."
  },
  "7.2": {
    "summary": "When integrating f(ax+b), account for the derivative a of the inner linear expression by dividing by a. This is reverse chain rule for a simple linear argument. Check by differentiating the answer.",
    "rule": "∫(ax+b)ⁿdx=(ax+b)ⁿ⁺¹/[a(n+1)]+C, n≠−1",
    "example": "∫(2x+3)⁴ dx=(2x+3)⁵/10+C."
  },
  "7.3": {
    "summary": "Trigonometric identities often turn a difficult integrand into standard terms. Use cos2x=1−2sin²x to rewrite squared sine and cosine, then integrate term by term.",
    "rule": "sin²x=(1−cos2x)/2; cos²x=(1+cos2x)/2",
    "example": "∫sin²x dx=½∫(1−cos2x)dx=x/2−sin2x/4+C."
  },
  "7.4": {
    "summary": "The reverse chain rule recognises an outer function accompanied by the derivative of its inner function. Use substitution mentally when the pair is obvious and explicitly when it is not. Always verify by differentiation.",
    "rule": "∫f′(x)[f(x)]ⁿdx=[f(x)]ⁿ⁺¹/(n+1)+C, n≠−1",
    "example": "∫6x(3x²+2)⁴dx: let u=3x²+2, du=6x dx; answer u⁵/5+C=(3x²+2)⁵/5+C."
  },
  "8.1": {
    "summary": "A root of f(x)=0 is where its graph crosses or touches the x-axis. If continuous f(a) and f(b) have opposite signs, there is at least one root between a and b. Repeated interval halving locates a root to a desired accuracy.",
    "rule": "f(a)f(b)<0 for continuous f ⇒ at least one root in (a,b)",
    "example": "For f(x)=x³−2, f(1)=−1 and f(2)=6, so a root lies between 1 and 2."
  },
  "8.2": {
    "summary": "Fixed-point iteration rearranges an equation into x=g(x) and repeatedly computes xₙ₊₁=g(xₙ). Some rearrangements converge and some diverge; a useful local test is |g′(r)|<1 at the desired fixed point. Compare successive approximations.",
    "rule": "xₙ₊₁=g(xₙ)",
    "example": "For x²=2 use xₙ₊₁=(xₙ+2/xₙ)/2, x₀=1: x₁=1.5, x₂≈1.4167, x₃≈1.4142."
  }
};
