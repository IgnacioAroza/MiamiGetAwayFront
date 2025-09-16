import { useState } from 'react';

export const useToast = () => {
    const [toast, setToast] = useState({
        open: false,
        message: '',
        severity: 'info', // 'success', 'error', 'warning', 'info'
        autoHideDuration: 4000
    });

    const showToast = (message, severity = 'info', autoHideDuration = 4000) => {
        setToast({
            open: true,
            message,
            severity,
            autoHideDuration
        });
    };

    const hideToast = () => {
        setToast(prev => ({
            ...prev,
            open: false
        }));
    };

    // Métodos de conveniencia
    const success = (message, duration) => showToast(message, 'success', duration);
    const error = (message, duration) => showToast(message, 'error', duration);
    const warning = (message, duration) => showToast(message, 'warning', duration);
    const info = (message, duration) => showToast(message, 'info', duration);

    return {
        toast,
        showToast,
        hideToast,
        success,
        error,
        warning,
        info
    };
};
