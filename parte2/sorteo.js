/* ===========================================================
   js/sorteo.js
   Responsable: Alumno 4 (rama feature/sorteo-equipos)
   Alcance: F1 (lista de participantes + localStorage),
            F2 (modo de división + título),
            F3 (botón Generar + sorteo aleatorio + render).
   No incluye F4 (exportar JPG / copiar) — eso es de main.js.
   =========================================================== */

window.SorteoEquipos = (function () {
  "use strict";

  /* ---------------- Constantes ---------------- */
  const CLAVE_LOCAL_STORAGE_PARTICIPANTES = "sorteoEquipos.participantes";
  const CLAVE_LOCAL_STORAGE_TITULO = "sorteoEquipos.titulo";
  const MAXIMO_PARTICIPANTES = 100;
  const MAXIMO_CARACTERES_POR_LINEA = 50;
  const RETARDO_ANIMACION_INTEGRANTE_MS = 90;
  const RETARDO_ANIMACION_EQUIPO_MS = 120;

  /* ---------------- Referencias al DOM ---------------- */
  let areaParticipantes,
    contadorParticipantes,
    avisoLimiteSorteo,
    mensajeErrorSorteo,
    modoCantidadEquipos,
    modoParticipantesPorEquipo,
    selectorCantidadEquipos,
    tituloEquipos,
    botonLimpiarSorteo,
    botonGenerarEquipos,
    pantallaConfiguracionSorteo,
    pantallaResultadosSorteo,
    subtituloResultadosSorteo,
    tituloRenderizadoSorteo,
    rejillaEquiposSorteo,
    botonVolverSorteo;

  /* Estado del último sorteo, expuesto para que main.js (F4)
     pueda descargar/copiar sin recalcular nada. */
  let equiposGenerados = [];
  let tituloDelSorteo = "";

  /* ---------------- F1: persistencia y validación ---------------- */

  function cargarParticipantesGuardados() {
    const textoGuardado = localStorage.getItem(CLAVE_LOCAL_STORAGE_PARTICIPANTES);
    if (textoGuardado !== null) areaParticipantes.value = textoGuardado;

    const tituloGuardado = localStorage.getItem(CLAVE_LOCAL_STORAGE_TITULO);
    if (tituloGuardado !== null) tituloEquipos.value = tituloGuardado;
  }

  function guardarParticipantesEnStorage() {
    localStorage.setItem(CLAVE_LOCAL_STORAGE_PARTICIPANTES, areaParticipantes.value);
  }

  function guardarTituloEnStorage() {
    localStorage.setItem(CLAVE_LOCAL_STORAGE_TITULO, tituloEquipos.value);
  }

  function obtenerListaParticipantes() {
    return areaParticipantes.value
      .split("\n")
      .map(function (linea) { return linea.trim(); })
      .filter(function (linea) { return linea.length > 0; });
  }

  function actualizarContadorYValidacion() {
    const listaActual = obtenerListaParticipantes();
    contadorParticipantes.textContent = listaActual.length;

    let textoAviso = "";
    if (listaActual.length > MAXIMO_PARTICIPANTES) {
      textoAviso = "Superaste el máximo de " + MAXIMO_PARTICIPANTES + " participantes.";
    }
    const hayLineaDemasiadoLarga = listaActual.some(function (nombre) {
      return nombre.length > MAXIMO_CARACTERES_POR_LINEA;
    });
    if (hayLineaDemasiadoLarga) {
      textoAviso += (textoAviso ? " " : "") + "Hay un nombre con más de " + MAXIMO_CARACTERES_POR_LINEA + " caracteres.";
    }
    avisoLimiteSorteo.textContent = textoAviso;
  }

  /* ---------------- F2: modo de división ---------------- */

  function repoblarSelectorCantidad() {
    const valorPrevio = selectorCantidadEquipos.value;
    selectorCantidadEquipos.innerHTML = "";

    const esModoCantidadEquipos = modoCantidadEquipos.checked;
    const limiteSuperior = 20;

    for (let numero = 2; numero <= limiteSuperior; numero++) {
      const opcion = document.createElement("option");
      opcion.value = String(numero);
      opcion.textContent = esModoCantidadEquipos
        ? numero + " equipos"
        : numero + " participantes por equipo";
      selectorCantidadEquipos.appendChild(opcion);
    }

    if (valorPrevio && Number(valorPrevio) >= 2 && Number(valorPrevio) <= limiteSuperior) {
      selectorCantidadEquipos.value = valorPrevio;
    } else {
      selectorCantidadEquipos.value = "2";
    }
  }

  /* ---------------- F3: algoritmo de sorteo ---------------- */

  function mezclarAleatoriamente(listaOriginal) {
    const lista = listaOriginal.slice();
    for (let indiceActual = lista.length - 1; indiceActual > 0; indiceActual--) {
      const indiceAleatorio = Math.floor(Math.random() * (indiceActual + 1));
      const temporal = lista[indiceActual];
      lista[indiceActual] = lista[indiceAleatorio];
      lista[indiceAleatorio] = temporal;
    }
    return lista;
  }

  function calcularCantidadDeEquipos(totalParticipantes, valorSeleccionado, esModoCantidadEquipos) {
    if (esModoCantidadEquipos) {
      return Math.max(1, Math.min(valorSeleccionado, totalParticipantes));
    }
    return Math.max(1, Math.ceil(totalParticipantes / valorSeleccionado));
  }

  function distribuirEnEquipos(listaMezclada, cantidadDeEquipos) {
    const equipos = [];
    for (let indice = 0; indice < cantidadDeEquipos; indice++) equipos.push([]);
    listaMezclada.forEach(function (nombreParticipante, indice) {
      equipos[indice % cantidadDeEquipos].push(nombreParticipante);
    });
    return equipos;
  }

  function generarSorteoDeEquipos() {
    mensajeErrorSorteo.textContent = "";
    const listaParticipantes = obtenerListaParticipantes();

    if (listaParticipantes.length < 2) {
      mensajeErrorSorteo.textContent = "Ingresa al menos 2 participantes para poder sortear.";
      return;
    }
    if (listaParticipantes.length > MAXIMO_PARTICIPANTES) {
      mensajeErrorSorteo.textContent = "El máximo permitido es " + MAXIMO_PARTICIPANTES + " participantes.";
      return;
    }
    const hayNombreDemasiadoLargo = listaParticipantes.some(function (nombre) {
      return nombre.length > MAXIMO_CARACTERES_POR_LINEA;
    });
    if (hayNombreDemasiadoLargo) {
      mensajeErrorSorteo.textContent = "Hay nombres con más de " + MAXIMO_CARACTERES_POR_LINEA + " caracteres.";
      return;
    }

    const esModoCantidadEquipos = modoCantidadEquipos.checked;
    const valorSeleccionado = Number(selectorCantidadEquipos.value);
    const cantidadDeEquipos = calcularCantidadDeEquipos(
      listaParticipantes.length,
      valorSeleccionado,
      esModoCantidadEquipos
    );

    const listaMezclada = mezclarAleatoriamente(listaParticipantes);
    equiposGenerados = distribuirEnEquipos(listaMezclada, cantidadDeEquipos);
    tituloDelSorteo = tituloEquipos.value.trim() || "Sorteo de equipos";

    mostrarPantallaDeResultados();
  }

  /* ---------------- Render con aparición progresiva ---------------- */

  function mostrarPantallaDeResultados() {
    pantallaConfiguracionSorteo.classList.add("oculta");
    pantallaResultadosSorteo.classList.add("activa");

    tituloRenderizadoSorteo.textContent = tituloDelSorteo;
    const totalParticipantes = equiposGenerados.reduce(function (total, equipo) {
      return total + equipo.length;
    }, 0);
    subtituloResultadosSorteo.textContent =
      equiposGenerados.length + " equipo(s) · " + totalParticipantes + " participante(s)";

    rejillaEquiposSorteo.innerHTML = "";

    equiposGenerados.forEach(function (integrantesDelEquipo, indiceEquipo) {
      const tarjetaEquipo = document.createElement("div");
      tarjetaEquipo.className = "tarjeta-equipo";
      tarjetaEquipo.style.animationDelay = indiceEquipo * RETARDO_ANIMACION_EQUIPO_MS + "ms";

      const subtituloEquipo = document.createElement("span");
      subtituloEquipo.className = "subtitulo-equipo";
      subtituloEquipo.textContent = "Equipo " + (indiceEquipo + 1);
      tarjetaEquipo.appendChild(subtituloEquipo);

      const listaIntegrantes = document.createElement("ul");
      listaIntegrantes.className = "lista-integrantes";

      integrantesDelEquipo.forEach(function (nombreIntegrante, indiceIntegrante) {
        const itemIntegrante = document.createElement("li");
        itemIntegrante.textContent = nombreIntegrante;
        const retardoTotal =
          indiceEquipo * RETARDO_ANIMACION_EQUIPO_MS +
          indiceIntegrante * RETARDO_ANIMACION_INTEGRANTE_MS +
          150;
        itemIntegrante.style.animationDelay = retardoTotal + "ms";
        listaIntegrantes.appendChild(itemIntegrante);
      });

      tarjetaEquipo.appendChild(listaIntegrantes);
      rejillaEquiposSorteo.appendChild(tarjetaEquipo);
    });
  }

  /* ---------------- Manejadores de eventos ---------------- */

  function vincularEventos() {
    areaParticipantes.addEventListener("input", function () {
      guardarParticipantesEnStorage();
      actualizarContadorYValidacion();
      mensajeErrorSorteo.textContent = "";
    });

    tituloEquipos.addEventListener("input", guardarTituloEnStorage);

    modoCantidadEquipos.addEventListener("change", repoblarSelectorCantidad);
    modoParticipantesPorEquipo.addEventListener("change", repoblarSelectorCantidad);

    botonLimpiarSorteo.addEventListener("click", function () {
      areaParticipantes.value = "";
      tituloEquipos.value = "";
      localStorage.removeItem(CLAVE_LOCAL_STORAGE_PARTICIPANTES);
      localStorage.removeItem(CLAVE_LOCAL_STORAGE_TITULO);
      actualizarContadorYValidacion();
      mensajeErrorSorteo.textContent = "";
      areaParticipantes.focus();
    });

    botonGenerarEquipos.addEventListener("click", generarSorteoDeEquipos);

    botonVolverSorteo.addEventListener("click", function () {
      pantallaResultadosSorteo.classList.remove("activa");
      pantallaConfiguracionSorteo.classList.remove("oculta");
    });
  }

  /* ---------------- Inicialización del módulo ---------------- */

  function inicializar() {
    areaParticipantes = document.getElementById("areaParticipantes");
    contadorParticipantes = document.getElementById("contadorParticipantes");
    avisoLimiteSorteo = document.getElementById("avisoLimiteSorteo");
    mensajeErrorSorteo = document.getElementById("mensajeErrorSorteo");
    modoCantidadEquipos = document.getElementById("modoCantidadEquipos");
    modoParticipantesPorEquipo = document.getElementById("modoParticipantesPorEquipo");
    selectorCantidadEquipos = document.getElementById("selectorCantidadEquipos");
    tituloEquipos = document.getElementById("tituloEquipos");
    botonLimpiarSorteo = document.getElementById("botonLimpiarSorteo");
    botonGenerarEquipos = document.getElementById("botonGenerarEquipos");
    pantallaConfiguracionSorteo = document.getElementById("pantallaConfiguracionSorteo");
    pantallaResultadosSorteo = document.getElementById("pantallaResultadosSorteo");
    subtituloResultadosSorteo = document.getElementById("subtituloResultadosSorteo");
    tituloRenderizadoSorteo = document.getElementById("tituloRenderizadoSorteo");
    rejillaEquiposSorteo = document.getElementById("rejillaEquiposSorteo");
    botonVolverSorteo = document.getElementById("botonVolverSorteo");

    const elementosRequeridos = {
      areaParticipantes, contadorParticipantes, avisoLimiteSorteo, mensajeErrorSorteo,
      modoCantidadEquipos, modoParticipantesPorEquipo, selectorCantidadEquipos, tituloEquipos,
      botonLimpiarSorteo, botonGenerarEquipos, pantallaConfiguracionSorteo, pantallaResultadosSorteo,
      subtituloResultadosSorteo, tituloRenderizadoSorteo, rejillaEquiposSorteo, botonVolverSorteo
    };
    const faltantes = Object.keys(elementosRequeridos).filter(function (clave) {
      return !elementosRequeridos[clave];
    });
    if (faltantes.length > 0) {
      console.error("SorteoEquipos: faltan elementos en el HTML con id:", faltantes);
      return;
    }

    cargarParticipantesGuardados();
    repoblarSelectorCantidad();
    actualizarContadorYValidacion();
    vincularEventos();
  }

  /* API pública: main.js (Alumno 1) usa esto para F4 (exportar/copiar) */
  return {
    inicializar: inicializar,
    obtenerEquiposGenerados: function () { return equiposGenerados; },
    obtenerTituloSorteo: function () { return tituloDelSorteo; }
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  SorteoEquipos.inicializar();
});