/** Small, deterministic typesetter for Table Studio's optional input shortcuts.
 * Formatting is display-only: CSV and the source worksheet retain exact input.
 * Never interpret arbitrary LaTeX or HTML from students.
 */
import {formatGraphMath} from "./graph-core.js";

export const TABLE_MATH_SYMBOLS=Object.freeze([
 {label:"xᵢ",token:"x_i",title:"Subscript, e.g. x_i or x_{12}"},
 {label:"x̄",token:"\\bar{x}",title:"Mean / x bar"},
 {label:"ŷ",token:"\\hat{y}",title:"Estimated or predicted value"},
 {label:"Δ",token:"\\Delta",title:"Change / capital delta"},
 {label:"θ",token:"\\theta",title:"Theta"},
 {label:"σ",token:"\\sigma",title:"Sigma"},
 {label:"μ",token:"\\mu",title:"Mu"},
 {label:"±",token:"±",title:"Plus or minus / uncertainty"},
 {label:"s⁻²",token:"s^-2",title:"Unit with a negative power"}
]);

const GREEK=Object.freeze({
 alpha:"α",beta:"β",gamma:"γ",delta:"δ",Delta:"Δ",epsilon:"ε",
 theta:"θ",lambda:"λ",mu:"μ",pi:"π",rho:"ρ",sigma:"σ",
 Sigma:"Σ",phi:"φ",omega:"ω",Omega:"Ω"
});
const SUBSCRIPT=Object.freeze({
 "0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉",
 "+":"₊","-":"₋","=":"₌","(":"₍",")":"₎",
 a:"ₐ",e:"ₑ",h:"ₕ",i:"ᵢ",j:"ⱼ",k:"ₖ",l:"ₗ",m:"ₘ",n:"ₙ",
 o:"ₒ",p:"ₚ",r:"ᵣ",s:"ₛ",t:"ₜ",u:"ᵤ",v:"ᵥ",x:"ₓ"
});
/** Convert only recognised shortcuts. Unsupported notation is left visible. */
export function formatTableMath(value){
 let text=String(value??"");
 text=text.replace(/\\(bar|hat)\{([A-Za-z])\}/g,(_all,mark,char)=>char+(mark==="bar"?"\u0304":"\u0302"));
 text=text.replace(/\\([A-Za-z]+)\b/g,(whole,name)=>GREEK[name]||whole);
 text=text.replace(/_(?:\{([^{}\s]{1,12})\}|([A-Za-z0-9]))/g,(whole,braced,single)=>{
  const chars=[...(braced??single)];
  return chars.every(char=>Object.hasOwn(SUBSCRIPT,char))?chars.map(char=>SUBSCRIPT[char]).join(""):whole;
 });
 return formatGraphMath(text);
}
