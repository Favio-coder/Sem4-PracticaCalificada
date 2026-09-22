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

     // F6 - OBTENER ELEMENTOS DEL TEXTAREA

    function obtenerElementos() {

        return textarea.value
            .split("\n")
            .map(elemento => elemento.trim())
            .filter(elemento => elemento !== "");
    }

    // F6 - ACTUALIZAR LA RULETA

    function actualizarRuletaDesdeEditor() {

        guardarDatos();

        const elementos = obtenerElementos();

        /*el nombre de su función podremos reemplazar esta llamada por el nombre exacto */

        if (typeof window.actualizarRuleta === "function") {

            window.actualizarRuleta(elementos);

        } else {

            document.dispatchEvent(
                new CustomEvent("datosRuletaActualizados", {
                    detail: {
                        elementos: elementos
                    }
                })
            );
        }
    }
    // F7 - REGISTRAR ÚLTIMO ELEMENTO SORTEADO

    function registrarElementoSeleccionado(elemento) {

        if (!elemento) {
            return;
        }

        ultimoElementoSeleccionado = elemento.trim();

        console.log(
            "Último elemento sorteado:",
            ultimoElementoSeleccionado
        );
    }

    // F7 - OCULTAR ELEMENTO SORTEADO

    function ocultarUltimoElemento() {

        if (!ultimoElementoSeleccionado) {
            console.warn("No existe un elemento sorteado.");
            return;
        }

        if (!elementosOcultos.includes(ultimoElementoSeleccionado)) {

            elementosOcultos.push(
                ultimoElementoSeleccionado
            );
        }

        actualizarElementosDisponibles();

        console.log(
            "Elemento ocultado:",
            ultimoElementoSeleccionado
        );
    }

    // F7 - ACTUALIZAR ELEMENTOS DISPONIBLES

    function actualizarElementosDisponibles() {

        const elementos = obtenerElementos();

        const elementosDisponibles = elementos.filter(
            elemento =>
                !elementosOcultos.includes(elemento)
        );


        if (typeof window.actualizarRuleta === "function") {

            window.actualizarRuleta(
                elementosDisponibles
            );

        } else {

            document.dispatchEvent(
                new CustomEvent("elementosRuletaActualizados", {
                    detail: {
                        elementos: elementosDisponibles
                    }
                })
            );
        }
    }

    // F7 - TECLA S

    function procesarTeclaS() {

        ocultarUltimoElemento();
    }


   
});