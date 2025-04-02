import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ScrollToTop from './components/ScrollToTop';
import Services from './pages/Services';
import ServiceList from './pages/ServiceList';
import ServiceDetails from './pages/ServiceDetails';
import About from './pages/About';
import AboutFounder from './components/about/AboutFounder';
import AdminLogin from './components/admin/auth/AdminLogin';
import ContactForm from './components/form/ContactForm';
import ReviewsManager from './components/ReviewsManager';
import AdminLayout from './components/admin/shared/AdminLayout';
import ProtectedRoute from './components/admin/auth/ProtectedRoutes';
import AdminDashboard from './components/admin/AdminDashboard';
import ReservationManagement from './components/admin/reservations/ReservationManagement';
import PaymentsList from './components/admin/payments/PaymentsList';
import AdminReviews from './components/admin/reviews/AdminReviews';
import ReservationDetails from './pages/ReservationDetails';
import ApartmentList from './components/admin/apartments/ApartmentList';
import UserList from './components/admin/users/UserList';
import ReservationsPage from './pages/ReservationsPage';
import ServicesPage from './components/admin/services/ServicesPage';

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:type" element={<ServiceList />} />
          <Route path="/services/:type/:id" element={<ServiceDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/aboutFounder" element={<AboutFounder />} />
          <Route path="/contactUs" element={<ContactForm />} />
          <Route path="/reviews" element={<ReviewsManager />} />
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
            <Route path="payments" element={<PaymentsList />} />
            
            {/* Rutas de reservas */}
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="reservations/new" element={<ReservationManagement />} />
            <Route path="reservations/edit/:id" element={<ReservationManagement />} />
            <Route path="reservations/:id" element={<ReservationDetails />} />
            <Route path="reservations/view/:id" element={<ReservationDetails />} />
            
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="apartments" element={<ApartmentList />} />
          </Route>
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/reservations/:id" element={<ReservationDetails />} />
        </Routes>
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