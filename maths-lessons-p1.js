window.mathsDetailedNotes=window.mathsDetailedNotes||{};
window.mathsDetailedNotes.p1={
  "1.1": {
    "summary": "Indices describe repeated multiplication. Multiply powers of the same base by adding exponents and divide by subtracting them; a power raised to a power multiplies the exponents. Never combine powers with different bases using these laws.",
    "rule": "aᵐaⁿ = aᵐ⁺ⁿ; aᵐ/aⁿ = aᵐ⁻ⁿ; (aᵐ)ⁿ = aᵐⁿ",
    "example": "Simplify x⁵ × x³ ÷ x². The combined exponent is 5 + 3 − 2 = 6, so the answer is x⁶."
  },
  "1.2": {
    "summary": "Expanding brackets means multiplying every term in one expression by each term in the other. For two binomials, collect the four products and then combine like terms. Watch negative signs carefully.",
    "rule": "a(b + c) = ab + ac; (x + a)(x + b) = x² + (a + b)x + ab",
    "example": "Expand (2x − 3)(x + 4): 2x² + 8x − 3x − 12 = 2x² + 5x − 12."
  },
  "1.3": {
    "summary": "Factorising reverses expansion: write an expression as a product. First remove any common factor, then look for quadratic factors or difference of two squares. Factorisation helps solve equations and simplify fractions.",
    "rule": "a² − b² = (a − b)(a + b)",
    "example": "Factor x² − 7x + 12. Two numbers multiply to 12 and add to −7: −3 and −4. Therefore (x − 3)(x − 4)."
  },
  "1.4": {
    "summary": "A negative exponent represents a reciprocal, not a negative number. A fractional exponent represents a root, with the denominator giving the root and the numerator giving the power. The base must satisfy any real-root restrictions.",
    "rule": "a⁻ⁿ = 1/aⁿ; a¹ᐟⁿ = ⁿ√a; aᵐᐟⁿ = (ⁿ√a)ᵐ",
    "example": "Evaluate 27²ᐟ³. First take the cube root: ∛27 = 3. Then square: 3² = 9."
  },
  "1.5": {
    "summary": "A surd is an irrational root kept in exact form. Extract square factors before adding or multiplying surds; only like surds can be combined by addition. Exact surds are preferable to rounded decimals in algebra.",
    "rule": "√(ab) = √a√b for a,b ≥ 0",
    "example": "Simplify √72 + √8: √(36×2) + √(4×2) = 6√2 + 2√2 = 8√2."
  },
  "1.6": {
    "summary": "Rationalising removes a surd from the denominator. For a single root, multiply top and bottom by that root. For a denominator with two terms, use its conjugate so the denominator becomes a difference of squares.",
    "rule": "(a + √b)(a − √b) = a² − b",
    "example": "Rationalise 3/(2 + √5). Multiply by (2 − √5)/(2 − √5) to get 3(2 − √5)/(4 − 5) = 3√5 − 6."
  },
  "2.1": {
    "summary": "Solve a quadratic by setting it equal to zero, then factorising, completing the square or applying the quadratic formula. A product equals zero when at least one factor equals zero. Check both solutions in the original equation.",
    "rule": "ax² + bx + c = 0 ⇒ x = (−b ± √(b² − 4ac))/(2a)",
    "example": "Solve x² − 5x + 6 = 0: (x − 2)(x − 3) = 0, so x = 2 or 3."
  },
  "2.2": {
    "summary": "Completing the square rewrites a quadratic to reveal its vertex and its smallest or largest value. Take half the coefficient of x and square it; compensate for the added constant. This is particularly useful when factorising is difficult.",
    "rule": "x² + 2px + q = (x + p)² + q − p²",
    "example": "Rewrite x² + 6x + 2: (x + 3)² − 9 + 2 = (x + 3)² − 7. Minimum value: −7 at x = −3."
  },
  "2.3": {
    "summary": "A function assigns exactly one output to each permitted input. Function notation f(x) means evaluate the rule at x, and the domain specifies allowed inputs while the range lists attainable outputs. Check excluded values where there are denominators or roots.",
    "rule": "f(a) means substitute x = a into f(x)",
    "example": "If f(x) = 2x² − 3, then f(−2) = 2(4) − 3 = 5. For f(x) = 1/(x − 1), x = 1 is excluded."
  },
  "2.4": {
    "summary": "The graph y = ax² + bx + c is a parabola opening upward for a > 0 and downward for a < 0. Mark the roots, the y-intercept and the symmetry axis. Use completing the square to identify the turning point.",
    "rule": "Axis: x = −b/(2a); y-intercept: (0,c)",
    "example": "For y = x² − 4x + 3, roots are 1 and 3; axis x = 2, and the vertex is (2, −1)."
  },
  "2.5": {
    "summary": "The discriminant is the part of the quadratic formula under the square root. Its sign tells you how many distinct real solutions a quadratic has, without solving for them. For parameter questions, turn the required root count into an inequality.",
    "rule": "Δ = b² − 4ac; Δ > 0: two roots; Δ = 0: one repeated root; Δ < 0: no real roots",
    "example": "For 2x² − 4x + 3 = 0, Δ = 16 − 24 = −8. There are no real roots."
  },
  "3.1": {
    "summary": "To solve two linear equations together, eliminate one variable by adding suitable multiples of the equations, or substitute an expression for a variable. The solution must satisfy both equations. Geometrically it is the point where two lines meet.",
    "rule": "Solve ax + by = c and dx + ey = f simultaneously",
    "example": "For x + y = 7 and x − y = 1, add the equations: 2x = 8, giving x = 4; then y = 3."
  },
  "3.2": {
    "summary": "When one equation is quadratic, substitute the linear equation into it to obtain a quadratic in one variable. Solve it, then substitute each root back into the linear relation. There can be zero, one or two real intersection points.",
    "rule": "Substitute y = mx + c into the quadratic relation",
    "example": "Solve y = x + 1 and y = x² − 1: x² − x − 2 = 0, so x = 2 or −1; points (2,3), (−1,0)."
  },
  "3.3": {
    "summary": "An intersection of two graphs is a simultaneous solution because both equations hold at that point. To obtain exact coordinates, set the expressions for y equal and solve. A sketch is useful for checking how many solutions to expect.",
    "rule": "At an intersection, f(x) = g(x)",
    "example": "Find intersections of y = x² and y = x + 2: x² = x + 2 ⇒ (x − 2)(x + 1) = 0. Points (2,4) and (−1,1)."
  },
  "3.4": {
    "summary": "Solve a linear inequality like an equation, but reverse the inequality symbol whenever multiplying or dividing by a negative number. Show excluded endpoints with open circles and included endpoints with filled circles. Interval notation can express the same set.",
    "rule": "If a < b then −a > −b",
    "example": "Solve −3x + 5 ≥ 11: −3x ≥ 6, divide by −3 and reverse the sign, giving x ≤ −2."
  },
  "3.5": {
    "summary": "Find the roots of a quadratic, then test the signs on the intervals they separate. For an upward-opening parabola the quadratic is negative between distinct roots and positive outside. Include the roots only when the inequality is non-strict.",
    "rule": "For a > 0 and roots r₁ < r₂, a(x − r₁)(x − r₂) < 0 when r₁ < x < r₂",
    "example": "Solve x² − 5x + 6 ≤ 0. Factor (x − 2)(x − 3); the graph is at/below zero for 2 ≤ x ≤ 3."
  },
  "3.6": {
    "summary": "A linear inequality in x and y describes a half-plane. Draw the boundary line by replacing the inequality with equality, then test a point such as (0,0) to choose the correct side. A strict inequality uses a dashed boundary.",
    "rule": "y ≥ mx + c: shade on or above the solid line",
    "example": "For y > 2x − 1, the origin gives 0 > −1, which is true; shade the side containing the origin and draw a dashed line."
  },
  "3.7": {
    "summary": "A feasible region is the intersection of all shaded half-planes in a system of inequalities. Every point in the region satisfies every constraint. Find vertices by solving pairs of boundary equations; these are important in optimisation.",
    "rule": "Feasible region = points satisfying every inequality",
    "example": "For x ≥ 0, y ≥ 0 and x + y ≤ 4, the feasible region is the triangle with vertices (0,0), (4,0), (0,4)."
  },
  "4.1": {
    "summary": "A cubic has a highest power of three and opposite end behaviour: one end rises while the other falls. Factorised form reveals x-intercepts and multiplicities. A repeated root may touch the axis instead of crossing it.",
    "rule": "y = a(x − r₁)(x − r₂)(x − r₃)",
    "example": "Sketch y = x(x − 2)(x + 1): x-intercepts are −1, 0, 2; for a > 0 it falls left and rises right."
  },
  "4.2": {
    "summary": "A reciprocal graph has values that grow without bound near a vertical asymptote. Locate vertical asymptotes by setting a denominator to zero and horizontal asymptotes using behaviour for large |x|. Never plot a point where the function is undefined.",
    "rule": "For y = a/(x − h) + k: asymptotes x = h and y = k",
    "example": "For y = 2/(x − 3) + 1, draw asymptotes x = 3 and y = 1; at x = 4, y = 3."
  },
  "4.3": {
    "summary": "Intersection points satisfy both graph equations. Equate the two expressions for y, solve for x, then find the corresponding y-values. A graph sketch helps reject impossible solutions and interpret tangencies.",
    "rule": "f(x) = g(x) at an intersection",
    "example": "For y = x² and y = 4, solve x² = 4 to get x = ±2; the intersections are (−2,4) and (2,4)."
  },
  "4.4": {
    "summary": "A change outside f(x) moves the graph vertically, while a change inside the argument moves it horizontally in the opposite direction to the sign written. Translations do not change the curve's shape.",
    "rule": "y = f(x) + a: up a; y = f(x − b): right b",
    "example": "Transform y = x² to y = (x − 3)² + 2: translate right 3 and up 2; the vertex becomes (3,2)."
  },
  "4.5": {
    "summary": "Multiplying the whole function scales vertical distances; multiplying the input changes horizontal distances inversely. A negative multiplier also reflects the graph. Distinguish a stretch from a translation before sketching.",
    "rule": "y = af(x): vertical factor |a|; y = f(bx): horizontal factor 1/|b|",
    "example": "For y = f(2x), each original x-coordinate is halved: a point (4,3) becomes (2,3)."
  },
  "4.6": {
    "summary": "Transforming a function may combine translations, stretches and reflections. Apply them systematically by tracking a few known points and any asymptotes. Horizontal changes inside the function act in reverse to what the argument suggests.",
    "rule": "y = af(b(x − h)) + k",
    "example": "For y = −2f(x − 1) + 3, shift right 1, reflect in the x-axis, stretch vertically by 2, then shift up 3."
  },
  "5.1": {
    "summary": "The equation y = mx + c has gradient m and y-intercept c. The gradient measures vertical change per unit horizontal change, so a negative gradient slopes down from left to right. Read both features directly from the equation.",
    "rule": "m = Δy/Δx",
    "example": "For y = −2x + 5, the gradient is −2 and the y-intercept is (0,5); moving right 1 lowers y by 2."
  },
  "5.2": {
    "summary": "A straight line can be specified by its gradient and one point, or by two points from which the gradient is calculated. Rearrange into y = mx + c if required. Vertical lines have an equation x = constant and no finite gradient.",
    "rule": "y − y₁ = m(x − x₁)",
    "example": "The line through (1,3) with gradient 2: y − 3 = 2(x − 1), so y = 2x + 1."
  },
  "5.3": {
    "summary": "Parallel non-vertical lines have identical gradients. Perpendicular lines have gradients that multiply to −1, provided neither is vertical. The perpendicular gradient to m is −1/m.",
    "rule": "Parallel: m₁ = m₂; perpendicular: m₁m₂ = −1",
    "example": "A line perpendicular to y = 3x + 1 has gradient −1/3; through (0,2) its equation is y = −x/3 + 2."
  },
  "5.4": {
    "summary": "The distance between points follows Pythagoras. The midpoint averages their coordinates, and triangle or polygon area can be found using a base-height calculation or decomposition. Keep coordinate units consistent.",
    "rule": "Distance = √[(x₂−x₁)² + (y₂−y₁)²]",
    "example": "Distance between (1,2) and (4,6): √(3² + 4²) = 5. Their midpoint is (2.5,4)."
  },
  "6.1": {
    "summary": "The cosine rule relates all three sides and an included angle in any triangle. Use it for two sides plus the included angle, or for three sides to find an angle. Match the side a with its opposite angle A.",
    "rule": "a² = b² + c² − 2bc cos A",
    "example": "Sides b = 3, c = 4 enclose a right angle. Then a² = 9 + 16 − 24cos90° = 25, so a = 5."
  },
  "6.2": {
    "summary": "The sine rule relates each side to its opposite angle. It works when one side-opposite-angle pair is known. The ambiguous case may give two possible angles because sin θ = sin(180° − θ).",
    "rule": "a/sin A = b/sin B = c/sin C",
    "example": "If a = 6, A = 30°, B = 45°, then b = 6sin45°/sin30° = 6√2."
  },
  "6.3": {
    "summary": "For a triangle with two sides and their included angle, its area is half their product times the sine of the angle. This generalises ½ base × height and works for non-right triangles.",
    "rule": "Area = ½ab sin C",
    "example": "With sides 8 and 5 enclosing 30°, area = ½ × 8 × 5 × sin30° = 10."
  },
  "6.4": {
    "summary": "Start by listing all known sides and angles. Choose sine rule for an opposite side-angle pair, cosine rule for SAS or SSS, and the area formula for an included angle. Check the angle sum is 180° and whether a second solution is possible.",
    "rule": "A + B + C = 180°",
    "example": "A triangle has angles 45° and 70°; its third angle is 65°. With one opposite side known, use the sine rule to find the remaining sides."
  },
  "6.5": {
    "summary": "The sine and cosine graphs oscillate between −1 and 1 with period 2π radians (360°). Tangent has period π and vertical asymptotes where cos x = 0. Use standard key points to sketch accurately.",
    "rule": "sin(x + 2π) = sin x; cos(x + 2π) = cos x; tan(x + π) = tan x",
    "example": "For sin x on [0,2π], mark (0,0), (π/2,1), (π,0), (3π/2,−1), (2π,0)."
  },
  "6.6": {
    "summary": "An outside multiplier changes amplitude; an inside multiplier changes period; constants produce shifts. For sine and cosine, the amplitude is |a| and the period is 2π/|b| for y = a sin(bx). A negative multiplier reflects the graph.",
    "rule": "y = a sin(bx + c) + d; amplitude |a|; period 2π/|b|",
    "example": "For y = 3sin(2x), amplitude = 3 and period = π; it completes two cycles between 0 and 2π."
  },
  "7.1": {
    "summary": "A radian is the angle that subtends an arc equal in length to the circle's radius. Because a full circumference is 2πr, a full turn equals 2π radians. Calculus trigonometric formulas normally use radians.",
    "rule": "180° = π radians; radians = degrees × π/180",
    "example": "Convert 150° to radians: 150π/180 = 5π/6."
  },
  "7.2": {
    "summary": "Arc length is the radius multiplied by the central angle in radians. If given degrees, convert first. The formula gives length along the curved edge, not the straight chord.",
    "rule": "s = rθ (θ in radians)",
    "example": "A radius-6 circle with central angle π/3 has arc length s = 6 × π/3 = 2π."
  },
  "7.3": {
    "summary": "Sector area is proportional to the central angle; a segment is a sector minus its triangular part. Use radians in the sector formula. Decide whether the question asks for minor or major areas.",
    "rule": "Sector area = ½r²θ; triangle area = ½r²sin θ",
    "example": "A sector of radius 4 and angle π/2 has area ½×16×π/2 = 4π. Its segment area is 4π − 8."
  },
  "8.1": {
    "summary": "A gradient of a curve at a point is the slope of its tangent, found as the limit of the gradient of a secant line. A positive gradient means increasing and a negative one means decreasing locally.",
    "rule": "Gradient ≈ Δy/Δx; exact gradient = f′(x)",
    "example": "For y = x² at x = 2, the derivative is 2x, so the tangent gradient is 4."
  },
  "8.2": {
    "summary": "Differentiation creates a function describing instantaneous rate of change. From first principles, compare f(x+h) and f(x), divide their difference by h, then let h approach zero.",
    "rule": "f′(x) = lim(h→0)[f(x+h) − f(x)]/h",
    "example": "For f(x) = x²: [(x+h)² − x²]/h = 2x + h; as h → 0, f′(x) = 2x."
  },
  "8.3": {
    "summary": "The power rule differentiates a term by multiplying by its exponent and reducing that exponent by one. It applies to positive, negative and fractional powers wherever the function is differentiable.",
    "rule": "d(xⁿ)/dx = nxⁿ⁻¹",
    "example": "Differentiate x⁵ − 3x⁻²: 5x⁴ + 6x⁻³."
  },
  "8.4": {
    "summary": "Differentiate each term of a quadratic to find a straight-line gradient function. Set the derivative to zero for its stationary point, then substitute back for the turning-point y-coordinate.",
    "rule": "d(ax²+bx+c)/dx = 2ax+b",
    "example": "For y = 2x² − 8x + 1, dy/dx = 4x − 8. Setting it to zero gives x = 2; y = −7."
  },
  "8.5": {
    "summary": "Differentiate sums term by term; constant terms disappear. For polynomials, apply the power rule separately to every term, including negative coefficients. Simplify only after all derivatives are found.",
    "rule": "d[f(x) + g(x)]/dx = f′(x) + g′(x)",
    "example": "For y = 3x⁴ − 2x³ + 5x − 9, dy/dx = 12x³ − 6x² + 5."
  },
  "8.6": {
    "summary": "The derivative at x = a is the tangent gradient at that point. Use point-gradient form for the tangent; the normal is perpendicular and has negative reciprocal gradient. Find the point from the original function first.",
    "rule": "Tangent: y − f(a) = f′(a)(x − a); normal gradient = −1/f′(a)",
    "example": "For y = x² at x = 1, tangent gradient = 2, point (1,1); tangent y = 2x − 1, normal y = −x/2 + 3/2."
  },
  "8.7": {
    "summary": "The second derivative is the derivative of the first derivative. It describes how the gradient changes and helps classify stationary points: positive means local minimum, negative local maximum when the second-derivative test applies.",
    "rule": "f″(x) = d[f′(x)]/dx",
    "example": "For y = x³ − 3x, f′ = 3x² − 3 and f″ = 6x. At x = −1, f″ = −6, so there is a local maximum."
  },
  "9.1": {
    "summary": "Integration reverses the power rule. Increase the exponent by one and divide by that new exponent, except for x⁻¹, which uses a logarithm in later units. Always add a constant to an indefinite integral.",
    "rule": "∫xⁿdx = xⁿ⁺¹/(n+1) + C, n ≠ −1",
    "example": "Integrate 6x²: 6 × x³/3 + C = 2x³ + C."
  },
  "9.2": {
    "summary": "An indefinite integral represents a family of antiderivatives differing only by a constant. Integrate each term of a sum separately, then add a single +C. Differentiate the result to verify it.",
    "rule": "∫[af(x)+bg(x)]dx = a∫f(x)dx + b∫g(x)dx",
    "example": "∫(4x³ − 2x + 5)dx = x⁴ − x² + 5x + C. Differentiation returns the original polynomial."
  },
  "9.3": {
    "summary": "When given a derivative and one point on the curve, integrate the derivative to recover the family of functions, then use the point to find C. For rates of change in context, C represents the initial amount.",
    "rule": "If f′(x) = g(x), then f(x) = ∫g(x)dx",
    "example": "Given f′(x) = 6x and f(1) = 5: f(x) = 3x² + C; 5 = 3 + C so f(x) = 3x² + 2."
  }
};
