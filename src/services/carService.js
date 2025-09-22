import api from '../utils/api'

const carService = {
    getAllCars: async (filters = {}) => {
        try {
            // Construir query params si hay filtros
            const queryParams = new URLSearchParams();

            if (filters.minPrice) {
                queryParams.append('minPrice', filters.minPrice);
            }
            if (filters.maxPrice) {
                queryParams.append('maxPrice', filters.maxPrice);
            }
            if (filters.passengers) {
                queryParams.append('passengers', filters.passengers);
            }

            // Construir URL con o sin query params
            const url = queryParams.toString() ? `/cars?${queryParams.toString()}` : '/cars';

            const response = await api.get(url);

            if (response.data && Array.isArray(response.data)) {
                return response.data;
            } else {
                throw new Error('Received data is not in the expected format');
            }
        } catch (error) {
            console.error('Error fetching cars:', error)
            throw error
        }
    },

    getCarById: async (id) => {
        try {
            const response = await api.get(`/cars/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error fetching car with id ${id}:`, error)
            throw error
        }
    },

    createCar: async (carData) => {
        try {
            const response = await api.post('/cars', carData)
            return response.data
        } catch (error) {
            console.error('Error creating car:', error)
            throw error
        }
    },

    updateCar: async (id, carData) => {
        try {
            const response = await api.put(`/cars/${id}`, carData)
            return response.data
        } catch (error) {
            console.error(`Error updating car with id ${id}:`, error)
            throw error
        }
    },

    deleteCar: async (id) => {
        try {
            const response = await api.delete(`/cars/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error deleting car with id ${id}:`, error)
            throw error
        }
    }
}

export default carService