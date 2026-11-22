(() => {
  const seccion = document.getElementById("testimonios");
  const voces = seccion?.querySelector(".indice-testimonios__voces");
  const fichas = [...(voces?.querySelectorAll("figure") ?? [])];
  if (fichas.length < 2) return;

  const marcas = seccion.querySelector(".indice-testimonios__marcas");
  const estado = seccion.querySelector("[data-testimonio-estado]");
  const reducido = matchMedia("(prefers-reduced-motion: reduce)");
  const intervalo = 8000;
  let indice = 0;
  let visible = !("IntersectionObserver" in window);
  let temporizador;
  let progreso;
  let fundido;

  const indicadores = fichas.map((ficha, i) => {
    const boton = document.createElement("button");
    const autor = ficha.querySelector("figcaption strong").textContent;
    boton.type = "button";
    boton.setAttribute("aria-label", "Ver testimonio de " + autor);
    boton.setAttribute("aria-controls", voces.id);
    const linea = document.createElement("span");
    linea.setAttribute("aria-hidden", "true");
    boton.append(linea);
    boton.addEventListener("click", () => {
      mostrar(i);
      estado.textContent = "Testimonio de " + autor + ".";
    });
    marcas.append(boton);
    return boton;
  });

  function programar() {
    clearTimeout(temporizador);
    progreso?.cancel();
    if (!visible || document.hidden) return;

    if (!reducido.matches) {
      progreso = indicadores[indice].firstElementChild.animate?.(
        [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
        { duration: intervalo, easing: "linear", fill: "both" }
      );
    }
    temporizador = setTimeout(() => mostrar((indice + 1) % fichas.length), intervalo);
  }

  function mostrar(destino) {
    const cambia = destino !== indice;
    indice = destino;
    fundido?.cancel();
    fichas.forEach((ficha, i) => {
      const activa = i === indice;
      ficha.setAttribute("aria-hidden", String(!activa));
      ficha.toggleAttribute("inert", !activa);
      if (activa) indicadores[i].setAttribute("aria-current", "true");
      else indicadores[i].removeAttribute("aria-current");
    });
    if (cambia && !reducido.matches) {
      fundido = fichas[indice].animate?.([{ opacity: .45 }, { opacity: 1 }], { duration: 240 });
    }
    programar();
  }

  document.addEventListener("visibilitychange", programar);
  reducido.addEventListener("change", () => {
    fundido?.cancel();
    programar();
  });

  voces.dataset.activo = "";
  marcas.hidden = false;
  mostrar(0);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entrada]) => {
      visible = entrada.isIntersecting;
      programar();
    }).observe(voces);
  }
})();
