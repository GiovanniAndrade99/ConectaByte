/* ConectaByte · interacoes e animacoes do site
   Arquivo externo (e nao inline) porque a CSP so permite scripts de 'self'. */
(() => {
  'use strict';

  // Número do WhatsApp Business no formato internacional, somente dígitos.
  const WHATSAPP = '5514998709872';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const E = {
    outQuart: p => 1 - Math.pow(1 - p, 4),
    outCubic: p => 1 - Math.pow(1 - p, 3),
    inOutCubic: p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    inOutQuint: p => (p < .5 ? 16 * p ** 5 : 1 - Math.pow(-2 * p + 2, 5) / 2),
    inOutSine: p => -(Math.cos(Math.PI * p) - 1) / 2,
    outBack: p => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
  };
  // Parametros de teste (?introAt=) so valem na maquina de quem desenvolve, nunca no site publicado.
  const isLocal = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const svgNS = 'http://www.w3.org/2000/svg';
  const icon = id => { const s = document.createElementNS(svgNS, 'svg'), u = document.createElementNS(svgNS, 'use'); s.setAttribute('aria-hidden', 'true'); u.setAttribute('href', '#' + id); s.append(u); return s; };

  // Atrasos e alturas vem de data- (a CSP proibe style="..." no HTML)
  $$('[data-d]').forEach(el => el.style.setProperty('--d', el.dataset.d));
  $$('[data-h]').forEach(el => { el.style.height = clamp(+el.dataset.h, 0, 100) + '%'; });

  const waLink = msg => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  const fmt = (v, dec) => v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  /* ---------- Cookies ---------- */
  const cookieBanner = $('#cookieBanner');
  const consentKey = 'conectabyte-cookie-preferences-v1';
  let needsConsent = true;
  try { needsConsent = !localStorage.getItem(consentKey); } catch {}
  // So aparece depois da introducao, para nao cobrir o gancho de abertura
  const showCookies = () => { if (needsConsent) setTimeout(() => { cookieBanner.hidden = false; }, 900); };
  $$('[data-cookie-save]').forEach(b => b.addEventListener('click', () => {
    try { localStorage.setItem(consentKey, JSON.stringify({ necessary: true, analytics: false, advertising: false, savedAt: new Date().toISOString() })); } catch {}
    cookieBanner.hidden = true;
  }));
  $$('[data-cookie-settings]').forEach(b => b.addEventListener('click', () => { cookieBanner.hidden = false; cookieBanner.scrollIntoView({ block: 'end' }); }));

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.querySelector('span').textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ---------- Links de WhatsApp ---------- */
  $$('[data-wa]').forEach(a => { a.href = waLink(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });

  /* ---------- Granulacao de filme (textura gerada uma vez) ---------- */
  (() => {
    const c = document.createElement('canvas'); c.width = c.height = 200;
    const g = c.getContext('2d'); const img = g.createImageData(200, 200);
    let s = 987654321;
    for (let i = 0; i < img.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = s & 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0);
    $('#grain').style.backgroundImage = `url(${c.toDataURL()})`;
  })();

  /* ---------- Botoes: ripple, efeito magnetico, luz que segue o mouse ---------- */
  document.addEventListener('pointerdown', e => {
    const btn = e.target.closest('.btn');
    if (!btn || reduce) return;
    const r = btn.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.2;
    const dot = document.createElement('span');
    dot.className = 'ripple';
    dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    btn.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
  });
  if (finePointer && !reduce) {
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px');
        el.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + 'px');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); });
    });
    $$('.spot').forEach(el => el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--x', e.clientX - r.left + 'px');
      el.style.setProperty('--y', e.clientY - r.top + 'px');
    }));
    // Cartao 3D do suporte inclina com o mouse
    const sCard = $('#sCard'), plane = $('#plane');
    sCard.addEventListener('pointermove', e => {
      const r = sCard.getBoundingClientRect();
      plane.style.setProperty('--tx', (((e.clientX - r.left) / r.width - .5) * 10).toFixed(2) + 'deg');
      plane.style.setProperty('--ty', (((e.clientY - r.top) / r.height - .5) * -8).toFixed(2) + 'deg');
    });
    sCard.addEventListener('pointerleave', () => { plane.style.setProperty('--tx', '0deg'); plane.style.setProperty('--ty', '0deg'); });
  }

  /* ---------- Rolagem suave com inercia (mouse/trackpad no computador) ---------- */
  const header = $('#header'), nav = $('#nav');
  const maxY = () => document.documentElement.scrollHeight - innerHeight;
  const smooth = finePointer && !reduce && !/[?&]smooth=0/.test(location.search);
  let sTarget = scrollY, sCur = scrollY, sRunning = false, sLast = 0;
  function sStep(now) {
    const dt = Math.min(.05, (now - sLast) / 1000); sLast = now;
    sCur += (sTarget - sCur) * (1 - Math.exp(-dt * 7.5));
    if (Math.abs(sTarget - sCur) < .5) { sCur = sTarget; sRunning = false; }
    scrollTo(0, sCur);
    if (sRunning) requestAnimationFrame(sStep);
  }
  function scrollToY(y) {
    y = clamp(y, 0, maxY());
    if (!smooth) { scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); return; }
    if (!sRunning) { sCur = scrollY; sRunning = true; sLast = performance.now(); requestAnimationFrame(sStep); }
    sTarget = y;
  }
  const scrollsInside = (el, dy) => {
    for (; el && el !== document.body; el = el.parentElement) {
      const st = getComputedStyle(el);
      if (/(auto|scroll)/.test(st.overflowY) && el.scrollHeight > el.clientHeight + 1) {
        if ((dy < 0 && el.scrollTop > 0) || (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1)) return true;
      }
    }
    return false;
  };
  if (smooth) {
    html.classList.add('js-smooth');
    addEventListener('wheel', e => {
      if (e.ctrlKey || html.classList.contains('intro') || Math.abs(e.deltaX) > Math.abs(e.deltaY) || scrollsInside(e.target, e.deltaY)) return;
      e.preventDefault();
      const d = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1);
      scrollToY((sRunning ? sTarget : scrollY) + d);
    }, { passive: false });
    addEventListener('keydown', e => {
      const a = document.activeElement;
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || html.classList.contains('intro')) return;
      if (a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|SUMMARY)$/.test(a.tagName))) return;
      const base = sRunning ? sTarget : scrollY;
      const step = { ArrowDown: 120, ArrowUp: -120, PageDown: innerHeight * .85, PageUp: -innerHeight * .85, ' ': (e.shiftKey ? -1 : 1) * innerHeight * .85 }[e.key];
      if (step) { e.preventDefault(); scrollToY(base + step); }
      else if (e.key === 'Home') { e.preventDefault(); scrollToY(0); }
      else if (e.key === 'End') { e.preventDefault(); scrollToY(maxY()); }
    });
    addEventListener('scroll', () => { if (!sRunning) sTarget = sCur = scrollY; }, { passive: true });
  }
  // Links internos (#secao) usam a mesma rolagem suave
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    const y = a.getAttribute('href') === '#inicio' ? 0 : target.getBoundingClientRect().top + scrollY - (header.offsetHeight + 16);
    scrollToY(y);
    history.replaceState(null, '', a.getAttribute('href'));
  });

  /* ---------- Menu: pilula deslizante, secao ativa, menu do celular ---------- */
  const menu = $('#menu'), pill = $('#menuPill'), links = $$('a', menu);
  let activeLink = null;
  function movePill(a) {
    if (!a) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  }
  links.forEach(a => a.addEventListener('mouseenter', () => movePill(a)));
  menu.addEventListener('mouseleave', () => movePill(activeLink));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const link = links.find(a => a.hash === '#' + en.target.id);
      links.forEach(a => a.classList.toggle('active', a === link));
      activeLink = link || null;
      if (!menu.matches(':hover')) movePill(activeLink);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));
  const toggle = $('#menuToggle');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  links.forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Efeitos ligados a rolagem ---------- */
  const progress = $('#progress'), waFloat = $('#waFloat');
  const horizon = $('#horizon'), heroCopy = $('.hero-copy'), dash = $('.dash');
  const stepsEl = $('#steps'), steps = $$('#steps .step');
  const ports = $$('.port').map(p => [p, $('.art', p)]);
  let lastY = scrollY, ticking = false;
  function onScroll() {
    const y = scrollY, max = maxY(), vh = innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle('scrolled', y > 8);
    header.classList.toggle('hide', innerWidth <= 880 && y > lastY && y > 400 && !nav.classList.contains('open'));
    waFloat.classList.toggle('show', y > vh * .6);
    lastY = y;

    if (!reduce && y < vh * 1.6) {
      // Painel comeca levemente inclinado para tras e "assenta" ao rolar
      dash.style.transform = `perspective(1400px) rotateX(${(1 - clamp(y / (vh * .45))) * 7}deg)`;
      if (!html.classList.contains('intro')) {
        // Paralaxe do topo: o arco desce mais devagar e o texto se afasta, como no video
        horizon.style.transform = `translateY(${y * .22}px)`;
        heroCopy.style.transform = `translateY(${y * .12}px)`;
        heroCopy.style.opacity = 1 - clamp(y / (vh * .9)) * .65;
      }
    }
    // Linha do processo se preenche conforme a rolagem
    const r = stepsEl.getBoundingClientRect();
    const p = clamp((vh * .78 - r.top) / (r.height + vh * .25));
    stepsEl.style.setProperty('--fill', p.toFixed(3));
    steps.forEach((s, i) => s.classList.toggle('on', p >= i / (steps.length - 1) - .001 && p > 0));
    // Ilustracoes dos modelos com paralaxe interna
    if (!reduce) for (const [card, art] of ports) {
      const b = card.getBoundingClientRect();
      if (b.bottom < 0 || b.top > vh) continue;
      art.style.transform = `translateY(${(((b.top + b.height / 2) - vh / 2) / vh) * -36}px)`;
    }
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(onScroll));
  addEventListener('pagehide', () => { try { sessionStorage.setItem('cb-scroll', String(Math.round(scrollY))); } catch {} });

  /* ---------- Palavra rotativa no hero ---------- */
  const words = ['lojas', 'padarias', 'clínicas', 'restaurantes', 'indústrias', 'escritórios'];
  const rot = $('#rotator');
  let wi = 0;
  if (!reduce && rot) setInterval(() => {
    // Limpa sobras de ciclos anteriores (ex.: aba ficou em segundo plano e o
    // onfinish não rodou a tempo) para não acumular spans sobrepostos.
    while (rot.children.length > 1) rot.lastElementChild.remove();
    const old = rot.firstElementChild, next = document.createElement('span');
    old.getAnimations().forEach(a => a.cancel());
    next.textContent = words[wi = (wi + 1) % words.length];
    rot.appendChild(next);
    old.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-100%)', opacity: 0 }], { duration: 450, easing: 'cubic-bezier(.7,0,.2,1)' }).onfinish = () => old.remove();
    next.animate([{ transform: 'translateY(100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }, 2200);

  /* ---------- Revelacoes, gatilhos e contadores (comecam depois da introducao) ---------- */
  function startObservers() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -60px 0px' });
    $$('.rv').forEach(el => io.observe(el));

    // .trig recebe .on quando aparece: dispara as sequencias do painel e do bento
    const trig = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('on'); trig.unobserve(en.target); } });
    }, { threshold: .35 });
    $$('.trig').forEach(el => trig.observe(el));

    const countIO = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target, to = +el.dataset.count, dec = +(el.dataset.dec || 0), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
        countIO.unobserve(el);
        if (reduce) { el.textContent = pre + fmt(to, dec) + suf; return; }
        const t0 = performance.now(), dur = el.closest('.plan') ? 900 : 1500;
        const step = t => {
          const p = Math.min((t - t0) / dur, 1), eased = p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
          el.textContent = pre + fmt(to * eased, dec) + suf;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: .6 });
    $$('[data-count]').forEach(el => countIO.observe(el));
  }

  /* ---------- Vantagens: destaque passa de item em item ---------- */
  (() => {
    const items = $$('#fCard .f-item');
    let i = 0, timer = null, paused = false;
    const set = n => items.forEach((it, k) => it.classList.toggle('active', k === n));
    const run = () => { if (!timer && !reduce) timer = setInterval(() => { if (!paused) set(i = (i + 1) % items.length); }, 2800); };
    items.forEach((it, k) => {
      it.addEventListener('mouseenter', () => { paused = true; set(i = k); });
      it.addEventListener('mouseleave', () => { paused = false; });
    });
    new IntersectionObserver(([en]) => { if (en.isIntersecting) run(); else { clearInterval(timer); timer = null; } }, { threshold: .3 }).observe($('#fCard'));
  })();

  /* ---------- Assistente: qual pacote? ---------- */
  const finderOut = $('#finderOut');
  const names = { vitrine: 'Vitrine', presenca: 'Presença', vendas: 'Vendas', sistema: 'Sob medida' };
  $('#finder').addEventListener('change', () => {
    const sel = $$('#finder input:checked').map(i => i.value);
    let rec = null;
    if (sel.includes('sistema')) rec = 'sistema';
    else if (sel.includes('vender')) rec = 'vendas';
    else if (sel.includes('paginas')) rec = 'presenca';
    else if (sel.length) rec = 'vitrine';
    $$('.plan').forEach(p => p.classList.toggle('is-rec', p.dataset.plan === rec));
    // Montado com DOM (sem innerHTML): compativel com Trusted Types
    if (!rec) { finderOut.textContent = 'Marque as opções e indicamos um pacote.'; return; }
    const b = document.createElement('b');
    b.textContent = names[rec];
    const a = document.createElement('a');
    a.className = 'link'; a.href = '#contato'; a.dataset.pick = rec;
    a.append('Pedir este ', icon('i-arrow'));
    finderOut.replaceChildren('Indicamos o ', b, '. ', a);
  });
  finderOut.addEventListener('click', e => {
    const a = e.target.closest('[data-pick]');
    if (!a) return;
    const radio = $(`#interesse input[data-plan="${a.dataset.pick}"]`);
    if (radio) radio.checked = true;
  });

  /* ---------- Regiao: lista e mapa conectados ---------- */
  const mapEls = $$('.map [data-city]');
  const hot = (cities, on) => mapEls.forEach(m => { if (cities.includes(m.dataset.city)) m.classList.toggle('hot', on); });
  $$('.city').forEach(li => {
    const cities = li.dataset.city.split(' ');
    li.addEventListener('mouseenter', () => hot(cities, true));
    li.addEventListener('mouseleave', () => hot(cities, false));
  });
  $$('.map .node').forEach(n => {
    const li = $$('.city').find(c => c.dataset.city.split(' ').includes(n.dataset.city));
    n.addEventListener('mouseenter', () => { li && li.classList.add('hot'); hot([n.dataset.city], true); });
    n.addEventListener('mouseleave', () => { li && li.classList.remove('hot'); hot([n.dataset.city], false); });
  });

  /* ---------- FAQ (uma aberta por vez, com animacao) ---------- */
  const faqs = $$('.faq details');
  function closeFaq(d) {
    const a = $('.faq-a', d);
    if (reduce) { d.open = false; return; }
    a.animate([{ height: a.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 260, easing: 'cubic-bezier(.7,0,.2,1)' }).onfinish = () => (d.open = false);
  }
  function openFaq(d) {
    d.open = true;
    if (reduce) return;
    const a = $('.faq-a', d);
    a.animate([{ height: '0px', opacity: 0 }, { height: a.scrollHeight + 'px', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
  faqs.forEach(d => $('summary', d).addEventListener('click', e => {
    e.preventDefault();
    if (d.open) return closeFaq(d);
    faqs.filter(x => x.open).forEach(closeFaq);
    openFaq(d);
  }));

  /* ---------- Copiar e-mail ---------- */
  $('#copyEmail').addEventListener('click', async e => {
    const email = e.currentTarget.dataset.email;
    try { await navigator.clipboard.writeText(email); toast('E-mail copiado: ' + email); }
    catch { location.href = 'mailto:' + email; }
  });

  /* ---------- Aberto agora? ---------- */
  const now = new Date(), wd = now.getDay(), hr = now.getHours();
  const open = wd >= 1 && wd <= 5 && hr >= 8 && hr < 18;
  const openTag = document.createElement('span');
  openTag.className = open ? 'open-now' : 'closed-now';
  openTag.textContent = open ? 'aberto agora' : 'fechado agora';
  $('#openStatus').replaceChildren('Seg. a sex., 8h às 18h · ', openTag);

  /* ---------- Formulario -> WhatsApp ---------- */
  const form = $('#leadForm'), nome = $('#f-nome'), fNome = $('#fNome'), msg = $('#f-msg'), counter = $('#counter'), sendBtn = $('#sendBtn');
  msg.addEventListener('input', () => (counter.textContent = `${msg.value.length}/500`));
  nome.addEventListener('input', () => fNome.classList.remove('invalid'));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (sendBtn.classList.contains('loading')) return;
    if (!nome.value.trim()) {
      fNome.classList.remove('invalid'); void fNome.offsetWidth; fNome.classList.add('invalid');
      nome.focus();
      return;
    }
    const empresa = $('#f-empresa').value.trim();
    const linhas = [
      `Olá! Sou ${nome.value.trim()}${empresa ? `, da ${empresa}` : ''}.`,
      `Cidade: ${$('#f-cidade').value}`,
      `Interesse: ${form.interesse.value}`,
    ];
    if (msg.value.trim()) linhas.push('', msg.value.trim());
    const url = waLink(linhas.join('\n'));
    const win = window.open('', '_blank');   // abre ja no clique para nao ser bloqueado
    if (win) win.opener = null;
    sendBtn.classList.add('loading');
    setTimeout(() => {
      sendBtn.classList.remove('loading');
      if (win) win.location = url; else location.href = url;
      toast('Abrindo o WhatsApp…');
    }, reduce ? 0 : 700);
  });
  sendBtn.disabled = false;

  $('#ano').textContent = now.getFullYear();

  /* =====================================================================
     INTRODUCAO: a logo se desenha no centro da tela, a camera mergulha nela
     e o arco do "C" vira o horizonte incandescente do topo do site.
     ===================================================================== */
  function runIntro(done) {
    if (!html.classList.contains('intro')) { done(); return; }
    scrollTo(0, 0);

    const arc = $('#heroArc');
    const part = s => $(s, arc);
    const P = {
      white: part('.a-white'), fire: part('.a-fire'), glow: part('.a-glow'), haze: part('.a-haze'),
      rim: part('.a-rim'), halo: part('.n-halo'), tipU: part('.tip-up'), tipD: part('.tip-dn'),
      rl: part('.nr-l'), rt: part('.nr-t'), rb: part('.nr-b'),
    };
    const tint = $('.hero-tint'), beam = $('.hero-beam'), glow = $('.hero-glow'), ambient = $('.ambient');
    const dashWrap = $('.dash-wrap');
    // [elemento, inicio (s), tipo]
    const seq = [
      [header, 1.55, 'down'], [$('.pill-badge'), 1.62, 'up'],
      ...$$('.hero h1 .w').map((w, i) => [w, 1.7 + i * .06, 'blur']),
      [$('.rotator-line'), 2.1, 'up'], [$('.hero-ctas'), 2.18, 'up'], [$('.trust'), 2.26, 'up'],
    ];
    const touched = [arc, ...Object.values(P), tint, beam, glow, ambient, dashWrap, ...seq.map(s => s[0])];
    const END = 3.35;
    // ?introAt=1.3 congela a introducao num instante: so para testes locais e so com numero valido.
    // No site publicado o parametro e ignorado (antes, um link com ?introAt=abc deixava a pagina preta).
    const at = isLocal ? Number(new URLSearchParams(location.search).get('introAt')) : NaN;
    const frozen = isLocal && new URLSearchParams(location.search).has('introAt') && Number.isFinite(at);
    let t = frozen ? clamp(at, 0, END) : 0, speed = 1, last = performance.now(), finished = false;
    const skip = () => { speed = 5; };
    const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    evs.forEach(ev => addEventListener(ev, skip, { passive: true }));

    function show(el, t0, type, dur = type === 'blur' ? .75 : .9) {
      const p = E.outQuart(seg(t, t0, t0 + dur)), q = 1 - p;
      el.style.opacity = p;
      if (type === 'up') el.style.translate = `0 ${q * 34}px`;
      else if (type === 'down') el.style.translate = `0 ${-q * 20}px`;
      else if (type === 'blur') { el.style.translate = `0 ${q * 30}px`; el.style.filter = q > .001 ? `blur(${q * 14}px)` : 'none'; }
    }

    function render() {
      const W = parseFloat(getComputedStyle(arc).width);   // SVG nao tem offsetWidth
      const hb = horizon.getBoundingClientRect();
      const cx = hb.left + hb.width / 2, cy = hb.top - .1484 * W + W / 2;   // centro do svg sem transform
      const L = Math.min(innerWidth * .46, 220);                             // tamanho da logo no inicio
      const s0 = L / W, tx0 = 21 / 64 * L;                                   // comeca com o ponto ambar no centro

      // 1) desenho da logo (0 a 1.05 s)
      const pl = E.outBack(seg(t, .02, .32));
      const draw = E.inOutCubic(seg(t, .2, .78));
      const con = E.outCubic(seg(t, .7, .9));
      const nodes = E.outBack(seg(t, .78, 1.02));
      // 2) mergulho da camera (1.05 a 2.05 s)
      const push = E.inOutQuint(seg(t, 1.05, 2.05));
      const sc = Math.exp(lerp(Math.log(s0), 0, push));
      const tx = (innerWidth / 2 - cx + lerp(tx0, 0, E.inOutCubic(seg(t, .15, .9)))) * (1 - push);
      const ty = (innerHeight / 2 - cy) * (1 - push);
      arc.style.transform = `translate(${tx}px, ${ty}px) scale(${sc})`;
      arc.style.opacity = 1;
      const v = {
        '--du': 1 - draw, '--dd': 1 - draw, '--dc': 1 - con, '--ao': draw > .001 ? 1 : 0, '--co': con > .001 ? 1 : 0,
        '--bw': lerp(7, 3, push), '--cw': lerp(3, .7, push),
        '--rt': lerp(5.5, 1.3, push) * nodes, '--rb': lerp(5.5, 1.3, push) * nodes,
        '--rl': lerp(4.2, 1.1, push) * pl * (1 - seg(push, .2, .55)), '--rh': lerp(0, 3.4, seg(t, 1.6, 2.4)),
        '--m0': lerp(100, 29, push) + '%', '--m1': lerp(100, 36, push) + '%',
      };
      for (const k in v) arc.style.setProperty(k, v[k]);
      // o laranja "aquece" por cima e so depois o branco sai
      P.fire.style.opacity = E.inOutSine(seg(t, 1.12, 1.42));
      P.white.style.opacity = 1 - seg(t, 1.3, 1.55);
      P.glow.style.opacity = seg(t, 1.25, 2.1);
      P.haze.style.opacity = seg(t, 1.45, 2.4);
      P.rim.style.opacity = seg(t, 1.9, 2.5);
      P.halo.style.opacity = seg(t, 1.6, 2.4) * .55;
      // faiscas nas pontas do traco
      const tipA = seg(t, .2, .3) * (1 - seg(t, .72, .84));
      const ang = Math.PI - draw * (135 * Math.PI / 180);
      [[P.tipU, 1], [P.tipD, -1]].forEach(([el, dir]) => {
        const a = Math.PI + (ang - Math.PI) * dir;
        el.setAttribute('cx', 32 + 21 * Math.cos(a)); el.setAttribute('cy', 32 - 21 * Math.sin(a)); el.style.opacity = tipA;
      });
      // ondas de conexao nos nos
      [[P.rl, .06, 4], [P.rt, .86, 5], [P.rb, .9, 5]].forEach(([el, t0, r0]) => {
        const q = seg(t, t0, t0 + .6);
        el.setAttribute('r', lerp(r0, 13, E.outCubic(q)));
        el.style.opacity = q > 0 && q < 1 ? (1 - q) * .8 : 0;
      });
      // atmosfera do topo
      tint.style.opacity = seg(t, 1.2, 1.55) * (1 - seg(t, 1.9, 2.8)) * .9;
      beam.style.opacity = seg(t, 1.75, 2.6);
      glow.style.opacity = seg(t, 1.5, 2.5);
      ambient.style.opacity = seg(t, 1.6, 2.6);
      // conteudo entra em cascata
      for (const [el, t0, type] of seq) show(el, t0, type);
      const d = E.outQuart(seg(t, 2.2, 3.3));
      dashWrap.style.opacity = d;
      dashWrap.style.translate = `0 ${(1 - d) * 120}px`;
    }

    function finish() {
      if (finished) return;
      finished = true;
      evs.forEach(ev => removeEventListener(ev, skip));
      for (const el of touched) {
        for (const prop of ['opacity', 'translate', 'filter', 'transform']) el.style.removeProperty(prop);
      }
      ['--du', '--dd', '--dc', '--ao', '--co', '--bw', '--cw', '--rt', '--rb', '--rl', '--rh', '--m0', '--m1'].forEach(k => arc.style.removeProperty(k));
      html.classList.remove('intro');
      if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
      done();
    }

    function frame(now) {
      if (finished) return;
      if (!frozen) t += Math.min(.1, (now - last) / 1000) * speed;
      last = now;
      render();
      if (!frozen && t >= END) finish(); else requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  onScroll();
  clearTimeout(window.__cbFallback);
  runIntro(() => { startObservers(); onScroll(); showCookies(); });
})();
