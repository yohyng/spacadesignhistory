import {BOOKS,DSA_CATS,YEAR_BOUNDS} from './data.js';
export const PX_PER_YEAR=38,CARD_W=188,SUB_H=62,LANE_PAD=12,LABEL_W=184,AXIS_H=56,GROUP_GAP=30,SCALE_MIN=.3,SCALE_MAX=3.6;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const baseX=y=>(y-YEAR_BOUNDS.min)*PX_PER_YEAR+40;
export function zoomAt(view,cx,cy,factor){const ns=clamp(view.s*factor,SCALE_MIN,SCALE_MAX),k=ns/view.s;return {...view,s:ns,tx:cx-(cx-view.tx)*k,ty:cy-(cy-view.ty)*k};}
export function layoutBooks(){let y=20, lanes=[]; for(const cat of DSA_CATS){const laneBooks=BOOKS.filter(b=>b.cat===cat.id).sort((a,b)=>a.year-b.year); const ends=[]; for(const b of laneBooks){const x=baseX(b.year); let sub=ends.findIndex(e=>x>e+10); if(sub<0){sub=ends.length; ends.push(-Infinity)} ends[sub]=x+CARD_W; b._x=x; b._sub=sub;} const h=Math.max(1,ends.length)*SUB_H+LANE_PAD*2; lanes.push({cat,y,h,books:laneBooks}); y+=h+(cat.id%4===0?GROUP_GAP:0);} return {lanes,height:y,width:baseX(YEAR_BOUNDS.max)+CARD_W+80};}
