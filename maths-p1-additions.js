(function () {
  'use strict';
  // Original teaching notes aligned with the nine chapters of Pearson Edexcel IAL Pure 1.
  const check = (q, a, steps) => ({q, a, w: steps, m: 2, d: 'Core'});
  const topic = (intro, sections, example, checks) => ({
    intro,
    sections: sections.map(s => ({title:s[0], body:s[1], formula:s[2]})),
    example: {q:example[0], steps:example[1], answer:example[2]},
    checks: checks.map(c => check(c[0], c[1], c[2]))
  });
  Object.assign(window.mathsTopicContent, {
    algebra: topic(
      'Expand and factorise expressions confidently before solving equations. The distributive law works for products of two or more brackets.',
      [
        ['Expanding brackets', 'Multiply every term in one bracket by every term in the other; then collect like terms.', '(x+a)(x+b) = x² + (a+b)x + ab'],
        ['Factorising', 'Reverse expansion. First extract any common factor; for a quadratic find a product that reproduces the constant and middle term.', 'x²+7x+12 = (x+3)(x+4)'],
        ['Cubes and identities', 'Recognise the difference of two squares, and expand a product of three brackets one pair at a time.', 'a²−b²=(a−b)(a+b)']
      ],
      ['Factorise 2x²+11x+5.', ['Find two binomials with leading product 2x² and constant product 5.', 'Try (2x+1)(x+5).', 'Expand to verify: 2x²+10x+x+5.'], '(2x+1)(x+5)'],
      [['Expand (x+2)(x+5).','x²+7x+10',['x·x=x²; combine 5x+2x; constant 2×5=10.']],['Factorise x²−25.','(x−5)(x+5)',['Use a²−b²=(a−b)(a+b).']],['Expand (x+1)(x−1)(x+2).','x³+2x²−x−2',['First multiply x²−1, then distribute x+2.']]]
    ),
    functions: topic(
      'A function assigns one output to each input in its domain. Function notation expresses the rule and lets you substitute, solve and interpret graphs.',
      [
        ['Function notation', 'f(3) means replace every x in the rule by 3. Solve f(x)=k by forming an equation.', 'f(x)=2x²−3 ⇒ f(3)=15'],
        ['Domain and range', 'The domain specifies allowed inputs; the range contains the corresponding outputs. Denominators cannot be zero and real square roots require non-negative radicands.', 'f(x)=√(x−2): x≥2, f(x)≥0'],
        ['Combinations of functions', 'To calculate f(g(x)), evaluate g first and use its result as the input to f. The order usually matters.', 'f(x)=2x+1, g(x)=x² ⇒ f(g(x))=2x²+1']
      ],
      ['Given f(x)=x²−4x+1, find f(3).', ['Substitute x=3 into each term.', 'Calculate 3²−4(3)+1=9−12+1.'], '−2'],
      [['For f(x)=3x−4, find f(5).','11',['3×5−4=11.']],['State the domain of f(x)=1/(x−7).','x≠7',['The denominator must be non-zero.']],['If f(x)=x+2 and g(x)=3x, find f(g(4)).','14',['g(4)=12; f(12)=14.']]]
    ),
    simultaneous: topic(
      'Simultaneous equations ask for values satisfying every equation. Algebraic solutions also locate intersections of graphs.',
      [
        ['Two linear equations', 'Eliminate one variable by adding or subtracting suitably multiplied equations, then substitute back.', 'x+y=7, x−y=1 ⇒ x=4, y=3'],
        ['Linear and quadratic equations', 'Substitute the linear relation into the quadratic, solve, and substitute every root back. There may be zero, one or two intersections.', 'y=4−x, x²+y²=10 ⇒ x=1 or 3'],
        ['Graph interpretation', 'Each algebraic solution corresponds to an intersection. Check both coordinates against both original equations.', 'Solve f(x)=g(x) to find their intersections']
      ],
      ['Solve x+y=5 and x²+y²=13.', ['Write y=5−x.', 'Substitute: x²+(5−x)²=13, giving 2x²−10x+12=0.', 'Divide by 2, factorise (x−2)(x−3)=0, and back-substitute.'], '(x,y)=(2,3) or (3,2)'],
      [['Solve x+y=9 and x−y=1.','x=5, y=4',['Add to get 2x=10; substitute in x+y=9.']],['Solve y=x+1 and y=2x−3.','x=4, y=5',['Equate x+1=2x−3, then substitute.']],['For x+y=5, x²+y²=13, list both solutions.','(2,3) and (3,2)',['Substitute y=5−x into the quadratic.']]]
    ),
    inequalities: topic(
      'Inequalities describe sets of solutions, not just isolated values. Show open or closed boundaries carefully, and test sign intervals.',
      [
        ['Linear inequalities', 'Rearrange like an equation, but reverse the inequality sign when multiplying or dividing by a negative number.', '−2x&lt;6 ⇒ x&gt;−3'],
        ['Quadratic inequalities', 'Find the real roots, then use a sketch or sign chart to identify where the product is positive or negative.', '(x−2)(x−5)&lt;0 ⇒ 2&lt;x&lt;5'],
        ['Regions and boundaries', 'A line divides the plane into two half-planes. Use a test point to choose the correct side; a solid boundary includes equality.', 'y≥2x+1 is on/above the solid line y=2x+1'],
        ['Combined regions', 'The feasible region must satisfy every inequality simultaneously. Boundary intersections can be found by solving equations.', 'x≥0, y≥0, x+y≤5 forms a closed triangle']
      ],
      ['Solve x²−7x+10≤0.', ['Factorise as (x−2)(x−5)≤0.', 'The parabola opens upwards and crosses the x-axis at 2 and 5.', 'It is on or below the axis between the roots.'], '2≤x≤5'],
      [['Solve 3x−4&gt;8.','x&gt;4',['Add 4, then divide by 3.']],['Solve (x−1)(x−6)&lt;0.','1&lt;x&lt;6',['The factors have opposite signs between the roots.']],['Does (2,5) satisfy y≥2x+1?','Yes',['At x=2 the boundary is y=5; equality is included.']]]
    ),
    straightlines: topic(
      'A straight line is determined by a gradient and a point. Coordinate geometry also finds distances, midpoints, perpendicularity and areas.',
      [
        ['Gradient and equation', 'For A(x₁,y₁), B(x₂,y₂), the gradient is rise over run. Use point–gradient form and rearrange to y=mx+c.', 'm=(y₂−y₁)/(x₂−x₁); y−y₁=m(x−x₁)'],
        ['Parallel and perpendicular', 'Parallel nonvertical lines have equal gradients. The gradients of perpendicular nonvertical/nonhorizontal lines multiply to −1.', 'm₁=m₂ (parallel); m₁m₂=−1 (perpendicular)'],
        ['Length, midpoint and area', 'Use Pythagoras for line length, coordinate averages for midpoint and one-half base times height for triangles.', 'AB=√((x₂−x₁)²+(y₂−y₁)²); M=((x₁+x₂)/2,(y₁+y₂)/2)']
      ],
      ['Find the equation through (1,3) and (4,9).', ['Gradient = (9−3)/(4−1)=2.', 'Use y−3=2(x−1).', 'Expand and collect terms.'], 'y=2x+1'],
      [['Find the gradient from (1,2) to (4,8).','2',['Rise 6 divided by run 3.']],['Find the midpoint of (−2,4) and (6,10).','(2,7)',['Average each coordinate.']],['What gradient is perpendicular to m=4?','−1/4',['The gradients multiply to −1.']]]
    ),
    trig: topic(
      'Use sine, cosine and area rules for non-right-angled triangles. Check whether an ambiguous sine-rule result gives a second valid triangle.',
      [
        ['Cosine rule', 'Given two sides and the included angle, find the opposite side. The rearranged formula finds angles when three sides are known.', 'a²=b²+c²−2bc cos A'],
        ['Sine rule', 'Use matching side–opposite-angle pairs to find an unknown side or angle.', 'a/sin A=b/sin B=c/sin C'],
        ['Triangle area', 'Two sides and their included angle give the area directly without finding the perpendicular height.', 'Area=½ab sin C'],
        ['Solving triangles', 'All angles total 180°. After an inverse sine, check whether the supplementary angle is possible with the other given angles.', 'A+B+C=180°']
      ],
      ['Two sides are 6 cm and 8 cm with included angle 60°. Find the third side.', ['Apply a²=6²+8²−2(6)(8)cos60°.', 'Calculate 36+64−48=52.', 'Take the positive square root.'], '√52=2√13 cm'],
      [['Find the area between sides 8 and 6 at 30°.','12',['½×8×6×sin30°=12.']],['Two sides are 3 and 4 with an included right angle. Find the third.','5',['Use the cosine rule with cos90°=0.']],['If A=30°, B=90° and a=5, find b.','10',['b/1=5/(1/2), giving b=10.']]]
    ),
    triggraphs: topic(
      'Sketch sine, cosine and tangent graphs in degrees and interpret their amplitude, period, symmetries, transformations and solutions.',
      [
        ['Parent graphs', 'Sine and cosine oscillate between −1 and 1 with period 360°. Tangent has period 180° and vertical asymptotes.', 'sin(x+360°)=sin x; tan(x+180°)=tan x'],
        ['Stretches', 'An outside multiplier changes amplitude; an inside multiplier changes the period.', 'y=a sin(bx): amplitude |a|, period 360°/|b|'],
        ['Translations and solutions', 'A phase shift inside moves the graph horizontally. Use reference angles and the graph to find all solutions in the specified interval.', 'y=sin(x−30°) shifts 30° right']
      ],
      ['State amplitude and period of y=3cos(2x).', ['The outside coefficient 3 gives amplitude 3.', 'The inside factor 2 halves the 360° period.'], 'Amplitude 3; period 180°'],
      [['Find the amplitude of y=−5sin x.','5',['Amplitude is the absolute outside multiplier.']],['Find the period of sin(3x).','120°',['360°÷3=120°.']],['Solve sin x=½ for 0°≤x≤360°.','30°, 150°',['Sine is positive in quadrants I and II.']]]
    ),
    radians: topic(
      'Radians measure an angle by arc length divided by radius. Sector and segment formulae use θ in radians.',
      [
        ['Degree–radian conversion', 'A full revolution is 2π radians, so 180°=π radians. Convert before using arc or area formulae.', 'θ radians=(θ degrees)π/180'],
        ['Arc length', 'The arc length is proportional to the radius and the central angle in radians.', 's=rθ'],
        ['Sector and segment area', 'The sector area is half radius squared times angle; subtract the triangle between two radii to find the minor segment.', 'Sector=½r²θ; minor segment=½r²(θ−sinθ)']
      ],
      ['A sector has radius 6 cm and angle π/3 radians. Find its arc length and area.', ['Arc length s=6(π/3).', 'Sector area A=½(6²)(π/3).'], 'Arc length 2π cm; area 6π cm²'],
      [['Convert 90° to radians.','π/2',['Multiply by π/180.']],['For r=5 and θ=2 radians, find arc length.','10',['s=rθ=5×2.']],['For r=6 and θ=π/2, find sector area.','9π',['½×36×π/2=9π.']]]
    ),
    differentiation: topic(
      'Differentiation gives the gradient of a curve at any point. Apply the power rule separately to each term of a polynomial.',
      [
        ['Gradient of a curve', 'The derivative is the limit of the gradient of a small secant as the two points approach.', 'dy/dx = lim(h→0) [f(x+h)−f(x)]/h'],
        ['Power rule', 'Multiply by the power and reduce that power by one. A constant has derivative zero.', 'd/dx(axⁿ)=anxⁿ⁻¹'],
        ['Polynomial functions', 'Differentiate term by term and substitute the required x value to get the tangent gradient.', 'y=3x³−2x²+5 ⇒ dy/dx=9x²−4x'],
        ['Stationary points', 'Set the first derivative equal to zero; substitute the solutions into the curve to get coordinates.', 'dy/dx=0 at a stationary point']
      ],
      ['Differentiate y=4x³−3x²+7x−9.', ['Use the power rule for each x term.', '4x³ gives 12x²; −3x² gives −6x; 7x gives 7.', 'The constant −9 disappears.'], 'dy/dx=12x²−6x+7'],
      [['Differentiate x⁵.','5x⁴',['Multiply by 5 and decrease the power by 1.']],['Find dy/dx for y=2x³−4x+6.','6x²−4',['Differentiate each term.']],['Find the gradient of y=x² at x=3.','6',['dy/dx=2x; substitute 3.']]]
    ),
    tangents: topic(
      'The derivative supplies tangent gradients. A normal is perpendicular to the tangent at the same point on the curve.',
      [
        ['Tangent lines', 'Differentiate, substitute the given x-coordinate for the tangent gradient and find the curve point.', 'y−y₀=m(x−x₀), where m=f′(x₀)'],
        ['Normals', 'For a nonzero finite tangent gradient, use its negative reciprocal for the normal. A horizontal tangent has a vertical normal.', 'm(normal)=−1/m(tangent)'],
        ['Exact coordinates', 'Substitute the x-value into the original curve to obtain y before writing the equation. Check the line goes through the stated point.', 'At x=a: point (a,f(a))']
      ],
      ['Find the tangent to y=x²+1 at x=2.', ['dy/dx=2x, so m=4.', 'At x=2, y=5.', 'Use y−5=4(x−2).'], 'y=4x−3'],
      [['Find tangent gradient to y=x² at x=4.','8',['dy/dx=2x; 2×4=8.']],['Find the normal gradient when tangent gradient is 5.','−1/5',['Negative reciprocal.']],['Find tangent to y=x² at x=1.','y=2x−1',['Point (1,1), gradient 2.']]]
    ),
    secondderivative: topic(
      'Differentiating twice measures how the gradient changes. The second derivative helps classify stationary points.',
      [
        ['Second derivative', 'Differentiate the first derivative with respect to x again.', 'd²y/dx² = d/dx(dy/dx)'],
        ['Classifying stationary points', 'At a point where f′(x)=0, positive f″(x) indicates a local minimum and negative indicates a local maximum.', 'f″(a)&gt;0 ⇒ minimum; f″(a)&lt;0 ⇒ maximum'],
        ['Zero second derivative', 'If f″(a)=0, the second-derivative test is inconclusive: consider the first derivative sign or another method.', 'f″(a)=0 does not prove an inflection']
      ],
      ['Classify the stationary point of y=x²−6x+4.', ['dy/dx=2x−6=0, so x=3.', 'd²y/dx²=2&gt;0; hence minimum.', 'Substitute x=3 to get y=−5.'], 'Minimum at (3,−5)'],
      [['Find d²y/dx² for y=3x³.','18x',['First derivative 9x²; second 18x.']],['Classify y=−x² at x=0.','Maximum',['Second derivative is −2.']],['Find d²y/dx² for y=5x²+2x.','10',['Differentiate twice.']]]
    ),
    integration: topic(
      'Indefinite integration reverses differentiation. Add a constant of integration, which can be calculated using a given point.',
      [
        ['Reverse power rule', 'Increase each power by one and divide the coefficient by the new power. Integrating x⁻¹ requires later methods and is not the P1 power-rule case.', '∫xⁿ dx=xⁿ⁺¹/(n+1)+C, n≠−1'],
        ['Polynomials', 'Integrate each term separately; constants become linear terms in x.', '∫(6x²+4x−3)dx=2x³+2x²−3x+C'],
        ['Finding a function', 'If a derivative and a point f(a)=b are given, integrate and substitute to solve for C.', 'f′(x)=2x, f(1)=4 ⇒ f(x)=x²+3']
      ],
      ['Given f′(x)=6x²−4x and f(1)=5, find f(x).', ['Integrate: f(x)=2x³−2x²+C.', 'Use f(1)=2−2+C=5, so C=5.'], 'f(x)=2x³−2x²+5'],
      [['Integrate 6x².','2x³+C',['Raise the power to 3, divide 6 by 3.']],['Integrate 4x−1.','2x²−x+C',['Integrate each term and add C.']],['If f′(x)=2x and f(2)=9, find f(x).','x²+5',['Integrate x²+C; use 4+C=9.']]]
    )
  });
  window.mathsTopicContent.transformations.sections.push({
    title:'Horizontal stretches',
    body:'An input multiplier changes horizontal distances by its reciprocal. For a positive multiplier k, the graph of f(kx) is compressed horizontally by factor 1/k; f(x/k) is stretched by k.',
    formula:'y=f(2x): horizontal scale factor ½; y=f(x/3): horizontal scale factor 3'
  });
})();
