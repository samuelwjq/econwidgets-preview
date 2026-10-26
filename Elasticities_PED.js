const KIND='PED', TITLE='Price Elasticity Of Demand';
// Topic calculations use initial-equilibrium point elasticity and linear curves.
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg',priceTopic=['PED','PES'].includes(KIND);
const svg=$('diagram'),layer=$('drawing'),PLOT_MAX=110,X=q=>90+380*q/PLOT_MAX,Y=p=>410-380*p/PLOT_MAX;
let sign=1, activeShift=false;
function elasticity(){const t=+$('elasticity').value;return priceTopic?(t===2?Infinity:t/(2-t)):t;}
const sub=(a,i)=>`${a}<tspan baseline-shift="sub" font-size="9">${i}</tspan>`,eq=(a,b)=>Math.abs(a-b)<1e-8;
function classify(e){if(priceTopic&&e===Infinity)return 'Perfectly price elastic '+(KIND==='PED'?'demand':'supply');if(priceTopic)return eq(e,0)?'Perfectly price inelastic '+(KIND==='PED'?'demand':'supply'):eq(e,1)?'Unit elastic '+(KIND==='PED'?'demand':'supply'):(e<1?'Price inelastic ':'Price elastic ')+(KIND==='PED'?'demand':'supply');if(KIND==='XED'){if(e===0)return 'Unrelated goods';return (eq(Math.abs(e),1)?'Unit XED: ':Math.abs(e)<1?'Weak ':'Strong ')+(e<0?'complements':'substitutes');}return e<0?'Inferior':eq(e,0)?'No income response':e<1?'Normal (essential)':eq(e,1)?'Normal (unit income elastic)':'Normal (luxury)';}
function state(){const e=elasticity(),shock=priceTopic?(activeShift?sign:0):sign*+$('shock').value,delta=priceTopic?shock*25:50*e*shock/100;let p,q,qd,qs;
if(priceTopic&&e===Infinity){p=50;q=50+delta;qd=KIND==='PED'?()=>q:p0=>50-(p0-50)+delta;qs=KIND==='PES'?()=>q:p0=>50+(p0-50)+delta;}
else if(KIND==='PED'){p=50-delta/(1+e);q=50+e*delta/(1+e);qd=p0=>50-e*(p0-50);qs=p0=>50+(p0-50)+delta;}
else if(KIND==='PES'){p=50+delta/(1+e);q=50+e*delta/(1+e);qd=p0=>50-(p0-50)+delta;qs=p0=>50+e*(p0-50);}
else{p=50+delta/2;q=50+delta/2;qd=p0=>50-(p0-50)+delta;qs=p0=>50+(p0-50);}
return {e,shock,delta,p,q,qd,qs,tr0:2500,tr1:p*q,priceEffect:(p-50)*50,quantityEffect:(q-50)*p};}
function add(tag,attrs={},html=''){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);n.innerHTML=html;if(tag==='text'){const plain=html.replace(/<[^>]*>/g,'').trim();if(/^[QP](?:[0-9₀₁₂]|_|[dsecp])/.test(plain)){const st=state();n.dataset.axisKind=plain[0]==='Q'?'q':'p';n.dataset.axisX=plain[0]==='Q'?+attrs.x:90;n.dataset.axisY=plain[0]==='Q'?410:Y(/^P(?:0|₀)/.test(plain)?50:st.p);}if(/^E(?:[0-9₀₁₂]|_)/.test(plain)){const st=state(),initial=/^E(?:0|₀)/.test(plain);n.dataset.pointX=X(initial?50:st.q);n.dataset.pointY=Y(initial?50:st.p);}}layer.append(n);return n;}
function text(x,y,html,c='#374151',attrs={}){return add('text',{x,y,fill:c,'text-anchor':'middle',...attrs},html);}
function line(x1,y1,x2,y2,c='#374151',attrs={}){return add('line',{x1,y1,x2,y2,stroke:c,'stroke-width':2,...attrs});}
function tip(n,message){n.dataset.tip=message;n.setAttribute('tabindex','0');n.setAttribute('role','img');n.setAttribute('aria-label',message);return n;}
function labelCurveEndpoint(pt,name,c,description){
 const label=tip(text(pt[0]+14,pt[1]+4,name,c,{'text-anchor':'start','font-weight':'600','data-curve-label':'true'}),description);
 label.dataset.endpointX=pt[0];label.dataset.endpointY=pt[1];return label;
}
// Topic 2 endpoint convention: show the entire nonnegative curve up to
// the plot boundary. No fixed-length trimming or equilibrium-dependent centring.
function curveSegment(fn,name){
 const st=state();
 const pivot=priceTopic&&name===sub(KIND==='PED'?'D':'S',0);
 if(pivot&&st.e===Infinity)return {points:[[0,50],[PLOT_MAX,50]],horizontal:true};
 // The model expresses quantity as a function of price, including vertical
 // curves (constant quantity). Intersect that line with the positive square.
 const k=(fn(51)-fn(49))/2,b=fn(50)-k*50;
 let lo=0,hi=PLOT_MAX;
 if(Math.abs(k)<1e-12){if(b<0||b>PLOT_MAX)throw Error('Curve outside plot');}
 else{const a=-b/k,z=(PLOT_MAX-b)/k;lo=Math.max(lo,Math.min(a,z));hi=Math.min(hi,Math.max(a,z));}
 if(hi<lo)throw Error('Curve outside plot');
 return {points:[lo,hi].map(p=>[Math.max(0,Math.min(PLOT_MAX,fn(p))),p]),horizontal:false};
}
function curve(fn,name,c){
 const geometry=curveSegment(fn,name),pts=geometry.points.map(([q,p])=>[X(q),Y(p)]);
 add('polyline',{points:pts.map(p=>p.join(',')).join(' '),stroke:c,'stroke-width':2.5,fill:'none','clip-path':'url(#plot)','data-curve-extent':'positive-plot-boundaries'});
 const endpoint=pts.reduce((best,pt)=>pt[0]>best[0]+.01||Math.abs(pt[0]-best[0])<=.01&&pt[1]<best[1]?pt:best,pts[0]);
 labelCurveEndpoint(endpoint,name,c,geometry.horizontal?'Perfectly price elastic '+(KIND==='PED'?'demand':'supply')+' at P₀.':'The '+name.replace(/<[^>]*>/g,'')+' curve.');
}

function guides(q,p){line(90,Y(p),X(q),Y(p),'#9ca3af',{'stroke-width':1,'stroke-dasharray':'4 4'});line(X(q),Y(p),X(q),410,'#9ca3af',{'stroke-width':1,'stroke-dasharray':'4 4'});}
function labels(q,p){if(eq(p,50))text(78,Y(p)+4,sub('P',0)+' = '+sub('P',1),'#374151',{'text-anchor':'end'});else{const close=Math.abs(Y(p)-Y(50))<24,offset=close?12:0;const a=Y(50)+(p>50?offset:-offset),b=Y(p)+(p>50?-offset:offset);text(78,a+4,sub('P',0),'#374151',{'text-anchor':'end'});text(78,b+4,sub('P',1),'#4169e1',{'text-anchor':'end'});}
const values=[{v:50,l:sub('Q',0),c:'#374151'},{v:q,l:sub('Q',1),c:'#4169e1'}];if($('adjustment').checked&&!eq(p,50)){const st=state();values.push({v:st.qd(50),l:sub('Q','d'),c:'#2563eb'},{v:st.qs(50),l:sub('Q','s'),c:'#16a34a'});}values.sort((a,b)=>a.v-b.v);let groups=[];for(const a of values){let g=groups.find(g=>eq(g.v,a.v));if(g)g.labels.push(a.l);else groups.push({v:a.v,labels:[a.l],c:a.c});}let previous=-Infinity,lane=434;for(const g of groups){lane=X(g.v)-previous<45?lane+16:434;text(X(g.v),lane,g.labels.join(' = '),g.c);previous=X(g.v);}}

function direction(v){return eq(v,0)?'Unchanged':v>0?'Increases':'Decreases';}function pct(v){const n=eq(v,0)?0:v;return (n>0?'+':'')+n.toFixed(1)+'%';}
function row(label,initial,newValue,change){return `<tr><th scope="row">${label}</th><td>${initial}</td><td>${newValue}</td><td>${change}</td></tr>`;}
function render(){EconDiagramPresentation.resetPresentation(svg);hideTip();if(!priceTopic){const e=elasticity(),limit=e*sign<0?Math.min(50,Math.floor((100/Math.abs(e)+1e-8)/5)*5):50;$('shock').max=limit;if(+$('shock').value>limit)$('shock').value=limit;}const s=state(),{e,shock,delta,p,q}=s,changed=!eq(delta,0);layer.replaceChildren();$('elasticity-label').textContent=classify(e);$('elasticity').setAttribute('aria-valuetext',classify(e));if(!priceTopic){$('shock-value').textContent=Math.abs(shock)+'%';$('shock').setAttribute('aria-valuetext',Math.abs(shock)+' percent');}
// Shade an exact decomposition: ΔTR = Q₀(P₁−P₀) + P₁(Q₁−Q₀).
const key=[];
if(priceTopic&&$('tr').checked&&changed){for(const [type,a,b,c,d,value,fill]of [['price',0,50,50,p,s.priceEffect,'#ede9fe'],['quantity',50,q,0,p,s.quantityEffect,'#fef3c7']]){if(eq(value,0))continue;tip(add('rect',{x:X(Math.min(a,b)),y:Y(Math.max(c,d)),width:Math.abs(X(b)-X(a)),height:Math.abs(Y(d)-Y(c)),fill,stroke:type==='price'?'#7c3aed':'#b45309','stroke-width':1,'data-area':type}),`${type==='price'?'Price':'Quantity'} effect: ${value>0?'gain':'loss'} in total revenue/expenditure from the ${type==='price'?'price change on the initial quantity Q₀':'quantity change valued at the new price P₁'}.`);key.push(type);}}
line(90,410,470,410,'#374151',{'marker-end':'url(#arrow)'});line(90,410,90,30,'#374151',{'marker-end':'url(#arrow)'});text(505,415,'Quantity');text(66,28,'Price');
const oldD=p0=>50-(KIND==='PED'?e:1)*(p0-50),oldS=p0=>50+(KIND==='PES'?e:1)*(p0-50);
if(changed)curve(KIND==='PED'?oldS:oldD,sub(KIND==='PED'?'S':'D',0),KIND==='PED'?'#8fcea3':'#93b4f2');
curve(s.qd,changed&&KIND!=='PED'?sub('D',1):sub('D',0),'#2563eb');curve(s.qs,changed&&KIND==='PED'?sub('S',1):sub('S',0),'#16a34a');
guides(50,50);if(changed)guides(q,p);labels(q,p);
function arrow(x1,y1,x2,y2,label,attrs={}){if(Math.hypot(x2-x1,y2-y1)<.1)return;const n=line(x1,y1,x2,y2,'#dc2626',{'stroke-width':1.3,'marker-end':'url(#change-arrow)',...attrs});if(label)tip(n,label);return n;}
add('defs',{},'<marker id="change-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1.5 L9 5 L1 8.5Z" fill="#dc2626"/></marker>');
if(!eq(p,50)){arrow(38,Y(50),38,Y(p),'Equilibrium price '+direction(p-50).toLowerCase(),{'data-axis-change':'price'});}
if(!eq(q,50)){arrow(X(50),474,X(q),474,'Equilibrium quantity '+direction(q-50).toLowerCase(),{'data-axis-change':'quantity'});}
if($('adjustment').checked&&changed){const qd=s.qd(50),qs=s.qs(50);if(!eq(p,50)){
const left=Math.min(qd,qs),right=Math.max(qd,qs),gap=qd>qs?'Shortage':'Surplus';
const gapArrow=arrow(X(left),391,X(right),391,gap+' at P₀: the gap between quantity demanded and quantity supplied.',{'data-adjustment':'gap','data-gap-arrow':'shortage','marker-start':'url(#change-arrow)'});
text((X(left)+X(right))/2,376,gap+' at '+sub('P',0),'#dc2626',{'data-adjustment':'caption','data-gap-label':'shortage'});
for(const [start,k,c] of [[qd,'d','#2563eb'],[qs,'s','#16a34a']]){line(X(start),Y(50),X(start),410,'#9ca3af',{'stroke-width':1,'stroke-dasharray':'4 4','data-adjustment':'guide'});
const dx=X(q)-X(start),dy=Y(p)-Y(50),len=Math.hypot(dx,dy);if(len>.1){const angle=Math.atan2(dy,dx)*180/Math.PI,size=Math.min(10,len*.15);for(const t of [.15,.45,.75])tip(add('polygon',{points:`${size},0 0,${-size*.42} 0,${size*.42}`,fill:'#dc2626',transform:`translate(${X(start)+t*dx} ${Y(50)+t*dy}) rotate(${angle})`,'data-adjustment':'movement'}),'As price adjusts, quantity '+(k==='d'?'demanded':'supplied')+' moves along the current curve towards E₁.');}}
}else text(350,376,'No price adjustment: equilibrium price is unchanged.','#dc2626',{'data-adjustment':'caption'});}

tip(add('circle',{cx:X(50),cy:Y(50),r:4,fill:'#374151'}),'Initial equilibrium E₀ at P₀ and Q₀.');
if(!changed)text(X(50)+18,Y(50)-16,sub('E',0)+' = '+sub('E',1),'#374151',{'text-anchor':'start'});
else{text(X(50)+(q>=50?-16:16),Y(50)+(p>=50?22:-18),sub('E',0),'#374151',{'text-anchor':q>=50?'end':'start'});tip(add('circle',{cx:X(q),cy:Y(p),r:4,fill:'#4169e1'}),'New equilibrium E₁: quantity demanded equals quantity supplied.');text(X(q)+(q>=50?16:-16),Y(p)-16,sub('E',1),'#4169e1',{'text-anchor':q>=50?'start':'end'});}
$('area-key').hidden=key.length===0;$('area-key').innerHTML=key.map(k=>`<span class="key-item"><i class="${k}"></i><i class="hatch-${k}"></i>${k==='price'?'Price':'Quantity'} effect (colour / grayscale)</span>`).join('');
let rows=row('Elasticity','—','—',classify(e));rows+=row('Equilibrium price','P₀','P₁',direction(p-50));rows+=row('Equilibrium quantity','Q₀','Q₁',direction(q-50));
if(priceTopic){rows+=row('Total revenue/expenditure','P₀ × Q₀','P₁ × Q₁',direction(s.tr1-s.tr0));rows+=row('Price effect','—','Q₀ × (P₁ − P₀)',eq(s.priceEffect,0)?'No change':s.priceEffect>0?'Gain':'Loss');rows+=row('Quantity effect','—','P₁ × (Q₁ − Q₀)',eq(s.quantityEffect,0)?'No change':s.quantityEffect>0?'Gain':'Loss');$('tr-result').textContent='Total revenue/expenditure: '+direction(s.tr1-s.tr0).toLowerCase();}
else{rows+=row(KIND==='XED'?'Related-good price':'Income','Initial level','Changed level',direction(shock));rows+=row('Demand','D₀','D₁',direction(delta));}
$('summary-body').innerHTML=rows;
const explanation=EconElasticityExplanation.build(KIND,s);
$('mechanism').innerHTML=explanation.html;
$('model-note').textContent=priceTopic?'Model: straight curves (horizontal at infinity); elasticity is measured at E₀ and varies along the curve. For a finite shift, the actual TR/TE change can differ from the usual TR/TE rule based on initial PED—including when initial |PED| = 1. PES does not itself determine a TR rule.': 'Model: the selected elasticity gives the proportional demand change at P₀. This shifts demand horizontally; the final equilibrium quantity change also depends on the fixed supply curve.'+(!priceTopic&&+$('shock').max<50?' Change size is limited to '+$('shock').max+'% at this elasticity and direction to keep quantity demanded at P₀ nonnegative.':'');
$('diagram-desc').textContent=classify(e)+'. '+explanation.plain;window.widgetState=s; EconPilot.schedule();
}
function hideTip(){$('tooltip').hidden=true;$('tooltip').style.display='none';}
function showTip(n,event){if(!$('tooltips').checked||!n?.dataset.tip)return;const t=$('tooltip');t.replaceChildren();const span=document.createElement('span');span.textContent=n.dataset.tip;const close=document.createElement('button');close.className='tooltip-close';close.textContent='×';close.setAttribute('aria-label','Close explanation');close.onclick=hideTip;t.append(span,close);t.hidden=false;t.style.display='block';if(innerWidth>900){const r=n.getBoundingClientRect();t.style.left=Math.max(12,Math.min(event?.clientX??r.left,innerWidth-t.offsetWidth-12))+'px';t.style.top=Math.max(12,Math.min((event?.clientY??r.top)+12,innerHeight-t.offsetHeight-12))+'px';}}
svg.addEventListener('pointerover',e=>{if(e.pointerType==='mouse')showTip(e.target.closest('[data-tip]'),e);});svg.addEventListener('click',e=>showTip(e.target.closest('[data-tip]'),e));svg.addEventListener('focusin',e=>showTip(e.target));svg.addEventListener('focusout',hideTip);svg.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();showTip(e.target);}});document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTip();});document.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-tip],#tooltip'))hideTip();});
function choose(n){sign=n;$('increase').setAttribute('aria-pressed',n===1);$('decrease').setAttribute('aria-pressed',n===-1);render();}
function activate(n){if(priceTopic)activeShift=true;else if(+$('shock').value===0)$('shock').value=25;choose(n);}$('increase').onclick=()=>activate(1);$('decrease').onclick=()=>activate(-1);
for(const id of ['elasticity',...(!priceTopic?['shock']:[]),'tooltips','adjustment',...(priceTopic?['tr']:[])])$(id).addEventListener('input',render);
$('zoom').onclick=()=>{const on=$('frame').classList.toggle('zoomed');$('zoom').textContent=on?'Fit diagram':'Enlarge diagram';$('zoom').setAttribute('aria-pressed',on);};
$('reset').onclick=()=>{$('elasticity').value=1;activeShift=false;if(!priceTopic)$('shock').value=0;$('adjustment').checked=false;$('tooltips').checked=true;if(priceTopic)$('tr').checked=true;document.querySelectorAll('details').forEach(n=>n.open=false);$('frame').classList.remove('zoomed');$('zoom').textContent='Enlarge diagram';$('zoom').setAttribute('aria-pressed','false');$('export-status').textContent='';choose(1);};
render();
