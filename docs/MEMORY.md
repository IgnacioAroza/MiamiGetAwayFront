# MEMORY — MiamiGetAwayFront

Estado actual del proyecto. Leer al inicio de cada sesión antes de tocar código.

---

## Estado de ramas (al 2026-07-23)

| Rama | Estado |
|------|--------|
| `main` | Producción — PR #42 mergeado (imágenes apartamentos + drag reorder). Alineada con `development` |
| `development` | Alineada con `main` (mismo commit `7358855`) |
| `feature/investments` | Eliminada — mergeada a `main` (PR #35) |
| `feature/experiences` | Eliminada — mergeada a `main` (PR #36) |
| `feature/transfers` | Eliminada — mergeada a `main` (PR #37, 2026-06-19) |

---

## Features en producción (`main`)

### Investments — en `main` (PR #35)
- Rutas públicas: `/investments`, `/investments/:id`
- Admin: `/admin/investments`
- `price === null` → "A consultar"; `unit_number === null` → no mostrar
- POST/PUT: `multipart/form-data`, campo `images` (máx 30). PUT con imágenes reemplaza todas
- WhatsApp en idioma activo del sitio
- Imagen en Services.jsx: `v1780519480/utils/Services/investments.jpg`

### Experiences — en `main` (PR #36)
- Rutas públicas: `/experiences`, `/experiences/:id`
- Admin: `/admin/experiences` (tabs: Experiences | Inquiries)
- `price === null` → "A consultar"; `capacity === null` → no mostrar
- POST/PUT: `multipart/form-data`, campo `images` (máx 30). PUT con imágenes reemplaza todas
- Inquiry form **público** (sin JWT): `{ experience_id, name, lastname, email, phone? }`
- Teléfono opcional — prefijo de país via restcountries.com, default +54; solo se adjunta si el usuario ingresa número
- Inquiry status: `pending` → `contacted` → `closed` (PATCH con JSON)
- `experience_title === null` en inquiry → consulta general (experience_id fue null)
- Imagen en Services.jsx: `v1780519480/utils/Services/experiences.jpg`

## Features en producción (`main`) — scope completo entregado

### Transfers — en `main` (PR #37, 2026-06-19)
- Mergeado tras pago del cliente. Pendiente: último pago para cierre del proyecto.
- Rutas públicas: `/transfers` (form-first), `/transfers/:id` (redirige a `/transfers`)
- Admin: `/admin/transfers` (tabs: Fleet | Inquiries)
- Página pública: hero → formulario de inquiry → fleet como referencia secundaria
- Vehicles: `category` → `sedan | suv | van`; `capacity` y `luggage_capacity` siempre requeridos
- POST/PUT: `multipart/form-data`, campo `images` (máx 20). PUT con imágenes reemplaza todas
- Inquiry form **público** (sin JWT): `{ vehicle_id?, pick_up, drop_off, date, time, passengers, luggage_large?, luggage_medium?, luggage_carry_on?, service_type, client_name, client_email, client_phone, notes? }`
- `date` se envía en `MM-DD-YYYY` — el input `type="date"` retorna `YYYY-MM-DD`, se convierte con `toApiDate()` antes de enviar
- `time` se envía en `HH:mm` — UI muestra select de intervalos de 15 min en formato 12h AM/PM
- `vehicle_id` es opcional — puede enviarse sin seleccionar vehículo
- Equipaje: `luggage_large`, `luggage_medium`, `luggage_carry_on` — number, default 0, opcionales
- Teléfono: prefijo de país via restcountries.com, default +54. Se concatena `${prefix} ${number}` antes de enviar
- Inquiry status: `pending` → `confirmed` → `cancelled` (PATCH con JSON)
- Status colors: pending=amarillo, confirmed=verde, cancelled=rojo
- InquiryList admin muestra columna "Pax / Luggage" con `N pax` y `L:x M:x CO:x`
- Imagen en Services.jsx: `v1780519480/utils/Services/transfers.jpg`

---

## Panel Admin — DashboardHeader

- Ítems principales: Home · Services · Reservations · Payments · Clients · Suppliers
- Dropdown **"Listings ▾"** agrupa: Apartments · Investments · Experiences · Transfers
- Mobile: drawer lateral con todos los ítems separados
- `NavBar.jsx` eliminado — era código muerto (no estaba importado en ningún lado)

---

## Deuda técnica pendiente (requiere cambios de backend)

- **Fix #17** — `reservationSlice`: `status` y `loading` coexisten. AdminDashboard, PaymentsForm y PaymentDetails consumen `loading` activamente. No tocar sin actualizar los 3 consumidores.
- **Fix #19** — JWT en localStorage → migrar a httpOnly cookies requiere endpoints nuevos en el backend
- **Fix #20** — `getProfile` llama `GET /admins` (lista completa). No existe `/admins/me` en el backend

---

## Reglas de negocio críticas (globales)

- **API client:** Siempre `src/utils/api.js`. Nunca `axios.create()` nuevo
- **FormData + números:** Si no hay file upload, usar JSON. `FormData.append` convierte a string y Zod rechaza `z.number()`
- **Imágenes:** Campo `images` en `multipart/form-data`, máx 30 archivos. No setear `Content-Type` manualmente
- **Auth admin:** JWT en `localStorage.adminToken`. Interceptor de `api.js` inyecta el header y maneja 401
- **Suppliers:** Totales en `assignment.calculated.*` — nunca calcular localmente. `supplier_status` viene del objeto reserva. Métodos de pago válidos: `cash`, `card`, `transfer`, `paypal`, `zelle`, `stripe`, `other` (`wire` eliminado desde 2026-06-23)
- **Datos de JOIN en normalizers:** Antes de hacer fetches secundarios, verificar si el backend ya incluye el campo en la respuesta principal vía JOIN. `clientName/clientLastname/clientEmail` en `/reservation-payments`, `apartmentName/apartmentAddress` en `/reservations` — todos ya venían del back. Fix: agregar al normalizer y eliminar los fetches secundarios.
- **buildingNames en ReservationList:** `reservation.apartmentName` viene del JOIN del backend — ya no hace falta fetch secundario de apartments (eliminado en 2026-06-24)
- **useEffect fetch on-mount:** Nunca poner `array.length` en el dep array para guardar un fetch. Usar siempre `[dispatch]` como dep array.
- **Paginación de reservas:** `rowsPerPageOptions` es `[5, 10, 20]` — máximo 20 por limitación del API. El localStorage se valida contra este array al inicializar.
- **Prefijo de teléfono:** Se usa restcountries.com (`/v3.1/all?fields=name,flags,idd`) para obtener países. Default Argentina (+54). En campos opcionales, solo se adjunta el prefijo si el usuario ingresa un número.
- **Errores de API — servicios lanzan strings:** Los servicios hacen `throw error.response?.data?.error || ... || 'fallback'` (string, no Error object). En thunks usar `extractMsg`: `typeof error === 'string' ? error : (error?.response?.data?.error || error?.message || fallback)`. En componentes: `typeof error === 'string' ? error : (error?.message || fallback)`. Nunca acceder a `error.message` directamente sobre el valor atrapado.
- **Variable shadowing en catch:** Si el componente usa `const { error } = useToast()`, NO nombrar `catch (error)` — pisa la función. Usar `catch (err)`.
- **PATCH vs PUT en reservas:** `reservationService.update` usa `api.patch` (actualización parcial). `api.put` solo para endpoints que requieren reemplazo completo.
- **PUT reserva — campos numéricos opcionales:** `cleaningFee`, `parkingFee`, `otherExpenses`, `taxes`, `amountPaid` usan `numberOrZero` en el normalizer (default `0` en vez de `undefined`). El back recalcula `totalAmount`, `amountDue` y `paymentStatus` internamente.
- **Flujo de pago:** El estado de pago se actualiza como efecto secundario de `registerPayment` (POST `/reservations/:id/payments` con `reservation_update`). No existe endpoint separado `PATCH /payment-status` — fue eliminado del back.
- **⚠️ Dev local apunta a producción:** el backend local (`localhost:3001`) usa la `DATABASE_URL` y las credenciales de Cloudinary de **producción** (no hay ambiente aislado). Probar borrados/creaciones solo con datos de prueba propios y limpiar después — ver detalle en `memory/2026-07-23.md`.
- **existingImages (apartments/cars/yachts/villas):** al actualizar, se manda como **un único campo JSON** (`JSON.stringify(array)`) con las URLs a conservar en el orden final deseado — no como campos `FormData` repetidos (era ambiguo con 0 o 1 imagen). El backend mergea eso con las imágenes nuevas subidas (que van siempre al final) y borra de Cloudinary lo que quede afuera.
- **Reorder de imágenes:** `ImageUploader.jsx` soporta drag and drop (`@dnd-kit`) pero solo permite reordenar dentro de cada grupo (existentes entre sí, nuevas entre sí) — ver `memory/2026-07-23.md`.
- **Orden de apartamentos en admin:** `/admin/apartments` y la pestaña Apartments de `/admin/services` piden `sort: 'recent'` al backend — los últimos cargados aparecen primero. El listado público (`/services/apartments`) no se tocó, sigue en orden `id ASC` (ya tiene filtros propios). No confundir: `ImageCarousel.jsx` NO tiene un ratio uniforme aplicado — se probó y se revirtió (ver `memory/2026-07-23.md` punto 5).

---

## Sesiones anteriores (detalle)

- [2026-07-23](memory/2026-07-23.md) — Fix imágenes de apartamentos (no se mostraban/borraban), contrato `existingImages` como JSON, fix blank screen al crear/editar yates, drag and drop para reordenar imágenes (PR #42, requiere PR #46 del backend); más tarde: investigación de aspect ratio en `ImageCarousel` (revertida) y orden "más recientes primero" en el admin de apartamentos (sin PR aún)
- [2026-06-25](memory/2026-06-25.md) — PUT→PATCH en reservationService, dead code cleanup (updateReservation thunk), error handling global en todos los slices y componentes (PR #40, PR #41)
- [2026-06-24](memory/2026-06-24.md) — N+1 fix en PaymentsList y ReservationList, columna Reservation en pagos, historial de pagos a suppliers (`/admin/suppliers/:id`), filas clickeables en SupplierList (PR #39)
- [2026-06-23](memory/2026-06-23.md) — Fix métodos de pago de suppliers: `wire` → `paypal`, `zelle`, `stripe`, `other` (PR #38)

- [2026-06-04c](memory/2026-06-04c.md) — Paginación server-side en todos los listados admin + fix Listings dropdown (Suspense boundary + DashboardHeader)
- [2026-06-04b](memory/2026-06-04b.md) — Dead code cleanup (PaymentSummary, updatePaymentStatus), fix PUT reserva (clientId + numberOrZero), estandarización errores API (.error)
- [2026-06-03/04](memory/2026-06-03.md) — Feature Transfers: stepper de equipaje, dropdown Listings en admin header, fix paginación reservas, imágenes definitivas en Services.jsx
- [2026-06-02](memory/2026-06-02.md) — Feature Investments + Feature Experiences
- [2026-06-01](memory/2026-06-01.md) — Auditoría de performance (18 fixes)
- [2026-05-22](memory/2026-05-22.md) — Deuda técnica crítica
