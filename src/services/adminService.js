import api from '../utils/api';

const adminService = {
    login: async (username, password) => {
        try {
            const response = await api.post('auth/login', { username, password });
            if (response.data.token) {
                return response.data;
            }
            return null;
        } catch (error) {
            throw error.response?.data?.error || error.response?.data?.message || 'Error de autenticación';
        }
    },

    logout: () => {
        localStorage.removeItem('adminToken');
    },

    isAuthenticated: () => {
        const token = localStorage.getItem('adminToken');
        return !!token;
    },

    getProfile: async () => {
        try {
            const response = await api.get('/admins');
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || error.response?.data?.message || 'Error al obtener el perfil';
        }
    }
};

export default adminService;