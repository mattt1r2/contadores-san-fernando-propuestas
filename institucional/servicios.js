(() => {
  function abrirFichaEnlazada() {
    const ficha = document.getElementById(window.location.hash.slice(1));
    if (ficha?.classList.contains("bpm-servicios-ficha")) ficha.open = true;
  }

  abrirFichaEnlazada();
  window.addEventListener("hashchange", abrirFichaEnlazada);

  document.addEventListener("click", (evento) => {
    if (evento.defaultPrevented || evento.button !== 0 || evento.ctrlKey ||
        evento.metaKey || evento.shiftKey || evento.altKey) return;
    const enlace = evento.target instanceof Element && evento.target.closest('a[href^="#"]');
    if (enlace && enlace.getAttribute("href") === window.location.hash) abrirFichaEnlazada();
  });
})();
