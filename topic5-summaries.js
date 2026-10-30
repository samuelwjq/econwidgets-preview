/* Shared read-only Topic 5 summary wording. No model or control mutations. */
(function(root){'use strict';
 const own=m=>m.cost?'MPC':'MPB';
 const caseText=m=>own(m)+(m.zero?' Correctly Estimated':m.under?' Underestimated':' Overestimated');
 function comparison(q,qs){return Math.abs(q-qs)<1e-7?'Qe = Qs · No Output Gap':q>qs?'Qe > Qs · Overconsumption':'Qe < Qs · Underconsumption';}
 function externality({positive,magnitude}){const zero=Math.abs(magnitude)<1e-7;return (positive?'MEB':'MEC')+(zero?' = 0 · Qe = Qs · No Output Gap · No DWL':positive?' > 0 · Qe < Qs · Under-consumption / production · DWL Present':' > 0 · Qe > Qs · Over-consumption / production · DWL Present');}
 function information(m){return caseText(m)+' · '+comparison(m.q??m.qe,m.qs)+' · '+(m.dwl<1e-7?'No DWL':'DWL Present');}
 function policy(m){const perceived=own(m)+'_perceived',delta=m.shift-m.initialShift,direction=Math.abs(delta)<1e-7?'Unchanged':delta>0?'Increases':'Decreases';let effect;
  if(m.compulsory)effect=perceived+' Unchanged; Consumption Required At Qs';
  else if(m.information)effect=perceived+' '+direction;
  else if(m.fiscal){const operation=m.cost?(m.fiscal>0?' + Tax':' − Subsidy'):(m.fiscal>0?' − Tax':' + Subsidy');effect=perceived+operation+' '+direction;}
  else effect=perceived+' Unchanged';
  const qty=Math.abs(m.q-m.qe)<1e-7?'Qty Unchanged':m.q>m.qe?'Qty Increases':'Qty Decreases',welfare=m.efficient?'DWL Eliminated':Math.abs(m.dwl-m.initialDwl)<1e-7?'DWL Unchanged':m.dwl<m.initialDwl?'DWL Reduced':'DWL Increased';return caseText(m)+' · '+effect+' · '+qty+' · '+welfare;
 }
 root.EconTopic5Summary=Object.freeze({caseText,externality,information,policy});
})(typeof globalThis!=='undefined'?globalThis:this);
