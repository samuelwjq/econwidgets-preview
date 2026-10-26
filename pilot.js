/* Shared presentation bridge for migrated widgets. Model calculations remain local. */
(()=>{'use strict';
 const NS='http://www.w3.org/2000/svg',P=EconDiagramPresentation,C=EconDiagramConfig;
 let pending=false,running=false,entries=[],slot,summaryStrip;
 const visible=e=>{for(let n=e;n&&n.nodeType===1;n=n.parentElement)if(n.hidden||getComputedStyle(n).display==='none'||getComputedStyle(n).visibility==='hidden')return false;return !e.closest('defs')&&e.getClientRects().length>0;};
 const rootPoint=(svg,e,x,y)=>new DOMPoint(x,y).matrixTransform(svg.getScreenCTM().inverse().multiply(e.getScreenCTM()));
 function position(svg,e,x,y){const p=new DOMPoint(x,y).matrixTransform(e.getScreenCTM().inverse().multiply(svg.getScreenCTM()));e.setAttribute('x',p.x);e.setAttribute('y',p.y);}
 function chrome(){
  const mapping={'.widget-header':'ew-header','.layout':'ew-layout','.main-content':'ew-main','.sidebar':'ew-glossary','.controls':'ew-controls','.diagram-frame':'ew-diagram-frame','.control-row,.control-group,.policy-selector,.slider-card,.shift-choice':'ew-control-group','.scale-label':'ew-scale-label','.toggle-grid,.option-row,.checkbox-group':'ew-options','.ui-teaching-disclosure':'ew-disclosure','.ui-expand-hint':'ew-expand-hint','.summary-table,.outcomes':'ew-table','.summary-wrap':'ew-table-wrap','.mechanism,.policy-note,.model-note':'ew-explanation','.diagram-help':'ew-help','.related-widget':'ew-nav'};
  for(const [q,c]of Object.entries(mapping))document.querySelectorAll(q).forEach(e=>e.classList.add(c));
  const controls=document.querySelector('.controls'),layout=document.querySelector('.layout');if(controls&&layout&&controls.parentNode!==layout.parentNode)layout.before(controls);
  for(const output of document.querySelectorAll('.controls .shift-output')){if(!output.hidden)output.hidden=true;output.setAttribute('aria-hidden','true');}
 }
 function alignMeb(svg){
  // A vertical external-benefit arrow spans the two curves at its own x.
  // Source heights had been measured at Qe while the arrow was shifted left.
  const scope=svg.querySelector('#free-scene')||svg,benefit=scope.querySelector('#curve-mpb,line.line-mpb'),social=scope.querySelector('#curve-msb,line.line-msb');
  if(!benefit||!social)return;
  const atX=(line,x)=>{const x1=+line.getAttribute('x1'),x2=+line.getAttribute('x2'),y1=+line.getAttribute('y1'),y2=+line.getAttribute('y2');return y1+(x-x1)*(y2-y1)/(x2-x1);};
  if(!svg.querySelector('#ew-meb-start')){const defs=svg.querySelector('defs');for(const[id,d,ref]of[['ew-meb-start','M10,1 L0,5 L10,9 Z',0],['ew-meb-end','M0,1 L10,5 L0,9 Z',10]]){const marker=document.createElementNS(NS,'marker');for(const[k,v]of Object.entries({id,viewBox:'0 0 10 10',refX:ref,refY:5,markerWidth:5,markerHeight:5,orient:'auto'}))marker.setAttribute(k,v);const shape=document.createElementNS(NS,'path');shape.setAttribute('d',d);shape.setAttribute('fill','#67717e');marker.append(shape);defs.append(marker);}}
  for(const arrow of scope.querySelectorAll('#arrow-meb,.free-externality')){if(!visible(arrow))continue;const x=+arrow.getAttribute('x1');arrow.setAttribute('y1',atX(benefit,x));arrow.setAttribute('y2',atX(social,x));arrow.setAttribute('marker-start','url(#ew-meb-start)');arrow.setAttribute('marker-end','url(#ew-meb-end)');}
 }
 function legacyCurveGeometry(svg){
  const drawing=svg.querySelector('#drawing');
  if(drawing){
   // Keep existing welfare polygons inside the same visible plot as their curves.
   if(!svg.querySelector('#ew-welfare-clip')){const defs=svg.querySelector('defs'),clip=document.createElementNS(NS,'clipPath'),rect=document.createElementNS(NS,'rect');clip.id='ew-welfare-clip';clip.setAttribute('clipPathUnits','userSpaceOnUse');for(const[k,v]of Object.entries({x:90,y:30,width:380,height:380}))rect.setAttribute(k,v);clip.append(rect);defs.append(clip);}
   for(const area of drawing.querySelectorAll('#cs-area,#ps-area'))area.setAttribute('clip-path','url(#ew-welfare-clip)');
  }
  // Retained visual square clipping and equal drawn length of the private pair.
  const plot=svg.querySelector('#diagram-plot');if(!plot)return;
  if(!plot.querySelector('#ew-square-clip')){const defs=document.createElementNS(NS,'defs');defs.innerHTML='<clipPath id="ew-square-clip"><rect x="70" y="25" width="355" height="355"/></clipPath>';plot.prepend(defs);}
  for(const e of plot.querySelectorAll('polygon.dwl-poly,polygon.ban-free-area,polygon#dwl,polygon#area-dwl,polygon#area-tax-rev'))e.setAttribute('clip-path','url(#ew-square-clip)');
  for(const e of plot.querySelectorAll('line.line-mpb,line.line-mpc,line.line-msb,line.line-msc,line.line-policy,line.line-tax,line.line-qpoll,line.line-rd,line.line-edu')){
   if(!visible(e))continue;const a={x:+e.getAttribute('x1'),y:+e.getAttribute('y1')},d={x:+e.getAttribute('x2')-a.x,y:+e.getAttribute('y2')-a.y};if(Math.hypot(d.x,d.y)<.01)continue;let lo=-1e6,hi=1e6;
   for(const[v,delta,min,max]of[[a.x,d.x,70,425],[a.y,d.y,25,380]]){if(Math.abs(delta)<1e-8){if(v<min-.01||v>max+.01){lo=1;hi=0;}continue;}const t1=(min-v)/delta,t2=(max-v)/delta;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));}if(lo>hi)continue;
   for(const[k,v]of Object.entries({x1:a.x+lo*d.x,y1:a.y+lo*d.y,x2:a.x+hi*d.x,y2:a.y+hi*d.y}))e.setAttribute(k,v);
  }
  for(const scope of[plot,svg.querySelector('#free-scene')].filter(Boolean)){const pair=['mpb','mpc'].map(k=>[...scope.querySelectorAll('line.line-'+k)].find(visible));if(pair.some(e=>!e))continue;const length=e=>Math.hypot(+e.getAttribute('x2')-+e.getAttribute('x1'),+e.getAttribute('y2')-+e.getAttribute('y1')),target=Math.min(...pair.map(length));for(const e of pair){const n=length(e);if(n<=target+.01)continue;const t=target/n;e.setAttribute('x2',+e.getAttribute('x1')+t*(+e.getAttribute('x2')-+e.getAttribute('x1')));e.setAttribute('y2',+e.getAttribute('y1')+t*(+e.getAttribute('y2')-+e.getAttribute('y1')));}}
 }
 const areaIds={'dwl':['Deadweight loss','social'],'area-dwl':['Deadweight loss','social'],'free-policy-loss':['Free-provision DWL','social'],'free-market-loss':['Free-market DWL','other'],'subsidy-cost-rect':['Subsidy expenditure','policy'],'cs-area':['Consumer surplus','cs'],'ps-area':['Producer surplus','ps']};
 function summaryText(svg){
  if(!svg.querySelector('#diagram-plot')){
   const direction=(v,label)=>v==='Increases'?label+' Increases':v==='Decreases'?label+' Decreases':label+' Unchanged';
   if(document.body.classList.contains('ew-elasticity')){
    const s=window.widgetState;if(!s)return '';
    const d=v=>Math.abs(v)<1e-8?'Unchanged':v>0?'Increases':'Decreases',parts=[],ped=!!document.querySelector('label[for="elasticity"]')?.textContent.includes('PED'),priceTopic=!!document.getElementById('tr'),shift=priceTopic?s.shock:s.delta;
    if(Math.abs(shift)>1e-8)parts.push(direction(d(shift),ped?'Supply':'Demand'));
    const classification=document.getElementById('elasticity-label')?.textContent.trim();if(classification)parts.push(classification);
    return [...parts,direction(d(s.p-50),'Price'),direction(d(s.q-50),'Qty')].join(' · ');
   }
   const state=window.currentState||{},shifts=[];
   if(state.step===1)return '';
   if(state.step||document.getElementById('magnitude')||document.getElementById('d-shift'))for(const[key,label]of[['d','Demand'],['s','Supply']])if(state[key])shifts.push(label+(state[key]>0?' Increases':' Decreases'));
   if(state.step&&state.step<6)return shifts.join(' · ');
   return [...shifts,direction(state.priceChange,'Price'),direction(state.quantityChange,'Qty')].join(' · ');
  }
  const policy=document.getElementById('policy-select')?.value||'none';
  if(policy==='joint_provision'){const line=svg.querySelector('#line-qpol'),base=svg.querySelector('#line-qe'),current=line&&line.style.display!=='none'&&line.hasAttribute('x1')?Number(line.getAttribute('x1')):NaN,initial=Number(base?.getAttribute('x1')),qty=Number.isFinite(current)?current:initial;const q=qty>initial+.05?'Total Qty Increases':qty<initial-.05?'Total Qty Decreases':'Total Qty Unchanged';return q+' · '+(Math.abs(qty-initial)>.05?'DWL Decreases':'DWL Unchanged');}
  if(policy==='free_provision'&&window.currentFreeModel){const m=window.currentFreeModel,delta=m.freeLoss-m.marketLoss;return 'Total Qty Increases · DWL '+(Math.abs(delta)<1e-7?'Unchanged':delta<0?'Decreases':'Increases');}
  const base=svg.querySelector('#line-qe'),opt=svg.querySelector('#line-qs'),policyLine=svg.querySelector('#line-qpol'),baseX=+base?.getAttribute('x1'),optX=+opt?.getAttribute('x1'),currentX=policy==='none'||!policyLine||policyLine.style.display==='none'?baseX:+policyLine.getAttribute('x1');
  if(!Number.isFinite(baseX)||!Number.isFinite(optX)||!Number.isFinite(currentX))return 'Diagram summary unavailable';
  const q=currentX>baseX+.05?'Qty Increases':currentX<baseX-.05?'Qty Decreases':'Qty Unchanged',before=Math.abs(baseX-optX),after=Math.abs(currentX-optX),welfare=Math.abs(after-before)<.05?'DWL Unchanged':after<.05?'DWL Eliminated':after<before?'DWL Decreases':'DWL Increases';return q+' · '+welfare;
 }
 function updateSummary(svg){const frame=svg.closest('.diagram-frame');if(!summaryStrip){summaryStrip=document.querySelector('.ew-summary-strip');if(!summaryStrip){summaryStrip=document.createElement('div');summaryStrip.className='ew-summary-strip';}summaryStrip.setAttribute('role','group');summaryStrip.setAttribute('aria-label','Diagram summary');}if(summaryStrip.parentElement!==frame)frame.prepend(summaryStrip);summaryStrip.textContent=summaryText(svg);}
 function legend(svg){
  if(!slot){slot=document.createElement('div');slot.className='ew-legend-slot';slot.setAttribute('aria-label','Shaded areas: colour and grayscale patterns');svg.closest('.diagram-frame').append(slot);}
  entries=[];
  for(const e of svg.querySelectorAll('polygon,rect,path')){if(!visible(e))continue;const b=e.getBBox();if(b.width<.01||b.height<.01)continue;let info=areaIds[e.id];if(!info&&['price','quantity'].includes(e.dataset.area))info=[e.dataset.area==='price'?'Price effect':'Quantity effect',e.dataset.area];if(!info&&e.matches('.subsidy-rect'))info=['Subsidy expenditure','policy'];if(!info||entries.some(x=>x.label===info[0]))continue;entries.push({label:info[0],kind:info[1],colour:getComputedStyle(e).fill});}
  const key=JSON.stringify(entries);if(slot.dataset.entries===key)return;slot.dataset.entries=key;slot.replaceChildren();for(const e of entries){const item=document.createElement('span');item.className='ew-legend-entry';const colour=document.createElement('i'),pattern=document.createElement('i');colour.className='ew-legend-swatch';colour.style.background=e.colour;pattern.className='ew-legend-swatch ew-pattern-'+e.kind;colour.setAttribute('aria-hidden','true');pattern.setAttribute('aria-hidden','true');item.append(colour,pattern,document.createTextNode(e.label));slot.append(item);}
 }
 function refresh(){
  const svg=document.getElementById('diagram');if(running||!svg?.getScreenCTM())return;
  running=true;try{
   P.resetPresentation(svg);chrome();legacyCurveGeometry(svg);alignMeb(svg);
   if(svg.querySelector('#diagram-plot')){
    svg.classList.add('ew-policy-context');
    for(const e of svg.querySelectorAll('.line-mpb,.line-mpc,.line-msb,.line-msc'))e.style.stroke='#374151';
    for(const e of svg.querySelectorAll('#label-mpb,#label-mpc,#label-msb,#label-msc,#free-scene text'))if(/^(?:MPB|MPC|MSB|MSC)/.test(e.textContent)&&!/^MPC\*/.test(e.textContent))e.style.fill='#374151';
    for(const e of svg.querySelectorAll('#arrow-meb,.free-externality'))e.style.stroke='#67717e';
    for(const e of svg.querySelectorAll('#label-meb'))e.style.fill='#374151';
    for(const e of svg.querySelectorAll('#label-policy-curve,#label-policy-arrow'))e.style.fill='#4169e1';
    for(const e of svg.querySelectorAll('#free-scene text'))if(/^MPC\*/.test(e.textContent))e.style.fill='#4169e1';
    const merged=svg.querySelector('#label-msb'),mode=document.getElementById('policy-select')?.value;
    if(merged&&/Subsidy|MPB\*/.test(merged.textContent)&&['direct_subsidy','education'].includes(mode)){svg.querySelector('#curve-msb').style.stroke='#4169e1';merged.style.fill='#4169e1';}
   }
   for(const[id,symbol,suffix]of[['joint-private-label','Q','private'],['joint-price-label','P','joint']]){const e=svg.querySelector('#'+id);if(e&&e.textContent===symbol+suffix)e.innerHTML=symbol+'<tspan baseline-shift="sub">'+suffix+'</tspan>';}
   const texts=[...svg.querySelectorAll('text')].filter(e=>visible(e)&&e.textContent.trim()),labels=[],fixed=[],families=new Map(),segments=[];
   const curves=[...svg.querySelectorAll('line,polyline')].filter(e=>visible(e)&&(e.matches('.line-mpb,.line-mpc,.line-msb,.line-msc,.line-policy,.line-tax,.line-edu')||+e.getAttribute('stroke-width')===2.5));
   const segment=e=>{if(e.localName==='polyline'){const p=e.getAttribute('points').trim().split(/[ ,]+/).map(Number),a=rootPoint(svg,e,p[0],p[1]),b=rootPoint(svg,e,p[p.length-2],p[p.length-1]);return{x1:a.x,y1:a.y,x2:b.x,y2:b.y};}const a=rootPoint(svg,e,+e.getAttribute('x1'),+e.getAttribute('y1')),b=rootPoint(svg,e,+e.getAttribute('x2'),+e.getAttribute('y2'));return{x1:a.x,y1:a.y,x2:b.x,y2:b.y};};
   for(const e of curves)segments.push(segment(e));segments.push({x1:100,y1:50,x2:100,y2:430},{x1:100,y1:430,x2:480,y2:430});
   const gov=!!svg.querySelector('#diagram-plot');
   for(const [i,e]of texts.entries()){
    const plain=e.textContent.trim(),id=e.id||'ew-text-'+i;let role=(['10','11','12'].includes(e.getAttribute('font-size'))?'small':'main'),kind='point',anchorUser,axis,curve,nearSegmentUser,avoidSegmentsUser;
    e.classList.remove('ew-axis-title');
    if(e.matches('.axis-title')||plain==='Price'||(plain==='Quantity'||plain==='Qty')){
     e.classList.add('ew-axis-title');
     if((plain==='Quantity'||plain==='Qty')){e.textContent='Qty';position(svg,e,488,447);e.setAttribute('text-anchor','start');}
     else if(e.querySelectorAll('tspan').length){position(svg,e,88,36);e.setAttribute('text-anchor','end');for(const[t,j]of[...e.querySelectorAll('tspan')].map((t,j)=>[t,j])){const p=new DOMPoint(88,36+j*18).matrixTransform(e.getScreenCTM().inverse().multiply(svg.getScreenCTM()));t.setAttribute('x',p.x);t.setAttribute('y',p.y);t.removeAttribute('dy');}role='small';}
     else{position(svg,e,100,30);e.setAttribute('text-anchor','middle');}e.dataset.ewTextRole=role;fixed.push(e);continue;
    }
    if(/^No price adjustment: equilibrium price is unchanged\.$/i.test(plain)){
     role='small';P.styleText(e,role);const narrow=svg.getBoundingClientRect().width<320;position(svg,e,narrow?220:290,narrow?90:110);e.setAttribute('text-anchor','middle');P.wrapText(e,narrow?plain.match(/^(No Price)( Adjustment:)( Equilibrium Price)( Is Unchanged\.)$/i).slice(1):[plain.slice(0,plain.indexOf(':')+1),plain.slice(plain.indexOf(':')+1,plain.toLowerCase().indexOf(' is ')),plain.slice(plain.toLowerCase().indexOf(' is '))]);
    }
    if(e.dataset.gapLabel){
     const arrow=svg.querySelector('[data-gap-arrow="'+e.dataset.gapLabel+'"]');
     if(arrow&&visible(arrow)){
      const a=segment(arrow),x=(a.x1+a.x2)/2,y=(a.y1+a.y2)/2;
      e.classList.add('ew-fixed-label');e.dataset.ewTextRole='small';e.dataset.ewLabelKind='gap-caption';e.setAttribute('text-anchor','middle');P.styleText(e,'small');position(svg,e,x,y);
      const box=e.getBoundingClientRect(),screen=new DOMPoint(x,y).matrixTransform(svg.getScreenCTM()),dy=(screen.y-6-box.bottom)*600/svg.getBoundingClientRect().width;position(svg,e,x,y+dy);fixed.push(e);continue;
     }
    }
    if(e.dataset.axisKind){axis=e.dataset.axisKind==='q'?'quantity':'price';anchorUser=rootPoint(svg,e,+e.dataset.axisX,+e.dataset.axisY);}
    if(e.dataset.pointX!==undefined){anchorUser=rootPoint(svg,e,+e.dataset.pointX,+e.dataset.pointY);position(svg,e,anchorUser.x+14,anchorUser.y-13);e.setAttribute('text-anchor','start');}
    if(e.hasAttribute('data-curve-label')){
     // Single Shift emits each curve immediately before its own label.
     let n=e.previousElementSibling;while(n&&!curves.includes(n))n=n.previousElementSibling;curve=n;
    }else if(gov&&/^M(?:PB|PC|SB|SC)/.test(plain)){
     const scope=e.closest('#free-scene')||svg;
     if(e.dataset.curveTarget)curve=svg.querySelector('#'+e.dataset.curveTarget);
     if(!curve&&e.id&&e.id!=='label-policy-curve')curve=svg.querySelector('#'+e.id.replace('label-','curve-'));
     if(e.id==='label-policy-curve')curve=svg.querySelector('#line-policy-curve');
     if(!curve&&/^MPC\*/.test(plain))curve=[...scope.querySelectorAll('line.line-policy')].find(visible);
     if(!curve){const k=/^MPB/.test(plain)?'mpb':/^MSB/.test(plain)?'msb':/^MPC/.test(plain)?'mpc':'msc';curve=[...scope.querySelectorAll('line.line-'+k)].find(visible);}
    }
    if(curve&&visible(curve)){
     const s=segment(curve);nearSegmentUser=s;const endpoint=s.x1>s.x2?{x:s.x1,y:s.y1}:{x:s.x2,y:s.y2};anchorUser=endpoint;kind='curve';role=gov?'longEquation':'curve';
     P.styleText(e,role);e.setAttribute('text-anchor','start');const unit=600/svg.getBoundingClientRect().width,b=e.getBBox(),m=e.getScreenCTM(),w=b.width*Math.hypot(m.a,m.b)*unit;
     position(svg,e,Math.max(108,Math.min(endpoint.x+12,592-w-2)),Math.max(66,Math.min(410,endpoint.y+4)));
     const slope=(s.y2-s.y1)/(s.x2-s.x1),key=(e.closest('#free-scene')?.id||'main')+':'+Math.round(slope*1e6);if(Number.isFinite(slope)){if(!families.has(key))families.set(key,[]);families.get(key).push({...s,id});}
    }else if(e.matches('.welfare-label,.area-label,#label-dwl-text,#label-subsidy-cost-text')){e.classList.add('ew-fixed-label');e.dataset.ewTextRole='small';fixed.push(e);continue;}
    else if(/(?:Under|Over)-(?:consumption|production)/i.test(plain)){position(svg,e,290,490);e.setAttribute('text-anchor','middle');role='small';}
    else if(plain==='MEB'){role='small';}
    if(e.id==='label-policy-arrow'&&/^Government output \(Qg\)$/i.test(plain)&&svg.getBoundingClientRect().width<400){P.styleText(e,'small');const html=e.innerHTML,split=html.indexOf(' ');P.wrapText(e,[html.slice(0,split),html.slice(split)]);}
    const mebLabel=gov&&plain==='MEB',annotation=mebLabel?(e.closest('#free-scene')||svg).querySelector('#arrow-meb,.free-externality'):e.id==='label-policy-arrow'?svg.querySelector('#arrow-policy'):null;
    if(annotation&&visible(annotation)){
     const a=segment(annotation);anchorUser={x:(a.x1+a.x2)/2,y:(a.y1+a.y2)/2};
     if(mebLabel||document.getElementById('policy-select')?.value==='direct_subsidy'){
      position(svg,e,anchorUser.x+(mebLabel?8:-8),anchorUser.y);e.setAttribute('text-anchor',mebLabel?'start':'end');e.setAttribute('dominant-baseline','central');
     }
     if(mebLabel||/^(?:Subsidy)$/i.test(plain)){nearSegmentUser=a;avoidSegmentsUser=[a];}
    }
    if(!axis&&!anchorUser){const a=rootPoint(svg,e,+e.getAttribute('x'),+e.getAttribute('y'));anchorUser={x:a.x,y:a.y};}
    labels.push({id,element:e,kind,role,anchorUser,axis,nearSegmentUser,avoidSegmentsUser,maxDistancePx:kind==='curve'?(svg.getBoundingClientRect().width<C.gaps.compactCurveWidthPx?C.gaps.compactCurveProximityPx:C.gaps.curveProximityPx):nearSegmentUser?22:undefined,leader:kind==='curve'?false:axis||e.dataset.pointX!==undefined?undefined:false});
   }
   for(const e of svg.querySelectorAll('circle'))if(visible(e)&&+e.getAttribute('r')<=6)fixed.push(e);
   for(const e of svg.querySelectorAll('#under-arrow,#over-arrow,#arrow-gap,.free-gap-arrow'))if(visible(e)){const p=new DOMPoint(0,470).matrixTransform(e.getScreenCTM().inverse().multiply(svg.getScreenCTM()));e.setAttribute('y1',p.y);e.setAttribute('y2',p.y);}
   for(const e of svg.querySelectorAll('line,polyline')){if(+e.getAttribute('stroke-width')===2.5)e.classList.add('ew-curve');if(e.getAttribute('stroke-dasharray')==='4 4')e.classList.add('ew-coordinate-guide');}
   const result=P.layoutSvg(svg,{labels,fixedElements:fixed,segments,parallelFamilies:[...families].map(([id,segments])=>({id,segments,referenceX:290}))});
   if(result.ok){
    const matrix=svg.getScreenCTM(),inverse=matrix.inverse(),gap=6;
    const price=labels.filter(l=>l.axis==='price').map(l=>l.element.getBoundingClientRect()),qty=labels.filter(l=>l.axis==='quantity').map(l=>l.element.getBoundingClientRect());
    for(const e of svg.querySelectorAll('[data-axis-change]')){
     const local=e.getScreenCTM().inverse();
     if(e.dataset.axisChange==='price'&&price.length){const min=new DOMPoint(C.safeBounds.left,0).matrixTransform(matrix).x,x=Math.max(min,Math.min(...price.map(b=>b.x))-gap),q=new DOMPoint(x,0).matrixTransform(local);e.setAttribute('x1',q.x);e.setAttribute('x2',q.x);}
     if(e.dataset.axisChange==='quantity'&&qty.length){const y=Math.max(...qty.map(b=>b.bottom))+gap,q=new DOMPoint(0,y).matrixTransform(local);e.setAttribute('y1',q.y);e.setAttribute('y2',q.y);}
    }
   }
   updateSummary(svg);legend(svg);window.EconPilot.lastResult=result;
  }finally{running=false;}
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;refresh();});}}
 window.EconPilot={schedule,refresh,chrome,legendEntries:()=>entries,summaryText:()=>summaryStrip?.textContent||''};
 window.addEventListener('resize',()=>{if(innerWidth<=900){const tip=document.getElementById('diagram-tooltip')||document.getElementById('tooltip');tip?.style.removeProperty('left');tip?.style.removeProperty('top');}schedule();});
 document.addEventListener('DOMContentLoaded',()=>{chrome();const svg=document.getElementById('diagram');if(window.ResizeObserver)new ResizeObserver(schedule).observe(svg);document.fonts?.ready.then(schedule);schedule();});
})();
