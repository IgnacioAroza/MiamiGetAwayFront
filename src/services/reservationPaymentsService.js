import api from '../utils/api';

const reservationPaymentService = {
    getAllPayments: async () => {
        try {
            const response = await api.get('/reservation-payments');
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error fetching all payments';
        }
    },

    getPaymentById: async (id) => {
        try {
            const response = await api.get(`/reservation-payments/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error fetching payment by id';
        }
    },

    createPayment: async (paymentData) => {
        try {
            console.log("Datos para crear pago:", paymentData);

            // Extraer el ID de la reserva y el resto de los datos
            const { reservationId, ...restPaymentData } = paymentData;

            if (!reservationId) {
                throw new Error('Se requiere el ID de la reserva');
            }

            // Formatear los datos para el backend
            const dataToSend = {
                ...restPaymentData,
                amount: parseFloat(restPaymentData.amount),
                // Asegurarse de que el método de pago sea uno de los permitidos
                payment_method: restPaymentData.paymentMethod || 'cash',
                payment_date: restPaymentData.paymentDate,
                // Eliminar los campos que no espera el backend
                paymentMethod: undefined,
                paymentDate: undefined
            };

            console.log("Datos formateados para enviar al backend:", dataToSend);

            // Llamar al endpoint de pagos de reservaciones
            const response = await api.post(`/reservations/${reservationId}/payments`, dataToSend);
            console.log("Respuesta del servidor (pago):", response.data);
            return response.data;
        } catch (error) {
            console.error("Error en createPayment:", error);
            if (error.response) {
                console.error("Detalles del error:", error.response.data);
                console.error("Status:", error.response.status);
                console.error("Headers:", error.response.headers);
            }
            throw error.response?.data?.message || 'Error creating payment';
        }
    },

    updatePayment: async (id, paymentData) => {
        try {
            const response = await api.put(`/reservation-payments/${id}`, paymentData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error updating payment';
        }
    },

    deletePayment: async (id) => {
        try {
            const response = await api.delete(`/reservation-payments/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error deleting payment';
        }
    }
};

export default reservationPaymentService;
