import api from '../utils/api'

const adminApartmentService = {
    getAllApartments: async () => {
        try {
            const response = await api.get('/apartments');
            return response.data;
        } catch (error) {
            console.error('Error fetching apartments:', error);
            throw error;
        }
    },

    getApartmentById: async (id) => {
        try {
            const response = await api.get(`/apartments/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching apartment with id ${id}:`, error);
            throw error;
        }
    },

    createApartment: async (apartmentData) => {
        try {
            const response = await api.post('/apartments', apartmentData);
            return response.data;
        } catch (error) {
            console.error('Error creating apartment:', error);
            throw error;
        }
    },

    updateApartment: async (id, apartmentData) => {
        try {
            const response = await api.put(`/apartments/${id}`, apartmentData);
            return response.data;
        } catch (error) {
            console.error(`Error updating apartment with id ${id}:`, error);
            throw error;
        }
    },

    deleteApartment: async (id) => {
        try {
            const response = await api.delete(`/apartments/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting apartment with id ${id}:`, error);
            throw error;
        }
    }
}

export default adminApartmentService;

