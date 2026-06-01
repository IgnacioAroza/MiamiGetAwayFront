import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import supplierService from '../services/supplierService';

export const fetchAllSuppliers = createAsyncThunk(
    'suppliers/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            return await supplierService.getAll(params);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const createSupplier = createAsyncThunk(
    'suppliers/create',
    async (data, { rejectWithValue }) => {
        try {
            return await supplierService.create(data);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const updateSupplier = createAsyncThunk(
    'suppliers/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            return await supplierService.update(id, data);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const deleteSupplier = createAsyncThunk(
    'suppliers/delete',
    async (id, { rejectWithValue }) => {
        try {
            await supplierService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const supplierSlice = createSlice({
    name: 'suppliers',
    initialState: { suppliers: [], status: 'idle', error: null, pagination: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllSuppliers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllSuppliers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const raw = action.payload;
                if (Array.isArray(raw)) {
                    state.suppliers = raw;
                    state.pagination = null;
                } else if (raw?.data && raw?.pagination) {
                    state.suppliers = raw.data;
                    state.pagination = raw.pagination;
                } else {
                    state.suppliers = [];
                    state.pagination = null;
                }
            })
            .addCase(fetchAllSuppliers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload ?? action.error.message;
            })
            .addCase(createSupplier.pending, (state) => {
                state.error = null;
            })
            .addCase(createSupplier.fulfilled, (state, action) => {
                state.suppliers.push(action.payload);
            })
            .addCase(createSupplier.rejected, (state, action) => {
                state.error = action.payload ?? action.error.message;
            })
            .addCase(updateSupplier.pending, (state) => {
                state.error = null;
            })
            .addCase(updateSupplier.fulfilled, (state, action) => {
                const i = state.suppliers.findIndex(s => s.id === action.payload.id);
                if (i !== -1) state.suppliers[i] = action.payload;
            })
            .addCase(updateSupplier.rejected, (state, action) => {
                state.error = action.payload ?? action.error.message;
            })
            .addCase(deleteSupplier.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteSupplier.fulfilled, (state, action) => {
                state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
            })
            .addCase(deleteSupplier.rejected, (state, action) => {
                state.error = action.payload ?? action.error.message;
            });
    },
});

export const selectAllSuppliers = (state) => state.suppliers.suppliers;
export const selectSuppliersStatus = (state) => state.suppliers.status;
export const selectSuppliersPagination = (state) => state.suppliers.pagination;

export default supplierSlice.reducer;
