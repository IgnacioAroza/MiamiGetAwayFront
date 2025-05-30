import api from '../utils/api'

const userService = {
    getAllUsers: async () => {
        try {
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    getUserById: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user by id:', error);
            throw error;
        }
    },

    createUser: async (userData) => {
        try {
            const response = await api.post('/users', userData);
            return response.data;
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
            return response.data;
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