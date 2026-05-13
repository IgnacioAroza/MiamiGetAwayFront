# MiamiGetAway - Frontend

Plataforma web para la gestión y reserva de alquileres vacacionales en Miami. Incluye un sitio público para clientes y un panel administrativo completo para gestionar reservas, pagos, usuarios y servicios.

## Tecnologías

- **React 18** + **Vite** (con SWC)
- **Redux Toolkit** — state management
- **React Router v6** — navegación
- **Material UI v6** — componentes de UI
- **Axios** — cliente HTTP
- **i18next** — internacionalización (ES / EN)
- **Recharts** — gráficos en el dashboard
- **Framer Motion** — animaciones
- **React Slick** — carruseles de imágenes
- **EmailJS** — envío de emails desde el cliente
- **date-fns** — utilidades de fechas

## Prerrequisitos

- Node.js >= 18
- npm >= 9
- Backend de MiamiGetAway corriendo (ver repositorio de la API)

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/IgnacioAroza/MiamiGetAwayFront.git
cd MiamiGetAwayFront

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores correspondientes

# 4. Iniciar en modo desarrollo
npm run dev
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# URL base de la API backend
VITE_API_URL=http://localhost:3001/api

# Número de WhatsApp para contacto (formato internacional, sin +)
VITE_WHATSAPP_NUMBER=

# Número de WhatsApp alternativo (Argentina)
VITE_ARGENTINA_WHATSAPP_NUMBER=

# Credenciales de EmailJS (https://www.emailjs.com)
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

## Scripts

```bash
npm run dev        # Servidor de desarrollo (puerto 5173)
npm run build      # Build de producción (genera /dist)
npm run preview    # Previsualizar el build de producción
npm run lint       # Verificar código con ESLint
```

## Estructura del proyecto

```
src/
├── App.jsx                    # Router principal y tema MUI
├── main.jsx                   # Entry point (Redux Provider)
├── config.js                  # Configuración centralizada (API_URL)
├── i18n.js                    # Configuración de i18next
│
├── pages/                     # Páginas principales
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Services.jsx
│   ├── ServiceList.jsx
│   ├── ServiceDetails.jsx
│   ├── ReservationsPage.jsx
│   ├── ReservationDetailsPage.jsx
│   ├── PaymentDetails.jsx
│   └── AdminPanel.jsx
│
├── components/
│   ├── admin/                 # Panel administrativo
│   │   ├── auth/              # Login y rutas protegidas
│   │   ├── dashboard/         # Gráficos y estadísticas
│   │   ├── reservations/      # Gestión de reservas
│   │   ├── payments/          # Gestión de pagos
│   │   ├── users/             # Gestión de usuarios
│   │   ├── apartments/        # Gestión de apartamentos
│   │   ├── services/          # Gestión de servicios
│   │   ├── reviews/           # Gestión de reseñas
│   │   ├── shared/            # Layout y componentes compartidos
│   │   └── dialogs/           # Diálogos reutilizables
│   ├── common/                # Componentes genéricos (Toast, LazyImage, etc.)
│   ├── filters/               # Filtros públicos de servicios
│   ├── form/                  # Formularios (reserva, contacto, etc.)
│   └── images/                # Carrusel y uploader de imágenes
│
├── redux/                     # State management
│   ├── store.js
│   ├── serviceSlice.js
│   ├── reservationSlice.js
│   ├── reservationPaymentSlice.js
│   ├── adminApartmentSlice.js
│   ├── userSlice.js
│   ├── reviewSlice.js
│   ├── googleReviewSlice.js
│   └── summarySlice.js
│
├── services/                  # Clientes de API (Axios)
│   ├── reservationService.js
│   ├── apartmentService.js
│   ├── carService.js
│   ├── yachtService.js
│   ├── villaService.js
│   ├── userService.js
│   ├── reviewService.js
│   ├── googleReviewService.js
│   ├── salesVolumeService.js
│   └── summaryService.js
│
├── hooks/                     # Custom hooks
│   ├── useReservationForm.js
│   ├── useReservationPricing.js
│   ├── useReservationTrends.js
│   ├── useDeviceDetection.js
│   ├── useToast.js
│   ├── useLazyImage.js
│   └── useImagePreloader.js
│
├── utils/
│   ├── api.js                 # Instancia global de Axios
│   ├── dateUtils.js           # Helpers de fechas
│   └── normalizers.js         # Normalización de datos de la API
│
└── locales/
    ├── es/translation.json    # Traducciones en español
    └── en/translation.json    # Traducciones en inglés
```

## Funcionalidades

### Sitio público

- Listado de servicios por categoría: **apartamentos**, **autos** y **yates**
- Filtros de búsqueda y detalle de cada servicio
- Formulario de reserva con cálculo automático de precios
- Consulta del estado de una reserva por ID
- Formulario de contacto (EmailJS)
- Reseñas de Google integradas
- Botón de contacto directo por WhatsApp
- Soporte de idioma **español / inglés**

### Panel administrativo (`/admin`)

- **Dashboard**: estadísticas generales, gráficos de tendencias de reservas y volumen de ventas
- **Reservas**: CRUD completo con filtros, estados, notas y secciones modularizadas
- **Pagos**: historial, filtros, resumen y detalle por reserva
- **Usuarios**: alta, edición, eliminación y filtros
- **Servicios**: gestión de apartamentos, autos, yates y villas con carga de imágenes
- **Reseñas**: moderación de reseñas propias e integración con Google Reviews

## Rutas principales

| Ruta | Descripción |
|---|---|
| `/` | Home |
| `/services` | Servicios |
| `/services/:type` | Lista por tipo (apartments, cars, yachts) |
| `/services/:type/:id` | Detalle del servicio |
| `/about` | Sobre nosotros |
| `/contactUs` | Formulario de contacto |
| `/reviews` | Reseñas |
| `/reservations` | Consulta de reserva por ID |
| `/reservations/:id` | Detalle de reserva |
| `/admin/login` | Login del panel administrativo |
| `/admin/*` | Panel administrativo (requiere autenticación) |

## Internacionalización

El sitio soporta **español** e **inglés**. El idioma por defecto es español. Los archivos de traducción se encuentran en `src/locales/`.

## Build y deploy

```bash
npm run build
```

Genera la carpeta `/dist` lista para servir con cualquier hosting estático (Vercel, Netlify, Nginx, etc.).

Asegurarse de configurar el servidor para redirigir todas las rutas a `index.html` (SPA routing).
