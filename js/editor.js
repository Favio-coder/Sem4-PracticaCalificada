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

    // F5 - GUARDAR DATOS EN LOCAL STORAGE
    // ========================================================

    function guardarDatos() {

        localStorage.setItem(
            CLAVE_LOCAL_STORAGE,
            textarea.value
        );

        console.log("Datos guardados en localStorage");
    }

    // F5 - RECUPERAR DATOS DEL LOCAL STORAGE

    function recuperarDatos() {

        const datosGuardados =
            localStorage.getItem(CLAVE_LOCAL_STORAGE);

        if (datosGuardados !== null) {
            textarea.value = datosGuardados;
        }
    }

   
});