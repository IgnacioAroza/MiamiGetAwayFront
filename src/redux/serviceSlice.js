import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';
import { normalizeServiceItemFromApi } from '../utils/normalizers';

// Usamos el cliente API centralizado con interceptores compartidos

const handleApiError = (error) => {
    if (error.response) {
        if (error.response.status === 401) {
            // El interceptor global ya maneja limpieza/redirección
            throw new Error('Unauthorized: Please log in again.');
        }
        const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
        throw new Error(message);
    } else if (error.request) {
        throw new Error('No response received from server');
    } else {
        throw new Error('Error setting up the request');
    }
};

export const fetchServices = createAsyncThunk(
    'services/fetchServices',
    async (serviceType, { rejectWithValue }) => {
        try {
            const response = await api.get(`/${serviceType}`);
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
                state.status[action.meta.arg] = 'loading';
            })
            .addCase(fetchServices.fulfilled, (state, action) => {
                const { serviceType, data } = action.payload;
                state.status[serviceType] = 'succeeded';
                const list = Array.isArray(data) ? data.map((item) => normalizeServiceItemFromApi(serviceType, item)) : [];
                state.items[serviceType] = list;
                state.error[serviceType] = null;
            })
            .addCase(fetchServices.rejected, (state, action) => {
                const { serviceType, error } = action.payload;
                state.status[serviceType] = 'failed';
                state.error[serviceType] = error.message;
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
                state.error[serviceType] = error.message;
            })
            .addCase(updateService.rejected, (state, action) => {
                const { serviceType, error } = action.payload;
                state.status[serviceType] = 'failed';
                state.error[serviceType] = error.message;
            })
            .addCase(deleteService.rejected, (state, action) => {
                const { serviceType, error } = action.payload;
                state.status[serviceType] = 'failed';
                state.error[serviceType] = error.message;
            });
    },
});

export const { setSelectedService, setCurrentItem, clearError } = servicesSlice.actions;

export default servicesSlice.reducer;
