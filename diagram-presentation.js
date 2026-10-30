/* Proposed presentation-only helpers. DOM integration awaits pilot validation.
   Solver inputs use CSS screen pixels; no demand/supply/equilibrium calculation. */
(function(root){
 'use strict';
 const config=root.EconDiagramConfig||(typeof require==='function'?require('./diagram-config.js'):null);
 const placedTransforms=new WeakMap(),wrappedText=new WeakMap();
 const intersects=(a,b,pad=0)=>a.x<b.x+b.width+pad&&a.x+a.width>b.x-pad&&a.y<b.y+b.height+pad&&a.y+a.height>b.y-pad;
 const inside=(a,b)=>a.x>=b.left&&a.y>=b.top&&a.x+a.width<=b.right&&a.y+a.height<=b.bottom;
 function segmentHitsRect(s,b,pad=0){
  const r={left:b.x-pad,right:b.x+b.width+pad,top:b.y-pad,bottom:b.y+b.height+pad};let lo=0,hi=1;
  for(const [p,d,min,max] of [[s.x1,s.x2-s.x1,r.left,r.right],[s.y1,s.y2-s.y1,r.top,r.bottom]]){
   if(Math.abs(d)<1e-10){if(p<min||p>max)return false;}
   else {let a=(min-p)/d,z=(max-p)/d;if(a>z)[a,z]=[z,a];lo=Math.max(lo,a);hi=Math.min(hi,z);if(lo>hi)return false;}
  }
  return true;
 }
 function separateIntervals(items,min,max,gap=config.gaps.labelPx){
  const sorted=items.map(v=>({...v})).sort((a,b)=>a.target-b.target);
  if(sorted.some(v=>!Number.isFinite(v.target)||!(v.size>0)))throw Error('Invalid measured interval');
  if(sorted.reduce((s,v)=>s+v.size,0)+gap*Math.max(0,sorted.length-1)>max-min)return {ok:false,reason:'insufficient-axis-space',items:[]};
  let edge=min;
  for(const v of sorted){v.start=Math.max(v.target-v.size/2,edge);edge=v.start+v.size+gap;}
  for(let i=sorted.length-1;i>=0;i--){const ceiling=i===sorted.length-1?max:sorted[i+1].start-gap;sorted[i].start=Math.min(sorted[i].start,ceiling-sorted[i].size);}
  return {ok:true,items:sorted};
 }
 function affinePlot(point,source,target=config.plot){
  const sx=(target.right-target.left)/(source.right-source.left),sy=(target.bottom-target.top)/(source.bottom-source.top);
  if(!(sx>0)||!(sy>0)||Math.abs(sx-sy)>1e-8)throw Error('Plot transform must preserve aspect ratio and orientation');
  return {x:target.left+(point.x-source.left)*sx,y:target.top+(point.y-source.top)*sy};
 }
 function parallelOrder(segments,referenceX){
  if(!segments.length)return {};
  const slopes=segments.map(s=>{const dx=s.x2-s.x1;if(Math.abs(dx)<1e-8)throw Error('Vertical curves use a documented separate ordering adapter');return (s.y2-s.y1)/dx;});
  if(slopes.some(m=>Math.abs(m-slopes[0])>1e-6))throw Error('Only parallel curves may share this ordering family');
  return Object.fromEntries(segments.map((s,i)=>[s.id,s.y1+slopes[i]*(referenceX-s.x1)]));
 }
 function candidates(label,settings){
  if(label.candidates)return label.candidates.map(p=>({...p,width:label.width,height:label.height}));
  const out=[],step=settings.stepPx,max=settings.maxOffsetPx,add=(dx,dy)=>out.push({x:label.preferred.x+dx,y:label.preferred.y+dy,width:label.width,height:label.height});
  add(0,0);
  for(let d=step;d<=max;d+=step){
   if(label.axis==='quantity'){add(-d,0);add(d,0);}
   else if(label.axis==='price'){add(0,-d);add(0,d);}
   else for(const [dx,dy] of [[0,-d],[0,d],[-d,0],[d,0],[-d,-d],[d,-d],[-d,d],[d,d]])add(dx,dy);
  }
  if(label.nearSegment){
   if(label.kind!=='curve')for(let dx=-32;dx<=32;dx+=2)for(let dy=-32;dy<=32;dy+=2)out.push({x:label.preferred.x+dx,y:label.preferred.y+dy,width:label.width,height:label.height});
   if(label.kind==='curve')for(let dx=-max;dx<=max;dx+=8)for(let dy=-max;dy<=max;dy+=8)out.push({x:label.preferred.x+dx,y:label.preferred.y+dy,width:label.width,height:label.height});
   const s=label.nearSegment;
   for(let i=0;i<=12;i++){const x=s.x1+(s.x2-s.x1)*i/12,y=s.y1+(s.y2-s.y1)*i/12;
    for(const gap of [6,12,20])for(const[dx,dy]of[[gap,-label.height-gap],[gap,gap],[-label.width-gap,-label.height-gap],[-label.width-gap,gap],[-label.width/2,-label.height-gap],[-label.width/2,gap]])out.push({x:x+dx,y:y+dy,width:label.width,height:label.height});
   }
  }
  return out;
 }
 function segmentBoxDistance(s,b){
  if(segmentHitsRect(s,b))return 0;
  const pointDistance=(x,y)=>{const dx=s.x2-s.x1,dy=s.y2-s.y1,t=Math.max(0,Math.min(1,((x-s.x1)*dx+(y-s.y1)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-s.x1-t*dx,y-s.y1-t*dy);};
  const rectDistance=(x,y)=>Math.hypot(Math.max(b.x-x,0,x-b.x-b.width),Math.max(b.y-y,0,y-b.y-b.height));
  return Math.min(...[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>pointDistance(x,y)),rectDistance(s.x1,s.y1),rectDistance(s.x2,s.y2));
 }
 function solveLabels(labels,options){
  const {bounds,obstacles=[],segments=[]}=options;
  if(new Set(labels.map(l=>l.id)).size!==labels.length)throw Error('Label IDs must be unique');
  if(labels.some(l=>!l.id||!(l.width>0)||!(l.height>0)||!Number.isFinite(l.preferred.x+l.preferred.y)))throw Error('Invalid measured label');
  if(labels.some(l=>l.kind==='axis-title'))throw Error('Axis titles are fixed obstacles, never movable labels');
  const settings={...config.search,...options.search};
  const gap=options.labelGapPx??config.gaps.labelPx,padding=options.obstaclePx??config.gaps.obstaclePx;
  let nodes=0,exhausted=false;
  const work=labels.map(l=>({...l,choices:candidates(l,settings)}));
  // Filter fixed geometry once, then solve the truly most constrained labels
  // first. Count candidate checks against the same bounded search budget.
  for(const l of work){const safe=[];for(const b of l.choices){
   if(++nodes>settings.maxNodes){exhausted=true;break;}
   if(l.span){const center=l.axis==='quantity'?b.x+b.width/2:b.y+b.height/2;if(center<l.span.min||center>l.span.max)continue;}
   if(l.nearSegment&&segmentBoxDistance(l.nearSegment,b)>(l.maxDistancePx??config.gaps.curveProximityPx))continue;
   if(inside(b,bounds)&&!obstacles.some(o=>intersects(b,o,padding))&&![...segments,...(l.avoidSegments||[])].some(s=>segmentHitsRect(s,b,padding)))safe.push(b);
  }l.choices=safe;if(exhausted)break;}
  work.sort((a,b)=>a.choices.length-b.choices.length||Number(!!b.family)-Number(!!a.family));
  const placed=new Map(),byId=new Map(work.map(l=>[l.id,l]));
  function ordered(l,b,other,o){
   if(!l.family||l.family!==other.family)return true;
   if(!Number.isFinite(l.order)||!Number.isFinite(other.order))throw Error('Family order must come from curve geometry');
   if(l.order===other.order)return true; // Existing coincident-label behaviour belongs to the widget.
   if(l.axis==='quantity'&&other.axis==='quantity')return l.order<other.order?b.x+b.width+gap<=o.x:o.x+o.width+gap<=b.x;
   return l.order<other.order?b.y+b.height+gap<=o.y:o.y+o.height+gap<=b.y;
  }
  function compatible(l,b){for(const[id,o]of placed){const other=byId.get(id);if(intersects(b,o,gap/2)||!ordered(l,b,other,o))return false;}return true;}
  function visit(){
   if(placed.size===work.length)return true;
   let selected=null,choices=null;
   // Forward checking avoids exploring branches that already leave another
   // label without a position. Recompute the smallest remaining domain.
   for(const l of work){if(placed.has(l.id))continue;const safe=l.choices.filter(b=>compatible(l,b));if(!safe.length)return false;if(!choices||(l.placementPriority||0)>(selected.placementPriority||0)||((l.placementPriority||0)===(selected.placementPriority||0)&&safe.length<choices.length)){selected=l;choices=safe;}}
   for(const b of choices){if(++nodes>settings.maxNodes){exhausted=true;return false;}placed.set(selected.id,b);if(visit())return true;placed.delete(selected.id);if(exhausted)return false;}
   return false;
  }
  const ok=!exhausted&&visit();
  return {ok,reason:ok?null:exhausted?'search-budget-exceeded':'no-safe-placement',positions:ok?Object.fromEntries(placed):{},unresolved:ok?[]:labels.map(l=>l.id),domains:ok?undefined:Object.fromEntries(work.map(l=>[l.id,l.choices.length])),nodes};
 }
 function leaderEndpoint(anchor,box){return {x:Math.max(box.x,Math.min(box.x+box.width,anchor.x)),y:Math.max(box.y,Math.min(box.y+box.height,anchor.y))};}
 // Approved dense imperfect-information exception: connect to the nearest
 // visible part of the registered curve, not to a guessed/end-point anchor.
 function curveLeaderEndpoints(segment,box){
  const dx=segment.x2-segment.x1,dy=segment.y2-segment.y1,den=dx*dx+dy*dy||1,pairs=[];
  for(const end of [{x:box.x,y:box.y},{x:box.x+box.width,y:box.y},{x:box.x,y:box.y+box.height},{x:box.x+box.width,y:box.y+box.height}]){const t=Math.max(0,Math.min(1,((end.x-segment.x1)*dx+(end.y-segment.y1)*dy)/den));pairs.push({start:{x:segment.x1+t*dx,y:segment.y1+t*dy},end});}
  for(const start of [{x:segment.x1,y:segment.y1},{x:segment.x2,y:segment.y2}])pairs.push({start,end:leaderEndpoint(start,box)});
  return pairs.sort((a,b)=>Math.hypot(a.start.x-a.end.x,a.start.y-a.end.y)-Math.hypot(b.start.x-b.end.x,b.start.y-b.end.y))[0];
 }
 function resetPresentation(svg){
  svg.querySelectorAll('[data-ew-wrapped]').forEach(e=>{if(wrappedText.has(e)){e.innerHTML=wrappedText.get(e);wrappedText.delete(e);}e.removeAttribute('data-ew-wrapped');});
  svg.querySelectorAll('[data-ew-layout-label]').forEach(e=>{if(placedTransforms.has(e)){const t=placedTransforms.get(e);if(t===null)e.removeAttribute('transform');else e.setAttribute('transform',t);placedTransforms.delete(e);}});
  svg.querySelectorAll('[data-ew-leader-layer]').forEach(e=>e.remove());
  delete svg.dataset.ewLayoutError;
 }
 function wrapText(e,parts){
  if(parts.length<2)return;parts=[...parts];for(let i=1;i<parts.length;i++){const space=parts[i].match(/^\s+/)?.[0]||'';parts[i-1]+=space;parts[i]=parts[i].slice(space.length);}
  wrappedText.set(e,e.innerHTML);e.setAttribute('data-ew-wrapped','');const x=e.getAttribute('x')||'0',m=e.getScreenCTM(),dy=16/Math.hypot(m.a,m.b);e.innerHTML=parts.map((p,i)=>`<tspan x="${x}"${i?' dy="'+dy+'"':''}>${p}</tspan>`).join('');
 }
 function styleText(e,role='main',halo=true){
  const m=e.getScreenCTM();if(!m)throw Error('Unmeasurable text');
  const scale=Math.hypot(m.a,m.b),svg=e.closest('svg'),projection=svg?.closest('.ew-fullscreen-stage')?Math.max(1,Math.min(config.fullscreen?.maxTextScale||1,Number(svg.dataset.ewPresentationScale)||1)):1,px=config.text[role+'Px']*projection;
  if(!(scale>0)||Math.abs(Math.hypot(m.c,m.d)-scale)>1e-5||Math.abs(m.a*m.c+m.b*m.d)>1e-5)throw Error('Invalid text coordinate transform');
  if(!px)throw Error('Unknown shared text role: '+role);
  e.dataset.ewTextRole=role;e.style.fontSize=px/scale+'px';e.style.fontWeight=(role==='curve'||role==='longEquation')?String(config.text.curveWeight):'400';
  if(halo){e.classList.add('ew-label');e.style.strokeWidth=config.text.haloPx*projection/scale+'px';}
  for(const sub of e.querySelectorAll('tspan[baseline-shift="sub"]'))sub.style.fontSize=config.text.subscriptPx*projection/scale+'px';
 }
 function layoutSvg(svg,registration){
  if(!config)throw Error('Load diagram-config.js before presentation helpers');
  const matrix=svg.getScreenCTM();if(!matrix)return {ok:false,reason:'unmeasurable-svg'};
  const point=p=>{const t=svg.createSVGPoint();t.x=p.x;t.y=p.y;return t.matrixTransform(matrix);};
  const inverse=matrix.inverse();
  const boundsUser=registration.bounds||config.safeBounds;
  const tl=point({x:boundsUser.left,y:boundsUser.top}),br=point({x:boundsUser.right,y:boundsUser.bottom});
  for(const fixed of registration.fixedElements||[]){if(fixed.getClientRects().length&&(fixed.classList.contains('ew-axis-title')||fixed.classList.contains('ew-fixed-label')))styleText(fixed,fixed.dataset.ewTextRole||'main',!fixed.classList.contains('ew-axis-title'));}
  const obstacles=(registration.fixedElements||[]).filter(e=>e.getClientRects().length).map(e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};});
  const labels=[],familyData=new Map();
  for(const family of registration.parallelFamilies||[]){const order=parallelOrder(family.segments,family.referenceX);for(const segment of family.segments)familyData.set(segment.id,{family:family.id,order:order[segment.id]});}
  for(let entry of registration.labels){
   const e=entry.element;if(e.classList.contains('ew-axis-title'))throw Error('Axis titles cannot enter displacement layout');
   if(placedTransforms.has(e))throw Error('Call resetPresentation before the widget renders its next state');
   if(!e.getClientRects().length||getComputedStyle(e).display==='none'||getComputedStyle(e).visibility==='hidden')continue;
   styleText(e,entry.role||'main');e.dataset.ewLabelKind=entry.kind||'point';e.setAttribute('data-ew-layout-label','');
   if(entry.axis==='price'){
    const available=point({x:config.values.priceColumnX,y:0}).x-tl.x;
    const terms=e.innerHTML.split(' = '),fourPrices=terms.length===4&&/^P/.test(e.textContent.trim());
    if(fourPrices){wrapText(e,[terms.slice(0,2).join(' = '),' = '+terms.slice(2).join(' = ')]);if(e.getBoundingClientRect().width>available)entry={...entry,axis:undefined,kind:'point',leader:true,fourPriceInterior:true};}
    else if(e.getBoundingClientRect().width>available){
     const html=e.innerHTML,parts=html.includes(' = ')?html.split(/(?= = )/):html.includes(' (')?html.split(/(?= \()/):[html];
     if(parts.length>1){wrapText(e,parts);if(e.getBoundingClientRect().width>available&&html.includes(' = ')){e.innerHTML=html;const terms=html.split(' = ');wrapText(e,terms.map((term,i)=>i<terms.length-1?term+' = ':term));}}
    }
   }
   const b=e.getBoundingClientRect();
   const nearSegment=entry.nearSegmentUser?(()=>{const a=point({x:entry.nearSegmentUser.x1,y:entry.nearSegmentUser.y1}),z=point({x:entry.nearSegmentUser.x2,y:entry.nearSegmentUser.y2});return{x1:a.x,y1:a.y,x2:z.x,y2:z.y};})():null;
   const avoidSegments=(entry.avoidSegmentsUser||[]).map(s=>{const a=point({x:s.x1,y:s.y1}),b=point({x:s.x2,y:s.y2});return{x1:a.x,y1:a.y,x2:b.x,y2:b.y};});
   labels.push({...entry,nearSegment,avoidSegments,id:entry.id||e.id,width:b.width,height:b.height,originalBox:{x:b.x,y:b.y},preferred:entry.fourPriceInterior?{x:point({x:config.plot.left+16,y:0}).x,y:point(entry.anchorUser).y-b.height/2}:{x:b.x,y:b.y},anchor:entry.anchorUser?point(entry.anchorUser):null});
  }
  for(const l of labels){
   if(l.kind==='curve'&&l.family&&!familyData.has(l.id))throw Error('Register parallel curve geometry, not a guessed family rank');
   if(familyData.has(l.id))Object.assign(l,familyData.get(l.id));
   if(l.axis){if(!l.anchor)throw Error('Axis value labels require their true anchors');l.family='axis-'+l.axis;l.order=l.axis==='quantity'?l.anchor.x:l.anchor.y;
    const limits=l.axis==='quantity'?config.values.quantitySpan:config.values.priceSpan;const a=l.axis==='quantity'?point({x:limits[0],y:0}).x:point({x:0,y:limits[0]}).y;const z=l.axis==='quantity'?point({x:limits[1],y:0}).x:point({x:0,y:limits[1]}).y;l.span={min:a,max:z};
    if(l.axis==='quantity'){l.preferred.x=l.anchor.x-l.width/2;l.preferred.y=Math.max(point({x:0,y:config.values.quantityRowY}).y-l.height*.8,point({x:0,y:config.plot.bottom}).y+config.gaps.obstaclePx+1);}
    else {l.preferred.x=point({x:config.values.priceColumnX,y:0}).x-l.width;l.preferred.y=l.anchor.y-l.height/2;}
   }
  }
  const segments=(registration.segments||[]).map(s=>{const a=point({x:s.x1,y:s.y1}),b=point({x:s.x2,y:s.y2});return {x1:a.x,y1:a.y,x2:b.x,y2:b.y};});
  const result=solveLabels(labels,{bounds:{left:tl.x,top:tl.y,right:br.x,bottom:br.y},obstacles,segments});
  if(!result.ok){svg.dataset.ewLayoutError=result.reason;return result;}
  const layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.setAttribute('data-ew-leader-layer','');layer.setAttribute('aria-hidden','true');svg.insertBefore(layer,[...svg.children].find(e=>e.tagName.toLowerCase()==='g')||null);
  for(const entry of labels){
   const e=entry.element,b=result.positions[entry.id],m=e.getScreenCTM(),inv=m.inverse();
   const from=svg.createSVGPoint(),to=svg.createSVGPoint();from.x=entry.originalBox.x;from.y=entry.originalBox.y;to.x=b.x;to.y=b.y;
   const a=from.matrixTransform(inv),z=to.matrixTransform(inv),base=e.getAttribute('transform');placedTransforms.set(e,base);
   e.setAttribute('transform',(base||'')+` translate(${z.x-a.x} ${z.y-a.y})`);
   if(entry.kind==='curve'&&entry.curveLeaderException==='IMPERFECT-INFO-DENSE'&&entry.nearSegment){
    const {start,end}=curveLeaderEndpoints(entry.nearSegment,b);
    if(Math.hypot(start.x-end.x,start.y-end.y)>config.exceptions.imperfectInfoDense.leaderThresholdPx){const u=new DOMPoint(start.x,start.y).matrixTransform(inverse),v=new DOMPoint(end.x,end.y).matrixTransform(inverse),line=document.createElementNS(svg.namespaceURI,'line');for(const[k,val]of Object.entries({x1:u.x,y1:u.y,x2:v.x,y2:v.y,class:'ew-displacement-leader','data-ew-label-for':entry.id,'data-ew-curve-leader-exception':'IMPERFECT-INFO-DENSE'}))line.setAttribute(k,val);layer.append(line);}
   }
   if(entry.kind!=='curve'&&entry.leader!==false&&entry.anchor){
    const end=leaderEndpoint(entry.anchor,b),distance=Math.hypot(end.x-entry.anchor.x,end.y-entry.anchor.y);
    const moved=entry.axis==='quantity'?Math.abs(b.x+b.width/2-entry.anchor.x)>2:entry.axis==='price'?Math.abs(b.y+b.height/2-entry.anchor.y)>2:Math.hypot(b.x-entry.originalBox.x,b.y-entry.originalBox.y)>2;
    if((entry.axis&&moved)||(entry.annotationLeader&&moved)||(!entry.axis&&distance>config.gaps.leaderThresholdPx)){
     const p=svg.createSVGPoint(),q=svg.createSVGPoint();p.x=entry.anchor.x;p.y=entry.anchor.y;q.x=end.x;q.y=end.y;const u=p.matrixTransform(inverse),v=q.matrixTransform(inverse),l=document.createElementNS(svg.namespaceURI,'line');
     for(const [k,val] of Object.entries({x1:u.x,y1:u.y,x2:v.x,y2:v.y,class:'ew-displacement-leader','data-ew-label-for':entry.id}))l.setAttribute(k,val);layer.append(l);
    }
   }
  }
  svg.dataset.ewLayoutError='';return result;
 }
 const api={intersects,inside,segmentHitsRect,segmentBoxDistance,separateIntervals,affinePlot,parallelOrder,solveLabels,leaderEndpoint,curveLeaderEndpoints,resetPresentation,styleText,wrapText,layoutSvg};
 root.EconDiagramPresentation=Object.freeze(api);if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
