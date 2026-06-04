import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { normalizeApartmentFromApi } from '../utils/normalizers';
import api from '../utils/api';

export const fetchAdminApartments = createAsyncThunk(
    'adminApartments/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/apartments', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Error fetching apartments');
        }
    }
);

export const fetchAdminApartmentById = createAsyncThunk(
    'adminApartments/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/apartments/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Error fetching apartment by id');
        }
    }
);

export const createAdminApartment = createAsyncThunk(
    'adminApartments/create',
    async (apartmentData, { rejectWithValue }) => {
        try {
            const response = await api.post('/apartments', apartmentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Error creating apartment');
        }
    }
);

export const updateAdminApartment = createAsyncThunk(
    'adminApartments/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/apartments/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Error updating apartment');
        }
    }
);

export const deleteAdminApartment = createAsyncThunk(
    'adminApartments/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/apartments/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Error deleting apartment');
        }
    }
);

const initialState = {
    apartments: [],
    selectedApartment: null,
    status: 'idle',
    error: null,
    loading: false,
    pagination: null,
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
                state.loading = false;
                state.error = null;
                const raw = action.payload;
                if (Array.isArray(raw)) {
                    state.apartments = raw.map(normalizeApartmentFromApi);
                    state.pagination = null;
                } else if (raw?.data && raw?.pagination) {
                    state.apartments = raw.data.map(normalizeApartmentFromApi);
                    state.pagination = raw.pagination;
                } else {
                    state.apartments = [];
                    state.pagination = null;
                }
            })
            .addCase(fetchAdminApartments.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload ?? action.error.message;
                state.loading = false;
            })
            // Fetch By Id
            .addCase(fetchAdminApartmentById.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
            })
            .addCase(fetchAdminApartmentById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedApartment = normalizeApartmentFromApi(action.payload);
                state.loading = false;
            })
            .addCase(fetchAdminApartmentById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload ?? action.error.message;
                state.loading = false;
            })
            // Create
            .addCase(createAdminApartment.fulfilled, (state, action) => {
                state.apartments.push(normalizeApartmentFromApi(action.payload));
                state.error = null;
            })
            .addCase(createAdminApartment.rejected, (state, action) => {
                state.error = action.payload ?? action.error.message;
            })
            // Update
            .addCase(updateAdminApartment.fulfilled, (state, action) => {
                const normalized = normalizeApartmentFromApi(action.payload);
                const index = state.apartments.findIndex(apt => apt.id === normalized.id);
                if (index !== -1) {
                    state.apartments[index] = normalized;
                }
                if (state.selectedApartment?.id === normalized.id) {
                    state.selectedApartment = normalized;
                }
                state.error = null;
            })
            .addCase(updateAdminApartment.rejected, (state, action) => {
                state.error = action.payload ?? action.error.message;
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
                state.error = action.payload ?? action.error.message;
            });
    },
});

export const { setSelectedApartment, clearError, clearSelectedApartment } = adminApartmentSlice.actions;

// Selectors
export const selectAllApartments = (state) => state.adminApartments.apartments;
export const selectApartmentStatus = (state) => state.adminApartments.status;
export const selectApartmentError = (state) => state.adminApartments.error;
export const selectSelectedApartment = (state) => state.adminApartments.selectedApartment;
export const selectApartmentPagination = (state) => state.adminApartments.pagination;

export default adminApartmentSlice.reducer;
