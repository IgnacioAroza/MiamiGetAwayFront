import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transferService from '../services/transferService';

export const fetchAllVehicles = createAsyncThunk(
    'transferVehicles/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const res = await transferService.getAllVehicles(params);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Error fetching vehicles');
        }
    }
);

export const fetchVehicleById = createAsyncThunk(
    'transferVehicles/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const res = await transferService.getVehicleById(id);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Error fetching vehicle');
        }
    }
);

export const createVehicle = createAsyncThunk(
    'transferVehicles/create',
    async (data, { rejectWithValue }) => {
        try {
            const res = await transferService.createVehicle(data);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Error creating vehicle');
        }
    }
);

export const updateVehicle = createAsyncThunk(
    'transferVehicles/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await transferService.updateVehicle(id, data);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Error updating vehicle');
        }
    }
);

export const deleteVehicle = createAsyncThunk(
    'transferVehicles/delete',
    async (id, { rejectWithValue }) => {
        try {
            await transferService.deleteVehicle(id);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Error deleting vehicle');
        }
    }
);

const transferVehicleSlice = createSlice({
    name: 'transferVehicles',
    initialState: {
        vehicles: [],
        selectedVehicle: null,
        loading: false,
        error: null,
        pagination: null,
    },
    reducers: {
        clearSelectedVehicle: (state) => {
            state.selectedVehicle = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllVehicles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllVehicles.fulfilled, (state, action) => {
                state.loading = false;
                const raw = action.payload;
                if (Array.isArray(raw)) {
                    state.vehicles = raw;
                    state.pagination = null;
                } else if (raw?.data && raw?.pagination) {
                    state.vehicles = raw.data;
                    state.pagination = raw.pagination;
                } else {
                    state.vehicles = [];
                    state.pagination = null;
                }
            })
            .addCase(fetchAllVehicles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchVehicleById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVehicleById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedVehicle = action.payload;
            })
            .addCase(fetchVehicleById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createVehicle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createVehicle.fulfilled, (state, action) => {
                state.loading = false;
                state.vehicles.push(action.payload);
            })
            .addCase(createVehicle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateVehicle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateVehicle.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.vehicles.findIndex((v) => v.id === action.payload.id);
                if (idx !== -1) state.vehicles[idx] = action.payload;
                if (state.selectedVehicle?.id === action.payload.id) {
                    state.selectedVehicle = action.payload;
                }
            })
            .addCase(updateVehicle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteVehicle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteVehicle.fulfilled, (state, action) => {
                state.loading = false;
                state.vehicles = state.vehicles.filter((v) => v.id !== action.payload);
            })
            .addCase(deleteVehicle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearSelectedVehicle } = transferVehicleSlice.actions;
export default transferVehicleSlice.reducer;

export const selectAllVehicles = (state) => state.transferVehicles.vehicles;
export const selectSelectedVehicle = (state) => state.transferVehicles.selectedVehicle;
export const selectVehiclesLoading = (state) => state.transferVehicles.loading;
export const selectVehiclesError = (state) => state.transferVehicles.error;
export const selectVehiclesPagination = (state) => state.transferVehicles.pagination;
