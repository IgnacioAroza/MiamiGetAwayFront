import api from '../utils/api';

const transferService = {
    // Vehicles
    getAllVehicles: () => api.get('/transfers/vehicles'),
    getVehicleById: (id) => api.get(`/transfers/vehicles/${id}`),
    createVehicle: (data) => api.post('/transfers/vehicles', data),
    updateVehicle: (id, data) => api.put(`/transfers/vehicles/${id}`, data),
    deleteVehicle: (id) => api.delete(`/transfers/vehicles/${id}`),

    // Inquiries
    createInquiry: (data) => api.post('/transfers/inquiries', data),
    getAllInquiries: () => api.get('/transfers/inquiries'),
    updateInquiryStatus: (id, status) => api.patch(`/transfers/inquiries/${id}`, { status }),
};

export default transferService;
