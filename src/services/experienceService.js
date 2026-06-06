import api from '../utils/api';

const experienceService = {
    getAll: async () => {
        const res = await api.get('/experiences');
        return res.data;
    },

    getById: async (id) => {
        const res = await api.get(`/experiences/${id}`);
        return res.data;
    },

    create: async (formData) => {
        const res = await api.post('/experiences', formData);
        return res.data;
    },

    update: async (id, formData) => {
        const res = await api.put(`/experiences/${id}`, formData);
        return res.data;
    },

    delete: async (id) => {
        const res = await api.delete(`/experiences/${id}`);
        return res.data;
    },

    createInquiry: async (data) => {
        const res = await api.post('/experiences/inquiries', data);
        return res.data;
    },

    getAllInquiries: async () => {
        const res = await api.get('/experiences/inquiries');
        return res.data;
    },

    updateInquiryStatus: async (id, status) => {
        const res = await api.patch(`/experiences/inquiries/${id}`, { status });
        return res.data;
    },
};

export default experienceService;
