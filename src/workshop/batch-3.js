/** Batch 3: function-based investigation. All data are deliberately fictional.
 * These lessons build on, rather than repeat, Batch 2's regression methods.
 */
const term=(id,category,title,meaning,example,notation="")=>Object.freeze({id,category,title,meaning,example,notation});
export const BATCH3_DEFINITIONS=Object.freeze([
 term("vertex-form","Models","Vertex form","The completed-square form exposes the turning point of a quadratic directly.","For y = -(x-3)²+9 the maximum is 9 at x=3.","y=a(x-h)^2+k"),
 term("quadratic-roots","Models","Roots of a quadratic","Input values for which a quadratic output equals zero, when such real solutions exist.","x(10-x)=0 has zeros x=0 and x=10."),
 term("discriminant","Models","Quadratic discriminant","The quantity b²−4ac determines the number of distinct real roots of ax²+bx+c.","For x²−4x+3, the discriminant is 4.","Δ=b²−4ac"),
 term("feasible-domain","Decisions","Feasible domain","Input values permitted by all the physical or mathematical constraints of the investigation.","A length x for a 20 m perimeter rectangle must satisfy 0<x<10."),
 term("global-extremum","Calculus","Global maximum or minimum","The greatest or least value of a function over its whole feasible domain, if attained.","A stationary point alone does not prove a global maximum."),
 term("doubling-time","Models","Doubling time","Time taken for an ideal positive exponential quantity to double, if the model has a constant growth factor.","A population following 100(1.2)^t doubles after ln 2 / ln 1.2 time units.","T=ln 2/ln b"),
 term("half-life","Models","Half-life","Time required for a positive exponential decay model to halve under a constant decay factor.","A(t)=80(0.5)^(t/4) has half-life 4 time units."),
 term("logarithm","Models","Logarithm","The inverse operation of exponentiation for a specified positive base other than one.","ln(e³)=3.","ln(e^x)=x"),
 term("amplitude","Models","Amplitude","The greatest vertical deviation of a sinusoidal model from its midline; conventionally nonnegative.","y=3sin(2t)+5 has amplitude 3."),
 term("period","Models","Period","Smallest positive horizontal repeat interval of a genuinely periodic function.","sin(2πt/12) repeats every 12 time units.","T=2π/|b|"),
 term("midline","Models","Midline","The central horizontal level around which a sinusoidal model oscillates.","The midline of 4+2cos(t) is y=4."),
 term("phase-shift","Models","Phase shift","Horizontal displacement of a periodic model relative to its reference sine or cosine curve.","sin(π(t−2)/6) shifts the basic wave right by 2."),
 term("angular-frequency","Models","Angular frequency","Rate at which the phase of a sinusoid changes, in radians per unit of input.","For a 24-hour cycle, ω=2π/24 radians per hour.","ω=2π/T"),
 term("average-rate","Calculus","Average rate of change","Change in output divided by change in input over a nonzero interval.","For s(t)=t², average rate from t=1 to t=3 is (9−1)/2=4.","Δy/Δx"),
 term("instantaneous-rate","Calculus","Instantaneous rate of change","A derivative measuring the local rate of change where the function is differentiable.","If s(t)=t², its instantaneous velocity at t=3 is 6."),
 term("second-derivative","Calculus","Second derivative","Derivative of the first derivative; measures the rate of change of the gradient.","For s(t)=t², the acceleration s''(t)=2."),
 term("definite-integral","Calculus","Definite integral","A signed accumulation over a specified input interval, often interpreted as area only with care.","∫₀²(3t)dt=6.","∫_a^b f(x)dx"),
 term("antiderivative","Calculus","Antiderivative","A function whose derivative is the specified integrand, up to an additive constant.","An antiderivative of 2x is x²+C.","F'(x)=f(x)"),
 term("signed-area","Calculus","Signed area","Area above an axis contributes positively and below contributes negatively to a definite integral.","∫₋₁¹ x dx=0 despite nonzero geometric area."),
 term("initial-condition","Calculus","Initial condition","A known value used to fix a constant when recovering a quantity from its derivative.","Given v(t)=2t and s(0)=5, displacement is s(t)=t²+5.")
]);
const guide=(id,category,title,definitionIds,rest)=>Object.freeze({id,category,title,definitionIds,...rest});
export const BATCH3_LESSONS=Object.freeze([
 guide("quadratic-functions","Functions & modelling","Use a quadratic to explain a turning point",
 ["quadratic-model","vertex-form","quadratic-roots","discriminant","feasible-domain"],{
 skill:"Derive and interpret; use a graph to verify",
 when:"When a quadratic expression is justified by geometry or a measured trajectory, not merely because a curve fits.",
 avoid:"A parabola may fit a short interval without describing behaviour outside it. Check units, vertex, feasible domain and whether the model was derived or fitted.",
 formula:"y=a(x-h)²+k and h=−b/(2a), with a≠0.",
 worked:{context:"An idealised rectangle has perimeter 20 m. Its sides are x and (10−x) metres.",
 steps:[
 "From 2x+2y=20, write the second side y=10−x. The feasible nondegenerate domain is 0<x<10.",
 "Form area A=x(10−x)=10x−x² square metres; the coefficient of x² is negative.",
 "Complete the square: A=25−(x−5)², so the parabola has vertex (5,25).",
 "Check the roots at x=0 and x=10 correspond to degenerate rectangles excluded from the feasible design.",
 "As (x−5)²≥0, A≤25, with equality at x=5, which is feasible.",
 "Interpret: a 5 m by 5 m square maximises area at 25 m², assuming all 20 m of perimeter is fenced."
 ],answer:"A(x)=25−(x−5)²; maximum 25 m² at x=5 m.",
 interpretation:"The square is optimal only under the stated perimeter assumption; site restrictions or fence costs could alter the feasible model."},
 guided:{parts:[
 {question:"For f(x)=−(x−4)²+9, where is the maximum?",options:[["4","At x=4, where f=9"],["9","At x=9"],["none","There is no maximum"]],correct:"4",hint:"A squared quantity is at least zero; its negative is at most zero.",feedback:"The largest possible output is 9 when x−4=0."},
 {question:"A rectangle has 20 m perimeter. Why reject x=12 from A=x(10−x)?",options:[["domain","It violates 0<x<10 and gives a negative side"],["root","It is a valid maximum"],["units","Only because it has units"]],correct:"domain",hint:"Check the physical side length 10−x.",feedback:"The model's algebraic expression can be evaluated at 12, but the physical design cannot."}
 ]},
 independent:{question:"A rectangle of perimeter 28 m has sides x and 14−x. Complete the square for its area and find the largest feasible area.",answer:"A=14x−x²=49−(x−7)²; maximum 49 m² for a 7 m square.",reasoning:"Use 0<x<14 and the fact that a square is nonnegative. Explain why the vertex lies within this domain."},
 technology:[{name:"Desmos",command:"y=14x-x^2 {0<x<14}",why:"Restrict the curve to permitted dimensions and check the vertex visually."}],
 existingGuide:"desmos-start",relatedGuides:["model-check"],creator:"graph",
 ia:"Explain where the quadratic comes from, state the feasible domain and units, show the vertex method, and test whether the result addresses the investigation's actual aim."}),
 guide("exponential-logarithms","Functions & modelling","Interpret growth, decay and logarithms",
 ["exponential-model","doubling-time","half-life","logarithm","extrapolation"],{
 skill:"Solve the mathematical model; choose fitted parameters from real evidence",
 when:"When repeated proportional change, rather than constant additive change, is an appropriate assumption.",
 avoid:"A constant growth factor cannot be assumed from a short dataset. Logs require positive arguments. Solving an exponential is different from proving that real observations obey it.",
 formula:"y=ab^t; t=ln(y/a)/ln(b), provided a>0, b>0 and b≠1.",
 worked:{context:"A deliberately exact fictional model starts at 80 units and grows by 25% each time unit: N(t)=80(1.25)^t.",
 steps:[
 "Identify a=80 as the initial amount and b=1.25 as the per-period multiplication factor.",
 "Verify N(0)=80 and N(2)=80×1.25²=125 units.",
 "To find when N reaches 160, solve 80(1.25)^t=160, giving (1.25)^t=2.",
 "Take natural logs: t ln(1.25)=ln 2, so t=ln 2/ln 1.25≈3.106 time units.",
 "The same expression is the model's doubling time, independent of when the doubling begins.",
 "Check what the model assumes: the factor stays 1.25, the units are consistent, and long-range forecasts are not guaranteed."
 ],answer:"The model reaches 160 units after approximately 3.106 time units.",
 interpretation:"The exact model demonstrates log algebra. Real growth data require fitting, residual checks, and justification before extrapolating."},
 guided:{parts:[
 {question:"A model increases by 8% per period. What is its multiplication factor?",options:[["1.08","1.08"],["0.08","0.08"],["8","8"]],correct:"1.08",hint:"Add 8% of the previous amount to 100% of that amount.",feedback:"100%+8%=108%, giving 1.08."},
 {question:"For M(t)=50(0.8)^t, is this growth or decay?",options:[["decay","Decay: 0<0.8<1"],["growth","Growth: 0.8 is positive"],["linear","Linear change"]],correct:"decay",hint:"Compare the factor to one, not to zero.",feedback:"Each period keeps 80% of the amount, a 20% reduction."}
 ]},
 independent:{question:"For P(t)=200(1.1)^t, find P(2) and the model doubling time.",answer:"P(2)=242; doubling time ln 2/ln 1.1≈7.273 time units.",reasoning:"Multiply by 1.1 twice; for doubling set (1.1)^t=2 and take logarithms."},
 technology:[{name:"Desmos",command:"y=80(1.25)^x",why:"Explore curve shape and when a threshold is reached, checking the input domain."},{name:"Google Sheets",command:"=LN(2)/LN(1.25)",why:"Compute doubling time after deriving the logarithmic equation."}],
 existingGuide:"desmos-regression",relatedGuides:["model-check"],creator:"graph",
 ia:"Explain initial value, growth factor, time units and data origin. Distinguish calculating from a given model from fitting and validating that model; discuss extrapolation and alternative models."}),
 guide("sinusoidal-functions","Functions & modelling","Model a periodic pattern with sine and cosine",
 ["amplitude","period","midline","phase-shift","angular-frequency","domain"],{
 skill:"Identify meaningful parameters before relying on a fitted curve",
 when:"When repeated cycles have a credible underlying reason and enough observations cover more than part of one cycle.",
 avoid:"A smooth wave through a few points does not establish periodicity. Check whether the period is imposed by context or supported by repeated cycles, and do not extrapolate indefinitely.",
 formula:"y=d+A sin(2π(t−c)/T), with A≥0 and T>0.",
 worked:{context:"An idealised fictional cycle ranges from 2 to 8 units, repeats every 12 hours and crosses its midline upwards at t=0.",
 steps:[
 "Midline is d=(8+2)/2=5 units; amplitude is A=(8−2)/2=3 units.",
 "Given a 12-hour period, angular frequency is 2π/12=π/6 radians per hour.",
 "An upward midline crossing at t=0 matches sine with zero phase shift.",
 "Construct y=5+3sin(πt/6). At t=0 it is 5; at t=3 it reaches 8.",
 "At t=6 it is back to 5; at t=9 it reaches 2; at t=12 it completes a cycle.",
 "Only use this beyond the sample interval if stable repetition and the chosen physical mechanism remain credible."
 ],answer:"y(t)=5+3sin(πt/6), with 12-hour period, amplitude 3 and midline 5.",
 interpretation:"The model illustrates phase and units, not evidence of a real-world cycle or indefinitely stable periodic behaviour."},
 guided:{parts:[
 {question:"A cycle has maximum 14 and minimum 6. What are amplitude and midline?",options:[["right","Amplitude 4, midline 10"],["other","Amplitude 8, midline 4"],["wrong","Amplitude 10, midline 4"]],correct:"right",hint:"Amplitude is half the range; the midline is the average of the extremes.",feedback:"(14−6)/2=4 and (14+6)/2=10."},
 {question:"In y=2sin(πt/4)+5, what is the period?",options:[["8","8 input units"],["4","4 input units"],["2","2 input units"]],correct:"8",hint:"Set (π/4)T=2π.",feedback:"T=2π/(π/4)=8."}
 ]},
 independent:{question:"A fictional 24-hour cycle varies from 10 to 18 and crosses its midline upwards at t=0. Write a suitable sine model and find its maximum.",answer:"y=14+4sin(πt/12), maximum 18 at t=6 hours, recurring every 24 hours.",reasoning:"Midline 14, amplitude 4, angular frequency 2π/24=π/12; sin reaches 1 at π/2."},
 technology:[{name:"Desmos",command:"y=5+3sin(pi*x/6)",why:"Check amplitude, maximum and cycle length against a contextually labelled time axis."}],
 existingGuide:"desmos-start",relatedGuides:["desmos-regression"],creator:"graph",
 ia:"State the reason a periodic model is plausible, how its parameters were estimated, time units and phase origin. Show cycles and residuals, and warn against unsupported long-range predictions."}),
 guide("derivatives-motion","Calculus & interpretation","Interpret derivatives as rates of change",
 ["average-rate","instantaneous-rate","derivative","second-derivative","feasible-domain"],{
 skill:"Differentiate analytically; use plotted slopes to check",
 when:"When a justified model describes position, accumulated cost or another output whose local rate has meaning.",
 avoid:"Gradient depends on axis units and input domain. The derivative of a fitted model may not equal an actually measured instantaneous quantity, especially outside observed times.",
 formula:"Average rate=(s(b)−s(a))/(b−a); instantaneous rate v(t)=s'(t); a(t)=s''(t).",
 worked:{context:"A fictional particle's position is s(t)=2t²+3t+1 metres for 0≤t≤4 seconds.",
 steps:[
 "Specify s as position in metres and t as time in seconds. Negative time is outside the stated model.",
 "Compute s(1)=6 and s(3)=28. Average velocity from 1 to 3 seconds is (28−6)/2=11 m/s.",
 "Differentiate position: v(t)=s'(t)=4t+3 metres per second.",
 "At t=2, instantaneous velocity is v(2)=11 m/s, matching this quadratic model's average over the symmetric interval.",
 "Differentiate again: a(t)=v'(t)=4 metres per second squared.",
 "Compare the mathematical prediction with physical assumptions; an ideal quadratic does not guarantee real motion has constant acceleration."
 ],answer:"Average velocity on [1,3] is 11 m/s; v(2)=11 m/s and a(t)=4 m/s².",
 interpretation:"The derivative connects a model's change to rates with units. Distinguish predicted rates from measurements."},
 guided:{parts:[
 {question:"For s(t)=t²+2t, what is the velocity function?",options:[["right","v(t)=2t+2"],["wrong","v(t)=t+2"],["second","v(t)=2"]],correct:"right",hint:"Differentiate each power of t.",feedback:"d(t²)/dt=2t and d(2t)/dt=2."},
 {question:"If s is measured in metres and t in seconds, what units does s'' have?",options:[["acc","m/s²"],["vel","m/s"],["pos","m"]],correct:"acc",hint:"Each derivative introduces division by one factor of seconds.",feedback:"Acceleration has position units divided by time squared."}
 ]},
 independent:{question:"For s(t)=3t²−2t+4 metres on 0≤t≤5 seconds, find average velocity from t=1 to 3, v(2), and acceleration.",answer:"s(1)=5, s(3)=25, average velocity=10 m/s; v(t)=6t−2 so v(2)=10 m/s; a(t)=6 m/s².",reasoning:"Calculate the average using the two positions, then differentiate the stated model twice."},
 technology:[{name:"Desmos",command:"s(x)=2x^2+3x+1; s'(2)",why:"Check a derivative at a specific input; keep units and the valid time domain in your write-up."}],
 existingGuide:"derivatives",relatedGuides:["desmos-start"],creator:"graph",
 ia:"Explain what the model output and derivative mean, present units, interpret gradients at relevant points and discuss what the model cannot establish from the actual measurements."}),
 guide("integrals-accumulation","Calculus & interpretation","Use integration for accumulated change and area",
 ["definite-integral","antiderivative","signed-area","initial-condition","domain"],{
 skill:"Show the integral and interpret signs, limits and units",
 when:"When a modelled rate accumulates over a meaningful input interval, or signed area is relevant.",
 avoid:"An integral gives signed accumulation, not always total geometric area or distance. Check model validity within the interval, constants and units; do not integrate through unsupported extrapolation.",
 formula:"Accumulated change=∫ₐᵇ r(t)dt=F(b)−F(a) when F'=r.",
 worked:{context:"A fictional tank fills at the time-dependent rate r(t)=2t+3 litres/minute for 0≤t≤4 minutes.",
 steps:[
 "Identify r(t) as a rate in litres per minute, so the integral over minutes has units of litres.",
 "Write the change in volume as ∫₀⁴(2t+3)dt.",
 "Find an antiderivative: F(t)=t²+3t.",
 "Evaluate at the bounds: F(4)−F(0)=(16+12)−0=28 litres.",
 "With initial volume 5 litres, the final volume is 5+28=33 litres.",
 "Explain why no absolute value is needed here: the rate is positive throughout 0≤t≤4. A negative rate would decrease volume."
 ],answer:"Accumulated inflow 28 litres; final volume 33 litres from a 5-litre initial amount.",
 interpretation:"The integral accumulates a modelled rate; its reliability depends on whether that rate describes the actual process."},
 guided:{parts:[
 {question:"A constant flow rate is 4 litres/minute for 3 minutes. What total volume enters?",options:[["12","12 litres"],["7","7 litres"],["4","4 litres"]],correct:"12",hint:"The area under a positive constant rate graph is height times width.",feedback:"4×3=12 litres."},
 {question:"If a velocity graph drops below the time axis, what does its definite integral give?",options:[["signed","Signed displacement"],["distance","Always total distance"],["none","No meaningful value"]],correct:"signed",hint:"Negative values contribute negatively to the integral.",feedback:"Integrating velocity gives signed displacement; total distance may need intervals split at changes of sign."}
 ]},
 independent:{question:"A fictional inflow rate is r(t)=3t+2 litres/minute on 0≤t≤2. Find accumulated inflow and final volume if the initial tank contains 10 litres.",answer:"∫₀²(3t+2)dt=[1.5t²+2t]₀²=6+4=10 litres; final volume 20 litres.",reasoning:"Use an antiderivative and evaluate at both limits before adding the initial quantity."},
 technology:[{name:"Desmos",command:"int_0^4 (2x+3) dx",why:"Use a definite-integral input to verify arithmetic after setting correct rate, limits and units."}],
 existingGuide:"integrals",relatedGuides:["reporting-precision"],creator:"graph",
 ia:"Introduce the quantity being accumulated, specify interval and units, interpret signed versus absolute accumulation and examine assumptions of the rate model."})
]);
