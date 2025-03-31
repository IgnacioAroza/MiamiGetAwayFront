import api from '../utils/api'

const reservationService = {
    getAll: async (filters = {}) => {
        try {
            const response = await api.get('/reservations', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Error al obtener reservas:', error);
            throw error.response?.data?.message || 'Error fetching reservations';
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/reservations/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error en getById:", error);
            if (error.response) {
                console.error("Detalles del error:", error.response.data);
            }
            throw error.response?.data?.message || 'Error fetching reservation by id';
        }
    },

    create: async (reservationData) => {
        try {
            // Generar log para ver exactamente lo que estamos enviando
            console.log("Datos originales de creación:", JSON.stringify(reservationData, null, 2));

            // Formateamos ciertos datos pero enviamos con los nombres exactos que espera el backend
            const formattedData = {
                // Datos básicos - respetando camelCase del backend
                apartmentId: reservationData.apartmentId !== undefined ? Number(reservationData.apartmentId) : undefined,
                clientId: reservationData.clientId !== undefined ? Number(reservationData.clientId) : undefined,

                // Fechas
                checkInDate: reservationData.checkInDate ? new Date(reservationData.checkInDate).toISOString() : undefined,
                checkOutDate: reservationData.checkOutDate ? new Date(reservationData.checkOutDate).toISOString() : undefined,

                // Datos numéricos IMPORTANTES - mantener como números y en camelCase
                nights: reservationData.nights !== undefined ? Number(reservationData.nights) : undefined,
                pricePerNight: reservationData.price !== undefined ? Number(reservationData.price) :
                    reservationData.pricePerNight !== undefined ? Number(reservationData.pricePerNight) : undefined,
                cleaningFee: reservationData.cleaningFee !== undefined ? Number(reservationData.cleaningFee) : undefined,
                parkingFee: reservationData.parkingFee !== undefined ? Number(reservationData.parkingFee) : undefined,
                otherExpenses: reservationData.otherExpenses !== undefined ? Number(reservationData.otherExpenses) : undefined,
                taxes: reservationData.taxes !== undefined ? Number(reservationData.taxes) : undefined,
                totalAmount: reservationData.totalAmount !== undefined ? Number(reservationData.totalAmount) : undefined,
                amountPaid: reservationData.amountPaid !== undefined ? Number(reservationData.amountPaid) : undefined,
                amountDue: reservationData.amountDue !== undefined ? Number(reservationData.amountDue) : undefined,

                // Estados
                status: reservationData.status,
                paymentStatus: reservationData.paymentStatus,

                // Datos de cliente
                clientName: reservationData.clientName,
                clientLastname: reservationData.clientLastname,
                clientEmail: reservationData.clientEmail,
                clientPhone: reservationData.clientPhone,
                clientAddress: reservationData.clientAddress,
                clientCity: reservationData.clientCity,
                clientCountry: reservationData.clientCountry,
                clientNotes: reservationData.clientNotes
            };

            // Validar que los campos requeridos estén presentes
            if (formattedData.pricePerNight === undefined) {
                throw new Error('El precio por noche es obligatorio');
            }

            if (formattedData.cleaningFee === undefined) {
                throw new Error('La tarifa de limpieza es obligatoria');
            }

            // Filtrar propiedades undefined para no enviar datos innecesarios
            const dataToSend = Object.fromEntries(
                Object.entries(formattedData)
                    .filter(([_, value]) => value !== undefined)
            );

            console.log("Datos formateados para enviar al servidor:", JSON.stringify(dataToSend, null, 2));

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
                throw new Error('Se requiere el ID de la reserva');
            }

            if (!reservationData) {
                throw new Error('No se proporcionaron datos para actualizar la reserva');
            }

            // Generar log para ver exactamente lo que estamos enviando
            console.log("Datos originales de actualización:", JSON.stringify(reservationData, null, 2));

            // Mantener camelCase como espera el backend
            const formattedData = {
                // Datos básicos
                apartmentId: reservationData.apartmentId !== undefined ? Number(reservationData.apartmentId) : undefined,
                clientId: reservationData.clientId !== undefined ? Number(reservationData.clientId) : undefined,

                // Fechas
                checkInDate: reservationData.checkInDate ? new Date(reservationData.checkInDate).toISOString() : undefined,
                checkOutDate: reservationData.checkOutDate ? new Date(reservationData.checkOutDate).toISOString() : undefined,

                // Datos numéricos - mantener como números
                nights: reservationData.nights !== undefined ? Number(reservationData.nights) : undefined,
                pricePerNight: reservationData.price !== undefined ? Number(reservationData.price) :
                    reservationData.pricePerNight !== undefined ? Number(reservationData.pricePerNight) : undefined,
                cleaningFee: reservationData.cleaningFee !== undefined ? Number(reservationData.cleaningFee) : undefined,
                parkingFee: reservationData.parkingFee !== undefined ? Number(reservationData.parkingFee) : undefined,
                otherExpenses: reservationData.otherExpenses !== undefined ? Number(reservationData.otherExpenses) : undefined,
                taxes: reservationData.taxes !== undefined ? Number(reservationData.taxes) : undefined,
                totalAmount: reservationData.totalAmount !== undefined ? Number(reservationData.totalAmount) : undefined,
                amountPaid: reservationData.amountPaid !== undefined ? Number(reservationData.amountPaid) : undefined,
                amountDue: reservationData.amountDue !== undefined ? Number(reservationData.amountDue) : undefined,

                // Estados
                status: reservationData.status,
                paymentStatus: reservationData.paymentStatus,

                // Datos de cliente
                clientName: reservationData.clientName,
                clientLastname: reservationData.clientLastname,
                clientEmail: reservationData.clientEmail,
                clientPhone: reservationData.clientPhone,
                clientAddress: reservationData.clientAddress,
                clientCity: reservationData.clientCity,
                clientCountry: reservationData.clientCountry,
                clientNotes: reservationData.clientNotes
            };

            // Filtrar propiedades undefined para no enviar datos innecesarios
            const dataToSend = Object.fromEntries(
                Object.entries(formattedData)
                    .filter(([_, value]) => value !== undefined)
            );

            console.log("Datos formateados para enviar al servidor:", JSON.stringify(dataToSend, null, 2));

            // Hacer la petición al servidor
            const response = await api.put(`/reservations/${id}`, dataToSend);
            console.log("Respuesta del servidor:", response.status, response.statusText);
            console.log("Datos de respuesta:", response.data);

            return response.data;
        } catch (error) {
            console.error("Error en update:", error);
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Detalles del error:", error.response.data);
            }
            throw error.response?.data?.message || error.message || 'Error updating reservation';
        }
    },

    deleteReservation: async (id) => {
        try {
            const response = await api.delete(`/reservations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error deleting reservation';
        }
    },

    registerPayment: async (id, paymentData) => {
        try {
            // Verificar que tenemos los datos necesarios
            if (!paymentData || !paymentData.amount) {
                throw new Error('Se requiere al menos el monto del pago');
            }

            // Verificar si hay datos para actualizar la reserva
            const hasReservationUpdate = !!paymentData.reservation_update;

            // Construir los datos para enviar al servidor
            const formattedData = {
                // Datos del pago
                amount: parseFloat(paymentData.amount),
                paymentMethod: paymentData.payment_method,
                notes: paymentData.notes || '',
                // Datos actualizados de la reserva (si existen)
                reservation_update: hasReservationUpdate ? {
                    amount_paid: paymentData.reservation_update.amount_paid,
                    amount_due: paymentData.reservation_update.amount_due,
                    payment_status: paymentData.reservation_update.payment_status
                } : undefined
            };

            console.log("Enviando datos de pago:", formattedData);
            console.log("URL de petición:", `/reservations/${id}/payments`);

            // Intentar hacer la petición POST
            try {
                const response = await api.post(`/reservations/${id}/payments`, formattedData);
                console.log("Respuesta del servidor:", response.data);
                return response.data;
            } catch (apiError) {
                console.error("Error en la petición API:", apiError);
                if (apiError.response) {
                    console.error("Código de respuesta:", apiError.response.status);
                    console.error("Datos de respuesta:", apiError.response.data);
                }
                throw apiError;
            }
        } catch (error) {
            console.error("Error al registrar pago:", error);
            if (error.response) {
                console.error("Detalles del error:", error.response.data);
                console.error("Status:", error.response.status);
            }
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

    sendConfirmation: async (id) => {
        try {
            const response = await api.post(`/reservations/${id}/send-confirmation`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error sending confirmation';
        }
    },

    sendPdfByEmail: async (id, email, pdfBlob) => {
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('pdf', pdfBlob, `reservation_${id}.pdf`);

            await api.post(`/reservations/${id}/send-pdf`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
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
                throw new Error('Se requiere el ID de la reserva');
            }

            const data = {
                paymentStatus: paymentData.paymentStatus,
                amountPaid: Number(paymentData.amountPaid),
                amountDue: Number(paymentData.amountDue)
            };

            console.log("Actualizando estado de pago para reserva:", id);
            console.log("Datos de actualización:", data);

            const response = await api.patch(`/reservations/${id}/payment-status`, data);
            console.log("Respuesta del servidor:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar estado de pago:", error);
            if (error.response) {
                console.error("Detalles del error:", error.response.data);
            }
            throw error.response?.data?.message || 'Error updating payment status';
        }
    },

    simpleRegisterPayment: async (id, amount, method = 'cash') => {
        try {
            if (!id) {
                throw new Error('Se requiere el ID de la reserva');
            }

            const numericAmount = parseFloat(amount);
            if (isNaN(numericAmount) || numericAmount <= 0) {
                throw new Error('El monto del pago debe ser positivo');
            }

            const data = {
                amount: numericAmount,
                paymentMethod: method,
                notes: `Payment registered from admin panel - Method: ${method}`
            };

            console.log("Registrando pago simple:", data);

            // Usar un endpoint más simple si el problema persiste
            const response = await api.post(`/payments/register/${id}`, data);
            console.log("Respuesta del servidor:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error al registrar pago simple:", error);
            if (error.response) {
                console.error("Detalles del error:", error.response.data);
            }
            throw error.response?.data?.message || error.message || 'Error registering simple payment';
        }
    },

    // Función específica para actualizar solo el parking fee
    updateParkingFee: async (id, parkingFee) => {
        try {
            if (!id) {
                throw new Error('Se requiere el ID de la reserva');
            }

            // Convertir a número
            const numericFee = Math.max(0, parseFloat(parkingFee) || 0);

            console.log(`Actualizando parking fee para reserva ${id} a $${numericFee}`);

            // Enviar como número al backend en camelCase
            const data = {
                parkingFee: numericFee
            };

            // Usar PATCH para actualización parcial
            const response = await api.patch(`/reservations/${id}`, data);
            console.log("Respuesta:", response.status, response.statusText);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar parking fee:", error);
            if (error.response) {
                console.error("Detalles del error:", error.response.data);
            }

            throw error.response?.data?.message || error.message || 'Error updating parking fee';
        }
    },

    // Función específica para actualizar solo el cleaning fee
    updateCleaningFee: async (id, cleaningFee) => {
        try {
            if (!id) {
                throw new Error('Se requiere el ID de la reserva');
            }

            // Convertir a número
            const numericFee = Math.max(0, parseFloat(cleaningFee) || 0);

            console.log(`Actualizando cleaning fee para reserva ${id} a $${numericFee}`);

            // Enviar como número al backend en camelCase
            const data = {
                cleaningFee: numericFee
            };

            const response = await api.patch(`/reservations/${id}`, data);
            console.log("Respuesta:", response.status, response.statusText);
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
                throw new Error('Se requiere el ID de la reserva');
            }

            // Convertir a número
            const numericValue = Math.max(0, parseFloat(otherExpenses) || 0);

            console.log(`Actualizando other expenses para reserva ${id} a $${numericValue}`);

            // Enviar como número al backend en camelCase
            const data = {
                otherExpenses: numericValue
            };

            const response = await api.patch(`/reservations/${id}`, data);
            console.log("Respuesta:", response.status, response.statusText);
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
                throw new Error('Se requiere el ID de la reserva');
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

            if (feeData.otherExpenses !== undefined) {
                const value = Math.max(0, parseFloat(feeData.otherExpenses) || 0);
                dataToSend.otherExpenses = value;
            }

            // También podría enviarse pricePerNight si fue modificado
            if (feeData.price !== undefined || feeData.pricePerNight !== undefined) {
                const value = Math.max(0, parseFloat(feeData.price || feeData.pricePerNight) || 0);
                dataToSend.pricePerNight = value;
            }

            console.log(`Actualizando tarifas para reserva ${id}:`, dataToSend);

            // Si no hay nada que actualizar, salir
            if (Object.keys(dataToSend).length === 0) {
                return { message: 'No hay tarifas para actualizar' };
            }

            // Usar el endpoint PATCH para actualización parcial
            const response = await api.patch(`/reservations/${id}`, dataToSend);
            console.log("Respuesta del servidor:", response.status, response.statusText);
            console.log("Datos actualizados:", response.data);

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
