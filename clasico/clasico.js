(() => {
  const header = document.querySelector(".header");
  const menu = header.querySelector(".menu-movil");
  const mov = matchMedia("(max-width: 679px)");
  const enlacesNav = [...header.querySelectorAll("nav a")];
  const secciones = [...document.querySelectorAll("main > section[id]")];

  function abrirMenu(abierto) {
    header.dataset.menu = abierto ? "abierto" : "cerrado";
    menu.setAttribute("aria-expanded", String(abierto));
  }
  menu.hidden = false;
  abrirMenu(false);
  menu.addEventListener("click", () => abrirMenu(menu.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("click", e => {
    if (!header.contains(e.target) || e.target.closest("a")) abrirMenu(false);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && header.dataset.menu === "abierto") {
      abrirMenu(false);
      menu.focus();
    }
  });
  mov.addEventListener("change", () => abrirMenu(false));

  let pendiente = false;
  function marcarSeccion() {
    pendiente = false;
    const linea = header.getBoundingClientRect().bottom + Math.min(190, innerHeight * .27);
    let id = "inicio";
    for (const seccion of secciones) {
      if (seccion.getBoundingClientRect().top > linea) break;
      id = seccion.id;
    }
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 3) id = "contacto";
    const grupo = ["por-que-elegirnos", "testimonios"].includes(id) ? "estudio" : id;
    for (const enlace of enlacesNav) {
      if (enlace.hash === "#" + grupo) enlace.setAttribute("aria-current", "location");
      else enlace.removeAttribute("aria-current");
    }
  }
  function alMover() {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(marcarSeccion);
    }
  }
  window.addEventListener("scroll", alMover, { passive: true });
  window.addEventListener("resize", alMover);
  window.addEventListener("pageshow", alMover);
  marcarSeccion();

  const servicios = document.querySelector(".service-ui");
  const columna = servicios.querySelector(".service-panels");
  const enlaces = [...servicios.querySelectorAll(".service-button")];
  const fichas = enlaces.map(enlace => document.getElementById(enlace.hash.slice(1)));
  let seleccion;
  function mostrar(indice) {
    seleccion = indice;
    fichas.forEach((ficha, i) => {
      const elegida = indice === i;
      ficha.hidden = !elegida;
      if (elegida) enlaces[i].setAttribute("aria-current", "true");
      else enlaces[i].removeAttribute("aria-current");
      const destino = mov.matches && elegida ? enlaces[i].parentElement : columna;
      if (ficha.parentElement !== destino) destino.append(ficha);
    });
  }
  function desdeDireccion() {
    const indice = enlaces.findIndex(enlace => enlace.hash === location.hash);
    if (indice >= 0) {
      mostrar(indice);
      requestAnimationFrame(() => (mov.matches ? enlaces[indice] : fichas[indice]).scrollIntoView({ block: "start", behavior: "instant" }));
    } else if (seleccion === undefined || location.hash === "#servicios") mostrar(0);
  }
  enlaces.forEach((enlace, i) => {
    enlace.addEventListener("click", e => {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      mostrar(i);
      if (location.hash !== enlace.hash) history.pushState(null, "", enlace.hash);
      if (mov.matches) enlace.scrollIntoView({ block: "nearest" });
    });
  });
  mov.addEventListener("change", () => mostrar(seleccion));
  window.addEventListener("hashchange", desdeDireccion);
  servicios.dataset.lista = "";
  desdeDireccion();

  const reducido = matchMedia("(prefers-reduced-motion: reduce)");
  if (reducido.matches || !("IntersectionObserver" in window)) return;
  const cifras = [...document.querySelectorAll("[data-cifra]")];
  const observador = new IntersectionObserver(([entrada]) => {
    if (!entrada.isIntersecting) return;
    observador.disconnect();
    const inicio = performance.now();
    function contar(ahora) {
      const t = reducido.matches ? 1 : Math.min(1, Math.max(0, (ahora-inicio)/750));
      for (const cifra of cifras) cifra.textContent = String(Math.round(Number(cifra.dataset.cifra) * (1 - (1-t)**2)));
      if (t < 1) requestAnimationFrame(contar);
    }
    requestAnimationFrame(contar);
  }, {threshold: .4});
  observador.observe(document.querySelector(".fact-band"));
})();
