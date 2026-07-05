// ============================================================
// xdG:Lab — identidade v6 (biotech · rede)
// 1) Marca: colore o ":" do navbar e insere a onda de sinal.
// 2) Rede circuito × rede neural nos <svg class="flownet">:
//    data-animate="pulses" -> animada (home): pulsos roteiam
//    de nó em nó, núcleos acendem, hover dos botões controla
//    direção/velocidade + telemetria.
//    data-animate="none"   -> estática (bands internas).
// ============================================================

// ---------- marca no navbar ----------
(function () {
  const WAVE =
    '<svg class="brand-wave" width="26" height="16" viewBox="0 0 26 16" fill="none" aria-hidden="true">' +
    '<path d="M1 12 C6 12 7 4 12 4 C17 4 17 12 22 12" stroke="url(#gbrand)" stroke-width="2.2" stroke-linecap="round"/>' +
    '<circle cx="1" cy="12" r="2" fill="#6B7280"/><circle cx="24" cy="12" r="2.3" fill="#3ECFB2"/>' +
    '<defs><linearGradient id="gbrand" x1="0" y1="0" x2="26" y2="0" gradientUnits="userSpaceOnUse">' +
    '<stop stop-color="#8E959E"/><stop offset="1" stop-color="#3ECFB2"/>' +
    '</linearGradient></defs></svg>';
  document.querySelectorAll('.navbar-brand .navbar-title').forEach(function (el) {
    const t = el.textContent.trim();
    if (t.indexOf(':') !== -1) {
      el.innerHTML = t.replace(':', '<span class="colon">:</span>');
    }
    el.insertAdjacentHTML('afterbegin', WAVE + ' ');
  });
})();

// ---------- rede ----------
(function () {
  const svgs = document.querySelectorAll('svg.flownet');
  if (!svgs.length) return;

  const NS = 'http://www.w3.org/2000/svg';
  const VITAL = '#3ECFB2', STEEL = '#6B7280';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  let uid = 0;

  // type: 'src' (fonte de aço) · 'hub' (núcleo de encontro) · 'out' (terminal de sinal)
  const NODES = {
    s1:{x:  92, y:118, type:'src'},  s2:{x: 138, y:302, type:'src'},
    s3:{x: 112, y:520, type:'src'},  s4:{x: 182, y:668, type:'src'},

    h1:{x: 402, y:176, type:'hub'},  h2:{x: 562, y:388, type:'hub'},
    h3:{x: 468, y:596, type:'hub'},  h4:{x: 828, y:118, type:'hub'},
    h5:{x: 906, y:466, type:'hub'},  h6:{x:1064, y:296, type:'hub'},
    h7:{x: 768, y:660, type:'hub'},

    t1:{x:1330, y:110, type:'out'},  t2:{x:1352, y:262, type:'out'},
    t3:{x:1318, y:508, type:'out'},  t4:{x:1360, y:648, type:'out'}
  };

  // [a, b, bow, largura, opacidade] — bow = curvatura perpendicular (px)
  const EDGES = [
    ['s1','h1', -34, 1.8, .50], ['s2','h1',  30, 1.6, .45],
    ['s2','h2', -26, 2.0, .55], ['s3','h2',  38, 1.8, .50],
    ['s3','h3', -24, 1.6, .42], ['s4','h3',  26, 1.8, .48],
    ['s4','h7',  46, 1.4, .34],

    ['h1','h2', -40, 1.6, .45], ['h2','h3',  34, 1.5, .40],
    ['h1','h4', -46, 2.0, .55], ['h2','h5', -30, 2.2, .62],
    ['h2','h6',  52, 1.4, .34], ['h3','h5',  44, 1.8, .48],
    ['h3','h7',  22, 1.5, .40], ['h7','h5', -30, 1.6, .44],
    ['h5','h6', -34, 2.0, .55], ['h4','h6',  36, 1.8, .50],
    ['h4','h5',  56, 1.3, .30],

    ['h4','t1', -22, 2.0, .58], ['h4','t2',  30, 1.5, .40],
    ['h6','t2', -20, 2.2, .62], ['h6','t3',  30, 1.8, .50],
    ['h5','t3',  40, 1.5, .40], ['h7','t4', -26, 1.8, .50]
  ];

  function edgePath(a, b, bow) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    const k = bow * Math.min(1, L / 260);
    const c1x = a.x + dx * .33 + nx * k, c1y = a.y + dy * .33 + ny * k;
    const c2x = a.x + dx * .67 + nx * k, c2y = a.y + dy * .67 + ny * k;
    return `M${a.x} ${a.y} C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${b.x} ${b.y}`;
  }

  function build(svg, animate) {
    uid += 1;
    const gid = 'gflow' + uid;

    const defs = document.createElementNS(NS, 'defs');
    defs.innerHTML =
      `<linearGradient id="${gid}" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">` +
      '<stop stop-color="#4A5560"/><stop offset=".55" stop-color="#7C8894"/><stop offset="1" stop-color="#3ECFB2"/>' +
      '</linearGradient>';
    svg.appendChild(defs);
    const edgesG = document.createElementNS(NS, 'g');
    const nodesG = document.createElementNS(NS, 'g');
    const pulsesG = document.createElementNS(NS, 'g');
    svg.appendChild(edgesG); svg.appendChild(nodesG); svg.appendChild(pulsesG);

    const edges = EDGES.map(([ka, kb, bow, w, op]) => {
      const a = NODES[ka], b = NODES[kb];
      const el = document.createElementNS(NS, 'path');
      el.setAttribute('d', edgePath(a, b, bow));
      el.setAttribute('stroke', `url(#${gid})`);
      el.setAttribute('stroke-width', w);
      el.setAttribute('opacity', op);
      el.setAttribute('stroke-linecap', 'round');
      edgesG.appendChild(el);
      return { a: ka, b: kb, el, len: 0 };
    });
    // getTotalLength só depois de anexado ao DOM
    edges.forEach(e => { e.len = e.el.getTotalLength(); });

    const fwd = {}, bwd = {};
    Object.keys(NODES).forEach(k => { fwd[k] = []; bwd[k] = []; });
    edges.forEach(e => { fwd[e.a].push(e); bwd[e.b].push(e); });

    const flashes = {};
    function circle(cx, cy, r, attrs) {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r);
      for (const k in attrs) c.setAttribute(k, attrs[k]);
      nodesG.appendChild(c); return c;
    }
    for (const key in NODES) {
      const n = NODES[key];
      if (n.type === 'src') {
        circle(n.x, n.y, 4.2, { fill: STEEL });
      } else if (n.type === 'hub') {
        circle(n.x, n.y, 9,   { stroke: 'rgba(255,255,255,.16)', fill: 'rgba(10,11,13,.6)' });
        circle(n.x, n.y, 3.2, { fill: '#7C8894' });
        flashes[key] = circle(n.x, n.y, 9, { stroke: VITAL, 'stroke-width': 1.6, opacity: 0 });
      } else {
        circle(n.x, n.y, 4.6, { fill: VITAL });
        flashes[key] = circle(n.x, n.y, 10, { stroke: VITAL, opacity: .35 });
      }
    }

    if (!animate || reduced) return;

    // ---------- pulsos (só na rede animada) ----------
    const teleDir  = document.getElementById('tele-dir');
    const teleSpeed = document.getElementById('tele-speed');
    const flashLevel = {};
    for (const k in flashes) flashLevel[k] = 0;

    const N_PULSES = 8;
    const pulses = [];
    for (let i = 0; i < N_PULSES; i++) {
      const halo = document.createElementNS(NS, 'circle');
      halo.setAttribute('r', 10); halo.setAttribute('fill', VITAL); halo.setAttribute('opacity', '.16');
      const core = document.createElementNS(NS, 'circle');
      core.setAttribute('r', 4); core.setAttribute('fill', VITAL);
      pulsesG.appendChild(halo); pulsesG.appendChild(core);
      pulses.push({ edge: rnd(edges), t: Math.random(), speed: 78 + Math.random() * 46, core, halo });
    }

    function place(pu) {
      const t = Math.max(0, Math.min(1, pu.t));
      const pt = pu.edge.el.getPointAtLength(t * pu.edge.len);
      pu.core.setAttribute('cx', pt.x); pu.core.setAttribute('cy', pt.y);
      pu.halo.setAttribute('cx', pt.x); pu.halo.setAttribute('cy', pt.y);
    }
    function flash(key) { if (key in flashLevel) flashLevel[key] = 1; }
    function hop(pu, dir) {
      if (dir > 0) {
        const node = pu.edge.b; flash(node);
        const next = fwd[node];
        if (next.length) { pu.edge = rnd(next); pu.t = 0; }
        else { const src = rnd(['s1','s2','s3','s4']); pu.edge = rnd(fwd[src]); pu.t = 0; }
      } else {
        const node = pu.edge.a; flash(node);
        const prev = bwd[node];
        if (prev.length) { pu.edge = rnd(prev); pu.t = 1; }
        else { const out = rnd(['t1','t2','t3','t4']); pu.edge = rnd(bwd[out]); pu.t = 1; }
      }
    }

    let dir = 1, targetDir = 1, boost = 1, targetBoost = 1;
    function setTelemetry() {
      if (teleDir)   teleDir.textContent = targetDir > 0 ? 'anterógrado' : 'retrógrado';
      if (teleSpeed) teleSpeed.textContent = targetBoost.toFixed(1) + '×';
    }
    function bindFlow(el, d, b) {
      if (!el) return;
      const on  = () => { targetDir = d; targetBoost = b; setTelemetry(); };
      const off = () => { targetDir = 1; targetBoost = 1; setTelemetry(); };
      el.addEventListener('mouseenter', on); el.addEventListener('mouseleave', off);
      el.addEventListener('focus', on);      el.addEventListener('blur', off);
    }
    bindFlow(document.getElementById('btn-explore'),     1, 2.6);
    bindFlow(document.getElementById('btn-initiative'), -1, 2.0);

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      dir   += (targetDir   - dir)   * Math.min(1, 5 * dt);
      boost += (targetBoost - boost) * Math.min(1, 5 * dt);

      for (const pu of pulses) {
        pu.t += dir * boost * pu.speed * dt / pu.edge.len;
        if (pu.t >= 1)      hop(pu,  1);
        else if (pu.t <= 0) hop(pu, -1);
        place(pu);
      }
      for (const k in flashLevel) {
        if (flashLevel[k] > .01) {
          flashLevel[k] *= Math.exp(-3.2 * dt);
          const n = NODES[k];
          if (n.type === 'hub') {
            flashes[k].setAttribute('opacity', (flashLevel[k] * .9).toFixed(3));
            flashes[k].setAttribute('r', (9 + flashLevel[k] * 4).toFixed(1));
          } else {
            flashes[k].setAttribute('opacity', (.35 + flashLevel[k] * .5).toFixed(3));
          }
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  svgs.forEach(svg => build(svg, svg.dataset.animate === 'pulses'));
})();
