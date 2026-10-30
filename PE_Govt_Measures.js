
  const policySelect = document.getElementById('policy-select');
  const sliderContainer = document.getElementById('slider-container');
  const policySlider = document.getElementById('policy-slider');
  const sliderLabel = document.getElementById('slider-label');

  const toggleTooltips = document.getElementById('toggle-tooltips');
  const toggleDwl = document.getElementById('toggle-dwl');
  const toggleGap = document.getElementById('toggle-gap');
  const toggleMeb = document.getElementById('toggle-meb');
  const toggleSubsidyCost = document.getElementById('toggle-subsidy-cost');
  const toggleSubsidyCostLabel = document.getElementById('toggle-subsidy-cost-label');

  const dwl = document.getElementById('dwl');
  const labelDwlText = document.getElementById('label-dwl-text');
  const subsidyCostRect = document.getElementById('subsidy-cost-rect');
  const labelSubsidyCostText = document.getElementById('label-subsidy-cost-text');
  const diagramTooltip = document.getElementById('diagram-tooltip');
  const mainContent = document.querySelector('.main-content');

  const labelQe = document.getElementById('label-qe');
  const dotEe = document.getElementById('dot-ee');
  const labelQs = document.getElementById('label-qs');
  const dotEs = document.getElementById('dot-es');

  const touchTargetEe = document.getElementById('touch-target-ee');
  const touchTargetEs = document.getElementById('touch-target-es');
  const touchTargetQe = document.getElementById('touch-target-qe');
  const touchTargetQs = document.getElementById('touch-target-qs');

  const linePolicyCurve = document.getElementById('line-policy-curve');
  const arrowPolicy = document.getElementById('arrow-policy');
  const labelPolicyCurve = document.getElementById('label-policy-curve');
  const labelPolicyArrow = document.getElementById('label-policy-arrow');
  const labelMsb = document.getElementById('label-msb');

  const arrowMeb = document.getElementById('arrow-meb');
  const labelMeb = document.getElementById('label-meb');
  const arrowGap = document.getElementById('arrow-gap');
  const labelGap = document.getElementById('label-gap');

  const lineQpol = document.getElementById('line-qpol');
  const linePpol = document.getElementById('line-ppol');
  const dotPol = document.getElementById('dot-pol');
  const labelPol = document.getElementById('label-pol');
  const labelQpol = document.getElementById('label-qpol');
  const labelPpol = document.getElementById('label-ppol');

  const FIXED_MEB = 40; // Baseline external benefit
  let globalCurrentQ = 50;
  const globalQs = (100 + FIXED_MEB) / 2;

  function toSvgX(q) { return 70 + (355/120) * q; }
  function toSvgY(p) { return 380 - (355/120) * p; }

  function renderDiagram() {
    const policy = policySelect.value;
    document.getElementById('joint-results').style.display=policy==='joint_provision'?'block':'none';
    document.querySelectorAll('.joint-only').forEach(el=>el.remove());
    toggleDwl.disabled=policy==='joint_provision';
    toggleDwl.closest('label').title=policy==='joint_provision'?'DWL requires public production-cost assumptions.':'';
    document.getElementById('slider-max-label').textContent='High';
    sliderContainer.querySelector('.scale-label').textContent='None';
    policySlider.max='60';
    const meb = FIXED_MEB;
    const sliderVal = parseFloat(policySlider.value);

    const qe = 50;
    const pe = qe;
    const qs = (100 + meb) / 2;
    const ps = qs;
    const pmsb_qe = pe + meb;

    const qeX = toSvgX(qe), peY = toSvgY(pe);
    const qsX = toSvgX(qs), psY = toSvgY(ps);
    const aY = toSvgY(pmsb_qe);

    labelMsb.textContent = "MSB = MPB + MEB";
    document.getElementById('label-mpc').textContent='MPC = MSC';
    document.getElementById('label-es').innerHTML='E<tspan baseline-shift="sub" font-size="9">s</tspan>';
    document.getElementById('dot-a').style.display='inline';document.getElementById('label-a').style.display='inline';

    const mpcX1 = toSvgX(0), mpcY1 = toSvgY(0);
    const mpcX2 = toSvgX(95), mpcY2 = toSvgY(95);
    document.getElementById('curve-mpc').setAttribute('x1', mpcX1);
    document.getElementById('curve-mpc').setAttribute('y1', mpcY1);
    document.getElementById('curve-mpc').setAttribute('x2', mpcX2);
    document.getElementById('curve-mpc').setAttribute('y2', mpcY2);
    document.getElementById('label-mpc').setAttribute('x', mpcX2 + 6);
    document.getElementById('label-mpc').setAttribute('y', mpcY2 + 4);

    const mpbX1 = toSvgX(0), mpbY1 = toSvgY(100);
    const mpbX2 = toSvgX(95), mpbY2 = toSvgY(100 -  95);
    document.getElementById('curve-mpb').setAttribute('x1', mpbX1);
    document.getElementById('curve-mpb').setAttribute('y1', mpbY1);
    document.getElementById('curve-mpb').setAttribute('x2', mpbX2);
    document.getElementById('curve-mpb').setAttribute('y2', mpbY2);
    document.getElementById('label-mpb').setAttribute('x', mpbX2 + 6);
    document.getElementById('label-mpb').setAttribute('y', mpbY2 + 4);

    const msbX1 = toSvgX(0), msbY1 = toSvgY(100 + meb);
    const msbX2 = toSvgX(95), msbY2 = toSvgY(100 + meb - 95);
    document.getElementById('curve-msb').setAttribute('x1', msbX1);
    document.getElementById('curve-msb').setAttribute('y1', msbY1);
    document.getElementById('curve-msb').setAttribute('x2', msbX2);
    document.getElementById('curve-msb').setAttribute('y2', msbY2);
    labelMsb.setAttribute('x', msbX2 + 6);
    labelMsb.setAttribute('y', msbY2 + 4);

    document.getElementById('line-qe').setAttribute('x1', qeX);
    document.getElementById('line-qe').setAttribute('y1', peY);
    document.getElementById('line-qe').setAttribute('x2', qeX);
    document.getElementById('line-qe').setAttribute('y2', 380);

    document.getElementById('line-pe').setAttribute('x1', 70);
    document.getElementById('line-pe').setAttribute('y1', peY);
    document.getElementById('line-pe').setAttribute('x2', qeX);
    document.getElementById('line-pe').setAttribute('y2', peY);

    document.getElementById('line-qs').setAttribute('x1', qsX);
    document.getElementById('line-qs').setAttribute('y1', psY);
    document.getElementById('line-qs').setAttribute('x2', qsX);
    document.getElementById('line-qs').setAttribute('y2', 380);

    document.getElementById('line-ps').setAttribute('x1', 70);
    document.getElementById('line-ps').setAttribute('y1', psY);
    document.getElementById('line-ps').setAttribute('x2', qsX);
    document.getElementById('line-ps').setAttribute('y2', psY);

    dotEe.setAttribute('cx', qeX);
    dotEe.setAttribute('cy', peY);
    document.getElementById('label-ee').setAttribute('x', qeX + 12);
    document.getElementById('label-ee').setAttribute('y', peY + 12);

    dotEs.setAttribute('cx', qsX);
    dotEs.setAttribute('cy', psY);
    document.getElementById('label-es').setAttribute('x', qsX + 12);
    document.getElementById('label-es').setAttribute('y', psY - 6);

    touchTargetEe.setAttribute('cx', qeX);
    touchTargetEe.setAttribute('cy', peY);
    touchTargetEs.setAttribute('cx', qsX);
    touchTargetEs.setAttribute('cy', psY);

    touchTargetQe.setAttribute('x', qeX - 18);
    touchTargetQe.setAttribute('y', 385);
    touchTargetQs.setAttribute('x', qsX - 18);
    touchTargetQs.setAttribute('y', 385);

    document.getElementById('dot-a').setAttribute('cx', qeX);
    document.getElementById('dot-a').setAttribute('cy', aY);
    document.getElementById('label-a').setAttribute('x', qeX - 16);
    document.getElementById('label-a').setAttribute('y', aY - 6);

    labelQe.setAttribute('x', qeX);
    labelQe.setAttribute('y', 400);

    const labelPe = document.getElementById('label-pe');
    labelPe.setAttribute('x', 60);
    labelPe.setAttribute('y', peY);

    labelQs.setAttribute('x', qsX);
    labelQs.setAttribute('y', 400);

    const labelPs = document.getElementById('label-ps');
    labelPs.setAttribute('x', 60);
    labelPs.setAttribute('y', psY);

    linePolicyCurve.style.strokeDasharray = 'none';
    linePolicyCurve.style.display = 'none';
    arrowPolicy.style.display = 'none';
    labelPolicyCurve.style.display = 'none';
    labelPolicyArrow.style.display = 'none';
    lineQpol.style.display = 'none';
    linePpol.style.display = 'none';
    dotPol.style.display = 'none';
    labelPol.style.display = 'none';
    labelQpol.style.display = 'none';
    labelPpol.style.display = 'none';
    subsidyCostRect.style.display = 'none';
    labelSubsidyCostText.style.display = 'none';

    labelQe.textContent = "Qe";
    labelQe.style.display = 'inline';
    labelPe.textContent = "Pe";
    labelPe.style.display = 'inline';
    labelQs.textContent = "Qs";
    labelQs.style.display = 'inline';
    labelPs.textContent = "Ps";
    labelPs.style.display = 'inline';

    let currentQ = qe;

    if (policy === 'indirect_subsidy' || policy === 'direct_subsidy') {
      toggleSubsidyCostLabel.style.display = 'flex';
    } else {
      toggleSubsidyCostLabel.style.display = 'none';
    }

    if (policy === 'none') {
      sliderContainer.style.display = 'none';
      currentQ = qe;
    } 
    else if (policy === 'indirect_subsidy') {
      sliderContainer.style.display = 'flex';
      sliderLabel.innerHTML = '<strong>Per-unit Subsidy:</strong>';

      const s = sliderVal;
      currentQ = 50 + s / 2;
      const psub = 0 - s + 1 * currentQ;
      const qsubX = toSvgX(currentQ), psubY = toSvgY(psub);

      let subStartQ = 0;
      if (0 - s < 0) {
        subStartQ = s;
      }
      const subX1 = toSvgX(subStartQ);
      const subY1 = toSvgY(Math.max(0, 0 - s));
      const subX2 = toSvgX(95);
      const subY2 = toSvgY(0 - s + 1 * 95);
      linePolicyCurve.setAttribute('x1', subX1);
      linePolicyCurve.setAttribute('y1', subY1);
      linePolicyCurve.setAttribute('x2', subX2);
      linePolicyCurve.setAttribute('y2', subY2);

      if (s === 0) {
        linePolicyCurve.style.display = 'none';
        labelPolicyCurve.style.display = 'none';
      } else {
        linePolicyCurve.style.display = 'inline';
        labelPolicyCurve.textContent = "MPC - Subsidy";
        labelPolicyCurve.setAttribute('x', subX2 + 6);
        labelPolicyCurve.setAttribute('y', subY2 + 4);
        labelPolicyCurve.removeAttribute('text-anchor');
        labelPolicyCurve.style.display = 'inline';
      }

      if (s > 0) {
        const qShift = Math.max(35, s + 10);
        const qShiftX = toSvgX(qShift);
        const yOld = toSvgY(qShift);
        const yNew = toSvgY(0 - s + 1 * qShift);
        arrowPolicy.setAttribute('x1', qShiftX);
        arrowPolicy.setAttribute('y1', yOld - 2);
        arrowPolicy.setAttribute('x2', qShiftX);
        arrowPolicy.setAttribute('y2', yNew + 2);
        arrowPolicy.style.display = 'block';

        labelPolicyArrow.setAttribute('x', qShiftX + 8);
        labelPolicyArrow.setAttribute('y', (yOld + yNew) / 2);
        labelPolicyArrow.setAttribute('dominant-baseline', 'central');
        labelPolicyArrow.setAttribute('text-anchor', 'start');
        labelPolicyArrow.textContent = "Subsidy";
        labelPolicyArrow.style.display = 'inline';
      }

      if (s > 0) {
        dotPol.setAttribute('cx', qsubX);
        dotPol.setAttribute('cy', psubY);
        dotPol.style.display = 'block';

        lineQpol.setAttribute('x1', qsubX);
        lineQpol.setAttribute('y1', psubY);
        lineQpol.setAttribute('x2', qsubX);
        lineQpol.setAttribute('y2', 380);
        lineQpol.style.display = 'inline';
      }

      if (Math.abs(currentQ - qs) < 0.1 && s > 0) {
        labelQs.textContent = "Qs = Qsub";
      } else if (s > 0) {
        labelQpol.textContent = "Qsub";
        labelQpol.setAttribute('x', qsubX);
        labelQpol.setAttribute('y', 415);
        labelQpol.style.display = 'inline';
      }
    } 
    else if (policy === 'direct_subsidy') {
      sliderContainer.style.display = 'flex';
      sliderLabel.innerHTML = '<strong>Per-unit Subsidy:</strong>';

      const s = sliderVal;
      currentQ = 50 + s / 2;
      const psub = 100 + s - 1 * currentQ;
      const qsubX = toSvgX(currentQ), psubY = toSvgY(psub);

      const subX1 = toSvgX(0), subY1 = toSvgY(100 + s);
      const subX2 = toSvgX(95), subY2 = toSvgY(100 + s - 1 * 95);
      linePolicyCurve.setAttribute('x1', subX1);
      linePolicyCurve.setAttribute('y1', subY1);
      linePolicyCurve.setAttribute('x2', subX2);
      linePolicyCurve.setAttribute('y2', subY2);

      if (s === 0) {
        linePolicyCurve.style.display = 'none';
        labelPolicyCurve.style.display = 'none';
      } else if (Math.abs(s - meb) < 0.1) {
        labelMsb.textContent = "MSB = MPB + Subsidy";
        linePolicyCurve.style.display = 'none';
        labelPolicyCurve.style.display = 'none';
      } else {
        linePolicyCurve.style.display = 'inline';
        labelPolicyCurve.textContent = "MPB + Subsidy";
        labelPolicyCurve.setAttribute('x', subX2 + 6);
        labelPolicyCurve.setAttribute('y', subY2 + 4);
        labelPolicyCurve.removeAttribute('text-anchor');
        labelPolicyCurve.style.display = 'inline';
      }

      if (s > 0) {
        const qShift = 35;
        const qShiftX = toSvgX(qShift);
        const yOld = toSvgY(100 -  qShift);
        const yNew = toSvgY(100 + s - 1 * qShift);
        arrowPolicy.setAttribute('x1', qShiftX);
        arrowPolicy.setAttribute('y1', yOld + 2);
        arrowPolicy.setAttribute('x2', qShiftX);
        arrowPolicy.setAttribute('y2', yNew - 2);
        arrowPolicy.style.display = 'block';

        labelPolicyArrow.setAttribute('x', qShiftX + 8);
        labelPolicyArrow.setAttribute('y', (yOld + yNew) / 2);
        labelPolicyArrow.setAttribute('dominant-baseline', 'central');
        labelPolicyArrow.setAttribute('text-anchor', 'start');
        labelPolicyArrow.textContent = "Subsidy";
        labelPolicyArrow.style.display = 'inline';
      }

      if (s > 0) {
        dotPol.setAttribute('cx', qsubX);
        dotPol.setAttribute('cy', psubY);
        dotPol.style.display = 'block';

        lineQpol.setAttribute('x1', qsubX);
        lineQpol.setAttribute('y1', psubY);
        lineQpol.setAttribute('x2', qsubX);
        lineQpol.setAttribute('y2', 380);
        lineQpol.style.display = 'inline';
      }

      if (Math.abs(currentQ - qs) < 0.1 && s > 0) {
        labelQs.textContent = "Qs = Qsub";
      } else if (s > 0) {
        labelQpol.textContent = "Qsub";
        labelQpol.setAttribute('x', qsubX);
        labelQpol.setAttribute('y', 415);
        labelQpol.style.display = 'inline';
      }
    } 
    else if (policy === 'joint_provision') {
      sliderContainer.style.display='flex';sliderLabel.innerHTML='<strong>Government Output (Qg):</strong>';
      const qg=sliderVal;currentQ=50+qg/2;const qp=currentQ-qg,price=100-currentQ,qx=toSvgX(currentQ),px=toSvgX(qp),py=toSvgY(price);
      const el=(tag,attrs,text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));e.classList.add('joint-only');if(text!==undefined)e.textContent=text;document.getElementById('diagram-plot').append(e);return e;};
      document.getElementById('label-mpc').textContent='MPC = MSC';document.getElementById('label-es').textContent='Es';labelQs.textContent='Qs';document.getElementById('dot-a').style.display='none';document.getElementById('label-a').style.display='none';
      linePolicyCurve.setAttribute('x1',toSvgX(Math.max(0,qg)));linePolicyCurve.setAttribute('y1',toSvgY(0));linePolicyCurve.setAttribute('x2',toSvgX(95));linePolicyCurve.setAttribute('y2',toSvgY((95-qg)));linePolicyCurve.style.display=qg>0?'inline':'none';
      
      labelPolicyCurve.textContent='MPC*';labelPolicyCurve.setAttribute('x',toSvgX(95)+6);labelPolicyCurve.setAttribute('y',toSvgY((95-qg))+4);labelPolicyCurve.style.display=qg>0?'inline':'none';
      if(qg>0){dotPol.setAttribute('cx',qx);dotPol.setAttribute('cy',py);dotPol.style.display='block';lineQpol.setAttribute('x1',qx);lineQpol.setAttribute('x2',qx);lineQpol.setAttribute('y1',py);lineQpol.setAttribute('y2',380);lineQpol.style.display='inline';labelQpol.textContent='Qtotal';labelQpol.setAttribute('x',qx);labelQpol.setAttribute('y',418);labelQpol.style.display='inline';
        el('line',{x1:px,y1:py,x2:px,y2:380,class:'guide-line'});el('circle',{cx:px,cy:py,r:3.5,fill:'#16a34a'});el('text',{id:'joint-private-label',x:px,y:418,'text-anchor':'middle','font-weight':'bold',fill:'#16a34a'},'Qprivate');
        arrowPolicy.setAttribute('x1',px);arrowPolicy.setAttribute('x2',qx);arrowPolicy.setAttribute('y1',335);arrowPolicy.setAttribute('y2',335);arrowPolicy.style.display='block';labelPolicyArrow.setAttribute('x',(px+qx)/2);labelPolicyArrow.setAttribute('y',322);labelPolicyArrow.setAttribute('dominant-baseline','auto');labelPolicyArrow.setAttribute('text-anchor','middle');labelPolicyArrow.textContent='Government output (Qg)';labelPolicyArrow.style.display='inline';
        el('line',{x1:70,y1:py,x2:qx,y2:py,class:'guide-line'});el('text',{id:'joint-price-label','data-axis-kind':'p','data-axis-x':70,'data-axis-y':py,'data-model-anchor':'true',x:60,y:py-4,'text-anchor':'end','font-weight':'bold',fill:'#4169e1'},'Pjoint');}
      document.getElementById('joint-results').innerHTML=`<h2>Public output and the change in market output are different.</h2><p>${qg>0?'Government provision <strong>increases total supply</strong>. Private output <strong>falls</strong>, while total output <strong>rises</strong>. Some government output replaces private output, so the increase in total output is smaller than government output.':'With <strong>no government provision</strong>, private output and total output remain at the original market outcome.'}</p><p><strong>Total output</strong> combines government and private output.</p><p><strong>Scope:</strong> fixed government output, sold at the market price, is added horizontally to private supply. Qs marks the <em>original</em> social optimum. Government production costs are unspecified, so this branch does not determine a new social optimum or DWL.</p>`;
    }
    else if (policy === 'education') {
      sliderContainer.style.display = 'flex';
      sliderLabel.innerHTML = '<strong>Campaign Effectiveness:</strong>';
      sliderContainer.querySelector('.scale-label').textContent='Zero';
      document.getElementById('slider-max-label').textContent='Highly Effective';

      const c = sliderVal;
      currentQ = 50 + c / 2;
      const pedu = 100 + c - 1 * currentQ;
      const qeduX = toSvgX(currentQ), peduY = toSvgY(pedu);

      const eduX1 = toSvgX(0), eduY1 = toSvgY(100 + c);
      const eduX2 = toSvgX(95), eduY2 = toSvgY(100 + c - 1 * 95);
      linePolicyCurve.setAttribute('x1', eduX1);
      linePolicyCurve.setAttribute('y1', eduY1);
      linePolicyCurve.setAttribute('x2', eduX2);
      linePolicyCurve.setAttribute('y2', eduY2);

      if (c === 0) {
        linePolicyCurve.style.display = 'none';
        labelPolicyCurve.style.display = 'none';
      } else if (Math.abs(c - meb) < 0.1) {
        labelMsb.textContent = "MSB = MPB*";
        linePolicyCurve.style.display = 'none';
        labelPolicyCurve.style.display = 'none';
      } else {
        linePolicyCurve.style.display = 'inline';
        labelPolicyCurve.textContent = "MPB* (Education)";
        labelPolicyCurve.setAttribute('x', eduX2 + 6);
        labelPolicyCurve.setAttribute('y', eduY2 + 4);
        labelPolicyCurve.removeAttribute('text-anchor');
        labelPolicyCurve.style.display = 'inline';
      }

      arrowPolicy.style.display = 'none';
      labelPolicyArrow.style.display = 'none';

      if (c > 0) {
        dotPol.setAttribute('cx', qeduX);
        dotPol.setAttribute('cy', peduY);
        dotPol.style.display = 'block';

        lineQpol.setAttribute('x1', qeduX);
        lineQpol.setAttribute('y1', peduY);
        lineQpol.setAttribute('x2', qeduX);
        lineQpol.setAttribute('y2', 380);
        lineQpol.style.display = 'inline';
      }

      if (Math.abs(currentQ - qs) < 0.1 && c > 0) {
        labelQs.textContent = "Qs = Qedu";
      } else if (c > 0) {
        labelQpol.textContent = "Qedu";
        labelQpol.setAttribute('x', qeduX);
        labelQpol.setAttribute('y', 415);
        labelQpol.style.display = 'inline';
      }
    }

    if ((policy === 'indirect_subsidy' || policy === 'direct_subsidy') && toggleSubsidyCost.checked && sliderVal > 0) {
      const pProd = currentQ;
      const pCons = 100 -  currentQ;
      const yProd = toSvgY(pProd);
      const yCons = toSvgY(pCons);
      const x0 = 70;
      const xQ = toSvgX(currentQ);

      subsidyCostRect.setAttribute('x', x0);
      subsidyCostRect.setAttribute('y', yProd);
      subsidyCostRect.setAttribute('width', xQ - x0);
      subsidyCostRect.setAttribute('height', yCons - yProd);
      subsidyCostRect.style.display = 'block';

      labelSubsidyCostText.setAttribute('x', (x0 + xQ) / 2);
      labelSubsidyCostText.setAttribute('y', (yProd + yCons) / 2);
      labelSubsidyCostText.style.display = 'block';
    }

    globalCurrentQ = currentQ;

    if (policy !== 'joint_provision' && toggleDwl.checked && Math.abs(currentQ - qs) > 0.1) {
      dwl.style.display = 'block';
      labelDwlText.style.display = 'block';

      const curX = toSvgX(currentQ);
      const pMsc = currentQ;
      const pMsb = 100 + meb - currentQ;
      const yMsc = toSvgY(pMsc);
      const yMsb = toSvgY(pMsb);

      dwl.setAttribute('points', `${qsX},${psY} ${curX},${yMsc} ${curX},${yMsb}`);

      const dwlCenterX = (2 * curX + qsX) / 3;
      const dwlCenterY = (yMsc + yMsb + psY) / 3;
      labelDwlText.setAttribute('x', dwlCenterX);
      labelDwlText.setAttribute('y', dwlCenterY);
      labelDwlText.textContent = "DWL";

      if (currentQ > qs) {
        dwl.setAttribute('fill', 'rgba(220, 38, 38, 0.35)');
      } else {
        dwl.setAttribute('fill', 'rgba(220, 38, 38, 0.25)');
      }
    } else {
      dwl.style.display = 'none';
      labelDwlText.style.display = 'none';
      diagramTooltip.style.display = 'none';
    }

    if (toggleMeb.checked) {
      const mebArrowX = qeX - 12;
      arrowMeb.setAttribute('x1', mebArrowX);
      arrowMeb.setAttribute('y1', peY - 2);
      arrowMeb.setAttribute('x2', mebArrowX);
      arrowMeb.setAttribute('y2', aY + 2);
      arrowMeb.style.display = 'block';

      labelMeb.setAttribute('x', mebArrowX - 6);
      labelMeb.setAttribute('y', (peY + aY) / 2);
      labelMeb.style.display = 'block';
    } else {
      arrowMeb.style.display = 'none';
      labelMeb.style.display = 'none';
    }

    if (policy !== 'joint_provision' && toggleGap.checked && Math.abs(currentQ - qs) > 0.1) {
      const yGap = 345;
      const xStart = toSvgX(Math.min(currentQ, qs));
      const xEnd = toSvgX(Math.max(currentQ, qs));

      arrowGap.setAttribute('x1', xStart + 4);
      arrowGap.setAttribute('y1', yGap);
      arrowGap.setAttribute('x2', xEnd - 4);
      arrowGap.setAttribute('y2', yGap);
      arrowGap.style.display = 'block';

      labelGap.setAttribute('x', (xStart + xEnd) / 2);
      labelGap.setAttribute('y', yGap - 10);
      
      if (currentQ < qs) {
        labelGap.textContent = "Under-consumption";
        labelGap.setAttribute('fill', '#dc2626');
      } else {
        labelGap.textContent = "Over-consumption";
        labelGap.setAttribute('fill', '#991b1b');
      }
      labelGap.style.display = 'block';
    } else {
      arrowGap.style.display = 'none';
      labelGap.style.display = 'none';
    }

    if(policy==='joint_provision'&&toggleGap.checked&&Math.abs(currentQ-qs)>1e-9){
      const left=toSvgX(Math.min(currentQ,qs)),right=toSvgX(Math.max(currentQ,qs));
      arrowGap.setAttribute('x1',left+4);arrowGap.setAttribute('x2',right-4);arrowGap.setAttribute('y1',345);arrowGap.setAttribute('y2',345);arrowGap.style.display='block';
      labelGap.setAttribute('x',(left+right)/2);labelGap.setAttribute('y',332);labelGap.textContent=currentQ<qs?'Under-consumption / Under-production':'Over-consumption / Over-production';labelGap.style.display='block';
    }
    if (!toggleTooltips.checked) {
      diagramTooltip.style.display = 'none';
    }
  }

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

  const dwlContent = () => globalCurrentQ < globalQs ? `
    <strong>Why is this DWL?</strong><br>
    • <strong>Horizontally:</strong> Output is not at Q<sub>s</sub> (under-consumption).<br>
    • <strong>Vertically:</strong> MSB is not equal to MSC (MSB &gt; MSC for these units), representing forgone net benefit to society.
  ` : `
    <strong>Why is this DWL?</strong><br>
    • <strong>Horizontally:</strong> Output is not at Q<sub>s</sub> (over-consumption).<br>
    • <strong>Vertically:</strong> MSB is not equal to MSC (MSC &gt; MSB for these units), representing net welfare loss from over-production.
  `;

  const qeContent = `
    <strong>Free Market Output (Q<sub>e</sub>)</strong><br>
    This is the output determined by <strong>MPB = MPC</strong>. It reflects the outcome produced by private market forces without government intervention.
  `;

  const qsContent = `
    <strong>Socially Optimal Output (Q<sub>s</sub>)</strong><br>
    This is the output level that maximizes total social welfare where <strong>MSB = MSC</strong>. At this point, allocative efficiency is achieved.
  `;

  const subsidyCostContent = `
    <strong>Total Cost of Subsidy</strong><br>
    This area represents the total cost of subsidy because it is the subsidy amount multiplied by the units of output.
  `;

  dwl.addEventListener('mousemove', (e) => toggleDwl.checked && Math.abs(globalCurrentQ - globalQs) > 0.1 && showTooltip(dwlContent(), e));
  dwl.addEventListener('click', (e) => toggleDwl.checked && Math.abs(globalCurrentQ - globalQs) > 0.1 && showTooltip(dwlContent(), e));
  dwl.addEventListener('mouseleave', hideTooltip);

  subsidyCostRect.addEventListener('mousemove', (e) => toggleSubsidyCost.checked && showTooltip(subsidyCostContent, e));
  subsidyCostRect.addEventListener('click', (e) => toggleSubsidyCost.checked && showTooltip(subsidyCostContent, e));
  subsidyCostRect.addEventListener('mouseleave', hideTooltip);

  [labelQe, dotEe, touchTargetEe, touchTargetQe].forEach(el => {
    el.addEventListener('mousemove', (e) => showTooltip(qeContent, e));
    el.addEventListener('click', (e) => showTooltip(qeContent, e));
    el.addEventListener('mouseleave', hideTooltip);
  });

  [labelQs, dotEs, touchTargetEs, touchTargetQs].forEach(el => {
    el.addEventListener('mousemove', (e) => showTooltip(policySelect.value==='joint_provision'?'<strong>Original social optimum (Qs)</strong><br>This is the benchmark before public provision. A new optimum requires public production-cost assumptions.':qsContent, e));
    el.addEventListener('click', (e) => showTooltip(policySelect.value==='joint_provision'?'<strong>Original social optimum (Qs)</strong><br>This is the benchmark before public provision. A new optimum requires public production-cost assumptions.':qsContent, e));
    el.addEventListener('mouseleave', hideTooltip);
  });

  policySelect.addEventListener('change', () => {
    policySlider.value = 0;
    if(policySelect.value==='free_provision')toggleSubsidyCost.checked=false;
    updateDiagram();
  });
  policySlider.addEventListener('input', updateDiagram);
  toggleTooltips.addEventListener('change', updateDiagram);
  toggleDwl.addEventListener('change', updateDiagram);
  toggleGap.addEventListener('change', updateDiagram);
  toggleMeb.addEventListener('change', updateDiagram);
  toggleSubsidyCost.addEventListener('change', updateDiagram);


  // Free provision: a full producer subsidy fixes consumer price at zero.
  const freeControls=document.createElement('div');freeControls.id='free-controls';freeControls.className='control-row';freeControls.style.display='none';
  freeControls.innerHTML='<div class="control-group"><label for="free-meb-slider"><strong>MEB:</strong></label><span class="scale-label">None</span><input id="free-meb-slider" type="range" min="0" max="120" value="60" step="1"><span class="scale-label">High</span></div><label class="toggle-label"><input type="checkbox" id="free-compare" checked> Compare free-market DWL</label>';
  document.querySelector('.controls').append(freeControls);
  const freeResults=document.createElement('section');freeResults.id='free-results';freeResults.className='policy-note';freeResults.setAttribute('aria-live','polite');freeResults.style.display='none';document.getElementById('joint-results').after(freeResults);
  const freeSlider=document.getElementById('free-meb-slider'),freeCompare=document.getElementById('free-compare');
  freeSlider.addEventListener('input',updateDiagram);freeCompare.addEventListener('change',updateDiagram);
  const baseRenderDiagram=renderDiagram;let freeHidden=[];
  renderDiagram=function(){
    freeHidden.forEach(([el,display])=>el.style.display=display);freeHidden=[];document.getElementById('free-scene')?.remove();
    baseRenderDiagram();const active=policySelect.value==='free_provision';freeControls.style.display=active?'flex':'none';freeResults.style.display=active?'block':'none';
    if(!active)return;
    sliderContainer.style.display='none';toggleSubsidyCostLabel.style.display='flex';toggleDwl.disabled=false;
    const svg=document.getElementById('diagram-plot'),ns='http://www.w3.org/2000/svg';
    [...svg.children].filter(el=>el.tagName!=='defs').forEach(el=>{freeHidden.push([el,el.style.display]);el.style.display='none';});
    const scene=document.createElementNS(ns,'g');scene.id='free-scene';svg.append(scene);
    const add=(tag,attrs={},text)=>{const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(text!==undefined)el.textContent=text;scene.append(el);return el;};
    const txt=(x,y,t,attrs={})=>add('text',{x,y,'font-weight':'bold',...attrs},t),scale=(355/120),x=q=>70+scale*q,y=p=>380-scale*p;
    const demand=q=>100-q,cost=q=>q,qf=100,qe=50,meb=Number(freeSlider.value),qs=(100+meb)/2,pp=cost(qf),social=q=>demand(q)+meb;
    const freeLoss=(qf-qs)**2,marketLoss=(qe-qs)**2,epsilon=1e-7;
    window.currentFreeModel={qf,qe,qs,meb,pp,pc:0,subsidy:pp,freeLoss,marketLoss};
    const tooltip=(el,html,label)=>{el.classList.add('has-tooltip');el.setAttribute('aria-label',label);el.onmousemove=e=>showTooltip(html,e);el.onmouseleave=hideTooltip;el.onclick=e=>showTooltip(html,e);};
    const line=(a,b,c,d,attrs={})=>add('line',{x1:x(a),y1:y(b),x2:x(c),y2:y(d),...attrs});
    const area=(id,q,className,html)=>{const el=add('polygon',{id,class:className,points:`${x(qs)},${y(cost(qs))} ${x(q)},${y(cost(q))} ${x(q)},${y(social(q))}`});tooltip(el,html,'Explain '+id.replaceAll('-',' '));};
    if(freeCompare.checked&&marketLoss>epsilon)area('free-market-loss',qe,'ban-free-area','<strong>Free-market DWL</strong><br>The unregulated market under-consumes because consumers do not take MEB into account. The area measures social benefits forgone between Qe and Qs.');
    if(toggleDwl.checked&&freeLoss>epsilon)area('free-policy-loss',qf,'dwl-poly',qf>qs?'<strong>DWL under free provision</strong><br>Output exceeds Qs. MSC exceeds MSB on the excess units.':'<strong>DWL under free provision</strong><br>Output is below Qs. Further units would create net social benefits, even though their private benefit is negative in this stylised linear model.');
    if(toggleSubsidyCost.checked){const r=add('rect',{x:x(0),y:y(pp),width:x(qf)-x(0),height:y(0)-y(pp),class:'subsidy-rect'});scene.prepend(r);tooltip(r,'<strong>Government subsidy expenditure</strong><br>The subsidy reimburses producers while consumers pay no price. This payment is a transfer; resource costs are represented by MPC = MSC. Fiscal distortion and administration costs are excluded.','Explain subsidy expenditure');}
    line(0,0,120,0,{class:'axis','marker-end':'url(#arrow)'});add('line',{x1:70,y1:380,x2:70,y2:25,class:'axis','marker-end':'url(#arrow)'});
    const heading=txt(64,19,'',{'text-anchor':'end',class:'axis-title',style:''});['Price /','Costs /','Benefits'].forEach((word,i)=>{const span=document.createElementNS(ns,'tspan');span.setAttribute('x',64);if(i)span.setAttribute('dy',14);span.textContent=word;heading.append(span);});txt(435,385,'Quantity',{class:'axis-title'});
    line(0,demand(0),qf,0,{class:'line-mpb'});txt(x(qf)-8,y(0)-17,'MPB',{fill:'#2563eb','text-anchor':'end'});
    line(0,cost(0),190,cost(190),{class:'line-mpc'});txt(x(190)+6,y(cost(190))+4,'MPC = MSC',{fill:'#16a34a'});
    const socialEnd=Math.min(190,100+meb);line(0,social(0),socialEnd,social(socialEnd),{class:'line-msb'});txt(x(socialEnd)+6,y(social(socialEnd))+4,meb>epsilon?'MSB':'MPB = MSB',{fill:'#dc2626'});
    line(qf,0,190,cost(190)-pp,{class:'line-policy',style:'stroke-dasharray:none'});txt(x(190)+6,y(cost(190)-pp)+4,'MPC*',{fill:'#4169e1'});
    line(qf,0,qf,pp,{class:'guide-line'});
    const point=(q,p,t,color,label)=>{const e=add('circle',{cx:x(q),cy:y(p),r:4.5,fill:color});txt(x(q)+8,y(p)-9,t,{fill:color,'data-point-x':x(q),'data-point-y':y(p)});tooltip(e,label,'Explain '+t);};
    line(qe,0,qe,cost(qe),{class:'guide-line'});line(0,cost(qe),qe,cost(qe),{class:'guide-line'});txt(60,y(cost(qe))+4,'Pe',{'text-anchor':'end'});txt(x(qe),402,meb<epsilon?'Qe = Qs':'Qe',{'text-anchor':'middle'});point(qe,cost(qe),meb<epsilon?'Ee = Es':'Ee','#1f2937','<strong>Free-market equilibrium</strong><br>MPB = MPC. Private curves and this output remain fixed as MEB changes.');
    line(qs,0,qs,cost(qs),{class:'guide-line'});if(meb>epsilon)txt(x(qs),402,Math.abs(qs-qf)<epsilon?'Qs = Qf':'Qs',{'text-anchor':'middle',fill:'#dc2626'});if(meb>epsilon)point(qs,cost(qs),'Es','#dc2626','<strong>Social optimum</strong><br>MSB = MSC. The socially optimal output rises as MEB increases.');
    if(Math.abs(qs-qf)>epsilon)txt(x(qf),402,'Qf',{'text-anchor':'middle',fill:'#4169e1'});point(qf,0,'Ef','#4169e1','<strong>Free provision</strong><br>Consumers pay no price. Producers receive Pp, funded by the government. Output stays fixed at Qf while MEB varies.');
    if(toggleMeb.checked&&meb>epsilon){const arrowQ=Math.max(20,meb-20);line(arrowQ,demand(arrowQ),arrowQ,social(arrowQ),{class:'free-externality',stroke:'#2563eb','stroke-width':2});txt(x(arrowQ)+10,(y(demand(arrowQ))+y(social(arrowQ)))/2+4,'MEB',{fill:'#2563eb'});}
    if(toggleGap.checked&&Math.abs(qf-qs)>epsilon){line(Math.min(qf,qs),-27,Math.max(qf,qs),-27,{class:'free-gap-arrow',stroke:'#dc2626','stroke-width':2,'marker-start':'url(#arrow-start-red)','marker-end':'url(#arrow-end-red)'});txt((x(qf)+x(qs))/2,447,qf>qs?'Over-consumption / Over-production':'Under-consumption / Under-production',{class:'free-gap-label','text-anchor':'middle',fill:'#dc2626',style:'font-size:11px'});}
    const state=Math.abs(qf-qs)<epsilon?'Socially optimal provision':qf>qs?'Excessive provision':'Insufficient provision';
    const comparison=freeLoss<epsilon?'Free provision <strong>eliminates DWL</strong>.':Math.abs(freeLoss-marketLoss)<epsilon?'Free provision and the free market have <strong>the same DWL</strong>.':freeLoss<marketLoss?'Free provision <strong>reduces DWL</strong>, but some loss remains.':'Free provision <strong>increases DWL</strong> relative to the free market.';
    freeResults.innerHTML=`<h2>${state}</h2><p>${qf>qs+epsilon?'MEB is too low to justify all the units consumed for free.':qs>qf+epsilon?'MEB is high enough that some socially beneficial units remain unprovided.':'MEB exactly offsets the gap between social cost and private benefit at the free-provision output.'}</p><p>${comparison}</p><p><strong>Mechanism:</strong> the government reimburses producers through a full subsidy. MPC* is MPC less the subsidy; the consumer price is zero. Producers receive Pp. The subsidy is fixed as MEB changes.</p><p><strong>Assumptions:</strong> linear private curves, constant MEB, no rationing, and no administration or tax-financing distortion costs. Negative private benefits beyond the demand intercept represent unwillingness to consume additional units without compensation. The full-subsidy outcome is socially optimal only at the matching MEB level.</p>`;
  };

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
    widgetSvg.querySelectorAll('#label-qe,#label-qs,#label-qpol,#label-pe,#label-ps,#label-ppol,#label-ee,#label-es,#group-dynamic-axis-labels text,#group-dynamic-nodes text,#ban-scene text,#free-scene text,.joint-only text,#label-mpc,#label-policy-curve').forEach(el=>{
      const text=el.textContent;const pattern=/\b([QPES])(?:_)?(private|total|joint|quota|sub|edu|gov|s0|g|b|e|s|c|p|t|f)\b/g;
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
  const exportStatus=document.createElement('p');exportStatus.className='diagram-help';exportStatus.setAttribute('role','status');toolbar.after(exportStatus);
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
  function updateDiagram(){EconDiagramPresentation.resetPresentation(widgetSvg);restoreLabelPresentation();renderDiagram();qualitativeControls();mergeExactLabels();labelLayout();compactAnnotations();registerTargets();approvedUX();EconPilot.schedule();}
  updateDiagram();

