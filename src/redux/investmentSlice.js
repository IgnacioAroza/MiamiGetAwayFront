import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import investmentService from '../services/investmentService';

export const fetchAllInvestments = createAsyncThunk(
    'investments/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await investmentService.getAll();
        } catch (error) {
            return rejectWithValue(error?.response?.data?.error || error?.response?.data?.message || 'Error fetching investments');
        }
    }
);

export const createInvestment = createAsyncThunk(
    'investments/create',
    async (formData, { rejectWithValue }) => {
        try {
            return await investmentService.create(formData);
        } catch (error) {
            return rejectWithValue(error?.response?.data?.error || error?.response?.data?.message || 'Error creating investment');
        }
    }
);

export const updateInvestment = createAsyncThunk(
    'investments/update',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            return await investmentService.update(id, formData);
        } catch (error) {
            return rejectWithValue(error?.response?.data?.error || error?.response?.data?.message || 'Error updating investment');
        }
    }
);

export const deleteInvestment = createAsyncThunk(
    'investments/delete',
    async (id, { rejectWithValue }) => {
        try {
            await investmentService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.error || error?.response?.data?.message || 'Error deleting investment');
        }
    }
);

const investmentSlice = createSlice({
    name: 'investments',
    initialState: { investments: [], status: 'idle', error: null },
    reducers: {
        clearError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllInvestments.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllInvestments.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.investments = action.payload;
            })
            .addCase(fetchAllInvestments.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(createInvestment.fulfilled, (state, action) => {
                state.investments.unshift(action.payload);
            })
            .addCase(createInvestment.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateInvestment.fulfilled, (state, action) => {
                const idx = state.investments.findIndex(i => i.id === action.payload.id);
                if (idx !== -1) state.investments[idx] = action.payload;
            })
            .addCase(updateInvestment.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteInvestment.fulfilled, (state, action) => {
                state.investments = state.investments.filter(i => i.id !== action.payload);
            })
            .addCase(deleteInvestment.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearError } = investmentSlice.actions;

export const selectAllInvestments = (state) => state.investments.investments;
export const selectInvestmentsStatus = (state) => state.investments.status;
export const selectInvestmentsError = (state) => state.investments.error;

export default investmentSlice.reducer;
