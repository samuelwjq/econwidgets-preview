/* Proposed SVG snapshot helper only. No download/copy/reset event binding. */
(function(root){
 'use strict';
 const NS='http://www.w3.org/2000/svg';
 const props=['fill','fill-opacity','stroke','stroke-opacity','stroke-width','stroke-dasharray','stroke-dashoffset','stroke-linecap','stroke-linejoin','opacity','font-family','font-size','font-weight','font-style','text-anchor','dominant-baseline','baseline-shift','paint-order','visibility','display','marker-start','marker-mid','marker-end'];
 function make(tag,attrs={}){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e;}
 function snapshot(svg,{appearance='colour',legend=[],applyGrayscale,pixelRatio=2,title='',context='',summary='',summaryCompactHeightPx}={}){
  if(svg.dataset.ewLayoutError)throw Error('Resolve diagram layout errors before export');
  if(!['colour','grayscale'].includes(appearance))throw Error('Unsupported appearance');
  if(appearance==='grayscale'&&typeof applyGrayscale!=='function')throw Error('Use the widget\'s existing grayscale mapping; do not infer economic colour roles');
  const r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal;if(!r.width||!vb.width)throw Error('Unmeasurable diagram');
  const unitPerPx=vb.width/r.width,legendHeightPx=root.EconDiagramConfig?.legend.heightPx||28,legendHeight=legendHeightPx*unitPerPx;
  const clone=svg.cloneNode(true),source=[svg,...svg.querySelectorAll('*')],target=[clone,...clone.querySelectorAll('*')];
  source.forEach((e,i)=>{
   const cs=getComputedStyle(e);for(const p of props)target[i].style.setProperty(p,cs.getPropertyValue(p).replace(/url\(["']?[^)"']*#([^)"']+)["']?\)/g,'url(#$1)'));
   if(e!==svg&&cs.vectorEffect==='non-scaling-stroke'){
    const m=e.getScreenCTM(),s=Math.hypot(m.a,m.b);target[i].style.strokeWidth=parseFloat(cs.strokeWidth)/s+'px';
   }
   target[i].style.vectorEffect='none';target[i].removeAttribute('vector-effect');
   for(const a of [...target[i].attributes])if(/^on/i.test(a.name))target[i].removeAttribute(a.name);
   target[i].removeAttribute('tabindex');
  });
  clone.querySelectorAll('script,.touch-target,.point-ring').forEach(e=>e.remove());
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font='12px '+getComputedStyle(svg).fontFamily;
  const widths=legend.map(e=>14+5+ctx.measureText(e.label).width+(e.pattern?19:0));
  const required=widths.reduce((a,b)=>a+b,0)+16*Math.max(0,legend.length-1);
  // Widen the export canvas to fit a complete single-row legend; keep the
  // diagram at its displayed scale and centre it rather than shrinking text.
  const widthPx=Math.max(r.width,required+32,560),width=widthPx*unitPerPx;
  const out=make('svg',{xmlns:NS});
  let y=24*unitPerPx;
  function lines(text,size,weight,fill){ctx.font=weight+' '+size+'px '+getComputedStyle(svg).fontFamily;let line='';const all=[];for(const word of text.split(/\s+/).filter(Boolean)){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>widthPx-32){all.push(line);line=word;}else line=next;}if(line)all.push(line);for(const line of all){const t=make('text',{x:16*unitPerPx,y,'font-family':getComputedStyle(svg).fontFamily,'font-size':size*unitPerPx,'font-weight':weight,fill});t.textContent=line;out.append(t);y+=(size+7)*unitPerPx;}}
  lines(title,17,650,'#202a35');lines(context,14,400,'#67717e');y+=8*unitPerPx;
  const summaryConfig=root.EconDiagramConfig?.summary||{heightPx:28,compactHeightPx:40,background:'#fff9db'},summaryHeightPx=window.innerWidth<=480?(summaryCompactHeightPx||summaryConfig.compactHeightPx):summaryConfig.heightPx,summaryHeight=summaryHeightPx*unitPerPx;
  ctx.font='600 12px '+getComputedStyle(svg).fontFamily;
  const summaryLines=[];let summaryLine='';for(const word of summary.split(/\s+/).filter(Boolean)){const next=summaryLine?summaryLine+' '+word:word;if(summaryLine&&ctx.measureText(next).width>widthPx-24){summaryLines.push(summaryLine);summaryLine=word;}else summaryLine=next;}if(summaryLine)summaryLines.push(summaryLine);
  if(summaryLines.length*14>summaryHeightPx)throw Error('Summary needs more reserved height');
  out.append(make('rect',{'data-ew-export-summary':'',x:0,y,width,height:summaryHeight,fill:summaryConfig.background}));
  summaryLines.forEach((line,i)=>{const t=make('text',{x:12*unitPerPx,y:y+((summaryHeightPx-summaryLines.length*14)/2+11+i*14)*unitPerPx,'font-family':getComputedStyle(svg).fontFamily,'font-size':12*unitPerPx,'font-weight':600,fill:'#202a35'});t.textContent=line;out.append(t);});
  out.append(make('line',{x1:0,y1:y+summaryHeight,x2:width,y2:y+summaryHeight,stroke:'#d7dce2','stroke-width':unitPerPx}));y+=summaryHeight;
  clone.removeAttribute('style');clone.setAttribute('x',(width-vb.width)/2);clone.setAttribute('y',y);clone.setAttribute('width',vb.width);clone.setAttribute('height',vb.height);out.append(clone);y+=vb.height;
  const row=make('g',{'data-ew-export-legend':''});out.append(row);let cursor=(width-required*unitPerPx)/2;ctx.font='12px '+getComputedStyle(svg).fontFamily;
  legend.forEach((e,i)=>{const top=y+(legendHeightPx-10)/2*unitPerPx;row.append(make('rect',{x:cursor,y:top,width:14*unitPerPx,height:10*unitPerPx,fill:e.fill||'#fff',stroke:'#777','stroke-width':unitPerPx,...(e.outline?{'stroke-dasharray':'3 2'}:{})}));cursor+=19*unitPerPx;if(e.pattern){row.append(make('rect',{x:cursor,y:top,width:14*unitPerPx,height:10*unitPerPx,fill:e.pattern,stroke:'#777','stroke-width':unitPerPx}));cursor+=19*unitPerPx;}const t=make('text',{x:cursor,y:top+9*unitPerPx,'font-family':getComputedStyle(svg).fontFamily,'font-size':12*unitPerPx,fill:'#67717e'});t.textContent=e.label;row.append(t);cursor+=(ctx.measureText(e.label).width+16)*unitPerPx;});
  // Colour exports include the same reference hatches as the on-page legend.
  if(appearance==='colour'){const defs=make('defs');out.prepend(defs);for(const e of legend){if(!e.pattern)continue;const id=e.pattern.slice(5,-1);if(defs.querySelector('#'+id))continue;const pat=make('pattern',{id,width:8,height:8,patternUnits:'userSpaceOnUse'});pat.append(make('rect',{width:8,height:8,fill:'#fff'}),e.kind==='dots'?make('circle',{cx:3,cy:3,r:1,fill:'#555'}):make('path',{d:['social','cs','price'].includes(e.kind)?'M-2,2 L2,-2 M0,8 L8,0 M6,10 L10,6':e.kind==='policy'?'M0,0 L8,8 M0,8 L8,0':'M0,4 L8,4',stroke:'#777','stroke-width':1,fill:'none'}));defs.append(pat);}}
  const height=y+legendHeight;out.setAttribute('viewBox',`0 0 ${width} ${height}`);out.setAttribute('width',Math.round(widthPx*pixelRatio));out.setAttribute('height',Math.round(height/unitPerPx*pixelRatio));out.prepend(make('rect',{width,height,fill:'#fff'}));
  if(appearance==='grayscale'){
   // Existing mappers often write SVG attributes. Keep their changes authoritative
   // over the computed-style snapshot, rather than freezing the colour version.
   const paints=['fill','stroke','fill-opacity','stroke-opacity','opacity','stroke-dasharray','stroke-width'];
   const before=new Map([...out.querySelectorAll('*')].map(e=>[e,Object.fromEntries(paints.map(p=>[p,e.getAttribute(p)]))]));
   applyGrayscale(out);
   for(const [e,old] of before)for(const p of paints){const value=e.getAttribute(p);if(value!==old[p]){if(value===null)e.style.removeProperty(p);else e.style.setProperty(p,value);}}
  }
  return new XMLSerializer().serializeToString(out);
 }
 root.EconExportPresentation=Object.freeze({snapshot});
})(typeof globalThis!=='undefined'?globalThis:this);
