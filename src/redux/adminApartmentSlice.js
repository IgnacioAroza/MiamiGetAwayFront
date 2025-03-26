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
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin-apartments');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error fetching apartments');
        }
    }
);

export const fetchAdminApartmentById = createAsyncThunk(
    'adminApartments/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/admin-apartments/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error fetching apartment by id');
        }
    }
);

export const createAdminApartment = createAsyncThunk(
    'adminApartments/create',
    async (apartmentData, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            // Manejo de datos para form-data
            Object.keys(apartmentData).forEach(key => {
                if (key === 'images') {
                    apartmentData[key].forEach(image => {
                        formData.append('images', image);
                    });
                } else {
                    formData.append(key, apartmentData[key]);
                }
            });

            const response = await api.post('/admin-apartments', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error creating apartment');
        }
    }
);

export const updateAdminApartment = createAsyncThunk(
    'adminApartments/update',
    async ({ id, apartmentData }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            // Manejo de datos para form-data
            Object.keys(apartmentData).forEach(key => {
                if (key === 'images') {
                    apartmentData[key].forEach(image => {
                        formData.append('images', image);
                    });
                } else {
                    formData.append(key, apartmentData[key]);
                }
            });

            const response = await api.put(`/admin-apartments/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error updating apartment');
        }
    }
);

export const deleteAdminApartment = createAsyncThunk(
    'adminApartments/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/admin-apartments/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error deleting apartment');
        }
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
            })
            .addCase(fetchAdminApartments.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
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
                state.error = action.payload;
                state.loading = false;
            })
            // Create
            .addCase(createAdminApartment.fulfilled, (state, action) => {
                state.apartments.push(action.payload);
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
            })
            // Delete
            .addCase(deleteAdminApartment.fulfilled, (state, action) => {
                state.apartments = state.apartments.filter(apt => apt.id !== action.payload);
                if (state.selectedApartment?.id === action.payload) {
                    state.selectedApartment = null;
                }
            });
    },
});

export const { setSelectedApartment, clearError, clearSelectedApartment } = adminApartmentSlice.actions;

export default adminApartmentSlice.reducer;
