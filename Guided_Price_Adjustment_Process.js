const NS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id),svg=$('diagram'),layer=$('drawing');
let step=1,selectedCase=null;
const cases={di:{d:20,s:0,label:'Increase In Demand'},dd:{d:-20,s:0,label:'Decrease In Demand'},si:{d:0,s:20,label:'Increase In Supply'},sd:{d:0,s:-20,label:'Decrease In Supply'}};
const X=q=>90+(380/110)*q,Y=p=>410-(380/110)*p, sub=(letter,i)=>`${letter}<tspan baseline-shift="sub" font-size="9">${i}</tspan>`;
const colour={d:'#2563eb',s:'#16a34a',oldD:'#93b4f2',oldS:'#8fcea3',ink:'#374151',accent:'#4169e1',gap:'#dc2626'};
function el(tag,attrs={},html=''){let n=document.createElementNS(NS,tag);for(let [k,v] of Object.entries(attrs))n.setAttribute(k,v);n.innerHTML=html;if(tag==='text'){const plain=html.replace(/<[^>]*>/g,'').trim();if(/^[QP](?:[0-9₀₁₂]|_|[dsecp])/.test(plain)){const st=state();n.dataset.axisKind=plain[0]==='Q'?'q':'p';n.dataset.axisX=plain[0]==='Q'?+attrs.x:90;n.dataset.axisY=plain[0]==='Q'?410:Y(/^P(?:0|₀)/.test(plain)?50:st.p);}if(/^E(?:[0-9₀₁₂]|_)/.test(plain)){const st=state(),initial=/^E(?:0|₀)/.test(plain);n.dataset.pointX=X(initial?50:st.q);n.dataset.pointY=Y(initial?50:st.p);}}layer.append(n);return n;}
function line(x1,y1,x2,y2,c=colour.ink,w=2,extra={}){return el('line',{x1,y1,x2,y2,stroke:c,'stroke-width':w,...extra});}
function text(x,y,html,c=colour.ink,extra={}){return el('text',{x,y,fill:c,'text-anchor':'middle',...extra},html);}
function tip(n,description){n.dataset.tip=description.replace(/<[^>]*>/g,'');if(description.includes('<strong>'))n.dataset.tipHtml=description;n.setAttribute('tabindex','0');n.setAttribute('role','img');n.setAttribute('aria-label',n.dataset.tip);n.classList.add('has-tooltip');return n;}
function arrow(x1,y1,x2,y2,c,id,both=false){let len=Math.hypot(x2-x1,y2-y1);if(len<.01)return;let marker='marker-'+id;if(len<18){marker='small-'+layer.children.length;let size=Math.min(6,len/(both?4:2));el('marker',{id:marker,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:size,markerHeight:size,markerUnits:'userSpaceOnUse',orient:'auto-start-reverse'},`<path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="${c}"/>`);}let a={'marker-end':`url(#${marker})`};if(both){a['marker-start']=`url(#${marker})`;a['data-gap-arrow']='shortage';}return line(x1,y1,x2,y2,c,2.2,a);}

function curve(kind,shift,label,old=false){let a=kind==='d'?100+shift:-shift,b=kind==='d'?-1:1,c=old?colour[kind==='d'?'oldD':'oldS']:colour[kind];
 let qStart=Math.max(0,b>0?-a: a-105),qEnd=Math.min(shift===0?100:105,b<0?a:105-a);line(X(qStart),Y(a+b*qStart),X(qEnd),Y(a+b*qEnd),c,2.5);
 let close=Math.abs(shift)<8; let offset=close?(old? -11:11):0; if(old){let st=state();close=Math.abs(kind==='d'?st.d:st.s)<8;offset=close?-11:0;}  tip(text(X(qEnd)+14,Y(a+b*qEnd)+4+offset,label,c,{'text-anchor':'start','font-weight':'600','data-curve-label':'true'}),`${old?'Initial':'Current'} ${kind==='d'?'demand':'supply'} curve.`);
}
function guides(q,p,c){line(90,Y(p),X(q),Y(p),'#9ca3af',1.2,{'stroke-dasharray':'4 4'});line(X(q),Y(p),X(q),410,'#9ca3af',1.2,{'stroke-dasharray':'4 4'});}

function state(){let {d,s}=step>=2&&selectedCase?cases[selectedCase]:{d:0,s:0};return {d,s,q:50+(d+s)/2,p:50+(d-s)/2,qd:50+d,qs:50+s};}
function direction(v){return Math.abs(v)<1e-8?'Unchanged':v>0?'Increases':'Decreases';}
function shiftDescription(v){return v===0?'No shift':v>0?'Increase':'Decrease';}
function wrapSince(index,name){let nodes=[...layer.children].slice(index),g=el('g',{'data-part':name});for(let n of nodes)g.append(n);return g;}
function part(name,fn){let i=layer.children.length;fn();return wrapSince(i,name);}
function mute(g,active=[]){for(let n of [g,...g.querySelectorAll('*')]){if(active.includes(n.closest('[data-part]')?.dataset.part))continue;if(n.hasAttribute('stroke')&&n.getAttribute('stroke')!=='none')n.setAttribute('stroke',n.getAttribute('stroke-dasharray')?'#b4bac4':'#a6aebc');if(n.hasAttribute('fill')&&n.getAttribute('fill')!=='none')n.setAttribute('fill','#8993a2');for(let a of ['marker-start','marker-end'])if(n.hasAttribute(a))n.setAttribute(a,'url(#marker-muted)');}}
function axisLabels(v0,v1,letter,isP){let same=Math.abs(v1-v0)<1e-8;
 if(same){text(isP?78:X(v0),isP?Y(v0)+4:430,sub(letter,0)+' = '+sub(letter,1),colour.ink,isP?{'text-anchor':'end'}:{});return;}
 if(isP){let close=Math.abs(Y(v1)-Y(v0))<20;let offset=close?11:0;let y0=Y(v0)+(v1>v0?offset:-offset),y1=Y(v1)+(v1>v0?-offset:offset);text(78,y0+4,sub(letter,0),colour.ink,{'text-anchor':'end'});text(78,y1+4,sub(letter,1),colour.accent,{'text-anchor':'end'});}
 else {let close=Math.abs(X(v1)-X(v0))<38;text(X(v0),430,sub(letter,0));text(X(v1),close?450:430,sub(letter,1),colour.accent);}
}

function render(){EconDiagramPresentation.resetPresentation(svg);hideTip();let {d,s,q,p,qd,qs}=state(),changed=d!==0||s!==0,sameP=Math.abs(p-50)<1e-8,sameQ=Math.abs(q-50)<1e-8;layer.replaceChildren();
part('axes',()=>{line(90,410,470,410,colour.ink,2,{'marker-end':'url(#marker-ink)'});line(90,410,90,30,colour.ink,2,{'marker-end':'url(#marker-ink)'});text(76,32,'Price',colour.ink,{'font-weight':'600'});text(480,416,'Quantity',colour.ink,{'font-weight':'600','text-anchor':'start'});});
part('initial-guides',()=>guides(50,50));if(step>=5&&changed)part('new-guides',()=>guides(q,p));
if(d!==0)part('old-curves',()=>curve('d',0,sub('D',0),true));if(s!==0)part('old-curves',()=>curve('s',0,sub('S',0),true));
part('current-d',()=>curve('d',d,d!==0?sub('D',1):step>=5?sub('D',0):sub('D',0)));
part('current-s',()=>curve('s',s,s!==0?sub('S',1):step>=5?sub('S',0):sub('S',0)));
if(step===2&&changed){part('shift',()=>{let amount=d||s,price=d!==0?70:30;arrow(X(30),Y(price),X(30+amount),Y(price),colour.gap,'gap');text(X(30+amount/2),Y(price)-14,(amount>0?'Increase':'Decrease')+' In '+(d!==0?'Demand':'Supply'),colour.gap,{'font-weight':'600'});});}
part('adjustment',()=>{
 if(step>=4&&!sameP){for(let [k,start] of [['d',qd],['s',qs]]){let dx=X(q)-X(start),dy=Y(p)-Y(50),c=colour.gap;
 let desc=`As price ${p>50?'rises':'falls'}, quantity ${k==='d'?'demanded':'supplied'} ${q>start?'increases':'decreases'} along the current ${k==='d'?'demand':'supply'} curve towards the new equilibrium.`;
 let g=el('g',{'data-adjustment':k});let length=Math.hypot(dx,dy),size=Math.min(12,length*.20),angle=Math.atan2(dy,dx)*180/Math.PI;for(let t of [0,.33,.66]){let head=el('polygon',{points:`${size},0 0,${-size*.42} 0,${size*.42}`,fill:c,stroke:'none',transform:`translate(${X(start)+t*dx} ${Y(50)+t*dy}) rotate(${angle})`,'data-arrowhead':k});g.append(head);}tip(g,desc);
 }}

});
part('gap',()=>{
 if(step>=3&&!sameP){let left=Math.min(qd,qs),right=Math.max(qd,qs),close=Math.abs(X(qd)-X(qs))<40;
 line(90,Y(50),X(right),Y(50),'#9ca3af',1.2,{'stroke-dasharray':'4 4','data-gap-guide':'price'});
 for(let [val,k,c] of [[qd,'d',colour.d],[qs,'s',colour.s]]){line(X(val),Y(50),X(val),410,'#9ca3af',1.2,{'stroke-dasharray':'4 4','data-gap-guide':k});

 }
 let n=arrow(X(left),397,X(right),397,colour.gap,'gap',true);if(n)tip(n,`${qd>qs?'Shortage':'Surplus'} at P₀: ${qd>qs?'quantity demanded exceeds quantity supplied':'quantity supplied exceeds quantity demanded'}. The arrow shows the horizontal gap between Qd and Qs.`);
 tip(text((X(qd)+X(qs))/2,382,`${qd>qs?'Shortage':'Surplus'} at ${sub('P',0)}`,colour.gap,{'font-weight':'600','data-gap-label':'shortage'}), 'This gap is measured on the current curves at P₀. Its arrow is placed near the quantity axis for clarity.');
 }

});
part('initial-equilibrium',()=>{
 tip(el('circle',{cx:X(50),cy:Y(50),r:3.5,fill:colour.ink}), 'Initial equilibrium E₀: quantity demanded equals quantity supplied at P₀ and Q₀.');
 if(!changed)text(X(50),Y(50)-12,sub('E',0));
 else {text(X(50)+(q>=50?-18:18),Y(50)+(p>=50?22:-16),sub('E',0),colour.ink,{'text-anchor':q>=50?'end':'start'});if(step>=5){let n0=layer.children.length;tip(el('circle',{cx:X(q),cy:Y(p),r:3.5,fill:colour.accent}),'New equilibrium E₁: the current demand and supply curves intersect at P₁ and Q₁.');text(X(q)+(q>=50?18:-18),Y(p)-16,sub('E',1),colour.accent,{'text-anchor':q>=50?'start':'end'});wrapSince(n0,'new-equilibrium');}}

});
if(step===3){part('gap-intersections',()=>{for(let [val,k,c] of [[qd,'d',colour.d],[qs,'s',colour.s]])tip(el('circle',{cx:X(val),cy:Y(50),r:4.5,fill:c,'data-gap-intersection':k}),`At P₀, this point on the current ${k==='d'?'demand':'supply'} curve identifies quantity ${k==='d'?'demanded (Qd)':'supplied (Qs)'}.`);});}
part('initial-price',()=>{if(step>=5)axisLabels(50,p,'P',true);else text(78,Y(50)+4,sub('P',0),colour.ink,{'text-anchor':'end'});});
part('quantity-labels',()=>{
 let labels=[{v:50,i:'0',c:colour.ink},...(step>=5?[{v:q,i:'1',c:colour.accent}]:[])];
 if(step>=3&&changed)labels.unshift({v:qd,i:'d',c:colour.d},{v:qs,i:'s',c:colour.s});
 let groups=[];for(let item of labels){let group=groups.find(g=>Math.abs(g.v-item.v)<1e-8);if(group)group.items.push(item);else groups.push({v:item.v,items:[item]});}groups.sort((a,b)=>a.v-b.v);
 let previous=null;for(let group of groups){let width=group.items.length*20+(group.items.length-1)*15,x=X(group.v),lane=430;if(previous&&x-previous.x<(width+previous.width)/2+8)lane=previous.lane===430?460:430;
 let html=group.items.map(item=>`<tspan fill="${item.c}">${sub('Q',item.i)}</tspan>`).join(' = ');
 let n=text(x,lane,html,colour.ink,{'data-quantity-label':group.items.map(i=>i.i).join('=')});tip(n,group.items.map(item=>({'d':'Quantity demanded on the current demand curve at P₀.','s':'Quantity supplied on the current supply curve at P₀.','0':'Initial equilibrium quantity Q₀.','1':'New equilibrium quantity Q₁.'})[item.i]).join(' '));
 previous={x,width,lane};}

});
part('axis-change',()=>{for(let [visible,coords,kind] of [[step>=4&&!sameP,[55,Y(50),55,Y(p)],'price'],[step>=6&&!sameQ,[X(50),439,X(q),439],'quantity']]){if(visible){let a=arrow(...coords,colour.gap,'gap');if(a){a.setAttribute('stroke-width','1.2');a.dataset.axisChange=kind;}}}});
if(step<6){let focus={1:['current-d','current-s','initial-guides','initial-equilibrium','initial-price','quantity-labels'],2:[selectedCase?(d!==0?'current-d':'current-s'):'','shift'],3:['gap','gap-intersections','initial-price','quantity-labels'],4:['adjustment','axis-change'],5:['new-equilibrium','new-guides','initial-price','quantity-labels']}[step];for(let g of layer.querySelectorAll('[data-part]'))if(!focus.includes(g.dataset.part)&&g.dataset.part!=='axes')mute(g,focus);if(step===5){for(let n of layer.querySelectorAll('[data-quantity-label]'))if(!n.dataset.quantityLabel.split('=').includes('1'))mute(n);for(let n of layer.querySelectorAll('[data-part=initial-price] text'))if(n.textContent==='P0')mute(n);for(let n of layer.querySelectorAll('[data-part=new-guides] line'))n.setAttribute('stroke',colour.accent);}if(step===1){for(let n of layer.querySelectorAll('[data-part=initial-equilibrium] circle,[data-part=initial-equilibrium] text'))n.setAttribute('fill',colour.accent);}}
$('summary-body').innerHTML=`<tr><th scope="row">Price</th><td>P<sub>0</sub></td><td>P<sub>1</sub></td><td>${direction(p-50)}</td></tr><tr><th scope="row">Quantity</th><td>Q<sub>0</sub></td><td>Q<sub>1</sub></td><td>${direction(q-50)}</td></tr>`;
 let shiftPhrases=[];if(d!==0)shiftPhrases.push(`an ${d>0?'increase':'decrease'} in demand`);if(s!==0)shiftPhrases.push(`an ${s>0?'increase':'decrease'} in supply`);
 let shiftSentence=shiftPhrases.join(' and ');shiftSentence=shiftSentence.charAt(0).toUpperCase()+shiftSentence.slice(1);
 const outcome=v=>Math.abs(v)<1e-8?'remains unchanged':v>0?'increases':'decreases';
 let steps=['Assuming the market is initially in equilibrium at E₀.'];
 if(!changed){steps.push('There is no shift in demand or supply. The market remains in equilibrium: E₀ = E₁, with no shortage or surplus at P₀.');steps.push('Thus, equilibrium price and equilibrium quantity remain unchanged.');}
 else if(sameP){steps.push(`${shiftSentence} ${shiftPhrases.length>1?'leave':'leaves'} quantity demanded equal to quantity supplied at price P₀. There is no shortage or surplus.`);steps.push('There is no upward or downward pressure on price, so no price adjustment or movement along the curves is needed.');steps.push('The current curves meet at the new equilibrium E₁, where quantity demanded equals quantity supplied.');steps.push(`Thus, equilibrium price remains unchanged and equilibrium quantity ${outcome(q-50)}.`);}
 else{let shortage=qd>qs;steps.push(`${shiftSentence} will lead to a ${shortage?'shortage':'surplus'} at price P₀.`);steps.push(`This leads to ${shortage?'upward':'downward'} pressure on price as ${shortage?'frustrated consumers bid up the price':'producers reduce prices to clear excess stock'}.`);steps.push(`As price ${shortage?'increases':'decreases'}, quantity demanded ${shortage?'decreases':'increases'} and quantity supplied ${shortage?'increases':'decreases'}.`);steps.push('This adjustment occurs until quantity demanded and quantity supplied are equal at the new equilibrium E₁.');steps.push(`Thus, equilibrium price ${outcome(p-50)} and equilibrium quantity ${outcome(q-50)}.`);}
 let msg=steps.join(' ');$('mechanism').innerHTML='<h2>Price Adjustment Process</h2><ol>'+steps.map(step=>'<li>'+step.replace(/\b(?:increase|decrease) in (?:demand|supply)\b|\b(?:shortage|surplus)\b|\b(?:upward|downward) pressure on price\b|\bequilibrium (?:price|quantity) (?:increases|decreases)\b/gi,phrase=>'<strong>'+phrase+'</strong>')+'</li>').join('')+'</ol>';

const shortage=qd>qs;const title=['Initial Equilibrium','Choose A Case','Shortage Or Surplus','Price Adjustment','New Equilibrium','Compare Market Outcomes'][step-1];
let explanations=[
'Assuming the market is initially in equilibrium at E₀, quantity demanded equals quantity supplied at P₀ and Q₀.',
selectedCase?`An ${(d||s)>0?'increase':'decrease'} in ${d!==0?'demand':'supply'} shifts the ${d!==0?'demand':'supply'} curve ${(d||s)>0?'rightwards':'leftwards'}, from ${d!==0?'D₀ to D₁':'S₀ to S₁'}. The market price is still P₀ immediately after the shift.`:'Select one of the four cases to shift demand or supply. The initial equilibrium is held fixed.',
`At P₀, ${shortage?'quantity demanded exceeds quantity supplied, creating a shortage':'quantity supplied exceeds quantity demanded, creating a surplus'}. The dashed guides identify Qd and Qs; the horizontal arrow shows their gap.`,
`This leads to ${shortage?'upward pressure on price as frustrated consumers bid up the price':'downward pressure on price as producers reduce prices to clear excess stock'}.\n\nAs price ${shortage?'increases':'decreases'}, quantity demanded ${shortage?'decreases':'increases'} and quantity supplied ${shortage?'increases':'decreases'} along the current curves.`,
'This adjustment occurs until quantity demanded and quantity supplied are equal at the new equilibrium E₁, at price P₁ and quantity Q₁.',
`Thus, equilibrium price ${p>50?'increases':'decreases'} and equilibrium quantity ${q>50?'increases':'decreases'}. Compare E₀ with E₁ in the diagram and the table below.`
];
const emphasise=t=>t.replace(/\b(?:increase|decrease) in (?:demand|supply)\b|\b(?:shortage|surplus)\b|\b(?:upward|downward) pressure on price\b|\bequilibrium (?:price|quantity) (?:increases|decreases)\b/gi,phrase=>'<strong>'+phrase+'</strong>');
$('step-title').textContent=title;$('step-copy').innerHTML='<p>'+emphasise(explanations[step-1]).replace(/\n\n/g,'</p><p>')+'</p>';$('step-count').textContent='Step '+step+' Of 6';$('progress-bar').style.width=(step/6*100)+'%';$('progress').setAttribute('aria-valuenow',step);
$('case-selector').hidden=step!==2;$('change-case').hidden=step<3;$('thinking').hidden=step!==2;$('case-current').textContent=step===1?'Initial Equilibrium':selectedCase?cases[selectedCase].label:'Choose A Case';$('previous').disabled=step===1;$('next').disabled=step===6||(step===2&&!selectedCase);$('next').textContent=step===6?'Completed':'Next';
$('summary-section').hidden=step!==6;$('mechanism').hidden=step!==6;
for(let button of document.querySelectorAll('[data-case]'))button.setAttribute('aria-pressed',button.dataset.case===selectedCase);
$('diagram-desc').textContent=`Step ${step}: ${title}. ${explanations[step-1]}`;window.currentState={...state(),step,selectedCase,priceChange:direction(p-50),quantityChange:direction(q-50)}; EconPilot.schedule();
}
const tooltip=$('diagram-tooltip');
function hideTip(){tooltip.hidden=true;tooltip.style.display='none';}
function showTip(target,e){if(!target.dataset.tip)return;tooltip.dataset.surplus=target.id==='ps-area'?'ps':target.id==='cs-area'?'cs':'';tooltip.replaceChildren();let close=document.createElement('button');close.className='tooltip-close';close.type='button';close.textContent='×';close.setAttribute('aria-label','Close explanation');close.onclick=hideTip;let content=document.createElement('span');if(target.dataset.tipHtml)content.innerHTML=target.dataset.tipHtml;else content.textContent=target.dataset.tip;tooltip.append(content,close);tooltip.hidden=false;tooltip.style.display='block';if(innerWidth>900){let r=target.getBoundingClientRect(),xx=e?.clientX??r.x,yy=e?.clientY??r.y;tooltip.style.left=Math.max(12,Math.min(xx+12,innerWidth-tooltip.offsetWidth-12))+'px';tooltip.style.top=Math.max(12,Math.min(yy+12,innerHeight-tooltip.offsetHeight-12))+'px';}}
svg.addEventListener('pointerover',e=>{let t=e.target.closest('[data-tip]');if(t)showTip(t,e);});svg.addEventListener('pointerout',e=>{if(e.pointerType==='mouse'&&!tooltip.contains(e.relatedTarget))hideTip();});svg.addEventListener('click',e=>{let t=e.target.closest('[data-tip]');if(t)showTip(t,e);});svg.addEventListener('focusin',e=>showTip(e.target));svg.addEventListener('focusout',e=>{if(!tooltip.contains(e.relatedTarget))hideTip();});svg.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showTip(e.target);}});document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTip();});

$('change-case').onclick=()=>{step=2;render();};
$('previous').onclick=()=>{if(step>1){step--;render();}};
$('next').onclick=()=>{if(step<6&&(step!==2||selectedCase)){step++;render();}};
for(let button of document.querySelectorAll('[data-case]'))button.onclick=()=>{selectedCase=button.dataset.case;step=2;render();};
$('zoom').onclick=()=>{let on=$('frame').classList.toggle('zoomed');$('zoom').textContent=on?'Fit Diagram':'Enlarge Diagram';$('zoom').setAttribute('aria-pressed',on);};
$('reset').onclick=()=>{step=1;selectedCase=null;$('image-style').value='colour';$('frame').classList.remove('zoomed');$('zoom').textContent='Enlarge Diagram';$('zoom').setAttribute('aria-pressed','false');$('export-status').textContent='';render();};
const compact=matchMedia('(max-width:900px)');function placeExplanation(){let panel=$('walk-panel');if(compact.matches)document.querySelector('.controls').after(panel);else document.querySelector('.sidebar').prepend(panel);}compact.addEventListener('change',placeExplanation);placeExplanation();render();
