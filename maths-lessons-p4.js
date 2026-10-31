window.mathsDetailedNotes=window.mathsDetailedNotes||{};
window.mathsDetailedNotes.p4={
  "1.1": {
    "summary": "Proof by contradiction assumes the statement you want to prove is false, then derives an impossibility. This shows the assumption cannot hold, establishing the original statement. Explain exactly which fact is contradicted; mere numerical tests are insufficient.",
    "rule": "Assume ¬P ⇒ contradiction; therefore P",
    "example": "Prove √2 irrational: if √2=a/b in lowest terms, then a²=2b² means a is even; substituting a=2k also makes b even, contradicting lowest terms."
  },
  "2.1": {
    "summary": "Partial fractions decompose a rational function into simpler terms over factors of its denominator. Factorise fully and assign an unknown numerator to each linear factor. Multiply through by the denominator and solve for constants.",
    "rule": "A/[(x−a)(x−b)]=B/(x−a)+C/(x−b)",
    "example": "1/[(x−1)(x+1)] = ½/(x−1) − ½/(x+1), since the combined numerator is ½(x+1)−½(x−1)=1."
  },
  "2.2": {
    "summary": "When a denominator contains a repeated linear factor, include every power up to that multiplicity. A repeated quadratic factor similarly needs a suitable numerator for each power. Missing one term prevents the decomposition from representing all possible numerators.",
    "rule": "For (x−a)²: A/(x−a)+B/(x−a)²",
    "example": "Write (2x+1)/(x−1)² = 2/(x−1)+3/(x−1)² because 2(x−1)+3=2x+1."
  },
  "2.3": {
    "summary": "An improper rational function has numerator degree at least denominator degree. Divide polynomials first, then decompose the proper remainder into partial fractions. This matters when integrating rational functions.",
    "rule": "f(x)/g(x)=polynomial+proper fraction",
    "example": "x²/(x−1)=x+1+1/(x−1), since (x−1)(x+1)+1=x²."
  },
  "3.1": {
    "summary": "A parametric curve specifies x and y separately as functions of a parameter t. Eliminate t when possible to obtain a Cartesian equation, but retain its allowed range because it may trace only part of a curve. The direction of motion follows increasing t.",
    "rule": "x=f(t), y=g(t)",
    "example": "For x=t+1, y=t², eliminate t=x−1 to obtain y=(x−1)²."
  },
  "3.2": {
    "summary": "Trigonometric identities help eliminate an angle parameter. For x=a cos t, y=b sin t, square each normalised coordinate and add. The interval of t determines whether a full ellipse or only an arc is traced.",
    "rule": "sin²t+cos²t=1",
    "example": "If x=3cos t and y=2sin t, then x²/9+y²/4=1; this is an ellipse."
  },
  "3.3": {
    "summary": "To sketch a parametric curve, find intercepts and significant parameter values, then compute coordinates and indicate the direction as t increases. Identify any cusps, loops and restrictions that might be hidden after eliminating the parameter.",
    "rule": "Plot several (x(t),y(t)) points in increasing t order",
    "example": "For x=t², y=t, t from −2 to 2: points (4,−2),(0,0),(4,2) lie on x=y², traversed bottom to top."
  },
  "4.1": {
    "summary": "For non-integer or negative n, the general binomial series of (1+x)ⁿ is infinite, and it converges for |x|<1. Coefficients use n(n−1)… rather than a finite combination count. Use only as many terms as the requested accuracy requires.",
    "rule": "(1+x)ⁿ=1+nx+n(n−1)x²/2!+… , |x|<1",
    "example": "For (1+x)⁻¹, n=−1, giving 1−x+x²−x³+…; at x=0.1 this approximates 1/1.1."
  },
  "4.2": {
    "summary": "To expand (a+bx)ⁿ, factor out a first and express the remaining bracket as 1+(b/a)x. Apply the general binomial series and multiply back by aⁿ. Convergence requires |(b/a)x|<1 for non-integer expansions.",
    "rule": "(a+bx)ⁿ=aⁿ(1+(b/a)x)ⁿ",
    "example": "For (2+x)⁻¹ = ½(1+x/2)⁻¹ ≈ ½−x/4+x²/8, valid for |x|<2."
  },
  "4.3": {
    "summary": "Decompose a rational expression into partial fractions before expanding if its denominator has several factors. Expand each simple fraction with the binomial series and combine like powers. The final interval of validity must satisfy every component expansion.",
    "rule": "1/(1−x)=1+x+x²+…, |x|<1",
    "example": "1/[(1−x)(1+x)]=½/(1−x)+½/(1+x)=1+x²+x⁴+…, for |x|<1."
  },
  "5.1": {
    "summary": "For parametric equations x(t), y(t), differentiate both with respect to t and divide. This gives the tangent gradient wherever dx/dt ≠ 0. Watch points where dx/dt=0; the tangent may be vertical or require separate analysis.",
    "rule": "dy/dx=(dy/dt)/(dx/dt)",
    "example": "If x=t²+1 and y=t³, then dy/dx=3t²/(2t)=3t/2 for t≠0; at t=2 the gradient is 3."
  },
  "5.2": {
    "summary": "Implicit differentiation works when x and y are linked without y being isolated. Differentiate both sides with respect to x, remembering that d(yⁿ)/dx = nyⁿ⁻¹ dy/dx. Then solve for dy/dx.",
    "rule": "d(y²)/dx=2y(dy/dx)",
    "example": "For x²+y²=25, 2x+2y y′=0, hence y′=−x/y. At (3,4), gradient=−3/4."
  },
  "5.3": {
    "summary": "Related-rate problems involve quantities changing with time. Write a relation between variables, differentiate both sides with respect to t using the chain rule, and substitute the values at the instant of interest. Pay attention to units and signs.",
    "rule": "dV/dt=(dV/dr)(dr/dt)",
    "example": "For a sphere V=4πr³/3 and dr/dt=2 cm/s at r=3 cm, dV/dt=4π(3²)(2)=72π cm³/s."
  },
  "6.1": {
    "summary": "The area under a parametrically defined curve is found by replacing dx with (dx/dt)dt. Convert the x-limits into parameter limits and check the orientation, because the signed integral may be negative if x decreases.",
    "rule": "∫ y dx=∫ y(t)x′(t)dt",
    "example": "For x=t², y=t, 0≤t≤2: area under the curve =∫₀² t(2t)dt=[2t³/3]₀²=16/3."
  },
  "6.2": {
    "summary": "Rotating a region under y=f(x) about the x-axis generates a solid with circular cross-sections. Each cross-sectional area is πy², integrated over the x-interval. For a hollow region, subtract the inner volume from the outer.",
    "rule": "V=π∫ₐᵇ[y(x)]²dx",
    "example": "Rotate y=x from 0 to 2 around the x-axis: V=π∫₀² x²dx=8π/3."
  },
  "6.3": {
    "summary": "Substitution simplifies an integral by replacing an inner expression with a new variable u. Differentiate u to replace dx consistently; for definite integrals, also transform the bounds. Choose a substitution whose derivative appears in the integrand.",
    "rule": "Let u=g(x), du=g′(x)dx",
    "example": "∫2x(x²+1)³dx: set u=x²+1, du=2x dx; ∫u³du=u⁴/4+C=(x²+1)⁴/4+C."
  },
  "6.4": {
    "summary": "Integration by parts reverses the product rule and is useful when an integrand is a product of functions. Choose u to become simpler when differentiated and dv to be easy to integrate. Evaluate the resulting integral carefully.",
    "rule": "∫u dv=uv−∫v du",
    "example": "∫x eˣ dx: take u=x, dv=eˣdx; result xeˣ−∫eˣdx=(x−1)eˣ+C."
  },
  "6.5": {
    "summary": "Partial fractions turn rational integrals into sums of standard logarithmic and power integrals. Factor the denominator, decompose and integrate each term. The logarithm of a linear factor uses absolute values for a real antiderivative.",
    "rule": "∫1/(x−a)dx=ln|x−a|+C",
    "example": "∫1/(x²−1)dx = ½ln|x−1|−½ln|x+1|+C."
  },
  "6.6": {
    "summary": "A differential equation relates a function and its derivatives. For separable equations, rearrange to put y-terms on one side and x-terms on the other, integrate and use conditions to find constants. Beware constant solutions lost by division.",
    "rule": "dy/dx=ky ⇒ dy/y=k dx ⇒ y=Aeᵏˣ",
    "example": "Solve dy/dx=2y with y(0)=3: ln|y|=2x+C, giving y=3e²ˣ."
  },
  "6.7": {
    "summary": "Model a rate using a differential equation based on the physical situation, solve it, then use observed data as initial conditions. Check whether the model respects bounds, units and assumptions. Growth proportional to population is a common example.",
    "rule": "dP/dt=kP ⇒ P(t)=P₀eᵏᵗ",
    "example": "A population of 500 grows at a rate 0.04P yearly: P(t)=500e⁰·⁰⁴ᵗ; after 5 years, P≈610.7."
  },
  "7.1": {
    "summary": "A vector has magnitude and direction, unlike a scalar. Vector addition combines displacements; subtraction gives the displacement between positions. Algebra uses the same vectors regardless of where they are drawn.",
    "rule": "a+b=(a₁+b₁,a₂+b₂,a₃+b₃)",
    "example": "If a=(2,−1) and b=(3,4), then a+b=(5,3) and a−b=(−1,−5)."
  },
  "7.2": {
    "summary": "Represent vectors with components along coordinate axes or as directed segments. Components specify horizontal, vertical and depth changes. Scalar multiplication scales a vector and reverses its direction when the scalar is negative.",
    "rule": "λ(a,b,c)=(λa,λb,λc)",
    "example": "The vector from A(1,2,3) to B(4,0,5) is B−A=(3,−2,2)."
  },
  "7.3": {
    "summary": "Magnitude measures vector length, using Pythagoras in any dimension. Divide a nonzero vector by its magnitude for a unit vector, and compute direction angles from components or dot products.",
    "rule": " |a|=√(a₁²+a₂²+a₃²); unit vector=a/|a|",
    "example": "For a=(3,4,0), magnitude √(9+16)=5; unit vector (3/5,4/5,0)."
  },
  "7.4": {
    "summary": "A 3D vector has three components corresponding to the x, y and z axes. Add and scale componentwise; use the three-dimensional distance formula for magnitudes. Geometric intuition extends from two dimensions to three.",
    "rule": "Distance AB=√[(Δx)²+(Δy)²+(Δz)²]",
    "example": "From A(1,1,1) to B(3,4,7), displacement (2,3,6) has length √(4+9+36)=7."
  },
  "7.5": {
    "summary": "Use vectors in two-dimensional geometric proofs to describe lines, midpoints and parallelograms. Express positions from a common origin and combine displacements along different paths. Two directed routes between the same endpoints must agree.",
    "rule": "AB=OB−OA; midpoint M=(OA+OB)/2",
    "example": "If OA=a and OB=b, the midpoint position vector of AB is (a+b)/2."
  },
  "7.6": {
    "summary": "In 3D geometry, vectors allow proofs of parallelism, collinearity and distances without diagrams being to scale. Points are collinear if their displacement vectors are scalar multiples; intersecting lines require simultaneous coordinate conditions.",
    "rule": "AB=λAC indicates A,B,C collinear when λ is real",
    "example": "A(0,0,0), B(2,4,6), C(1,2,3) are collinear because AB=2AC."
  },
  "7.7": {
    "summary": "A position vector gives the location of a point relative to an origin. The vector from A to B is the difference between their position vectors. This simplifies midpoint and vector geometry questions.",
    "rule": "AB=b−a where OA=a and OB=b",
    "example": "If OA=(1,3,2) and OB=(4,2,7), then AB=(3,−1,5)."
  },
  "7.8": {
    "summary": "Coordinates in 3D describe an ordered triple (x,y,z). Find a midpoint by averaging corresponding coordinates and distance by three-dimensional Pythagoras. Draw perpendicular axes if a visual picture helps.",
    "rule": "M=((x₁+x₂)/2,(y₁+y₂)/2,(z₁+z₂)/2)",
    "example": "Midpoint of A(2,0,4) and B(4,6,8) is (3,3,6)."
  },
  "7.9": {
    "summary": "A 3D line is described by one known point plus a scalar multiple of its direction vector. Parametric equations for x, y and z share the same parameter. Parallel direction vectors do not by themselves prove the lines are coincident.",
    "rule": "r=a+λd",
    "example": "Line through (1,2,3) with direction (2,−1,4): x=1+2λ, y=2−λ, z=3+4λ."
  },
  "7.10": {
    "summary": "To determine whether two 3D lines intersect, equate all three coordinate expressions and solve for their separate parameters. A solution must satisfy all three equations; otherwise the lines may be skew even if their projections cross.",
    "rule": "a+λd=b+μe (three coordinate equations)",
    "example": "Lines r=(0,0,0)+λ(1,1,1) and r=(1,0,0)+μ(0,1,1) intersect: x forces λ=1, y forces μ=1 and z confirms μ=1, giving intersection (1,1,1)."
  },
  "7.11": {
    "summary": "The scalar (dot) product measures directional alignment. It equals the sum of matching component products and also the product of magnitudes times cosθ. A zero dot product means nonzero vectors are perpendicular.",
    "rule": "a·b=a₁b₁+a₂b₂+a₃b₃=|a||b|cosθ",
    "example": "For a=(1,2,0) and b=(2,−1,3), a·b=2−2+0=0, so they are perpendicular."
  }
};
