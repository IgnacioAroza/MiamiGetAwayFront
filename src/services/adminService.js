import api from '../utils/api';

const adminService = {
    login: async (username, password) => {
        try {
            const response = await api.post('auth/login', { username, password })
            if (response.data.token) {
                localStorage.setItem('adminToken', response.data.token)
                return response.data
            }
            return null
        } catch (error) {
            throw error.response?.data?.message || 'Authentication failed'
        }
    },

    logout: () => {
        localStorage.removeItem('adminToken')
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('adminToken')
    },

    getProfile: async () => {
        try {
            const response = await api.get('/admins')
            return response.data
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch profile'
        }
    }
}

export default adminService;