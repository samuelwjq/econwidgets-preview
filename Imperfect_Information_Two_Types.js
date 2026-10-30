(()=>{

'use strict';
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const BLUE='#2563eb',GREEN='#16a34a',RED='#dc2626',MUTED='#9ca3af';
// Equal scales and equal-length actual curves: MPB=100-Q, MPC=Q.
const PLOT={left:100,right:480,top:40,bottom:420,max:120};
const X=q=>100+q*380/PLOT.max,Y=p=>420-p*380/PLOT.max;
function model(type,signedMagnitude){
 const cost=type==='mpc',under=signedMagnitude<0,magnitude=Math.abs(signedMagnitude),shift=signedMagnitude;
 const q=50+(cost?-shift:shift)/2,p=cost?100-q:q;
 const caseTitle=magnitude===0?'No Mis-estimation':`${under?'Underestimating':'Overestimating'} ${cost?'MPC':'MPB'}`;
 return {type,magnitude,signedMagnitude,cost,under,shift,q,p,qs:50,ps:50,over:q>50,zero:magnitude===0,dwl:(q-50)**2,caseTitle};
}
window.imperfectInformationModel=model;
const tips={};let segments=[],occupied=[],tipAnchor=null;let selectedType='mpc';
function el(tag,attrs={},parent=$('drawing')){let e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);parent.append(e);return e;}
function tip(e,id,content){tips[id]=content;e.dataset.tip=id;e.classList.add('tip-target');e.setAttribute('tabindex','0');e.setAttribute('role','button');e.setAttribute('aria-label',content);}
function line(x1,y1,x2,y2,attrs={},parent=$('drawing')){return el('line',{x1,y1,x2,y2,...attrs},parent);}
function text(x,y,parts,cls='',anchor='start'){let e=el('text',{x,y,class:'diagram-text '+cls,'text-anchor':anchor});for(let part of parts){if(typeof part==='string')e.append(document.createTextNode(part));else{let t=el('tspan',{'baseline-shift':'sub'},e);t.textContent=part.sub;}}EconDiagramPresentation.styleText(e,cls.includes('curve-label')?'longEquation':cls.includes('small')?'small':'main');return e;}
function curve(a,b,color,id,description,baseline=false){
 // Clip the line to the first quadrant and the square economic viewport.
 let points=[];for(let q of [0,PLOT.max]){let p=a+b*q;if(p>=0&&p<=PLOT.max)points.push({q,p});}for(let p of [0,PLOT.max]){let q=(p-a)/b;if(q>=0&&q<=PLOT.max)points.push({q,p});}
 points=points.filter((p,i,arr)=>arr.findIndex(t=>Math.abs(t.q-p.q)<1e-7)===i).sort((u,v)=>u.q-v.q);
 if(baseline&&b===1)points=[{q:0,p:0},{q:100,p:100}];
 const u=points[0],v={...points.at(-1)};
 // Match the reference baseline length; do not extend a perceived curve further.
 if(!baseline&&v.q-u.q>100){v.q=u.q+100;v.p=a+b*v.q;}
 const s={x1:X(u.q),y1:Y(u.p),x2:X(v.q),y2:Y(v.p),a,b,id};segments.push(s);
 const g=el('g',{'data-curve':id});const curveNode=line(s.x1,s.y1,s.x2,s.y2,{stroke:color,'stroke-width':2.5},g);
 curveNode.id='b4-curve-'+id;curveNode.classList.add('curve');tips[id]=description;return s;
}
// Segment/rectangle intersections keep text clear of every economic curve.
function intersects(s,b){let lo=0,hi=1;for(const [p,d,min,max] of [[s.x1,s.x2-s.x1,b.x,b.x+b.width],[s.y1,s.y2-s.y1,b.y,b.y+b.height]]){if(Math.abs(d)<1e-8){if(p<min||p>max)return false;}else{let t0=(min-p)/d,t1=(max-p)/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return false;}}return true;}
const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
function label(parts,candidates,cls,content,id){const c=candidates[0],e=text(c.x,c.y,parts,cls);if(id)e.id=id;if(c.anchor){e.dataset.pointX=c.anchor.x;e.dataset.pointY=c.anchor.y;}if(cls!=='curve-label')tip(e,id,content);return e;}
function curveLabel(s,parts,content){const e=text(s.x2+8,s.y2+4,parts,'curve-label');e.dataset.curveTarget='b4-curve-'+s.id;return e;}
function guides(m){
 const points=m.zero?[{q:50,p:50,sub:'e = s'}]:[{q:50,p:50,sub:'s'},{q:m.q,p:m.p,sub:'e'}];
 for(const e of points){line(X(e.q),Y(e.p),X(e.q),420,{stroke:MUTED,'stroke-dasharray':'4 4','stroke-width':1});line(100,Y(e.p),X(e.q),Y(e.p),{stroke:MUTED,'stroke-dasharray':'4 4','stroke-width':1});}
 // All quantity labels share a row; all price labels share a column.
 const qs=points.map(e=>({pos:X(e.q),actual:X(e.q),sub:e.sub})).sort((a,b)=>a.pos-b.pos);
 const ps=points.map(e=>({pos:Y(e.p),actual:Y(e.p),sub:e.sub})).sort((a,b)=>a.pos-b.pos);
 for(const e of qs){const qLabel=text(e.pos,447,['Q',{sub:e.sub}],'','middle');
 const description=e.sub==='s'?'Socially efficient output (Qs): the quantity where actual MSB equals actual MSC, maximising society’s net benefit.':e.sub==='e'?'Free-market equilibrium output (Qe): the quantity where perceived MPB equals perceived MPC. Decisions are based on perceived costs and benefits.':'Free-market equilibrium output (Qe) equals socially efficient output (Qs): with no mis-estimation, actual and perceived values coincide.';
 tip(qLabel,'quantity-'+e.sub,description);}
 for(const e of ps){text(80,e.pos+5,['P',{sub:e.sub}],'','end');}
}
function render(){EconDiagramPresentation.resetPresentation($('diagram'));
 for(const type of ['mpc','mpb'])$('type-'+type).setAttribute('aria-pressed',String(type===selectedType));
 closeTip();$('drawing').replaceChildren();segments=[];occupied=[];const m=model(selectedType,+$('magnitude').value);window.currentModel=m;
 $('magnitude').setAttribute('aria-valuetext',m.zero?'No Mis-estimation':m.caseTitle+' — '+(m.magnitude<27?'Small':m.magnitude<54?'Moderate':'Large'));
 $('svg-description').textContent=`${m.caseTitle}. ${m.zero?'No information error; market and efficient outcomes coincide.':(m.over?'Overconsumption':'Underconsumption')+' relative to socially efficient output.'}`;
 line(100,420,488,420,{stroke:'#374151','stroke-width':2,'marker-end':'url(#axis-arrow)'});line(100,420,100,32,{stroke:'#374151','stroke-width':2,'marker-end':'url(#axis-arrow)'});
 text(83,20,['Price /'],'small-label','end');text(83,36,['Costs /'],'small-label','end');text(83,52,['Benefits'],'small-label','end');text(488,446,['Qty'],'','start');text(92,438,['O'],'small-label','end');
 const showDwl=$('dwl').checked&&!m.zero;
 if(showDwl){const poly=el('polygon',{points:`${X(50)},${Y(50)} ${X(m.q)},${Y(m.q)} ${X(m.q)},${Y(100-m.q)}`,fill:RED,'fill-opacity':.25,stroke:RED,'stroke-width':1,'data-area':'dwl'});tip(poly,'dwl','Deadweight loss: the net social benefit lost on units between market output and socially efficient output, measured between actual MSB and MSC.');}
 guides(m);
 segments.push({x1:100,y1:420,x2:488,y2:420},{x1:100,y1:420,x2:100,y2:32});
 const supply=curve(0,1,GREEN,'actual-mpc','Actual marginal private cost equals marginal social cost. There are no external costs.',true);
 const demand=curve(100,-1,BLUE,'actual-mpb','Actual marginal private benefit equals marginal social benefit. There are no external benefits.',true);
 let perceived;if(!m.zero)perceived=curve(m.cost?m.shift:100+m.shift,m.cost?1:-1,RED,'perceived',`Perceived marginal private ${m.cost?'cost':'benefit'} is ${m.under?'below':'above'} its actual value. This is the curve used by decision-makers.`);
 if($('divergence').checked&&!m.zero){let q=25;if(m.under)q=m.cost?m.magnitude+10:(100-m.magnitude)/2;let p=m.cost?q:100-q;const pp=p+m.shift;line(X(q),Y(p),X(q),Y(pp),{stroke:RED,'stroke-width':1.5,'marker-start':'url(#gap-arrow)','marker-end':'url(#gap-arrow)'});}
 for(const pt of m.zero?[{q:50,p:50,sub:'e = s',id:'merged'}]:[{q:50,p:50,sub:'s',id:'efficient'},{q:m.q,p:m.p,sub:'e',id:'market'}]){
 let c=el('circle',{cx:X(pt.q),cy:Y(pt.p),r:4,fill:pt.id==='market'?RED:'#1f2937'});let content=pt.id==='merged'?'Market equilibrium and social optimum coincide.':pt.id==='market'?'Market equilibrium: perceived MPB equals perceived MPC.':'Socially efficient outcome: actual MSB equals actual MSC.';tip(c,pt.id,content);
 // Reserve space around point markers before positioning any text.
 occupied.push({x:X(pt.q)-7,y:Y(pt.p)-7,width:14,height:14});
 }
 curveLabel(supply,m.cost?['MPC',{sub:m.zero?'ACTUAL = PERCEIVED':'ACTUAL'},' = MSC']:['MPC = MSC'],tips['actual-mpc']);
 curveLabel(demand,!m.cost?['MPB',{sub:m.zero?'ACTUAL = PERCEIVED':'ACTUAL'},' = MSB']:['MPB = MSB'],tips['actual-mpb']);
 if(perceived)curveLabel(perceived,[m.cost?'MPC':'MPB',{sub:'PERCEIVED'}],tips.perceived);
 for(const pt of m.zero?[{q:50,p:50,sub:'e = s',id:'merged'}]:[{q:50,p:50,sub:'s',id:'efficient'},{q:m.q,p:m.p,sub:'e',id:'market'}]){const ax=X(pt.q),ay=Y(pt.p),c=[];for(const d of [[12,-12],[12,25],[-40,-14],[-40,28],[25,-36],[-55,-36],[32,42],[-60,48]])c.push({x:ax+d[0],y:ay+d[1],anchor:{x:ax,y:ay}});label(['E',{sub:pt.sub}],c,'',tips[pt.id],'label-'+pt.id);}
 if(showDwl){
  const apex=X(50),base=X(m.q),centerY=Y(50),padding=4;
  const dwlLabel=text(0,0,['DWL'],'small-label','middle');let fitted=false;
  // The entire padded text box must fit within the actual DWL triangle.
  for(const fraction of [.55,.65,.75,.85]){
   dwlLabel.setAttribute('x',apex+(base-apex)*fraction);dwlLabel.setAttribute('y',centerY);
   let b=dwlLabel.getBBox();dwlLabel.setAttribute('y',centerY+centerY-(b.y+b.height/2));b=dwlLabel.getBBox();
   const box={x:b.x-padding,y:b.y-padding,width:b.width+padding*2,height:b.height+padding*2};
   const corners=[[box.x,box.y],[box.x+box.width,box.y],[box.x,box.y+box.height],[box.x+box.width,box.y+box.height]];
   const inside=corners.every(([x,y])=>x>=Math.min(apex,base)&&x<=Math.max(apex,base)&&Math.abs(y-centerY)<=Math.abs(x-apex));
   if(inside&&!occupied.some(o=>overlap(o,box))){fitted=true;occupied.push(box);break;}
  }
  if(fitted)tip(dwlLabel,'label-dwl',tips.dwl);else dwlLabel.remove();
 }
 if($('gap').checked&&!m.zero){const l=Math.min(X(50),X(m.q)),r=Math.max(X(50),X(m.q));line(l,467,r,467,{stroke:RED,'stroke-width':1.5,'marker-start':'url(#gap-arrow)','marker-end':'url(#gap-arrow)'});text((l+r)/2,490,[m.over?'Overconsumption':'Underconsumption'],'small-label','middle');}
 $('legend').hidden=!showDwl;
 const direction=m.zero?'No Overconsumption Or Underconsumption':m.over?'Overconsumption':'Underconsumption';
 $('summary-body').innerHTML=`<tr><th>Information Error</th><td>${m.caseTitle}</td></tr><tr><th>Market Outcome</th><td>E<sub>e</sub>: ${m.zero?'Coincides With Social Optimum':'Determined By Perceived Costs And Benefits'}</td></tr><tr><th>Social Optimum</th><td>E<sub>s</sub>: Actual MSB = Actual MSC</td></tr><tr><th>Output</th><td>${direction}</td></tr><tr><th>Deadweight Loss</th><td>${m.zero?'None':'Present; Increases With The Size Of The Error'}</td></tr>`;
 const kind=m.cost?'costs':'benefits';
 $('explanation').innerHTML=m.zero?'<p>With <strong>no mis-estimation</strong>, perceived values equal actual values. Consumption occurs where <strong>MSB = MSC</strong>. There is no deadweight loss.</p>':`<p>Decision-makers <strong>${m.under?'underestimate':'overestimate'} private ${kind}</strong>, so perceived ${m.cost?'MPC':'MPB'} lies ${m.under?'below':'above'} its actual curve.</p><p>The market chooses E<sub>e</sub>, where <strong>perceived MPB = perceived MPC</strong>. Market output is ${m.over?'greater':'lower'} than the socially efficient output at E<sub>s</sub>, resulting in <strong>${m.over?'overconsumption':'underconsumption'}</strong>.</p><p>${m.over?'For the excess units, actual MSC exceeds actual MSB.':'For the missing units, actual MSB exceeds actual MSC, so potential net benefits are forgone.'} The area between actual MSB and MSC over these units is the <strong>deadweight loss</strong>.</p>`;
 window.batch4State=m;Batch4Presentation.rendered();
}

let pinned=false;
function showTip(target,pin=false){tipAnchor=target;pinned=pin;$('tip-text').textContent=tips[target.dataset.tip];$('tooltip').hidden=false;const b=target.getBoundingClientRect(),t=$('tooltip'),w=t.offsetWidth,h=t.offsetHeight;t.style.left=Math.max(12,Math.min(b.left,innerWidth-w-12))+'px';t.style.top=Math.max(12,Math.min(b.bottom+8,innerHeight-h-12))+'px';}
function closeTip(){ $('tooltip').hidden=true;pinned=false;tipAnchor=null;}
$('diagram').addEventListener('pointerover',e=>{const t=e.target.closest('[data-tip]');if(t&&!pinned&&e.pointerType!=='touch')showTip(t);});
$('diagram').addEventListener('pointerout',e=>{if(!pinned&&!e.relatedTarget?.closest('#tooltip')&&!e.relatedTarget?.closest('[data-tip]'))closeTip();});
$('diagram').addEventListener('focusin',e=>{if(e.target.dataset.tip)showTip(e.target);});
$('diagram').addEventListener('focusout',e=>{if(!pinned&&!e.relatedTarget?.closest('#tooltip'))closeTip();});
$('diagram').addEventListener('click',e=>{const t=e.target.closest('[data-tip]');if(t)showTip(t,true);});
$('diagram').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.dataset.tip){e.preventDefault();showTip(e.target,true);}});
$('close-tip').addEventListener('click',()=>{const a=tipAnchor;closeTip();a?.focus();closeTip();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTip();});document.addEventListener('click',e=>{if(!e.target.closest('#tooltip')&&!e.target.closest('[data-tip]'))closeTip();});window.addEventListener('scroll',closeTip,{passive:true});window.addEventListener('resize',closeTip);
for(const id of ['dwl','gap','divergence'])$(id).addEventListener('change',render);$('magnitude').addEventListener('input',render);
for(const type of ['mpc','mpb'])$('type-'+type).addEventListener('click',()=>{selectedType=type;render();});
$('reset').addEventListener('click',()=>{selectedType='mpc';$('magnitude').value=0;for(const id of ['dwl','gap','divergence'])$(id).checked=true;$('status').textContent='';render();});
render();

})();
