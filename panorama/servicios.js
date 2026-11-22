(() => {
  const directorio = document.querySelector(".pan-servicios");
  if (!directorio) return;

  const navegacion = directorio.querySelector(".pan-servicios-navegacion");
  const enlaces = navegacion.querySelectorAll("a[href]");
  const familias = directorio.querySelectorAll(".pan-servicios-familia");

  function mostrarFamilia(activa) {
    for (const familia of familias) familia.hidden = familia !== activa;
    for (const enlace of enlaces) {
      if (enlace.hash === "#" + activa.id) enlace.setAttribute("aria-current", "location");
      else enlace.removeAttribute("aria-current");
    }
  }

  function revelar(hash) {
    const objetivo = document.getElementById(hash.slice(1));
    const familia = objetivo?.closest(".pan-servicios-familia");
    if (!familia || !directorio.contains(familia)) return null;

    mostrarFamilia(familia);
    const ficha = objetivo.closest("details");
    if (ficha) ficha.open = true;
    return ficha ?? familia;
  }

  function seguirUbicacion() {
    const hash = window.location.hash;
    const destino = revelar(hash);
    if (destino) {
      requestAnimationFrame(() => {
        if (window.location.hash === hash) {
          destino.scrollIntoView({ block: "start", behavior: "instant" });
        }
      });
    } else if (!hash || hash === "#servicios") {
      mostrarFamilia(familias[0]);
    }
  }

  mostrarFamilia(familias[0]);
  seguirUbicacion();
  window.addEventListener("hashchange", seguirUbicacion);

  document.addEventListener("click", (evento) => {
    if (evento.defaultPrevented || evento.button !== 0 || evento.ctrlKey ||
        evento.metaKey || evento.shiftKey || evento.altKey) return;

    const enlace = evento.target instanceof Element && evento.target.closest('a[href^="#"]');
    if (!enlace || enlace.target || !revelar(enlace.hash)) return;

    if (navegacion.contains(enlace)) {
      evento.preventDefault();
      if (window.location.hash !== enlace.hash) history.pushState(null, "", enlace.hash);
    } else if (window.location.hash === enlace.hash) {
      seguirUbicacion();
    }
  });
})();
