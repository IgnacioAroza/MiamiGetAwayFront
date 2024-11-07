import api from '../utils/api'

const userService = {
    getAllUsers: async () => {
        try {
            const response = await api.get('/reviews');
            return response.data;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    },

    createUser: async (reviewData) => {
        try {
            const response = await api.post('/reviews', reviewData);
            return response.data;
        } catch (error) {
            console.error('Error creating review:', error)
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
            throw error
        }
    },

    deleteReview: async (id) => {
        try {
            const response = await api.delete(`/reviews/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error deleting review with id ${id}:`, error)
            throw error
        }
    }
}

export default userService