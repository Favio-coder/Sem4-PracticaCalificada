const inicio = document.getElementById("inicio")


const btnParte1 = document.getElementById("btnParte1")
const btnParte2 = document.getElementById("btnParte2")

const btnFullscreen = document.getElementById("btnFullscreen")

function irParte1() {
    // alert("Funciona parte 1")
    window.location.href = "/parte1/ruleta.html"
}

function irParte2() {
    //alert("Funciona parte 2")
    window.location.href = "/parte2/sorteo.html"
}

/* Asignación de funciones a botones */
btnParte1.addEventListener("click", irParte1);
btnParte2.addEventListener("click", irParte2);

// Pantalla Completa
btnFullscreen.addEventListener("click", () => {

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }

})