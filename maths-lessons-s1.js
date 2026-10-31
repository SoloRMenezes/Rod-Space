window.mathsDetailedNotes=window.mathsDetailedNotes||{};
window.mathsDetailedNotes.s1={
  "1.1": {
    "summary": "A statistical model represents a real situation with assumptions that simplify the real world. It may be deterministic (fixed output) or stochastic (random variation). Assess whether its predictions are reliable and the assumptions reasonable.",
    "rule": "Model → predict → compare with observations → refine",
    "example": "A model may assume daily train delays are independent. Compare predicted and observed delay rates to check whether this simplification is reasonable."
  },
  "1.2": {
    "summary": "Define the problem, choose variables and data, state assumptions, build a model and make predictions. Test predictions against real observations, then revise the model if needed. A model is useful only within the circumstances it adequately represents.",
    "rule": "Data → assumptions → mathematical rule → predictions → validation",
    "example": "To predict demand from temperature, plot actual daily sales against temperature, fit a relationship, then test it on data not used to fit it."
  },
  "2.1": {
    "summary": "Categorical data are labels, while numerical data describe amounts. Numerical data may be discrete (counts) or continuous (measurements). Raw data are individual observations; grouped data are binned into intervals, often losing precision.",
    "rule": "Discrete: counts; continuous: measurements",
    "example": "Number of siblings is discrete; height in centimetres is continuous; eye colour is categorical."
  },
  "2.2": {
    "summary": "Mean uses every value but is sensitive to extreme observations. Median is the middle value when ordered and is robust to outliers; mode is the most common value. Choose a measure appropriate to the distribution and context.",
    "rule": "Mean x̄ = Σx/n",
    "example": "For 2,3,4,5,16, mean = 30/5=6 but median = 4. The median better reflects the typical value."
  },
  "2.3": {
    "summary": "Quartiles and percentiles describe positions within ordered data. Q₁ is about the 25th percentile, Q₂ the median, and Q₃ about the 75th percentile. Different conventions exist for quartile interpolation; use the specified examination method.",
    "rule": "Interquartile range IQR = Q₃−Q₁",
    "example": "If Q₁=12, median=18 and Q₃=25, then IQR=25−12=13."
  },
  "2.4": {
    "summary": "Range measures the largest minus the smallest value, while interquartile range measures spread of the middle half of data. Larger spread means greater variation. Compare spread alongside centre, especially when comparing populations.",
    "rule": "Range = maximum−minimum; IQR=Q₃−Q₁",
    "example": "Data A range 2 to 12 has range 10; data B range 5 to 9 has range 4, so A has greater overall spread."
  },
  "2.5": {
    "summary": "Variance averages squared deviations from the mean, while standard deviation is its square root and uses the original units. For a full population use n in the denominator; sample estimates may use n−1 depending on the question. The standard deviation is never negative.",
    "rule": "Population variance = Σ(x−μ)²/n; σ=√variance",
    "example": "For 1,2,3, mean=2, variance=(1+0+1)/3=2/3 and σ=√(2/3)≈0.816."
  },
  "2.6": {
    "summary": "Coding transforms data to make calculations easier. If y=(x−a)/b then means transform in the same way, while standard deviation scales by 1/|b|; shifts do not change spread. Undo the coding after calculation when reporting original units.",
    "rule": "y=(x−a)/b ⇒ x̄=a+bȳ, σx=|b|σy",
    "example": "If y=(x−10)/2 has mean 4 and standard deviation 3, original x has mean 10+2×4=18 and standard deviation 6."
  },
  "3.1": {
    "summary": "Histograms represent numerical frequency over class intervals. The area of each bar is proportional to frequency, so unequal class widths require frequency density for bar height. Do not use raw frequency as bar height when widths vary.",
    "rule": "Frequency density = frequency/class width",
    "example": "A class 10–20 with frequency 30 has width 10 and density 3; class 20–25 with frequency 25 has density 5."
  },
  "3.2": {
    "summary": "An outlier is an observation unusually far from the rest and should be investigated rather than automatically discarded. A common box-plot rule labels values below Q₁−1.5IQR or above Q₃+1.5IQR as outliers. Context may justify a different threshold.",
    "rule": "Lower fence Q₁−1.5IQR; upper fence Q₃+1.5IQR",
    "example": "If Q₁=10 and Q₃=18, IQR=8 and upper fence=30. A value of 34 is an outlier under this rule."
  },
  "3.3": {
    "summary": "A box plot shows the median, lower/upper quartiles, and whiskers representing the designated non-outlying extremes (or min/max depending on convention). It allows quick comparison of centre, spread and skew. Check the plotting convention used.",
    "rule": "Five-number summary: min,Q₁,median,Q₃,max",
    "example": "For summary 2,4,7,11,15, draw a box from 4 to 11, median line at 7, whiskers to 2 and 15."
  },
  "3.4": {
    "summary": "A stem-and-leaf diagram preserves individual data values while sorting them visually. Split each number into stem and leaf, use a key, and order leaves. Two-sided diagrams can compare groups.",
    "rule": "Key: stem 2, leaf 7 means 27 when stems are tens",
    "example": "For 12,14,17,21,23 write stem 1 with leaves 2,4,7 and stem 2 with leaves 1,3."
  },
  "3.5": {
    "summary": "Skewness describes asymmetry of a distribution. Positive skew has a longer right tail, often mean greater than median; negative skew has a longer left tail. A roughly symmetric distribution has similar mean and median.",
    "rule": "Positive skew: long right tail; negative skew: long left tail",
    "example": "Salaries 20,22,24,25,150 have a long right tail; the mean is pulled upward above the median."
  },
  "3.6": {
    "summary": "When comparing distributions, discuss both location (such as median) and spread (such as IQR). Consider outliers, skew and sample sizes. Say what the statistics mean in context instead of only reporting which number is larger.",
    "rule": "Compare centre + spread + shape",
    "example": "Group A median 70, IQR 8; group B median 74, IQR 20: B is typically higher but much less consistent."
  },
  "4.1": {
    "summary": "Probability measures how likely an event is, on a scale from 0 to 1. The sample space lists all possible outcomes, and an event is a subset. For equally likely outcomes, probability is favourable outcomes divided by total.",
    "rule": "P(A)=favourable/total for equally likely outcomes",
    "example": "On a fair die, P(even)=3/6=1/2 because outcomes 2,4,6 are favourable."
  },
  "4.2": {
    "summary": "Venn diagrams show overlapping events inside a universal set. Place the intersection first, then exclusive portions, then the outside region. Inclusion-exclusion avoids counting the overlap twice.",
    "rule": "P(A∪B)=P(A)+P(B)−P(A∩B)",
    "example": "If P(A)=0.6, P(B)=0.5 and P(both)=0.2, then P(A or B)=0.6+0.5−0.2=0.9."
  },
  "4.3": {
    "summary": "Mutually exclusive events cannot both occur, so their intersection has probability zero. Independent events can occur together and satisfy a product rule. Except in special zero-probability cases, mutually exclusive nonempty events are not independent.",
    "rule": "Exclusive: P(A∩B)=0; independent: P(A∩B)=P(A)P(B)",
    "example": "On one die, “even” and “odd” are exclusive. On two independent dice, “first die even” and “second die even” are independent."
  },
  "4.4": {
    "summary": "Set notation describes events algebraically. A∩B means both, A∪B means either or both, A′ means not A, and A\\B means A but not B. De Morgan's laws are useful for complements of combinations.",
    "rule": "(A∪B)′=A′∩B′; P(A′)=1−P(A)",
    "example": "If P(A)=0.35, then P(A′)=0.65."
  },
  "4.5": {
    "summary": "Conditional probability updates the sample space when an event is known to have happened. Divide the probability of both events by the probability of the condition. This is different from ordinary P(A) when events are dependent.",
    "rule": "P(A|B)=P(A∩B)/P(B), P(B)>0",
    "example": "Of 40 students, 12 play tennis and 8 of those play football. Given tennis, P(football)=8/12=2/3."
  },
  "4.6": {
    "summary": "To find conditional probabilities from a Venn diagram, restrict attention to the circle representing the condition. The denominator is the total in that circle, and the numerator is the intersection with the desired event.",
    "rule": "P(B|A)=P(A∩B)/P(A)",
    "example": "If A has 18 people and A∩B has 6, then P(B given A)=6/18=1/3."
  },
  "4.7": {
    "summary": "The addition rule combines event probabilities, subtracting overlap. The multiplication rule expresses intersections using conditional probabilities. Use the simplified multiplication rule only when independence is justified.",
    "rule": "P(A∩B)=P(A)P(B|A); P(A∪B)=P(A)+P(B)−P(A∩B)",
    "example": "If P(A)=0.4 and P(B|A)=0.25, then P(A∩B)=0.1."
  },
  "4.8": {
    "summary": "A tree diagram branches by successive outcomes and shows conditional probabilities on each branch. Multiply along a path to find the probability of that sequence and add disjoint paths to combine cases. Probabilities leaving a node sum to 1.",
    "rule": "P(path)=product of branch probabilities",
    "example": "A bag with 2 red and 1 blue has P(red then blue, without replacement)=2/3×1/2=1/3."
  },
  "5.1": {
    "summary": "A scatter diagram displays paired numerical observations to investigate association. Look for upward/downward trend, strength, curvature, clusters and outliers. Correlation alone does not establish cause and effect.",
    "rule": "Positive trend: both variables rise; negative trend: one falls as other rises",
    "example": "If points cluster around y=2x+1, there is a strong positive linear association."
  },
  "5.2": {
    "summary": "A regression line predicts one variable from another using observed data. The line of y on x minimises squared vertical residuals. Use it for interpolation only when the linear model is reasonable and avoid unjustified extrapolation.",
    "rule": "Predicted y = a + bx",
    "example": "For fitted model y=5+2x, predict y=17 when x=6; the value is an estimate, not an exact outcome."
  },
  "5.3": {
    "summary": "Least-squares regression derives the line y=a+bx from sample means and corrected sums. Compute b=Sxy/Sxx and a=ȳ−bx̄, then interpret the slope. Rounding intermediate values too early can distort results.",
    "rule": "Sxx=Σx²−(Σx)²/n; Sxy=Σxy−ΣxΣy/n; b=Sxy/Sxx",
    "example": "For points (1,3),(2,5),(3,7), slope b=2 and intercept a=1, giving line y=1+2x."
  },
  "5.4": {
    "summary": "The product-moment correlation coefficient r measures direction and strength of linear association from −1 to 1. Values near ±1 show strong linear association; values near zero suggest weak linear association, not necessarily no relationship. Beware outliers.",
    "rule": "r=Sxy/√(Sxx Syy)",
    "example": "For three points exactly on y=2x+1, r=1. If the points lie exactly on a downward sloping line, r=−1."
  },
  "6.1": {
    "summary": "A discrete random variable X takes countable values with assigned probabilities. Its probability distribution lists p(x) for each value. All probabilities must be between 0 and 1 and sum to one.",
    "rule": "Σp(x)=1; 0≤p(x)≤1",
    "example": "If X∈{0,1,2} with probabilities 1/4,1/2,1/4, they sum to 1 and form a valid distribution."
  },
  "6.2": {
    "summary": "The cumulative distribution function F(x) gives the probability that X is at most x. For discrete X it is a step function, jumping at each possible value. Add the probabilities for outcomes ≤ the threshold.",
    "rule": "F(x)=P(X≤x)",
    "example": "If P(X=0)=0.2, P(X=1)=0.5 and P(X=2)=0.3, then F(1)=0.7."
  },
  "6.3": {
    "summary": "Expected value is the probability-weighted average, representing a long-run mean over many repetitions. Multiply each possible value by its probability and add. The expected value need not be a possible outcome.",
    "rule": "E(X)=Σxp(x)",
    "example": "For X∈{0,1,2} with probabilities 1/4,1/2,1/4: E(X)=0+1/2+2/4=1."
  },
  "6.4": {
    "summary": "Variance measures spread around the expected value. A convenient computation finds E(X²) and subtracts [E(X)]². The standard deviation is the square root of variance, in original units.",
    "rule": "Var(X)=E(X²)−[E(X)]²",
    "example": "For X values 0,2 each with probability 1/2, E(X)=1 and E(X²)=2, so Var(X)=2−1=1."
  },
  "6.5": {
    "summary": "A linear transformation Y=aX+b changes the expected value by scaling and shifting, but shifting does not affect variance. Scaling by a multiplies variance by a². These laws avoid recomputing a new probability table.",
    "rule": "E(aX+b)=aE(X)+b; Var(aX+b)=a²Var(X)",
    "example": "If E(X)=4 and Var(X)=9, for Y=2X+5: E(Y)=13 and Var(Y)=36."
  },
  "6.6": {
    "summary": "Use the probability table to translate words such as “at least”, “more than” and “between” into sums of outcomes. The complement rule can simplify long sums. Check endpoints carefully for integer-valued X.",
    "rule": "P(X≥k)=1−P(X≤k−1) for integer X",
    "example": "If P(X=0)=0.1, P(X=1)=0.3 and P(X=2)=0.6, then P(X≥1)=1−0.1=0.9."
  },
  "6.7": {
    "summary": "A discrete uniform distribution assigns equal probability to each of n possible outcomes. Its expected value is the arithmetic mean of outcomes; for consecutive integers 1 to n, variance has a standard formula. Check equally likely assumptions.",
    "rule": "X uniform on {1,…,n}: E(X)=(n+1)/2; Var(X)=(n²−1)/12",
    "example": "For a fair die, E(X)=(6+1)/2=3.5 and Var(X)=(36−1)/12=35/12."
  },
  "7.1": {
    "summary": "A normal distribution is a symmetric bell-shaped continuous distribution described by mean μ and standard deviation σ. About 68% lies within one standard deviation and about 95% within two. Probabilities correspond to areas under the curve.",
    "rule": "X∼N(μ,σ²); total area under curve=1",
    "example": "For X∼N(50,10²), the distribution is centred at 50; P(X<50)=0.5."
  },
  "7.2": {
    "summary": "Standardise a normal random variable to Z before using standard normal tables. Convert the desired x-value to z and read Φ(z)=P(Z≤z); use symmetry for negative z. Tables may report slightly different rounded values.",
    "rule": "Z=(X−μ)/σ; Φ(−z)=1−Φ(z)",
    "example": "For X∼N(100,15²), P(X<115)=P(Z<1)=0.8413."
  },
  "7.3": {
    "summary": "To find a value from a probability, look up the corresponding standard-normal z-score (inverse normal). Convert it back with x=μ+zσ. For upper-tail probabilities, first change them to left-tail probabilities.",
    "rule": "P(X≤x)=p ⇒ x=μ+σΦ⁻¹(p)",
    "example": "The 97.5th percentile of N(50,10²) uses z≈1.96, so x≈50+1.96×10=69.6."
  },
  "7.4": {
    "summary": "The standard normal distribution Z has mean 0 and variance 1. Its symmetry means P(Z>z)=P(Z<−z), and probabilities between two z-values are differences of cumulative values. Always sketch the area being asked for.",
    "rule": "Z∼N(0,1); P(a<Z<b)=Φ(b)−Φ(a)",
    "example": "P(−1<Z<1)=Φ(1)−Φ(−1)=0.8413−0.1587=0.6826."
  },
  "7.5": {
    "summary": "When probabilities are given but μ and σ are unknown, turn each probability into a z-score and form linear equations x=μ+zσ. Solve the pair simultaneously. Ensure that σ is positive.",
    "rule": "x=μ+zσ",
    "example": "If P(X<10)=0.1587 and P(X<30)=0.8413, corresponding z=−1,1, so 10=μ−σ and 30=μ+σ; μ=20, σ=10."
  }
};
