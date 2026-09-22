/* ===========================================================
   sorteo.js
   Alcance:
     F1 - Lista de participantes + persistencia en localStorage
     F2 - Modo de división (cantidad de equipos / por equipo) + título
     F3 - Botón Generar + sorteo aleatorio + render con animaciones
     F4 - Exportar como JPG + Copiar al portapapeles + Copiar en columnas
   =========================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     CONSTANTES
  --------------------------------------------------------- */
  const CLAVE_LOCAL_STORAGE = "sorteoEquipos.participantes";
  const CLAVE_LOCAL_STORAGE_TITULO = "sorteoEquipos.titulo";
  const MAXIMO_PARTICIPANTES = 100;
  const MAXIMO_CARACTERES_POR_LINEA = 50;
  const RETARDO_ANIMACION_INTEGRANTE_MS = 90;
  const RETARDO_ANIMACION_EQUIPO_MS = 120;
  const LIMITE_SUPERIOR_SELECTOR = 20;

  /* ---------------------------------------------------------
     REFERENCIAS AL DOM
  --------------------------------------------------------- */
  const areaParticipantes = document.getElementById("areaParticipantes");
  const contadorParticipantes = document.getElementById("contadorParticipantes");
  const avisoLimite = document.getElementById("avisoLimite");
  const mensajeError = document.getElementById("mensajeError");

  const modoCantidadEquipos = document.getElementById("modoCantidadEquipos");
  const modoParticipantesPorEquipo = document.getElementById("modoParticipantesPorEquipo");
  const selectorCantidad = document.getElementById("selectorCantidad");
  const tituloEquipos = document.getElementById("tituloEquipos");

  const botonLimpiar = document.getElementById("botonLimpiar");
  const botonGenerar = document.getElementById("botonGenerar");

  const pantallaConfiguracion = document.getElementById("pantallaConfiguracion");
  const pantallaResultados = document.getElementById("pantallaResultados");
  const subtituloResultados = document.getElementById("subtituloResultados");
  const tituloRenderizado = document.getElementById("tituloRenderizado");
  const rejillaEquipos = document.getElementById("rejillaEquipos");

  const botonDescargarJpg = document.getElementById("botonDescargarJpg");
  const botonCopiarPortapapeles = document.getElementById("botonCopiarPortapapeles");
  const botonCopiarColumnas = document.getElementById("botonCopiarColumnas");
  const estadoCopiado = document.getElementById("estadoCopiado");
  const botonVolver = document.getElementById("botonVolver");

  /* Guarda el último resultado del sorteo, para exportar/copiar */
  let equiposGenerados = [];
  let tituloDelSorteo = "";

  /* ---------------------------------------------------------
     PERSISTENCIA EN LOCALSTORAGE (F1)
  --------------------------------------------------------- */
  function cargarParticipantesGuardados() {
    const textoGuardado = localStorage.getItem(CLAVE_LOCAL_STORAGE);
    if (textoGuardado !== null) {
      areaParticipantes.value = textoGuardado;
    }
    const tituloGuardado = localStorage.getItem(CLAVE_LOCAL_STORAGE_TITULO);
    if (tituloGuardado !== null) {
      tituloEquipos.value = tituloGuardado;
    }
  }

  function guardarParticipantesEnStorage() {
    localStorage.setItem(CLAVE_LOCAL_STORAGE, areaParticipantes.value);
  }

  function guardarTituloEnStorage() {
    localStorage.setItem(CLAVE_LOCAL_STORAGE_TITULO, tituloEquipos.value);
  }

  /* ---------------------------------------------------------
     UTILIDADES DE LISTA DE PARTICIPANTES
  --------------------------------------------------------- */
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
    const lineaDemasiadoLarga = listaActual.some(function (nombre) {
      return nombre.length > MAXIMO_CARACTERES_POR_LINEA;
    });
    if (lineaDemasiadoLarga) {
      textoAviso += (textoAviso ? " " : "") +
        "Hay un nombre con más de " + MAXIMO_CARACTERES_POR_LINEA + " caracteres.";
    }
    avisoLimite.textContent = textoAviso;
  }

  areaParticipantes.addEventListener("input", function () {
    guardarParticipantesEnStorage();
    actualizarContadorYValidacion();
    mensajeError.textContent = "";
  });

  tituloEquipos.addEventListener("input", guardarTituloEnStorage);

  /* ---------------------------------------------------------
     SELECTOR DE CANTIDAD (F2)
  --------------------------------------------------------- */
  function repoblarSelectorCantidad() {
    const valorPrevio = selectorCantidad.value;
    selectorCantidad.innerHTML = "";

    const esModoCantidadEquipos = modoCantidadEquipos.checked;

    for (let numero = 2; numero <= LIMITE_SUPERIOR_SELECTOR; numero++) {
      const opcion = document.createElement("option");
      opcion.value = String(numero);
      opcion.textContent = esModoCantidadEquipos
        ? (numero + " equipos")
        : (numero + " participantes por equipo");
      selectorCantidad.appendChild(opcion);
    }

    if (valorPrevio && Number(valorPrevio) >= 2 && Number(valorPrevio) <= LIMITE_SUPERIOR_SELECTOR) {
      selectorCantidad.value = valorPrevio;
    } else {
      selectorCantidad.value = "2";
    }
  }

  modoCantidadEquipos.addEventListener("change", repoblarSelectorCantidad);
  modoParticipantesPorEquipo.addEventListener("change", repoblarSelectorCantidad);

  /* ---------------------------------------------------------
     BOTÓN LIMPIAR
  --------------------------------------------------------- */
  botonLimpiar.addEventListener("click", function () {
    areaParticipantes.value = "";
    tituloEquipos.value = "";
    localStorage.removeItem(CLAVE_LOCAL_STORAGE);
    localStorage.removeItem(CLAVE_LOCAL_STORAGE_TITULO);
    actualizarContadorYValidacion();
    mensajeError.textContent = "";
    areaParticipantes.focus();
  });

  /* ---------------------------------------------------------
     ALGORITMO DE SORTEO (F3)
  --------------------------------------------------------- */
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
    for (let indice = 0; indice < cantidadDeEquipos; indice++) {
      equipos.push([]);
    }
    listaMezclada.forEach(function (nombreParticipante, indice) {
      equipos[indice % cantidadDeEquipos].push(nombreParticipante);
    });
    return equipos;
  }

  function generarSorteoDeEquipos() {
    mensajeError.textContent = "";
    const listaParticipantes = obtenerListaParticipantes();

    if (listaParticipantes.length < 2) {
      mensajeError.textContent = "Ingresa al menos 2 participantes para poder sortear.";
      return;
    }
    if (listaParticipantes.length > MAXIMO_PARTICIPANTES) {
      mensajeError.textContent = "El máximo permitido es " + MAXIMO_PARTICIPANTES + " participantes.";
      return;
    }
    const hayNombreDemasiadoLargo = listaParticipantes.some(function (nombre) {
      return nombre.length > MAXIMO_CARACTERES_POR_LINEA;
    });
    if (hayNombreDemasiadoLargo) {
      mensajeError.textContent = "Hay nombres con más de " + MAXIMO_CARACTERES_POR_LINEA + " caracteres.";
      return;
    }

    const esModoCantidadEquipos = modoCantidadEquipos.checked;
    const valorSeleccionado = Number(selectorCantidad.value);
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

  botonGenerar.addEventListener("click", generarSorteoDeEquipos);

  /* ---------------------------------------------------------
     RENDERIZADO DE RESULTADOS
  --------------------------------------------------------- */
  function mostrarPantallaDeResultados() {
    pantallaConfiguracion.classList.add("oculta");
    pantallaResultados.classList.add("activa");
    estadoCopiado.classList.remove("visible");

    tituloRenderizado.textContent = tituloDelSorteo;
    const totalParticipantes = equiposGenerados.reduce(function (total, equipo) {
      return total + equipo.length;
    }, 0);
    subtituloResultados.textContent = equiposGenerados.length + " equipo(s) · " +
      totalParticipantes + " participante(s)";

    rejillaEquipos.innerHTML = "";

    equiposGenerados.forEach(function (integrantesDelEquipo, indiceEquipo) {
      const tarjetaEquipo = document.createElement("div");
      tarjetaEquipo.className = "tarjeta-equipo";
      tarjetaEquipo.style.animationDelay = (indiceEquipo * RETARDO_ANIMACION_EQUIPO_MS) + "ms";

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
          (indiceEquipo * RETARDO_ANIMACION_EQUIPO_MS) +
          (indiceIntegrante * RETARDO_ANIMACION_INTEGRANTE_MS) + 150;
        itemIntegrante.style.animationDelay = retardoTotal + "ms";
        listaIntegrantes.appendChild(itemIntegrante);
      });

      tarjetaEquipo.appendChild(listaIntegrantes);
      rejillaEquipos.appendChild(tarjetaEquipo);
    });
  }

  botonVolver.addEventListener("click", function () {
    pantallaResultados.classList.remove("activa");
    pantallaConfiguracion.classList.remove("oculta");
  });

  /* ---------------------------------------------------------
     F4.a - DESCARGAR RESULTADOS COMO JPG
  --------------------------------------------------------- */
  function descargarResultadosComoJpg() {
    if (equiposGenerados.length === 0) return;

    const anchoColumna = 260;
    const margen = 40;
    const alturaEncabezado = 90;
    const alturaPorIntegrante = 30;
    const espacioEntreEquipos = 24;

    const columnas = Math.min(equiposGenerados.length, 4);
    const filas = Math.ceil(equiposGenerados.length / columnas);

    const alturaMaximaEquipoPorFila = [];
    for (let fila = 0; fila < filas; fila++) {
      let alturaMaxima = 0;
      for (let columna = 0; columna < columnas; columna++) {
        const indice = fila * columnas + columna;
        if (indice < equiposGenerados.length) {
          const alturaEquipo = 50 + equiposGenerados[indice].length * alturaPorIntegrante;
          alturaMaxima = Math.max(alturaMaxima, alturaEquipo);
        }
      }
      alturaMaximaEquipoPorFila.push(alturaMaxima);
    }

    const anchoLienzo = margen * 2 + columnas * anchoColumna + (columnas - 1) * 20;
    const alturaLienzo = alturaEncabezado + margen +
      alturaMaximaEquipoPorFila.reduce(function (suma, altura) {
        return suma + altura + espacioEntreEquipos;
      }, 0);

    const lienzo = document.createElement("canvas");
    lienzo.width = anchoLienzo;
    lienzo.height = alturaLienzo;
    const contexto = lienzo.getContext("2d");

    contexto.fillStyle = "#ffffff";
    contexto.fillRect(0, 0, anchoLienzo, alturaLienzo);

    contexto.fillStyle = "#9c1560";
    contexto.font = "bold 26px Segoe UI, Arial, sans-serif";
    contexto.textAlign = "center";
    contexto.fillText(tituloDelSorteo, anchoLienzo / 2, 46);

    contexto.fillStyle = "#5a5870";
    contexto.font = "14px Segoe UI, Arial, sans-serif";
    contexto.fillText(equiposGenerados.length + " equipo(s)", anchoLienzo / 2, 70);

    let posicionYFila = alturaEncabezado;
    for (let fila = 0; fila < filas; fila++) {
      const alturaFila = alturaMaximaEquipoPorFila[fila];
      for (let columna = 0; columna < columnas; columna++) {
        const indiceEquipo = fila * columnas + columna;
        if (indiceEquipo >= equiposGenerados.length) continue;

        const integrantes = equiposGenerados[indiceEquipo];
        const posicionX = margen + columna * (anchoColumna + 20);
        const alturaCaja = 50 + integrantes.length * alturaPorIntegrante;

        contexto.strokeStyle = "#dcdfec";
        contexto.lineWidth = 1.5;
        contexto.fillStyle = "#fbfbfd";
        dibujarRectanguloRedondeado(contexto, posicionX, posicionYFila, anchoColumna, alturaCaja, 10);
        contexto.fill();
        contexto.stroke();

        contexto.fillStyle = "#9c1560";
        contexto.font = "bold 14px Segoe UI, Arial, sans-serif";
        contexto.textAlign = "left";
        contexto.fillText("Equipo " + (indiceEquipo + 1), posicionX + 16, posicionYFila + 26);

        contexto.fillStyle = "#1c1b29";
        contexto.font = "14px Segoe UI, Arial, sans-serif";
        integrantes.forEach(function (nombre, indiceIntegrante) {
          contexto.fillText(
            recortarTexto(contexto, nombre, anchoColumna - 32),
            posicionX + 16,
            posicionYFila + 50 + indiceIntegrante * alturaPorIntegrante
          );
        });
      }
      posicionYFila += alturaFila + espacioEntreEquipos;
    }

    lienzo.toBlob(function (blobImagen) {
      const enlaceDescarga = document.createElement("a");
      enlaceDescarga.href = URL.createObjectURL(blobImagen);
      enlaceDescarga.download =
        (tituloDelSorteo || "equipos").replace(/[^a-z0-9\-_]+/gi, "_") + ".jpg";
      document.body.appendChild(enlaceDescarga);
      enlaceDescarga.click();
      document.body.removeChild(enlaceDescarga);
    }, "image/jpeg", 0.95);
  }

  function dibujarRectanguloRedondeado(contexto, x, y, ancho, alto, radio) {
    contexto.beginPath();
    contexto.moveTo(x + radio, y);
    contexto.arcTo(x + ancho, y, x + ancho, y + alto, radio);
    contexto.arcTo(x + ancho, y + alto, x, y + alto, radio);
    contexto.arcTo(x, y + alto, x, y, radio);
    contexto.arcTo(x, y, x + ancho, y, radio);
    contexto.closePath();
  }

  function recortarTexto(contexto, texto, anchoMaximo) {
    if (contexto.measureText(texto).width <= anchoMaximo) return texto;
    let textoRecortado = texto;
    while (textoRecortado.length > 1 && contexto.measureText(textoRecortado + "…").width > anchoMaximo) {
      textoRecortado = textoRecortado.slice(0, -1);
    }
    return textoRecortado + "…";
  }

  botonDescargarJpg.addEventListener("click", descargarResultadosComoJpg);

  /* ---------------------------------------------------------
     F4.b - COPIAR RESULTADO AL PORTAPAPELES (texto legible)
  --------------------------------------------------------- */
  function construirTextoLegible() {
    const lineas = [tituloDelSorteo, ""];
    equiposGenerados.forEach(function (integrantes, indiceEquipo) {
      lineas.push("Equipo " + (indiceEquipo + 1) + ":");
      integrantes.forEach(function (nombre) {
        lineas.push("- " + nombre);
      });
      lineas.push("");
    });
    return lineas.join("\n").trim();
  }

  /* ---------------------------------------------------------
     F4.c - COPIAR EN COLUMNAS (formato tabulado)
  --------------------------------------------------------- */
  function construirTextoEnColumnas() {
    const encabezados = equiposGenerados.map(function (_, indiceEquipo) {
      return "Equipo " + (indiceEquipo + 1);
    });
    const filasMaximas = Math.max.apply(null, equiposGenerados.map(function (equipo) {
      return equipo.length;
    }));

    const filas = [encabezados.join("\t")];
    for (let indiceFila = 0; indiceFila < filasMaximas; indiceFila++) {
      const valoresDeLaFila = equiposGenerados.map(function (equipo) {
        return equipo[indiceFila] !== undefined ? equipo[indiceFila] : "";
      });
      filas.push(valoresDeLaFila.join("\t"));
    }
    return filas.join("\n");
  }

  function copiarAlPortapapeles(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(mostrarConfirmacionCopiado);
    } else {
      const areaTemporal = document.createElement("textarea");
      areaTemporal.value = texto;
      areaTemporal.style.position = "fixed";
      areaTemporal.style.opacity = "0";
      document.body.appendChild(areaTemporal);
      areaTemporal.select();
      document.execCommand("copy");
      document.body.removeChild(areaTemporal);
      mostrarConfirmacionCopiado();
    }
  }

  function mostrarConfirmacionCopiado() {
    estadoCopiado.classList.add("visible");
    setTimeout(function () {
      estadoCopiado.classList.remove("visible");
    }, 2000);
  }

  botonCopiarPortapapeles.addEventListener("click", function () {
    copiarAlPortapapeles(construirTextoLegible());
  });

  botonCopiarColumnas.addEventListener("click", function () {
    copiarAlPortapapeles(construirTextoEnColumnas());
  });

  /* ---------------------------------------------------------
     INICIALIZACIÓN
  --------------------------------------------------------- */
  cargarParticipantesGuardados();
  repoblarSelectorCantidad();
  actualizarContadorYValidacion();

})();