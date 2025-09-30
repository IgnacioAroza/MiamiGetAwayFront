import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Lazy-loaded pages (code splitting por rutas)
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const ServiceList = lazy(() => import('./pages/ServiceList'));
const ServiceDetails = lazy(() => import('./pages/ServiceDetails'));
const About = lazy(() => import('./pages/About'));
const AboutFounder = lazy(() => import('./components/about/AboutFounder'));
const AdminLogin = lazy(() => import('./components/admin/auth/AdminLogin'));
const ContactForm = lazy(() => import('./components/form/ContactForm'));
const GoogleReviewsManager = lazy(() => import('./components/admin/reviews/GoogleReviewsManager'));
const AdminLayout = lazy(() => import('./components/admin/shared/AdminLayout'));
const ProtectedRoute = lazy(() => import('./components/admin/auth/ProtectedRoutes'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const ReservationManagement = lazy(() => import('./components/admin/reservations/ReservationManagement'));
const PaymentsList = lazy(() => import('./components/admin/payments/PaymentsList'));
const AdminReviews = lazy(() => import('./components/admin/reviews/AdminReviews'));
const ReservationDetailsPage = lazy(() => import('./pages/ReservationDetailsPage'));
const ApartmentList = lazy(() => import('./components/admin/apartments/ApartmentList'));
const UserList = lazy(() => import('./components/admin/users/UserList'));
const ReservationsPage = lazy(() => import('./pages/ReservationsPage'));
const ServicesPage = lazy(() => import('./components/admin/services/ServicesPage'));
const CreateUser = lazy(() => import('./components/admin/users/CreateUser'));
const EditUser = lazy(() => import('./components/admin/users/EditUser'));

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#424242',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: isAdminRoute ? '#121212' : 'inherit'
    }}>
      <ScrollToTop />
      {!isAdminRoute && <Header />}
      <main style={{
        flexGrow: 1,
        backgroundColor: isAdminRoute ? '#121212' : 'inherit'
      }}>
        <Suspense fallback={
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:type" element={<ServiceList />} />
            <Route path="/services/:type/:id" element={<ServiceDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/aboutFounder" element={<AboutFounder />} />
            <Route path="/contactUs" element={<ContactForm />} />
            <Route path="/reviews" element={<GoogleReviewsManager />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/create" element={<CreateUser />} />
              <Route path="users/edit/:id" element={<EditUser />} />
              <Route path="payments" element={<PaymentsList />} />

              {/* Rutas de reservas */}
              <Route path="reservations" element={<ReservationsPage />} />
              <Route path="reservations/new" element={<ReservationManagement />} />
              <Route path="reservations/edit/:id" element={<ReservationManagement />} />
              <Route path="reservations/:id" element={<ReservationDetailsPage />} />
              <Route path="reservations/view/:id" element={<ReservationDetailsPage />} />

              <Route path="reviews" element={<AdminReviews />} />
              <Route path="apartments" element={<ApartmentList />} />
            </Route>
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/reservations/:id" element={<ReservationDetailsPage />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
