# Progreso al pausar — 2026-10-06

Rama: `IgnacioAroza/spec-001-image-compression`. No se pusheó ni se abrió PR. No se hicieron subidas reales.

## Tareas hechas

| Tarea de `tasks.md` | Commit |
|---|---|
| 1. Compresión nativa y tests | `70d41ab` |
| 2. Cola compartida, límites y tests | `68f0d11` |
| 3. Departamentos e `ImageUploader` | `727733a` |
| 4. Autos, yates y villas | `ea1e28d` |
| 5. Experiencias e inversiones | `58ecde1` |
| 6. Vehículos de traslado | `fb75757` |
| 7. Pagos de reserva | `2f34c56` |
| 8. Pagos a proveedor | `d8359a7` |
| 9. Errores por imagen del backend | `040d800` |
| 10. Traducciones, límites, tests, build y plan | `bc77466` |

Verificación final: `npm test` con 13 tests verdes; `npm run build` verde; `git diff --check` limpio. `npm run lint` global sigue fallando por errores preexistentes en `ExperienceList`, `InvestmentList`, `TransferList` y `BookingForm`; los archivos nuevos y el núcleo modificado pasaron ESLint dirigido.

## Tarea siguiente

Al retomar: completar una prueba manual aislada en navegador con fotos reales o fixtures, sin enviar requests al backend, y revisar la tabla RF-1..RF-11 contra el comportamiento visible. Un intento de prueba automatizada en Chrome headless con 30 imágenes generadas quedó detenido antes de devolver resultados; se canceló y se borró el archivo temporal. Si esa prueba descubre un fallo, corregirlo, repetir tests/build y commitear. Después entregar la tabla de evidencias.

## Decisiones tomadas

- HEIC que el navegador no decodifica: rechazar con mensaje claro. Confirmado por Ignacio.
- Sin dependencia de compresión: `createImageBitmap` + Canvas, una imagen por vez. Originales dentro de 1920 px y 1 MiB pasan intactos.
- GIF pequeño pasa intacto; GIF que requiere compresión se rechaza para conservar animación. PNG conserva transparencia. PDF de proveedor pasa intacto si no supera 10 MiB.
- Límite total: 30 para listados, 20 para traslado, 5 para proveedor, 1 para pago de reserva.
- Errores `details` del backend se vinculan por índice o nombre. Un error general muestra los nombres enviados como grupo, sin atribuir una imagen específica.
- `existingImages` sigue como un único JSON; el orden drag and drop dentro de cada grupo se conserva.

## Pendientes y preguntas

- Pendiente la prueba manual aislada y la tabla RF final. No hay preguntas de producto abiertas.
- El despliegue en producción sigue pendiente: el pedido prohíbe pushear. El front debe publicarse antes de la spec gemela del Back.
- No ejecutar pruebas de carga contra el backend local: su base y Cloudinary apuntan a producción.
