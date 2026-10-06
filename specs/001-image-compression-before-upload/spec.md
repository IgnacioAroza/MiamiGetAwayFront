---
spec_number: 001
spec_slug: image-compression-before-upload
spec_created_at: 2026-10-06T00:00:00Z
spec_status: draft
---

# Spec 001 — Compresión de imágenes antes de subirlas

## Contexto y objetivo
El backend corre en Render Starter (512 MB de RAM) y entre el 29/09 y el 05/10/2026 fue
terminado 3 veces por falta de memoria, coincidiendo con cargas de listados con
imágenes. Hoy el panel envía las fotos originales tal como salen del celular (3–8 MB
cada una, hasta 30 por listado). El objetivo es que el panel reduzca las imágenes antes
de enviarlas, para que la carga sea más liviana y rápida y el backend procese menos
datos por carga. El límite por archivo del backend se mantiene en 10 MB.
Esta spec es la mitad front de un cambio en dos partes; la otra mitad es
`MiamiGetAwayBack/specs/001-image-upload-memory-safety`. **Esta spec se despliega
primero.**

## Usuarios / actores
- Admins del cliente que cargan y editan listados y comprobantes desde el panel.

## Historias de usuario
- H1: Como admin quiero subir las fotos tal como salen de mi celular, sin achicarlas a
  mano, para cargar listados rápido.
- H2: Como admin quiero saber qué imagen falló y por qué, para corregir solo esa.

## Requisitos funcionales (EARS)
- RF-1: CUANDO un admin selecciona imágenes en cualquier formulario del panel que sube
  imágenes, EL SISTEMA las redimensiona a un máximo de 1920 px en su lado mayor antes
  de enviarlas.
- RF-2: CUANDO un admin selecciona imágenes en cualquier formulario del panel que sube
  imágenes, EL SISTEMA las comprime a un tamaño objetivo de ~1 MB por imagen antes de
  enviarlas.
- RF-3: SI una imagen ya mide 1920 px o menos en su lado mayor y pesa 1 MB o menos,
  ENTONCES EL SISTEMA la envía sin recomprimir.
- RF-4: EL SISTEMA aplica RF-1 y RF-2 en los formularios de departamentos, villas,
  yates, autos, experiencias, inversiones, vehículos de traslado, pagos de reserva y
  pagos a proveedor.
- RF-5: MIENTRAS procesa las imágenes seleccionadas, EL SISTEMA muestra que está
  procesando.
- RF-6: MIENTRAS procesa las imágenes seleccionadas, EL SISTEMA impide enviar el
  formulario.
- RF-7: EL SISTEMA no permite seleccionar más de 30 imágenes por departamento, villa,
  yate, auto, experiencia o inversión.
- RF-8: EL SISTEMA no permite seleccionar más de 20 imágenes por vehículo de traslado.
- RF-9: EL SISTEMA no permite seleccionar más de 5 comprobantes por pago a proveedor ni
  más de 1 por pago de reserva.
- RF-10: SI el backend rechaza o no logra subir alguna imagen, ENTONCES EL SISTEMA
  muestra al admin qué imágenes fallaron y el motivo.
- RF-11: SI una imagen comprimida sigue pesando más de 10 MB, ENTONCES EL SISTEMA avisa
  al admin cuál imagen es antes de enviar el formulario.

## Requisitos no funcionales
- Calidad: las imágenes comprimidas se ven sin pérdida perceptible en el listado y la
  galería de la web.
- Rendimiento: procesar 30 fotos de celular no bloquea la interfaz del panel.
- Mensajes al admin en ES y EN (i18n existente, sin textos hardcodeados).
- El orden de las imágenes elegido por el admin (drag and drop) se conserva.
- Pruebas: ninguna prueba de esta spec escribe en la base de datos ni en el
  almacenamiento de producción (el backend local apunta a producción).

## Casos límite
- Formatos que el navegador no puede decodificar para comprimir (p. ej. HEIC de iPhone).
- Fotos con orientación EXIF (giradas): se ven derechas después de comprimir.
- PNG con transparencia.
- GIF animado.
- Imagen corrupta que el navegador no puede abrir.
- Admin que agrega imágenes en tandas al mismo formulario.
- Edición de un listado con imágenes existentes más nuevas: solo se procesan las nuevas.

## Fuera de alcance
- Cambios en el backend (cubiertos por la spec 001 del Back).
- Recortar o editar imágenes en el panel.
- Subida directa del navegador al almacenamiento sin pasar por el backend.
- Reprocesar imágenes ya subidas.

## Criterios de finalización
- Todos los RF con test en verde.
- Demo manual: alta de una villa con 30 fotos de celular; cada imagen enviada pesa
  ~1 MB o menos y mide 1920 px o menos en su lado mayor.
- Demo manual: carga de comprobante de pago a proveedor y de pago de reserva con foto
  de celular.
- Desplegado en producción antes que la spec 001 del Back.

## Dudas abiertas
- [NECESITA ACLARACIÓN] ¿El cliente sube fotos HEIC desde iPhone? Si sí: ¿convertir en
  el navegador, aceptarlas sin comprimir, o rechazarlas con mensaje?
- [NECESITA ACLARACIÓN] ¿El panel hoy muestra el detalle de errores por imagen que
  devuelve el back, o solo un error genérico? (define el alcance de RF-10)
