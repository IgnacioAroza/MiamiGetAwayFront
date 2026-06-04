import api from '../utils/api';

const transferService = {
    // Vehicles
    getAllVehicles: (params = {}) => api.get('/transfers/vehicles', { params }),
    getVehicleById: (id) => api.get(`/transfers/vehicles/${id}`),
    createVehicle: (data) => api.post('/transfers/vehicles', data),
    updateVehicle: (id, data) => api.put(`/transfers/vehicles/${id}`, data),
    deleteVehicle: (id) => api.delete(`/transfers/vehicles/${id}`),

    // Inquiries
    createInquiry: (data) => api.post('/transfers/inquiries', data),
    getAllInquiries: (params = {}) => api.get('/transfers/inquiries', { params }),
    updateInquiryStatus: (id, status) => api.patch(`/transfers/inquiries/${id}`, { status }),
};

export default transferService;
