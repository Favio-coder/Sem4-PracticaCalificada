// feature/ruleta-editor
// F5, F6, F7, F8 y F9

document.addEventListener("DOMContentLoaded", () => {

    // ELEMENTOS DEL HTML


    const textarea = document.getElementById("listaElementos");

    if (!textarea) {
        console.warn("No se encontró el textarea #listaElementos");
        return;
    }

    // CONFIGURACIÓN

    const CLAVE_LOCAL_STORAGE = "elementosRuleta";

    // Elementos que ya fueron sorteados y ocultados
    let elementosOcultos = [];

    // Último elemento seleccionado por la ruleta
    let ultimoElementoSeleccionado = null;


});