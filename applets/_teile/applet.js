// Gemeinsame Bausteine der eigenen Applets von MA01.07.
// Keine fremden Bibliotheken: Die Seiten sollen auch dann laufen, wenn
// GeoGebra oder ein CDN ausfaellt (vgl. ENTSCHEIDUNGEN, Vorbehalt beim
// eingebetteten Applet).

// Zahl mit Komma, feste Nachkommastellen, echtes Minuszeichen.
function zahl(x, stellen) {
  const s = Math.abs(x).toFixed(stellen).replace('.', ',');
  const null_ = Number(Math.abs(x).toFixed(stellen)) === 0;
  return (x < 0 && !null_ ? '−' : '') + s;
}

// Fehlerfunktion, Abramowitz/Stegun 7.1.26 reicht nicht fuer zwei
// Nachkommastellen in Prozent an allen Stellen; darum die Reihe bzw.
// der Kettenbruch (Genauigkeit besser als 1e-12).
function erf(x) {
  const t = Math.abs(x);
  let r;
  if (t < 3) {
    // Taylorreihe
    let summe = t, term = t, n = 0;
    while (Math.abs(term) > 1e-16 * Math.abs(summe)) {
      n++;
      term *= -t * t / n;
      summe += term / (2 * n + 1);
      if (n > 200) break;
    }
    r = 2 / Math.sqrt(Math.PI) * summe;
  } else {
    // Kettenbruch fuer erfc
    let f = 0;
    for (let k = 60; k >= 1; k--) f = (k / 2) / (t + f);
    r = 1 - Math.exp(-t * t) / Math.sqrt(Math.PI) / (t + f);
  }
  return x < 0 ? -r : r;
}
function Phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
function phi(x, mu, sigma) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

// Ein Schieber mit Knoepfen fuer den kleinsten Schritt.
// opt: {name, label, min, max, schritt, wert, stellen, bei}
function schieber(ort, opt) {
  const id = 'r-' + opt.name;
  const lab = document.createElement('label');
  lab.htmlFor = id; lab.textContent = opt.label;
  const zeile = document.createElement('div'); zeile.className = 'zeile';
  const minus = document.createElement('button');
  minus.type = 'button'; minus.textContent = '−';
  minus.setAttribute('aria-label', opt.label + ' kleiner');
  const plus = document.createElement('button');
  plus.type = 'button'; plus.textContent = '+';
  plus.setAttribute('aria-label', opt.label + ' groesser');
  const r = document.createElement('input');
  r.type = 'range'; r.id = id; r.min = opt.min; r.max = opt.max;
  r.step = opt.schritt; r.value = opt.wert;
  zeile.append(minus, r, plus);
  const aus = document.createElement('output'); aus.htmlFor = id;
  ort.append(lab, zeile, aus);

  const lesen = () => Number(Number(r.value).toFixed(opt.stellen));
  const zeigen = () => { aus.textContent = zahl(lesen(), opt.stellen); };
  const setzen = (w) => {
    w = Math.min(opt.max, Math.max(opt.min, w));
    r.value = w.toFixed(opt.stellen); zeigen(); opt.bei();
  };
  r.addEventListener('input', () => { zeigen(); opt.bei(); });
  // Gedrueckt halten wiederholt den Schritt.
  for (const [k, d] of [[minus, -1], [plus, 1]]) {
    let zeit = null;
    const halt = () => { clearTimeout(zeit); clearInterval(zeit); zeit = null; };
    k.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      setzen(lesen() + d * opt.schritt);
      zeit = setTimeout(() => { zeit = setInterval(() => setzen(lesen() + d * opt.schritt), 60); }, 400);
    });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) k.addEventListener(ev, halt);
    k.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setzen(lesen() + d * opt.schritt); }
    });
  }
  zeigen();
  return { get wert() { return lesen(); }, setzen };
}

// Koordinatensystem im SVG. b,h: Bildgroesse; rand: {l,r,o,u}
function achsen(svg, opt) {
  const { b, h, rand, x0, x1, y0, y1 } = opt;
  svg.setAttribute('viewBox', `0 0 ${b} ${h}`);
  const X = (x) => rand.l + (x - x0) / (x1 - x0) * (b - rand.l - rand.r);
  const Y = (y) => h - rand.u - (y - y0) / (y1 - y0) * (h - rand.o - rand.u);
  const ns = 'http://www.w3.org/2000/svg';
  const el = (name, attr, eltern) => {
    const e = document.createElementNS(ns, name);
    for (const k in attr) e.setAttribute(k, attr[k]);
    (eltern || svg).appendChild(e); return e;
  };
  const gitter = el('g', {});
  for (const x of opt.xMarken || []) {
    el('line', { x1: X(x), x2: X(x), y1: Y(y0), y2: Y(y1), class: 'gitter' }, gitter);
    el('text', { x: X(x), y: h - rand.u + 18, 'text-anchor': 'middle' }, gitter).textContent = zahl(x, opt.xStellen || 0);
  }
  for (const y of opt.yMarken || []) {
    el('line', { x1: X(x0), x2: X(x1), y1: Y(y), y2: Y(y), class: 'gitter' }, gitter);
    el('text', { x: rand.l - 6, y: Y(y) + 4, 'text-anchor': 'end' }, gitter).textContent = zahl(y, opt.yStellen || 0);
  }
  const yAchse = opt.yAchseBei !== undefined ? opt.yAchseBei : x0;
  const xAchse = opt.xAchseBei !== undefined ? opt.xAchseBei : y0;
  el('line', { x1: X(x0), x2: X(x1), y1: Y(xAchse), y2: Y(xAchse), class: 'achse' });
  el('line', { x1: X(yAchse), x2: X(yAchse), y1: Y(y0), y2: Y(y1), class: 'achse' });
  if (opt.xName) el('text', { x: X(x1), y: Y(xAchse) - 6, 'text-anchor': 'end' }).textContent = opt.xName;
  if (opt.yName) el('text', { x: X(yAchse) + 6, y: Y(y1) + 12 }).textContent = opt.yName;
  return { X, Y, el };
}

// Kurve als Pfad; f liefert y zu x.
function pfad(f, X, Y, x0, x1, n) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n;
    d += (i ? 'L' : 'M') + X(x).toFixed(2) + ' ' + Y(f(x)).toFixed(2);
  }
  return d;
}
