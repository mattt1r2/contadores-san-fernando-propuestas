(() => {
  const reducido = matchMedia("(prefers-reduced-motion: reduce)");
  const presentacion = document.querySelector(".bpm-testimonios__presentacion");
  const selector = presentacion?.querySelector(".bpm-testimonios__selector");
  const voces = presentacion?.querySelector(".bpm-testimonios__voces");
  const botones = [...(selector?.querySelectorAll("button[aria-controls]") || [])];
  const paneles = botones.map(boton => document.getElementById(boton.getAttribute("aria-controls")));

  if (voces && paneles.length && paneles.every(panel => voces.contains(panel))) {
    let activo = -1;
    let transicion;
    const horizontal = matchMedia("(max-width: 700px)");

    function orientarSelector() {
      selector.setAttribute("aria-orientation", horizontal.matches ? "horizontal" : "vertical");
    }

    function seleccionar(indice, trasladarFoco = false, animar = true) {
      if (activo === indice) {
        esperarLectura();
        return;
      }
      transicion?.cancel();
      activo = indice;

      botones.forEach((boton, posicion) => {
        const seleccionado = posicion === indice;
        const panel = paneles[posicion];
        boton.setAttribute("aria-selected", String(seleccionado));
        boton.tabIndex = seleccionado ? 0 : -1;
        panel.toggleAttribute("data-activo", seleccionado);
        panel.toggleAttribute("inert", !seleccionado);
      });

      if (trasladarFoco) botones[indice].focus();
      if (animar && !reducido.matches) {
        transicion = paneles[indice].animate?.(
          [{ opacity: .65 }, { opacity: 1 }],
          { duration: 235, easing: "cubic-bezier(.23,.67,.3,1)" }
        );
      }
      esperarLectura();
    }

    selector.setAttribute("role", "tablist");
    selector.setAttribute("aria-label", "Elegir testimonio");
    voces.tabIndex = 0;
    voces.setAttribute("role", "region");
    voces.setAttribute("aria-label", "Testimonio seleccionado");
    orientarSelector();
    horizontal.addEventListener("change", orientarSelector);

    botones.forEach((boton, indice) => {
      boton.setAttribute("role", "tab");
      paneles[indice].setAttribute("role", "tabpanel");
      paneles[indice].setAttribute("aria-labelledby", boton.id);
      boton.addEventListener("click", () => seleccionar(indice, focoEnUnaVoz()));
    });

    selector.addEventListener("keydown", evento => {
      const indice = botones.indexOf(evento.target);
      if (indice < 0) return;
      const haciaAtras = horizontal.matches ? "ArrowLeft" : "ArrowUp";
      const haciaAdelante = horizontal.matches ? "ArrowRight" : "ArrowDown";
      let destino = indice;

      switch (evento.key) {
        case "Home": destino = 0; break;
        case "End": destino = botones.length - 1; break;
        case haciaAtras: destino = (indice - 1 + botones.length) % botones.length; break;
        case haciaAdelante: destino = (indice + 1) % botones.length; break;
        default: return;
      }

      evento.preventDefault();
      seleccionar(destino, true);
    });

    reducido.addEventListener("change", () => transicion?.cancel());
    const intervaloLectura = 8000;
    let visible = !("IntersectionObserver" in window);
    let siguienteVoz;

    function focoEnUnaVoz() {
      return document.activeElement !== voces && voces.contains(document.activeElement);
    }

    function puedeAvanzar() {
      return visible && !document.hidden && !focoEnUnaVoz();
    }

    function esperarLectura() {
      clearTimeout(siguienteVoz);
      if (!puedeAvanzar()) return;

      siguienteVoz = setTimeout(() => {
        if (puedeAvanzar()) seleccionar((activo + 1) % botones.length);
      }, intervaloLectura);
    }

    voces.addEventListener("focusin", esperarLectura);
    voces.addEventListener("focusout", () => requestAnimationFrame(esperarLectura));
    document.addEventListener("visibilitychange", esperarLectura);

    if ("IntersectionObserver" in window) {
      const umbralLectura = .35;
      new IntersectionObserver(([entrada]) => {
        visible = entrada.isIntersecting && entrada.intersectionRatio >= umbralLectura;
        esperarLectura();
      }, { threshold: umbralLectura }).observe(voces);
    }

    seleccionar(0, false, false);
    presentacion.dataset.controlado = "";
    selector.hidden = false;
  }

  if (!("IntersectionObserver" in window) || reducido.matches) return;
  const observador = new IntersectionObserver(entradas => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      entrada.target.dataset.estudioVisible = "";
      observador.unobserve(entrada.target);
    }
  }, { threshold: .18 });

  document.querySelectorAll("[data-estudio-entrada]").forEach(elemento => observador.observe(elemento));
})();
