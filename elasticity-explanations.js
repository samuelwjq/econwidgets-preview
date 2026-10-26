/* Approved Topic 3 teaching text. Reads existing model results; owns no model. */
(()=>{'use strict';
 const zero=v=>Math.abs(v)<1e-8;
 const direction=v=>zero(v)?'remains unchanged':v>0?'increases':'decreases';
 const change=v=>v>0?'increase':'decrease';
 const degree=e=>zero(Math.abs(e)-1)?'equal proportionate':Math.abs(e)<1?'less than proportionate':'more than proportionate';
 function notation(kind,e){
  const k=kind==='PED'?'|PED|':kind;
  if(e===Infinity)return k+' = ∞';
  if(zero(e)||zero(e-1)||zero(e+1))return k+' = '+(e<0?'−1':zero(e)?'0':'1');
  if(e>0)return e<1?'0 < '+k+' < 1':k+' > 1';
  return e>-1?'−1 < '+k+' < 0':k+' < −1';
 }
 function build(kind,s){
  const {e,shock,delta,p,q}=s,priceTopic=['PED','PES'].includes(kind),ped=kind==='PED',points=[];
  if(zero(shock)){
   points.push(priceTopic?'Select Increase or Decrease to apply a '+(ped?'supply':'demand')+' change.':'Choose an increase or decrease, then set the size of the '+(kind==='XED'?'related-good price':'income')+' change.');
   points.push('The selected elasticity describes the degree of responsiveness of '+(priceTopic?(ped?'quantity demanded':'quantity supplied')+' to a change in the good’s own price.':'demand to a change in '+(kind==='XED'?'the price of the related good.':'income.')));
   return result(points);
  }
  if(priceTopic){
   const other=ped?'supply':'demand',up=shock>0,dp=p-50,dq=q-50;
   points.push((up?'An increase':'A decrease')+' in '+other+' shifts the '+other+' curve '+(up?'rightwards':'leftwards')+'.');
   if(zero(e)){
    points.push('Since '+(ped?'demand':'supply')+' is <strong>perfectly price inelastic</strong>, '+(ped?'quantity demanded':'quantity supplied')+' remains unchanged despite the '+change(dp)+' in price.');
    points.push('Equilibrium price '+direction(dp)+' and equilibrium quantity remains unchanged.');
    points.push('Hence, overall <strong>TR/TE '+direction(s.tr1-s.tr0)+'</strong> only because price '+direction(dp)+'.');
   }else if(e===Infinity){
    points.push('Since '+(ped?'demand':'supply')+' is <strong>perfectly price elastic</strong>, equilibrium price remains unchanged.');
    points.push('The '+other+' '+change(shock)+' leads to '+(up?'an increase':'a decrease')+' in equilibrium quantity only.');
    points.push('Hence, overall <strong>TR/TE '+direction(s.tr1-s.tr0)+'</strong> only because quantity '+direction(dq)+'.');
   }else{
    const classification=zero(e-1)?'unit price elastic':e<1?'price inelastic':'price elastic';
    points.push('Since '+(ped?'demand':'supply')+' is <strong>'+classification+'</strong> at the initial equilibrium, '+(dp>0?'an increase':'a decrease')+' in price leads to '+(zero(e-1)?'an ':'a ')+'<strong>'+degree(e)+' '+change(dq)+'</strong> in quantity '+(ped?'demanded':'supplied')+'.');
    points.push('Equilibrium price '+direction(dp)+' and equilibrium quantity '+direction(dq)+'.');
    if(ped){
     const expected=zero(e-1)?0:Math.sign(dp)*(e<1?1:-1),actual=zero(s.tr1-s.tr0)?0:Math.sign(s.tr1-s.tr0);
     if(expected!==actual)points.push('The selected |PED| applies at the initial equilibrium and changes along this straight demand curve. The usual initial-elasticity TR/TE rule describes small price changes; the finite change shown has the following result.');
     const a=Math.abs(s.priceEffect),b=Math.abs(s.quantityEffect),comparison=zero(a-b)?'equal to':a>b?'greater than':'less than';
     points.push('The '+(s.priceEffect>0?'gain':'loss')+' in TR/TE due to the '+change(dp)+' in price is <strong>'+comparison+'</strong> the '+(s.quantityEffect>0?'gain':'loss')+' in TR/TE due to the '+change(dq)+' in quantity. Hence, overall <strong>TR/TE '+direction(s.tr1-s.tr0)+'</strong>.');
    }else points.push('Hence, overall <strong>TR/TE '+direction(s.tr1-s.tr0)+'</strong> because price and quantity both '+(shock>0?'increase':'decrease')+'.');
   }
   if(!ped)points.push('In this model, the direction of the change in TR/TE depends on whether demand increases or decreases. PES determines the relative size of the price and quantity responses, rather than a separate TR/TE rule.');
  }else{
   const xed=kind==='XED',driver=xed?'price of the related good':'income';
   points.push((xed?'The '+driver:'Income')+' '+direction(shock)+'.');
   if(zero(e)){
    points.push(xed?'Since <strong>XED = 0</strong>, the goods are unrelated. The change in the related good’s price does not change demand for this good.':'Since <strong>YED = 0</strong>, demand does not respond to the change in income.');
    points.push('The demand curve does not shift. With supply unchanged, equilibrium price and quantity remain unchanged.');
   }else{
    const relationship=xed?(e>0?'substitutes':'complements'):(e<0?'an inferior good':e>1?'a normal luxury good':zero(e-1)?'a normal good':'a normal essential good');
    points.push('Since '+(xed?'the goods are ':'this is ')+relationship+', with <strong>'+notation(kind,e)+'</strong>, '+(shock>0?'an increase':'a decrease')+' in '+driver+' leads to '+(zero(Math.abs(e)-1)?'an ':'a ')+'<strong>'+degree(e)+' '+change(delta)+'</strong> in demand'+(xed?' for this good':'')+', at each given '+(xed?'own ':'')+'price.');
    points.push('The demand curve therefore shifts '+(delta>0?'rightwards':'leftwards')+'. With supply unchanged, equilibrium price and quantity both '+(delta>0?'increase':'decrease')+'.');
   }
  }
  return result(points);
 }
 function result(points){return {html:'<h2>Brief Explanation</h2><ul>'+points.map(p=>'<li>'+p+'</li>').join('')+'</ul>',plain:points.map(p=>p.replace(/<[^>]*>/g,'')).join(' ')};}
 window.EconElasticityExplanation=Object.freeze({build,notation});
})();
