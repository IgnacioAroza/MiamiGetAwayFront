import api from '../utils/api'

const reservationService = {
    getAll: async (filters = {}) => {
        try {
            const response = await api.get('/reservations', { params: filters });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error fetching reservations';
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/reservations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error fetching reservation by id';
        }
    },

    create: async (reservationData) => {
        try {
            const response = await api.post('/reservations', reservationData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error creating reservation';
        }
    },

    update: async (id, reservationData) => {
        try {
            const response = await api.put(`/reservations/${id}`, reservationData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error updating reservation';
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
            const response = await api.post(`/reservations/${id}/payments`, paymentData);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error registering payment';
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
    }
}

export default reservationService;
