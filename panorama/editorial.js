(() => {
  const seccion = document.getElementById("testimonios");
  const lectura = seccion?.querySelector(".panorama-testimonios__lectura");
  const autores = lectura?.querySelector(".panorama-testimonios__autores");
  const voces = lectura?.querySelector(".panorama-testimonios__voces");
  if (!autores || !voces) return;

  const botones = [...autores.querySelectorAll("button[aria-controls]")];
  const paneles = botones.map(boton => document.getElementById(boton.getAttribute("aria-controls")));
  if (!paneles.length || !paneles.every(panel => lectura.contains(panel))) return;

  const reducido = matchMedia("(prefers-reduced-motion: reduce)");
  let activo = -1;
  let transicion;
  let visible = !("IntersectionObserver" in window);
  let siguienteVoz;

  function actualizarAccesoTab() {
    const enfocado = botones.indexOf(document.activeElement);
    const inicio = enfocado >= 0 ? enfocado : activo;
    botones.forEach((boton, posicion) => {
      boton.tabIndex = posicion === inicio ? 0 : -1;
    });
  }

  function puedeAvanzar() {
    return visible && !document.hidden;
  }

  function esperarLectura() {
    clearTimeout(siguienteVoz);
    if (!puedeAvanzar() || botones.length < 2) return;
    siguienteVoz = setTimeout(() => {
      if (puedeAvanzar()) seleccionar((activo + 1) % botones.length);
    }, 8000);
  }

  function seleccionar(indice, trasladarFoco = false, animar = true) {
    if (trasladarFoco) botones[indice].focus({ preventScroll: true });
    esperarLectura();
    if (activo === indice) return;
    transicion?.cancel();
    activo = indice;

    botones.forEach((boton, posicion) => {
      const seleccionado = posicion === indice;
      const panel = paneles[posicion];
      boton.setAttribute("aria-selected", String(seleccionado));
      panel.toggleAttribute("data-seleccionado", seleccionado);
      panel.toggleAttribute("inert", !seleccionado);
    });

    actualizarAccesoTab();
    if (animar && !reducido.matches) {
      transicion = paneles[indice].animate?.(
        [{ opacity: .65 }, { opacity: 1 }],
        { duration: 235, easing: "ease-out" }
      );
    }
  }

  autores.setAttribute("role", "tablist");
  autores.setAttribute("aria-label", "Elegir testimonio");
  autores.setAttribute("aria-orientation", "horizontal");
  botones.forEach((boton, indice) => {
    boton.setAttribute("role", "tab");
    paneles[indice].setAttribute("role", "tabpanel");
    paneles[indice].setAttribute("aria-labelledby", boton.id);
    boton.addEventListener("click", () => seleccionar(indice));
  });

  autores.addEventListener("keydown", evento => {
    const indice = botones.indexOf(evento.target);
    if (indice < 0) return;
    let destino;

    switch (evento.key) {
      case "Home": destino = 0; break;
      case "End": destino = botones.length - 1; break;
      case "ArrowLeft": destino = (indice - 1 + botones.length) % botones.length; break;
      case "ArrowRight": destino = (indice + 1) % botones.length; break;
      default: return;
    }

    evento.preventDefault();
    seleccionar(destino, true);
  });

  reducido.addEventListener("change", () => transicion?.cancel());
  seleccionar(0, false, false);
  lectura.dataset.activa = "";
  autores.hidden = false;
  voces.tabIndex = 0;
  voces.setAttribute("role", "group");
  voces.setAttribute("aria-label", "Testimonio seleccionado");

  autores.addEventListener("focusin", actualizarAccesoTab);
  autores.addEventListener("focusout", () => requestAnimationFrame(actualizarAccesoTab));
  document.addEventListener("visibilitychange", esperarLectura);

  if ("IntersectionObserver" in window) {
    const umbralLectura = .35;
    const observador = new IntersectionObserver(([entrada]) => {
      const enPantalla = entrada.isIntersecting && entrada.intersectionRatio >= umbralLectura;
      if (visible === enPantalla) return;
      visible = enPantalla;
      esperarLectura();
    }, { threshold: umbralLectura });
    observador.observe(voces);
  }
})();
