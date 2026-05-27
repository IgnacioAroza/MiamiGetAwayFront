import api from '../utils/api'
import { formatDateToString, parseStringToDate } from '../utils/dateUtils'
import { normalizeReservationInput, stripUndefined, normalizePaymentInput } from '../utils/normalizers'

const reservationService = {
    getAll: async (filters = {}) => {
        try {
            const response = await api.get('/reservations', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Error in getAll:', error);
            throw error.response?.data?.message || 'Error fetching reservations';
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/reservations/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error in getById:", error);
            if (error.response) {
                console.error("Error in getById:", error.response.data);
            }
            throw error.response?.data?.message || 'Error fetching reservation by id';
        }
    },

    create: async (reservationData) => {
        try {
            // Normalizar payload respetando el formato de fechas MM-DD-YYYY HH:mm y camelCase
            const formattedData = normalizeReservationInput(reservationData);

            // Validaciones mínimas
            if (formattedData.pricePerNight === undefined) {
                throw new Error('The price per night is required');
            }

            if (formattedData.cleaningFee === undefined) {
                throw new Error('The cleaning fee is required');
            }

            // Filtrar undefined para no enviar campos innecesarios
            const dataToSend = stripUndefined(formattedData);

            const response = await api.post('/reservations', dataToSend);
            return response.data;
        } catch (error) {
            console.error('Error creating reservation:', error);
            if (error.response && error.response.data) {
                console.error('Server response:', error.response.data);
            }
            throw error.response?.data?.message || error.message || 'Error creating reservation';
        }
    },

    update: async (id, reservationData) => {
        try {
            if (!id) {
                throw new Error('The reservation ID is required');
            }

            if (!reservationData) {
                throw new Error('No data provided to update the reservation');
            }

            // Normalizar payload parcial (solo campos presentes)
            const formattedData = normalizeReservationInput(reservationData, { partial: true });
            const dataToSend = stripUndefined(formattedData);

            const response = await api.put(`/reservations/${id}`, dataToSend);
            return response.data;
        } catch (error) {
            console.error("Error in update:", error);
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Error in update:", error.response.data);
            }
            throw error.response?.data?.message || error.message || 'Error updating reservation';
        }
    },

    deleteReservation: async (id) => {
        try {
            const response = await api.delete(`/reservations/${id}`);
            return response.data;
        } catch (error) {
            // Si es un error 400 con datos relacionados, usar el mensaje específico del servidor
            if (error.response?.status === 400 && error.response?.data) {
                const errorData = error.response.data;

                // Si es el error específico de datos relacionados
                if (errorData.error === 'Cannot delete reservation due to related data') {
                    const detailedError = new Error(errorData.message || 'Cannot delete reservation with related data');
                    detailedError.details = errorData.details;
                    detailedError.suggestedAction = errorData.suggestedAction;
                    detailedError.isRelatedDataError = true;
                    throw detailedError;
                }

                // Otros errores 400
                throw new Error(errorData.message || 'Bad request when deleting reservation');
            }

            // Para otros códigos de error, usar mensaje genérico mejorado
            const statusCode = error.response?.status;
            const serverMessage = error.response?.data?.message;

            switch (statusCode) {
                case 404:
                    throw new Error('Reservation not found');
                case 403:
                    throw new Error('Not authorized to delete this reservation');
                case 500:
                    throw new Error('Server error while deleting reservation');
                default:
                    throw new Error(serverMessage || 'Error deleting reservation');
            }
        }
    },

    registerPayment: async (id, paymentData) => {
        try {
            if (!paymentData || !paymentData.amount) {
                throw new Error('The payment amount is required');
            }

            const hasReservationUpdate = !!paymentData.reservation_update;
            const receiptImage = paymentData.receipt_image;

            let body;
            if (receiptImage instanceof File) {
                body = new FormData();
                body.append('amount', parseFloat(paymentData.amount));
                body.append('paymentMethod', paymentData.payment_method || 'cash');
                if (paymentData.payment_date) body.append('paymentDate', paymentData.payment_date);
                if (paymentData.notes) body.append('notes', paymentData.notes);
                body.append('receipt_image', receiptImage);
            } else {
                const paymentBase = normalizePaymentInput({
                    amount: paymentData.amount,
                    paymentMethod: paymentData.payment_method,
                    notes: paymentData.notes || '',
                    paymentDate: paymentData.payment_date,
                });
                body = {
                    ...paymentBase,
                    reservation_update: hasReservationUpdate ? {
                        amount_paid: paymentData.reservation_update.amount_paid,
                        amount_due: paymentData.reservation_update.amount_due,
                        payment_status: paymentData.reservation_update.payment_status
                    } : undefined
                };
            }

            const response = await api.post(`/reservations/${id}/payments`, body);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Error registering payment';
        }
    },

    getReservationPayments: async (id) => {
        try {
            const response = await api.get(`/reservations/${id}/payments`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error fetching reservation payments';
        }
    },

    generatePdf: async (id) => {
        try {
            const response = await api.post(`/reservations/${id}/pdf`, {}, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error generating PDF';
        }
    },

    sendConfirmation: async (id, notificationType = 'confirmation') => {
        try {
            // Validar el tipo de notificación
            const validTypes = ['confirmation', 'status_update', 'payment'];
            if (!validTypes.includes(notificationType)) {
                throw new Error('Invalid notification type');
            }

            const response = await api.post(`/reservations/${id}/send-notification`, {
                type: notificationType
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.error || error.response.data?.message;

                switch (status) {
                    case 404:
                        throw new Error('The reservation does not have an associated email address');
                    case 400:
                        if (message.includes('email')) {
                            throw new Error('Invalid email format');
                        } else if (message.includes('notification type')) {
                            throw new Error('Invalid notification type');
                        }
                        throw new Error(message || 'Error in the request');
                    case 500:
                        throw new Error('Server error sending the notification');
                    default:
                        throw new Error(message || 'Error sending the confirmation');
                }
            }
            throw error;
        }
    },

    sendPdfByEmail: async (id, email) => {
        try {
            // Obtener el token de autenticación
            const token = localStorage.getItem('adminToken');

            if (!token) {
                throw new Error('No authentication token available. Please log in again.');
            }

            // Usar directamente el endpoint que genera y envía el PDF
            const response = await api.post(`/reservations/${id}/pdf`, {
                email: email
            });

            // Retornar un objeto con información sobre el resultado
            return {
                success: true,
                message: 'PDF sent successfully by email',
                email: email,
                id: id
            };
        } catch (error) {
            throw error.response?.data?.message || 'Error sending PDF by email';
        }
    },

    searchReservations: async (searchParams) => {
        try {
            const response = await api.get('/reservations/search', { params: searchParams });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error searching reservations';
        }
    },

    updatePaymentStatus: async (id, paymentData) => {
        try {
            if (!id) {
                throw new Error('The reservation ID is required');
            }

            const data = {
                paymentStatus: paymentData.paymentStatus,
                amountPaid: Number(paymentData.amountPaid),
                amountDue: Number(paymentData.amountDue)
            };

            const response = await api.patch(`/reservations/${id}/payment-status`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error updating payment status';
        }
    },

    simpleRegisterPayment: async (id, amount, method = 'cash') => {
        try {
            if (!id) {
                throw new Error('The reservation ID is required');
            }

            const numericAmount = parseFloat(amount);
            if (isNaN(numericAmount) || numericAmount <= 0) {
                throw new Error('The payment amount must be positive');
            }

            const data = {
                amount: numericAmount,
                paymentMethod: method,
                notes: `Payment registered from admin panel - Method: ${method}`
            };

            // Usar un endpoint más simple si el problema persiste
            const response = await api.post(`/payments/register/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Error registering simple payment';
        }
    },

    // Función específica para actualizar solo el parking fee
    updateParkingFee: async (id, parkingFee) => {
        try {
            if (!id) {
                throw new Error('The reservation ID is required');
            }

            // Convertir a número
            const numericFee = Math.max(0, parseFloat(parkingFee) || 0);

            // Enviar como número al backend en camelCase
            const data = {
                parkingFee: numericFee
            };

            // Usar PATCH para actualización parcial
            const response = await api.patch(`/reservations/${id}`, data);
            return response.data;
        } catch (error) {

            throw error.response?.data?.message || error.message || 'Error updating parking fee';
        }
    },

    // Función específica para actualizar solo el cleaning fee
    updateCleaningFee: async (id, cleaningFee) => {
        try {
            if (!id) {
                throw new Error('The reservation ID is required');
            }

            // Convertir a número
            const numericFee = Math.max(0, parseFloat(cleaningFee) || 0);

            // Enviar como número al backend en camelCase
            const data = {
                cleaningFee: numericFee
            };

            const response = await api.patch(`/reservations/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar cleaning fee:", error);
            if (error.response) {
                console.error("Detalles del error:", error.response.data);
            }

            throw error.response?.data?.message || error.message || 'Error updating cleaning fee';
        }
    },

    // Función específica para actualizar solo other expenses
    updateOtherExpenses: async (id, otherExpenses) => {
        try {
            if (!id) {
                throw new Error('The reservation ID is required');
            }

            // Convertir a número
            const numericValue = Math.max(0, parseFloat(otherExpenses) || 0);

            // Enviar como número al backend en camelCase
            const data = {
                otherExpenses: numericValue
            };

            const response = await api.patch(`/reservations/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar other expenses:", error);
            if (error.response) {
                console.error("Detalles del error:", error.response.data);
            }

            throw error.response?.data?.message || error.message || 'Error updating other expenses';
        }
    },

    // Función general para actualizar tarifas sin afectar los campos de pago
    updateFees: async (id, feeData) => {
        try {
            if (!id) {
                throw new Error('The reservation ID is required');
            }

            // Crear objeto solo con los campos de tarifas en formato camelCase para el backend
            const dataToSend = {};

            // Mantener camelCase para nombres de propiedades como espera el backend
            // y asegurarse de que sean números
            if (feeData.parkingFee !== undefined) {
                const value = Math.max(0, parseFloat(feeData.parkingFee) || 0);
                dataToSend.parkingFee = value;
            }

            if (feeData.cleaningFee !== undefined) {
                const value = Math.max(0, parseFloat(feeData.cleaningFee) || 0);
                dataToSend.cleaningFee = value;
            }

            if (feeData.cancellationFee !== undefined) {
                const value = Math.max(0, parseFloat(feeData.cancellationFee) || 0);
                dataToSend.cancellationFee = value;
            }

            if (feeData.otherExpenses !== undefined) {
                const value = Math.max(0, parseFloat(feeData.otherExpenses) || 0);
                dataToSend.otherExpenses = value;
            }

            // También podría enviarse pricePerNight si fue modificado
            if (feeData.price !== undefined || feeData.pricePerNight !== undefined) {
                const value = Math.max(0, parseFloat(feeData.price || feeData.pricePerNight) || 0);
                dataToSend.pricePerNight = value;
            }

            // Si no hay nada que actualizar, salir
            if (Object.keys(dataToSend).length === 0) {
                return { message: 'No hay tarifas para actualizar' };
            }

            // Usar el endpoint PATCH para actualización parcial
            const response = await api.patch(`/reservations/${id}`, dataToSend);

            return response.data;
        } catch (error) {
            console.error("Error al actualizar tarifas:", error);
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Detalles del error:", error.response.data);
            }

            throw error.response?.data?.message || error.message || 'Error updating fees';
        }
    },

}

export default reservationService;
