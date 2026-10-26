
  const mecSlider = document.getElementById('mec-slider');
  const mecCheck = document.getElementById('mec-check');
  const dwlCheck = document.getElementById('dwl-check');
  const overCheck = document.getElementById('over-check');
  const dwl = document.getElementById('dwl');
  const labelDwlText = document.getElementById('label-dwl-text');
  const overArrow = document.getElementById('over-arrow');
  const mecArrow = document.getElementById('mec-arrow');
  const labelMec = document.getElementById('label-mec');

  function toSvgX(q) { return 70 + (355/120) * q; }
  function toSvgY(p) { return 380 - (355/120) * p; }

  function renderDiagram() {
    const mec = parseFloat(mecSlider.value);
    const isZeroMec = (mec === 0);
    document.getElementById("label-qe").textContent=isZeroMec?"Qe = Qs":"Qe";
    document.getElementById("label-pe").textContent=isZeroMec?"Pe = Ps":"Pe";

    // Render MPB (ends at q = 90)
    const mpbX1 = toSvgX(0), mpbY1 = toSvgY(100);
    const mpbX2 = toSvgX(90), mpbY2 = toSvgY(100 -  90);
    document.getElementById('curve-mpb').setAttribute('x1', mpbX1);
    document.getElementById('curve-mpb').setAttribute('y1', mpbY1);
    document.getElementById('curve-mpb').setAttribute('x2', mpbX2);
    document.getElementById('curve-mpb').setAttribute('y2', mpbY2);
    document.getElementById('label-mpb').setAttribute('x', mpbX2 + 6);
    document.getElementById('label-mpb').setAttribute('y', mpbY2 + 4);

    // Render MPC (ends at q = 80 so labels remain cleanly inside SVG bounds)
    const mpcX1 = toSvgX(0), mpcY1 = toSvgY(0);
    const mpcX2 = toSvgX(60), mpcY2 = toSvgY( 60);
    document.getElementById('curve-mpc').setAttribute('x1', mpcX1);
    document.getElementById('curve-mpc').setAttribute('y1', mpcY1);
    document.getElementById('curve-mpc').setAttribute('x2', mpcX2);
    document.getElementById('curve-mpc').setAttribute('y2', mpcY2);
    document.getElementById('label-mpc').setAttribute('x', mpcX2 + 6);
    document.getElementById('label-mpc').setAttribute('y', mpcY2 + 4);

    if (isZeroMec) {
      document.getElementById('label-mpc').textContent = "MPC = MSC";
      document.getElementById('curve-msc').style.display = "none";
      document.getElementById('label-msc').style.display = "none";
    } else {
      document.getElementById('label-mpc').textContent = "MPC";
      document.getElementById('curve-msc').style.display = "inline";
      document.getElementById('label-msc').style.display = "inline";

      // Render MSC (Aligned vertically with MPC at q = 80)
      const mscX1 = toSvgX(0), mscY1 = toSvgY(mec);
      const mscX2 = toSvgX(60), mscY2 = toSvgY(mec +  60);
      document.getElementById('curve-msc').setAttribute('x1', mscX1);
      document.getElementById('curve-msc').setAttribute('y1', mscY1);
      document.getElementById('curve-msc').setAttribute('x2', mscX2);
      document.getElementById('curve-msc').setAttribute('y2', mscY2);
      
      // MSC Label aligned vertically with MPC label
      document.getElementById('label-msc').setAttribute('x', mscX2 + 6);
      document.getElementById('label-msc').setAttribute('y', mscY2 + 4);
    }

    // Free market & social optimum values
    const qe = 100 / 2;
    const pe = 100 -  qe;
    const qs = (100 - mec) / 2;
    const ps = 100 -  qs;
    const pmsc_qe = pe + mec;

    const qeX = toSvgX(qe), peY = toSvgY(pe);
    document.getElementById('line-qe').setAttribute('x1', qeX);
    document.getElementById('line-qe').setAttribute('y1', peY);
    document.getElementById('line-qe').setAttribute('x2', qeX);
    document.getElementById('line-qe').setAttribute('y2', 380);

    document.getElementById('line-pe').setAttribute('x1', 70);
    document.getElementById('line-pe').setAttribute('y1', peY);
    document.getElementById('line-pe').setAttribute('x2', qeX);
    document.getElementById('line-pe').setAttribute('y2', peY);

    document.getElementById('label-qe').setAttribute('x', qeX);
    document.getElementById('label-pe').setAttribute('y', peY + 4);

    // Ee Point & Repositioned Label (Shifted further right to avoid blocking lines)
    document.getElementById('dot-ee').setAttribute('cx', qeX);
    document.getElementById('dot-ee').setAttribute('cy', peY);
    document.getElementById('label-ee').setAttribute('x', qeX + 16);
    document.getElementById('label-ee').setAttribute('y', peY + 4);

    if (isZeroMec) {
      document.getElementById('line-qs').style.display = 'none';
      document.getElementById('line-ps').style.display = 'none';
      document.getElementById('label-qs').style.display = 'none';
      document.getElementById('label-ps').style.display = 'none';
      document.getElementById('dot-es').style.display = 'none';
      document.getElementById('dot-a').style.display = 'none';
      document.getElementById('label-es').style.display = 'none';
      document.getElementById('label-a').style.display = 'none';
      dwl.style.display = 'none';
      labelDwlText.style.display = 'none';
      overArrow.style.display = 'none';
      mecArrow.style.display = 'none';
      labelMec.style.display = 'none';
    } else {
      document.getElementById('line-qs').style.display = 'inline';
      document.getElementById('line-ps').style.display = 'inline';
      document.getElementById('label-qs').style.display = 'inline';
      document.getElementById('label-ps').style.display = 'inline';
      document.getElementById('dot-es').style.display = 'inline';
      document.getElementById('dot-a').style.display = 'inline';
      document.getElementById('label-es').style.display = 'inline';
      document.getElementById('label-a').style.display = 'inline';

      const qsX = toSvgX(qs), psY = toSvgY(ps);
      const aY = toSvgY(pmsc_qe);

      document.getElementById('line-qs').setAttribute('x1', qsX);
      document.getElementById('line-qs').setAttribute('y1', psY);
      document.getElementById('line-qs').setAttribute('x2', qsX);
      document.getElementById('line-qs').setAttribute('y2', 380);

      document.getElementById('line-ps').setAttribute('x1', 70);
      document.getElementById('line-ps').setAttribute('y1', psY);
      document.getElementById('line-ps').setAttribute('x2', qsX);
      document.getElementById('line-ps').setAttribute('y2', psY);

      document.getElementById('label-qs').setAttribute('x', qsX);
      document.getElementById('label-ps').setAttribute('y', psY + 4);

      // Es Point & Repositioned Label (Shifted further left clear of MSC line and guides)
      document.getElementById('dot-es').setAttribute('cx', qsX);
      document.getElementById('dot-es').setAttribute('cy', psY);
      document.getElementById('label-es').setAttribute('x', qsX - 32);
      document.getElementById('label-es').setAttribute('y', psY + 4);

      // Point A & Repositioned Label
      document.getElementById('dot-a').setAttribute('cx', qeX);
      document.getElementById('dot-a').setAttribute('cy', aY);
      document.getElementById('label-a').setAttribute('x', qeX - 16);
      document.getElementById('label-a').setAttribute('y', aY - 6);

      // DWL Polygon Points (Es, Ee, A)
      dwl.setAttribute('points', `${qsX},${psY} ${qeX},${peY} ${qeX},${aY}`);
      dwl.style.display = dwlCheck.checked ? 'block' : 'none';

      // DWL Text positioning (Centroid of triangle AEsEe)
      const dwlCenterX = (qsX + 2 * qeX) / 3;
      const dwlCenterY = (psY + peY + aY) / 3;
      labelDwlText.setAttribute('x', dwlCenterX);
      labelDwlText.setAttribute('y', dwlCenterY);

      // Hide DWL text if triangle width/height is too small to fit text comfortably (MEC < 10)
      const isDwlTooSmall = mec < 10;
      labelDwlText.style.display = (dwlCheck.checked && !isDwlTooSmall) ? 'block' : 'none';

      // Render Two-Sided Arrow between Qs and Qe
      overArrow.setAttribute('x1', qsX + 2);
      overArrow.setAttribute('y1', 440);
      overArrow.setAttribute('x2', qeX - 2);
      overArrow.setAttribute('y2', 440);
      overArrow.style.display = overCheck.checked ? 'block' : 'none';

      // Render Two-Sided Vertical Arrow & Label for MEC (to the right of Qe / DWL triangle at Q = 74)
      if (mecCheck.checked) {
        const qMec = 22;
        const qMecX = toSvgX(qMec);
        const mpcY_q = toSvgY( qMec);
        const mscY_q = toSvgY(mec +  qMec);

        mecArrow.setAttribute('x1', qMecX);
        mecArrow.setAttribute('y1', mscY_q + 2);
        mecArrow.setAttribute('x2', qMecX);
        mecArrow.setAttribute('y2', mpcY_q - 2);
        mecArrow.style.display = 'block';

        labelMec.setAttribute('x', qMecX + 6);
        labelMec.setAttribute('y', (mscY_q + mpcY_q) / 2);
        labelMec.style.display = 'block';
      } else {
        mecArrow.style.display = 'none';
        labelMec.style.display = 'none';
      }
    }
  }

  // Standardized Tooltip Logic
  const diagramTooltip = document.getElementById('diagram-tooltip');
  const mainContent = document.querySelector('.main-content');
  const toggleTooltips = document.getElementById('toggle-tooltips');

  function showTooltip(htmlContent, e) {
    if (!document.getElementById('toggle-tooltips').checked) return;
    const tip=document.getElementById('diagram-tooltip');
    tip.innerHTML='<button type="button" class="tooltip-close" aria-label="Close explanation">×</button><div>'+htmlContent+'</div>';
    tip.style.display='block';
    tip.querySelector('button').onclick=dismissTooltip;
    if(window.innerWidth>900){
      const box=tip.getBoundingClientRect();
      const x=Number.isFinite(e?.clientX)?e.clientX:24;
      const y=Number.isFinite(e?.clientY)?e.clientY:24;
      tip.style.left=Math.max(8,Math.min(x+12,window.innerWidth-box.width-8))+'px';
      tip.style.top=Math.max(8,Math.min(y+12,window.innerHeight-box.height-8))+'px';
    }
  }

  function hideTooltip() {
    if (!document.getElementById('toggle-tooltips').checked) {dismissTooltip();return;}
    // Keep explanations available on touch screens and after a deliberate tap/click.
    if(window.innerWidth>900 && !window.widgetTipPinned){
      clearTimeout(window.widgetTipTimer);
      window.widgetTipTimer=setTimeout(()=>{if(!window.widgetTipPinned)document.getElementById('diagram-tooltip').style.display='none';},160);
    }
  }
  function dismissTooltip(){
    clearTimeout(window.widgetTipTimer);window.widgetTipPinned=false;
    document.getElementById('diagram-tooltip').style.display='none';
  }

  // Canonical Dictionary Tooltip Configuration
  const tooltipBindings = [
    {
      targets: ['label-qe', 'dot-ee', 'label-ee'],
      content: `<strong style="color: #60a5fa;">Free Market Output (Q<sub>e</sub>)</strong><br>This is the output determined by <strong>MPB = MPC</strong>. It reflects the outcome produced by private market forces without government intervention.`
    },
    {
      targets: ['label-qs', 'dot-es', 'label-es'],
      content: `<strong style="color: #f87171;">Socially Optimal Output (Q<sub>s</sub>)</strong><br>This is the output level that maximizes total social welfare where <strong>MSB = MSC</strong>. At this point, allocative efficiency is achieved.`
    },
    {
      targets: ['dwl', 'label-dwl-text'],
      content: `<strong style="color: #f87171;">Why is this DWL?</strong><br>• <strong>Horizontally:</strong> Output is not at Q<sub>s</sub> (over-consumption).<br>• <strong>Vertically:</strong> MSB is not equal to MSC (MSC &gt; MSB for these units), representing net welfare loss from over-production.`
    }
  ];

  tooltipBindings.forEach(binding => {
    binding.targets.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('has-tooltip');
        el.addEventListener('mousemove', (e) => showTooltip(binding.content, e));
        el.addEventListener('click', (e) => showTooltip(binding.content, e));
        el.addEventListener('mouseleave', hideTooltip);
      }
    });
  });

  mecSlider.addEventListener('input', updateDiagram);
  mecCheck.addEventListener('change', updateDiagram);
  dwlCheck.addEventListener('change', updateDiagram);
  overCheck.addEventListener('change', updateDiagram);


  /* SHARED INTERACTIONS v2 — presentation only; original equations are above. */

  // Capture model positions before presentation passes displace the labels.
  const modelRenderDiagram=renderDiagram;
  renderDiagram=function(){modelRenderDiagram();captureModelAnchors();};
  function captureModelAnchors(){
   const svg=document.getElementById('diagram');
   for(const e of svg.querySelectorAll('text')){
    const name=e.textContent.trim(),x=+e.getAttribute('x'),y=+e.getAttribute('y');
    if(!e.dataset.axisKind&&/^[QP](?:[0-9_₀₁₂]|[a-z])/.test(name)){e.dataset.axisKind=name[0]==='Q'?'q':'p';e.dataset.axisX=name[0]==='Q'?x:70;e.dataset.axisY=name[0]==='Q'?380:y-4;}
    else if(e.dataset.axisKind&&!e.dataset.modelAnchor){e.dataset.axisX=e.dataset.axisKind==='q'?x:70;e.dataset.axisY=e.dataset.axisKind==='q'?380:y-4;}
    const axisGuide={'label-pe':'line-pe','label-ps':'line-ps','label-ppol':'line-ppol','label-qe':'line-qe','label-qs':'line-qs','label-qpol':'line-qpol'}[e.id],guide=axisGuide&&document.getElementById(axisGuide);
    if(guide&&e.dataset.axisKind){const k=e.dataset.axisKind==='q'?'x1':'y1',v=guide.getAttribute(k);if(v!==null)e.dataset[e.dataset.axisKind==='q'?'axisX':'axisY']=v;}
    const marker={ 'label-ee':'dot-ee','label-es':'dot-es','label-pol':'dot-pol','label-a':'dot-a' }[e.id],dot=marker&&document.getElementById(marker);
    if(dot){e.dataset.pointX=dot.getAttribute('cx');e.dataset.pointY=dot.getAttribute('cy');}
   }
  }

  const widgetSvg=document.getElementById('diagram');
  const widgetControls=document.querySelector('.controls');
  const widgetIsPolicy=!!document.getElementById('policy-select');
  const options=widgetControls.querySelector('.toggle-grid,.option-row,.checkbox-group');
  const optionOrder=['toggle-tooltips','toggle-dwl','dwl-check','toggle-gap','under-check','over-check','overprod-check','toggle-meb','meb-check','mec-check','toggle-subsidy-cost','tax-rev-check','tax-size-check'];
  optionOrder.forEach(id=>{const input=document.getElementById(id);if(input&&options?.contains(input)){const label=input.closest('label');if(['toggle-gap','under-check','over-check','overprod-check'].includes(id)){label.title=label.textContent.trim();[...label.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());label.append(' Output Gap');}options.append(label);}});
  const widgetInitial=[...widgetControls.querySelectorAll('input,select')].map(el=>({el,value:el.value,checked:el.checked}));
  const widgetFrame=document.createElement('div');widgetFrame.className='diagram-frame';
  widgetFrame.setAttribute('aria-label','Economics diagram; scroll horizontally when enlarged');
  widgetSvg.before(widgetFrame);widgetFrame.append(widgetSvg);
  widgetSvg.setAttribute('role','group');widgetSvg.setAttribute('aria-label',document.title+' — interactive diagram');
  const tip=document.getElementById('diagram-tooltip');
  widgetFrame.after(tip);tip.setAttribute('role','note');tip.setAttribute('aria-live','polite');
  tip.addEventListener('mouseenter',()=>clearTimeout(window.widgetTipTimer));
  tip.addEventListener('mouseleave',hideTooltip);
  const toolbar=document.createElement('div');toolbar.className='toolbar';
  toolbar.innerHTML='<span class="hint">Hover, tap or focus diagram points and shaded areas.</span><button type="button" class="zoom-button" aria-pressed="false">Enlarge diagram</button><button type="button" class="reset-button"><strong>Reset Diagram</strong></button>';
  widgetFrame.after(toolbar);toolbar.setAttribute("aria-label","Diagram view and export controls");
  const help=document.createElement('p');help.className='diagram-help';help.textContent='Use Enlarge diagram for a closer view on smaller screens.';toolbar.after(help);
  toolbar.querySelector('.zoom-button').onclick=e=>{
    const enlarged=widgetFrame.classList.toggle('zoomed');
    e.currentTarget.setAttribute('aria-pressed',String(enlarged));e.currentTarget.textContent=enlarged?'Fit diagram':'Enlarge diagram';
    widgetFrame.tabIndex=enlarged?0:-1;dismissTooltip();
  };
  toolbar.querySelector('.reset-button').onclick=()=>{
    widgetInitial.forEach(({el,value,checked})=>{el.value=value;if(el.type==='checkbox')el.checked=checked;});
    const select=document.getElementById('policy-select');if(select)select.dispatchEvent(new Event('change'));
    document.querySelectorAll('.sidebar details').forEach(el=>el.open=false);
    widgetFrame.classList.remove('zoomed');widgetFrame.scrollLeft=0;
    const zoom=toolbar.querySelector('.zoom-button');zoom.textContent='Enlarge diagram';zoom.setAttribute('aria-pressed','false');
    dismissTooltip();updateDiagram();
  };
  document.querySelectorAll('.sidebar details').forEach(el=>el.open=false);
  document.getElementById('toggle-tooltips').addEventListener('change',dismissTooltip);
  widgetControls.addEventListener('input',dismissTooltip);widgetControls.addEventListener('change',dismissTooltip);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')dismissTooltip();});
  document.addEventListener('click',e=>{if(!e.target.closest('#diagram-tooltip')&&!e.target.closest('[data-tooltip-target]'))dismissTooltip();});
  window.addEventListener('resize',dismissTooltip);window.addEventListener('scroll',()=>{if(window.innerWidth>900)dismissTooltip();},true);
  widgetSvg.addEventListener('click',e=>{
    const el=e.target.closest('[data-tooltip-target]');if(!el)return;
    window.widgetTipPinned=true;clearTimeout(window.widgetTipTimer);
    el.dispatchEvent(new MouseEvent('mousemove',{clientX:e.clientX,clientY:e.clientY}));
  });
  widgetSvg.addEventListener('focusin',e=>{
    const el=e.target.closest('[data-tooltip-target]');if(!el)return;
    const r=el.getBoundingClientRect();window.widgetTipPinned=true;
    el.dispatchEvent(new MouseEvent('mousemove',{clientX:r.left+r.width/2,clientY:r.top+r.height/2}));
  });
  widgetSvg.addEventListener('focusout',e=>{if(!tip.contains(e.relatedTarget))dismissTooltip();});
  widgetSvg.addEventListener('keydown',e=>{
    const el=e.target.closest('[data-tooltip-target]');if(el&&['Enter',' '].includes(e.key)){e.preventDefault();const r=el.getBoundingClientRect();el.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:r.x+r.width/2,clientY:r.y+r.height/2}));}
  });
  function visible(el){return el&&getComputedStyle(el).display!=='none'&&!el.closest('[style*="display: none"]');}
  function registerTargets(){
    widgetSvg.querySelectorAll('.has-tooltip,.touch-target,[id="dwl"],[id="area-dwl"],[id="area-tax-rev"],[id="subsidy-cost-rect"]').forEach(el=>{
      if(!el.classList.contains('has-tooltip')&&!el.classList.contains('touch-target')&&!el.onmousemove&& !['dwl','subsidy-cost-rect'].includes(el.id))return;
      el.dataset.tooltipTarget='';el.setAttribute('role','button');el.setAttribute('tabindex','0');
      const names={'dwl':'Explain deadweight loss','area-dwl':'Explain deadweight loss','area-tax-rev':'Explain tax revenue','subsidy-cost-rect':'Explain subsidy expenditure','dot-ee':'Explain free market equilibrium','dot-es':'Explain social optimum','touch-target-ee':'Explain free market equilibrium','touch-target-es':'Explain social optimum','touch-target-qe':'Explain free market output','touch-target-qs':'Explain socially optimal output'};
      el.setAttribute('aria-label',names[el.id]||('Explain '+(el.textContent.trim()||'this diagram point')));
      if(el.classList.contains('touch-target'))el.setAttribute('tabindex','-1');
    });
  }
  function labelLayout(){
    // Preserve very small gaps without reversed or overlapping arrowheads.
    widgetSvg.querySelectorAll('#under-arrow,#over-arrow,#arrow-gap').forEach(el=>{
      if(!visible(el))return;const inset=el.id==='arrow-gap'?4:2;
      const left=+el.getAttribute('x1')-inset,right=+el.getAttribute('x2')+inset;
      const pad=Math.min(inset,Math.max(0,(right-left)/4));el.setAttribute('x1',left+pad);el.setAttribute('x2',right-pad);
    });
    widgetSvg.querySelectorAll('#meb-arrow,#mec-arrow').forEach(el=>{if(!visible(el))return;const top=+el.getAttribute('y1')-2,bottom=+el.getAttribute('y2')+2,pad=Math.min(2,Math.max(0,(bottom-top)/4));el.setAttribute('y1',top+pad);el.setAttribute('y2',bottom-pad);});
    widgetSvg.querySelectorAll('line[marker-start],line[data-original-start]').forEach(el=>{
      if(!el.dataset.originalStart){el.dataset.originalStart=el.getAttribute('marker-start');el.dataset.originalEnd=el.getAttribute('marker-end');}
      const length=Math.hypot(+el.getAttribute('x2')- +el.getAttribute('x1'),+el.getAttribute('y2')- +el.getAttribute('y1'));
      el.setAttribute('marker-start',length<18?'none':el.dataset.originalStart);el.setAttribute('marker-end',length<18?'none':el.dataset.originalEnd);
    });
    // Uniform externality annotation and typographic subscripts.
    ['label-meb','label-mec'].forEach(id=>document.getElementById(id)?.setAttribute('fill','#2563eb'));
    const mecGroup=document.getElementById('group-mec');if(mecGroup)mecGroup.querySelectorAll('line,polygon,text').forEach(el=>el.setAttribute(el.tagName==='line'?'stroke':'fill','#2563eb'));
    if(!widgetIsPolicy)widgetSvg.querySelectorAll('#arrow-purple-start path,#arrow-purple-end path').forEach(el=>el.setAttribute('fill','#2563eb'));
    widgetSvg.querySelectorAll('#label-qe,#label-qs,#label-qpol,#label-pe,#label-ps,#label-ppol,#label-ee,#label-es,#group-dynamic-axis-labels text,#group-dynamic-nodes text,#ban-scene text,.joint-only text,#label-mpc,#label-policy-curve').forEach(el=>{
      const text=el.textContent;const pattern=/\b([QPES])(?:_)?(private|total|joint|quota|sub|edu|gov|s0|g|b|e|s|c|p|t)\b/g;
      if(!pattern.test(text))return;pattern.lastIndex=0;el.replaceChildren();let last=0;
      for(const m of text.matchAll(pattern)){el.append(document.createTextNode(text.slice(last,m.index)+m[1]));const sub=document.createElementNS('http://www.w3.org/2000/svg','tspan');sub.setAttribute('baseline-shift','sub');sub.setAttribute('font-size','9');sub.textContent=m[2];el.append(sub);last=m.index+m[0].length;}el.append(document.createTextNode(text.slice(last)));
    });
    // Hide only the text when a narrow DWL triangle cannot contain it.
    const area=document.getElementById('dwl')||document.getElementById('area-dwl');
    const label=document.getElementById('label-dwl-text');
    if(visible(area)&&label){const b=area.getBBox();if(b.width<30||b.height<26)label.style.display='none';}
  }
  // Restore presentation-only edits before the model renders the next state.
  let labelSnapshots=[];
  function restoreLabelPresentation(){
    labelSnapshots.forEach(({el,html,x,y,display})=>{if(el.isConnected){el.innerHTML=html;el.setAttribute('x',x);el.setAttribute('y',y);el.style.display=display;}});
    labelSnapshots=[];widgetSvg.querySelectorAll('.collision-leader').forEach(e=>e.remove());
  }
  const overlapNote=document.createElement('p');overlapNote.className='diagram-help';overlapNote.hidden=true;widgetSvg.closest('.diagram-frame').after(overlapNote);
  function snapshotLabels(){labelSnapshots=[...widgetSvg.querySelectorAll('text')].map(el=>({el,html:el.innerHTML,x:el.getAttribute('x'),y:el.getAttribute('y'),display:el.style.display}));}
  function mergeExactLabels(){
    snapshotLabels();
    const labels=[...widgetSvg.querySelectorAll('text')].filter(e=>visible(e)&&/^[QP][a-z]+$/.test(e.textContent.trim()));
    const used=new Set();
    labels.forEach(a=>{if(used.has(a))return;const name=a.textContent.trim(),x=+a.getAttribute('x'),y=+a.getAttribute('y');const group=labels.filter(b=>!used.has(b)&&b.textContent.trim()[0]===name[0]&&(name[0]==='Q'?Math.abs(+b.getAttribute('x')-x)<1e-7:Math.abs(+b.getAttribute('y')-y)<1e-7));if(group.length>1){a.textContent=[...new Set(group.map(b=>b.textContent.trim()))].join(' = ');group.slice(1).forEach(b=>b.style.display='none');group.forEach(b=>used.add(b));}});
    const pairs=[['label-ee','dot-ee'],['label-es','dot-es'],['label-pol','dot-pol']].map(([l,d])=>({l:document.getElementById(l),d:document.getElementById(d)})).filter(o=>visible(o.l)&&visible(o.d));
    pairs.forEach((a,i)=>pairs.slice(i+1).forEach(b=>{if(visible(b.l)&&Math.abs(+a.d.getAttribute('cx')- +b.d.getAttribute('cx'))<1e-7&&Math.abs(+a.d.getAttribute('cy')- +b.d.getAttribute('cy'))<1e-7){a.l.textContent+=' = '+b.l.textContent;b.l.style.display='none';}}));
  }
  const downloadButton=document.createElement('button');downloadButton.type='button';downloadButton.textContent='Download diagram';toolbar.append(downloadButton);
  const copyButton=document.createElement('button');copyButton.type='button';copyButton.textContent='Copy diagram';toolbar.append(copyButton);
  const exportLabel=document.createElement('label');exportLabel.className='export-format';exportLabel.textContent='Image style ';
  const exportStyle=document.createElement('select');exportStyle.setAttribute('aria-label','Image style');exportStyle.innerHTML='<option value=colour>Colour</option><option value=grayscale>Grayscale (print)</option>';exportLabel.append(exportStyle);toolbar.insertBefore(exportLabel,downloadButton);
  exportStyle.addEventListener('change',()=>{exportStatus.textContent='';});
  // Approved UX: contextual area key, selected-policy glossary, main-index navigation.
  const areaKey=document.createElement('div');areaKey.className='area-key';areaKey.setAttribute('aria-label','Shaded area colour and grayscale key');widgetFrame.after(areaKey);
  const glossaryItems=[...document.querySelectorAll('.sidebar > details')];
  const glossaryPolicyNames={indirect_subsidy:'Indirect Subsidy',direct_subsidy:'Direct Subsidy',free_provision:'Free Provision',joint_provision:'Joint Provision',education:'Education & Campaigns',tax:'Tax',quota:'Quota on Output',ban:'Ban (a quota of zero)',qpoll:'Quota on Pollutant',rd:'Research & Development (R&D)',edu:'Education & Campaigns'};
  const normalise=s=>s.replace(/\s+/g,' ').trim();
  const nameOf=el=>normalise(el.querySelector('summary')?.textContent||'');
  const policyNames=new Set(Object.values(glossaryPolicyNames));policyNames.add('Direct Government Provision');policyNames.add('Legislation (Compulsory Consumption)');
  const nav=document.createElement('nav');nav.className='related-widget';nav.setAttribute('aria-label','Widget navigation');const link=document.createElement('a');link.href='index.html';link.textContent='Back to main index';nav.append(link);help.after(nav);
  function visibleArea(id){const el=document.getElementById(id);if(!el||!visible(el))return false;const box=el.getBBox();return box.width>1e-7&&box.height>1e-7;}
  function currentAreaKey(){
    const policy=document.getElementById('policy-select')?.value;if(!['ban','free_provision'].includes(policy))return [];
    const entries=[];
    const candidates=policy==='ban'?[['ban-loss-area','DWL under ban','social','#dc2626'],['ban-free-area','Free-market DWL','other','#d97706']]:[['free-policy-loss','Free-provision DWL','social','#dc2626'],['free-market-loss','Free-market DWL','other','#d97706']];
    candidates.forEach(([id,label,pattern,colour])=>{if(visibleArea(id))entries.push({label,pattern,colour});});
    if(policy==='free_provision'&&[...document.querySelectorAll('#free-scene .subsidy-rect')].some(el=>visible(el)&&el.getBBox().height>0))entries.push({label:'Subsidy expenditure',pattern:'policy',colour:'#4169e1'});
    return entries;
  }
  function approvedUX(){
    const entries=currentAreaKey();areaKey.replaceChildren();areaKey.hidden=!entries.length;
    if(entries.length){const heading=document.createElement('span');heading.className='key-heading';heading.textContent='Colour / grayscale key';areaKey.append(heading);entries.forEach(entry=>{const item=document.createElement('span');item.className='key-item';const colour=document.createElement('i');colour.className='key-colour';colour.style.backgroundColor=entry.colour;colour.setAttribute('aria-hidden','true');const pattern=document.createElement('i');pattern.className='key-pattern '+entry.pattern;pattern.setAttribute('aria-hidden','true');item.append(colour,pattern,document.createTextNode(entry.label));areaKey.append(item);});}
    document.querySelector('.ban-legend')?.setAttribute('hidden','');
    const policy=document.getElementById('policy-select')?.value;if(!policy)return;
    const selectedName=glossaryPolicyNames[policy],selected=glossaryItems.find(el=>nameOf(el)===selectedName);
    const order=[...(selected?[selected]:[]),...glossaryItems.filter(el=>el!==selected&&!policyNames.has(nameOf(el))),...glossaryItems.filter(el=>el!==selected&&policyNames.has(nameOf(el)))];
    const sidebar=document.querySelector('.sidebar');order.forEach(el=>sidebar.append(el));
  }
  function appendExportKey(out){
    const entries=currentAreaKey(),ns='http://www.w3.org/2000/svg',height=entries.length?625+18*(entries.length-1):625;
    out.setAttribute('height',String(height*2));out.setAttribute('viewBox','0 0 710 '+height);out.querySelector('rect')?.setAttribute('height',String(height));
    entries.forEach((entry,i)=>{const text=document.createElementNS(ns,'text');text.setAttribute('x','20');text.setAttribute('y',String(608+i*18));text.setAttribute('style','font:12px system-ui;fill:#374151');const kind=exportStyle.value==='grayscale'?{social:'Diagonal hatch',other:'Horizontal hatch',policy:'Crosshatch'}[entry.pattern]:{social:'Red shading',other:'Amber shading',policy:'Blue shading'}[entry.pattern];text.textContent=kind+': '+entry.label;out.append(text);});
  }

  function compactAnnotations(){
    const defs=widgetSvg.querySelector('defs'),ns='http://www.w3.org/2000/svg';
    if(!widgetSvg.querySelector('#externality-start'))for(const [id,d,ref] of [['externality-start','M10,1 L0,5 L10,9 Z',1],['externality-end','M0,1 L10,5 L0,9 Z',9]]){const m=document.createElementNS(ns,'marker');Object.entries({id,viewBox:'0 0 10 10',refX:ref,refY:5,markerWidth:5,markerHeight:5,orient:'auto'}).forEach(([k,v])=>m.setAttribute(k,v));const path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('fill','#2563eb');m.append(path);defs.append(m);}
    widgetSvg.querySelectorAll('#arrow-meb,#meb-arrow,#mec-arrow,#group-mec line,#ban-scene line,.free-externality').forEach(el=>{
      if(!visible(el)||Math.abs(+el.getAttribute('x1')- +el.getAttribute('x2'))>1e-6)return;
      if(getComputedStyle(el).stroke!=='rgb(37, 99, 235)'&&!el.matches('#arrow-meb,#meb-arrow,#mec-arrow,.free-externality'))return;
      if(Math.abs(+el.getAttribute('y2')- +el.getAttribute('y1'))>=10){el.setAttribute('marker-start','url(#externality-start)');el.setAttribute('marker-end','url(#externality-end)');}
    });
    const captions=[...widgetSvg.querySelectorAll('#label-output-gap,#label-gap,#label-overprod,#ban-scene text,.free-gap-label')].filter(el=>visible(el)&&/(Under|Over)-(consumption|production)/i.test(el.textContent));
    const qlabels=[...widgetSvg.querySelectorAll('text')].filter(el=>visible(el)&&/^[Qq]/.test(el.textContent)&&+el.getAttribute('y')>=380&&+el.getAttribute('y')<440);
    const bottom=Math.max(402,...qlabels.map(el=>el.getBBox().y+el.getBBox().height));
    captions.forEach(el=>el.setAttribute('y',Math.min(445,bottom+28)));
    widgetSvg.querySelectorAll('#under-arrow,#over-arrow,#arrow-gap,#line-overprod,.free-gap-arrow').forEach(el=>{if(visible(el)){el.setAttribute('y1',Math.min(441,bottom+10));el.setAttribute('y2',Math.min(441,bottom+10));}});
    widgetSvg.querySelectorAll('#ban-scene line').forEach(el=>{if(+el.getAttribute('y1')===452&&+el.getAttribute('y2')===452){el.setAttribute('y1',Math.min(441,bottom+10));el.setAttribute('y2',Math.min(441,bottom+10));}});
  }

  function qualitativeControls(){document.querySelectorAll('input[type="range"]').forEach(el=>{const lo=+el.min,hi=+el.max,v=+el.value,t=(v-lo)/(hi-lo);el.setAttribute('aria-valuetext',t===0?'Minimum':t===1?'Maximum':t<.34?'Low':t<.67?'Moderate':'High');});}
  function updateDiagram(){EconDiagramPresentation.resetPresentation(widgetSvg);restoreLabelPresentation();renderDiagram();const gap=document.getElementById('over-arrow'),caption=document.getElementById('label-output-gap');caption.style.display=gap.style.display;caption.setAttribute('x',(+gap.getAttribute('x1') + +gap.getAttribute('x2'))/2);qualitativeControls();mergeExactLabels();labelLayout();compactAnnotations();registerTargets();approvedUX();EconPilot.schedule();}
  updateDiagram();

