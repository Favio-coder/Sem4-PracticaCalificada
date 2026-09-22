# feature/sorteo-equipos - CAMARGO ALVARADO

## Alcance de esta rama

Implementa la lógica del **sorteo de equipos** (Práctica Calificada 3, ejercicio 2), funcionalidades **F1, F2 y F3**:

- **F1** — Lista de participantes en textarea (máx. 100, 50 caracteres c/u), con guardado y recuperación automática desde `localStorage`.
- **F2** — Selección del modo de división (cantidad de equipos / participantes por equipo) mediante lista desplegable, y título del sorteo.
- **F3** — Botón **Generar**: sorteo aleatorio (Fisher–Yates) y renderizado de los equipos, con los integrantes apareciendo uno a uno dentro de un rectángulo por equipo con subtítulo "Equipo N".

**Fuera de alcance** (no está en esta rama):
- F4 (descargar JPG, copiar al portapapeles, copiar en columnas) → rama `feature/integracion-ui`, `js/main.js`.
- Todo lo de la ruleta → ramas `feature/ruleta-giro` y `feature/ruleta-editor`.
- `index.html` y `css/styles.css` → rama `feature/integracion-ui`.

## Archivo

```
js/sorteo.js
```

Módulo autocontenido (`window.SorteoEquipos`) que no crea HTML: busca los elementos por `id` en el DOM ya existente y engancha sus propios eventos. Se inicializa solo al disparase `DOMContentLoaded`.

## Contrato de integración (IDs esperados en `index.html`)

| Elemento | id |
|---|---|
| Textarea participantes | `areaParticipantes` |
| Contador de participantes | `contadorParticipantes` |
| Aviso de límite | `avisoLimiteSorteo` |
| Mensaje de error | `mensajeErrorSorteo` |
| Radio "cantidad de equipos" | `modoCantidadEquipos` |
| Radio "participantes por equipo" | `modoParticipantesPorEquipo` |
| Select de cantidad | `selectorCantidadEquipos` |
| Input título | `tituloEquipos` |
| Botón limpiar | `botonLimpiarSorteo` |
| Botón generar | `botonGenerarEquipos` |
| Contenedor pantalla 1 (config) | `pantallaConfiguracionSorteo` |
| Contenedor pantalla 2 (resultados) | `pantallaResultadosSorteo` |
| Subtítulo resultados | `subtituloResultadosSorteo` |
| Título renderizado | `tituloRenderizadoSorteo` |
| Rejilla de equipos | `rejillaEquiposSorteo` |
| Botón volver | `botonVolverSorteo` |

Si falta algún id, el módulo lo reporta por consola (`console.error`) en vez de fallar en silencio.

## API pública (para `main.js`, F4)

```js
SorteoEquipos.obtenerEquiposGenerados(); // -> array de arrays de strings, un array por equipo
SorteoEquipos.obtenerTituloSorteo();     // -> string, título del último sorteo generado
```

Ambas devuelven el resultado del **último** sorteo generado (vacío/"" si aún no se generó ninguno).

## CSS esperado

`js/sorteo.js` asume que `css/styles.css` define las clases:
`oculta`, `activa`, `tarjeta-equipo`, `subtitulo-equipo`, `lista-integrantes`.
(Ver `prueba-sorteo.html` para un ejemplo mínimo de cada una.)

## Cómo probar esta rama de forma aislada

1. Abrir `prueba-sorteo.html` (arnés de prueba local, no se entrega) en el navegador — replica el contrato de IDs sin depender de las demás ramas.
2. Probar: escribir participantes, recargar la página (deben persistir), cambiar de modo, generar equipos, volver a editar.

## Checklist antes de hacer push

- [ ] Probado con 2, con número impar y con más de 20 participantes.
- [ ] Probado en ambos modos (cantidad de equipos / participantes por equipo).
- [ ] Verificado que el textarea recupera los datos tras refrescar (F5).
- [ ] Sin librerías externas, solo HTML/CSS/JS puro.
- [ ] Nombres de funciones y variables descriptivos en español.