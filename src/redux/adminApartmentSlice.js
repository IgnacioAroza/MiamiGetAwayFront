import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../config';

const getToken = () => localStorage.getItem('adminToken');

const api = axios.create({
    baseURL: config.API_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Thunks para operaciones CRUD
export const fetchAdminApartments = createAsyncThunk(
    'adminApartments/fetchAll',
    async () => {
        const response = await api.get('/apartments');
        return response.data;
    }
);

export const fetchAdminApartmentById = createAsyncThunk(
    'adminApartments/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/apartments/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error fetching apartment by id');
        }
    }
);

export const createAdminApartment = createAsyncThunk(
    'adminApartments/create',
    async (apartmentData) => {
        const response = await api.post('/apartments', apartmentData);
        return response.data;
    }
);

export const updateAdminApartment = createAsyncThunk(
    'adminApartments/update',
    async ({ id, data }) => {
        const response = await api.put(`/apartments/${id}`, data);
        return response.data;
    }
);

export const deleteAdminApartment = createAsyncThunk(
    'adminApartments/delete',
    async (id) => {
        await api.delete(`/apartments/${id}`);
        return id;
    }
);

const initialState = {
    apartments: [],
    selectedApartment: null,
    status: 'idle',
    error: null,
    loading: false,
};

const adminApartmentSlice = createSlice({
    name: 'adminApartments',
    initialState,
    reducers: {
        setSelectedApartment: (state, action) => {
            state.selectedApartment = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedApartment: (state) => {
            state.selectedApartment = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchAdminApartments.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
            })
            .addCase(fetchAdminApartments.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.apartments = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAdminApartments.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
                state.loading = false;
            })
            // Fetch By Id
            .addCase(fetchAdminApartmentById.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
            })
            .addCase(fetchAdminApartmentById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedApartment = action.payload;
                state.loading = false;
            })
            .addCase(fetchAdminApartmentById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
                state.loading = false;
            })
            // Create
            .addCase(createAdminApartment.fulfilled, (state, action) => {
                state.apartments.push(action.payload);
                state.error = null;
            })
            .addCase(createAdminApartment.rejected, (state, action) => {
                state.error = action.error.message;
            })
            // Update
            .addCase(updateAdminApartment.fulfilled, (state, action) => {
                const index = state.apartments.findIndex(apt => apt.id === action.payload.id);
                if (index !== -1) {
                    state.apartments[index] = action.payload;
                }
                if (state.selectedApartment?.id === action.payload.id) {
                    state.selectedApartment = action.payload;
                }
                state.error = null;
            })
            .addCase(updateAdminApartment.rejected, (state, action) => {
                state.error = action.error.message;
            })
            // Delete
            .addCase(deleteAdminApartment.fulfilled, (state, action) => {
                state.apartments = state.apartments.filter(apt => apt.id !== action.payload);
                if (state.selectedApartment?.id === action.payload) {
                    state.selectedApartment = null;
                }
                state.error = null;
            })
            .addCase(deleteAdminApartment.rejected, (state, action) => {
                state.error = action.error.message;
            });
    },
});

export const { setSelectedApartment, clearError, clearSelectedApartment } = adminApartmentSlice.actions;

// Selectors
export const selectAllApartments = (state) => state.adminApartments.apartments;
export const selectApartmentStatus = (state) => state.adminApartments.status;
export const selectApartmentError = (state) => state.adminApartments.error;
export const selectSelectedApartment = (state) => state.adminApartments.selectedApartment;

export default adminApartmentSlice.reducer;
