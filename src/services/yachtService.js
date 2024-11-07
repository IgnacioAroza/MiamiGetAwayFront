import api from '../utils/api'

const carService = {
    getAllYachts: async () => {
        try {
            const respose = await api.get('/yachts')
            return respose.data
        } catch (error) {
            console.error('Error fetching yachts:', error)
            throw error
        }
    },

    getYachtById: async (id) => {
        try {
            const respose = await api.get(`/yachts/${id}`)
            return respose.data
        } catch (error) {
            console.error(`Error fetching yacht with id ${id}:`, error)
            throw error
        }
    },

    createYacht: async (carData) => {
        try {
            const response = await api.post('/yachts', carData)
            return response.data
        } catch (error) {
            console.error('Error creating yacht:', error)
            throw error
        }
    },

    updateYacht: async (id, carData) => {
        try {
            const response = await api.put(`/yachts/${id}`, carData)
            return response.data
        } catch (error) {
            console.error(`Error updating yacht with id ${id}:`, error)
            throw error
        }
    },

    deleteYacht: async (id) => {
        try {
            const response = await api.delete(`/yachts/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error deleting yacht with id ${id}:`, error)
            throw error
        }
    }
}

export default carService