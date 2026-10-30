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
  const controls=document.querySelector('.controls'),layout=document.querySelector('.layout');if(controls&&layout&&!controls.closest('.ew-fullscreen-stage')&&controls.parentNode!==layout.parentNode)layout.before(controls);
  const banControls=document.getElementById('ban-controls');if(document.body.classList.contains('ew-ne-policy')&&controls&&banControls&&banControls.parentElement!==controls)controls.append(banControls);
  for(const output of document.querySelectorAll('.controls .shift-output')){if(!output.hidden)output.hidden=true;output.setAttribute('aria-hidden','true');}
 }
 function alignMeb(svg){
  // A vertical external-benefit arrow spans the two curves at its own x.
  // Source heights had been measured at Qe while the arrow was shifted left.
  const scope=svg.querySelector('#free-scene')||svg,benefit=scope.querySelector('#curve-mpb,line.line-mpb'),social=scope.querySelector('#curve-msb,line.line-msb');
  const atX=(line,x)=>{const x1=+line.getAttribute('x1'),x2=+line.getAttribute('x2'),y1=+line.getAttribute('y1'),y2=+line.getAttribute('y2');return y1+(x-x1)*(y2-y1)/(x2-x1);};
  if(!svg.querySelector('#ew-meb-start')){const defs=svg.querySelector('defs');for(const[id,d,ref]of[['ew-meb-start','M10,1 L0,5 L10,9 Z',0],['ew-meb-end','M0,1 L10,5 L0,9 Z',10]]){const marker=document.createElementNS(NS,'marker');for(const[k,v]of Object.entries({id,viewBox:'0 0 10 10',refX:ref,refY:5,markerWidth:5,markerHeight:5,orient:'auto'}))marker.setAttribute(k,v);const shape=document.createElementNS(NS,'path');shape.setAttribute('d',d);shape.setAttribute('fill','#dc2626');marker.append(shape);defs.append(marker);}}
  if(!benefit||!social)return;
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
 const originalPolicySegments=new WeakMap();
 function policyCurveLengths(svg){
  const government=document.body.classList.contains('ew-government');
  if(!government&&!document.body.matches('.ew-ne-policy,.ew-pe-policy'))return;
  const read=e=>{if(e.localName==='polyline'){const p=e.getAttribute('points').trim().split(/[ ,]+/).map(Number);return{x1:p[0],y1:p[1],x2:p.at(-2),y2:p.at(-1)};}return Object.fromEntries(['x1','y1','x2','y2'].map(k=>[k,+e.getAttribute(k)]));};
  const curves=[...svg.querySelectorAll('.curve,line.line-mpb,line.line-mpc,line.line-msb,line.line-msc,line.line-policy,line.line-tax,line.line-qpoll,line.line-rd,line.line-edu')].filter(visible),pairs=[];
  if(government){const mode=window.currentGovernmentModel?.policy;if(!['specific','indirect','direct'].includes(mode))return;const policy=curves[2],base=curves[mode==='direct'?0:1];if(policy&&base)pairs.push([policy,base]);}
  else for(const policy of curves.filter(e=>e.matches('.line-policy,.line-tax,.line-qpoll,.line-rd,.line-edu'))){const scope=policy.closest('#free-scene')||svg,negative=policy.matches('.line-qpoll,.line-rd'),s=read(policy),base=scope.querySelector(negative?'#curve-msc':s.y2<s.y1?'#curve-mpc,line.line-mpc':'#curve-mpb,line.line-mpb');if(base)pairs.push([policy,base]);}
  for(const[policy,base]of pairs){
   if(policy.matches('.line-qpoll,.line-rd')){policy.dataset.ewLengthRule='full-plot-boundary';continue;}
   let a=read(policy);if(government){if(!originalPolicySegments.has(policy))originalPolicySegments.set(policy,a);a=originalPolicySegments.get(policy);}const b=read(base),dx=a.x2-a.x1,dy=a.y2-a.y1,length=Math.hypot(dx,dy),bdx=b.x2-b.x1,bdy=b.y2-b.y1;
   if(!length||Math.abs(dx*bdy-dy*bdx)>1e-5*length*Math.hypot(bdx,bdy))continue;
   const target=Math.min(length,Math.hypot(bdx,bdy)),ux=dx/length,uy=dy/length,required=[];
   const toLocal=(e,x,y)=>new DOMPoint(x,y).matrixTransform(policy.getScreenCTM().inverse().multiply(e.getScreenCTM()));
   const protect=p=>{const along=(p.x-a.x1)*ux+(p.y-a.y1)*uy,off=Math.abs((p.x-a.x1)*uy-(p.y-a.y1)*ux);if(off<.05&&along>=-.05&&along<=length+.05)required.push(Math.max(0,Math.min(length,along)));};
   for(const other of curves){if(other===policy)continue;const s=read(other),c=toLocal(other,s.x1,s.y1),d=toLocal(other,s.x2,s.y2),vx=d.x-c.x,vy=d.y-c.y,cross=dx*vy-dy*vx;if(Math.abs(cross)<1e-7)continue;const t=((c.x-a.x1)*vy-(c.y-a.y1)*vx)/cross,u=((c.x-a.x1)*dy-(c.y-a.y1)*dx)/cross;if(t>=0&&t<=1&&u>=0&&u<=1)protect({x:a.x1+t*dx,y:a.y1+t*dy});}
   for(const e of svg.querySelectorAll('circle,polygon,rect,line[marker-start]')){if(!visible(e))continue;if(e.localName==='circle')protect(toLocal(e,+e.getAttribute('cx'),+e.getAttribute('cy')));else if(e.localName==='polygon'){const p=e.getAttribute('points').trim().split(/[ ,]+/).map(Number);for(let i=0;i<p.length;i+=2)protect(toLocal(e,p[i],p[i+1]));}else if(e.localName==='rect'){const x=+e.getAttribute('x'),y=+e.getAttribute('y'),w=+e.getAttribute('width'),h=+e.getAttribute('height');for(const [xx,yy]of[[x,y],[x+w,y],[x,y+h],[x+w,y+h]])protect(toLocal(e,xx,yy));}else{const s=read(e);protect(toLocal(e,s.x1,s.y1));protect(toLocal(e,s.x2,s.y2));}}
   // Axis/visible-boundary intercept is mandatory; shorten only the far end.
   const high=required.length?Math.max(...required):0,pad=required.length?Math.min(4,length-target):0,used=Math.min(length,Math.max(target,high+pad)),start=0;
   const s={x1:a.x1+start*ux,y1:a.y1+start*uy,x2:a.x1+(start+used)*ux,y2:a.y1+(start+used)*uy};
   if(policy.localName==='polyline')policy.setAttribute('points',s.x1+','+s.y1+' '+s.x2+','+s.y2);else for(const[k,v]of Object.entries(s))policy.setAttribute(k,v);
   policy.dataset.ewLengthRule=used>target+.05?'required-geometry-exception':'matched-or-boundary-limited';
  }
 }
 // Read-only teaching summaries: use the rendered outputs, never change models.
 function gapSummary(residual,before,positive,epsilon=1e-7){
  const original=positive?'Under-consumption':'Over-consumption';
  if(Math.abs(residual)<epsilon)return original+' Eliminated';
  if((positive&&residual<0)||(!positive&&residual>0))return (positive?'Over-consumption':'Under-consumption')+' Arises';
  const delta=Math.abs(residual)-before;
  return original+' '+(Math.abs(delta)<epsilon?'Unchanged':delta<0?'Reduced':'Increased');
 }
 function dwlSummary(after,before,epsilon=1e-7){return 'DWL '+(Math.abs(after-before)<epsilon?'Unchanged':after<epsilon?'Eliminated':after<before?'Reduced':'Increased');}
 function policySummary(svg,dir){
  const policy=document.getElementById('policy-select').value,join=parts=>parts.join(' · ');
  if(document.body.classList.contains('ew-ne-policy')){
   if(policy==='ban'){const b=window.currentBanModel;return join(['Output Banned','Qe Decreases',gapSummary(b.qs,Math.abs(b.qs-b.qe),false),dwlSummary(b.banDwl,b.freeDwl)]);}
   const s=window.currentNEModel;if(!s)return '';
   const baseline=s.qs-s.qe,residual=s.activeQs-s.currentQ,amount={tax:'tax-slider',quota:'quota-slider',qpoll:'qpoll-slider',rd:'rd-slider',edu:'edu-slider'}[policy],value=Number(document.getElementById(amount)?.value||0);
   let effect={none:'No Policy',tax:value?'MPC → MPC + Tax':'MPC Unchanged',quota:'Output Quota',qpoll:value?'MSC Shifts Down':'MSC Unchanged',rd:value?'MSC Shifts Down':'MSC Unchanged',edu:value?'MPC → MPC*':'MPC Unchanged'}[policy];
   const quantity=['qpoll','rd'].includes(policy)?dir(s.activeQs-s.qs,'Qs')+'; Qe Unchanged':dir(s.currentQ-s.qe,'Qe');
   return join([effect,quantity,gapSummary(residual,Math.abs(baseline),false),dwlSummary(Math.abs(residual),Math.abs(baseline))]);
  }
  const value=Number(document.getElementById('policy-slider').value),effects={none:'No Policy',indirect_subsidy:value?'MPC → MPC − Subsidy':'MPC Unchanged',direct_subsidy:value?'MPB → MPB + Subsidy':'MPB Unchanged',joint_provision:value?'MPC → MPC*':'MPC Unchanged',education:value?'MPB → MPB*':'MPB Unchanged',free_provision:'MPC → MPC*'};
  if(policy==='free_provision'){
   const m=window.currentFreeModel;if(!m)return '';
   return join([effects[policy],dir(m.qf-m.qe,'Qe'),gapSummary(m.qs-m.qf,Math.abs(m.qs-m.qe),true),dwlSummary(m.freeLoss,m.marketLoss)]);
  }
  const base=svg.querySelector('#line-qe'),opt=svg.querySelector('#line-qs'),line=svg.querySelector('#line-qpol'),initial=+base.getAttribute('x1'),optimal=+opt.getAttribute('x1'),current=policy==='none'||!line||line.style.display==='none'?initial:+line.getAttribute('x1'),before=Math.abs(optimal-initial),after=optimal-current;
  // Joint Provision uses the user's reduced-underproduction assumption; the
  // source deliberately leaves public production costs and welfare undefined.
  if(policy==='joint_provision')return join([effects[policy],dir(current-initial,'Total Qty'),value?'Under-consumption Reduced':'Under-consumption Unchanged',value?'DWL Reduced':'DWL Unchanged']);
  return join([effects[policy],dir(current-initial,'Qe'),gapSummary(after,before,true,.05),dwlSummary(Math.abs(after),before,.05)]);
 }
 function summaryText(svg){
  const dir=(v,label)=>label+' '+(Math.abs(v)<1e-7?'Unchanged':v>0?'Increases':'Decreases');
  if(document.body.classList.contains('ew-government')){const m=window.currentGovernmentModel;if(!m)return '';if(m.policy==='quota'&&m.q<1e-7)return 'Price Not Applicable · Qty Decreases';return dir((m.policy==='direct'?m.pp:m.pc)-50,m.policy==='wage'?'Wage':'Price')+' · '+dir(m.q-50,m.policy==='wage'?'Employment':'Qty');}
  if(document.body.classList.contains('ew-basic-externality')){const positive=!!document.getElementById('meb-slider'),magnitude=Number(document.getElementById(positive?'meb-slider':'mec-slider').value);return EconTopic5Summary.externality({positive,magnitude});}
  if(document.body.matches('.ew-ne-policy,.ew-pe-policy'))return policySummary(svg,dir);
  if(!svg.querySelector('#diagram-plot')){
   const direction=(v,label)=>v==='Increases'?label+' Increases':v==='Decreases'?label+' Decreases':label+' Unchanged';
   if(document.body.classList.contains('ew-elasticity')){
    const s=window.widgetState;if(!s)return '';
    const d=v=>Math.abs(v)<1e-8?'Unchanged':v>0?'Increases':'Decreases',parts=[],label=document.querySelector('label[for="elasticity"]')?.textContent||'',kind=label.includes('PED')?'PED':label.includes('PES')?'PES':label.includes('XED')?'XED':'YED',priceTopic=!!document.getElementById('tr'),shift=priceTopic?s.shock:s.delta;
    if(Math.abs(shift)>1e-8)parts.push(direction(d(shift),kind==='PED'?'Supply':'Demand'));
    const classification=document.getElementById('elasticity-label')?.textContent.trim(),notation=EconElasticityExplanation.notation(kind,s.e),outcomes=[direction(d(s.q-50),'Qty'),direction(d(s.tr1-s.tr0),'TR/TE')];
    const build=(elasticity,price)=>[...parts,elasticity,direction(d(s.p-50),price),...outcomes].filter(Boolean).join(' · ');
    const candidates=[build(classification,'Price'),build(notation,'Price'),build(notation,'P')],ctx=document.createElement('canvas').getContext('2d');ctx.font='600 12px '+getComputedStyle(svg).fontFamily;
    const width=svg.getBoundingClientRect().width-24,rows=Math.floor((innerWidth<=480?C.summary.elasticityCompactHeightPx:C.summary.heightPx)/14);
    const fits=text=>{let count=1,line='';for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>width){count++;line=word;}else line=next;}return count<=rows;};
    return candidates.find(fits)||candidates.at(-1);
   }
   const state=window.currentState||{},shifts=[];
   if(state.step===1)return '';
   if(state.step||document.getElementById('magnitude')||document.getElementById('d-shift'))for(const[key,label]of[['d','Demand'],['s','Supply']])if(state[key])shifts.push(label+(state[key]>0?' Increases':' Decreases'));
   if(state.step&&state.step<6)return shifts.join(' · ');
   return [...shifts,direction(state.priceChange,'Price'),direction(state.quantityChange,'Qty')].join(' · ');
  }
  return '';
 }
 function updateSummary(svg){const frame=svg.closest('.diagram-frame');if(!summaryStrip){summaryStrip=document.querySelector('.ew-summary-strip');if(!summaryStrip){summaryStrip=document.createElement('div');summaryStrip.className='ew-summary-strip';}summaryStrip.setAttribute('role','group');summaryStrip.setAttribute('aria-label','Diagram summary');}if(summaryStrip.parentElement!==frame)frame.prepend(summaryStrip);summaryStrip.textContent=summaryText(svg);}
 function legend(svg){
  if(!slot){slot=document.createElement('div');slot.className='ew-legend-slot';slot.setAttribute('aria-label','Shaded areas: colour and grayscale patterns');svg.closest('.diagram-frame').append(slot);}
  entries=[];
  for(const e of svg.querySelectorAll('polygon,rect,path')){if(!visible(e))continue;const b=e.getBBox();if(b.width<.01||b.height<.01)continue;let info=areaIds[e.id];if(!info&&['price','quantity'].includes(e.dataset.area))info=[e.dataset.area==='price'?'Price effect':'Quantity effect',e.dataset.area];if(!info&&document.body.classList.contains('ew-government'))info={cs:['Consumer surplus','cs'],ps:['Producer surplus','ps'],dwl:['Deadweight loss','dots'],g:['Government '+(window.currentGovernmentModel?.fiscal||'transfer'),'policy'],tr:['Total Revenue/Expenditure','tr']}[e.dataset.area];if(!info&&e.id==='area-tax-rev')info=['Tax revenue','policy'];if(!info&&e.id==='ban-loss-area')info=['DWL under ban','social'];if(!info&&e.id==='ban-free-area')info=['Free-market DWL','other'];if(!info&&e.matches('.subsidy-rect'))info=['Subsidy expenditure','policy'];if(!info||entries.some(x=>x.label===info[0]))continue;entries.push({label:info[0],kind:info[1],colour:getComputedStyle(e).fill});}
  const key=JSON.stringify(entries);if(slot.dataset.entries===key)return;slot.dataset.entries=key;slot.replaceChildren();for(const e of entries){const item=document.createElement('span');item.className='ew-legend-entry';const colour=document.createElement('i'),pattern=document.createElement('i');colour.className='ew-legend-swatch';colour.style.background=e.colour;pattern.className='ew-legend-swatch ew-pattern-'+e.kind;colour.setAttribute('aria-hidden','true');pattern.setAttribute('aria-hidden','true');item.append(colour,pattern,document.createTextNode(e.label));slot.append(item);}
 }
 function refresh(){
  const svg=document.getElementById('diagram');if(running||!svg?.getScreenCTM())return;
  const nativeTitles=[...svg.querySelectorAll('text>title')].map(title=>({parent:title.parentElement,title}));nativeTitles.forEach(({title})=>title.remove());
  running=true;try{
   P.resetPresentation(svg);chrome();legacyCurveGeometry(svg);alignMeb(svg);policyCurveLengths(svg);
   const scene=svg.querySelector('#ban-scene,#free-scene');if(scene&&!scene.querySelector('#ew-origin')){const zero=document.createElementNS(NS,'text');zero.id='ew-origin';zero.textContent='0';zero.classList.add('ew-fixed-label');zero.dataset.ewTextRole='small';zero.style.fill='#000';zero.setAttribute('text-anchor','end');scene.append(zero);position(svg,zero,88,446);}
   if(svg.querySelector('#diagram-plot')&&!document.body.classList.contains('ew-government')&&!document.body.classList.contains('ew-basic-externality')){
    svg.classList.add('ew-policy-context');
    for(const e of svg.querySelectorAll('.line-mpb,.line-mpc,.line-msb,.line-msc'))e.style.stroke='#374151';
    for(const e of svg.querySelectorAll('#label-mpb,#label-mpc,#label-msb,#label-msc,#free-scene text'))if(/^(?:MPB|MPC|MSB|MSC)/.test(e.textContent)&&!/^MPC\*/.test(e.textContent))e.style.fill='#374151';
    for(const e of svg.querySelectorAll('#arrow-meb,.free-externality,#ban-mec-arrow,#group-mec line'))e.style.stroke='#dc2626';
    for(const e of svg.querySelectorAll('#label-meb'))e.style.fill='#dc2626';
    for(const e of svg.querySelectorAll('#label-policy-curve,#label-policy-arrow'))e.style.fill='#4169e1';
    for(const e of svg.querySelectorAll('#free-scene text'))if(/^MPC\*/.test(e.textContent))e.style.fill='#4169e1';
    const merged=svg.querySelector('#label-msb'),mode=document.getElementById('policy-select')?.value;
    if(merged&&/Subsidy|MPB\*/.test(merged.textContent)&&['direct_subsidy','education'].includes(mode)){svg.querySelector('#curve-msb').style.stroke='#4169e1';merged.style.fill='#4169e1';}
   }
   for(const[id,symbol,suffix]of[['joint-private-label','Q','private'],['joint-price-label','P','joint']]){const e=svg.querySelector('#'+id);if(e&&e.textContent===symbol+suffix)e.innerHTML=symbol+'<tspan baseline-shift="sub">'+suffix+'</tspan>';}
   const texts=[...svg.querySelectorAll('text')].filter(e=>visible(e)&&e.textContent.trim()),labels=[],fixed=[],families=new Map(),segments=[];
   const curves=[...svg.querySelectorAll('line,polyline')].filter(e=>visible(e)&&(e.matches('.curve,.line-mpb,.line-mpc,.line-msb,.line-msc,.line-policy,.line-tax,.line-quota,.line-edu,.line-qpoll,.line-rd')||+e.getAttribute('stroke-width')===2.5));
   const segment=e=>{if(e.localName==='polyline'){const p=e.getAttribute('points').trim().split(/[ ,]+/).map(Number),a=rootPoint(svg,e,p[0],p[1]),b=rootPoint(svg,e,p[p.length-2],p[p.length-1]);return{x1:a.x,y1:a.y,x2:b.x,y2:b.y};}const a=rootPoint(svg,e,+e.getAttribute('x1'),+e.getAttribute('y1')),b=rootPoint(svg,e,+e.getAttribute('x2'),+e.getAttribute('y2'));return{x1:a.x,y1:a.y,x2:b.x,y2:b.y};};
   for(const e of curves)segments.push(segment(e));segments.push({x1:100,y1:50,x2:100,y2:430},{x1:100,y1:430,x2:480,y2:430});
   const gov=!!svg.querySelector('#diagram-plot');
   for(const [i,e]of texts.entries()){
    const plain=e.textContent.trim(),id=e.id||'ew-text-'+i;let role=(['10','11','12'].includes(e.getAttribute('font-size'))?'small':'main'),kind='point',anchorUser,axis,curve,nearSegmentUser,avoidSegmentsUser,candidates;
    e.classList.remove('ew-axis-title');
    if(e.matches('.axis-title')||plain==='Price'||(plain==='Quantity'||plain==='Qty')){
     e.classList.add('ew-axis-title');
     if(/^(?:Quantity|Qty)(?:\s|$)/.test(plain)){e.textContent=plain.replace(/^Quantity/,'Qty');position(svg,e,488,447);e.setAttribute('text-anchor','start');P.styleText(e,role);if(plain.includes('Labour')&&e.getBoundingClientRect().width>104*svg.getBoundingClientRect().width/600)P.wrapText(e,['Qty ','Of ','Labour']);}
     else if(e.querySelectorAll('tspan').length){const topic5=document.body.matches('.ew-pe-policy,.ew-ne-policy,.ew-basic-externality'),unit=600/svg.getBoundingClientRect().width;position(svg,e,88,36);e.setAttribute('text-anchor','end');for(const[t,j]of[...e.querySelectorAll('tspan')].map((t,j)=>[t,j])){const y=topic5?50+(j-1)*12*unit:36+j*18,p=new DOMPoint(88,y).matrixTransform(e.getScreenCTM().inverse().multiply(svg.getScreenCTM()));t.setAttribute('x',p.x);t.setAttribute('y',p.y);t.removeAttribute('dy');}role=topic5?'topic5Title':'small';}
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
    if(e.dataset.axisKind){axis=e.dataset.axisKind==='q'?'quantity':'price';anchorUser=rootPoint(svg,e,+e.dataset.axisX,+e.dataset.axisY);e.style.fill='#000';}
    if(/^[PQL](?:[0-9₀-₉]+|_?(?:quota|private|total|joint|sub|edu|pol|dd|ss|e|s|c|p|t|b|f|d))(?:[′']|\s|=|$)/i.test(plain)&&!e.classList.contains('ew-axis-title')&&!e.matches('.area-label,.welfare-label'))e.style.fill='#000';
    if(e.dataset.pointX!==undefined){anchorUser=rootPoint(svg,e,+e.dataset.pointX,+e.dataset.pointY);position(svg,e,anchorUser.x+14,anchorUser.y-13);e.setAttribute('text-anchor','start');}
    if(e.dataset.policyLabel||(document.body.classList.contains('ew-government')&&plain==='Quota')){
     curve=curves.find(n=>n.localName==='line'&&n.getAttribute('stroke')==='#dc2626'&&+n.getAttribute('stroke-width')===2.5);
    }else if(document.body.classList.contains('ew-ne-policy')&&plain==='Quota'){
     curve=svg.querySelector('#line-quota');
    }else if(e.hasAttribute('data-curve-label')||e.dataset.curveTarget){
     // Single Shift emits each curve immediately before its own label.
     let n=e.previousElementSibling;while(n&&!curves.includes(n))n=n.previousElementSibling;curve=e.dataset.curveTarget?svg.querySelector('#'+e.dataset.curveTarget):n;
    }else if(gov&&/^M(?:PB|PC|SB|SC)/.test(plain)){
     const scope=e.closest('#free-scene')||svg;
     if(e.dataset.curveTarget)curve=svg.querySelector('#'+e.dataset.curveTarget);
     if(!curve&&e.id&&e.id!=='label-policy-curve')curve=svg.querySelector('#'+e.id.replace('label-','curve-'));
     if(e.id==='label-policy-curve')curve=svg.querySelector('#line-policy-curve');
     if(!curve&&/^MPC\*/.test(plain))curve=[...scope.querySelectorAll('line.line-policy')].find(visible);
     if(!curve){const k=/^MPB/.test(plain)?'mpb':/^MSB/.test(plain)?'msb':/^MPC/.test(plain)?'mpc':'msc';curve=[...scope.querySelectorAll('line.line-'+k)].find(visible);}
    }
    if(curve&&visible(curve)){
     if(document.body.classList.contains('ew-ne-policy'))e.style.fill=curve.matches('.line-tax,.line-qpoll,.line-rd,.line-edu')?'#4169e1':'#374151';
     const s=segment(curve);nearSegmentUser=s;const endpoint=s.x1>s.x2?{x:s.x1,y:s.y1}:{x:s.x2,y:s.y2};anchorUser=endpoint;kind='curve';role=gov&&!document.body.classList.contains('ew-government')?'longEquation':'curve';if(document.body.classList.contains('ew-government')&&e.dataset.policyLabel&&/^(Price Ceiling|Price Floor|Minimum Wage)$/i.test(plain))role='longEquation';
     P.styleText(e,role);e.setAttribute('text-anchor','start');if(svg.getBoundingClientRect().width<400&&/\((?:Pollutant Quota|Education)\)$/.test(plain)){const split=e.innerHTML.lastIndexOf(' (');if(split>0)P.wrapText(e,[e.innerHTML.slice(0,split),e.innerHTML.slice(split)]);}const unit=600/svg.getBoundingClientRect().width,b=e.getBBox(),m=e.getScreenCTM(),w=b.width*Math.hypot(m.a,m.b)*unit;
     position(svg,e,Math.max(108,Math.min(endpoint.x+12,592-w-2)),Math.max(66,Math.min(410,endpoint.y+4)));
     if(plain==='Quota'&&document.body.matches('.ew-government,.ew-ne-policy')){const matrix=svg.getScreenCTM(),top=new DOMPoint(s.x1,Math.min(s.y1,s.y2)).matrixTransform(matrix),box=e.getBoundingClientRect();candidates=[];for(const y of[0,8,16,24,32])for(const gap of[8,16,24])for(const x of[top.x+gap,top.x-box.width-gap])candidates.push({x,y:top.y+y});}
     if(e.hasAttribute('data-ew-wrapped'))for(const span of [...e.children].filter(n=>n.localName==='tspan'))span.setAttribute('x',e.getAttribute('x'));
     const slope=(s.y2-s.y1)/(s.x2-s.x1),key=(e.closest('#free-scene')?.id||'main')+':'+Math.round(slope*1e6);if(Number.isFinite(slope)){if(!families.has(key))families.set(key,[]);families.get(key).push({...s,id});}
    }else if(e.matches('.welfare-label,.area-label,#label-dwl-text,#label-subsidy-cost-text')){e.classList.add('ew-fixed-label');e.dataset.ewTextRole='small';fixed.push(e);continue;}
    else if(/(?:Under|Over)-(?:consumption|production)/i.test(plain)){position(svg,e,290,490);e.setAttribute('text-anchor','middle');role='small';if(e.id==='label-output-gap'&&svg.getBoundingClientRect().width<320&&plain.includes(' / ')){P.styleText(e,role);position(svg,e,450,300);const parts=plain.match(/^((?:Under|Over)-)(Consumption \/ )((?:Under|Over)-)(Production)$/i);if(parts)P.wrapText(e,parts.slice(1));}}
    else if(plain==='MEB'||plain==='MEC'){role='small';if(document.body.matches('.ew-ne-policy,.ew-pe-policy'))e.style.fill='#dc2626';}
    if(e.id==='label-policy-arrow'&&/^Government output \(Qg\)$/i.test(plain)&&svg.getBoundingClientRect().width<400){P.styleText(e,'small');const html=e.innerHTML,split=html.indexOf(' ');P.wrapText(e,[html.slice(0,split),html.slice(split)]);}
    const mebLabel=gov&&document.body.matches('.ew-ne-policy,.ew-pe-policy')&&/^(MEB|MEC)$/.test(plain),annotation=mebLabel?(e.closest('#free-scene,#ban-scene')||svg).querySelector(plain==='MEC'?'#mec-arrow,#group-mec line,#ban-mec-arrow':'#arrow-meb,#meb-arrow,.free-externality'):e.id==='label-policy-arrow'?svg.querySelector('#arrow-policy'):null;
    if(annotation&&visible(annotation)){
     const a=segment(annotation);anchorUser={x:(a.x1+a.x2)/2,y:(a.y1+a.y2)/2};
     if(mebLabel||document.getElementById('policy-select')?.value==='direct_subsidy'){
      position(svg,e,anchorUser.x+(mebLabel?8:-8),anchorUser.y);e.setAttribute('text-anchor',mebLabel?'start':'end');e.setAttribute('dominant-baseline','central');
     }
     if(mebLabel||/^(?:Subsidy)$/i.test(plain)){nearSegmentUser=a;avoidSegmentsUser=[a];}
    }
    if(!axis&&!anchorUser){const a=rootPoint(svg,e,+e.getAttribute('x'),+e.getAttribute('y'));anchorUser={x:a.x,y:a.y};}
    if(e.id==='label-output-gap'&&e.hasAttribute('data-ew-wrapped')){const m=svg.getScreenCTM(),a=new DOMPoint(104,60).matrixTransform(m),b=new DOMPoint(592,502).matrixTransform(m),box=e.getBoundingClientRect(),xs=[b.x-box.width],ys=[b.y-box.height];for(let x=a.x;x+box.width<=b.x;x+=2)xs.push(x);for(let y=a.y;y+box.height<=b.y;y+=2)ys.push(y);candidates=[{x:box.x,y:box.y}];for(const x of xs)for(const y of ys)candidates.push({x,y});}
    labels.push({id,element:e,kind,role,anchorUser,axis,nearSegmentUser,avoidSegmentsUser,candidates,maxDistancePx:kind==='curve'?(svg.getBoundingClientRect().width<C.gaps.compactCurveWidthPx?C.gaps.compactCurveProximityPx:C.gaps.curveProximityPx):mebLabel?80:nearSegmentUser?22:undefined,leader:kind==='curve'?false:mebLabel?true:axis||e.dataset.pointX!==undefined?undefined:false,annotationLeader:mebLabel});
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
  }finally{nativeTitles.forEach(({parent,title})=>{if(parent.isConnected)parent.append(title);});running=false;}
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;refresh();});}}
 window.EconPilot={schedule,refresh,chrome,legendEntries:()=>entries,summaryText:()=>summaryStrip?.textContent||''};
 window.addEventListener('resize',()=>{if(innerWidth<=900){const tip=document.getElementById('diagram-tooltip')||document.getElementById('tooltip');tip?.style.removeProperty('left');tip?.style.removeProperty('top');}schedule();});
 document.addEventListener('DOMContentLoaded',()=>{chrome();const svg=document.getElementById('diagram');if(window.ResizeObserver)new ResizeObserver(schedule).observe(svg);document.fonts?.ready.then(schedule);schedule();});
})();
