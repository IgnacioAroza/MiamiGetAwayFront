# CLAUDE.md — MiamiGetAwayFront

**AL INICIO DE CADA CONVERSACIÓN:** leer `docs/MEMORY.md` para retomar contexto: estado actual del proyecto, deuda técnica conocida y cambios pendientes.

Guía de referencia para trabajar en este proyecto. Leer antes de tocar código.

---

## Proyecto

Plataforma web para gestión y reserva de alquileres vacacionales en Miami. Tiene dos partes diferenciadas:

- **Sitio público**: explorar servicios (apartamentos, autos, yates), hacer reservas, contacto, reseñas.
- **Panel administrativo** (`/admin`): gestión de reservas, pagos, usuarios, servicios y reseñas. Requiere autenticación JWT.

Backend separado: repositorio `MiamiGetAwayBack`, corriendo en `https://miami-api-u1k5.onrender.com/api` en producción.

---

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3 | Framework UI |
| Vite + SWC | 7.x | Build tool y dev server |
| React Router | 6.27 | Routing (SPA) |
| Redux Toolkit | 2.3 | State management |
| Material UI | 6.1 | Componentes de UI |
| Axios | 1.7 | HTTP client |
| i18next | 23.x | Internacionalización ES/EN |
| Recharts | 2.15 | Gráficos en dashboard |
| Framer Motion | 11.x | Animaciones |
| React Slick | 0.30 | Carruseles de imágenes |
| EmailJS | 4.4 | Envío de emails desde el cliente |
| date-fns | 2.29 | Utilidades de fechas |

---

## Comandos

```bash
npm run dev        # Dev server en puerto 5173
npm run build      # Build de producción → /dist
npm run preview    # Previsualizar el build
npm run lint       # ESLint
```

---

## Variables de entorno

El archivo `src/config.js` centraliza `API_URL`. Todas las variables usan el prefijo `VITE_` para que Vite las exponga al cliente.

```env
VITE_API_URL                    # URL base del backend (sin trailing slash)
VITE_WHATSAPP_NUMBER            # Número WhatsApp principal (internacional, sin +)
VITE_ARGENTINA_WHATSAPP_NUMBER  # Número WhatsApp Argentina
VITE_EMAILJS_SERVICE_ID         # EmailJS: service ID
VITE_EMAILJS_TEMPLATE_ID        # EmailJS: template ID
VITE_EMAILJS_PUBLIC_KEY         # EmailJS: public key
```

Ver `.env.example` para referencia.

---

## Estructura de `src/`

```
src/
├── main.jsx                   # Entry point — Redux Provider + React 18
├── App.jsx                    # Router + MUI Theme + lazy loading de páginas
├── config.js                  # { API_URL } desde import.meta.env
├── i18n.js                    # Configuración i18next (lng: "es", fallback: "en")
├── index.css                  # Estilos globales (dark mode base)
│
├── pages/                     # Páginas (lazy-loaded en App.jsx)
├── components/
│   ├── admin/                 # Todo el panel administrativo
│   ├── common/                # Componentes reutilizables genéricos
│   ├── filters/               # Filtros del sitio público
│   ├── form/                  # Formularios (reserva, contacto, etc.)
│   └── images/                # Carrusel e ImageUploader
│
├── redux/                     # Slices y store
├── services/                  # Clientes de API (uno por entidad)
├── hooks/                     # Custom hooks de lógica de negocio
├── utils/                     # api.js, dateUtils.js, normalizers.js
└── locales/
    ├── es/translation.json
    └── en/translation.json
```

---

## Arquitectura y patrones

### API client (`src/utils/api.js`)

Instancia única de Axios configurada con:
- `baseURL` desde `config.API_URL`
- Interceptor de request: inyecta `Authorization: Bearer <token>` desde `localStorage.adminToken`
- Interceptor de response: en 401, elimina el token y redirige a `/admin/login`
- **No setear `Content-Type` manualmente**: se deja que Axios lo determine automáticamente para que `FormData` funcione con `multipart/form-data` y su boundary.

```js
import api from '../utils/api'
// Usar siempre esta instancia, nunca crear axios.create() nuevo
```

### Servicios (`src/services/`)

Un archivo por entidad. Solo contienen llamadas HTTP, sin lógica de negocio.

```js
// Patrón estándar de un servicio
const reservationService = {
    getAll: () => api.get('/reservations'),
    getById: (id) => api.get(`/reservations/${id}`),
    create: (data) => api.post('/reservations', data),
    update: (id, data) => api.put(`/reservations/${id}`, data),
    delete: (id) => api.delete(`/reservations/${id}`),
}
```

### Redux (`src/redux/`)

Redux Toolkit con slices. El store tiene estos reducers:

```
services | users | reviews | googleReviews | adminApartments
reservations | reservationPayments | summary
```

Patrón: los thunks van dentro del slice con `createAsyncThunk`. Los componentes despachan acciones y leen el estado con `useSelector`/`useDispatch`.

### Custom Hooks (`src/hooks/`)

La lógica de negocio compleja va en hooks, no en componentes:

- `useReservationForm.js` — estado y validación del formulario de reservas (archivo más complejo del proyecto)
- `useReservationPricing.js` — cálculo de precios según fechas y servicio
- `useReservationTrends.js` — datos para el gráfico de tendencias
- `useDeviceDetection.js` — breakpoints responsive
- `useToast.js` — notificaciones toast
- `useLazyImage.js` / `useImagePreloader.js` — carga diferida de imágenes

### Autenticación (admin)

- Token JWT almacenado en `localStorage` bajo la clave `adminToken`
- `ProtectedRoute` en `src/components/admin/auth/ProtectedRoutes.jsx`:
  1. Verificación síncrona: si no hay token, redirige a `/admin/login` inmediatamente
  2. Si hay token, valida con el backend (`adminService.getProfile()`)
  3. En error 401, el interceptor de Axios limpia el token y redirige

### Internacionalización

- Idioma por defecto: **español** (`lng: "es"`)
- Fallback: inglés
- Usar el hook `useTranslation` de react-i18next en todos los textos de UI
- Claves en `src/locales/es/translation.json` y `src/locales/en/translation.json`

### Imágenes y subida de archivos

- Para subir imágenes, usar `FormData` y NO setear `Content-Type` en el header (ver nota en api.js)
- `LazyImage` y `ImagePlaceholder` en `src/components/common/` para carga diferida con placeholder
- `ImageCarousel` en `src/components/images/` usa React Slick

### Normalización de datos

- `src/utils/normalizers.js` — funciones para normalizar respuestas de la API antes de guardar en Redux
- `src/utils/dateUtils.js` — helpers de fechas (manejo de timezone incluido)

---

## Routing

Definido en `App.jsx` con React Router v6. Todas las páginas se cargan con `React.lazy` (code splitting automático).

| Ruta | Componente | Protegida |
|---|---|---|
| `/` | Home | No |
| `/services` | Services | No |
| `/services/:type` | ServiceList | No |
| `/services/:type/:id` | ServiceDetails | No |
| `/about` | About | No |
| `/aboutFounder` | AboutFounder | No |
| `/contactUs` | ContactForm | No |
| `/reviews` | ReviewsManager | No |
| `/reservations` | ReservationsPage | No |
| `/reservations/:id` | ReservationDetailsPage | No |
| `/admin/login` | AdminLogin | No |
| `/admin/*` | AdminPanel | Sí (JWT) |

---

## Panel administrativo

Módulos dentro de `/admin`:

- **Dashboard** — DashboardCards, BookingTrendsChart, SalesVolumeChart, MonthlySummary, ReservationsTable, PaymentsTable
- **Reservations** — lista con filtros, formulario modularizado en secciones (`sections/`), detalles
- **Payments** — historial, filtros, resumen, detalle por reserva
- **Users** — CRUD con filtros
- **Services** — tablas por tipo: ApartmentTable, ServiceTable (autos/yates/villas)
- **Reviews** — AdminReviews + GoogleReviewsManager

Los componentes de reservas están modularizados en `src/components/admin/reservations/sections/`:
`ApartmentSection`, `ClientSection`, `DateSection`, `NotesSection`, `PaymentSection`, `PricingSection`, `ReservationPaymentSummary`, `StatusSection`

---

## MUI Theme

Definido en `App.jsx`. Dark mode con:
- Background: `#121212`
- Texto primario: blanco
- Fuente: Roboto (via `@fontsource/roboto`)

Al agregar componentes MUI, respetar el tema existente y no hardcodear colores.

---

## Convenciones

- Componentes: PascalCase, archivos `.jsx`
- Hooks: camelCase con prefijo `use`, archivos `.js`
- Services y utils: camelCase, archivos `.js`
- Redux slices: camelCase con sufijo `Slice`, archivo `.js`
- No crear instancias de axios adicionales; usar siempre `src/utils/api.js`
- No hardcodear URLs de API; usar `config.API_URL`
- No hardcodear textos de UI; usar claves de `i18next`
- Los archivos de servicios no deben contener lógica de negocio, solo llamadas HTTP

---

## Approach

- Think before acting. Read existing files before writing code.
- Be concise in output but thorough in reasoning.
- Prefer editing over rewriting whole files.
- Do not re-read files you have already read unless the file may have changed.
- Test your code before declaring done.
- No sycophantic openers or closing fluff.
- Keep solutions simple and direct.
- User instructions always override this file.
