import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import adminService from '../../../services/adminService';

const ProtectedRoute = ({ children }) => {
    // Verificación síncrona inicial del token
    const token = localStorage.getItem('adminToken');
    const hasToken = !!token;
    
    const [isLoading, setIsLoading] = useState(hasToken); // Solo loading si hay token
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                
                // Si no hay token, redirigir inmediatamente sin mostrar loading
                if (!token) {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                // Solo si hay token, verificar que sea válido con el backend
                await adminService.getProfile();
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error verificando autenticación:', error);
                localStorage.removeItem('adminToken');
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, []);

    // Si no hay token, redirigir inmediatamente sin mostrar nada
    if (!hasToken) {
        return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
    }

    // Solo mostrar loading si hay token y estamos verificando con el backend
    if (isLoading) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="100vh"
                bgcolor="#121212"
            >
                <CircularProgress />
            </Box>
        );
    }

    // Si la verificación falló, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
    }

    return children;
};

export default ProtectedRoute;
