/* Roda antes da primeira pintura: decide se a introducao (gancho da logo) toca.
   Fica num arquivo proprio porque a CSP do site so permite scripts de 'self'. */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  // Rede de seguranca: se o site.js nao carregar ou quebrar antes de terminar de
  // iniciar, tira as classes que escondem o conteudo e o site aparece sem animacoes.
  window.__cbFallback = setTimeout(function () { d.classList.remove('intro', 'js'); }, 5000);
  try {
    var q = location.search;
    var forced = /[?&]intro=1/.test(q);
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    var type = nav ? nav.type : 'navigate';
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Ao recarregar no meio da pagina, nao joga a pessoa de volta para o topo.
    var lastY = +(sessionStorage.getItem('cb-scroll') || 0);
    var midPage = type === 'reload' && lastY > 120;
    var play = forced || (!reduce && !location.hash && type !== 'back_forward' && !midPage && !/[?&]intro=0/.test(q));
    if (play) {
      d.classList.add('intro');
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    }
  } catch (e) { d.classList.remove('intro'); }
})();
