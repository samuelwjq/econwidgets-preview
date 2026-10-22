
const SIM=false, NS='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id), svg=$('diagram'), layer=$('drawing');
let selectedCurve='d';
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
function state(){let d=0,s=0;if(SIM){d=+$('d-shift').value;s=+$('s-shift').value;}else{let a=+$('magnitude').value;if(selectedCurve==='d')d=a;else s=a;}return {d,s,q:50+(d+s)/2,p:50+(d-s)/2,qd:50+d,qs:50+s};}
function direction(v){return Math.abs(v)<1e-8?'Unchanged':v>0?'Increases':'Decreases';}
function shiftDescription(v){return v===0?'No shift':v>0?'Increase':'Decrease';}
function axisLabels(v0,v1,letter,isP){let same=Math.abs(v1-v0)<1e-8;
 if(same){text(isP?78:X(v0),isP?Y(v0)+4:430,sub(letter,0)+' = '+sub(letter,1),colour.ink,isP?{'text-anchor':'end'}:{});return;}
 if(isP){let close=Math.abs(Y(v1)-Y(v0))<20;let offset=close?11:0;let y0=Y(v0)+(v1>v0?offset:-offset),y1=Y(v1)+(v1>v0?-offset:offset);text(78,y0+4,sub(letter,0),colour.ink,{'text-anchor':'end'});text(78,y1+4,sub(letter,1),colour.accent,{'text-anchor':'end'});}
 else {let close=Math.abs(X(v1)-X(v0))<38;text(X(v0),430,sub(letter,0));text(X(v1),close?450:430,sub(letter,1),colour.accent);}
}
function render(){EconDiagramPresentation.resetPresentation(svg);hideTip();let {d,s,q,p,qd,qs}=state(),changed=d!==0||s!==0,sameP=Math.abs(p-50)<1e-8,sameQ=Math.abs(q-50)<1e-8;layer.replaceChildren();
 if(SIM){$('d-output').textContent=shiftDescription(d);$('s-output').textContent=shiftDescription(s);}else $('magnitude-output').textContent=shiftDescription(+$('magnitude').value);
 let csDesc='<strong>Consumer surplus (CS)</strong>: for each unit up to <strong>Q₁</strong>, the <strong>demand curve</strong> shows what consumers are <strong>willing and able to pay</strong>. They actually pay <strong>P₁</strong>. The area <strong>below the current demand curve</strong> and <strong>above P₁</strong> adds up these differences.';
 let psDesc='<strong>Producer surplus (PS)</strong>: for each unit up to <strong>Q₁</strong>, the <strong>supply curve</strong> shows the <strong>minimum price producers are willing to accept</strong>. They receive <strong>P₁</strong>. The area <strong>above the current supply curve</strong> and <strong>below P₁</strong> adds up these differences.';
 if($('cs-toggle').checked){tip(el('polygon',{id:'cs-area',class:'welfare-area',points:`90,${Y(100+d)} 90,${Y(p)} ${X(q)},${Y(p)}`,fill:'rgba(37,99,235,.18)',stroke:'#2563eb'}),csDesc);text((180+X(q))/3,(Y(100+d)+2*Y(p))/3,'CS',colour.d,{class:'welfare-label',visibility:q<14?'hidden':'visible'});}
 if($('ps-toggle').checked){tip(el('polygon',{id:'ps-area',class:'welfare-area',points:(s>0?[[0,0],[0,p],[q,p],[s,0]]:[[0,-s],[0,p],[q,p]]).map(([qv,pv])=>`${X(qv)},${Y(pv)}`).join(' '),fill:'rgba(22,163,74,.18)',stroke:'#16a34a'}),psDesc);text((180+X(q))/3,(Y(-s)+2*Y(p))/3,'PS',colour.s,{class:'welfare-label',visibility:q<14?'hidden':'visible'});}
 $('surplus-key').hidden=!$('cs-toggle').checked&&!$('ps-toggle').checked;$('cs-key').hidden=!$('cs-toggle').checked;$('ps-key').hidden=!$('ps-toggle').checked;
 line(90,410,470,410,colour.ink,2,{'marker-end':'url(#marker-ink)'});line(90,410,90,30,colour.ink,2,{'marker-end':'url(#marker-ink)'});text(76,32,'Price',colour.ink,{'font-weight':'600'});text(480,416,'Quantity',colour.ink,{'font-weight':'600','text-anchor':'start'});
 guides(50,50);if(changed)guides(q,p);
 if(d!==0)curve('d',0,sub('D',0),true);if(s!==0)curve('s',0,sub('S',0),true);
 curve('d',d,d!==0?sub('D',1):sub('D',0));curve('s',s,s!==0?sub('S',1):sub('S',0));
 if($('adjustment').checked&&!sameP){for(let [k,start] of [['d',qd],['s',qs]]){let dx=X(q)-X(start),dy=Y(p)-Y(50),c=colour.gap;
 let desc=`As price ${p>50?'rises':'falls'}, quantity ${k==='d'?'demanded':'supplied'} ${q>start?'increases':'decreases'} along the current ${k==='d'?'demand':'supply'} curve towards the new equilibrium.`;
 let g=el('g',{'data-adjustment':k});let length=Math.hypot(dx,dy),size=Math.min(12,length*.20),angle=Math.atan2(dy,dx)*180/Math.PI;for(let t of [0,.33,.66]){let head=el('polygon',{points:`${size},0 0,${-size*.42} 0,${size*.42}`,fill:c,stroke:'none',transform:`translate(${X(start)+t*dx} ${Y(50)+t*dy}) rotate(${angle})`,'data-arrowhead':k});g.append(head);}tip(g,desc);
 }}
 if($('gap').checked&&!sameP){let left=Math.min(qd,qs),right=Math.max(qd,qs),close=Math.abs(X(qd)-X(qs))<40;
 line(90,Y(50),X(right),Y(50),'#9ca3af',1.2,{'stroke-dasharray':'4 4','data-gap-guide':'price'});
 for(let [val,k,c] of [[qd,'d',colour.d],[qs,'s',colour.s]]){line(X(val),Y(50),X(val),410,'#9ca3af',1.2,{'stroke-dasharray':'4 4','data-gap-guide':k});

 }
 let n=arrow(X(left),397,X(right),397,colour.gap,'gap',true);if(n)tip(n,`${qd>qs?'Shortage':'Surplus'} at P₀: ${qd>qs?'quantity demanded exceeds quantity supplied':'quantity supplied exceeds quantity demanded'}. The arrow shows the horizontal gap between Qd and Qs.`);
 tip(text((X(qd)+X(qs))/2,382,`${qd>qs?'Shortage':'Surplus'} at ${sub('P',0)}`,colour.gap,{'font-weight':'600','data-gap-label':'shortage'}), 'This gap is measured on the current curves at P₀. Its arrow is placed near the quantity axis for clarity.');
 }
 tip(el('circle',{cx:X(50),cy:Y(50),r:3.5,fill:colour.ink}), 'Initial equilibrium E₀: quantity demanded equals quantity supplied at P₀ and Q₀.');
 if(!changed)text(X(50),Y(50)-12,sub('E',0)+' = '+sub('E',1));
 else {text(X(50)+(q>=50?-18:18),Y(50)+(p>=50?22:-16),sub('E',0),colour.ink,{'text-anchor':q>=50?'end':'start'});tip(el('circle',{cx:X(q),cy:Y(p),r:3.5,fill:colour.accent}),'New equilibrium E₁: the current demand and supply curves intersect at P₁ and Q₁.');text(X(q)+(q>=50?18:-18),Y(p)-16,sub('E',1),colour.accent,{'text-anchor':q>=50?'start':'end'});}
 axisLabels(50,p,'P',true);
 let labels=[{v:50,i:'0',c:colour.ink},{v:q,i:'1',c:colour.accent}];
 if($('gap').checked&&changed)labels.unshift({v:qd,i:'d',c:colour.d},{v:qs,i:'s',c:colour.s});
 let groups=[];for(let item of labels){let group=groups.find(g=>Math.abs(g.v-item.v)<1e-8);if(group)group.items.push(item);else groups.push({v:item.v,items:[item]});}groups.sort((a,b)=>a.v-b.v);
 let previous=null;for(let group of groups){let width=group.items.length*20+(group.items.length-1)*15,x=X(group.v),lane=430;if(previous&&x-previous.x<(width+previous.width)/2+8)lane=previous.lane===430?460:430;
 let html=group.items.map(item=>`<tspan fill="${item.c}">${sub('Q',item.i)}</tspan>`).join(' = ');
 let n=text(x,lane,html,colour.ink,{'data-quantity-label':group.items.map(i=>i.i).join('=')});tip(n,group.items.map(item=>({'d':'Quantity demanded on the current demand curve at P₀.','s':'Quantity supplied on the current supply curve at P₀.','0':'Initial equilibrium quantity Q₀.','1':'New equilibrium quantity Q₁.'})[item.i]).join(' '));
 previous={x,width,lane};}

 for(let [visible,coords,kind] of [[!sameP,[55,Y(50),55,Y(p)],'price'],[!sameQ,[X(50),439,X(q),439],'quantity']]){if(visible){let a=arrow(...coords,colour.gap,'gap');if(a){a.setAttribute('stroke-width','1.2');a.dataset.axisChange=kind;}}}
 $('summary-body').innerHTML=`<tr><th scope="row">Price</th><td>P<sub>0</sub></td><td>P<sub>1</sub></td><td>${direction(p-50)}</td></tr><tr><th scope="row">Quantity</th><td>Q<sub>0</sub></td><td>Q<sub>1</sub></td><td>${direction(q-50)}</td></tr>`;
 let shiftPhrases=[];if(d!==0)shiftPhrases.push(`an ${d>0?'increase':'decrease'} in demand`);if(s!==0)shiftPhrases.push(`an ${s>0?'increase':'decrease'} in supply`);
 let shiftSentence=shiftPhrases.join(' and ');shiftSentence=shiftSentence.charAt(0).toUpperCase()+shiftSentence.slice(1);
 const outcome=v=>Math.abs(v)<1e-8?'remains unchanged':v>0?'increases':'decreases';
 let steps=['Assuming the market is initially in equilibrium at E₀.'];
 if(!changed){steps.push('There is no shift in demand or supply. The market remains in equilibrium: E₀ = E₁, with no shortage or surplus at P₀.');steps.push('Thus, equilibrium price and equilibrium quantity remain unchanged.');}
 else if(sameP){steps.push(`${shiftSentence} ${shiftPhrases.length>1?'leave':'leaves'} quantity demanded equal to quantity supplied at price P₀. There is no shortage or surplus.`);steps.push('There is no upward or downward pressure on price, so no price adjustment or movement along the curves is needed.');steps.push('The current curves meet at the new equilibrium E₁, where quantity demanded equals quantity supplied.');steps.push(`Thus, equilibrium price remains unchanged and equilibrium quantity ${outcome(q-50)}.`);}
 else{let shortage=qd>qs;steps.push(`${shiftSentence} will lead to a ${shortage?'shortage':'surplus'} at price P₀.`);steps.push(`This leads to ${shortage?'upward':'downward'} pressure on price as ${shortage?'frustrated consumers bid up the price':'producers reduce prices to clear excess stock'}.`);steps.push(`As price ${shortage?'increases':'decreases'}, quantity demanded ${shortage?'decreases':'increases'} and quantity supplied ${shortage?'increases':'decreases'}.`);steps.push('This adjustment occurs until quantity demanded and quantity supplied are equal at the new equilibrium E₁.');steps.push(`Thus, equilibrium price ${outcome(p-50)} and equilibrium quantity ${outcome(q-50)}.`);}
 let msg=steps.join(' ');$('mechanism').innerHTML='<h2>Price Adjustment Process</h2><ol>'+steps.map(step=>'<li>'+step.replace(/\b(?:increase|decrease) in (?:demand|supply)\b|\b(?:shortage|surplus)\b|\b(?:upward|downward) pressure on price\b|\bequilibrium (?:price|quantity) (?:increases|decreases)\b/gi,phrase=>'<strong>'+phrase+'</strong>')+'</li>').join('')+'</ol>';
 $('diagram-desc').textContent=`Demand: ${shiftDescription(d)}. Supply: ${shiftDescription(s)}. Equilibrium price ${direction(p-50).toLowerCase()}, quantity ${direction(q-50).toLowerCase()}. ${msg}`;
 window.currentState={...state(),priceChange:direction(p-50),quantityChange:direction(q-50)};
 EconPilot.schedule();
}
const tooltip=$('diagram-tooltip');
function hideTip(){tooltip.hidden=true;tooltip.style.display='none';}
function showTip(target,e){if(!$('tooltips').checked||!target.dataset.tip)return;tooltip.dataset.surplus=target.id==='ps-area'?'ps':target.id==='cs-area'?'cs':'';tooltip.replaceChildren();let close=document.createElement('button');close.className='tooltip-close';close.type='button';close.textContent='×';close.setAttribute('aria-label','Close explanation');close.onclick=hideTip;let content=document.createElement('span');if(target.dataset.tipHtml)content.innerHTML=target.dataset.tipHtml;else content.textContent=target.dataset.tip;tooltip.append(content,close);tooltip.hidden=false;tooltip.style.display='block';if(innerWidth>900){let r=target.getBoundingClientRect(),xx=e?.clientX??r.x,yy=e?.clientY??r.y;tooltip.style.left=Math.max(12,Math.min(xx+12,innerWidth-tooltip.offsetWidth-12))+'px';tooltip.style.top=Math.max(12,Math.min(yy+12,innerHeight-tooltip.offsetHeight-12))+'px';}}
svg.addEventListener('pointerover',e=>{let t=e.target.closest('[data-tip]');if(t)showTip(t,e);});svg.addEventListener('pointerout',e=>{if(e.pointerType==='mouse'&&!tooltip.contains(e.relatedTarget))hideTip();});svg.addEventListener('click',e=>{let t=e.target.closest('[data-tip]');if(t)showTip(t,e);});svg.addEventListener('focusin',e=>showTip(e.target));svg.addEventListener('focusout',e=>{if(!tooltip.contains(e.relatedTarget))hideTip();});svg.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showTip(e.target);}});document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTip();});
for(let n of document.querySelectorAll('input,select:not(#image-style)'))n.addEventListener('input',render);
if(!SIM){for(let k of ['d','s'])$(k==='d'?'choose-demand':'choose-supply').onclick=()=>{if(selectedCurve!==k)$('magnitude').value=0;selectedCurve=k;$('choose-demand').setAttribute('aria-pressed',k==='d');$('choose-supply').setAttribute('aria-pressed',k==='s');$('magnitude').setAttribute('aria-label',(k==='d'?'Demand':'Supply')+' shift magnitude');render();};}
$('zoom').onclick=()=>{let on=$('frame').classList.toggle('zoomed');$('zoom').textContent=on?'Fit diagram':'Enlarge diagram';$('zoom').setAttribute('aria-pressed',on);};
$('reset').onclick=()=>{if(SIM){$('d-shift').value=0;$('s-shift').value=0;}else{selectedCurve='d';$('choose-demand').setAttribute('aria-pressed','true');$('choose-supply').setAttribute('aria-pressed','false');$('magnitude').setAttribute('aria-label','Demand shift magnitude');$('magnitude').value=0;}for(let id of ['tooltips','gap'])$(id).checked=true;$('adjustment').checked=false;$('cs-toggle').checked=false;$('ps-toggle').checked=false;$('image-style').value='colour';$('frame').classList.remove('zoomed');$('zoom').textContent='Enlarge diagram';$('zoom').setAttribute('aria-pressed','false');$('export-status').textContent='';render();};
render();
