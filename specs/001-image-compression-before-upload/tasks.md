# Tareas — cada una menor a 30 minutos

Cada tarea de implementación termina con tests pertinentes, `npm run build` y un commit Conventional Commits en español. No usar la API real en pruebas.

| Tarea | Cambio | RF | Verificación |
|---|---|---|---|
| 1 | Utilidad nativa de decodificación, orientación, resize y compresión; rechazo HEIC/corruptos/GIF que requiera recodificación; límite de 10 MiB | 1, 2, 3, 11 | `node:test`: dimensiones, peso, paso sin cambios, alpha, fallos y límite |
| 2 | Hook para selección en tandas, cola secuencial, progreso, límites, errores y descarte al cerrar | 5, 6, 7, 8, 9, 11 | `node:test` con procesador falso: estado, orden, límites, cancelación |
| 3 | `ImageUploader` y apartamentos: cola, 30 imágenes contando URLs, estado visible y guardado bloqueado | 4, 5, 6, 7 | Tests de estado/FormData y revisión de `existingImages` JSON y drag and drop |
| 4 | Autos, yates y villas en `ServicesPage`: misma cola y límite 30 | 4, 5, 6, 7 | Tests de selección en tandas, orden final y bloqueo |
| 5 | Experiencias e inversiones: selección procesada, tope 30 y guardado bloqueado | 4, 5, 6, 7 | Tests de ambos `FormData` y estados de error |
| 6 | Vehículos de traslado: selección procesada, tope 20 y guardado bloqueado | 4, 5, 6, 8 | Tests de límite 20 y `FormData` |
| 7 | Pagos de reserva en `PaymentSection` y `PaymentsForm`: una imagen procesada, con estados y bloqueo | 4, 5, 6, 9 | Tests de ambos flujos y archivo enviado |
| 8 | Pagos a proveedor en ambas vistas: máximo 5; comprimir imágenes y preservar PDF | 4, 5, 6, 9 | Tests de selección mixta, tandas, máximo 5 y estados |
| 9 | Propagar `details` sin perder el mensaje general; mostrar nombre y motivo por imagen en cada formulario | 10 | Tests con errores indexados, nombrados y generales simulados; ningún request real |
| 10 | Textos ES/EN, barrido de los nueve tipos de formulario y regresión final | 4, 5, 6, 7, 8, 9, 10, 11 | `npm test`, `npm run build`; demo local aislada de 30 fotos, comprobantes, orientación y transparencia |

Entrega: tabla RF-1..RF-11 con test/evidencia. Publicación en producción queda pendiente porque esta tarea prohíbe pushear.
