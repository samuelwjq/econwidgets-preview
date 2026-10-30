
'use strict';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const policies={
none:{name:'No Policy'},
ceiling:{name:'Price Ceiling',label:'Maximum price',min:20,max:80,value:45,glossary:'ceiling'},
floor:{name:'Price Floor',label:'Minimum price',min:20,max:80,value:75,glossary:'floor'},
wage:{name:'Minimum Wage',label:'Minimum wage',min:20,max:80,value:75,glossary:'wage'},
quota:{name:'Quota',label:'Maximum quantity',min:0,max:100,value:25,glossary:'quota'},
specific:{name:'Indirect Specific Tax',label:'per unit Tax',min:0,max:60,value:20,glossary:'specific'},
advalorem:{name:'Indirect Ad-Valorem Tax',label:'Tax Rate',min:0,max:300,value:30,glossary:'advalorem'},
indirect:{name:'Indirect Subsidy (specific)',label:'per-unit subsidy',min:0,max:60,value:20,glossary:'indirect'},
direct:{name:'Direct Subsidy',label:'per-unit subsidy',min:0,max:60,value:20,glossary:'direct'}
};
const values=Object.fromEntries(Object.entries(policies).map(([k,p])=>[k,p.value??0]));
const D=q=>100-q,S=q=>q;const baseline={q:50,pc:50,pp:50,cs:1250,ps:1250,g:0,tw:2500,dwl:0};
// Prices are inverse demand/supply values; ad-valorem tax is a percentage of the pre-tax producer price.
function calculate(policy,v){
 let q=50,pc=50,pp=50,qd=50,qs=50,g=0,binding=false,fiscal='';
 if(policy==='ceiling'&&v<50){binding=true;pc=pp=v;qd=100-v;qs=v;q=qs;}
 if((policy==='floor'||policy==='wage')&&v>50){binding=true;pc=pp=v;qd=100-v;qs=v;q=qd;}
 if(policy==='quota'&&v<50){binding=true;q=v;pc=pp=D(q);qd=qs=q;}
 if(policy==='specific'){q=(100-v)/2;pc=D(q);pp=S(q);g=v*q;fiscal='revenue';}
 if(policy==='advalorem'){const r=v/100;q=100/(2+r);pc=D(q);pp=S(q);g=(pc-pp)*q;fiscal='revenue';}
 if(policy==='indirect'||policy==='direct'){q=(100+v)/2;pc=D(q);pp=S(q);g=-v*q;fiscal='expenditure';}
 if(!['ceiling','floor','wage'].includes(policy))qd=qs=q;
 const cs=(100-pc)*q-q*q/2,ps=pp*q-q*q/2,tw=cs+ps+g;
 return {policy,v,q,pc,pp,qd,qs,cs,ps,g,tw,dwl:Math.max(0,2500-tw),binding,fiscal};
}
const direction=n=>Math.abs(n)<1e-7?'Unchanged':n>0?'Increases':'Decreases';
const level=n=>Math.abs(n)<1e-7?'Unchanged':n>0?'Higher':'Lower';
function policyLevel(k,v){const p=policies[k];if(k==='none')return 'No policy';if(k==='ceiling')return v<50?'Effective ceiling':'Not effective ceiling';if(k==='floor'||k==='wage')return v>50?'Effective '+(k==='wage'?'minimum wage':'floor'):'Not effective '+(k==='wage'?'minimum wage':'floor');if(k==='quota')return v===0?'No output':v<50?'Effective quota':'Not effective quota';if(v===0)return k.includes('subsidy')||['indirect','direct'].includes(k)?'No subsidy':'No tax';const t=(v-p.min)/(p.max-p.min);return t<.34?'Low':t<.67?'Moderate':'High';}
function formatNotation(value){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replace(/\b([PWQL])_([a-z]+)/g,'$1<sub>$2</sub>').replace(/\b([QL])(dd|ss|quota)\b/g,'$1<sub>$2</sub>');}
const contextualGlossary={
 quantityTraded:['none','ceiling','floor','wage','quota','specific','advalorem','indirect','direct'],
 shortage:['ceiling','quota','specific','advalorem','direct'],
 surplus:['floor','indirect'],
 unemployment:['wage'],retrenchment:['wage'],blackMarket:['ceiling'],
 governmentRevenue:['specific','advalorem'],governmentExpenditure:['indirect','direct']
};
function glossaryRelevant(id,policy){return !contextualGlossary[id]||contextualGlossary[id].includes(policy);}
const glossary=[
['ceiling','Price Control · Price Ceiling / Maximum Price','A price ceiling refers to a government-imposed price above which firms are not legally allowed to charge. For it to be effective, it is set below the market equilibrium price.'],
['floor','Price Control · Price Floor / Minimum Price','A price floor refers to a government-imposed price below which producers are not legally allowed to charge. For it to be effective, it is set above the market equilibrium price.'],
['wage','Minimum Wage','A price floor in the labour market.'],
['quota','Quantity Control · Quota','A quota is the maximum quantity below the market equilibrium quantity, set by the government, of a good that can be bought or sold in the market.'],
['taxes','Taxes','Taxes are involuntary payment of funds to the government by a household or firm for which the household or firm receives no good or service in return.'],
['indirectTaxes','Indirect Taxes','Taxes on consumer expenditure which are paid to the tax authorities, not by the consumers but indirectly by the suppliers of the goods or services.'],
['specific','Specific Tax','A specific tax or per unit tax is a fixed amount of tax on per unit of good sold.'],
['advalorem','Ad-Valorem Tax','An ad-valorem tax is an indirect tax of a certain percentage of the price of the good. In this widget, the percentage is applied to the pre-tax price received by producers: P_c = (1 + tax rate) × Pₚ.'],
['subsidies','Subsidies','Subsidies are the payment of money to a household or firm by the government for which it receives no good or service in return.'],
['indirect','Indirect Subsidies','Subsidies on expenditure. Paid indirectly to the suppliers of the goods or services and consumers benefit through lowered prices. A subsidy is usually considered an indirect subsidy (a negative indirect tax), where the government gives an amount of money to producers for each unit sold.'],
['direct','Direct Subsidy','A subsidy, grant or voucher paid directly to consumers or households to purchase goods or services. This widget models a fixed subsidy per unit bought.'],
['quantityTraded','Quantity Traded','The quantity actually bought and sold. Under an effective price ceiling, this is quantity supplied; under an effective price floor without government purchases, it is quantity demanded. An effective quota limits the quantity traded to Q_quota. In the labour market, actual employment is the quantity of labour demanded at the minimum wage.'],
['shortage','Shortage','A market condition where quantity demanded exceeds quantity supplied (Qdd > Qss). More is demanded than producers are willing and able to supply at that price. An effective ceiling makes this shortage persistent. With taxes, a consumer subsidy or an effective quota, the shortage at the initial price is temporary as the market price adjusts.'],
['surplus','Surplus','A market condition where quantity supplied exceeds quantity demanded (Qss > Qdd). More is supplied than consumers are willing and able to buy at that price. An effective price floor makes this surplus persistent. With a producer subsidy, the surplus at the initial price is temporary as the market price adjusts.'],
['unemployment','Unemployment','In this diagram, the units of labour (workers) willing to work at W₁ but not employed. It is the difference between labour supplied and labour demanded at the minimum wage (Lss − Ldd).'],
['retrenchment','Retrenchment','In this diagram, the reduction in employment from L₀ to L₁ following an effective minimum wage, represented as workers losing their jobs. This interpretation assumes that the reduction in employment occurs through retrenchment.'],
['blackMarket','Potential Black Market Price','P_bm is the price on the demand curve at the restricted quantity available under an effective price ceiling. It illustrates the market-clearing price if that quantity were resold illegally. Actual illegal-market prices may differ. The widget continues to evaluate legal-market welfare at the ceiling price.'],
['governmentRevenue','Government Revenue','Tax revenue collected by the government. Its area is the per-unit tax multiplied by the quantity traded, between P_c and Pₚ up to Q₁. Add it to CS + PS when calculating Total Welfare. The tax-revenue rectangle is a transfer to government, not itself deadweight loss.'],
['governmentExpenditure','Government Expenditure','Subsidy expenditure paid by the government. Its area is the per-unit subsidy multiplied by the quantity traded, between P_c and Pₚ up to Q₁. Subtract it from CS + PS when calculating Total Welfare. The expenditure rectangle is not itself deadweight loss; where it overlaps CS and PS, subtract it once.'],
['cs','Consumer Surplus','The difference between what consumers are willing and able to pay and what they actually pay, summed over the units bought. In the labour market, this is the surplus received by employers.'],
['ps','Producer Surplus','The difference between the revenue producers receive and the minimum amount they are willing to accept, summed over the units sold. In the labour market, this is the surplus received by workers.'],
['tw','Total Welfare','The sum of consumer surplus and producer surplus. Add government revenue or subtract government expenditure when the policy involves these transfers. No externalities are assumed.'],
['dwl','Deadweight Loss','The reduction in total welfare relative to the efficient no-policy equilibrium. With no externalities, both under-trading and over-trading can reduce total welfare.']
];
glossary.forEach(([id,name,text])=>{const el=document.createElement('details');el.id='glossary-'+id;const title=document.createElement('summary');title.textContent=name;const p=document.createElement('p');p.innerHTML=formatNotation(text);el.append(title,p);$('glossary').append(el);});
let current=calculate('none',0);
function configure(){for(const id of ['show-cs','show-ps','show-g'])$(id).checked=false;const k=$('policy-select').value,p=policies[k];$('slider-card').hidden=k==='none';if(k!=='none'){Object.assign($('policy-slider'),{min:p.min,max:p.max,value:values[k]});$('slider-label').textContent=p.label;const taxSub=['specific','advalorem','indirect','direct'].includes(k);$('slider-min').textContent=taxSub?'None':'Lower';$('slider-max').textContent=taxSub?'High':'Higher';}$('tooltip').hidden=true;render();}
const palette={cs:'#2563eb',ps:'#16a34a',g:'#8b5cf6',dwl:'#dc2626',tr:'#4169e1'};
const X=q=>112+3*q,Y=p=>432-p/120*360;
function add(tag,attrs={},parent=$('diagram-plot')){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);parent.append(e);return e;}
function text(x,y,str,attrs={},tip){str=str.replace(/\b([QL])(dd|ss|quota)\b/g,'$1_$2');const e=add('text',{x,y,...attrs});str.split(/([PWQLE]_[a-z]+)/g).forEach(part=>{const m=part.match(/^([PWQLE])_([a-z]+)$/);if(m){e.append(document.createTextNode(m[1]));const sub=add('tspan',{'baseline-shift':'sub','font-size':9},e);sub.textContent=m[2];}else e.append(document.createTextNode(part));});if(tip)target(e,tip);return e;}
function line(q1,p1,q2,p2,attrs={}){return add('line',{x1:X(q1),y1:Y(p1),x2:X(q2),y2:Y(p2),...attrs});}
function target(el,tip){el.dataset.tip=tip;el.setAttribute('tabindex','0');el.setAttribute('role','button');el.setAttribute('aria-label',tip);el.classList.add('diagram-tooltip-target');if($('show-tooltips').checked){const title=add('title',{},el);title.textContent=tip;}return el;}
function shade(kind,points,tip){const e=add('polygon',{points:points.map(([q,p])=>X(q)+','+Y(p)).join(' '),fill:palette[kind],'fill-opacity':'.20',stroke:palette[kind],'stroke-width':1,class:'areas','data-area':kind});e.labelPoints=points.map(([q,p])=>[X(q),Y(p)]);target(e,tip);}
function labelAreas(parent){
 if(!$('show-tooltips').checked)return;
 for(const area of parent.querySelectorAll('.areas')){
  const kind=area.dataset.area;if(!['cs','ps','dwl','tr'].includes(kind))continue;
  const points=area.labelPoints;let twiceArea=0,cx=0,cy=0;
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],cross=a[0]*b[1]-b[0]*a[1];twiceArea+=cross;cx+=(a[0]+b[0])*cross;cy+=(a[1]+b[1])*cross;}
  if(Math.abs(twiceArea)<1e-8)continue;cx/=3*twiceArea;cy/=3*twiceArea;
  const label=text(cx,cy,kind==='tr'?'TR/TE':kind.toUpperCase(),{'text-anchor':'middle','dominant-baseline':'middle',fill:palette[kind],class:'area-label','data-area-label':kind,'aria-hidden':'true'});parent.append(label);
  // Keep every corner of the text box inside the shaded polygon, even for small DWL triangles.
  const inside=(x,y)=>{let sign=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],cross=(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]);if(Math.abs(cross)<1e-7)continue;const next=Math.sign(cross);if(sign&&sign!==next)return false;sign=next;}return true;};
  let fits=false;for(let font=15;font>=15;font-=.5){EconDiagramPresentation.styleText(label,'small');const b=label.getBBox(),pad=font*.12;if([[b.x-pad,b.y-pad],[b.x+b.width+pad,b.y-pad],[b.x-pad,b.y+b.height+pad],[b.x+b.width+pad,b.y+b.height+pad]].every(([x,y])=>inside(x,y))){fits=true;break;}}if(!fits)label.remove();
 }
}
function curve(points,colour,tip){
 // Reserve A Right-Hand Label Gutter. Clip The Displayed Segment Only;
 // Equilibrium And Welfare Calculations Continue To Use The Original Curves.
 const [a,b]=points,dx=b[0]-a[0],dy=b[1]-a[1];let lo=-1000,hi=1000;
 for(const [start,delta,min,max] of [[a[0],dx,0,120],[a[1],dy,0,120]]){
  if(Math.abs(delta)<1e-9){if(start<min||start>max)return null;continue;}
  const t1=(min-start)/delta,t2=(max-start)/delta;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));
 }
 if(lo>hi)return null;
 if(a[0]===0&&a[1]===0&&b[0]===100&&b[1]===100){lo=0;hi=1;}
 const clipped=[[a[0]+lo*dx,a[1]+lo*dy],[a[0]+hi*dx,a[1]+hi*dy]];
 const e=add('polyline',{points:clipped.map(([q,p])=>X(q)+','+Y(p)).join(' '),stroke:colour,class:'curve'});
 e.curveEndpoint=clipped.reduce((best,pt)=>pt[0]>best[0]?pt:best,clipped[0]);target(e,tip);return e;
}
function labelCurve(e,label,colour){
 if(!e)return;const [q,p]=e.curveEndpoint;
 e.id='ew-government-curve-'+document.querySelectorAll('[data-curve-label]').length;const node=text(X(q)+14,Y(p)+4,label,{fill:colour,'text-anchor':'start','font-weight':600,'data-movable':'true','data-curve-label':'true','data-curve-target':e.id});return node;
}

function defs(){const d=add('defs');const c=add('clipPath',{id:'plot-clip'},d);add('rect',{x:112,y:72,width:360,height:360},c);for(const [id,reverse] of [['arrow',false],['arrow-start',true],['arrow-red',false]]){const m=add('marker',{id,viewBox:'0 0 10 10',refX:reverse?1:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'},d);add('path',{d:'M0,0 L10,5 L0,10 Z',fill:id==='arrow-red'?'#dc2626':'#6b7280'},m);} }
function render(){EconDiagramPresentation.resetPresentation(document.getElementById('diagram'));
 const k=$('policy-select').value,v=values[k],p=policies[k],m=current=calculate(k,v),lab=k==='wage';
 const taxSub=['specific','advalorem','indirect','direct'].includes(k),showPrices=taxSub&&$('show-prices').checked,p1=k==='direct'?m.pp:m.pc;
 $('slider-value').textContent=policyLevel(k,v);$('policy-slider').setAttribute('aria-valuetext',p.label+': '+policyLevel(k,v));
 const axisHelp=$('axis-help');
 if(axisHelp){
 axisHelp.textContent=lab?'W₀ and L₀ mark the initial outcome; W₁ and L₁ mark the outcome after intervention. Red arrows show changes along the axes.':'P₀ and Q₀ mark the initial outcome; P₁ and Q₁ mark the outcome after intervention. Red arrows show changes along the axes.';
 if(taxSub)axisHelp.textContent+=' P₁ is the price at the intersection of the policy-adjusted curves. The consumer / producer prices toggle reveals the two sides of the price wedge.';
 }
 $('prices-toggle').hidden=!taxSub;
 $('tr-control').hidden=!['ceiling','floor','wage'].includes(k);
 for(const id of ['cs-control','ps-control'])$(id).hidden=lab;
 $('adjustment-control').hidden=['ceiling','floor','wage'].includes(k);
 if(lab)for(const id of ['show-cs','show-ps','show-adjustment'])$(id).checked=false;
 $('policy-heading').textContent=p.name;$('fiscal-toggle').hidden=!m.fiscal;$('fiscal-label').textContent='Government '+m.fiscal;
 $('welfare-formula').textContent='Total Welfare = CS + PS'+(m.fiscal==='revenue'?' + government revenue':m.fiscal==='expenditure'?' − government expenditure':'');
 let note='Demand equals supply at E₀. With no externalities, the market equilibrium maximises total welfare.',assumption='';
 if(k==='ceiling'){note=m.binding?'Effective ceiling: price falls to P₁ and the quantity traded falls to Q₁. Quantity demanded exceeds quantity supplied, creating a persistent shortage.':'Not effective ceiling: the ceiling is at or above P₀, so the market remains at E₀.';assumption='Legal-market welfare assumes scarce units go to buyers with the highest willingness to pay. P_bm shows the potential black market clearing price for the available quantity; it is illustrative and does not change the legal-market welfare areas.';}
 if(k==='floor'||k==='wage'){note=m.binding?(lab?'Effective minimum wage: wage rises to W₁ and employment falls to L₁. Labour supplied exceeds labour demanded, creating unemployment. The reduction in employment from L₀ to L₁ represents retrenchment.':'Effective floor: price rises to P₁ and the quantity traded falls to Q₁. Quantity supplied exceeds quantity demanded, creating a persistent surplus.'):'Not effective '+(lab?'minimum wage':'floor')+': the control is at or below '+(lab?'W₀':'P₀')+', so the market remains at E₀.';assumption=lab?'Labour demanded determines employment. Workers with the lowest reservation wages are employed.':'Excess supply is left unsold; the government does not purchase it. The lowest-cost suppliers make the sales.';}
 if(k==='quota'){note=m.binding?'Effective quota: quantity traded falls to Qquota. Producers set P₁ at the demand curve for this restricted quantity.':'Not effective quota: the limit is at or above Q₀, so the market remains at E₀.';assumption='Producers set the market-clearing price for the quota quantity. Quota rights are allocated free to producers, who retain the quota rent within PS. At a zero quota there are no trades; the displayed price is the limiting demand price.';}
 if(k==='specific')note=v>0?'The tax shifts supply vertically upwards. P₁ is the price paid by consumers; producers retain a lower price after paying the tax. Quantity traded falls.':'No tax is applied, so the market remains at E₀.';
 if(k==='advalorem'){note=v>0?'The tax raises each supply price in proportion to its pre-tax value. P₁ is the price paid by consumers; producers retain a lower price after paying the tax. Quantity traded falls.':'No tax is applied, so the market remains at E₀.';assumption='The tax rate is applied to the price received by producers. The vertical tax gap widens as the pre-tax price rises.';}
 if(k==='indirect')note=v>0?'The subsidy shifts supply downwards. P₁ is the price paid by consumers; producers receive a higher price including the subsidy. Quantity traded rises.':'No subsidy is applied, so the market remains at E₀.';
 if(k==='direct'){note=v>0?'The consumer subsidy shifts demand upwards. P₁ is the price received by producers; consumers pay a lower effective price after deducting the subsidy. Quantity traded rises.':'No subsidy is applied, so the market remains at E₀.';assumption='The subsidy is tied to each unit purchased. The direct and indirect subsidies produce the same final consumer price, producer price, quantity and welfare for the same per-unit amount.';}
 $('policy-note').innerHTML=formatNotation(note);$('assumption-note').innerHTML=formatNotation(assumption);$('assumption-note').hidden=!assumption;
 const rows=[[lab?'Labour employed':'Quantity traded','q',lab?'L₀':'Q₀',(lab?'L₁':'Q₁')+' · '+direction(m.q-50)],[lab?'Wage after intervention':'Price after intervention','p1',lab?'W₀':'P₀',(lab?'W₁':'P₁')+' · '+direction(p1-50)]];
 if(showPrices)rows.push(['Price paid by consumers','pc','P₀','P_c · '+direction(m.pc-50)],['Price received by producers','pp','P₀','Pₚ · '+direction(m.pp-50)]);
 if(['ceiling','floor','wage'].includes(k))rows.push([lab?'Labour demanded':'Quantity demanded','qd','Initial level',direction(m.qd-50)],[lab?'Labour supplied':'Quantity supplied','qs','Initial level',direction(m.qs-50)]);
 if(!lab)rows.push([lab?'Consumer Surplus · employers':'Consumer Surplus','cs','Initial level',level(m.cs-1250)],[lab?'Producer Surplus · workers':'Producer Surplus','ps','Initial level',level(m.ps-1250)]);
 if(m.fiscal)rows.push(['Government '+m.fiscal,'g','None',Math.abs(m.g)>1e-7?(m.g>0?'Revenue collected':'Expenditure incurred'):'None']);
 rows.push(['Deadweight Loss','dwl','None',m.dwl>1e-7?'Present':'None'],['Total Welfare','tw','Maximum',level(m.tw-2500)]);
 $('outcomes-body').innerHTML=rows.map(([name,key,initial,after])=>'<tr data-metric="'+key+'"><th scope="row">'+formatNotation(name)+'</th><td>'+formatNotation(initial)+'</td><td>'+formatNotation(after)+'</td></tr>').join('');
 [...$('glossary').children].forEach(e=>{const relevant=glossaryRelevant(e.id.replace('glossary-',''),k);e.hidden=!relevant;if(!relevant)e.open=false;e.classList.toggle('glossary-highlight',e.id==='glossary-'+p.glossary);});if(p.glossary)$('glossary').prepend($('glossary-'+p.glossary));
 const svg=$('diagram-plot');svg.replaceChildren();const title=add('title',{id:'diagram-title'});title.textContent=p.name+' — '+(lab?'labour market':'demand and supply');const desc=add('desc',{id:'diagram-desc'});desc.textContent=note+' '+$('welfare-formula').textContent;defs();
 const clip=add('g',{'clip-path':'url(#plot-clip)'});const areaList=[];
 if(['ceiling','floor','wage'].includes(k)&&$('show-tr').checked&&m.q>0&&m.pc>0){shade('tr',[[0,0],[m.q,0],[m.q,m.pc],[0,m.pc]],lab?'Total Revenue/Expenditure: total wage receipts of employed workers equal employers’ total wage expenditure. The rectangle is the actual wage × actual employment, not the quantity of labour supplied.':'Total Revenue/Expenditure: sellers’ receipts equal buyers’ expenditure. The rectangle is the actual transaction price × quantity actually traded, not unmet demand or unsold supply.');areaList.push('tr');}
 if(!lab&&$('show-cs').checked&&m.q>0){shade('cs',[[0,100],[m.q,D(m.q)],[m.q,m.pc],[0,m.pc]],'Consumer Surplus: willingness to pay minus the effective price paid, summed over the units actually traded. How to identify the area: below the original demand curve and above '+(taxSub?'P_c, the effective price paid by consumers':'P₁')+', from the quantity origin to Q₁.'+(k==='direct'?' The consumer price is net of the direct subsidy.':''));areaList.push('cs');}
 if(!lab&&$('show-ps').checked&&m.q>0){shade('ps',[[0,0],[m.q,S(m.q)],[m.q,m.pp],[0,m.pp]],'Producer Surplus: revenue received minus minimum acceptable revenue, summed over the units actually traded. How to identify the area: above the original supply curve and below '+(taxSub?'Pₚ, the price received by producers':'P₁')+', from the quantity origin to Q₁.'+(k==='indirect'?' The producer price includes the subsidy.':m.fiscal==='revenue'?' The producer price is after paying the tax.':'')+(k==='quota'?' This includes quota rent retained by producers.':''));areaList.push('ps');}
 if(m.fiscal&&$('show-g').checked&&Math.abs(m.g)>1e-7){shade('g',[[0,m.pc],[m.q,m.pc],[m.q,m.pp],[0,m.pp]],'Government '+m.fiscal+': '+(m.fiscal==='revenue'?'tax':'subsidy')+' per unit × quantity traded. '+(m.g>0?'Added to':'Subtracted from')+' CS + PS when calculating Total Welfare.'+(m.g<0?' The expenditure area overlaps parts of CS and PS; subtract it once.':''));areaList.push('g');}
 if($('show-dwl').checked&&m.dwl>1e-7){shade('dwl',[[50,50],[m.q,D(m.q)],[m.q,S(m.q)]],'Deadweight Loss: '+(lab?'Gains from employment forgone as employment falls. How to identify the area: between the original Demand for Labour and Supply of Labour curves, over the reduction in employment from L₀ to L₁.':m.q<50?'Gains from trade forgone because too few units are traded. How to identify the area: between the original demand and supply curves, over the units between Q₁ and Q₀ that are no longer traded.':'For units beyond Q₀, marginal cost exceeds marginal benefit. How to identify the area: between the original demand and supply curves, over the additional units between Q₀ and Q₁.'));areaList.push('dwl');}
 [...svg.querySelectorAll('.areas')].forEach(e=>clip.append(e));
 line(0,0,120,0,{class:'axis','marker-end':'url(#arrow)'});line(0,0,0,120,{class:'axis','marker-end':'url(#arrow)'});
 text(112,58,lab?'Wage':'Price',{class:'axis-title','text-anchor':'middle','font-weight':700});text(482,460,lab?'Quantity Of Labour':'Quantity',{class:'axis-title','text-anchor':'end','font-weight':700});
 const supplyColor='#16a34a',demandColor='#2563eb',policyColor='#dc2626';
 const lines=add('g',{'clip-path':'url(#plot-clip)'});
 const demand=curve([[0,100],[100,0]],demandColor,lab?'Demand for Labour: employers are willing to hire more labour at lower wages.':'Demand: the relationship between price and quantity demanded.');lines.append(demand);
 const supply=curve([[0,0],[100,100]],supplyColor,lab?'Supply of Labour: workers are willing to supply more labour at higher wages.':'Supply: the relationship between price and quantity supplied.');lines.append(supply);
 labelCurve(demand,'D₀',demandColor);
 labelCurve(supply,'S₀',supplyColor);
 if(v>0&&(k==='specific'||k==='indirect')){const sign=k==='specific'?1:-1,pl=curve([[0,sign*v],[100,100+sign*v]],policyColor,k==='specific'?'Supply after specific tax. The vertical gap from S equals the tax per unit.':'Supply after indirect subsidy. The vertical gap below S equals the subsidy per unit.');lines.append(pl);const qlab=k==='specific'?Math.min(48,88-v):75;labelCurve(pl,k==='specific'?'S₁ (tax)':'S₁ (subsidy)',policyColor);}
 if(k==='advalorem'&&v>0){const r=v/100,pl=curve([[0,0],[100,100*(1+r)]],policyColor,'Supply after ad-valorem tax. Each original supply price is raised in proportion to the tax rate.');lines.append(pl);const qlab=18;labelCurve(pl,'S₁ (tax)',policyColor);}
 if(k==='direct'&&v>0){const pl=curve([[0,100+v],[100,v]],policyColor,'Demand after the direct consumer subsidy. Consumers can offer their willingness to pay plus the subsidy to producers.');lines.append(pl);labelCurve(pl,'D₁ (subsidy)',policyColor);}
 if(['ceiling','floor','wage'].includes(k)){line(0,v,120,v,{stroke:policyColor,'stroke-width':2.5});text(X(120)+10,Y(v)+4,lab?'Minimum Wage':k==='ceiling'?'Price Ceiling':'Price Floor',{fill:policyColor,'text-anchor':'start','data-policy-label':'true'});}
 if(k==='quota'){line(v,0,v,120,{stroke:policyColor,'stroke-width':2.5});text(X(v),Y(120)-10,'Quota',{fill:policyColor});}
 const priceLabels=[{value:50,label:lab?'W₀':'P₀',tip:'Price or wage at the initial no-policy equilibrium.'},{value:p1,label:lab?'W₁':'P₁',tip:k==='quota'?'Producers set P₁ at the demand curve for Qquota: this is the highest market-clearing price at which consumers buy the restricted quantity. An ineffective quota leaves price at P₀.':taxSub?(k==='direct'?'P₁ is the price received by producers at the intersection of subsidised demand and supply.':'P₁ is the price paid by consumers at the intersection of demand and policy-adjusted supply.'):'Price or wage after intervention. An effective control does not clear the market.'}];
 if(showPrices)priceLabels.push({value:m.pc,label:'P_c',tip:'Price paid by consumers per unit, after deducting any direct consumer subsidy.'},{value:m.pp,label:'Pₚ',tip:'Price received by producers per unit, after paying any tax or including any producer subsidy.'});
 if(k==='ceiling'&&m.binding)priceLabels.push({value:D(m.q),label:'P_bm',tip:'Potential black market price: the demand-curve price at the quantity available under the ceiling. It is what buyers would pay if that restricted supply were resold at a market-clearing price. Actual illegal-market prices may differ. Legal-market welfare is still evaluated at P₁.'});
 const groups=[];priceLabels.forEach(a=>{const g=groups.find(g=>Math.abs(g.value-a.value)<1e-7);if(g){g.labels.push(a.label);g.tips.push(a.tip);}else groups.push({value:a.value,labels:[a.label],tips:[a.tip]});});groups.sort((a,b)=>b.value-a.value);
 groups.forEach(g=>{const actual=Y(g.value),endQ=Math.abs(g.value-50)<1e-7?50:m.q;line(0,g.value,endQ,g.value,{class:'guide-line'});text(88,actual+4,g.labels.join(' = '),{'text-anchor':'end','data-axis-kind':'p','data-axis-x':112,'data-axis-y':actual},g.tips.join(' '));});
 const qlabels=k==='quota'?(v<=50?[{value:v,label:'Q_quota'},{value:50,label:'Q_e'}]:[{value:50,label:'Q_e'}]):[{value:50,label:lab?'L₀':'Q₀'},{value:m.q,label:lab?'L₁':'Q₁'}];if(['ceiling','floor','wage'].includes(k)&&m.binding)qlabels.push({value:m.qd,label:lab?'Ldd':'Qdd'},{value:m.qs,label:lab?'Lss':'Qss'});
 const qgroups=[];qlabels.forEach(a=>{const g=qgroups.find(g=>Math.abs(g.value-a.value)<1e-7);if(g)g.labels.push(a.label);else qgroups.push({value:a.value,labels:[a.label]});});qgroups.sort((a,b)=>a.value-b.value);let previousX=-200,previousWidth=0,previousRow=0;
 qgroups.forEach(g=>{const xp=X(g.value),label=g.labels.join(' = '),width=label.length*7,row=(xp-previousX<(width+previousWidth)/2+8)?1-previousRow:0;line(g.value,0,g.value,Math.max(D(g.value),S(g.value),['ceiling','floor','wage'].includes(k)?v:0),{class:'guide-line'});text(xp,452,label,{'text-anchor':'middle','data-axis-kind':'q','data-axis-x':xp,'data-axis-y':432},'Quantity label: '+label+'. '+(Math.abs(g.value-m.q)<1e-7?'This is the quantity actually traded.':''));previousX=xp;previousWidth=width;previousRow=row;});
 function point(q,p,label,tip,color='#1f2937'){target(add('circle',{cx:X(q),cy:Y(p),r:4,fill:color,stroke:'white','stroke-width':1}),tip);text(X(q)+7,Y(p)-10,label,{fill:color,'data-movable':'true','data-point-x':X(q),'data-point-y':Y(p)});}
 if(Math.abs(m.q-50)<1e-7&&Math.abs(m.pc-50)<1e-7)point(50,50,'E₀ = E₁','Initial and selected-policy outcomes coincide.');
 else {point(50,50,'E₀','No-policy equilibrium, where demand equals supply.');const ppPoint=k==='direct';point(m.q,ppPoint?m.pp:m.pc,['ceiling','floor','wage'].includes(k)?'A₁':'E₁',(['ceiling','floor','wage'].includes(k)?'Policy trading outcome; a effective price control does not clear the market.':'Selected-policy equilibrium.')+' Q₁ is the quantity actually traded.',policyColor);if(showPrices&&Math.abs(m.pc-m.pp)>1e-7)target(add('circle',{cx:X(m.q),cy:Y(ppPoint?m.pc:m.pp),r:4,fill:policyColor}),'The other side of the tax or subsidy price wedge.');}
 // Always show changes as red arrows along the axes; no numerical changes are displayed.
 function changeArrow(x1,y1,x2,y2,kind){const length=Math.hypot(x2-x1,y2-y1);if(length<.01)return;const marker=add('marker',{id:'change-'+kind,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:Math.min(6,length/2),markerHeight:Math.min(6,length/2),markerUnits:'userSpaceOnUse',orient:'auto'},svg.querySelector('defs'));add('path',{d:'M0,0 L10,5 L0,10 Z',fill:'#dc2626'},marker);target(add('line',{x1,y1,x2,y2,stroke:'#dc2626','stroke-width':1.2,'marker-end':'url(#change-'+kind+')','data-axis-change':kind}),kind==='price'?'Change from the initial price or wage to the outcome after intervention.':lab?'Retrenchment: these are the units of labour (workers) that will be retrenched from their jobs if the minimum wage is implemented. The reduction in employment is from L₀ to L₁.':'Change from the initial quantity to the quantity actually traded after intervention.');}
 changeArrow(17,Y(50),17,Y(p1),'price');changeArrow(X(50),lab?380:485,X(m.q),lab?380:485,'quantity');
 if(lab&&m.binding)text((X(50)+X(m.q))/2,365,'Retrenchment',{'text-anchor':'middle',fill:'#dc2626','font-weight':600,'data-wage-label':'retrenchment'},'Retrenchment: these are the units of labour (workers) that will be retrenched from their jobs if the minimum wage is implemented. The reduction in employment is from L₀ to L₁.');
 if(m.binding&&['ceiling','floor','wage'].includes(k)){
 const left=Math.min(m.qd,m.qs),right=Math.max(m.qd,m.qs),yp=419;
 const gapTip=lab?'Unemployment: these are the units of labour (workers) that are willing to work at the minimum wage but are not employed. It is the difference between labour supplied and labour demanded at W₁.':'Persistent '+(k==='ceiling'?'shortage: quantity demanded exceeds quantity supplied.':'surplus: quantity supplied exceeds quantity demanded.')+' The gap is measured at the controlled price and placed near the quantity axis for clarity.';
 target(add('line',{x1:X(left),y1:yp,x2:X(right),y2:yp,stroke:'#dc2626','stroke-width':1.5,'marker-start':'url(#arrow-red)','marker-end':'url(#arrow-red)','data-gap-arrow':lab?'unemployment':'persistent'}),gapTip);
 text((X(left)+X(right))/2,404,lab?'Unemployment':k==='ceiling'?'Shortage':'Surplus',{'text-anchor':'middle',fill:'#dc2626','font-weight':600,'data-gap-label':lab?'unemployment':'persistent'},gapTip);


 }
 if($('show-adjustment').checked&&!['ceiling','floor','wage'].includes(k)&&Math.abs(m.q-50)>1e-7){
 let oldQd=50,oldQs=50;
 if(k==='specific')oldQs=Math.max(0,50-v);
 if(k==='advalorem')oldQs=Math.max(0,50/(1+v/100));
 if(k==='indirect')oldQs=50+v;
 if(k==='direct')oldQd=50+v;
 if(k==='quota')oldQs=Math.min(50,v);
 const shortage=oldQd>oldQs,yp=419;
 const a=add('line',{x1:X(Math.min(oldQd,oldQs)),y1:yp,x2:X(Math.max(oldQd,oldQs)),y2:yp,stroke:'#dc2626','stroke-width':1.5,'marker-start':'url(#arrow-red)','marker-end':'url(#arrow-red)','data-gap-arrow':'temporary'});
 target(a,'Immediately after the policy, at P₀, '+(shortage?'quantity demanded exceeds quantity supplied':'quantity supplied exceeds quantity demanded')+'. This temporary imbalance causes price adjustment.');
 text((X(oldQd)+X(oldQs))/2,404,(shortage?'Shortage':'Surplus')+' at P₀',{'data-gap-label':'temporary','text-anchor':'middle',fill:'#dc2626','font-weight':600},'The temporary shortage or surplus is measured at P₀ on the policy-adjusted curves. The red arrow is placed near the quantity axis for clarity.');
 const nextPrice=k==='direct'?m.pp:m.pc;
 if(k!=='quota')target(add('line',{x1:560,y1:Y(50),x2:560,y2:Y(nextPrice),stroke:'#6b7280','stroke-width':1.5,'marker-end':'url(#arrow)'}),(shortage?'Shortage puts upward':'Excess supply puts downward')+' pressure on the market price until the new equilibrium is reached.');

 }

 labelAreas(clip);window.currentGovernmentModel=m;EconPilot.schedule();
 $('area-key').replaceChildren();areaList.forEach(kind=>{const item=document.createElement('span');item.className='key-item';item.dataset.kind=kind;const swatch=document.createElement('i');swatch.className='key-colour';swatch.style.background=palette[kind];const pattern=document.createElement('i');pattern.className='pattern-'+kind;const label=kind==='cs'?'Consumer Surplus':kind==='ps'?'Producer Surplus':kind==='g'?'Government '+m.fiscal:'Deadweight Loss';item.append(swatch,pattern,document.createTextNode(label));$('area-key').append(item);});
}
$('policy-select').addEventListener('change',configure);$('policy-slider').addEventListener('input',()=>{values[$('policy-select').value]=+$('policy-slider').value;$('tooltip').hidden=true;render();});
document.querySelectorAll('.toggle-grid input').forEach(e=>e.addEventListener('change',()=>{$('tooltip').hidden=true;render();}));
$('reset').onclick=()=>{Object.entries(policies).forEach(([k,p])=>values[k]=p.value??0);$('policy-select').value='none';for(const id of ['show-dwl','show-tooltips'])$(id).checked=true;for(const id of ['show-cs','show-ps','show-g','show-prices','show-tr'])$(id).checked=false;$('show-adjustment').checked=false;configure();};
function showTip(el){if(!$('show-tooltips').checked)return;$('tooltip-content').innerHTML=formatNotation(el.dataset.tip);$('tooltip').hidden=false;$('tooltip').style.display='block';const r=el.getBoundingClientRect();if(innerWidth>900){$('tooltip').style.left=Math.max(12,Math.min(innerWidth-350,r.x))+'px';$('tooltip').style.top=Math.max(12,Math.min(innerHeight-180,r.bottom+10))+'px';}}
$('diagram').addEventListener('pointerover',e=>{const el=e.target.closest('[data-tip]');if(el)showTip(el);});$('diagram').addEventListener('click',e=>{const el=e.target.closest('[data-tip]');if(el)showTip(el);});$('diagram').addEventListener('focusin',e=>{const el=e.target.closest('[data-tip]');if(el)showTip(el);});$('diagram').addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.closest('[data-tip]')){e.preventDefault();showTip(e.target.closest('[data-tip]'));}});$('tooltip').querySelector('button').onclick=()=>$('tooltip').hidden=true;document.addEventListener('keydown',e=>{if(e.key==='Escape')$('tooltip').hidden=true;});document.addEventListener('click',e=>{if(!e.target.closest('[data-tip],#tooltip'))$('tooltip').hidden=true;});
configure();
