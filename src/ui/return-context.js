export function captureReturn(element=document.activeElement){
 return {element,scroll:window.scrollY,attributes:element instanceof Element?[...element.attributes].filter(a=>a.name==='id'||a.name.startsWith('data-')).map(a=>[a.name,a.value]):[]};
}
export function restoreReturn(context){
 if(!context)return;
 const replacement=context.element?.isConnected?context.element:[...document.querySelectorAll('button,input,textarea,select,summary')].find(el=>context.attributes?.length&&context.attributes.every(([k,v])=>el.getAttribute(k)===v));
 window.scrollTo({top:Number(context.scroll)||0,behavior:'instant'});
 (replacement||document.querySelector('#main'))?.focus({preventScroll:true});
}
