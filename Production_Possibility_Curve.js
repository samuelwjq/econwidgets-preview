'use strict';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg',svg=$('diagram'),drawing=$('drawing');
const C={curve:'#2563eb',old:'#a8bde9',point:'#4169e1',reference:'#6b7280',change:'#dc2626',ink:'#111827',guide:'#9ca3af'};
let mode='points',free={x:35,y:35},k=.85,pointA={x:25,y:25},pointB={x:40,y:40},potA=100,potB=100,growthCase='actual',dragging=false,selectedHandle=1;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),fmt=v=>String(Math.round(v));
const X=q=>90+q/150*380,Y=q=>410-q/150*380;
function frontier(x,a=100,b=100){const u=x/a;if(u<0||u>1)return 0;const power=1+(k/.85);return b*Math.pow(Math.max(0,1-Math.pow(u,power)),1/power);}
function potential(){return mode==='growth'&&growthCase==='potential';}
function point(){return mode==='points'?{...free}:{...pointB};}
function boundPoint(x,y){x=clamp(x,0,100);const top=frontier(x);y=clamp(y,0,top);if(Math.abs(Y(y)-Y(top))<8)y=top;return {x,y};}
function frontierPosition(q){const power=1+(k/.85);return Math.pow(Math.pow(q.x/100,power)+Math.pow(q.y/100,power),1/power);}
function transition(){const dx=pointB.x-pointA.x,dy=pointB.y-pointA.y,eps=.05;
if(Math.abs(dx)<eps&&Math.abs(dy)<eps)return {type:'none',heading:'No Change In Output',growth:'No change'};
if(classification(pointA,100,100)==='frontier'&&classification(pointB,100,100)==='frontier')return {type:'reallocation',heading:'Pure Reallocation',growth:'No actual growth demonstrated'};
const movement=frontierPosition(pointB)-frontierPosition(pointA);
if(movement>.0005)return {type:'positive',heading:'Actual Growth',growth:'Actual growth'};
if(movement<-.0005)return {type:'negative',heading:'Negative Actual Growth',growth:'Negative actual growth'};
return {type:'mixed',heading:'Reallocation',growth:'No change in distance towards frontier'};}
function classification(p,a,b){if(p.x>a+.01||p.y>b+.01||p.y>frontier(p.x,a,b)+.1)return 'outside';if(Math.abs(p.y-frontier(p.x,a,b))<=.1)return 'frontier';return 'inside';}
function node(tag,attrs={},content){const n=document.createElementNS(NS,tag);for(const [a,v] of Object.entries(attrs))n.setAttribute(a,v);if(content!==undefined)n.textContent=content;drawing.append(n);return n;}
function text(x,y,s,col=C.ink,attrs={}){return node('text',{x,y,fill:col,'text-anchor':'middle',...attrs},s);}
function line(x1,y1,x2,y2,col=C.ink,attrs={}){return node('line',{x1,y1,x2,y2,stroke:col,'stroke-width':1.6,...attrs});}
function tip(n,s){n.dataset.tip=s;const title=document.createElementNS(NS,'title');title.textContent=s;n.append(title);return n;}
function curve(a,b,col,label){let d='';for(let i=0;i<=120;i++){const x=a*i/120;d+=(i?'L':'M')+X(x)+' '+Y(frontier(x,a,b))+' ';}tip(node('path',{d,fill:'none',stroke:col,'stroke-width':2}),label+': maximum attainable output combinations.');text(X(a*.82)+8,Y(frontier(a*.82,a,b))-14,label,col,{'text-anchor':'start'});}
function guides(p,label,col){line(X(p.x),Y(p.y),X(p.x),410,C.guide,{'stroke-width':.9,'stroke-dasharray':'4 4'});line(90,Y(p.y),X(p.x),Y(p.y),C.guide,{'stroke-width':.9,'stroke-dasharray':'4 4'});text(X(p.x),435,fmt(p.x),col);text(78,Y(p.y)+4,fmt(p.y),col,{'text-anchor':'end'});}
function arrow(x1,y1,x2,y2,label){if(Math.hypot(x2-x1,y2-y1)<1)return;line(x1,y1,x2,y2,C.change,{'marker-end':'url(#change-arrow)','stroke-width':1.4});if(label)tip(text((x1+x2)/2,(y1+y2)/2-9,label,C.change),label);}
function render(){EconDiagramPresentation.resetPresentation(svg);hideTip();drawing.replaceChildren();const a=potential()?potA:100,b=potential()?potB:100,p=point(),status=classification(p,a,b),change=transition();
line(90,410,470,410,C.ink,{'marker-end':'url(#axis-arrow)'});line(90,410,90,30,C.ink,{'marker-end':'url(#axis-arrow)'});text(350,480,'Quantity of Good X');text(18,227,'Quantity of Good Y',C.ink,{transform:'rotate(-90 18 227)'});text(78,434,'0');
const shifted=potential()&&(Math.abs(a-100)>.05||Math.abs(b-100)>.05);if(shifted)curve(100,100,C.old,'PPC₀');curve(a,b,C.curve,shifted?'PPC₁':'PPC');text(X(a),435,fmt(a),C.curve);text(78,Y(b)+4,fmt(b),C.curve,{'text-anchor':'end'});
const active=$('active-point'),startEl=$('start-point');active.style.display=potential()?'none':'';startEl.style.display=mode==='growth'&&!potential()?'':'none';$('capacity-handles').style.display=potential()?'':'none';
if(!potential()){
if(mode==='growth'){const dist=Math.hypot(pointA.x-p.x,pointA.y-p.y);if(dist>.1){guides(pointA,'A',C.reference);text(X(pointA.x)-12,Y(pointA.y)+21,`A (${fmt(pointA.x)}, ${fmt(pointA.y)})`,C.reference,{'text-anchor':'end'});if(change.type==='reallocation'){let d='';const samples=60;for(let i=0;i<=samples;i++){const x=i===samples?p.x:pointA.x+(p.x-pointA.x)*(i/samples);d+=(i?'L':'M')+X(x)+' '+Y(frontier(x))+' ';}tip(node('path',{d,fill:'none',stroke:C.change,'stroke-width':2.4,'marker-end':'url(#change-arrow)'}),'A → B along the same PPC: pure reallocation.');}else arrow(X(pointA.x),Y(pointA.y),X(p.x),Y(p.y));}else text(X(p.x)-12,Y(p.y)+22,'A = B',C.reference,{'text-anchor':'end'});
startEl.setAttribute('transform',`translate(${X(pointA.x)} ${Y(pointA.y)})`);startEl.setAttribute('aria-valuenow',fmt(pointA.x));startEl.setAttribute('aria-valuetext',`A: X ${fmt(pointA.x)}, Y ${fmt(pointA.y)}. Initial output; drag to change.`);startEl.dataset.tip='A is the initial output. The change is always measured from A to B.';}
guides(p,mode==='points'?'A':'B',C.point);const label=mode==='points'?'A':'B';active.setAttribute('transform',`translate(${X(p.x)} ${Y(p.y)})`);active.setAttribute('aria-valuenow',fmt(p.x));active.setAttribute('aria-valuetext',`${label}: X ${fmt(p.x)}, Y ${fmt(p.y)}.`);active.setAttribute('aria-label',`Production point ${label}; arrow keys adjust output`);active.dataset.tip=label+': output combination ('+fmt(p.x)+', '+fmt(p.y)+').';text(X(p.x)+(p.x<115?12:-12),Y(p.y)-15,`${label} (${fmt(p.x)}, ${fmt(p.y)})`,C.point,{'text-anchor':p.x<115?'start':'end'});}
else{for(let i=0;i<3;i++){const u=i/2,q={x:a*u,y:frontier(a*u,a,b)},h=$('capacity-handle-'+i);h.setAttribute('transform',`translate(${X(q.x)} ${Y(q.y)})`);h.setAttribute('aria-valuenow',i===0?fmt(b):fmt(a));h.setAttribute('aria-valuetext',`PPC capacity handle: X ${fmt(q.x)}, Y ${fmt(q.y)}. Drag outwards to expand or inwards to contract.`);}
const u=selectedHandle/2,q={x:a*u,y:frontier(a*u,a,b)};guides(q,'Capacity',C.point);if(shifted){const old={x:100*u,y:frontier(100*u)};arrow(X(old.x),Y(old.y),X(q.x),Y(q.y));}}
$('curve-key').innerHTML='<span><i style="border-color:'+C.curve+'"></i>Current PPC</span>'+(shifted?'<span><i style="border-color:'+C.old+'"></i>Initial PPC₀</span>':'')+'<span>Coordinates: (X, Y) · Rounded to whole units</span>'+(mode==='points'?'<span>Drag A · Arrow keys also move the point · Drag near the PPC to snap onto it.</span>':potential()?'<span>Hollow circles: draggable capacity handles.</span>':'<span>Direction of change: A → B · Grey A: initial · Blue B: final</span>');
const messages={inside:['Attainable · Productively inefficient','More of at least one good is possible without sacrificing the other.'],frontier:['Attainable · Productively efficient','More of one good requires sacrificing the other.'],outside:['Currently unattainable','Beyond available resources and the present state of technology.']};const position=status==='frontier'?'On PPC':status==='inside'?'Inside PPC':'Outside PPC';let outcome=[position,...messages[status]],explanation,model;const tradeoff=k===0?'Along a straight PPC, equal increases in X require equal sacrifices of Y.':'With a PPC concave to the origin, producing more X requires sacrificing ever-increasing amounts of Y.';const dir=d=>Math.abs(d)<.05?'No change':d>0?'Increases':'Decreases';
if(mode==='points'){explanation=messages[status][1]+' Output combinations on or inside the PPC are attainable. '+(status==='frontier'?tradeoff+' ':'')+'Being on the PPC establishes productive efficiency; it does not establish allocative efficiency.';model='Available resources and the state of technology are fixed for a given PPC. Coordinates are rounded to whole units; precise values determine the point’s classification. '+tradeoff;}
else if(potential()){const dx=a-100,dy=b-100,eps=.05;const kind=Math.abs(dx)<eps&&Math.abs(dy)<eps?'none':dx>=-eps&&dy>=-eps?'expansion':dx<=eps&&dy<=eps?'contraction':'mixed';
outcome=[kind==='expansion'?'Potential Growth':kind==='contraction'?'Potential Contraction':kind==='mixed'?'Mixed Capacity Changes':'No Capacity Change',kind==='expansion'?'PPC shifts outwards':kind==='contraction'?'PPC shifts inwards':kind==='mixed'?'One capacity increases while the other decreases':'Drag a handle to change the frontier','Changing capacity does not automatically change actual output.'];explanation='Outward movement of the PPC represents greater productive capacity; inward movement represents reduced capacity. End handles change the maximum output of one good. The middle handle scales capacity for both goods together. The lighter PPC₀ remains the initial reference.';model='Drag the middle handle away from the origin to expand or towards it to contract; movement is projected onto the handle’s ray from the origin. The smooth PPC shape is preserved. Capacity intercepts range from 40 to 140 illustrative units. Actual output is not specified in this case.';}
else{const pos=q=>classification(q,100,100)==='frontier'?'On PPC':'Inside PPC';
const sub={none:'A and B show the same output combination',positive:'A → B moves closer to or onto the PPC',negative:'A → B moves towards the origin',reallocation:'Both points on the same PPC · Productively efficient',mixed:'Output mix changes without moving closer to the PPC'};outcome=[change.heading,sub[change.type],'Same PPC · Direction of change: A → B'];
const details={none:'A and B coincide, so there is no output change.',positive:'An increase in the real output of a country is represented here by a movement from A inside the PPC to B closer to or on the PPC, with available resources and the state of technology unchanged.',negative:'A movement from A to B towards the origin is labelled negative actual growth here. Productive capacity remains unchanged.',reallocation:'A and B are both on the same PPC. The move changes the output mix: producing more of one good requires sacrificing the other. It illustrates pure reallocation rather than an expansion in capacity.',mixed:'The output mix changes without moving closer to or further from the frontier. This is labelled reallocation.'};explanation=details[change.type]+' The comparison always runs from A to B; either point can be moved.';model='A and B are attainable output combinations. The change is always A → B: towards the PPC shows actual growth; towards the origin shows negative actual growth. Both on the PPC shows pure reallocation. This is a simplified resource-utilisation illustration, not a calculation of real output. '+tradeoff;}
$('result').textContent=outcome.join('. ');$('model-note').textContent=model;$('diagram-desc').textContent=outcome.join('. ')+'. '+explanation;
for(const c of ['actual','potential']){$(c+'-controls').hidden=growthCase!==c;$('case-'+c).setAttribute('aria-pressed',String(growthCase===c));}
window.widgetState={mode,k,point:p,status,a,b,growthCase,pointA:{...pointA},pointB:{...pointB},transition:change.type};PPCPresentation.rendered();}
function switchMode(next){mode=next;for(const m of ['points','growth']){$('panel-'+m).hidden=m!==mode;$('tab-'+m).setAttribute('aria-selected',String(m===mode));$('tab-'+m).tabIndex=m===mode?0:-1;}render();}
for(const m of ['points','growth']){$('tab-'+m).onclick=()=>switchMode(m);$('tab-'+m).onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'points':e.key==='End'?'growth':m==='points'?'growth':'points';switchMode(next);$('tab-'+next).focus();}};}
for(const c of ['actual','potential'])$('case-'+c).onclick=()=>{growthCase=c;render();};
$('curvature').oninput=()=>{const aOn=classification(pointA,100,100)==='frontier',bOn=classification(pointB,100,100)==='frontier';k=+$('curvature').value/100;pointA=aOn?{x:pointA.x,y:frontier(pointA.x)}:boundPoint(pointA.x,pointA.y);pointB=bOn?{x:pointB.x,y:frontier(pointB.x)}:boundPoint(pointB.x,pointB.y);render();};
function movePoint(x,y,target='B'){if(potential())return;if(mode==='growth'){if(target==='A')pointA=boundPoint(x,y);else pointB=boundPoint(x,y);}else{free={x:clamp(x,0,140),y:clamp(y,0,140)};const edge=frontier(free.x);if(free.x<=100&&Math.abs(Y(free.y)-Y(edge))<8)free.y=edge;}render();}
function pointerCoords(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const pos=p.matrixTransform((document.getElementById('queue-stage')?.getScreenCTM()||svg.getScreenCTM()).inverse());return {x:(pos.x-90)/380*150,y:(410-pos.y)/380*150};}
function bindPoint(el,target){el.onpointerdown=e=>{if(potential())return;e.preventDefault();hideTip();dragging=true;el.setPointerCapture(e.pointerId);};el.onpointermove=e=>{if(dragging){const q=pointerCoords(e);movePoint(q.x,q.y,target);}};el.onpointerup=e=>{if(dragging){const q=pointerCoords(e);movePoint(q.x,q.y,target);dragging=false;el.releasePointerCapture(e.pointerId);}};el.onpointercancel=()=>dragging=false;el.onkeydown=e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)||potential())return;e.preventDefault();const p=mode==='points'?free:target==='A'?pointA:pointB,s=e.shiftKey?5:1;movePoint(p.x+(e.key==='ArrowRight'?s:e.key==='ArrowLeft'?-s:0),p.y+(e.key==='ArrowUp'?s:e.key==='ArrowDown'?-s:0),target);};}
bindPoint($('active-point'),'B');bindPoint($('start-point'),'A');
function adjustCapacity(index,q,base){selectedHandle=index;if(index===0)potB=clamp(q.y,40,140);else if(index===2)potA=clamp(q.x,40,140);else{const scale=clamp((q.x*base.x+q.y*base.y)/(base.x*base.x+base.y*base.y),Math.max(40/base.a,40/base.b),Math.min(140/base.a,140/base.b));potA=base.a*scale;potB=base.b*scale;}render();}
for(let i=0;i<3;i++){const h=document.createElementNS(NS,'g');h.id='capacity-handle-'+i;h.setAttribute('class','draggable');h.setAttribute('tabindex','0');h.setAttribute('role','slider');h.setAttribute('aria-label',i===0?'Y productive capacity':i===2?'X productive capacity':'Productive capacity for both goods');h.setAttribute('aria-valuemin','40');h.setAttribute('aria-valuemax','140');h.innerHTML='<circle class="point-ring" r="17"/><circle r="6" fill="#fff" stroke="#2563eb" stroke-width="2" pointer-events="none"/>';$('capacity-handles').append(h);let base;
function captureBase(){const u=i/2;return {a:potA,b:potB,x:potA*u,y:frontier(potA*u,potA,potB)};}
h.onpointerdown=e=>{e.preventDefault();hideTip();dragging=true;selectedHandle=i;base=captureBase();h.setPointerCapture(e.pointerId);};h.onpointermove=e=>{if(dragging&&base)adjustCapacity(i,pointerCoords(e),base);};h.onpointerup=e=>{if(base){adjustCapacity(i,pointerCoords(e),base);dragging=false;base=null;h.releasePointerCapture(e.pointerId);}};h.onpointercancel=()=>{dragging=false;base=null;};h.onkeydown=e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();base=captureBase();const delta=(e.key==='ArrowUp'||e.key==='ArrowRight'?1:-1)*(e.shiftKey?5:1);const q={x:base.x,y:base.y};if(i===0)q.y+=delta;else if(i===2)q.x+=delta;else{q.x*=1+delta/100;q.y*=1+delta/100;}adjustCapacity(i,q,base);base=null;};}
function hideTip(){$('tooltip').hidden=true;}
function showTip(n,e){if(!$('tooltips').checked||!n||dragging)return;const el=$('tooltip');el.textContent=n.dataset.tip;el.hidden=false;if(innerWidth>900){const r=n.getBoundingClientRect();el.style.left=clamp(e?.clientX??r.left,12,innerWidth-el.offsetWidth-12)+'px';el.style.top=clamp((e?.clientY??r.top)+15,12,innerHeight-el.offsetHeight-12)+'px';}}
svg.addEventListener('pointerover',e=>{if(e.pointerType==='mouse')showTip(e.target.closest('[data-tip]'),e);});svg.addEventListener('pointerout',hideTip);svg.addEventListener('click',e=>showTip(e.target.closest('[data-tip]'),e));svg.addEventListener('focusin',e=>showTip(e.target.closest('[data-tip]')));svg.addEventListener('focusout',hideTip);document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTip();});document.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-tip]'))hideTip();});
$('tooltips').oninput=render;
$('zoom').onclick=()=>{const on=$('frame').classList.toggle('zoomed');$('zoom').textContent=on?'Fit diagram':'Enlarge diagram';$('zoom').setAttribute('aria-pressed',String(on));};
$('reset').onclick=()=>{free={x:35,y:35};k=.85;pointA={x:25,y:25};pointB={x:40,y:40};potA=100;potB=100;growthCase='actual';selectedHandle=1;$('curvature').value=85;$('tooltips').checked=true;$('image-style').value='colour';$('frame').classList.remove('zoomed');$('zoom').textContent='Enlarge diagram';$('zoom').setAttribute('aria-pressed','false');$('export-status').textContent='';document.querySelectorAll('details').forEach(n=>n.open=false);render();};
render();

(()=>{const frame=document.getElementById("frame"),controls=document.querySelector(".controls"),visible=e=>!!e&&getComputedStyle(e).display!=="none"&&e.getClientRects().length>0;
 // Unified Explanations: Hover Preview, Tap/Click/Keyboard Pin, Explicit Dismissal.
 const tip=document.getElementById('diagram-tooltip')||document.getElementById('tooltip');
 tip.classList.add('ui-tooltip');tip.setAttribute('role','note');tip.setAttribute('aria-live','polite');
 frame.after(tip);
 let pinned=false,activeTarget=null,collecting=false,collected='',timer=null,suppressFocus=false;
 const enabled=()=>!document.querySelector('#tooltips,#toggle-tooltips,#show-tooltips')||document.querySelector('#tooltips,#toggle-tooltips,#show-tooltips').checked;
 function closeTip(returnFocus=false) {
  clearTimeout(timer);pinned=false;window.widgetTipPinned=false;
  const target=activeTarget;if(target)target.removeAttribute('aria-describedby');
  activeTarget=null;tip.hidden=true;tip.dataset.open='false';tip.style.display='none';
  if(returnFocus&&target?.isConnected){suppressFocus=true;target.focus();suppressFocus=false;}
 }
 if(typeof showTooltip==='function')showTooltip=(html)=>{if(collecting)collected=html;};
 if(typeof hideTooltip==='function')hideTooltip=()=>{if(!pinned)closeTip();};
 if(typeof dismissTooltip==='function')dismissTooltip=()=>closeTip();
 // Models Call These When Their State Changes. Pinning Does Not Survive A Redraw.
 if(typeof hideTip==='function')hideTip=()=>closeTip();
 function targetOf(event){return event.target.closest('[data-tip],[data-tooltip-target],.has-tooltip,.touch-target');}
 function message(target) {
  if(target.dataset.tipHtml)return target.dataset.tipHtml;
  if(target.dataset.tip){const span=document.createElement('span');span.textContent=target.dataset.tip;return span.outerHTML;}
  collecting=true;collected='';
  const r=target.getBoundingClientRect();
  target.dispatchEvent(new MouseEvent('mousemove',{bubbles:false,clientX:r.left+r.width/2,clientY:r.top+r.height/2}));
  collecting=false;
  return collected;
 }
 function show(target,pin,event) {
  clearTimeout(timer);if(!enabled()||!target||!visible(target))return;
  if(pinned&&!pin)return;
  const html=message(target);if(!html)return;
  if(activeTarget&&activeTarget!==target)activeTarget.removeAttribute('aria-describedby');
  activeTarget=target;pinned=pin;window.widgetTipPinned=pin;
  tip.dataset.surplus=target.id==='cs-area'?'cs':target.id==='ps-area'?'ps':'';
  tip.innerHTML='<button type="button" class="tooltip-close" aria-label="Close Explanation">×</button><div class="ui-tooltip-content">'+html+'</div><span class="ui-tooltip-state">'+(pin?'Pinned Explanation':'Tap Or Press Enter To Pin')+'</span>';
  tip.querySelector('button').onclick=()=>closeTip(true);
  tip.hidden=false;tip.style.display='block';tip.dataset.open='true';
  target.setAttribute('aria-describedby',tip.id);
  if(innerWidth>900) {
   const r=target.getBoundingClientRect(),box=tip.getBoundingClientRect();
   tip.style.left=Math.max(12,Math.min(event?.clientX??r.left,innerWidth-box.width-12))+'px';
   tip.style.top=Math.max(12,Math.min((event?.clientY??r.bottom)+12,innerHeight-box.height-12))+'px';
  }
 }
 for(const type of ['pointerover','pointerout','click','focusin','focusout','keydown'])svg.addEventListener(type,e=>{
  const target=targetOf(e);if(!target)return;
  // Retain PPC Dragging And Arrow-Key Movement.
  if(type==='keydown'&&!['Enter',' ','Escape'].includes(e.key))return;
  e.stopImmediatePropagation();
  if(type==='pointerover'&&e.pointerType==='mouse')show(target,false,e);
  if(type==='pointerout'&&e.pointerType==='mouse'&&!pinned&&!tip.contains(e.relatedTarget))timer=setTimeout(()=>closeTip(),160);
  if(type==='click')show(target,true,e);
  if(type==='focusin'&&!suppressFocus)show(target,true);
  if(type==='focusout'&&!pinned&&!tip.contains(e.relatedTarget))closeTip();
  if(type==='keydown') { e.preventDefault();if(e.key==='Escape')closeTip(true);else show(target,true); }
 },true);
 tip.addEventListener('pointerenter',()=>clearTimeout(timer));
 tip.addEventListener('pointerleave',()=>{if(!pinned)timer=setTimeout(()=>closeTip(),160);});
 document.addEventListener('pointerdown',e=>{if(!tip.contains(e.target)&&!e.target.closest('[data-tip],[data-tooltip-target],.has-tooltip,.touch-target'))closeTip();},true);
 controls?.addEventListener('input',()=>closeTip(),true);controls?.addEventListener('change',()=>closeTip(),true);
 svg.addEventListener('pointerdown',e=>{if(e.target.closest('.draggable'))closeTip();},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&tip.dataset.open==='true'){e.stopImmediatePropagation();e.preventDefault();closeTip(true);}},true);
 window.addEventListener('resize',()=>closeTip());


PPCPresentation.closeExplanation=closeTip;})();
