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
                throw new Error('The price per night is required');
            }

            if (formattedData.cleaningFee === undefined) {
                throw new Error('The cleaning fee is required');
            }

            // Filtrar propiedades undefined para no enviar datos innecesarios
            const dataToSend = Object.fromEntries(
                Object.entries(formattedData)
                    .filter(([_, value]) => value !== undefined)
            );

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

            // Hacer la petición al servidor
            const response = await api.put(`/reservations/${id}`, dataToSend);

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
                throw new Error('The payment amount is required');
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

            // Intentar hacer la petición POST
            try {
                const response = await api.post(`/reservations/${id}/payments`, formattedData);
                return response.data;
            } catch (apiError) {
                console.error("Error in the API request:", apiError);
                if (apiError.response) {
                    console.error("Response code:", apiError.response.status);
                    console.error("Response data:", apiError.response.data);
                }
                throw apiError;
            }
        } catch (error) {
            console.error("Error registering payment:", error);
            if (error.response) {
                console.error("Error details:", error.response.data);
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

    // Nueva función para descarga directa del PDF
    downloadPdf: async (id) => {
        try {
            // Obtener el token de autenticación del almacenamiento local
            const token = localStorage.getItem('adminToken');

            if (!token) {
                throw new Error('No authentication token available. Please log in again.');
            }

            // Primero obtener todos los datos de la reserva
            const reservationResponse = await api.get(`/reservations/${id}`);
            const reservationData = reservationResponse.data;

            // Construir la URL con query parameters para incluir datos importantes
            const queryParams = new URLSearchParams();
            queryParams.append('format', 'pdf');
            queryParams.append('include_details', 'true');

            // Incluir información adicional que podría ser útil
            if (reservationData.client_name || reservationData.clientName) {
                queryParams.append('client_name', reservationData.client_name || reservationData.clientName);
            }

            if (reservationData.check_in_date || reservationData.checkInDate) {
                const checkInDate = reservationData.check_in_date || reservationData.checkInDate;
                queryParams.append('check_in_date', new Date(checkInDate).toISOString());
            }

            const url = `/reservations/${id}/pdf/download?${queryParams.toString()}`;

            // Realizar la solicitud para obtener el PDF
            const response = await api.get(url, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/pdf'
                }
            });

            // Crear un blob URL para el archivo PDF recibido
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const blobUrl = window.URL.createObjectURL(blob);

            // Crear un enlace temporal y hacer clic en él para descargar
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `reservation-${id}-${reservationData.clientLastname}-${reservationData.clientName}.pdf`;
            document.body.appendChild(link);
            link.click();

            // Limpiar después de la descarga
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            }, 100);

            return blobUrl;
        } catch (error) {
            throw error.response?.data?.message || error.message || 'Error downloading PDF';
        }
    },

    sendConfirmation: async (id, notificationType = 'confirmation') => {
        try {
            const response = await api.post(`/reservations/${id}/send-notification`, {
                type: notificationType
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error sending confirmation';
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

    // Función para diagnosticar problemas con la generación de PDF
    diagnosePdfGeneration: async (id) => {
        // 1. Verificar que tenemos un ID válido
        if (!id) {
            throw new Error('The reservation ID is required');
        }

        // 2. Obtener datos completos de la reserva para verificar
        const response = await api.get(`/reservations/${id}`);
        const reservationData = response.data;

        // 3. Verificar campos críticos para el PDF - considerando ambos formatos: camelCase y snake_case
        const fieldsToCheck = [
            { camelCase: 'id', snakeCase: 'id' },
            { camelCase: 'clientName', snakeCase: 'client_name' },
            { camelCase: 'clientEmail', snakeCase: 'client_email' },
            { camelCase: 'clientPhone', snakeCase: 'client_phone' },
            { camelCase: 'checkInDate', snakeCase: 'check_in_date' },
            { camelCase: 'checkOutDate', snakeCase: 'check_out_date' },
            { camelCase: 'nights', snakeCase: 'nights' },
            { camelCase: 'pricePerNight', snakeCase: 'price_per_night' },
            { camelCase: 'totalAmount', snakeCase: 'total_amount' },
            { camelCase: 'amountPaid', snakeCase: 'amount_paid' },
            { camelCase: 'amountDue', snakeCase: 'amount_due' }
        ];

        const missingFields = [];

        fieldsToCheck.forEach(field => {
            // Verificar si el campo existe en cualquiera de los dos formatos
            const camelCaseValue = reservationData[field.camelCase];
            const snakeCaseValue = reservationData[field.snakeCase];

            // Un campo está "presente" si existe en cualquier formato y no es nulo/vacío
            const isPresent =
                (camelCaseValue !== undefined && camelCaseValue !== null && camelCaseValue !== '') ||
                (snakeCaseValue !== undefined && snakeCaseValue !== null && snakeCaseValue !== '');

            if (!isPresent) {
                missingFields.push(field.camelCase);
            }
        });

        // 4. Crear un objeto de datos normalizado para usar en la generación del PDF
        const normalizedData = {
            id: reservationData.id,
            clientName: reservationData.clientName || reservationData.client_name,
            clientEmail: reservationData.clientEmail || reservationData.client_email,
            clientPhone: reservationData.clientPhone || reservationData.client_phone,
            clientAddress: reservationData.clientAddress || reservationData.client_address,
            clientCity: reservationData.clientCity || reservationData.client_city,
            clientCountry: reservationData.clientCountry || reservationData.client_country,
            clientNotes: reservationData.clientNotes || reservationData.client_notes,
            checkInDate: reservationData.checkInDate || reservationData.check_in_date,
            checkOutDate: reservationData.checkOutDate || reservationData.check_out_date,
            nights: reservationData.nights,
            pricePerNight: reservationData.pricePerNight || reservationData.price_per_night,
            cleaningFee: reservationData.cleaningFee || reservationData.cleaning_fee,
            parkingFee: reservationData.parkingFee || reservationData.parking_fee,
            otherExpenses: reservationData.otherExpenses || reservationData.other_expenses,
            taxes: reservationData.taxes,
            totalAmount: reservationData.totalAmount || reservationData.total_amount,
            amountPaid: reservationData.amountPaid || reservationData.amount_paid,
            amountDue: reservationData.amountDue || reservationData.amount_due,
            status: reservationData.status,
            paymentStatus: reservationData.paymentStatus || reservationData.payment_status
        };

        // 5. Verificar datos del apartamento
        const apartmentId = reservationData.apartmentId || reservationData.apartment_id;
        let apartmentData = null;

        if (apartmentId) {
            try {
                const aptResponse = await api.get(`/apartments/${apartmentId}`);
                apartmentData = aptResponse.data;
            } catch (aptError) {
                // Si hay error, dejamos apartmentData como null
            }
        }

        // 6. Devolver resultados del diagnóstico
        return {
            success: missingFields.length === 0,
            reservationData: normalizedData,
            apartmentData,
            missingFields,
            message: missingFields.length === 0
                ? 'All necessary data is present'
                : `Missing required fields: ${missingFields.join(', ')}`
        };
    },
}

export default reservationService;
