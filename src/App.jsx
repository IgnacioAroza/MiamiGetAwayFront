import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceList from './pages/ServiceList';
import ServiceDetails from './pages/ServiceDetails';
import About from './pages/About';
import AdminPanel from './pages/AdminPanel';
import AboutFounder from './components/about/AboutFounder';
import AdminLogin from './components/admin/AdminLogin';
import ContactForm from './components/form/ContactForm';
import ReviewsManager from './components/ReviewsManager';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <main style={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:type" element={<ServiceList />} />
              <Route path="/services/:type/:id" element={<ServiceDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/aboutFounder" element={<AboutFounder />} />
              <Route path="/contactUs" element={<ContactForm />} />
              <Route path="/reviews" element={<ReviewsManager />} />
              <Route path="/adminPanel" element={<AdminPanel />} />
              <Route path="/admin" element={<AdminLogin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;