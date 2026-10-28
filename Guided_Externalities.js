(()=>{

'use strict';
const $=id=>document.getElementById(id);
const titles=['Explain The Externality','Explain The Diagram','Explain Market Equilibrium','Explain Socially Optimal Output','Compare Qe And Qs','Explain Deadweight Loss'];
const texts={negative:[
'There are <strong>negative externalities in consumption</strong> in the market for cigarettes. This is because in the consumption of cigarettes, the secondhand smoke that is produced causes lung damage to <strong>passive smokers</strong> who are the third parties. These <strong>passive smokers</strong> <strong>incur medical costs</strong> which are <strong>not compensated</strong> by the smokers.<br><em>The third party and the external cost or benefit must be clearly identified.</em>',
'The negative externalities (MEC) cause <strong>MSC to diverge from MPC</strong> in the figure as MSC = MPC + MEC. We assume that there are no positive externalities in the cigarette market, i.e., MEB = 0. Thus, MSB = MPB.',
'The <strong>market equilibrium quantity will be at Qe where MPB = MPC</strong>. This is because self-interested consumers and producers will only consider their <strong>private benefits and costs</strong> in their consumption and production decisions.',
'However, the <strong>socially optimal output where social welfare is maximised is at Qs where MSB = MSC</strong>. This is because if MSB &gt; MSC, social welfare can be increased by consuming (producing) more, while if MSB &lt; MSC, social welfare can be increased by consuming (producing) less.',
'Since <strong>Qe exceeds Qs</strong>, there is <strong>overconsumption of cigarettes</strong>. We say “over<u>consumption</u>” here because the negative externality arises from consumption.',
'For the quantity between <strong>Qs and Qe</strong>, <strong>MSC is greater than MSB</strong>. This causes a <strong>deadweight loss</strong> of the shaded area as social welfare is not maximised. Hence, the market fails due to <strong>allocative inefficiency</strong>.'
],positive:[
'There are <strong>positive externalities in consumption</strong> in the market for vaccinations. This is because when one person is vaccinated, he also benefits the <strong>entire community that he lives in</strong> by <strong>preventing the spread of contagious diseases</strong>. Since the other members of the community do not pay the vaccination costs, there is an <strong>external benefit</strong> for them.<br><em>The third party and the external cost or benefit must be clearly identified.</em>',
'The positive externalities (MEB) cause <strong>MSB to diverge from MPB</strong> in the figure as MSB = MPB + MEB. We assume that there are no negative externalities in the vaccination market, i.e., MEC = 0. Thus, MSC = MPC.',
'The <strong>market equilibrium quantity will be at Qe where MPB = MPC</strong>. This is because self-interested consumers and producers will only consider their <strong>private benefits and costs</strong> in their consumption and production decisions.',
'However, the <strong>socially optimal output where social welfare is maximised is at Qs where MSB = MSC</strong>. This is because if MSB &gt; MSC, social welfare can be increased by consuming (producing) more, while if MSB &lt; MSC, social welfare can be increased by consuming (producing) less.',
'Since <strong>Qe is less than Qs</strong>, there is <strong>underconsumption of vaccinations</strong>. We say “under<u>consumption</u>” here because the positive externality arises from consumption.',
'For the quantity between <strong>Qe and Qs</strong>, <strong>MSB is greater than MSC</strong>. This causes a <strong>deadweight loss</strong> of the shaded area because these additional units, whose social benefits exceed their social costs, are not consumed. Hence, the market fails due to <strong>allocative inefficiency</strong>.'
]};
const definitions=[['Externality','An uncompensated cost or benefit affecting third parties outside a market transaction, arising from production or consumption.'],['Marginal Private Benefit (MPB)','The additional benefit to the consumer from consuming one extra unit.'],['Marginal Private Cost (MPC)','The additional private cost of producing one extra unit.'],['Marginal External Cost (MEC)','The uncompensated cost imposed on third parties from consuming or producing one extra unit.'],['Marginal External Benefit (MEB)','The uncompensated benefit enjoyed by third parties from consuming or producing one extra unit.'],['Marginal Social Cost (MSC)','The additional cost to society from one extra unit: MSC = MPC + MEC.'],['Marginal Social Benefit (MSB)','The additional benefit to society from one extra unit: MSB = MPB + MEB.'],['Market Equilibrium (Qe)','The quantity at which MPB = MPC; private decision makers consider their own benefits and costs.'],['Socially Optimal Output (Qs)','The output that maximises net social benefit. At an interior optimum, MSB = MSC.'],['Deadweight Loss (DWL)','The loss of net social benefit relative to the socially optimal allocation.'],['Allocative Efficiency','An allocation of resources that maximises net social benefit.']];
$('glossary').innerHTML=definitions.map(([t,d])=>`<details><summary>${t}</summary><p>${d}</p></details>`).join('');
let mode='negative',step=0;
const C={blue:'#2563eb',green:'#16a34a',red:'#dc2626',grey:'#c4c9d2'};
const X=q=>130+q*2.5,Y=p=>420-p*2.5;
function model(which=mode){const negative=which==='negative';return{negative,qe:50,pe:50,qs:negative?30:70,ps:negative?70:70,externality:40};}
function label(text,x,y,colour,cls='',anchor='start'){return `<text class="diagram-label ${cls}" x="${x}" y="${y}" fill="${colour}" text-anchor="${anchor}">${text}</text>`;}
const sub=(letter,s)=>`${letter}<tspan class="sub" font-size="12.5" baseline-shift="sub">${s}</tspan>`;
function line(id,q1,p1,q2,p2,c,extra=''){return `<line id="${id}" class="curve" stroke-width="2.5" x1="${X(q1)}" y1="${Y(p1)}" x2="${X(q2)}" y2="${Y(p2)}" stroke="${c}" ${extra}/>`;}
function diagram(){
 const m=model(),n=m.negative;const privateFocus=step===2,socialFocus=step===3||step===5,diagramFocus=step===1;
 const mpb=(privateFocus||diagramFocus||(socialFocus&&n))?C.blue:C.grey;
 const mpc=(privateFocus||diagramFocus||(socialFocus&&!n))?C.green:C.grey;
 const social=(socialFocus||diagramFocus)?C.red:C.grey;
 let out=`<title id="diagram-title">${n?'Negative':'Positive'} Externalities In Consumption — Step ${step+1}</title><desc id="diagram-description">${titles[step]}. ${n?'The market quantity exceeds the socially optimal quantity.':'The market quantity is below the socially optimal quantity.'} Coloured elements show the current step; grey elements provide context.</desc><defs><marker id="axis-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1 L8 5 L0 9" fill="none" stroke="#374151" stroke-width="1.5"/></marker><marker id="gap-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="context-stroke" stroke-width="1.5"/></marker><pattern id="dwl-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fee2e2"/><line x1="0" y1="0" x2="0" y2="7" stroke="#dd9999" stroke-width="1"/></pattern></defs>`;
 if(step===5){const pts=n?[[30,70],[50,50],[50,90]]:[[50,50],[50,90],[70,70]];out+=`<polygon id="dwl" points="${pts.map(([q,p])=>`${X(q)},${Y(p)}`).join(' ')}" fill="url(#dwl-hatch)" stroke="${C.red}" stroke-width="1"/>`;}
 out+=`<path stroke="#374151" stroke-width="2" class="axis" d="M130 62 V420 H488" fill="none" marker-start="url(#axis-arrow)" marker-end="url(#axis-arrow)"/>`;
 out+=label('Price /',28,72,'#374151','small')+label('Costs /',28,92,'#374151','small')+label('Benefits',28,112,'#374151','small')+label('Qty',495,444,'#374151')+label('0',116,442,'#374151','small','end');
 out+=line('mpb',0,100,100,0,mpb)+line('mpc',0,0,100,100,mpc);
 out+=n?line('msc',0,40,100,140,social):line('msb',0,140,140,0,social);
 out+=label(n?'MSB = MPB':'MPB',X(100)+7,Y(0)-7,mpb,'curve-label');
 out+=label(n?'MPC':'MSC = MPC',X(100)+8,Y(100)+5,mpc,'curve-label');
 out+=n?label('MSC = MPC + MEC',X(100)+8,Y(140)+5,social,'curve-label'):label('MSB = MPB + MEB',X(140)+8,Y(0)+5,social,'curve-label');
 if(step===1){const q=n?78:22,low=n?q:100-q,high=low+40;out+=`<line id="externality-gap" class="gap" stroke-width="1.8" x1="${X(q)}" x2="${X(q)}" y1="${Y(low)-4}" y2="${Y(high)+4}" stroke="${C.blue}" marker-start="url(#gap-arrow)" marker-end="url(#gap-arrow)"/>`+label(n?'MEC':'MEB',X(q)+8,Y((low+high)/2)+5,C.blue,'small');}
 const point=(name,q,p,active)=>{const c=active?C.red:'#a6adb8';return `<path fill="none" stroke="#9ca3af" stroke-width="1" stroke-dasharray="4 4" class="guide" d="M130 ${Y(p)} H${X(q)} V420"/>`+`<circle id="point-${name}" class="point" stroke="white" stroke-width="1.5" cx="${X(q)}" cy="${Y(p)}" r="4" fill="${c}"/>`+label(sub('E',name),X(q)-12,Y(p)-18,c,'','end')+label(sub('Q',name),X(q),443,c,'','middle')+label(sub('P',name),118,Y(p)+5,c,'','end');};
 if(step>=2)out+=point('e',m.qe,m.pe,step===2||step>=4);
 if(step>=3)out+=point('s',m.qs,m.ps,step>=3);
 if(step>=4){const lo=Math.min(m.qe,m.qs),hi=Math.max(m.qe,m.qs);out+=`<line id="quantity-gap" class="gap" stroke-width="1.8" x1="${X(lo)+3}" x2="${X(hi)-3}" y1="469" y2="469" stroke="${C.red}" marker-start="url(#gap-arrow)" marker-end="url(#gap-arrow)"/>`+label(n?'Overconsumption':'Underconsumption',X((lo+hi)/2),492,C.red,'small','middle');}
 if(step===5)out+=label('DWL',X(n?45:55),Y(n?71:71),C.red,'small','middle');
 return out;
}
function render(){EconDiagramPresentation.resetPresentation($('diagram'));
 $('diagram').innerHTML=diagram();$('negative').setAttribute('aria-pressed',String(mode==='negative'));$('positive').setAttribute('aria-pressed',String(mode==='positive'));
 $('step-count').textContent=`Step ${step+1} Of 6`;$('previous').disabled=step===0;$('next').disabled=step===5;
 $('step-title').textContent=`Step ${step+1}: ${titles[step]}`;$('copy-text').innerHTML=`<p>${texts[mode][step]}</p>`;
 $('progress-fill').style.width=`${(step+1)/6*100}%`;$('progress').setAttribute('aria-valuenow',step+1);$('legend').hidden=step!==5;
 $('focus-note').textContent=['Diagram Muted — Identify The Externality First.','Focus: Private And Social Curves And The Externality Gap.','Focus: Private Curves And Market Equilibrium.','Focus: Social Curves And The Social Optimum.','Focus: The Gap Between Market And Socially Optimal Quantities.','Focus: Deadweight Loss And Its Bounding Social Curves.'][step];
 $('assumptions').textContent=mode==='negative'?'This cigarette example follows the cost-side representation: MSC = MPC + MEC. External benefits are absent, so MSB = MPB. The external harm arises from consumption.':'This vaccination example uses MSB = MPB + MEB. External costs are absent, so MSC = MPC.';
 document.querySelectorAll('.steps button').forEach((b,i)=>{if(i===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});$('status').textContent='';window.batch4State={...model(),mode,step};Batch4Presentation.rendered();
}
for(let i=0;i<6;i++){const b=document.createElement('button');b.textContent=i+1;b.setAttribute('aria-label',`Step ${i+1}: ${titles[i]}`);b.onclick=()=>{step=i;render();};document.querySelector('.steps').append(b);}
for(const which of ['negative','positive'])$(which).onclick=()=>{mode=which;step=0;render();};
$('previous').onclick=()=>{step=Math.max(0,step-1);render();};$('next').onclick=()=>{step=Math.min(5,step+1);render();};$('reset').onclick=()=>{step=0;render();};
render();

})();
