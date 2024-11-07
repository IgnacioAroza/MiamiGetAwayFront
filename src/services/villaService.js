import api from '../utils/api'

const carService = {
    getAllVillas: async () => {
        try {
            const respose = await api.get('/villas')
            return respose.data
        } catch (error) {
            console.error('Error fetching villas:', error)
            throw error
        }
    },

    getVillaById: async (id) => {
        try {
            const respose = await api.get(`/villas/${id}`)
            return respose.data
        } catch (error) {
            console.error(`Error fetching villa with id ${id}:`, error)
            throw error
        }
    },

    createVilla: async (carData) => {
        try {
            const response = await api.post('/villas', carData)
            return response.data
        } catch (error) {
            console.error('Error creating villa:', error)
            throw error
        }
    },

    updateVilla: async (id, carData) => {
        try {
            const response = await api.put(`/villas/${id}`, carData)
            return response.data
        } catch (error) {
            console.error(`Error updating villa with id ${id}:`, error)
            throw error
        }
    },

    deleteVilla: async (id) => {
        try {
            const response = await api.delete(`/villas/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error deleting villa with id ${id}:`, error)
            throw error
        }
    }
}

export default carService