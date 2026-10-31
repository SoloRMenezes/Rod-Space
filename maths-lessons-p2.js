window.mathsDetailedNotes=window.mathsDetailedNotes||{};
window.mathsDetailedNotes.p2={
  "1.1": {
    "summary": "An algebraic fraction is simplified by factorising numerator and denominator and cancelling common factors, not individual terms in a sum. Addition requires a common denominator; division means multiplying by the reciprocal. State values excluded by the original denominators.",
    "rule": "a/b + c/d = (ad + bc)/bd",
    "example": "Simplify (x² − 9)/(x² − 3x): factor to (x−3)(x+3)/[x(x−3)] = (x+3)/x, with x ≠ 0,3."
  },
  "1.2": {
    "summary": "Polynomial division expresses a polynomial as a divisor times a quotient plus a remainder of lower degree. Divide leading terms first, subtract, then repeat until the remainder is small enough. Long division and synthetic division agree.",
    "rule": "f(x) = d(x)q(x) + r(x)",
    "example": "Divide x² + 5x + 6 by x + 2: (x + 2)(x + 3) = x² + 5x + 6. Quotient x + 3, remainder 0."
  },
  "1.3": {
    "summary": "The factor theorem lets you test linear factors without dividing. If f(a) = 0, then x − a is a factor; if f(a) ≠ 0 it is not. After identifying a factor, divide to find the remaining polynomial.",
    "rule": "x − a divides f(x) exactly iff f(a) = 0",
    "example": "For f(x) = x³ − 4x, f(2) = 8 − 8 = 0, so x − 2 is a factor; indeed f(x) = x(x − 2)(x + 2)."
  },
  "1.4": {
    "summary": "The remainder theorem states that when f(x) is divided by x − a, the remainder equals f(a). This avoids long division when only the remainder is needed. For a divisor ax − b, substitute x = b/a.",
    "rule": "Remainder on division by x − a is f(a)",
    "example": "For f(x) = 2x³ + x − 4 divided by x − 2, f(2) = 16 + 2 − 4 = 14; remainder 14."
  },
  "1.5": {
    "summary": "A mathematical proof is a logically complete argument that works for every case in the statement. Start from definitions or established facts and justify each operation. Numerical examples can disprove a universal statement but cannot prove it.",
    "rule": "To prove “for all n”, show the reasoning for arbitrary allowed n",
    "example": "The sum of two even integers 2m and 2n is 2(m+n), which is even because m+n is an integer."
  },
  "1.6": {
    "summary": "Direct proof starts from the assumptions; proof by exhaustion checks every case in a finite set; counterexample disproves a universal claim. A contradiction assumes the opposite and derives something impossible. Name the method and keep each step valid.",
    "rule": "A single counterexample disproves “for every …”",
    "example": "Disprove “all primes are odd”: 2 is prime but even. One valid counterexample is sufficient."
  },
  "2.1": {
    "summary": "The midpoint averages endpoint coordinates. The perpendicular bisector passes through that midpoint and has gradient −1/m when the original segment's gradient is m. Every point on it is equally distant from the segment's endpoints.",
    "rule": "Midpoint M = ((x₁+x₂)/2, (y₁+y₂)/2)",
    "example": "For A(0,0), B(4,2), midpoint M(2,1), AB gradient 1/2 and bisector gradient −2; line y−1 = −2(x−2)."
  },
  "2.2": {
    "summary": "A circle consists of points at a fixed radius r from its centre (a,b). Its equation comes directly from the distance formula. Expand to compare with a general quadratic equation or complete the square to find centre and radius.",
    "rule": "(x−a)² + (y−b)² = r²",
    "example": "For centre (3,−1) and radius 5, equation (x−3)² + (y+1)² = 25."
  },
  "2.3": {
    "summary": "Intersections between a line and circle are obtained by substituting the linear equation into the circle equation. The resulting quadratic has two solutions for a secant, one for a tangent and none for a non-intersecting line. Substitute back for coordinates.",
    "rule": "For a tangent, the substitution quadratic has discriminant 0",
    "example": "Intersect y = 0 with x² + y² = 9: x² = 9, hence points (−3,0), (3,0)."
  },
  "2.4": {
    "summary": "A tangent meets a circle at a point and is perpendicular to the radius there. A chord joins two points on the circle; its perpendicular bisector passes through the centre. Use these geometric properties together with line gradients.",
    "rule": "Radius gradient × tangent gradient = −1 (if both finite)",
    "example": "For centre (0,0) and point (3,4), radius gradient 4/3; tangent gradient −3/4, so 3x + 4y = 25."
  },
  "2.5": {
    "summary": "Combine circle equations with triangle geometry. A diameter subtends a right angle at any point on the circle, and the centre-to-chord perpendicular bisects the chord. Use Pythagoras to find distances and radii.",
    "rule": "Angle subtended by a diameter = 90°",
    "example": "If a chord has half-length 4 and lies 3 units from the centre, r² = 4² + 3² = 25, so radius 5."
  },
  "3.1": {
    "summary": "An exponential function changes by a constant multiplicative factor over equal x-intervals. Growth uses base greater than one; decay uses a base between zero and one. The exponential is always positive for positive base.",
    "rule": "y = abˣ; y = Aeᵏˣ",
    "example": "If P = 100(1.05)ᵗ, after two periods P = 100×1.05² = 110.25."
  },
  "3.2": {
    "summary": "A logarithm answers “what power produces this number?” It is the inverse of exponentiation and is defined for a positive argument and valid base. Changing between logarithmic and exponential form is often the quickest first step.",
    "rule": "logₐ x = y ⇔ aʸ = x (a > 0, a ≠ 1)",
    "example": "log₃81 = 4 because 3⁴ = 81."
  },
  "3.3": {
    "summary": "Logarithmic laws convert products to sums, quotients to differences, and powers to multipliers. They are derived from index laws. Do not distribute logarithms across addition: log(a+b) is not generally log a + log b.",
    "rule": "logₐ(xy) = logₐx + logₐy; logₐ(xʳ) = rlogₐx",
    "example": "Simplify log₂8 + log₂4 = log₂32 = 5."
  },
  "3.4": {
    "summary": "To solve an exponential equation, isolate the exponential expression and take logs. To solve a logarithmic equation, combine logs where possible, convert to exponential form and check all solutions satisfy domain restrictions.",
    "rule": "aˣ = b ⇒ x = log b/log a",
    "example": "Solve 2ˣ = 20: x = ln20/ln2 ≈ 4.322."
  },
  "3.5": {
    "summary": "Changing the base of a logarithm lets you calculate a log with a different base, usually log base ten or natural log. The identity follows from setting y = logₐb and taking logarithms of aʸ = b.",
    "rule": "logₐb = ln b/ln a",
    "example": "log₄32 = ln32/ln4 = 5/2."
  },
  "4.1": {
    "summary": "Pascal's triangle gives binomial coefficients in the expansion of (a+b)ⁿ. Each interior number is the sum of the two numbers above it, with ones at the edges. A row for power n contains n+1 entries.",
    "rule": "For n=4: coefficients 1,4,6,4,1",
    "example": "Expand (a+b)³ using row 3: a³ + 3a²b + 3ab² + b³."
  },
  "4.2": {
    "summary": "Factorial notation multiplies all positive integers up to n, with 0! defined as one. It is used to count combinations and express binomial coefficients. The number of ways to choose r objects from n without order is C(n,r).",
    "rule": "n! = n(n−1)…1; C(n,r) = n!/[r!(n−r)!]",
    "example": "C(5,2) = 5!/(2!3!) = (5×4)/(2×1) = 10."
  },
  "4.3": {
    "summary": "The binomial theorem expands a non-negative integer power of a two-term expression. In the general term, the power of the first term decreases as the second increases; use combinations to find the coefficients.",
    "rule": "(a+b)ⁿ = Σᵣ₌₀ⁿ C(n,r)aⁿ⁻ʳbʳ",
    "example": "For (1+2x)³, terms are 1 + 3(2x) + 3(2x)² + (2x)³ = 1+6x+12x²+8x³."
  },
  "4.4": {
    "summary": "Find a specified coefficient or term directly from the general binomial term instead of expanding the entire expression. Set the exponent of x equal to the target degree. Negative coefficients need their signs retained.",
    "rule": "Term Tᵣ₊₁ = C(n,r)aⁿ⁻ʳbʳ",
    "example": "Coefficient of x² in (2+x)⁴: choose r=2, giving C(4,2)×2² = 6×4 = 24."
  },
  "4.5": {
    "summary": "A truncated binomial expansion can approximate expressions close to one. Choose an x with small magnitude and retain enough terms for the requested accuracy. Later terms become smaller when |x| is sufficiently small.",
    "rule": "(1+x)ⁿ ≈ 1+nx+n(n−1)x²/2 for small x",
    "example": "Estimate 1.02⁵: 1 + 5(0.02) + 10(0.02)² = 1.104, close to the exact 1.10408."
  },
  "5.1": {
    "summary": "An arithmetic sequence has a constant difference d between consecutive terms. Identify the first term a and difference before computing the nth term. Negative d produces a decreasing sequence.",
    "rule": "uₙ = a + (n−1)d",
    "example": "For 7, 11, 15, …, a=7 and d=4. u₂₀=7+19×4=83."
  },
  "5.2": {
    "summary": "An arithmetic series is the sum of an arithmetic sequence. Pairing first and last terms gives a shortcut that avoids summing every term. Find n carefully, especially when the final term is specified.",
    "rule": "Sₙ = n(a+l)/2 = n[2a+(n−1)d]/2",
    "example": "Sum the first 10 terms of 3, 5, 7, …: S₁₀=10[6+9×2]/2=120."
  },
  "5.3": {
    "summary": "A geometric sequence multiplies each term by the same ratio r. Determine r by dividing consecutive nonzero terms. The nth term uses r to the (n−1)th power.",
    "rule": "uₙ = arⁿ⁻¹",
    "example": "For 2,6,18,…, a=2 and r=3; u₅=2×3⁴=162."
  },
  "5.4": {
    "summary": "A geometric series adds successive powers of a common ratio. For r ≠ 1, a finite sum follows from multiplying the sum by r and subtracting. Use the version with r−1 or 1−r consistently.",
    "rule": "Sₙ = a(1−rⁿ)/(1−r), r ≠ 1",
    "example": "Sum 3+6+12+24: a=3,r=2,n=4; S₄=3(1−16)/(1−2)=45."
  },
  "5.5": {
    "summary": "An infinite geometric series has a finite sum only when |r|<1; then its terms shrink toward zero. If the ratio is 1 or has magnitude greater than or equal to one, the series does not converge to the usual finite sum.",
    "rule": "S∞ = a/(1−r), only if |r|<1",
    "example": "For 8+4+2+1+…, a=8,r=1/2. Sum = 8/(1−1/2)=16."
  },
  "5.6": {
    "summary": "Sigma notation uses Σ to describe a sum over integer index values. Substitute each index from the lower limit to the upper limit and add the resulting terms. Standard formulas can simplify long arithmetic sums.",
    "rule": "Σᵣ₌₁ⁿ r = n(n+1)/2",
    "example": "Σᵣ₌₁⁴ (2r+1)=3+5+7+9=24."
  },
  "5.7": {
    "summary": "A recurrence relation defines each term from earlier ones, so initial conditions are essential. Compute terms sequentially and look for a pattern or stable value. A first-order linear recurrence may approach a limiting fixed point.",
    "rule": "uₙ₊₁ = auₙ+b",
    "example": "Given u₁=2 and uₙ₊₁=3uₙ+1: u₂=7, u₃=22."
  },
  "5.8": {
    "summary": "Choose an arithmetic model for a fixed increase and a geometric one for a fixed percentage growth or decay. Identify the units of the index and initial amount. Use a finite or infinite sum only when the situation calls for total accumulation.",
    "rule": "Fixed difference → arithmetic; fixed ratio → geometric",
    "example": "A population starts at 200 and grows 4% annually: after 3 years P=200(1.04)³≈224.97."
  },
  "6.1": {
    "summary": "The ASTC sign pattern helps locate angles with a specified sine, cosine or tangent value. Sine is positive in quadrants I and II; cosine in I and IV; tangent in I and III. Use the reference angle and the full interval to list all solutions.",
    "rule": "sin(180°−θ)=sinθ; cos(360°−θ)=cosθ",
    "example": "If sin θ=1/2 for 0°≤θ<360°, the solutions are 30° and 150°."
  },
  "6.2": {
    "summary": "Exact trig values come from 30°–60°–90° and 45°–45°–90° triangles. Learn sin and cos at 0°,30°,45°,60°,90° and apply quadrant signs for other angles. Exact surd form is preferred when requested.",
    "rule": "sin30°=1/2; cos45°=√2/2; tan60°=√3",
    "example": "cos150°=−cos30°=−√3/2 because 150° lies in quadrant II."
  },
  "6.3": {
    "summary": "A trigonometric identity is true for every x in its domain, unlike an equation true only for particular solutions. Rewrite everything using sin and cos, then simplify using Pythagoras and tan definitions. Avoid cancelling a factor that could be zero.",
    "rule": "sin²x + cos²x=1; tanx=sinx/cosx",
    "example": "Simplify (1−sin²x)/cosx: replace numerator with cos²x, then divide to get cosx where cosx≠0."
  },
  "6.4": {
    "summary": "Solve a basic trig equation by finding a reference angle with a calculator or exact values, then using the signs in quadrants to obtain every solution in the interval. Specify whether working in degrees or radians.",
    "rule": "For sinx = k, reference angle α = arcsin|k|",
    "example": "Solve cos x=1/2 for 0°≤x<360°: x=60° or 300°."
  },
  "6.5": {
    "summary": "More complicated trig equations may require factorisation, a double angle, or rearrangement into sin² or cos² form. Solve every resulting basic equation and verify against the original. Do not lose solutions by dividing by sin or cos without checking zero values.",
    "rule": "2sin²x−sinx=0 ⇒ sinx(2sinx−1)=0",
    "example": "For 0°≤x<360°, sinx=0 gives 0°,180°; sinx=1/2 gives 30°,150°: four solutions."
  },
  "6.6": {
    "summary": "An equation asks for particular values of x; an identity asks you to prove two expressions are always equal on their domains. For proof, normally work from one side only and manipulate it into the other. Check restrictions before dividing.",
    "rule": "sin²x+cos²x=1 is an identity",
    "example": "Prove 1−tan²x = (cos²x−sin²x)/cos²x: write tan²x=sin²x/cos²x and combine into one fraction."
  },
  "7.1": {
    "summary": "A function is increasing where its derivative is positive and decreasing where its derivative is negative. Stationary points split the real line into intervals whose signs can be tested. A derivative zero at a point does not automatically mean a maximum or minimum.",
    "rule": "f′(x)>0: increasing; f′(x)<0: decreasing",
    "example": "For f(x)=x²−4x, f′(x)=2x−4, so it decreases for x<2 and increases for x>2."
  },
  "7.2": {
    "summary": "Stationary points occur where the tangent is horizontal and f′(x)=0. Classify using the sign of f′ on either side or the second derivative where applicable. Distinguish maxima, minima and stationary inflections.",
    "rule": "f′(a)=0; f″(a)>0: minimum; f″(a)<0: maximum",
    "example": "For f(x)=x³−3x, f′=3x²−3, so x=±1; f″=6x gives maximum at −1 and minimum at 1."
  },
  "7.3": {
    "summary": "The gradient function f′(x) can be sketched from a given curve: where f rises it is positive, where f falls negative, and at smooth turning points zero. Conversely the sign pattern of f′ helps sketch f. The scale of gradients reflects steepness.",
    "rule": "Zeros of f′ locate stationary points of f",
    "example": "For f(x)=x², f′(x)=2x: the gradient graph is a straight line through the origin."
  },
  "7.4": {
    "summary": "Set up a function for the quantity to optimise, identify any domain restrictions, then differentiate and solve f′=0. Confirm whether the solution is a maximum or minimum and interpret its units. Include endpoints when the domain is bounded.",
    "rule": "Optimal interior value often satisfies f′(x)=0",
    "example": "A rectangle with perimeter 20 has area A=x(10−x). A′=10−2x=0 gives x=5 and maximum area 25."
  },
  "8.1": {
    "summary": "A definite integral evaluates an antiderivative at two bounds and subtracts. It measures signed area or accumulated change, not necessarily geometric area. An integral over a reversed interval changes sign.",
    "rule": "∫ₐᵇ f(x)dx = F(b)−F(a)",
    "example": "∫₀² 3x² dx = [x³]₀²=8."
  },
  "8.2": {
    "summary": "Area between a graph and the x-axis can be calculated with a definite integral when the function remains above the axis. Find where the curve meets the axis and use those limits. Negative parts must be treated separately for geometric area.",
    "rule": "If f(x)≥0 on [a,b], area = ∫ₐᵇ f(x)dx",
    "example": "Under y=x² from 0 to 3, area = ∫₀³ x²dx=[x³/3]₀³=9."
  },
  "8.3": {
    "summary": "A definite integral is negative over a region below the x-axis. Geometric area, however, is always positive. Split the interval at every x-intercept and take the absolute value of each signed contribution.",
    "rule": "Total area = sum of absolute signed integrals",
    "example": "Under y=x from −2 to 2, ∫₋₂² xdx=0, but geometric area = 2+2=4."
  },
  "8.4": {
    "summary": "The area between a curve and a horizontal or sloping line comes from integrating the upper y-expression minus the lower one. Find intersections to obtain limits and check which is on top. Split the integral if the ordering changes.",
    "rule": "Area = ∫ₐᵇ [upper(x)−lower(x)]dx",
    "example": "Between y=4 and y=x² from −2 to 2: ∫₋₂²(4−x²)dx=[4x−x³/3]₋₂²=32/3."
  },
  "8.5": {
    "summary": "For two curves, solve f(x)=g(x) to locate intersection bounds, determine which graph is above each interval, and integrate their difference. A sketch prevents incorrect sign choices.",
    "rule": "Area = ∫ (f−g)dx when f is above g",
    "example": "Between y=2x and y=x² for x=0 to 2: ∫₀²(2x−x²)dx=[x²−x³/3]₀²=4/3."
  },
  "8.6": {
    "summary": "The trapezium rule approximates the area under a curve by dividing the interval into equal strips with straight tops. Use h=(b−a)/n and weight interior ordinates twice. Accuracy usually improves with narrower strips.",
    "rule": "T ≈ h/2[y₀+2(y₁+...+yₙ₋₁)+yₙ]",
    "example": "Estimate ∫₀² x²dx with 2 strips: h=1, y-values 0,1,4; T=½[0+2×1+4]=3 (exact 8/3)."
  }
};
