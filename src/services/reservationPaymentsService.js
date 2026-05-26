import api from '../utils/api';

const reservationPaymentService = {
    getAllPayments: async (filters = {}) => {
        try {
            // Construir los parámetros de consulta
            const queryParams = new URLSearchParams();

            Object.keys(filters).forEach(key => {
                if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                    queryParams.append(key, filters[key]);
                }
            });

            const queryString = queryParams.toString();
            const url = queryString ? `/reservation-payments?${queryString}` : '/reservation-payments';

            const response = await api.get(url);
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
            const { reservationId, receiptImage, ...restPaymentData } = paymentData;

            if (!reservationId) {
                throw new Error('Se requiere el ID de la reserva');
            }

            let body;
            if (receiptImage instanceof File) {
                body = new FormData();
                body.append('amount', parseFloat(restPaymentData.amount));
                body.append('paymentMethod', restPaymentData.paymentMethod || 'cash');
                if (restPaymentData.paymentDate) body.append('paymentDate', restPaymentData.paymentDate);
                if (restPaymentData.paymentReference) body.append('paymentReference', restPaymentData.paymentReference);
                if (restPaymentData.notes) body.append('notes', restPaymentData.notes);
                body.append('receipt_image', receiptImage);
            } else {
                body = {
                    ...restPaymentData,
                    amount: parseFloat(restPaymentData.amount),
                    payment_method: restPaymentData.paymentMethod || 'cash',
                    payment_date: restPaymentData.paymentDate,
                    paymentMethod: undefined,
                    paymentDate: undefined
                };
            }

            const response = await api.post(`/reservations/${reservationId}/payments`, body);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error creating payment';
        }
    },

    updatePayment: async (id, paymentData) => {
        try {
            const { receiptImage, removeReceiptImage, ...rest } = paymentData;

            if (receiptImage instanceof File || removeReceiptImage) {
                const form = new FormData();
                if (rest.amount !== undefined) form.append('amount', parseFloat(rest.amount));
                if (rest.paymentMethod) form.append('paymentMethod', rest.paymentMethod);
                if (rest.paymentDate) form.append('paymentDate', rest.paymentDate);
                if (rest.paymentReference) form.append('paymentReference', rest.paymentReference);
                if (rest.notes) form.append('notes', rest.notes);
                if (receiptImage instanceof File) form.append('receipt_image', receiptImage);
                if (removeReceiptImage) form.append('remove_receipt_image', 'true');
                const response = await api.put(`/reservation-payments/${id}`, form);
                return response.data;
            }

            const response = await api.put(`/reservation-payments/${id}`, rest);
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
