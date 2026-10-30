/* One-widget fullscreen pilot. Presentation only; no economic/model state. */
(()=>{'use strict';
 // This pilot is deliberately opt-in: only the Single Shift page loads it.
 const controls=document.querySelector('.ew-controls'),frame=document.querySelector('.ew-diagram-frame'),svg=frame?.querySelector('svg'),bar=document.querySelector('.ew-actions');
 if(!controls||!frame||!svg||!bar)return;
 const profile=Object.freeze({...EconDiagramConfig.fullscreen,legendHeight:EconDiagramConfig.legend.heightPx});
 const button=document.createElement('button');button.type='button';button.id='ew-enter-fullscreen';button.textContent='Fullscreen';button.setAttribute('aria-controls','ew-fullscreen-stage');button.setAttribute('aria-expanded','false');bar.append(button);
 const stage=document.createElement('section');stage.id='ew-fullscreen-stage';stage.className='ew-fullscreen-stage';stage.hidden=true;stage.setAttribute('aria-label','Fullscreen Diagram');
 const top=document.createElement('div');top.className='ew-fullscreen-controls';const exitButton=document.createElement('button');exitButton.type='button';exitButton.className='ew-fullscreen-exit';exitButton.textContent='Exit Fullscreen';exitButton.setAttribute('aria-label','Exit Fullscreen (Escape)');
 const diagramBox=document.createElement('div');diagramBox.className='ew-fullscreen-diagram';const status=document.createElement('span');status.className='ew-fullscreen-status';status.setAttribute('role','status');top.append(exitButton,status);stage.append(top,diagramBox);document.body.append(stage);
 let active=false,exiting=false,pending=false,places=[],background=[],returnFocus,scroll={x:0,y:0},frameStyle=null,scaleBefore=null;
 function resize(){if(!active)return;const stageRect=stage.getBoundingClientRect(),topRect=top.getBoundingClientRect(),width=Math.max(160,stageRect.width-profile.padding*2),height=Math.max(0,stageRect.height-profile.padding*2-topRect.height-profile.gap),diagramWidth=Math.max(160,Math.min(width,(height-profile.summaryHeight-profile.legendHeight-2)*600/510));frame.style.width=diagramWidth+'px';svg.dataset.ewPresentationScale=String(Math.min(profile.maxTextScale,Math.max(1,diagramWidth/profile.referenceWidth)));window.EconPilot?.refresh();}
 function schedule(){if(!active||pending)return;pending=true;requestAnimationFrame(()=>{pending=false;resize();});}
 function move(node,parent,before=null){const marker=document.createComment('Fullscreen restore point');node.before(marker);places.push({node,marker});parent.insertBefore(node,before);}
 function leave(){if(!active)return;active=false;exiting=false;window.WidgetInterface?.closeExplanation?.();
  for(const{node,marker}of places){marker.replaceWith(node);}places=[];
  if(frameStyle===null)frame.removeAttribute('style');else frame.setAttribute('style',frameStyle);
  if(scaleBefore===null)delete svg.dataset.ewPresentationScale;else svg.setAttribute('data-ew-presentation-scale',scaleBefore);
  for(const{node,inert,aria}of background){if(inert===null)node.removeAttribute('inert');else node.setAttribute('inert',inert);if(aria===null)node.removeAttribute('aria-hidden');else node.setAttribute('aria-hidden',aria);}background=[];
  stage.hidden=true;document.body.classList.remove('ew-fullscreen-active');button.setAttribute('aria-expanded','false');status.textContent='';window.EconPilot?.refresh();
  returnFocus?.focus?.({preventScroll:true});window.scrollTo(scroll.x,scroll.y);
 }
 async function exit(){if(!active||exiting)return;exiting=true;if(document.fullscreenElement===stage&&typeof document.exitFullscreen==='function'){try{await document.exitFullscreen();leave();}catch{exiting=false;status.textContent='Press Escape To Leave Browser Fullscreen.';}}else leave();}
 function enter(){if(active)return;active=true;returnFocus=document.activeElement||button;scroll={x:window.scrollX||0,y:window.scrollY||0};frameStyle=frame.getAttribute('style');scaleBefore=svg.getAttribute('data-ew-presentation-scale');window.WidgetInterface?.closeExplanation?.();
  stage.hidden=false;document.body.classList.add('ew-fullscreen-active');button.setAttribute('aria-expanded','true');move(controls,top,exitButton);move(frame,diagramBox);
  const tooltip=document.querySelector('#diagram-tooltip,#tooltip');if(tooltip)move(tooltip,stage);
  background=[...document.body.children].filter(node=>node!==stage).map(node=>({node,inert:node.getAttribute('inert'),aria:node.getAttribute('aria-hidden')}));for(const{node}of background){node.setAttribute('inert','');node.setAttribute('aria-hidden','true');}
  resize();exitButton.focus({preventScroll:true});
  // The user-gesture request is synchronous; denial/absence keeps the approved
  // in-window fallback. Never retry or alter any browser permission setting.
  if(typeof stage.requestFullscreen==='function'&&document.fullscreenEnabled!==false){try{Promise.resolve(stage.requestFullscreen()).then(()=>{if(!active&&document.fullscreenElement===stage)document.exitFullscreen?.();else schedule();}).catch(()=>{if(active){status.textContent='Expanded View Within The Browser';schedule();}});}catch{status.textContent='Expanded View Within The Browser';schedule();}}
  else status.textContent='Expanded View Within The Browser';
 }
 button.addEventListener('click',enter);exitButton.addEventListener('click',exit);
 document.addEventListener('fullscreenchange',()=>{if(!active)return;if(document.fullscreenElement===stage)schedule();else leave();});
 window.addEventListener('keydown',event=>{if(active&&event.key==='Escape'){event.preventDefault();exit();}},true);
 window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);
 new ResizeObserver(schedule).observe(top);controls.addEventListener('toggle',schedule,true);controls.addEventListener('change',schedule);document.fonts?.ready.then(schedule);
 window.EconWidgetFullscreen=Object.freeze({enter,exit,resize,profile,get active(){return active;}});
})();
