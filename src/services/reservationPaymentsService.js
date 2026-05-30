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

            if (receiptImage instanceof File) {
                const form = new FormData();
                if (rest.amount !== undefined) form.append('amount', parseFloat(rest.amount));
                if (rest.payment_method) form.append('paymentMethod', rest.payment_method);
                if (rest.payment_date) form.append('paymentDate', rest.payment_date);
                if (rest.payment_reference) form.append('paymentReference', rest.payment_reference);
                if (rest.notes) form.append('notes', rest.notes);
                form.append('receipt_image', receiptImage);
                if (removeReceiptImage) form.append('remove_receipt_image', 'true');
                const response = await api.put(`/reservation-payments/${id}`, form);
                return response.data;
            }

            // Sin archivo nuevo: JSON (amount queda como number)
            const body = { ...rest };
            if (removeReceiptImage) body.remove_receipt_image = true;
            const response = await api.put(`/reservation-payments/${id}`, body);
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
