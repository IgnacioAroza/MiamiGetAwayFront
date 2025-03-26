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
            const response = await api.post('/reservation-payments', paymentData);
            return response.data;
        } catch (error) {
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
