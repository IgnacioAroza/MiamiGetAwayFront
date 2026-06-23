# MEMORY — MiamiGetAwayFront

Estado actual del proyecto. Leer al inicio de cada sesión antes de tocar código.

---

## Estado de ramas (al 2026-06-19)

| Rama | Estado |
|------|--------|
| `main` | Producción — tiene hasta Transfers (PR #37). Todo el scope entregado |
| `development` | Al día con `main` |
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
- **Suppliers:** Totales en `assignment.calculated.*` — nunca calcular localmente. `supplier_status` viene del objeto reserva
- **buildingNames en ReservationList:** Usa service call local (no Redux) — el fetch asíncrono de Redux llega tarde al primer render
- **useEffect fetch on-mount:** Nunca poner `array.length` en el dep array para guardar un fetch. Usar siempre `[dispatch]` como dep array.
- **Paginación de reservas:** `rowsPerPageOptions` es `[5, 10, 20]` — máximo 20 por limitación del API. El localStorage se valida contra este array al inicializar.
- **Prefijo de teléfono:** Se usa restcountries.com (`/v3.1/all?fields=name,flags,idd`) para obtener países. Default Argentina (+54). En campos opcionales, solo se adjunta el prefijo si el usuario ingresa un número.
- **Errores de API:** Leer siempre `?.data?.error || ?.data?.message` — el back estandarizó a `error` desde 2026-06-04 pero se mantiene fallback a `message` para compatibilidad.
- **PUT reserva — campos numéricos opcionales:** `cleaningFee`, `parkingFee`, `otherExpenses`, `taxes`, `amountPaid` usan `numberOrZero` en el normalizer (default `0` en vez de `undefined`). El back recalcula `totalAmount`, `amountDue` y `paymentStatus` internamente.
- **Flujo de pago:** El estado de pago se actualiza como efecto secundario de `registerPayment` (POST `/reservations/:id/payments` con `reservation_update`). No existe endpoint separado `PATCH /payment-status` — fue eliminado del back.

---

## Sesiones anteriores (detalle)

- [2026-06-04c](memory/2026-06-04c.md) — Paginación server-side en todos los listados admin + fix Listings dropdown (Suspense boundary + DashboardHeader)
- [2026-06-04b](memory/2026-06-04b.md) — Dead code cleanup (PaymentSummary, updatePaymentStatus), fix PUT reserva (clientId + numberOrZero), estandarización errores API (.error)
- [2026-06-03/04](memory/2026-06-03.md) — Feature Transfers: stepper de equipaje, dropdown Listings en admin header, fix paginación reservas, imágenes definitivas en Services.jsx
- [2026-06-02](memory/2026-06-02.md) — Feature Investments + Feature Experiences
- [2026-06-01](memory/2026-06-01.md) — Auditoría de performance (18 fixes)
- [2026-05-22](memory/2026-05-22.md) — Deuda técnica crítica
