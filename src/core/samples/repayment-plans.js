import {R,f,graph,table,finishDecisionSpec} from './decision-sample-tools.js';
/** Exact integer-cent ledger, with positive monthly interest rounded half-up. */
export function repaymentLedger(numerator,denominator,{principal=1200000,payment=30000,fee=0}={}){
 if(!Number.isSafeInteger(principal)||!Number.isSafeInteger(payment)||principal<=0||payment<=0||numerator<0||denominator<=0)throw new Error('Invalid repayment inputs.');
 let balance=principal;const rows=[];
 for(let month=1;balance>0&&month<=1200;month++){
  const opening=balance,interest=Math.floor((opening*numerator+denominator/2)/denominator);
  if(payment<=interest)throw new Error('Payment must reduce the balance.');
  const paid=Math.min(payment,opening+interest);balance=opening+interest-paid;
  rows.push({month,opening,interest,paid,balance});
 }
 if(balance!==0)throw new Error('Repayment exceeded the supported horizon.');
 return {numerator,denominator,fee,rows,months:rows.length,interest:rows.reduce((s,r)=>s+r.interest,0),payments:rows.reduce((s,r)=>s+r.paid,0),total:fee+rows.reduce((s,r)=>s+r.paid,0)};
}
export const LOAN_A=repaymentLedger(6,1000);
export const LOAN_B=repaymentLedger(9,2000,{fee:40000});
export const repaymentSettlement=(ledger,n)=>ledger.fee+ledger.rows.slice(0,n).reduce((s,r)=>s+r.paid,0)+(n>=ledger.months?0:ledger.rows[n-1].balance);
const dollars=c=>(c/100).toFixed(2);
const provenance='Repayment Offers v1: two wholly fictional contracts borrowing BND 12,000 at time zero. Both require BND 300 at each month end until a capped smaller final payment. A charges nominal annual interest 7.2%, compounded monthly (0.6% per month), with no fee. B charges nominal annual interest 5.4%, compounded monthly (0.45% per month), plus a BND 400 setup fee paid separately at time zero, not added to the loan. Monthly interest is rounded to cents, half-up, before the payment. The separate upfront budget is BND 400. For the early-settlement scenario only, the remaining balance may be repaid immediately after a scheduled month-end payment with no additional fee or interest. These are mathematical definitions, not current lender offers or personal financial advice.';
const definitions=R`\(P=12000\) is the principal in BND; \(M=300\) is the scheduled monthly payment; \(i\) is the monthly interest rate as a decimal; \(B_n\) is the balance immediately after payment n, with \(B_0=P\). \(F\) is an upfront fee paid separately. \(C_A(n)\) and \(C_B(n)\) are total nominal cash outlays if the relevant remaining balance is settled immediately after month n's scheduled payment.`;
const unroundedBalance=(i,n)=>12000*(1+i)**n-300*((1+i)**n-1)/i;
const feeThreshold=(LOAN_A.payments-LOAN_B.payments)/100;
const openingRows=[...LOAN_A.rows.slice(0,2).map(r=>['A',r.month,dollars(r.interest),dollars(r.paid),dollars(r.balance)]),...LOAN_B.rows.slice(0,2).map(r=>['B',r.month,dollars(r.interest),dollars(r.paid),dollars(r.balance)])];
export const REPAYMENT_PLANS_SPEC=finishDecisionSpec({
 id:'repayment-plans',routeId:'finance',title:'When does a lower loan rate actually cost less?',course:'AI SL',sourceType:'theoretical',mathSelected:['AI01','AI03'],
 description:'Derive repayment balances, cap the final payment, account for monthly rounding and an upfront fee, then find when early settlement reverses the cheaper offer.',
 readingNote:'A complete fictional mathematical comparison. Rates, fees, budget and settlement rules are defined offers, not claims about any lender or advice to borrow.',provenance,definitions,technologyStage:1,
 planning:{
  idea:'I will compare a higher-rate no-fee offer with a lower-rate offer that charges a setup fee, using the same borrowed amount and monthly payment.',
  aim:'Which of two defined BND 12,000 repayment offers costs less while keeping every scheduled monthly payment at or below BND 300, and when could the setup fee or early settlement reverse that choice?',
  motivation:'A lower advertised rate sounds preferable, but I want to know how long its interest savings take to outweigh a fixed fee. I also want to distinguish the final payment from a full extra instalment.',
  beneficiaryType:'me',beneficiary:'I would use the calculation to understand the trade-off between a rate and a fee in this hypothetical comparison, not to choose an actual financial product.',
  intendedUse:'Compare total nominal payments under the stated offers and explain a horizon-dependent recommendation.',
  theoreticalAim:'Analyse two month-end repayment schedules at monthly rates 0.006 and 0.0045, with a BND 400 upfront fee on the latter and a common BND 300 monthly cap.',
  theoreticalCase:'I will define payment timing, monthly cent rounding and a separately paid fee before calculating either schedule. I will compare full repayment and later an explicitly fee-free settlement option.',
  prediction:'I expect B to cost less if both schedules run to completion, but A may be cheaper if settlement occurs early because B pays its fee immediately.',
  predictionWhy:'A setup fee is fixed while interest savings build over the remaining positive balance each month.',
  predictionImplication:'The lower rate may require a sufficiently long horizon to compensate for the fee.',
  firstAction:'Write the balance recurrence and verify the first two monthly payments by hand for both offers.',
  firstAccuracy:'Record money in integer cents and apply the stipulated half-up rounding before every payment; cap the last payment at the actual amount due.',
  permissionDetails:'The rates and terms are invented mathematical inputs; no lender quotations or account details are used.',
  teacherQuestion:'Are the geometric-sum calculation, exact cent ledger and early-settlement comparison consistent about timing and fees?',
  teacherSafeAction:'I can define both contracts and test their opening balances without claiming any financial recommendation.',
  milestoneAdjustment:'My six-week sequence is contract definitions, recurrence and verification, payoff calculation, fee and settlement sensitivity, then writing and review.'
 },
 introduction:R`A smaller interest rate does not automatically mean a smaller total bill if the offer also includes a fixed fee. I wanted to quantify that trade-off rather than compare two percentages in isolation. My specific interest is how the preferred offer changes when the borrower repays sooner than expected.

I defined two fictional offers for \(\mathrm{BND}\ 12000\), both paid at up to \(\mathrm{BND}\ 300\) at each month end. Offer A has a monthly rate of 0.6% and no setup fee. Offer B has a monthly rate of 0.45% and a separately paid \(\mathrm{BND}\ 400\) setup fee. My aim is to compare their full nominal costs, then find how the fee and a stated early-settlement horizon affect the preference.

I expect B's lower rate to help over a long period but not necessarily over a short one. I am comparing these particular defined schedules, not advising anyone to borrow or claiming that these are available lender terms.`,
 dataNotes:R`Repayment Offers v1 [D1] fixes a principal \(P=12000\), scheduled month-end payment \(M=300\), and a separate upfront budget of BND 400. A's nominal annual rate 7.2%, compounded monthly, means \(i_A=0.072/12=0.006\); B's nominal annual rate 5.4% means \(i_B=0.0045\). These nominal annual percentages are not effective annual rates. I use monthly rates consistently in the recurrence.

The setup fee on B is paid at time zero and is not financed. It therefore adds to total cost but not to the opening loan balance. Both schedules stop with a final payment no greater than the amount due, instead of paying 300 into a negative balance. Monthly interest is rounded to the nearest cent, with positive half-cents rounded upwards, before the scheduled payment.

My objective is the sum of nominal cash outlays, without discounting, inflation, tax effects or alternative uses of the fee money. For a later horizon comparison, I stipulate that settlement occurs immediately after the scheduled month-end payment and incurs no extra fee or interest. That is a rule of these fictional contracts, not a statement about actual loan law or practice.`,
 source:{actualSource:provenance,actualMethod:'I defined the offers and computed their schedules from a month-end balance recurrence. I kept the fee outside the balance and used integer cents for the contractual ledger.',
  modelEvidence:'Two specified contracts and reproducible arithmetic, not personal account records or published lender quotes.',modelInputs:'P=12000 BND, M=300 BND, monthly rates 0.006 and 0.0045, upfront fees 0 and 400 BND, monthly half-up cent rounding and a capped final payment.',
  modelAssumptions:'Rates remain constant; payments occur at month end; there are no missed payments, extra charges or taxes. The setup fee is paid separately. Early settlement is allowed only under the stated no-extra-charge scenario.',
  modelDomain:'Integer months until the balance reaches zero: 46 months for A and 45 for B under the exact cent ledger. The fee sensitivity keeps the balance and payment terms unchanged.',
  modelValidation:'I verify the first two payments by hand, compare the rounded ledger with the geometric-sum benchmark, and check that total principal repaid is exactly 12000 BND.',
  modelAlternative:'Comparing only the rates would omit the fee. A discounted-cash-flow objective or a different use of the upfront 400 BND would be a separate comparison.',
  modelSensitivity:'I calculate a break-even setup fee for full repayment and the first integer settlement month at which the lower-rate offer recovers its fee.',
  chosenMethod:'Compound balance recurrence, geometric sum, logarithmic payoff estimate, exact cent rounding and settlement-cost comparison.',
  methodReason:'A recurrence records when interest is charged and when the payment reduces the balance, so it prevents the annual-rate and payment-timing shortcuts that could distort the comparison.',
  methodLimitation:'The unrounded geometric formula is a benchmark, not an exact substitute for a contract that rounds every month.',
  limitationConsequence:'Rounding only once at the end can change the last cent; ignoring an upfront fee can also reverse the cost ranking by hundreds of dollars.',
  limitationMitigation:'I derive the formula to explain the structure, then use the stipulated cent ledger for every final cost and settlement threshold.',
  limitationAcceptable:'The calculation answers the nominal-cost question for these fixed hypothetical terms, not the best real use of cash or the suitability of borrowing.'},
 completion:{
  permissionNotes:'No financial accounts, personal borrowing details or current product claims are involved.',changedSincePlanning:'B was cheaper at full repayment, but its small net saving disappeared for settlement before month 29. The horizon mattered more than the headline rate alone.',
  dataStatusSummary:'Both complete ledgers retain every monthly opening balance, interest amount, payment and closing balance. No fee is hidden in the principal.',
  dataAimLink:R`My budget concerns the actual instalments and my decision concerns total cash paid. I therefore need a recurrence that charges interest first and caps the final payment, with F counted separately.`,
  firstMethodEvaluation:'The recurrence makes timing clear and can be checked manually. A financial calculator could compute an answer, but without the timing and fee conventions I could not know which question it had answered.',
  firstPresentation:'Table 1 contains the first two ledger rows for each offer; the full schedules stay in the working dataset.',
  specialistTerms:'Nominal annual interest compounded monthly is divided by twelve to obtain the monthly rate in these defined offers. A settlement cost includes all payments made, any remaining balance and the upfront fee; it is not just that remaining balance.',
  predictionComparison:'The full schedules favour B by BND 103.15, but settlement after 12 months favours A by BND 201.94. My initial horizon-dependent prediction was supported.',
  benefitFinding:'I can identify both the fee limit and the earliest settlement month needed for B to be cheaper under the defined cash-flow rules.',
  nextMethod:'Geometric-sum balance formula and capped final payment',
  technologyTool:'Calculator and exact integer-cent recurrence',technologyInput:'Principal 1200000 cents, scheduled payment 30000 cents, rate fractions 6/1000 and 9/2000, with the 40000-cent fee counted outside the balance.',
  technologyOutcome:'A ends in month 46 with BND 263.06; B in month 45 with BND 59.91. Full totals including fees are BND 13763.06 and BND 13659.91.',
  technologyInterpretation:'I verify opening rows and principal totals and use the unrounded expression as an independent numerical benchmark, not as the cent-rounded contract itself.',
  courseWhy:'Sequences, geometric sums, logarithms and financial modelling develop an AI SL question about a genuine changing decision.',courseConcern:'The computation is a model of defined contracts, not a current-rate recommendation or legal claim about early repayment.',
  mathsLearning:'I learned that an interest-saving advantage accumulates over time and can fail to repay a fixed upfront cost before the loan is settled.'
 },
 accuracy:[{quantity:'Loan balances, interest, fees and payments',symbol:'B, M, F',unit:'BND',resolution:'Money is recorded in cents; positive half-cent interest is rounded upwards each month.',policy:'Compute the contractual ledger in integer cents, cap the final payment and count the fee once. Use unrounded algebra only as a separately identified benchmark.',reason:'A monetary rounding convention is part of the defined model, not measurement uncertainty. Reproducible final payments and threshold months depend on applying it consistently.'}],
 stages:[
  {key:'recurrence',title:'Building the balance rule from the payment timing',kind:'model',methodId:'follow-journey',technique:'Compound recurrence and geometric sum',knowledge:'syllabus',outcomeId:'growth',
   bridge:'I first translate the two offers into the same month-end convention so that their different rates can be compared fairly.',
   purpose:'Table 1 shows the opening two payments under each offer. The fee is absent from the balance columns because it was paid separately at time zero.',
   result:R`Ignoring cent rounding temporarily, a full month-end payment gives
\[B_{n+1}=(1+i)B_n-M,\qquad B_0=P.\]
Repeated substitution yields
\[B_n=P(1+i)^n-M\bigl(1+(1+i)+\cdots+(1+i)^{n-1}\bigr),\]
and hence
\[B_n=P(1+i)^n-M\frac{(1+i)^n-1}{i}.\]
The formula applies while full payments are made; I must not interpret negative values after payoff as money the lender owes me.

In the actual rounded ledger, A's first interest is \(12000(0.006)=72.00\), giving balance \(12000+72-300=11772.00\). Its second interest \(11772(0.006)=70.632\) rounds to 70.63, leaving 11542.63. B's first interest is 54.00 and balance 11754.00; its second interest 52.893 rounds to 52.89, leaving 11506.89. Both payments reduce the balance because 300 exceeds the first month's interest.`,
   interpretation:'B begins reducing principal faster, but its lower balance alone does not establish a cheaper offer: its borrower has already paid the extra setup fee. I will compare total cash rather than balance in isolation.',
   limitations:'The displayed geometric expression excludes intermediate rounding. It explains the schedule structure, while the exact cent recurrence implements the stipulated contract.',
   localTakeaway:'Both offers share the same recurrence structure and payment timing; B reduces principal faster but starts with a separate BND 400 cost.',
   nextQuestion:'How many payments are needed, what is the final capped payment, and which full schedule costs less?',
   nextWhy:'An assumed number of full instalments would overstate repayment and could miscount the rate advantage.',
   mathsInsight:'The fee affects total cash paid even when it never appears in the interest-bearing balance.',methodChangeReason:'I solve for the payoff horizon and then verify its boundary using the exact cent ledger.'},
  {key:'payoff',title:'Counting payments without paying past zero',kind:'model',methodId:'finance-loan',technique:'Logarithmic payoff estimate and exact final payment',knowledge:'syllabus',outcomeId:'repayment-affordable',
   bridge:'The recurrence supplies a balance after n full payments. I use its unrounded form to locate the payoff month, then check the actual amount due in the rounded ledger.',
   purpose:'Figures 1 and 2 use identical scales for the two month-end balance sequences. Table 2 compares their exact final payments and full nominal totals.',
   result:R`Setting the unrounded balance at most zero gives, when \(M>Pi\),
\[(1+i)^n\ge\frac{M}{M-Pi},\qquad
n\ge\frac{\ln(M/(M-Pi))}{\ln(1+i)}.\]
Rounding the required month upwards gives 46 for A and 45 for B; the cent-rounded ledger confirms both counts.

For A, the balance after month 45 is BND 261.49. Month 46 interest rounds to BND 1.57, so the last payment is only BND 263.06. Its total paid is \(45(300)+263.06=13763.06\), including BND 1763.06 interest.

For B, the balance after month 44 is BND 59.64. The next interest is BND 0.27, so the final payment is BND 59.91. Its instalments total \(44(300)+59.91=13259.91\), including BND 1259.91 interest. Adding the separately paid fee gives total cash of BND 13659.91. B is therefore cheaper by BND 103.15 and ends one month earlier. Every scheduled payment is at most 300, and the separate upfront 400 limit is met.

The unrounded expression would give B's final payment approximately 59.91549, which rounds once to 59.92. The contract ledger gives 59.91 because it rounds each month's interest. The one-cent difference does not change this decision, but it confirms why the convention matters.`,
   interpretation:'The interest saving is BND 503.15, but most of it pays back the setup fee. B\'s net advantage is much smaller than comparing the two interest totals without fees would suggest.',
   limitations:'This is a nominal-cash comparison of the specified schedules. It does not value when the fee is paid or compare using the upfront cash to reduce A\'s principal.',
   localTakeaway:'A costs BND 13763.06 over 46 months; B costs BND 13659.91 including its fee over 45 months, saving BND 103.15.',
   nextQuestion:'How large could B\'s fee become before its lower interest rate no longer produces the cheaper full schedule?',
   nextWhy:'The current advantage is small compared with the setup fee, so a threshold is more informative than one selected fee value.',
   mathsInsight:'The last payment is a boundary condition of the recurrence, not an additional full instalment.',methodChangeReason:'I isolate the fee while keeping rates, principal and the payment schedule fixed.'},
  {key:'fee',title:'The break-even fee for full repayment',kind:'model',methodId:'other',technique:'Cost difference and a break-even inequality',knowledge:'syllabus',outcomeId:'meaningful-result',
   bridge:'Because the fee is not financed, changing it leaves B\'s balance schedule unchanged. It changes only the total cash comparison.',
   purpose:'Figure 3 plots B minus A total cost against the hypothetical fee F. The original BND 400 choice is one scenario on this line.',
   result:R`Let F be B's separately paid fee. Its full cash total is \(13259.91+F\), while A's is 13763.06. Thus
\[C_B-C_A=F-503.15.\]
B is cheaper when \(F<503.15\), the offers tie at \(F=503.15\), and A is cheaper above that value. At F=400 the difference is \(-103.15\), agreeing with my earlier calculation. At F=500 B would save only 3.15; at F=504 A would save 0.85.

The threshold keeps the B rate at 0.0045 per month and the fee outside the principal. Financing the fee would increase both the balance and interest and would require a new recurrence, not merely adding F at the end.`,
   interpretation:'The lower-rate offer has a calculable amount of room for an upfront charge. Its rate does not guarantee a lower total cost regardless of fees.',
   limitations:'This fee threshold assumes full repayment under the stated schedules and uses nominal cash, not discounted value. It does not answer the cost of settling after a shorter time.',
   localTakeaway:'B recovers an upfront fee up to BND 503.15 under full repayment; its actual BND 400 fee leaves a BND 103.15 advantage.',
   nextQuestion:'If the original fee stays BND 400 but the balance is settled early, when does B recover that fee?',
   nextWhy:'A shorter horizon stops the interest savings from accumulating through the full schedule.',
   mathsInsight:'A fixed fee and recurring interest affect cost on different time scales.',methodChangeReason:'I return F to its original value and vary only the settlement month under a precisely stated timing rule.'},
  {key:'settlement',title:'An early exit can reverse the cheaper offer',kind:'model',methodId:'finance-loan',technique:'Settlement cash flows and an integer threshold',knowledge:'syllabus',outcomeId:'loan-assumptions',
   bridge:'I now suppose the balance is paid off immediately after a specified scheduled month-end payment, with no extra settlement charge under these fictional terms.',
   purpose:'Table 3 compares total cash already paid plus the remaining balance and fee. I do not compare remaining balances alone.',
   result:R`Before payoff, the settlement cost is
\[C_A(n)=300n+B_{A,n},\qquad C_B(n)=400+300n+B_{B,n}.\]
After a loan has already ended I use its actual total paid, not \(300n\). At month 12, A's cost is BND 12771.88 and B's is BND 12973.82. A is cheaper by BND 201.94, reversing the full-term decision.

For months when both make full payments, B becomes cheaper when \(B_{A,n}-B_{B,n}>400\). The exact ledgers give a difference of BND ${dollars(LOAN_A.rows[27].balance-LOAN_B.rows[27].balance)} at n=28 and BND ${dollars(LOAN_A.rows[28].balance-LOAN_B.rows[28].balance)} at n=29. I checked every integer month: the first cheaper settlement month for B is 29.

This is not an accidental crossing followed by an unexamined reversal. Up to B's final month, A has at least as large a balance and a higher rate. Its rounded interest is therefore no smaller, so the balance difference while equal payments continue is non-decreasing. Once B is repaid, its settlement total is fixed while A's remaining positive interest can only increase A's total. The observed crossover persists to full repayment.`,
   interpretation:'Under the original fee, I would prefer A for settlement in months 1-28 and B from month 29 onward, within this defined nominal-cash model. The choice depends on the planned horizon, not only on the rates or full-term totals.',
   limitations:'Actual early-settlement fees, changing rates, irregular extra payments or discounting would change the comparison. None is supplied by these fictional terms, so I do not infer a real borrowing recommendation.',
   localTakeaway:'A is cheaper for the stipulated settlements before month 29; B is cheaper from month 29, ending with a full-term saving of BND 103.15.',
   nextQuestion:'How would a financed setup fee, discounted cash flow or a different use of the upfront cash change the crossover?',
   nextWhy:'Those are alternative mathematical objectives or contracts, not effects already covered by the present calculation.',
   mathsInsight:'A lower balance can coexist with a higher total cost once the money already paid and the fee are counted.',methodChangeReason:'I stop with a horizon-conditional comparison rather than presenting one offer as universally preferable.'}
 ],
 figures:[
  table({id:'table-loan-opening',stage:0,number:1,title:'Checking the first two monthly payments',columns:['Offer','Month','Interest','Payment','Closing balance'],rows:openingRows,units:['','','BND','BND','BND'],note:'Interest is rounded half-up before payment. B\'s separate setup fee is not in the balance.'}),
  graph({id:'figure-loan-a',stage:1,number:1,title:'Offer A: rounded month-end loan balances',rows:[[0,12000],...LOAN_A.rows.map(r=>[r.month,r.balance/100])],xLabel:'Completed month-end payments',yLabel:'Outstanding balance',xSymbol:'n',ySymbol:'B',xUnit:'months',yUnit:'BND',bounds:[0,46,0,12500],kind:'time',caption:'Integer month-end ledger values, with the capped final payment at month 46. Joining points is only a visual aid.'}),
  graph({id:'figure-loan-b',stage:1,number:2,title:'Offer B: rounded month-end loan balances',rows:[[0,12000],...LOAN_B.rows.map(r=>[r.month,r.balance/100]),[46,0]],xLabel:'Completed month-end payments',yLabel:'Outstanding balance',xSymbol:'n',ySymbol:'B',xUnit:'months',yUnit:'BND',bounds:[0,46,0,12500],kind:'time',caption:'Same axes as Offer A. The balance reaches zero in month 45; the setup fee was paid separately at time zero.'}),
  table({id:'table-loan-totals',stage:1,number:2,title:'Full schedules with fees included',columns:['Offer','Monthly rate','Last month','Last payment','Total cash'],rows:[['A','0.6%',46,'263.06','13763.06'],['B','0.45%',45,'59.91','13659.91']],units:['','','months','BND','BND'],note:'Total cash includes the BND 400 fee only for B. Both regular instalments are BND 300.'}),
  graph({id:'figure-loan-fee',stage:2,number:3,title:'Full-repayment cost difference as B\'s fee changes',rows:[0,100,200,300,400,500,503.15,600].map(F=>[F,F-feeThreshold]),xLabel:'Hypothetical upfront fee on B',yLabel:'Total cash B minus total cash A',xSymbol:'F',ySymbol:'D',xUnit:'BND',yUnit:'BND',bounds:[0,620,-550,150],models:[{id:'model-loan-line',type:'linear',visible:true},{id:'model-loan-zero',type:'custom',expression:'0',visible:true}],caption:'Calculated cost scenarios, not market quotations. Rates and monthly schedules remain fixed; the fee is not financed.'}),
  table({id:'table-loan-settlement',stage:3,number:3,title:'Total cash when the balance is settled early',columns:['Month','A total','B total','B minus A'],rows:[12,24,28,29,30,45,46].map(n=>[n,dollars(repaymentSettlement(LOAN_A,n)),dollars(repaymentSettlement(LOAN_B,n)),dollars(repaymentSettlement(LOAN_B,n)-repaymentSettlement(LOAN_A,n))]),units:['months','BND','BND','BND'],note:'Settlement is immediately after the scheduled payment, with no extra charge by definition. Positive difference favours A.'})
 ],
 dataSets:[{name:'Repayment Offers v1 - defined terms',columns:['Offer','Principal BND','Monthly rate','Payment BND','Upfront fee BND'],rows:[['A',12000,.006,300,0],['B',12000,.0045,300,400]],sourceText:provenance},
  ...[['A',LOAN_A],['B',LOAN_B]].map(([name,ledger])=>({name:'Complete cent-rounded schedule '+name,columns:['Month','Opening BND','Interest BND','Paid BND','Closing BND'],rows:ledger.rows.map(r=>[r.month,...['opening','interest','paid','balance'].map(k=>dollars(r[k]))]),sourceText:'Exact integer-cent recurrence with positive half-cent rounding upwards and capped final payment.'})),
  {name:'All integer settlement horizons',columns:['Month','A total BND','B total BND','B minus A BND'],rows:Array.from({length:46},(_,i)=>{const n=i+1;return [n,dollars(repaymentSettlement(LOAN_A,n)),dollars(repaymentSettlement(LOAN_B,n)),dollars(repaymentSettlement(LOAN_B,n)-repaymentSettlement(LOAN_A,n))];}),sourceText:'All costs include payments to date, any remaining balance and the original separate fee.'},
  {name:'Unrounded geometric benchmark',columns:['Offer','Payoff month','Unrounded final payment'],rows:[['A',46,unroundedBalance(.006,45)*(1.006)],['B',45,unroundedBalance(.0045,44)*(1.0045)]],sourceText:'A mathematical benchmark only; the stipulated contract rounds monthly rather than once at the end.'}],
 conclusion:{mainConclusion:R`For full repayment under the defined monthly budget, B is cheaper. A ends with BND 263.06 in month 46 and total cash BND 13763.06. B ends with BND 59.91 in month 45 and total cash BND 13659.91 including its BND 400 upfront fee. The net saving is BND 103.15. Both respect the BND 300 monthly cap, and B also requires the separate upfront BND 400 budget.`,
  conclusionBenefit:R`The lower rate is not universally better. B's full-term interest saving supports a maximum break-even fee of BND 503.15. Keeping its original fee at 400, settlement after 12 months instead favours A by BND 201.94; the exact integer-cent comparison first favours B at month 29. I therefore answer my aim conditionally on the horizon and terms, not just the headline rate. The comparison is nominal cash and does not optimise alternative uses of the upfront money.`,
  conclusionExtension:'I would next compare a financed fee or a discounted-cash-flow objective, keeping those changes separate. A physical decision would additionally require verified actual terms, affordability and settlement rules; the fictional offers here establish none of those facts.'},
 reviews:[
  {id:'D01',location:'Recurrence through settlement comparison',note:'I completed both schedules, final payments, full costs, fee threshold and all integer settlement horizons.',action:'The conclusion distinguishes full-term and early-settlement preferences.'},
  {id:'D02',location:'Four stages',note:'Payment timing leads to the recurrence, payoff to total cost, the small saving to a fee threshold, and the fixed fee to a horizon comparison.',action:'I change only one contractual assumption at each sensitivity step.'},
  {id:'D03',location:'Definitions, ledger and tables',note:'I keep nominal annual and monthly rates distinct, use month-end balances and record money in cents. The setup fee is counted once and never financed implicitly.',action:'I cap the final payment and do not plot a negative post-payoff balance.'},
  {id:'D04',location:'Fee and horizon decisions',note:'My concern about a misleading headline rate leads to explicit break-even amounts and a month-29 crossover.',action:'I compare total cash rather than the remaining balance alone.'},
  {id:'D05',location:'Rounding and model limitations',note:'I show the one-cent difference between a once-rounded formula and B\'s monthly-rounded ledger and separate nominal cash from discounted value.',action:'I keep the no-extra-charge settlement rule explicit and fictional.'},
  {id:'D06',location:'Geometric sum and exact-cent recurrence',note:'I check opening payments by hand, verify the payoff count and final cap, and confirm that each schedule repays exactly the principal plus its calculated interest.',action:'I use every integer month, with the month-28 and month-29 rows supporting the crossover.'},
  {id:'D07',status:'unchecked',location:'Reader and PDF/Word',note:'The balance graphs share axes and the tables keep interest, payments and total cash separate.',action:'The final rendered tables, equations and export pages require visual inspection.'},
  {id:'D09',location:'Terms and source record',note:'The rates, budgets, fees and early-settlement rule are constructed inputs, not lender quotes or legal claims.',action:'No actual account information or current financial recommendation is included.'},
  {id:'D11',location:'All result fields',note:'I show the recurrence, geometric sum, logarithmic horizon, exact payoff totals and both decision thresholds.',action:'I have not substituted advice about shopping for a loan for the mathematical work.'},
  {id:'D19',location:'Tables 1-3 and Figures 1-3',note:'The reader contains opening rows and decision summaries; full ledgers and all settlement horizons remain editable working data.',action:'Both balance plots use the same ranges to avoid visually exaggerating the rate difference.'},
  {id:'D20',location:'Ledger and calculator',note:'I specify integer cents and exact rate fractions, explain half-up rounding and compare with the derived unrounded balance formula.',action:'The software output has a stated convention and reproducible inputs.'}
 ]
});
