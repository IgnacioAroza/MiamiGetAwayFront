import api from '../utils/api'

const carService = {
    getAllApartments: async (filters = {}) => {
        try {
            // Construir query params si hay filtros
            const queryParams = new URLSearchParams();

            if (filters.minPrice) {
                queryParams.append('minPrice', filters.minPrice);
            }
            if (filters.maxPrice) {
                queryParams.append('maxPrice', filters.maxPrice);
            }
            if (filters.capacity) {
                queryParams.append('capacity', filters.capacity);
            }
            if (filters.q) {
                queryParams.append('q', filters.q);
            }

            // Construir URL con o sin query params
            const url = queryParams.toString() ? `/apartments?${queryParams.toString()}` : '/apartments';

            const respose = await api.get(url);
            return respose.data;
        } catch (error) {
            console.error('Error fetching apartments:', error)
            throw error
        }
    },

    getApartmentById: async (id) => {
        try {
            const respose = await api.get(`/apartments/${id}`)
            return respose.data
        } catch (error) {
            console.error(`Error fetching apartment with id ${id}:`, error)
            throw error
        }
    },

    createApartment: async (apartmentData) => {
        try {
            const response = await api.post('/apartments', apartmentData)
            return response.data
        } catch (error) {
            console.error('Error creating apartment:', error)
            throw error
        }
    },

    updateApartment: async (id, apartmentData) => {
        try {
            const response = await api.put(`/apartments/${id}`, apartmentData)
            return response.data
        } catch (error) {
            console.error(`Error updating apartment with id ${id}:`, error)
            throw error
        }
    },

    deleteApartment: async (id) => {
        try {
            const response = await api.delete(`/apartments/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error deleting apartment with id ${id}:`, error)
            throw error
        }
    }
}

export default carService