(() => {
  const cabecera = document.querySelector(".cabecera");
  const menu = cabecera.querySelector(".menu-conmutador");
  const reducido = matchMedia("(prefers-reduced-motion: reduce)");
  const enlacesNav = [...cabecera.querySelectorAll("nav a")];
  const secciones = [...document.querySelectorAll("main > section[id], footer[id]")];

  function abrirMenu(abierto) {
    cabecera.dataset.menu = abierto ? "abierto" : "cerrado";
    menu.setAttribute("aria-expanded", String(abierto));
  }
  abrirMenu(false);
  menu.hidden = false;
  menu.addEventListener("click", () => abrirMenu(menu.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("click", evento => {
    if (!cabecera.contains(evento.target) || evento.target.closest("a")) abrirMenu(false);
  });
  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && cabecera.dataset.menu === "abierto") {
      abrirMenu(false);
      menu.focus();
    }
  });
  matchMedia("(min-width: 691px)").addEventListener("change", () => abrirMenu(false));

  let actualizacion = 0;
  let siguiendoEnlace = false;
  let finDelRecorrido;
  function indicarSeccion(id) {
    const activa = id === "estudio" || id === "por-que-elegirnos" ? "#quienes-somos" : "#" + id;
    for (const enlace of enlacesNav) {
      if (enlace.hash === activa) enlace.setAttribute("aria-current", "location");
      else enlace.removeAttribute("aria-current");
    }
  }
  function marcarNavegacion() {
    actualizacion = 0;
    if (siguiendoEnlace) return;
    const cabeceraHasta = cabecera.getBoundingClientRect().bottom;
    const altoLibre = Math.max(0, innerHeight - cabeceraHasta);
    const zonaDeLectura = cabeceraHasta + Math.min(altoLibre * .4, 260);
    const entradaDesdePortada = cabeceraHasta + altoLibre * .7;
    let id = "";
    for (const seccion of secciones) {
      const limite = seccion.id === "quienes-somos" ? entradaDesdePortada : zonaDeLectura;
      if (seccion.getBoundingClientRect().top > limite) break;
      id = seccion.id;
    }
    if (window.scrollY > 0 && innerHeight + window.scrollY >= document.documentElement.scrollHeight - 3) id = "contacto";
    indicarSeccion(id);
  }
  function actualizarNav() {
    if (!actualizacion) actualizacion = requestAnimationFrame(marcarNavegacion);
  }
  function seguirLectura() {
    clearTimeout(finDelRecorrido);
    siguiendoEnlace = false;
    delete document.documentElement.dataset.desplazando;
    actualizarNav();
  }
  function esperarFinDelRecorrido() {
    clearTimeout(finDelRecorrido);
    finDelRecorrido = setTimeout(seguirLectura, 180);
  }
  document.addEventListener("click", evento => {
    if (evento.defaultPrevented || evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
    const enlace = evento.target.closest('a[href^="#"]');
    const destino = enlace && document.getElementById(enlace.hash.slice(1));
    if (!destino) return;
    const seccion = destino.closest("main > section[id], footer[id]");
    siguiendoEnlace = true;
    document.documentElement.dataset.desplazando = "";
    indicarSeccion(seccion?.id || "");
    esperarFinDelRecorrido();
  });
  marcarNavegacion();
  window.addEventListener("scroll", () => {
    if (siguiendoEnlace) esperarFinDelRecorrido();
    else actualizarNav();
  }, {passive: true});
  window.addEventListener("wheel", seguirLectura, {passive: true});
  window.addEventListener("touchstart", seguirLectura, {passive: true});
  window.addEventListener("keydown", evento => {
    if (["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"," "].includes(evento.key)) seguirLectura();
  });
  window.addEventListener("popstate", actualizarNav);
  window.addEventListener("pageshow", actualizarNav);
  window.addEventListener("load", actualizarNav);
  window.addEventListener("resize", actualizarNav);

  const panorama = document.querySelector(".panorama");
  const fotos = [...panorama.querySelectorAll("img")];
  const ficha = panorama.querySelector(".panorama-texto");
  const tituloFoto = ficha.querySelector("h2");
  const enlaceFoto = ficha.querySelector("a");
  const controles = panorama.querySelector(".panorama-pasos");
  const indicadores = [...controles.querySelectorAll(".panorama-indice button")];
  const opciones = [
    { titulo: "Contabilidad e impuestos", enlace: "#contabilidad" },
    { titulo: "Auditoría financiera", enlace: "#auditoria" },
    { titulo: "Gestión laboral", enlace: "#contabilidad" }
  ];
  const intervaloFotos = 6200;
  let indice = 0;
  let visible = !("IntersectionObserver" in window);
  let temporizadorFoto;
  let progresoFoto;
  let fundidoFoto;

  function programarFoto() {
    clearTimeout(temporizadorFoto);
    progresoFoto?.cancel();
    if (!visible || document.hidden || document.activeElement === enlaceFoto) return;

    if (!reducido.matches) {
      progresoFoto = indicadores[indice].querySelector("i").animate?.(
        [{transform: "scaleX(0)"}, {transform: "scaleX(1)"}],
        {duration: intervaloFotos, fill: "both"}
      );
    }
    temporizadorFoto = setTimeout(() => mostrarFoto((indice + 1) % opciones.length), intervaloFotos);
  }

  function mostrarFoto(nuevoIndice, animar = true, manual = false) {
    // El destino y el título se mantienen juntos mientras se usa el enlace con el teclado.
    if (document.activeElement === enlaceFoto && nuevoIndice !== indice) return;
    fundidoFoto?.cancel();
    indice = nuevoIndice;
    const opcion = opciones[indice];
    fotos.forEach((foto, i) => {
      foto.hidden = false;
      foto.setAttribute("aria-hidden", String(i !== indice));
      if (i === indice) indicadores[i].setAttribute("aria-current", "true");
      else indicadores[i].removeAttribute("aria-current");
    });
    ficha.setAttribute("aria-live", manual ? "polite" : "off");
    tituloFoto.textContent = opcion.titulo;
    enlaceFoto.href = opcion.enlace;
    if (animar && !reducido.matches) {
      fundidoFoto = ficha.animate?.(
        [{opacity: .35, transform: "translateY(6px)"}, {opacity: 1, transform: "none"}],
        {duration: 440, easing: "ease-out"}
      );
    }
    programarFoto();
  }

  panorama.dataset.lista = "";
  controles.hidden = false;
  mostrarFoto(0, false);
  indicadores.forEach((boton, i) => {
    boton.addEventListener("click", () => {
      if (document.activeElement === enlaceFoto) boton.focus({preventScroll: true});
      mostrarFoto(i, true, true);
    });
  });
  enlaceFoto.addEventListener("focus", programarFoto);
  enlaceFoto.addEventListener("blur", () => requestAnimationFrame(programarFoto));
  document.addEventListener("visibilitychange", programarFoto);
  reducido.addEventListener("change", () => {
    fundidoFoto?.cancel();
    programarFoto();
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entrada]) => {
      visible = entrada.isIntersecting;
      programarFoto();
    }).observe(panorama);
  }

  if (reducido.matches || !("IntersectionObserver" in window)) return;
  const entradas = new IntersectionObserver(cambios => {
    for (const cambio of cambios) {
      if (!cambio.isIntersecting) continue;
      entradas.unobserve(cambio.target);
      if (!reducido.matches) {
        const imagen = cambio.target.classList.contains("bpm-servicios-imagen");
        cambio.target.animate(
          imagen
            ? [{opacity: .75, clipPath: "inset(0 9% 0 0)"}, {opacity: 1, clipPath: "inset(0)"}]
            : [{opacity: .4, transform: "translateY(14px)"}, {opacity: 1, transform: "none"}],
          {duration: imagen ? 640 : 520, easing: "cubic-bezier(.18,.72,.25,1)"}
        );
      }
    }
  }, {threshold: .15});
  document.querySelectorAll(".quienes h2, .quienes-presentacion, .bpm-servicios-imagen").forEach(el => entradas.observe(el));
  const numeros = [...document.querySelectorAll("[data-numero]")];
  const franja = document.querySelector(".franja-estudio");
  const observador = new IntersectionObserver(([entrada]) => {
    if (!entrada.isIntersecting) return;
    observador.disconnect();
    const inicio = performance.now();
    function contar(tiempo) {
      const avance = reducido.matches ? 1 : Math.min(1, Math.max(0, (tiempo-inicio) / 960));
      numeros.forEach(numero => {
        numero.textContent = String(Math.round(Number(numero.dataset.numero) * (1 - (1-avance)**2)));
      });
      if (avance < 1) requestAnimationFrame(contar);
    }
    requestAnimationFrame(contar);
  }, {threshold: .35});
  observador.observe(franja);
})();
