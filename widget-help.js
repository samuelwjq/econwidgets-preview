/* Shared brief help; no model or teaching logic. */
(()=>{'use strict';
 function install(bar,{kind='standard',hasExplanations=true}={}){
 // Shared help is supplementary UI, not a replacement for teaching content.
 if(bar.querySelector('.ew-help-button'))return;
 const helpButton=document.createElement('button');helpButton.type='button';helpButton.className='ew-help-button';helpButton.textContent='?';helpButton.setAttribute('aria-label','How To Use');helpButton.setAttribute('aria-haspopup','dialog');helpButton.setAttribute('aria-controls','ew-help-dialog');bar.append(helpButton);
 const helpDialog=document.createElement('dialog');helpDialog.id='ew-help-dialog';helpDialog.className='ew-help-dialog';helpDialog.setAttribute('aria-labelledby','ew-help-title');
 const guided=kind==='guided',elasticity=kind==='elasticity',policy=kind==='policy';
 const controlHint=kind==='ppc'?'Choose a mode; drag points to explore outputs.':guided?'Choose a case; use Next and Previous.':elasticity?'Adjust elasticity and choose a change.':policy?'Choose a policy; adjust its slider.':'Choose curves; adjust the sliders.';
 helpDialog.innerHTML='<div class="ew-help-heading"><h2 id="ew-help-title">How To Use</h2><button type="button" aria-label="Close Help">×</button></div><ul><li><strong>Controls:</strong> '+controlHint+'</li><li><strong>Diagram:</strong> Watch curves, outcomes and shaded areas.</li><li><strong>Explanations:</strong> Hover, tap or focus interactive items.</li><li><strong>Glossary:</strong> Expand a term for its definition.</li><li><strong>Utilities:</strong> Reset, copy or export below the diagram.</li></ul>';
 if(!hasExplanations)helpDialog.querySelectorAll('li')[2].remove();
 document.body.append(helpDialog);let helpReturnFocus;
 helpButton.addEventListener('click',()=>{helpReturnFocus=document.activeElement||helpButton;helpDialog.showModal();helpDialog.querySelector('button').focus();});
 helpDialog.querySelector('button').addEventListener('click',()=>helpDialog.close());
 helpDialog.addEventListener('close',()=>{(helpReturnFocus||helpButton).focus();});
 helpDialog.addEventListener('click',event=>{if(event.target!==helpDialog)return;const b=helpDialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)helpDialog.close();});
 helpDialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();helpDialog.close();}else if(event.key==='Tab'){event.preventDefault();helpDialog.querySelector('button').focus();}});
 }
 window.EconWidgetHelp=Object.freeze({install});
 document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('.ew-actions').forEach(bar=>install(bar,{kind:document.body.dataset.ewHelpKind||'standard'})));
})();
