import api from '../utils/api';

const normalizeAssignment = (data) => {
    if (!data || typeof data !== 'object') return null;
    return {
        id: data.id,
        reservationId: data.reservation_id ?? data.reservationId,
        supplier: data.supplier,
        payout_per_night: data.payout_per_night ?? data.payoutPerNight,
        cleaning_fee: data.cleaning_fee ?? data.cleaningFee ?? 0,
        payment_terms: data.payment_terms ?? data.paymentTerms,
        calculated: data.calculated,
    };
};

const normalizeSupplierPayment = (data) => {
    if (!data || typeof data !== 'object') return null;
    return {
        id: data.id,
        reservationSupplierId: data.reservationSupplierId ?? data.reservation_supplier_id,
        amount: data.amount,
        method: data.method,
        date: data.date,
        referenceNotes: data.referenceNotes ?? data.reference_notes ?? '',
        receiptImages: data.receiptImages ?? data.receipt_images ?? [],
        createdAt: data.createdAt ?? data.created_at,
    };
};

const supplierService = {
    // ── Supplier CRUD ──────────────────────────────────────────────────────────
    getAll: async (params = {}) => {
        const res = await api.get('/suppliers', { params });
        return res.data;
    },

    create: async (data) => {
        const res = await api.post('/suppliers', data);
        return res.data;
    },

    update: async (id, data) => {
        const res = await api.put(`/suppliers/${id}`, data);
        return res.data;
    },

    delete: async (id) => {
        const res = await api.delete(`/suppliers/${id}`);
        return res.data;
    },

    // ── Reservation supplier assignment ────────────────────────────────────────
    getReservationSupplier: async (reservationId) => {
        try {
            const res = await api.get(`/reservations/${reservationId}/supplier`);
            return normalizeAssignment(res.data);
        } catch (error) {
            if (error.response?.status === 404) return null;
            throw error.response?.data?.error || error.response?.data?.message || 'Error fetching supplier';
        }
    },

    assignSupplier: async (reservationId, data) => {
        const res = await api.post(`/reservations/${reservationId}/supplier`, data);
        return normalizeAssignment(res.data);
    },

    updateSupplierTerms: async (reservationId, data) => {
        const res = await api.put(`/reservations/${reservationId}/supplier`, data);
        return normalizeAssignment(res.data);
    },

    unassignSupplier: async (reservationId) => {
        const res = await api.delete(`/reservations/${reservationId}/supplier`);
        return res.data;
    },

    updateSupplierStatus: async (reservationId, status) => {
        const res = await api.patch(`/reservations/${reservationId}/supplier-status`, { status });
        return res.data;
    },

    // ── Supplier payments ──────────────────────────────────────────────────────
    getSupplierPayments: async (reservationId) => {
        try {
            const res = await api.get(`/reservations/${reservationId}/supplier/payments`);
            return Array.isArray(res.data) ? res.data.map(normalizeSupplierPayment) : [];
        } catch (error) {
            if (error.response?.status === 404) return [];
            throw error.response?.data?.error || error.response?.data?.message || 'Error fetching supplier payments';
        }
    },

    createSupplierPayment: async (reservationId, paymentData, files = []) => {
        const form = new FormData();
        form.append('amount', paymentData.amount);
        form.append('method', paymentData.method);
        form.append('date', paymentData.date);
        if (paymentData.reference_notes) form.append('reference_notes', paymentData.reference_notes);
        files.forEach(file => form.append('receipt_images', file));
        const res = await api.post(`/reservations/${reservationId}/supplier/payments`, form);
        return normalizeSupplierPayment(res.data);
    },

    deleteSupplierPayment: async (id) => {
        const res = await api.delete(`/supplier-payments/${id}`);
        return res.data;
    },
};

export default supplierService;
