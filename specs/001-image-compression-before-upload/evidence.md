# Evidencia — RF-1 a RF-11

Verificación aislada del 06/10/2026 en Chrome 154.0.8037.98. Se sirvieron páginas temporales con Vite en `127.0.0.1`, se generaron imágenes en Canvas y se reemplazaron las funciones HTTP antes de simular envíos. Las páginas temporales se borraron. Resultado medido: **0 requests a `/api/`**. No se escribió en base de datos ni Cloudinary.

| RF | Evidencia | Resultado |
|---|---|---|
| 1 | Chrome: 30 fotos de 2500×1500 resultaron 1920×1152; foto de 2200×1400 resultó 1920×1222. `tests/compressImage.test.js` cubre dimensiones verticales. | Pasa |
| 2 | Chrome: JPEG sintético de 8.991.549 bytes resultó 811.052 bytes. Las 30 fotos quedaron en 24.346 bytes o menos. | Pasa con fixtures |
| 3 | Chrome: foto de 800×600 y menos de 1 MiB conservó identidad de `File` (`smallUnchanged: true`). | Pasa |
| 4 | Auditoría de los nueve tipos en `ApartmentForm`, `ServicesPage`, `ExperienceList`, `InvestmentList`, `TransferList`, `PaymentSection`, `PaymentsForm`, `SupplierPayoutSection` y `SupplierPayoutView`: todos usan `useImageFiles` antes de construir `FormData`. Chrome montó los formularios reales de departamentos, pago de reserva y pago a proveedor con API simulada. | Pasa; los otros formularios se verificaron por código |
| 5 | Chrome, departamento: apareció «Procesando imágenes»; cola de 30 informó progreso y finalizó. Lo mismo se observó en ambos comprobantes. | Pasa |
| 6 | Chrome: guardar departamento y registrar ambos pagos quedaron deshabilitados durante el procesamiento; se habilitaron al terminar. Auditoría de guards `canSubmit` y botones en los demás formularios. | Pasa |
| 7 | Chrome: departamento aceptó 30 imágenes y mostró error para la 31; tests de cola para máximo 30. Auditoría de límite 30 en servicios, experiencias e inversiones. | Pasa |
| 8 | `tests/useImageFiles.test.js` prueba máximo 20 y error por exceso. Auditoría de `TransferList`. | Pasa por test y código |
| 9 | Tests prueban máximos 5 y 1. Chrome: pago de reserva entregó una foto procesada; proveedor entregó foto procesada más PDF intacto. Auditoría de ambas vistas de proveedor y pagos. | Pasa |
| 10 | Chrome: respuesta HTTP simulada con `details: ['Error subiendo imagen 2: Cloudinary falló']` mostró `villa-2.jpg: Cloudinary falló`; se enviaron 30 archivos al mock y 0 a la API. Tests cubren índice, nombre y error general. | Pasa con mock |
| 11 | `tests/compressImage.test.js` simula un PNG que sigue en 11 MiB tras comprimir y verifica error `tooLarge`. La cola muestra nombre y bloquea envío hasta descartar el aviso. Chrome verificó el bloqueo y el mensaje de límite de cantidad; el caso de 10 MiB se cubrió en unit. | Pasa por test y código |

Comprobaciones adicionales: PNG mantuvo `image/png` y alpha 102/255 tras redimensionar; HEIC inválido devolvió `heic`; el mensaje de límite se vio en ES y EN; el PDF conservó identidad de `File`; el orden terminó en `foto-30.jpg`.

Límites de esta evidencia: las imágenes se generaron en Canvas, no provinieron de un iPhone; la orientación EXIF se probó con decodificador simulado. No se hizo alta real de villa ni carga real de pagos por la conexión del backend local con producción. Despliegue pendiente por la prohibición de push.
