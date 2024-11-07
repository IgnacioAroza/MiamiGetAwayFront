import api from '../utils/api'

const carService = {
    getAllApartments: async () => {
        try {
            const respose = await api.get('/apartments')
            return respose.data
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

    createApartment: async (carData) => {
        try {
            const response = await api.post('/apartments', carData)
            return response.data
        } catch (error) {
            console.error('Error creating apartment:', error)
            throw error
        }
    },

    updateApartment: async (id, carData) => {
        try {
            const response = await api.put(`/apartments/${id}`, carData)
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