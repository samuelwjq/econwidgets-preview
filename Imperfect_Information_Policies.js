(()=>{

'use strict';
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const BLUE='#2563eb',GREEN='#16a34a',RED='#dc2626',MUTED='#9ca3af';
// Equal scales and equal-length actual curves: MPB=100-Q, MPC=Q.
const PLOT={left:100,right:480,top:40,bottom:420,max:120};
const X=q=>100+q*380/PLOT.max,Y=p=>420-p*380/PLOT.max;
const CASES=['under-mpc','over-mpc','under-mpb','over-mpb'];
function model(type,policy,correction=0,fiscal=0){
 const cost=type.endsWith('mpc'),under=type.startsWith('under'),initialShift=under?-40:40;
 const qe=50+(cost?-initialShift:initialShift)/2,pe=cost?100-qe:qe;
 const compulsory=policy==='compulsory',information=policy==='education'||policy==='information';
 if(compulsory&&qe>=50)throw new Error('Compulsory consumption applies only to underconsumption.');
 const shift=information?initialShift*(1-correction/100):policy==='fiscal'?initialShift+(cost?fiscal:-fiscal):initialShift;
 const q=compulsory?50:50+(cost?-shift:shift)/2,p=cost?100-q:q;
 const changed=Math.abs(q-qe)>1e-8,efficient=Math.abs(q-50)<1e-8,transfer=policy==='fiscal'?Math.abs(fiscal)*q:0;
 const caseTitle=`${under?'Underestimating':'Overestimating'} ${cost?'MPC':'MPB'}`;
 return {type,policy,cost,under,initialShift,shift,qe,pe,q,p,qs:50,ps:50,changed,efficient,compulsory,information,fiscal,correction,transfer,dwl:(q-50)**2,initialDwl:(qe-50)**2,over:q>50,caseTitle};
}
window.imperfectInformationPolicyModel=model;
const tips={};let segments=[],occupied=[],tipAnchor=null,selectedCase='under-mpc',legendEntries=[];
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
function guidePoints(points){
 const merged=[];for(const p of points){let same=merged.find(t=>Math.abs(t.q-p.q)<1e-7&&Math.abs(t.p-p.p)<1e-7);if(same){same.sub+=' = '+p.sub;same.description+=' '+p.description;}else merged.push({...p});}
 for(const pt of merged){line(X(pt.q),Y(pt.p),X(pt.q),420,{stroke:MUTED,'stroke-dasharray':'4 4','stroke-width':1});line(100,Y(pt.p),X(pt.q),Y(pt.p),{stroke:MUTED,'stroke-dasharray':'4 4','stroke-width':1});}
 for(const quantity of [true,false]){
  const entries=[];for(const pt of merged){const value=quantity?pt.q:pt.p;let same=entries.find(t=>Math.abs(t.value-value)<1e-7);if(same){same.sub+=' = '+pt.sub;same.description+=' '+pt.description;}else entries.push({value,sub:pt.sub,description:pt.description});}
  entries.sort((a,b)=>a.value-b.value);if(!quantity)entries.reverse();
  const items=entries.map(e=>{const actual=quantity?X(e.value):Y(e.value),node=text(quantity?actual:80,quantity?447:actual+5,[quantity?'Q':'P',{sub:e.sub}],'',quantity?'middle':'end'),b=node.getBBox();return {...e,actual,node,size:quantity?b.width:b.height,pos:actual};});
  for(const e of items){e.node.setAttribute(quantity?'x':'y',quantity?e.pos:e.pos+5);if(quantity)tip(e.node,'quantity-'+e.sub,e.description);}
 }
 return merged;
}
function dwlArea(q,outline=false){const a=el('polygon',{points:`${X(50)},${Y(50)} ${X(q)},${Y(q)} ${X(q)},${Y(100-q)}`,fill:outline?'none':RED,'fill-opacity':outline?1:.25,stroke:outline?'#c4a3a3':RED,'stroke-width':1,'data-area':outline?'eliminated':'dwl',...(outline?{'stroke-dasharray':'4 4'}:{})});tip(a,outline?'eliminated':'dwl',outline?'Initial deadweight loss eliminated by requiring consumption at Qs. Perceptions have not changed.':'Remaining deadweight loss: the gap between actual MSB and MSC over units between current consumption and Qs.');}
function dwlText(q){
 const apex=X(50),base=X(q),cy=Y(50),padding=4,e=text(0,0,['DWL'],'small-label','middle');let fitted=false;
 for(const fraction of [.55,.65,.75,.85]){e.setAttribute('x',apex+(base-apex)*fraction);e.setAttribute('y',cy);let b=e.getBBox();e.setAttribute('y',cy+cy-b.y-b.height/2);b=e.getBBox();const box={x:b.x-padding,y:b.y-padding,width:b.width+padding*2,height:b.height+padding*2};const inside=[[box.x,box.y],[box.x+box.width,box.y],[box.x,box.y+box.height],[box.x+box.width,box.y+box.height]].every(([x,y])=>x>=Math.min(apex,base)&&x<=Math.max(apex,base)&&Math.abs(y-cy)<=Math.abs(x-apex));if(inside&&!occupied.some(o=>overlap(o,box))){fitted=true;occupied.push(box);break;}}
 if(fitted)tip(e,'label-dwl',tips.dwl);else e.remove();
}
function drawLegend(){
 $('legend').replaceChildren();$('legend').hidden=!legendEntries.length;
 for(const entry of legendEntries){const item=document.createElement('span');item.className='legend-item';const c=document.createElement('i'),h=document.createElement('i');c.style.background=entry.outline?'white':entry.colour;c.className=entry.outline?'outline':'';h.className=entry.outline?'outline':entry.kind==='fiscal'?'fiscal-pattern':'swatch pattern';const t=document.createElement('span');t.textContent=entry.label;item.append(c);if(!entry.outline)item.append(h);item.append(t);$('legend').append(item);}
}
function render(){EconDiagramPresentation.resetPresentation($('diagram'));
 closeTip();$('drawing').replaceChildren();segments=[];occupied=[];legendEntries=[];
 $('case-select').value=selectedCase;
 const allowed=selectedCase==='over-mpc'||selectedCase==='under-mpb';$('compulsory-option').disabled=!allowed;
 if(!allowed&&$('policy').value==='compulsory')$('policy').value='education';
 const policy=$('policy').value,m=model(selectedCase,policy,+$('correction').value,+$('fiscal').value);window.currentModel=m;
 $('correction-control').hidden=!m.information;$('fiscal-control').hidden=policy!=='fiscal';$('compulsory-note').hidden=!m.compulsory;$('fiscal-area-option').hidden=policy!=='fiscal';
 $('correction').setAttribute('aria-valuetext',m.correction===0?'No Correction':m.correction===100?'Full Correction':'Partial Correction');
 $('fiscal').setAttribute('aria-valuetext',m.fiscal===0?'No Intervention':(m.fiscal>0?'Tax':'Subsidy')+' — '+(m.fiscal*(m.qe>50?1:-1)<0?'Worsens The Initial Failure':Math.abs(m.fiscal)===40?'Corrective Size':Math.abs(m.fiscal)<40?'Smaller Than Corrective Size':'Larger Than Corrective Size'));
 $('svg-description').textContent=`${m.caseTitle}. ${m.compulsory?'Required consumption at the social optimum.':m.efficient?'Consumption at the social optimum.':m.over?'Overconsumption remains.':'Underconsumption remains.'}`;
 line(100,420,488,420,{stroke:'#374151','stroke-width':2,'marker-end':'url(#axis-arrow)'});line(100,420,100,32,{stroke:'#374151','stroke-width':2,'marker-end':'url(#axis-arrow)'});
 text(83,20,['Price /'],'small-label','end');text(83,36,['Costs /'],'small-label','end');text(83,52,['Benefits'],'small-label','end');text(488,446,['Qty']);text(92,438,['O'],'small-label','end');
 const fiscalVisible=policy==='fiscal'&&$('fiscal-area').checked&&m.transfer>1e-7;
 if(fiscalVisible){const original=m.cost?m.q+m.initialShift:100-m.q+m.initialShift,adjusted=m.cost?m.q+m.shift:100-m.q+m.shift;const area=el('rect',{x:100,y:Y(Math.max(original,adjusted)),width:X(m.q)-100,height:Math.abs(Y(original)-Y(adjusted)),fill:'#4169e1','fill-opacity':.18,stroke:'#4169e1','stroke-width':1,'data-area':'fiscal'});tip(area,'fiscal-area',m.fiscal>0?'Tax revenue: per-unit tax multiplied by current consumption. This is a transfer, not an additional social benefit.':'Subsidy expenditure: per-unit subsidy multiplied by current consumption. This is a transfer; financing costs are excluded.');legendEntries.push({kind:'fiscal',colour:'#4169e140',label:m.fiscal>0?'Tax Revenue':'Subsidy Expenditure'});}
 if($('dwl').checked){if(m.compulsory){dwlArea(m.qe,true);legendEntries.unshift({outline:true,label:'DWL Eliminated'});}else if(!m.efficient){dwlArea(m.q);legendEntries.unshift({kind:'dwl',colour:'#dc262640',label:'Deadweight Loss'});}}
 const rawPoints=[{q:m.qe,p:m.pe,sub:'e',description:'Qe: initial free-market consumption, based on the original perceived costs and benefits.'},{q:50,p:50,sub:'s',description:'Qs: socially efficient consumption, where actual MSB equals actual MSC.'}];
 if(m.changed&&!m.compulsory)rawPoints.push({q:m.q,p:m.p,sub:'1',description:'Q1: consumption after the selected policy, where the effective private curves intersect.'});
 const points=guidePoints(rawPoints);
 segments.push({x1:100,y1:420,x2:488,y2:420},{x1:100,y1:420,x2:100,y2:32});
 const supply=curve(0,1,BLUE,'actual-mpc','',true),demand=curve(100,-1,BLUE,'actual-mpb','',true);
 const initial=curve(m.cost?m.initialShift:100+m.initialShift,m.cost?1:-1,RED,'initial-perceived','');
 let current;if(m.changed&&!m.compulsory)current=curve(m.cost?m.shift:100+m.shift,m.cost?1:-1,GREEN,'policy-adjusted','');
 // Fiscal correction still has a distinct economic meaning when it coincides with an actual curve.
 const merged=m.changed&&m.efficient&&!m.compulsory;
 for(const pt of points){const c=el('circle',{cx:X(pt.q),cy:Y(pt.p),r:4,fill:pt.sub==='e'?'#9b6666':pt.sub.includes('1')?RED:'#1f2937'});tip(c,'point-'+pt.sub,pt.description.replace(/Qe:/g,'Ee:').replace(/Qs:/g,'Es:').replace(/Q1:/g,'E1:'));occupied.push({x:X(pt.q)-7,y:Y(pt.p)-7,width:14,height:14});}
 const own=m.cost?'MPC':'MPB';
 const adjustedParts=policy==='fiscal'?[own+'*',{sub:'PERCEIVED'},m.fiscal>0?(m.cost?' + Tax':' − Tax'):(m.cost?' − Subsidy':' + Subsidy')]:[own+'*',{sub:'PERCEIVED'}];
 let supplyParts=m.cost?['MPC',{sub:'ACTUAL'},' = MSC']:['MPC = MSC'];let demandParts=!m.cost?['MPB',{sub:'ACTUAL'},' = MSB']:['MPB = MSB'];

 curveLabel(supply,supplyParts,'');curveLabel(demand,demandParts,'');curveLabel(initial,[own,{sub:'PERCEIVED'}],'');if(current)curveLabel(current,adjustedParts,'');
 for(const pt of points){const ax=X(pt.q),ay=Y(pt.p),candidates=[];for(const [dx,dy] of [[12,-12],[12,25],[-40,-14],[-40,28],[25,-36],[-55,-36],[32,42],[-60,48]])candidates.push({x:ax+dx,y:ay+dy,anchor:{x:ax,y:ay}});label(['E',{sub:pt.sub}],candidates,'',tips['point-'+pt.sub],'label-point-'+pt.sub);}
 if($('dwl').checked&&!m.compulsory&&!m.efficient)dwlText(m.q);
 if(m.compulsory){line(X(50),420,X(50),Y(112),{stroke:GREEN,'stroke-width':1.5,'data-policy':'required-consumption'});const compulsoryLabel=text(X(50),Y(112)-10,['Compulsory Consumption Level'],'curve-label','middle');compulsoryLabel.setAttribute('data-policy-label','compulsory-level');line(X(m.qe),467,X(50),467,{stroke:RED,'stroke-width':1.8,'marker-end':'url(#gap-arrow)','data-policy':'compulsory-arrow'});text((X(m.qe)+X(50))/2,490,['Compulsory Consumption'],'small-label','middle');}
 else if($('gap').checked&&!m.efficient){line(Math.min(X(50),X(m.q)),467,Math.max(X(50),X(m.q)),467,{stroke:RED,'stroke-width':1.5,'marker-start':'url(#gap-arrow)','marker-end':'url(#gap-arrow)'});text((X(50)+X(m.q))/2,490,[m.over?'Overconsumption':'Underconsumption'],'small-label','middle');}
 drawLegend();
 const outcome=m.efficient?'Socially Efficient Consumption':m.over?'Overconsumption':'Underconsumption';
 const comparison=m.dwl<m.initialDwl-1e-7?'Reduced':m.dwl>m.initialDwl+1e-7?'Increased':'Unchanged';
 const policyName={education:'Education & Campaigns',information:'Providing Accurate Information (Legislation)',compulsory:'Compulsory Consumption',fiscal:m.fiscal===0?'No Tax Or Subsidy':m.fiscal>0?'Tax':'Subsidy'}[policy];
 $('summary-body').innerHTML=`<tr><th>Initial Case</th><td>${m.caseTitle} → ${m.qe>50?'Overconsumption':'Underconsumption'}</td></tr><tr><th>Policy</th><td>${policyName}</td></tr><tr><th>Consumption</th><td>${outcome}${m.compulsory?' — Required At Q<sub>s</sub>':m.changed?' — Q<sub>1</sub> Compared With Q<sub>s</sub>':' — Original Market Outcome'}</td></tr><tr><th>Deadweight Loss</th><td>${m.efficient?'Eliminated':comparison+' Relative To No Intervention'}</td></tr><tr><th>Perceptions</th><td>${m.information?m.correction===100?'Fully Corrected':m.correction===0?'Unchanged':'Partially Corrected':'Unchanged'}</td></tr>`;
 let explanation;
 if(m.information)explanation=`<p>${policy==='education'?'Education & campaigns improve consumers’ understanding.':'Legislation requires accurate disclosure, labels or warnings; the slider represents how far consumers incorporate this information.'} Perceived ${own} moves towards actual ${own}.</p><p>The initial perceived curve and E<sub>e</sub> remain as references. As the error is corrected, consumption approaches Q<sub>s</sub> and <strong>DWL decreases</strong>. Full correction makes perceived and actual values coincide.</p>`;
 else if(m.compulsory)explanation='<p><strong>Compulsory consumption</strong> requires the socially efficient quantity Q<sub>s</sub>. The arrow starts at voluntary consumption Q<sub>e</sub> and ends at Q<sub>s</sub>.</p><p>Perceptions remain unchanged, so the original perceived curves and E<sub>e</sub> remain. The outline shows the <strong>DWL eliminated</strong>. Q<sub>s</sub> is a required quantity, not a new voluntary market equilibrium. Full compliance is assumed.</p>';
 else explanation=`<p>A <strong>tax discourages consumption</strong>; a <strong>subsidy encourages consumption</strong>. In this ${own} case, the policy ${m.cost?'adds to or subtracts from perceived private cost':'subtracts from or adds to perceived private benefit'}.</p><p>The original perceived curve stays fixed. The green effective private curve includes the tax or subsidy; <strong>beliefs and actual MSB/MSC remain unchanged</strong>. The corrective intervention is a <strong>${m.qe>50?'tax':'subsidy'}</strong>. Too much correction can move consumption past Q<sub>s</sub>, creating DWL on the other side; the wrong intervention makes the initial failure worse.</p><p>Tax revenue and subsidy expenditure are optional transfer areas, hidden by default. They are not included in the DWL calculation.</p>`;
 $('explanation').innerHTML=explanation;
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
for(const id of ['dwl','gap','fiscal-area'])$(id).addEventListener('change',render);
for(const id of ['correction','fiscal'])$(id).addEventListener('input',render);
$('policy').addEventListener('change',()=>{$('correction').value=0;$('fiscal').value=0;$('fiscal-area').checked=false;render();});
$('case-select').addEventListener('change',()=>{selectedCase=$('case-select').value;$('correction').value=0;$('fiscal').value=0;$('fiscal-area').checked=false;render();});
$('reset').addEventListener('click',()=>{selectedCase='under-mpc';$('policy').value='education';$('correction').value=0;$('fiscal').value=0;$('dwl').checked=true;$('gap').checked=true;$('fiscal-area').checked=false;$('status').textContent='';render();});
render();

})();
