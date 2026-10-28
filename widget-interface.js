
/* Shared Collection Interface. Economic Models Remain In Their Original Scripts. */
(() => {
 'use strict';
 const svg=document.getElementById('diagram');
 const titleCase=s=>s.replace(/(^|[\s/·:–—(\-])([a-z])/g,(_,a,b)=>a+b.toUpperCase());
 function visible(el) { for(let n=el;n&&n.nodeType===1;n=n.parentElement) if(n.hidden||getComputedStyle(n).display==='none'||getComputedStyle(n).visibility==='hidden')return false; return true; }
 const chromeSelector='h1,h2,h3,summary,button,label,option,output,.scale-label,.range-ends,.slider-scale,.elastic-label,.curve-key,.legend,.surplus-key,.area-key,.step-number,.case-current,caption,th,.summary-table td,.outcomes td,.result-banner,svg text';
 let normalising=false;
 function normalise(root=document) {
  if(normalising)return; normalising=true;
  const nodes=[...(root.matches?.(chromeSelector)?[root]:[]),...root.querySelectorAll(chromeSelector)];
  for(const el of nodes) {
   if(el.closest('.tooltip')||el.matches('tspan'))continue;
   const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
   while(walker.nextNode()) {
    const n=walker.currentNode;
    if(n.parentElement?.closest('tspan[baseline-shift="sub"],script,style,.tooltip'))continue;
    // Preserve Curve Symbols, Mathematical Subscripts And Coordinates.
    if(el.closest('svg')&&/^[QPESWL][a-z0-9₀-₉]+(?:\s*=.*)?$/.test(n.nodeValue.trim()))continue;
    const wording=n.nodeValue.replace(/shift magnitude/gi,'Size Of Shift').replace(/magnitude of ([a-z ]+)/gi,(_,x)=>'Size Of '+x).replace(/magnitude/gi,'Size');
    const next=titleCase(wording); if(next!==n.nodeValue)n.nodeValue=next;
   }
  }
  normalising=false;
 }
 normalise();
 if(!svg) { new MutationObserver(()=>normalise()).observe(document.body,{childList:true,subtree:true,characterData:true}); return; }
 const main=document.querySelector('.main-content'),controls=document.querySelector('.controls'),frame=svg.closest('.diagram-frame');
 svg.setAttribute('role','group');
 const nav=document.querySelector('.related-widget');
 if(nav) { nav.classList.add('widget-nav'); document.querySelector('.widget-header').after(nav); nav.querySelector('a').textContent='Back To Main Index'; }

 // Place Economic Adjustments Before Presentation Options.
 const options=controls?.querySelector(':scope>.toggle-grid,:scope>.option-row,:scope>.checkbox-group');
 const banControls=document.getElementById('ban-controls');
 if(banControls&&controls)controls.append(banControls);
 if(options)controls.append(options);

 // A Fixed Glossary Order, With A Separate Current-Policy Entry.
 const sidebar=document.querySelector('.sidebar'),glossaryContainer=document.getElementById('glossary')||sidebar;
 const glossaryItems=glossaryContainer?[...glossaryContainer.children].filter(n=>n.tagName==='DETAILS'):[];
 if(sidebar)sidebar.querySelector('.glossary-title').textContent='Glossary';
 const policySelect=document.getElementById('policy-select');
 let currentPolicy=null;
 const policyNames={ceiling:'ceiling',floor:'floor',wage:'wage',quota:'Quota On Output',tax:'Tax',ban:'Ban (A Quota Of Zero)',qpoll:'Quota On Pollutant',rd:'Research & Development (R&D)',edu:'Education & Campaigns',indirect_subsidy:'Indirect Subsidy',direct_subsidy:'Direct Subsidy',free_provision:'Free Provision',joint_provision:'Joint Provision',education:'Education & Campaigns'};
 if(policySelect&&sidebar) {
  // Disable Only The Old Reordering Pass. Preserve Its Area-Key Updates.
  if(typeof approvedUX==='function') {
   const oldApproved=approvedUX;
   approvedUX=function(){oldApproved();stabiliseGlossary();};
  }
  currentPolicy=document.createElement('section');currentPolicy.className='ui-current-policy';
  currentPolicy.innerHTML='<h3>Current Policy</h3><details><summary></summary><div class="ui-policy-definition"></div></details>';
  sidebar.querySelector('.glossary-title').after(currentPolicy);
 }
 function stabiliseGlossary() {
  if(!policySelect||!glossaryContainer)return;
  const existing=[...glossaryContainer.children].filter(n=>glossaryItems.includes(n));
  if(existing.some((n,i)=>n!==glossaryItems[i]))glossaryItems.forEach(n=>glossaryContainer.append(n));
  const k=policySelect.value;
  let selected=document.getElementById('glossary-'+k);
  if(!selected) {
   const name=titleCase(policyNames[k]||'');
   selected=glossaryItems.find(n=>titleCase(n.querySelector('summary')?.textContent.replace(/\s+/g,' ').trim()||'')===name);
  }
  currentPolicy.hidden=!selected||k==='none';
  if(selected) {
   const text=selected.querySelector('summary').textContent;
   const html=[...selected.children].filter(n=>n.tagName!=='SUMMARY').map(n=>n.outerHTML).join('');
   const term=currentPolicy.querySelector('summary'),definition=currentPolicy.querySelector('.ui-policy-definition');
   if(term.textContent!==text){term.textContent=text;currentPolicy.querySelector('details').open=false;}
   if(definition.innerHTML!==html)definition.innerHTML=html;
  }
 }

 // One Action Bar. Keep Hidden Legacy Zoom Buttons For Existing Reset Handlers.
 const bars=[...main.querySelectorAll('.toolbar')],bar=bars[0]||document.createElement('div');
 const reset=main.querySelector('#reset,.reset-button'),oldZoom=main.querySelector('#zoom,.zoom-button');
 const download=main.querySelector('#download')||[...main.querySelectorAll('button')].find(b=>/^Download Diagram$/i.test(b.textContent.trim()));
 const copy=main.querySelector('#copy')||[...main.querySelectorAll('button')].find(b=>/^Copy Diagram$/i.test(b.textContent.trim()));
 const style=main.querySelector('#image-style,#export-style,.export-format select');
 const exportLabel=style?.closest('label');
 const oldHint=bar.querySelector('.hint:not([role="status"])');if(oldHint)oldHint.remove();
 bar.className='toolbar ui-actionbar ew-actions';bar.setAttribute('aria-label','Diagram Actions');
 if(oldZoom){oldZoom.classList.add('ui-legacy-zoom');oldZoom.hidden=true;oldZoom.tabIndex=-1;oldZoom.setAttribute('aria-hidden','true');bar.append(oldZoom);}
 if(reset){reset.textContent='Reset Diagram';bar.append(reset);}

 const exportMenu=document.createElement('details');exportMenu.className='ui-export ew-export';exportMenu.innerHTML='<summary>Export Diagram</summary><div class="ui-export-panel ew-export-menu"></div>';
 const exportPanel=exportMenu.querySelector('div');
 if(exportLabel)exportPanel.append(exportLabel);if(download){download.textContent='Download PNG';exportPanel.append(download);}if(copy){copy.textContent='Copy Diagram';bar.append(copy);}
 const svgDownload=document.createElement('button');svgDownload.type='button';svgDownload.textContent='Download SVG';exportPanel.insertBefore(svgDownload,download);
 bar.append(exportMenu);frame.after(bar);
 EconWidgetHelp.install(bar,{kind:document.getElementById('next')?'guided':document.body.classList.contains('ew-elasticity')?'elasticity':document.getElementById('policy-select')?'policy':'standard'});
 bars.filter(n=>n!==bar).forEach(n=>{if(!n.children.length)n.remove();});
 let status=main.querySelector('#export-status,[role="status"]');
 if(!status){status=document.createElement('p');status.className='diagram-help';status.setAttribute('role','status');bar.after(status);}
 if(bar.contains(status)){status.classList.add('diagram-help');bar.after(status);}

 document.addEventListener('click',e=>{if(!exportMenu.contains(e.target))exportMenu.open=false;});

 // Compact Curve Keys For Multi-Curve Externality Policy Diagrams.
 let curveKey=null;
 if(document.querySelector('.line-mpb')&&policySelect) {curveKey=document.createElement('div');curveKey.className='curve-key ui-curve-key';frame.after(curveKey);}
 function updateCurveKey() {
  if(!curveKey)return;
  const has=selector=>[...svg.querySelectorAll(selector)].some(visible);
  const entries=[];
  if(policySelect.value!=='none') {
   if(has('.line-mpb'))entries.push(['#2563eb','Private Benefit']);
   if(has('.line-mpc'))entries.push(['#16a34a','Private Cost']);
   if(has('.line-msb,.line-msc'))entries.push(['#dc2626','Social Benefit / Cost']);
   if(has('.line-policy,.line-tax,.line-quota,.line-qpoll,.line-rd,.line-edu'))entries.push(['#4169e1','Policy / Restriction']);
  }
  const html=entries.map(([c,t])=>'<span><i style="border-color:'+c+'"></i>'+t+'</span>').join('');
  curveKey.hidden=!entries.length;if(curveKey.innerHTML!==html)curveKey.innerHTML=html;
 }

 // Unified Explanations: Hover Preview, Tap/Click/Keyboard Pin, Explicit Dismissal.
 const tip=document.getElementById('diagram-tooltip')||document.getElementById('tooltip');
 tip.classList.add('ui-tooltip','ew-tooltip');tip.setAttribute('role','note');tip.setAttribute('aria-live','polite');
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

 // One Export Frame: Heading, Current Context, Diagram And Visible Legends.
 function exportContext() {
  const items=[];
  if(policySelect)items.push(policySelect.selectedOptions[0].textContent);
  for(const id of ['step-count','case-current','elasticity-label']){const n=document.getElementById(id);if(n&&visible(n)&&n.textContent.trim())items.push(n.textContent.trim());}
  if(document.body.classList.contains('ew-elasticity')){const selected=controls.querySelector('.shift-choice button[aria-pressed="true"]');if(document.getElementById('tr')&&window.widgetState?.shock===0)items.push('No Shift');else if(selected)items.push(selected.textContent.trim());}
  if(document.getElementById('curvature')) {
   const state=window.widgetState;
   if(state)items.push(state.mode==='points'?'Production Points':state.growthCase==='potential'?'Potential Growth':'Actual Growth & Reallocation');
  }
  const outputs=[...controls.querySelectorAll('output')].filter(visible).map(n=>n.textContent.trim()).filter(Boolean);
  items.push(...outputs);return [...new Set(items)].map(titleCase).join(' · ');
 }
 function applyGrayscale(clone){
  const ns='http://www.w3.org/2000/svg';
  const add=(tag,attrs,text,parent=clone)=>{const n=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text!==undefined)n.textContent=text;parent.append(n);return n;};
   const defs=add('defs',{},undefined,clone);
   for(const kind of ['social','other','policy','cs','ps','price','quantity','dots','tr']){
    const pattern=add('pattern',{id:'ui-hatch-'+kind,width:8,height:8,patternUnits:'userSpaceOnUse'},undefined,defs);
    add('rect',{width:8,height:8,fill:'#fff'},undefined,pattern);
    if(kind==='dots')add('circle',{cx:3,cy:3,r:1,fill:'#555'},undefined,pattern);else add('path',{d:['social','cs','price'].includes(kind)?'M-2,2 L2,-2 M0,8 L8,0 M6,10 L10,6':kind==='policy'?'M0,0 L8,8 M0,8 L8,0':kind==='tr'?'M4,0 L4,8':'M0,4 L8,4',stroke:'#777','stroke-width':1,fill:'none'},undefined,pattern);
   }
   const ids={'dwl':'social','area-dwl':'social','ban-loss-area':'social','free-policy-loss':'social','ban-free-area':'other','free-market-loss':'other','area-tax-rev':'policy','subsidy-cost-rect':'policy','cs-area':'cs','ps-area':'ps'};
   for(const n of clone.querySelectorAll('*')){
    for(const p of ['fill','stroke']){
     const raw=n.style.getPropertyValue(p)||n.getAttribute(p)||'',rgb=raw.match(/^rgba?\(([^)]+)\)$/),hex=raw.match(/^#([0-9a-f]{6})$/i);
     const c=rgb?rgb[1].split(/[, ]+/).filter(Boolean).map(Number):hex?[0,2,4].map(i=>parseInt(hex[1].slice(i,i+2),16)):null;
     if(c){const g=Math.round(.2126*c[0]+.7152*c[1]+.0722*c[2]);n.style.setProperty(p,`rgba(${g},${g},${g},${c[3]??1})`);}
    }
    let kind=ids[n.id]||n.dataset.area;
    if(kind==='g')kind='policy';if(kind==='dwl')kind=document.body.classList.contains('ew-government')?'dots':'social';
    if(!kind&&n.matches('.subsidy-rect,.tax-poly'))kind='policy';
    if(kind&&['social','other','policy','cs','ps','price','quantity','dots','tr'].includes(kind)){n.style.fill='url(#ui-hatch-'+kind+')';n.style.fillOpacity='1';}
    if(n.matches('.curve,.line-mpb,.line-mpc,.line-msb,.line-msc,.line-policy,.line-tax,.line-quota,.line-qpoll,.line-rd,.line-edu')){n.style.stroke='#333';n.style.strokeDasharray='none';}
   }
 }
 function exportSVG(){
  EconPilot.refresh();
  return EconExportPresentation.snapshot(svg,{appearance:style?.value||'colour',legend:EconPilot.legendEntries().map(e=>({...e,fill:e.colour,pattern:'url(#ui-hatch-'+e.kind+')'})),applyGrayscale,title:document.querySelector('h1').textContent,context:exportContext(),summary:EconPilot.summaryText(),summaryCompactHeightPx:document.body.matches('.ew-ne-policy,.ew-pe-policy')?EconDiagramConfig.summary.policyCompactHeightPx:document.body.classList.contains('ew-elasticity')?EconDiagramConfig.summary.elasticityCompactHeightPx:undefined});
 }
 async function exportPNG(){
  const text=exportSVG(),blob=new Blob([text],{type:'image/svg+xml'}),url=URL.createObjectURL(blob);
  try{const image=new Image();await new Promise((ok,bad)=>{image.onload=ok;image.onerror=bad;image.src=url;});const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;canvas.getContext('2d').drawImage(image,0,0);return await new Promise((ok,bad)=>canvas.toBlob(b=>b?ok(b):bad(Error('Image Export Failed')),'image/png'));}finally{URL.revokeObjectURL(url);}
 }
 svgDownload.onclick=()=>{try{const blob=new Blob([exportSVG()],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=location.pathname.split('/').at(-1).replace(/\.html$/i,'')+(style?.value==='grayscale'?'_Grayscale':'')+'.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='Diagram Downloaded.';exportMenu.open=false;}catch(e){status.textContent='Unable To Export. Open The Widget In Its Own Browser Tab And Try Again.';}};
 window.exportSVG=exportSVG;window.diagramPNG=exportPNG;
 if(download)download.onclick=async()=>{
  try{const blob=await exportPNG(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=location.pathname.split('/').at(-1).replace(/\.html$/i,'')+(style?.value==='grayscale'?'_Grayscale':'')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='Diagram Downloaded.';exportMenu.open=false;}
  catch(e){status.textContent='Unable To Export. Open The Widget In Its Own Browser Tab And Try Again.';}
 };
 if(copy)copy.onclick=async()=>{
  try{if(!navigator.clipboard?.write||!window.ClipboardItem)throw Error('Unavailable');await navigator.clipboard.write([new ClipboardItem({'image/png':exportPNG()})]);status.textContent='Diagram Copied.';exportMenu.open=false;}
  catch(e){status.textContent='Copying Is Unavailable In This Browser Or Embed. Use Download Diagram.';}
 };
 function prepareExplanationTargets(){
  for(const target of svg.querySelectorAll('[data-tip],[data-tooltip-target],.has-tooltip')){
   if(target.matches('.draggable,.touch-target')||target.getAttribute('role')==='slider')continue;
   target.setAttribute('role','button');target.setAttribute('tabindex','0');
   if(!target.hasAttribute('aria-label')&&target.dataset.tip)target.setAttribute('aria-label',target.dataset.tip);
  }
 }

 // Compact Controls: Keep Scenario Controls Visible; Group Display Options.
 if(options){
  const settings=document.createElement('details');settings.className='ui-diagram-settings ew-settings';
  settings.innerHTML='<summary>Diagram Options</summary>';options.before(settings);settings.append(options);
 }
 // Legends Live Inside The Diagram Card. Exclude Descriptive Styling Notes.
 const legends=[...main.querySelectorAll('.legend,.curve-key,.area-key,.surplus-key,.ban-legend')];
 const legendBox=document.createElement('div');legendBox.className='ui-diagram-legends';legendBox.hidden=true;frame.append(legendBox);
 for(const legend of legends)legendBox.append(legend);
 function cleanLegends(){
  for(const legend of legends){
   for(const span of [...legend.children]){
    if(span.matches('span')&&!span.querySelector('i')&&/lighter|all curves|coordinates:|drag |arrow keys|hollow circles|direction of change:/i.test(span.textContent))span.remove();
   }
  }
  const any=legends.some(n=>!n.hidden&&getComputedStyle(n).display!=='none'&&n.textContent.trim());
  // Area-only legend visibility is managed by EconPilot.
 }
 // Remove Small Interface Instructions; Preserve Status Messages And Model Notes.
 for(const help of main.querySelectorAll('.diagram-help,.case-help')){
  if(help.id==='export-status'||help.getAttribute('role')==='status')continue;
  help.remove();
 }
 function normaliseAccessibleLabels(){for(const input of document.querySelectorAll('[aria-label]')){
  const text=input.getAttribute('aria-label');if(/magnitude/i.test(text))input.setAttribute('aria-label',text.replace(/shift magnitude/gi,'Size Of Shift').replace(/magnitude/gi,'Size'));
 }
 }
 normaliseAccessibleLabels();
 // Side-By-Side Disclosures For Summaries And Teaching Explanations.
 const panels=document.createElement('div');panels.className='ui-teaching-panels';
 bar.after(panels);
 const disclosurePairs=[];
 function wrapTeaching(node,title){
  if(!node||node.closest('.controls,.sidebar,.ui-teaching-panels'))return null;
  const disclosure=document.createElement('details');disclosure.className='ui-teaching-disclosure ew-disclosure';
  if(node.id==='mechanism'&&/price adjustment process/i.test(title))disclosure.classList.add('ew-price-adjustment');
  const heading=document.createElement('summary');heading.innerHTML='<span></span><span class="ui-expand-hint ew-expand-hint">Click To Expand</span>';
  heading.firstElementChild.textContent=title;disclosure.append(heading);panels.append(disclosure);disclosure.append(node);
  disclosurePairs.push([disclosure,node]);return disclosure;
 }
 const summaryNode=main.querySelector('.summary-wrap,.table-wrap')||main.querySelector('table.outcomes');
 const summaryHeading=summaryNode?.querySelector('caption')?.textContent||summaryNode?.closest('section')?.querySelector('h2')?.textContent;
 wrapTeaching(summaryNode,/Equilibrium/i.test(summaryHeading||'')?'Equilibrium Summary':summaryHeading||'Outcome Summary');
 const mechanism=main.querySelector('#mechanism');
 const explanation=wrapTeaching(mechanism,mechanism?.querySelector('h2')?.textContent||'Detailed Explanation');
 const modelNote=main.querySelector('.model-note');
 if(modelNote){if(explanation)explanation.append(modelNote);else wrapTeaching(modelNote,'Detailed Explanation');}
 // Policy Limitations And Conditional Policy Results Remain Available In Their Own Panels.
 for(const node of [...main.querySelectorAll(':scope>.policy-note')])wrapTeaching(node,node.querySelector('h2,h3')?.textContent||'Policy Explanation');
 if(!panels.children.length)panels.remove();
 function syncTeachingPanels(){
  for(const [disclosure,node] of disclosurePairs){
   const hidden=node.hidden||node.style.display==='none';
   if(disclosure.hidden!==hidden)disclosure.hidden=hidden;
   if(node===mechanism&&explanation){const heading=node.querySelector('h2');if(heading&&explanation.querySelector('summary span').textContent!==heading.textContent)explanation.querySelector('summary span').textContent=heading.textContent;}
  }
  if(panels.isConnected){const hidden=[...panels.children].every(n=>n.hidden);if(panels.hidden!==hidden)panels.hidden=hidden;}
 }
 for(const [,node] of disclosurePairs)new MutationObserver(syncTeachingPanels).observe(node,{attributes:true,attributeFilter:['hidden','style']});
 cleanLegends();syncTeachingPanels();
 const refresh=()=>{EconPilot.chrome();normalise();normaliseAccessibleLabels();stabiliseGlossary();updateCurveKey();prepareExplanationTargets();cleanLegends();syncTeachingPanels();};
 refresh();
 let pending=false;
 new MutationObserver(()=>{if(!pending){pending=true;queueMicrotask(()=>{pending=false;refresh();});}}).observe(document.body,{childList:true,subtree:true,characterData:true});
 window.WidgetInterface={closeExplanation:closeTip,exportPNG,exportSVG,refresh};EconPilot.schedule();
})();

