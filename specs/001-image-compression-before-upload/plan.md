# Plan — compresión antes de subir

## Decisiones cerradas

- HEIC que el navegador no pueda decodificar: rechazar ese archivo con mensaje claro. Decisión de Ignacio del 06/10/2026.
- El panel hoy no muestra detalle por imagen: `ImageUploader` no maneja errores; apartamentos sólo registran el fallo en consola; otros formularios muestran un mensaje general. Los thunks y servicios descartan `response.data.details`. RF-10 requiere conservar y presentar ese detalle.
- No enviar archivos a un backend local ni de producción durante las pruebas: ambos pueden escribir en la base y Cloudinary de producción.

## Enfoque

Usar APIs nativas del navegador (`createImageBitmap` con orientación EXIF, Canvas y `toBlob`) sin dependencia de compresión. Procesar archivos en secuencia y ceder el hilo entre archivos para que 30 fotos no congelen el panel. Conservar un original si mide hasta 1920 px y pesa hasta 1 MiB. Para los demás, limitar el lado mayor a 1920 px y ajustar calidad JPEG o escala PNG hasta apuntar a 1 MiB; conservar transparencia PNG. Nunca enviar un resultado mayor que 10 MiB. Mantener el nombre y orden del archivo en el `FormData`; si cambia el formato, ajustar extensión y MIME.

Un hook compartido manejará selección en tandas, progreso, errores por archivo, límite total, cancelación lógica al cerrar/cambiar formulario y bloqueo de guardado. La compresión se hará al seleccionar, sólo para archivos nuevos; URLs existentes y `existingImages` JSON no se tocan. GIF animado: conservarlo si ya satisface tamaño y dimensiones; si requiere reprocesamiento, rechazarlo con mensaje específico para no perder la animación. Archivos corruptos y HEIC no decodificables se rechazan, sin subirlos. Los PDF de comprobantes de proveedor siguen sin compresión de imagen, pero sí sujetos al límite de cantidad y 10 MiB.

Para RF-10, conservar `details` del backend y mapear errores como `Error subiendo imagen N` al archivo N del `FormData`, respetando el orden. Para respuestas con nombre de archivo, usar ese nombre. Cuando el servidor sólo dé un error general, mostrar el motivo y los nombres enviados como grupo; no atribuir una falla individual sin evidencia. Esto funciona con el backend actual y permite desplegar el front primero.

Tests: `node:test` de la stdlib, con mocks de decodificación, Canvas y API; sin paquetes de test nuevos. Probar compresión, límites, orden, errores y estados de procesamiento. `npm run build` al cerrar cada tarea que cambie código. Demo manual aislada en navegador con fotos locales y requests interceptados o sin pulsar guardar; nunca contra la API real.

## Archivos previstos

- Nuevos: `src/utils/compressImage.js`, `src/hooks/useImageFiles.js`, `src/utils/imageUploadErrors.js`, tests junto a esos módulos o en `tests/`.
- Listados: `src/components/images/ImageUploader.jsx`, `src/components/admin/apartments/ApartmentForm.jsx`, `src/components/admin/services/ServicesPage.jsx`, `src/components/admin/experiences/ExperienceList.jsx`, `src/components/admin/investments/InvestmentList.jsx`, `src/components/admin/transfers/TransferList.jsx`.
- Comprobantes: `src/components/admin/reservations/sections/PaymentSection.jsx`, `src/components/admin/payments/PaymentsForm.jsx`, `src/components/admin/suppliers/SupplierPayoutSection.jsx`, `src/components/admin/suppliers/SupplierPayoutView.jsx`.
- Propagación de errores: thunks de `adminApartmentSlice`, `serviceSlice`, `experienceSlice`, `investmentSlice`, `transferVehicleSlice`, `reservationPaymentSlice` y servicios `reservationService`, `reservationPaymentsService`, `supplierService`, según cada flujo real.
- UI ES/EN: `src/locales/es/translation.json`, `src/locales/en/translation.json`. `package.json` sólo para agregar `npm test` si conviene.

## Riesgos y límites

- Canvas puede consumir memoria en el navegador. Decodificar y codificar una imagen por vez; cerrar `ImageBitmap` y liberar URLs/Canvas. Imágenes extremas pueden fallar antes de comprimirse: mostrar error por archivo.
- La orientación EXIF depende de la implementación del navegador; probar una foto girada en la demo manual.
- PNG con mucha complejidad puede necesitar bajar de 1920 px para acercarse a 1 MiB. Si aun así excede 10 MiB, bloquear envío e identificar archivo.
- El backend actual devuelve errores de Cloudinary por índice, no siempre por nombre; el mapeo sólo es seguro si el error trae índice. Un error general no permite saber cuál falló.
- El contrato de proveedor documenta 5 comprobantes, aunque un componente hoy corta a 10 y una ruta del backend acepta 10. El front aplicará 5 según esta spec.
- `No pushear` impide desplegar desde esta tarea. La verificación en producción y la coordinación con la spec del Back quedan para la publicación posterior.
