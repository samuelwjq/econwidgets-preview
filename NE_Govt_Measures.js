
  const ECON_EPS = 1e-9;
  const FIXED_MEC = 40; // Baseline external cost

  // Master Tooltip Dictionary Mechanics
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

  // UI Elements
  const policySelect = document.getElementById('policy-select');
  const taxCard = document.getElementById('tax-card');
  const taxSlider = document.getElementById('tax-slider');
  const taxRevOption = document.getElementById('tax-rev-option');
  const taxRevCheck = document.getElementById('tax-rev-check');
  const taxSizeOption = document.getElementById('tax-size-option');
  const taxSizeCheck = document.getElementById('tax-size-check');

  const dwlCheck = document.getElementById('dwl-check');
  const overprodCheck = document.getElementById('overprod-check');
  const mecCheck = document.getElementById('mec-check');

  const quotaCard = document.getElementById('quota-card');
  const quotaSlider = document.getElementById('quota-slider');
  const qpollCard = document.getElementById('qpoll-card');
  const qpollSlider = document.getElementById('qpoll-slider');
  const rdCard = document.getElementById('rd-card');
  const rdSlider = document.getElementById('rd-slider');
  const eduCard = document.getElementById('edu-card');
  const eduSlider = document.getElementById('edu-slider');

  // Dynamic Canonical Tooltip String Generators
  const TOOLTIP_DICT = {
    qe: `<strong style="color: #60a5fa;">Free Market Output (Q<sub>e</sub>)</strong><br>This is the output determined by <strong>MPB = MPC</strong>. It reflects the outcome produced by private market forces without government intervention.`,
    qs: `<strong style="color: #f87171;">Socially Optimal Output (Q<sub>s</sub>)</strong><br>This is the output level that maximizes total social welfare where <strong>MSB = MSC</strong>. At this point, allocative efficiency is achieved.`,
    qs_prime: `<strong style="color: #38bdf8;">New Social Optimum (Q<sub>s</sub>')</strong><br>This is the allocatively efficient output under the reduced marginal external cost where <strong>MSB = MSC'</strong>.`,
    qt: `<strong style="color: #c084fc;">Policy Output Level</strong><br>• <strong>Quantity:</strong> The output resulting from government intervention.<br>• <strong>Effect:</strong> The welfare effect depends on the intervention. Too much or too little intervention can leave output away from the social optimum.`,
    dwl_over: `<strong style="color: #f87171;">Why is this DWL?</strong><br>• <strong>Horizontally:</strong> Output is not at Q<sub>s</sub> (over-consumption).<br>• <strong>Vertically:</strong> MSB is not equal to MSC (MSC &gt; MSB for these units), representing net welfare loss from over-production.`,
    dwl_under: `<strong style="color: #f87171;">Why is this DWL?</strong><br>• <strong>Horizontally:</strong> Output is not at Q<sub>s</sub> (under-consumption).<br>• <strong>Vertically:</strong> MSB is not equal to MSC (MSB &gt; MSC for these units), representing forgone net benefit to society.`,
    tax_rev: `<strong style="color: #c084fc;">Total Tax Revenue</strong><br>This area represents total government tax revenue calculated as per-unit tax multiplied by output (Q<sub>t</sub>).`,
    node_ee: `<strong style="color: #60a5fa;">Market Equilibrium (E<sub>e</sub>)</strong><br>Unregulated private market outcome where MPB = MPC.`,
    node_es: `<strong style="color: #f87171;">Social Optimum (E<sub>s</sub>)</strong><br>Socially efficient outcome where MSB = MSC.`
  };

  // Coordinate Converters
  function toSvgX(q) { return 70 + (355/120) * q; }
  function toSvgY(p) { return 380 - (355/120) * p; }

  function createSvgLine(x1, y1, x2, y2, className, strokeColor) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    if (className) line.setAttribute("class", className);
    if (strokeColor) line.setAttribute("stroke", strokeColor);
    return line;
  }

  function createSvgText(x, y, content, options = {}) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    if (options.fill) text.setAttribute("fill", options.fill);
    if (options.fontWeight) text.setAttribute("font-weight", options.fontWeight);
    if (options.anchor) text.setAttribute("text-anchor", options.anchor);
    if (options.fontSize) text.setAttribute("font-size", options.fontSize);
    if (options.className) text.setAttribute("class", options.className);

    if (typeof content === 'string' && content.includes('_')) {
      const parts = content.split(/([A-Za-z0-9]+)_([A-Za-z0-9]+)/g);
      for (let i = 0; i < parts.length; i++) {
        if (!parts[i]) continue;
        if (i % 3 === 1) {
          const tspanMain = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
          tspanMain.textContent = parts[i];
          text.appendChild(tspanMain);
        } else if (i % 3 === 2) {
          const tspanSub = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
          tspanSub.setAttribute("font-size", "0.75em");
          tspanSub.setAttribute("baseline-shift", "sub");
          tspanSub.textContent = parts[i];
          text.appendChild(tspanSub);
        } else {
          const tspanRest = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
          tspanRest.textContent = parts[i];
          text.appendChild(tspanRest);
        }
      }
    } else {
      text.textContent = content;
    }

    return text;
  }

  function createSvgCircle(cx, cy, r, fill) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", r);
    circle.setAttribute("fill", fill);
    return circle;
  }

  // Precise Custom Two-Sided Vertical Arrow Renderer
  function renderTwoSidedVerticalArrow(containerGroup, x, yBottom, yTop, labelText, color) {
    containerGroup.innerHTML = '';
    if (yBottom - yTop < 4) return;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x);
    line.setAttribute("y1", yBottom - 5);
    line.setAttribute("x2", x);
    line.setAttribute("y2", yTop + 5);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "2");
    containerGroup.appendChild(line);

    const topHead = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    topHead.setAttribute("points", `${x},${yTop} ${x-3.5},${yTop+7} ${x+3.5},${yTop+7}`);
    topHead.setAttribute("fill", color);
    containerGroup.appendChild(topHead);

    const btmHead = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    btmHead.setAttribute("points", `${x},${yBottom} ${x-3.5},${yBottom-7} ${x+3.5},${yBottom-7}`);
    btmHead.setAttribute("fill", color);
    containerGroup.appendChild(btmHead);

    const textEl = createSvgText(x + 6, (yBottom + yTop) / 2 + 4, labelText, {
      fill: color,
      fontWeight: 'bold',
      fontSize: '12px'
    });
    containerGroup.appendChild(textEl);
  }

  // Policy Switcher
  policySelect.addEventListener('change', () => {
    const policy = policySelect.value;
    if(policy==='ban')document.getElementById('ban-mec-slider').value=FIXED_MEC;

    taxCard.style.display = 'none';
    quotaCard.style.display = 'none';
    qpollCard.style.display = 'none';
    rdCard.style.display = 'none';
    eduCard.style.display = 'none';
    taxRevOption.style.display = 'none';
    taxSizeOption.style.display = 'none';

    if (policy === 'tax') {
      taxCard.style.display = 'flex';
      taxSlider.value = 0;
      taxRevOption.style.display = 'flex';
      taxSizeOption.style.display = 'flex';
    } else if (policy === 'quota') {
      quotaCard.style.display = 'flex';
      quotaSlider.value = 75;
    } else if (policy === 'qpoll') {
      qpollCard.style.display = 'flex';
      qpollSlider.value = 0;
    } else if (policy === 'rd') {
      rdCard.style.display = 'flex';
      rdSlider.value = 0;
    } else if (policy === 'edu') {
      eduCard.style.display = 'flex';
      eduSlider.value = 0;
    }

    updateDiagram();
  });

  function renderDiagram() {
    const activePolicy = policySelect.value;
    document.getElementById('ban-controls').style.display=activePolicy==='ban'?'block':'none';
    document.getElementById('ban-results').style.display=activePolicy==='ban'?'block':'none';
    setBanView(activePolicy==='ban');
    if(activePolicy==='ban'){renderBan();return;}
    const taxVal = parseFloat(taxSlider.value);
    const quotaVal = parseFloat(quotaSlider.value);
    const qpollVal = parseFloat(qpollSlider.value);
    const rdVal = parseFloat(rdSlider.value);
    const eduVal = parseFloat(eduSlider.value);

    const dynamicGuides = document.getElementById('group-dynamic-guides');
    const dynamicAxisLabels = document.getElementById('group-dynamic-axis-labels');
    const dynamicNodes = document.getElementById('group-dynamic-nodes');
    const dynamicCurveLabels = document.getElementById('group-dynamic-curve-labels');

    dynamicGuides.innerHTML = '';
    dynamicAxisLabels.innerHTML = '';
    dynamicNodes.innerHTML = '';
    dynamicCurveLabels.innerHTML = '';

    // Baseline Curve Coordinates
    const mpbX1 = toSvgX(0), mpbY1 = toSvgY(100);
    const mpbX2 = toSvgX(85), mpbY2 = toSvgY(100 -  85);
    document.getElementById('curve-mpb').setAttribute('x1', mpbX1);
    document.getElementById('curve-mpb').setAttribute('y1', mpbY1);
    document.getElementById('curve-mpb').setAttribute('x2', mpbX2);
    document.getElementById('curve-mpb').setAttribute('y2', mpbY2);
    
    const labelMpb = document.getElementById('label-mpb');
    labelMpb.setAttribute('x', Math.min(580, mpbX2 + 6));
    labelMpb.setAttribute('y', mpbY2 + 4);

    const mpcX1 = toSvgX(0), mpcY1 = toSvgY(0);
    const mpcX2 = toSvgX(60), mpcY2 = toSvgY( 60);
    document.getElementById('curve-mpc').setAttribute('x1', mpcX1);
    document.getElementById('curve-mpc').setAttribute('y1', mpcY1);
    document.getElementById('curve-mpc').setAttribute('x2', mpcX2);
    document.getElementById('curve-mpc').setAttribute('y2', mpcY2);

    const mscX1 = toSvgX(0), mscY1 = toSvgY(FIXED_MEC);
    const mscX2 = toSvgX(60), mscY2 = toSvgY(FIXED_MEC +  60);
    document.getElementById('curve-msc').setAttribute('x1', mscX1);
    document.getElementById('curve-msc').setAttribute('y1', mscY1);
    document.getElementById('curve-msc').setAttribute('x2', mscX2);
    document.getElementById('curve-msc').setAttribute('y2', mscY2);

    // Free Market Math
    const qe = 100 / 2;
    const pe = 100 -  qe;
    const qs = (100 - FIXED_MEC) / 2;
    const ps = 100 -  qs;

    const curveTax = document.getElementById('curve-tax');
    const lineQuota = document.getElementById('line-quota');
    const curveQpoll = document.getElementById('curve-qpoll');
    const curveRd = document.getElementById('curve-rd');
    const curveEdu = document.getElementById('curve-edu');
    const areaTaxRev = document.getElementById('area-tax-rev');

    curveTax.style.display = 'none';
    lineQuota.style.display = 'none';
    curveQpoll.style.display = 'none';
    curveRd.style.display = 'none';
    curveEdu.style.display = 'none';
    areaTaxRev.style.display = 'none';

    let currentQ = qe;
    let pc = pe;
    let pp = pe;
    let effectiveMec = FIXED_MEC;

    if (activePolicy === 'tax') {
      currentQ = Math.max(0, (100 - taxVal) / 2);
      pc = 100 -  currentQ;
      pp =  currentQ;

      const taxX1 = toSvgX(0), taxY1 = toSvgY(taxVal);
      const taxX2 = toSvgX(60), taxY2 = toSvgY(taxVal +  60);
      curveTax.setAttribute('x1', taxX1); curveTax.setAttribute('y1', taxY1);
      curveTax.setAttribute('x2', taxX2); curveTax.setAttribute('y2', taxY2);
      curveTax.style.display = 'block';

      if (taxVal > 0 && currentQ > 0 && taxRevCheck.checked) {
        const qX = toSvgX(currentQ);
        const pcY = toSvgY(pc);
        const ppY = toSvgY(pp);
        areaTaxRev.setAttribute('points', `70,${pcY} ${qX},${pcY} ${qX},${ppY} 70,${ppY}`);
        areaTaxRev.style.display = 'block';

        areaTaxRev.onmouseover = (e) => showTooltip(TOOLTIP_DICT.tax_rev, e);
        areaTaxRev.onmousemove = (e) => showTooltip(TOOLTIP_DICT.tax_rev, e);
        areaTaxRev.onmouseleave = hideTooltip;
      }

    } else if (activePolicy === 'quota') {
      currentQ = Math.min(qe, quotaVal);
      pc = 100 -  currentQ;
      pp =  currentQ;

      const qCapX = toSvgX(quotaVal);
      lineQuota.setAttribute('x1', qCapX); lineQuota.setAttribute('y1', 380);
      lineQuota.setAttribute('x2', qCapX); lineQuota.setAttribute('y2', 25);
      lineQuota.style.display = 'block';

    } else if (activePolicy === 'qpoll') {
      effectiveMec = Math.max(0, FIXED_MEC - qpollVal);
      currentQ = qe;
      pc = pe;
      pp = pe;

      const qpX1 = toSvgX(0), qpY1 = toSvgY(effectiveMec);
      const qpX2 = toSvgX(60), qpY2 = toSvgY(effectiveMec +  60);
      curveQpoll.setAttribute('x1', qpX1); curveQpoll.setAttribute('y1', qpY1);
      curveQpoll.setAttribute('x2', qpX2); curveQpoll.setAttribute('y2', qpY2);
      curveQpoll.style.display = 'block';

    } else if (activePolicy === 'rd') {
      effectiveMec = Math.max(0, FIXED_MEC - rdVal);
      currentQ = qe;
      pc = pe;
      pp = pe;

      const rdX1 = toSvgX(0), rdY1 = toSvgY(effectiveMec);
      const rdX2 = toSvgX(60), rdY2 = toSvgY(effectiveMec +  60);
      curveRd.setAttribute('x1', rdX1); curveRd.setAttribute('y1', rdY1);
      curveRd.setAttribute('x2', rdX2); curveRd.setAttribute('y2', rdY2);
      curveRd.style.display = 'block';

    } else if (activePolicy === 'edu') {
      currentQ = Math.max(0, (100 - eduVal) / 2);
      pc = 100 -  currentQ;
      pp = pc;

      const eduX1 = toSvgX(0), eduY1 = toSvgY(eduVal);
      const eduX2 = toSvgX(60), eduY2 = toSvgY(eduVal +  60);
      curveEdu.setAttribute('x1', eduX1); curveEdu.setAttribute('y1', eduY1);
      curveEdu.setAttribute('x2', eduX2); curveEdu.setAttribute('y2', eduY2);
      curveEdu.style.display = 'block';
    }

    const activeQs = (100 - effectiveMec) / 2;
    window.currentNEModel={qe,qs,currentQ,activeQs,pc,pp,effectiveMec};
    const activePs = 100 -  activeQs;

    // --- Render MEC Arrow ---
    const groupMec = document.getElementById('group-mec');
    if (mecCheck.checked && effectiveMec > 1) {
      const mecQ = 22;
      const mecX = toSvgX(mecQ);
      const yBottom = toSvgY( mecQ);
      const yTop = toSvgY(effectiveMec +  mecQ);
      renderTwoSidedVerticalArrow(groupMec, mecX, yBottom, yTop, "MEC", "#dc2626");
      groupMec.style.display = 'block';
    } else {
      groupMec.style.display = 'none';
    }

    // --- Render Per-Unit Tax Arrow ---
    const groupTaxSize = document.getElementById('group-tax-size');
    if (activePolicy === 'tax' && taxVal > 0 && taxSizeCheck.checked) {
      const taxX = toSvgX(currentQ);
      const yBottom = toSvgY( currentQ);
      const yTop = toSvgY(taxVal +  currentQ);
      renderTwoSidedVerticalArrow(groupTaxSize, taxX, yBottom, yTop, "Tax", "#4169e1");
      groupTaxSize.style.display = 'block';
    } else {
      groupTaxSize.style.display = 'none';
    }

    // --- Quantities Tooltip Setup ---
    let rawQPoints = [
      { val: qe, pVal: pe, label: 'Qe', color: '#1f2937', tooltip: TOOLTIP_DICT.qe },
      { val: qs, pVal: ps, label: 'Qs', color: '#dc2626', tooltip: TOOLTIP_DICT.qs }
    ];

    if (effectiveMec !== FIXED_MEC) {
      let color = activePolicy === 'qpoll' ? '#4169e1' : '#4169e1';
      rawQPoints.push({ val: activeQs, pVal: activePs, label: "Qs'", color: color, tooltip: TOOLTIP_DICT.qs_prime });
    }

    if (activePolicy !== 'none') {
      let color = '#4169e1';
      if (activePolicy === 'quota') color = '#4169e1';
      if (activePolicy === 'qpoll') color = '#4169e1';
      if (activePolicy === 'rd') color = '#4169e1';
      if (activePolicy === 'edu') color = '#4169e1';

      let pLabel = activePolicy === 'tax' ? "Qt" : (activePolicy === 'quota' ? "Q_quota" : (activePolicy === 'edu' ? "Qe'" : "Qe"));
      if(activePolicy!=='quota'||quotaVal<=qe)rawQPoints.push({ val: currentQ, pVal: pc, label: pLabel, color: color, tooltip: TOOLTIP_DICT.qt });
    }

    rawQPoints.sort((a, b) => a.val - b.val);
    let qGroups = [];
    rawQPoints.forEach(pt => {
      let added = false;
      for (let g of qGroups) {
        if (Math.abs(g.val - pt.val) < ECON_EPS) {
          g.items.push(pt);
          added = true;
          break;
        }
      }
      if (!added) qGroups.push({ val: pt.val, items: [pt] });
    });

    qGroups.forEach(g => {
      const qX = toSvgX(g.val);
      const maxP = Math.max(...g.items.map(i => i.pVal));
      const topY = toSvgY(maxP);

      const uniqueLabels = [...new Set(g.items.map(i => i.label))];
      if(activePolicy==='quota'&&uniqueLabels.includes('Q_quota'))uniqueLabels.unshift(uniqueLabels.splice(uniqueLabels.indexOf('Q_quota'),1)[0]);
      const combinedText = uniqueLabels.join(' = ');
      const topColor = g.items[g.items.length - 1].color;

      const line = createSvgLine(qX, topY, qX, 380, 'guide-line');
      dynamicGuides.appendChild(line);

      const combinedTooltip = g.items.map(i => i.tooltip).join('<hr style="border:0;border-top:1px solid #4b5563;margin:8px 0;">');

      const labelX = Math.min(580, Math.max(70, qX));
      const text = createSvgText(labelX, 398, combinedText, {
        anchor: 'middle',
        fontWeight: 'bold',
        fill: topColor,
        className: 'has-tooltip'
      });

      text.onmouseover = (e) => showTooltip(combinedTooltip, e);
      text.onmousemove = (e) => showTooltip(combinedTooltip, e);
      text.onmouseleave = hideTooltip;

      text.dataset.axisKind='q';text.dataset.axisX=qX;text.dataset.axisY=380;text.dataset.modelAnchor='true';
      dynamicAxisLabels.appendChild(text);
    });

    // Prices Rendering
    let rawPPoints = [
      { val: pe, qVal: qe, label: 'Pe', color: '#1f2937' },
      { val: ps, qVal: qs, label: 'Ps', color: '#dc2626' }
    ];

    if (effectiveMec !== FIXED_MEC) {
      let color = activePolicy === 'qpoll' ? '#4169e1' : '#4169e1';
      rawPPoints.push({ val: activePs, qVal: activeQs, label: "Ps'", color: color });
    }

    if (activePolicy === 'quota') {
      let color = '#4169e1';
      if (activePolicy === 'quota') color = '#4169e1';
      if (activePolicy === 'qpoll') color = '#4169e1';
      if (activePolicy === 'rd') color = '#4169e1';
      if (activePolicy === 'edu') color = '#4169e1';

      let priceLabel = 'P_quota';
      rawPPoints.push({ val: pc, qVal: currentQ, label: priceLabel, color: color });

    }

    rawPPoints.sort((a, b) => a.val - b.val);
    let pGroups = [];
    rawPPoints.forEach(pt => {
      let added = false;
      for (let g of pGroups) {
        if (Math.abs(g.val - pt.val) < ECON_EPS) {
          g.items.push(pt);
          added = true;
          break;
        }
      }
      if (!added) pGroups.push({ val: pt.val, items: [pt] });
    });

    pGroups.forEach(g => {
      const pY = toSvgY(g.val);
      const maxQ = Math.max(...g.items.map(i => i.qVal));
      const startX = toSvgX(maxQ);

      const uniqueLabels = [...new Set(g.items.map(i => i.label))];
      const combinedText = uniqueLabels.join(' = ');
      const topColor = g.items[g.items.length - 1].color;

      const line = createSvgLine(startX, pY, 70, pY, 'guide-line');
      dynamicGuides.appendChild(line);

      const text = createSvgText(64, pY + 4, combinedText, {
        anchor: 'end',
        fontWeight: 'bold',
        fill: topColor,
        fontSize: combinedText.length > 8 ? '11px' : '13px'
      });
      text.dataset.axisKind='p';text.dataset.axisX=70;text.dataset.axisY=pY;text.dataset.modelAnchor='true';
      dynamicAxisLabels.appendChild(text);
    });

    // Dynamic Curve Labels
    let activeCurves = [
      { curveId:'curve-mpc', yEnd: 60, label: 'MPC', color: '#16a34a' },
      { curveId:'curve-msc', yEnd: 60 + FIXED_MEC, label: 'MSC = MPC + MEC', color: '#dc2626' }
    ];

    if (activePolicy === 'tax') {
      activeCurves.push({ curveId:'curve-tax', yEnd: 60 + taxVal, label: 'MPC + Tax', color: '#4169e1' });
    } else if (activePolicy === 'qpoll') {
      activeCurves.push({ curveId:activePolicy==='qpoll'?'curve-qpoll':'curve-rd', yEnd: 60 + effectiveMec, label: 'MSC* (Pollutant Quota)', color: '#4169e1' });
    } else if (activePolicy === 'rd') {
      activeCurves.push({ curveId:activePolicy==='qpoll'?'curve-qpoll':'curve-rd', yEnd: 60 + effectiveMec, label: 'MSC* (R&D)', color: '#4169e1' });
    } else if (activePolicy === 'edu') {
      activeCurves.push({ curveId:'curve-edu', yEnd: 60 + eduVal, label: 'MPC* (Education)', color: '#4169e1' });
    }

    let curveGroups = [];
    activeCurves.forEach(c => {
      let added = false;
      for (let g of curveGroups) {
        if (Math.abs(g.yEnd - c.yEnd) < ECON_EPS) {
          g.items.push(c);
          added = true;
          break;
        }
      }
      if (!added) curveGroups.push({ yEnd: c.yEnd, items: [c] });
    });

    function shortenCurveLabel(lbl) {
      if (lbl === 'MSC = MPC + MEC') return 'MSC';
      return lbl;
    }

    curveGroups.forEach(g => {
      const ySvg = toSvgY(g.yEnd);
      let combinedLabel = "";
      if (g.items.length === 1) {
        combinedLabel = g.items[0].label;
      } else {
        const unique = [...new Set(g.items.map(i => shortenCurveLabel(i.label)))];
        combinedLabel = unique.join(' = ');
      }
      const color = g.items[g.items.length - 1].color;

      const labelX = Math.min(500, toSvgX(60) + 6);
      const text = createSvgText(labelX, ySvg + 4, combinedLabel, {
        fontWeight: 'bold',
        fill: color
      });
      text.dataset.curveTarget=g.items[g.items.length-1].curveId;
      dynamicCurveLabels.appendChild(text);
    });

    if (activePolicy === 'quota') {
      const qCapX = toSvgX(quotaVal);
      const labelX = Math.min(580, Math.max(70, qCapX));
      const text = createSvgText(labelX, 42, 'Quota', {
        anchor: 'middle',
        fontWeight: 'bold',
        fill: '#4169e1'
      });
      dynamicCurveLabels.appendChild(text);
    }

    // Dynamic Nodes & Tooltips
    let rawNodes = [
      { q: qe, p: pe, label: 'Ee', color: '#1f2937', tooltip: TOOLTIP_DICT.node_ee },
      { q: qs, p: ps, label: 'Es', color: '#dc2626', tooltip: TOOLTIP_DICT.node_es }
    ];

    if (effectiveMec !== FIXED_MEC) {
      let color = activePolicy === 'qpoll' ? '#4169e1' : '#4169e1';
      rawNodes.push({ q: activeQs, p: activePs, label: "Es'", color: color, tooltip: TOOLTIP_DICT.qs_prime });
    }

    if (activePolicy !== 'none') {
      let themeColor = '#4169e1';
      if (activePolicy === 'quota') themeColor = '#4169e1';
      if (activePolicy === 'qpoll') themeColor = '#4169e1';
      if (activePolicy === 'rd') themeColor = '#4169e1';
      if (activePolicy === 'edu') themeColor = '#4169e1';

      rawNodes.push({ q: currentQ, p: pc, label: '', color: themeColor });
      if (activePolicy === 'tax' && taxVal > 0) {
        rawNodes.push({ q: currentQ, p: pp, label: '', color: '#16a34a' });
      }
    }

    let nodeGroups = [];
    rawNodes.forEach(nd => {
      let added = false;
      for (let g of nodeGroups) {
        if (Math.abs(g.q - nd.q) < ECON_EPS && Math.abs(g.p - nd.p) < ECON_EPS) {
          g.items.push(nd);
          added = true;
          break;
        }
      }
      if (!added) nodeGroups.push({ q: nd.q, p: nd.p, items: [nd] });
    });

    nodeGroups.forEach(g => {
      const x = toSvgX(g.q);
      const y = toSvgY(g.p);
      const topColor = g.items[g.items.length - 1].color;

      const circle = createSvgCircle(x, y, 4, topColor);
      circle.setAttribute('class', 'has-tooltip');
      
      const ttText = g.items.map(i => i.tooltip).filter(Boolean).join('<hr style="border:0;border-top:1px solid #4b5563;margin:8px 0;">');
      if (ttText) {
        circle.onmouseover = (e) => showTooltip(ttText, e);
        circle.onmousemove = (e) => showTooltip(ttText, e);
        circle.onmouseleave = hideTooltip;
      }
      dynamicNodes.appendChild(circle);

      const labels = [...new Set(g.items.map(i => i.label).filter(l => l !== ''))];
      if (labels.length > 0) {
        const combinedText = labels.join(' = ');
        const labelX = (x < 120) ? x + 10 : x + 12;
        const text = createSvgText(labelX, y + 4, combinedText, {
          fontWeight: 'bold',
          fill: topColor
        });
        text.dataset.pointX=x;text.dataset.pointY=y;
        dynamicNodes.appendChild(text);
      }
    });

    // Dynamic DWL Calculation & Dictionary Tooltip
    const areaDwl = document.getElementById('area-dwl');
    const labelDwlText = document.getElementById('label-dwl-text');

    const activeQsX = toSvgX(activeQs);
    const activePsY = toSvgY(activePs);

    if (!dwlCheck.checked || Math.abs(currentQ - activeQs) < ECON_EPS) {
      areaDwl.style.display = 'none';
      labelDwlText.style.display = 'none';
    } else {
      areaDwl.style.display = 'block';

      const qActX = toSvgX(currentQ);
      const pMscCurrentQ = effectiveMec +  currentQ;
      const pMpbCurrentQ = 100 -  currentQ;

      areaDwl.setAttribute('points', 
        `${activeQsX},${activePsY} ${qActX},${toSvgY(pMscCurrentQ)} ${qActX},${toSvgY(pMpbCurrentQ)}`
      );

      const dwlCenterX = (activeQsX + 2 * qActX) / 3;
      const dwlCenterY = (activePsY + toSvgY(pMscCurrentQ) + toSvgY(pMpbCurrentQ)) / 3;
      labelDwlText.setAttribute('x', dwlCenterX);
      labelDwlText.setAttribute('y', dwlCenterY);

      const isAreaTooSmall = Math.abs(currentQ - activeQs) < 5;
      labelDwlText.style.display = isAreaTooSmall ? 'none' : 'block';

      // Dynamic Canonical DWL String Assignment (Over vs Under consumption)
      const dwlHtml = (currentQ > activeQs) ? TOOLTIP_DICT.dwl_over : TOOLTIP_DICT.dwl_under;

      areaDwl.onmouseover = (e) => showTooltip(dwlHtml, e);
      areaDwl.onmousemove = (e) => showTooltip(dwlHtml, e);
      areaDwl.onmouseleave = hideTooltip;

      labelDwlText.onmouseover = (e) => showTooltip(dwlHtml, e);
      labelDwlText.onmousemove = (e) => showTooltip(dwlHtml, e);
      labelDwlText.onmouseleave = hideTooltip;
    }

    // Over-production Arrow Indicator
    const groupOverprod = document.getElementById('group-overprod');
    const lineOverprod = document.getElementById('line-overprod');
    const labelOverprod = document.getElementById('label-overprod');

    const currentQX = toSvgX(currentQ);
    if (overprodCheck.checked && Math.abs(currentQX - activeQsX) > 8) {
      groupOverprod.style.display = 'block';
      const arrowY = 447;
      const minX = Math.min(currentQX, activeQsX);
      const maxX = Math.max(currentQX, activeQsX);

      lineOverprod.setAttribute('x1', minX + 3);
      lineOverprod.setAttribute('y1', arrowY);
      lineOverprod.setAttribute('x2', maxX - 3);
      lineOverprod.setAttribute('y2', arrowY);

      labelOverprod.setAttribute('x', (minX + maxX) / 2);
      labelOverprod.setAttribute('y', arrowY + 16);
      labelOverprod.textContent = (currentQ < activeQs) ? "Under-production" : "Over-production";
    } else {
      groupOverprod.style.display = 'none';
    }
  }

  // Global Event Listeners
  taxSlider.addEventListener('input', updateDiagram);
  taxRevCheck.addEventListener('change', updateDiagram);
  taxSizeCheck.addEventListener('change', updateDiagram);
  dwlCheck.addEventListener('change', updateDiagram);
  overprodCheck.addEventListener('change', updateDiagram);
  mecCheck.addEventListener('change', updateDiagram);
  quotaSlider.addEventListener('input', updateDiagram);
  qpollSlider.addEventListener('input', updateDiagram);
  rdSlider.addEventListener('input', updateDiagram);
  eduSlider.addEventListener('input', updateDiagram);
  toggleTooltips.addEventListener('change', hideTooltip);


  // W(Q) = integral_0^Q [MSB-MSC] dq = (100-MEC)Q - Q^2.
  function banModel(mec){
    const qe=100/2,qs=Math.max(0,(100-mec)/2),welfare=q=>(100-mec)*q-q*q;
    const best=welfare(qs),freeDwl=Math.max(0,best-welfare(qe)),banDwl=Math.max(0,best);
    return {mec,qe,qs,freeDwl,banDwl,gain:freeDwl-banDwl};
  }
  function setBanView(active){
    const svg=document.getElementById('diagram-plot');let original=document.getElementById('original-scene');
    if(!original){original=document.createElementNS('http://www.w3.org/2000/svg','g');original.id='original-scene';[...svg.children].filter(el=>el.tagName!=='defs').forEach(el=>original.append(el));svg.append(original);}
    let ban=document.getElementById('ban-scene');if(!ban){ban=document.createElementNS('http://www.w3.org/2000/svg','g');ban.id='ban-scene';svg.append(ban);}
    original.style.display=active?'none':'block';ban.style.display=active?'block':'none';
  }
  function banEl(tag,attrs,text){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs||{}).forEach(([k,v])=>el.setAttribute(k,v));if(text!==undefined)el.textContent=text;document.getElementById('ban-scene').append(el);return el;}
  function explainBan(el,html,label){el.classList.add('has-tooltip');el.dataset.tooltipTarget='';el.setAttribute('tabindex','0');el.setAttribute('role','button');el.setAttribute('aria-label',label);el.onmousemove=e=>showTooltip(html,e);el.onmouseleave=hideTooltip;}
  function renderBan(){
    const mec=+document.getElementById('ban-mec-slider').value,b=banModel(mec);window.currentBanModel=b;
    document.getElementById('ban-scene').replaceChildren();
    const scale=(355/120),x=q=>70+scale*q,y=p=>380-scale*p,mpb=q=>100 - q,mpc=q=>q,msc=q=>mpc(q)+mec;
    const line=(q1,p1,q2,p2,attrs={})=>banEl('line',{x1:x(q1),y1:y(p1),x2:x(q2),y2:y(p2),...attrs});
    const txt=(xx,yy,text,attrs={})=>banEl('text',{x:xx,y:yy,'font-weight':'bold',...attrs},text);
    const pts=arr=>arr.map(([q,p])=>`${x(q)},${y(p)}`).join(' '),fmt=v=>v.toLocaleString('en-SG',{minimumFractionDigits:2,maximumFractionDigits:2});
    const freeExplanation=`<strong>Free-market DWL</strong><br>Without the ban, output remains Q<sub>e</sub>. The shaded area is the excess of MSC over MSB from Q<sub>s</sub> to Q<sub>e</sub>.`;
    const banExplanation=`<strong>DWL caused by the ban</strong><br>Output is zero. The shaded area represents the net benefits forgone on units up to Q<sub>s</sub>, where MSB exceeds MSC.`;
    if(document.getElementById('ban-compare').checked&&b.freeDwl>ECON_EPS){const a=banEl('polygon',{id:'ban-free-area',class:'ban-free-area',points:pts([[b.qs,mpb(b.qs)],[b.qe,mpb(b.qe)],[b.qe,msc(b.qe)],[b.qs,msc(b.qs)]])});explainBan(a,freeExplanation,'Explain free-market deadweight loss');}
    if(dwlCheck.checked&&b.banDwl>ECON_EPS){const a=banEl('polygon',{id:'ban-loss-area',class:'dwl-poly',points:pts([[0,mpb(0)],[0,msc(0)],[b.qs,mpb(b.qs)]])});explainBan(a,banExplanation,'Explain deadweight loss under the ban');}
    banEl('line',{x1:70,y1:380,x2:425,y2:380,class:'axis','marker-end':'url(#arrow)'});banEl('line',{x1:70,y1:380,x2:70,y2:25,class:'axis','marker-end':'url(#arrow)'});
    const axisTitle=txt(64,19,'',{'text-anchor':'end',class:'axis-title',style:''});['Price /','Costs /','Benefits'].forEach((word,i)=>{const span=document.createElementNS('http://www.w3.org/2000/svg','tspan');span.setAttribute('x','64');if(i)span.setAttribute('dy','14');span.textContent=word;axisTitle.append(span);});txt(435,385,'Quantity',{class:'axis-title'});
    line(0,mpb(0),85,mpb(85),{class:'line-mpb'});line(0,mpc(0),60,mpc(60),{class:'line-mpc'});if(mec>ECON_EPS)line(0,msc(0),60,msc(60),{class:'line-msc'});
    txt(x(85)+6,y(mpb(85))+5,'MPB = MSB',{fill:'#2563eb'});txt(x(60)+6,y(mpc(60))+5,mec===0?'MPC = MSC':'MPC',{fill:'#16a34a'});if(mec>ECON_EPS)txt(x(60)+6,y(msc(60))-12,'MSC = MPC + MEC',{fill:'#dc2626'});
    banEl('line',{x1:70,y1:380,x2:70,y2:40,stroke:'#4169e1','stroke-width':3,'stroke-dasharray':'6,4'});txt(82,48,'Ban: no output',{fill:'#4169e1'});
    line(b.qe,0,b.qe,mpb(b.qe),{class:'guide-line'});
    const ee=banEl('circle',{cx:x(b.qe),cy:y(mpb(b.qe)),r:4.5,fill:'#1f2937'});explainBan(ee,'<strong>Unregulated market</strong><br>MPB = MPC. Qe remains unchanged as MEC varies because the external cost is not borne by these producers.','Explain unregulated market equilibrium');
    txt(x(b.qe)+12,y(mpb(b.qe))+14,mec===0?'Ee = Es':'Ee',{'data-point-x':x(b.qe),'data-point-y':y(mpb(b.qe))});const qeLabel=txt(x(b.qe),400,mec===0?'Qe = Qs':'Qe',{'text-anchor':'middle'});explainBan(qeLabel,freeExplanation,'Explain free-market output');
    if(b.qs>ECON_EPS&&Math.abs(b.qs-b.qe)>ECON_EPS){line(b.qs,0,b.qs,mpb(b.qs),{class:'guide-line'});const es=banEl('circle',{cx:x(b.qs),cy:y(mpb(b.qs)),r:4.5,fill:'#dc2626'});explainBan(es,'<strong>Social optimum</strong><br>MSB = MSC at this positive output. A complete ban would also prevent the beneficial units below Qs.','Explain social optimum');txt(x(b.qs)+10,y(mpb(b.qs))-10,'Es',{fill:'#dc2626','data-point-x':x(b.qs),'data-point-y':y(mpb(b.qs))});const label=txt(x(b.qs),Math.abs(b.qs-b.qe)<10?418:400,'Qs',{fill:'#dc2626','text-anchor':'middle'});explainBan(label,banExplanation,'Explain socially optimal output');}
    const zero=txt(70,438,b.qs<=ECON_EPS?'Qb = Qs':'Qb',{fill:'#4169e1','text-anchor':'middle'});explainBan(zero,b.qs<=ECON_EPS?'<strong>Zero output is socially optimal</strong><br>MSC is at least MSB for every feasible positive quantity. A ban eliminates the output-related DWL in this model.':'<strong>Output under a ban</strong><br>A ban sets the output quota at zero. There is no transaction price because no units are traded.','Explain zero-output quota');
    if(overprodCheck.checked&&b.qs>ECON_EPS){const len=x(b.qs)-70,pad=Math.min(2,len/4);banEl('line',{x1:70+pad,y1:452,x2:x(b.qs)-pad,y2:452,stroke:'#dc2626','stroke-width':2,...(len>20?{'marker-start':'url(#arrow-left)','marker-end':'url(#arrow-right)'}:{})});txt(Math.max(150,(70+x(b.qs))/2),465,'Under-production with ban',{fill:'#dc2626','text-anchor':'middle','font-size':'11'});}
    if(mecCheck.checked&&mec>ECON_EPS){const q=15;line(q,mpc(q),q,msc(q),{id:'ban-mec-arrow',stroke:'#dc2626','stroke-width':2,'marker-start':'url(#ew-meb-start)','marker-end':'url(#ew-meb-end)'});txt(x(q)+7,(y(mpc(q))+y(msc(q)))/2+4,'MEC',{fill:'#dc2626'});}
    let heading,reason;
    if(b.banDwl<ECON_EPS){heading='The ban eliminates DWL.';reason='MSC is at least MSB for every positive unit. The socially optimal quantity is zero.';}
    else if(Math.abs(b.gain)<ECON_EPS){heading='The ban and free market have equal DWL.';reason='The ban prevents harmful units, but the forgone benefits of the beneficial units are equally large.';}
    else if(b.gain>0){heading='The ban reduces DWL, but does not eliminate it.';reason='Avoiding the harmful units produces a net welfare gain, although some beneficial units are also prevented.';}
    else{heading='The ban increases DWL.';reason='The forgone benefits of preventing beneficial units exceed the welfare gain from avoiding harmful units.';}
    document.getElementById('ban-results').innerHTML=`<h2><strong>${heading}</strong></h2><p>${reason}</p><div class="ban-legend"><span><i style="background:#dc262640;border-color:#dc2626"></i>DWL under ban</span><span><i style="background:#d9770630;border-color:#b45309;border-style:dashed"></i>Free-market DWL (counterfactual)</span></div><details><summary>When does a ban improve welfare?</summary><p>A ban <strong>reduces DWL</strong> when the welfare gain from preventing harmful output outweighs the net benefits forgone by preventing beneficial output.</p><p>It <strong>eliminates DWL</strong> only when no positive output is socially desirable: MSC is at least MSB for every feasible positive quantity. Reducing DWL does not necessarily mean eliminating it.</p><p>Compare the shaded areas at the <strong>same MEC</strong>. The model assumes a fully enforced ban, no illegal market or substitutes, and no enforcement costs. The private curves and graph scales stay fixed as MEC varies.</p></details>`;
  }
  document.getElementById('ban-mec-slider').addEventListener('input',()=>{dismissTooltip();updateDiagram();});
  document.getElementById('ban-compare').addEventListener('change',()=>{dismissTooltip();updateDiagram();});

  /* SHARED INTERACTIONS v2 — presentation only; original equations are above. */

  // Capture model positions before presentation passes displace the labels.
  const modelRenderDiagram=renderDiagram;
  renderDiagram=function(){modelRenderDiagram();captureModelAnchors();};
  function captureModelAnchors(){
   const svg=document.getElementById('diagram');
   for(const e of svg.querySelectorAll('text')){
    const name=e.textContent.trim(),x=+e.getAttribute('x'),y=+e.getAttribute('y');
    if(name==='Quota')continue; // Policy caption, never a quantity-axis value.
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
  const widgetInitial=[...document.querySelectorAll('.controls input,.controls select,#ban-controls input')].map(el=>({el,value:el.value,checked:el.checked}));
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
    const labels=[...widgetSvg.querySelectorAll('text')].filter(e=>visible(e)&&e.textContent.trim()!=='Quota'&&/^[QP][a-z]+$/.test(e.textContent.trim()));
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
  const glossaryPolicyNames={indirect_subsidy:'Indirect Subsidy',direct_subsidy:'Direct Subsidy',free_provision:'Free Provision',joint_provision:'Joint Provision',education:'Education & Campaigns',tax:'Tax',quota:'Quota on Output',ban:'Ban (a quota of zero)',qpoll:'Quota on Pollutant',rd:'Research & Development (R&D) For Cleaner Technology',edu:'Education & Campaigns'};
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
    widgetSvg.querySelectorAll('#group-mec polygon').forEach(el=>el.style.display='none');
    const captions=[...widgetSvg.querySelectorAll('#label-output-gap,#label-gap,#label-overprod,#ban-scene text,.free-gap-label')].filter(el=>visible(el)&&/(Under|Over)-(consumption|production)/i.test(el.textContent));
    const qlabels=[...widgetSvg.querySelectorAll('text')].filter(el=>visible(el)&&/^[Qq]/.test(el.textContent)&&+el.getAttribute('y')>=380&&+el.getAttribute('y')<440);
    const bottom=Math.max(402,...qlabels.map(el=>el.getBBox().y+el.getBBox().height));
    captions.forEach(el=>el.setAttribute('y',Math.min(445,bottom+28)));
    widgetSvg.querySelectorAll('#under-arrow,#over-arrow,#arrow-gap,#line-overprod,.free-gap-arrow').forEach(el=>{if(visible(el)){el.setAttribute('y1',Math.min(441,bottom+10));el.setAttribute('y2',Math.min(441,bottom+10));}});
    widgetSvg.querySelectorAll('#ban-scene line').forEach(el=>{if(+el.getAttribute('y1')===452&&+el.getAttribute('y2')===452){el.setAttribute('y1',Math.min(441,bottom+10));el.setAttribute('y2',Math.min(441,bottom+10));}});
  }

  function qualitativeControls(){document.querySelectorAll('input[type="range"]').forEach(el=>{const lo=+el.min,hi=+el.max,v=+el.value,t=(v-lo)/(hi-lo);el.setAttribute('aria-valuetext',t===0?'Minimum':t===1?'Maximum':t<.34?'Low':t<.67?'Moderate':'High');});}
  function updateDiagram(){EconDiagramPresentation.resetPresentation(widgetSvg);restoreLabelPresentation();renderDiagram();qualitativeControls();mergeExactLabels();labelLayout();compactAnnotations();registerTargets();approvedUX();EconPilot.schedule();}
  updateDiagram();

