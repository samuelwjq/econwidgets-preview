/* Proposed v1 presentation contract. No economic parameters belong here. */
(function(root){
 'use strict';
 const freeze=o=>{Object.values(o).forEach(v=>{if(v&&typeof v==='object')freeze(v);});return Object.freeze(o);};
 const config=freeze({
  version:'1.0.0-proposed',
  viewport:{x:0,y:0,width:600,height:510},
  plot:{left:100,top:50,right:480,bottom:430},
  safeBounds:{left:8,top:8,right:592,bottom:502},
  axes:{stroke:'#374151',width:2,arrowLength:8},
  titles:{price:{x:100,y:30,anchor:'middle'},costBenefit:{x:88,y:36,lineHeight:18,anchor:'end'},quantity:{x:488,y:447,anchor:'start'}},
  values:{priceColumnX:88,quantityRowY:453,priceSpan:[70,420],quantitySpan:[106,480]},
  text:{mainPx:14,curvePx:14,curveWeight:700,longEquationPx:12,smallPx:12,topic5TitlePx:10,compactAxisPx:10,subscriptPx:10,haloPx:2},
  strokes:{curve:2.5,guide:1,leader:1,guideDash:'4 4',leaderColour:'#9ca3af'},
  gaps:{labelPx:6,obstaclePx:4,leaderThresholdPx:12,curveProximityPx:24,compactCurveProximityPx:48,compactCurveWidthPx:480},
  search:{stepPx:8,maxOffsetPx:160,maxNodes:50000},
  exceptions:{imperfectInfoDense:{maxDistancePx:80,leaderThresholdPx:24},imperfectInfoPhone:{viewportHeight:550,safeBottom:542,extraBottom:40}},
  legend:{heightPx:28,fontPx:12,swatchWidthPx:14,swatchHeightPx:10,itemGapPx:16},
  summary:{background:'#fff9db',heightPx:28,compactHeightPx:40,elasticityCompactHeightPx:56,policyCompactHeightPx:56,fontPx:12},
  export:{pixelRatio:2,background:'#ffffff'},
  fullscreen:{padding:8,gap:8,summaryHeight:40,referenceWidth:560,maxTextScale:1.5},
  breakpoints:{stack:900,controls:600,phone:480,caseButtons:560,narrowSlider:359}
 });
 root.EconDiagramConfig=config;
 if(typeof module!=='undefined'&&module.exports)module.exports=config;
})(typeof globalThis!=='undefined'?globalThis:this);
