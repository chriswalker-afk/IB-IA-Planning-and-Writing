/** C96 is a view of the current work, not a second unrelated cue context. */
export function writingOriginNode(state,node=state.completion.current){
 if(node!=="C96")return node;
 const origin=state.completion.writingOrigin?.node||state.completion.returnTo;
 return origin&&origin!=="C96"?origin:"C04";
}
export function writingOriginState(state,node=state.completion.current){
 if(node!=="C96")return state;
 const o=state.completion.writingOrigin||{},index=state.entries.findIndex(e=>e.id===o.entryId);
 return {...state,completion:{...state.completion,current:writingOriginNode(state,node),activeEntryIndex:index,nextFromEntryId:o.nextFromEntryId||""}};
}
