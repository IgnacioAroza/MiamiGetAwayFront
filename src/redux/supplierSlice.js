import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import supplierService from '../services/supplierService';

export const fetchAllSuppliers = createAsyncThunk(
    'suppliers/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await supplierService.getAll();
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
    initialState: { suppliers: [], status: 'idle', error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllSuppliers.fulfilled, (state, action) => {
                state.suppliers = action.payload;
                state.status = 'succeeded';
            })
            .addCase(createSupplier.fulfilled, (state, action) => {
                state.suppliers.push(action.payload);
            })
            .addCase(updateSupplier.fulfilled, (state, action) => {
                const i = state.suppliers.findIndex(s => s.id === action.payload.id);
                if (i !== -1) state.suppliers[i] = action.payload;
            })
            .addCase(deleteSupplier.fulfilled, (state, action) => {
                state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
            });
    },
});

export const selectAllSuppliers = (state) => state.suppliers.suppliers;
export const selectSuppliersStatus = (state) => state.suppliers.status;

export default supplierSlice.reducer;
