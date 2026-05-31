import api from '../utils/api'
import { normalizeUserFromApi } from '../utils/normalizers'

const userService = {
    getAllUsers: async (filters = {}) => {
        try {
            const params = {};
            ['name', 'lastname', 'email', 'phone'].forEach((key) => {
                const value = filters[key];
                if (typeof value === 'string' && value.trim()) {
                    params[key] = value.trim();
                }
            });
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;

            const response = await api.get('/users', { params });
            const raw = response.data;
            if (Array.isArray(raw)) {
                return { items: raw.map(normalizeUserFromApi), pagination: null };
            }
            return {
                items: (raw?.data || []).map(normalizeUserFromApi),
                pagination: raw?.pagination || null,
            };
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    getUserById: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return normalizeUserFromApi(response.data);
        } catch (error) {
            console.error('Error fetching user by id:', error);
            throw error;
        }
    },

    createUser: async (userData) => {
        try {
            const response = await api.post('/users', userData);
            return normalizeUserFromApi(response.data);
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    },

    updateUser: async (id, userData) => {
        try {
            // Asegurarse de que tenemos un ID válido
            if (!id) {
                throw new Error('User ID is required for update');
            }

            const response = await api.put(`/users/${id}`, userData);
            return normalizeUserFromApi(response.data);
        } catch (error) {
            console.error('Error updating user:', error);
            if (error.response) {
                console.error('Server response:', error.response.data);
            }
            throw error;
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}

export default userService
