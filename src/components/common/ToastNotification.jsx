import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const ToastNotification = ({ toast, onClose }) => {
    return (
        <Snackbar
            open={toast.open}
            autoHideDuration={toast.autoHideDuration}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert
                onClose={onClose}
                severity={toast.severity}
                sx={{
                    width: '100%',
                    bgcolor: toast.severity === 'success' ? '#4caf50' : 
                             toast.severity === 'error' ? '#f44336' :
                             toast.severity === 'warning' ? '#ff9800' :
                             '#2196f3',
                    color: '#fff',
                    '& .MuiAlert-icon': {
                        color: '#fff'
                    },
                    '& .MuiAlert-action': {
                        color: '#fff'
                    }
                }}
            >
                {toast.message}
            </Alert>
        </Snackbar>
    );
};

export default ToastNotification;
