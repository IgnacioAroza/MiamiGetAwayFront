import api from '../utils/api';

const investmentService = {
    getAll: async (params = {}) => {
        const res = await api.get('/investments', { params });
        return res.data;
    },

    getById: async (id) => {
        const res = await api.get(`/investments/${id}`);
        return res.data;
    },

    create: async (formData) => {
        const res = await api.post('/investments', formData);
        return res.data;
    },

    update: async (id, formData) => {
        const res = await api.put(`/investments/${id}`, formData);
        return res.data;
    },

    delete: async (id) => {
        const res = await api.delete(`/investments/${id}`);
        return res.data;
    },
};

export default investmentService;
