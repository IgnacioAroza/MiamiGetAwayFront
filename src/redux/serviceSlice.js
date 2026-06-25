import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';
import { normalizeServiceItemFromApi } from '../utils/normalizers';

// Usamos el cliente API centralizado con interceptores compartidos

const handleApiError = (error) => {
    if (error.response) {
        return error.response.data?.error || error.response.data?.message || 'An error occurred';
    } else if (error.request) {
        return 'No response received from server';
    }
    return error.message || 'Error setting up the request';
};

export const fetchServices = createAsyncThunk(
    'services/fetchServices',
    async (arg, { rejectWithValue }) => {
        const serviceType = typeof arg === 'string' ? arg : arg.serviceType;
        const params = typeof arg === 'object' ? { ...arg } : {};
        delete params.serviceType;
        try {
            const response = await api.get(`/${serviceType}`, { params: Object.keys(params).length ? params : undefined });
            return { serviceType, data: response.data };
        } catch (error) {
            return rejectWithValue({ serviceType, error: handleApiError(error) });
        }
    }
);

export const createService = createAsyncThunk(
    'services/createService',
    async ({ serviceType, data }, { rejectWithValue }) => {
        try {
            if (serviceType === 'apartments') {
                const formValues = {};
                for (let [key, value] of data.entries()) {
                    formValues[key] = value;
                }
            }

            const response = await api.post(`/${serviceType}`, data);
            return { serviceType, data: response.data };
        } catch (error) {
            return rejectWithValue({ serviceType, error: handleApiError(error) });
        }
    }
);

export const updateService = createAsyncThunk(
    'services/updateService',
    async ({ serviceType, id, data }, { rejectWithValue }) => {
        try {
            if (serviceType === 'apartments') {
                const formValues = {};
                for (let [key, value] of data.entries()) {
                    formValues[key] = value;
                }
            }

            const response = await api.put(`/${serviceType}/${id}`, data);
            return { serviceType, data: response.data };
        } catch (error) {
            return rejectWithValue({ serviceType, error: handleApiError(error) });
        }
    }
);

export const deleteService = createAsyncThunk(
    'services/deleteService',
    async ({ serviceType, id }, { rejectWithValue }) => {
        try {
            await api.delete(`/${serviceType}/${id}`);
            return { serviceType, id };
        } catch (error) {
            return rejectWithValue({ serviceType, error: handleApiError(error) });
        }
    }
);

const initialState = {
    items: {
        cars: [],
        yachts: [],
        apartments: [],
        villas: []
    },
    status: {
        cars: 'idle',
        yachts: 'idle',
        apartments: 'idle',
        villas: 'idle'
    },
    error: {
        cars: null,
        yachts: null,
        apartments: null,
        villas: null
    },
    pagination: {
        cars: null,
        yachts: null,
        apartments: null,
        villas: null,
    },
    selectedService: null,
    currentItem: null,
};

const servicesSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {
        setSelectedService: (state, action) => {
            state.selectedService = action.payload;
        },
        setCurrentItem: (state, action) => {
            state.currentItem = action.payload;
        },
        clearError: (state, action) => {
            if (action.payload) {
                state.error[action.payload] = null;
            } else {
                state.error = initialState.error;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchServices.pending, (state, action) => {
                const serviceType = typeof action.meta.arg === 'string' ? action.meta.arg : action.meta.arg?.serviceType;
                if (serviceType) state.status[serviceType] = 'loading';
            })
            .addCase(fetchServices.fulfilled, (state, action) => {
                const { serviceType, data } = action.payload;
                state.status[serviceType] = 'succeeded';
                state.error[serviceType] = null;
                if (Array.isArray(data)) {
                    state.items[serviceType] = data.map((item) => normalizeServiceItemFromApi(serviceType, item));
                    state.pagination[serviceType] = null;
                } else if (data?.data && data?.pagination) {
                    state.items[serviceType] = data.data.map((item) => normalizeServiceItemFromApi(serviceType, item));
                    state.pagination[serviceType] = data.pagination;
                } else {
                    state.items[serviceType] = [];
                    state.pagination[serviceType] = null;
                }
            })
            .addCase(fetchServices.rejected, (state, action) => {
                const { serviceType, error } = action.payload;
                state.status[serviceType] = 'failed';
                state.error[serviceType] = error;
            })
            .addCase(createService.fulfilled, (state, action) => {
                const { serviceType, data } = action.payload;
                const normalized = normalizeServiceItemFromApi(serviceType, data);
                state.items[serviceType].push(normalized);
                state.error[serviceType] = null;
            })
            .addCase(updateService.fulfilled, (state, action) => {
                const { serviceType, data } = action.payload;
                const normalized = normalizeServiceItemFromApi(serviceType, data);
                const index = state.items[serviceType].findIndex(item => item.id === normalized.id);
                if (index !== -1) {
                    state.items[serviceType][index] = normalized;
                }
                state.error[serviceType] = null;
            })
            .addCase(deleteService.fulfilled, (state, action) => {
                const { serviceType, id } = action.payload;
                state.items[serviceType] = state.items[serviceType].filter(item => item.id !== id);
                state.error[serviceType] = null;
            })
            .addCase(createService.rejected, (state, action) => {
                const { serviceType, error } = action.payload;
                state.status[serviceType] = 'failed';
                state.error[serviceType] = error;
            })
            .addCase(updateService.rejected, (state, action) => {
                const { serviceType, error } = action.payload;
                state.status[serviceType] = 'failed';
                state.error[serviceType] = error;
            })
            .addCase(deleteService.rejected, (state, action) => {
                const { serviceType, error } = action.payload;
                state.status[serviceType] = 'failed';
                state.error[serviceType] = error;
            });
    },
});

export const { setSelectedService, setCurrentItem, clearError } = servicesSlice.actions;

export default servicesSlice.reducer;
