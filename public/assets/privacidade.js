/* Salva a recusa dos cookies opcionais. Arquivo externo: a CSP do site nao permite scripts inline. */
document.getElementById('reject')?.addEventListener('click', () => {
  try {
    localStorage.setItem('conectabyte-cookie-preferences-v1', JSON.stringify({ necessary: true, analytics: false, advertising: false, savedAt: new Date().toISOString() }));
  } catch {}
  alert('Preferência salva. Nenhum cookie opcional está ativo.');
});
