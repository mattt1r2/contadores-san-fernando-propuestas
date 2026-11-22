(() => {
  const cabecera = document.querySelector(".lateral");
  const menu = cabecera.querySelector(".menu");
  const enlaces = [...cabecera.querySelectorAll("nav a")];
  const secciones = [...document.querySelectorAll("main > section[id]")];
  const movil = matchMedia("(max-width: 940px)");
  const movimientoReducido = matchMedia("(prefers-reduced-motion: reduce)");

  function mostrarMenu(abierto) {
    cabecera.dataset.menu = abierto ? "abierto" : "cerrado";
    menu.setAttribute("aria-expanded", String(abierto));
  }
  menu.hidden = false;
  mostrarMenu(false);
  menu.addEventListener("click", () => mostrarMenu(menu.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("click", evento => {
    if (!cabecera.contains(evento.target) || evento.target.closest("a")) mostrarMenu(false);
  });
  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && cabecera.dataset.menu === "abierto") {
      mostrarMenu(false);
      menu.focus();
    }
  });
  movil.addEventListener("change", () => mostrarMenu(false));

  let pendiente = false;
  function actualizarMenu() {
    pendiente = false;
    const cabeceraAlta = movil.matches ? cabecera.offsetHeight : 0;
    const umbral = cabeceraAlta + Math.min(200, (innerHeight - cabeceraAlta) * .28);
    let hash = "#inicio";
    for (const seccion of secciones) {
      if (seccion.getBoundingClientRect().top > umbral) break;
      hash = "#" + seccion.id;
    }
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 3) hash = "#contacto";
    for (const enlace of enlaces) {
      if (enlace.hash === hash) enlace.setAttribute("aria-current", "location");
      else enlace.removeAttribute("aria-current");
    }
  }
  function alDesplazar() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(actualizarMenu);
  }
  window.addEventListener("scroll", alDesplazar, { passive: true });
  window.addEventListener("resize", alDesplazar);
  window.addEventListener("pageshow", alDesplazar);
  document.addEventListener("toggle", alDesplazar, true);
  actualizarMenu();

  const carrete = document.querySelector(".carrete");
  const fotos = [...carrete.querySelectorAll("img")];
  let foto = 0;
  let temporizador;
  let enPantalla = true;
  function programar() {
    clearTimeout(temporizador);
    if (!enPantalla || document.hidden) return;
    temporizador = setTimeout(() => {
      foto = (foto + 1) % fotos.length;
      fotos.forEach((imagen, indice) => imagen.toggleAttribute("data-visible", indice === foto));
      programar();
    }, 7800);
  }
  fotos.forEach((imagen, indice) => {
    imagen.hidden = false;
    imagen.toggleAttribute("data-visible", indice === foto);
  });
  carrete.setAttribute("data-activa", "");
  document.addEventListener("visibilitychange", programar);
  programar();
  if (!("IntersectionObserver" in window)) return;
  new IntersectionObserver(([entrada]) => {
    enPantalla = entrada.isIntersecting;
    programar();
  }).observe(carrete);

  if (movimientoReducido.matches) return;
  const cifras = [...document.querySelectorAll("[data-cifra]")];
  const observadorCifras = new IntersectionObserver(([entrada]) => {
    if (!entrada.isIntersecting) return;
    observadorCifras.disconnect();
    const inicio = performance.now();
    function contar(ahora) {
      const avance = movimientoReducido.matches ? 1 : Math.min(1, Math.max(0, (ahora-inicio) / 850));
      for (const cifra of cifras) cifra.textContent = String(Math.round(Number(cifra.dataset.cifra) * (1 - (1-avance)**2)));
      if (avance < 1) requestAnimationFrame(contar);
    }
    requestAnimationFrame(contar);
  }, {threshold: .3});
  observadorCifras.observe(document.querySelector(".datos"));
})();
