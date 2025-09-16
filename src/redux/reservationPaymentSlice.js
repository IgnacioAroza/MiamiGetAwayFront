import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reservationPaymentService from '../services/reservationPaymentsService';
import { normalizePaymentFromApi } from '../utils/normalizers';

const initialState = {
    payments: [],
    selectedPayment: null,
    status: 'idle',
    error: null,
    loading: false
};

// Thunks
export const fetchAllPayments = createAsyncThunk(
    'reservationPayments/fetchAll',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const data = await reservationPaymentService.getAllPayments(filters);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPaymentById = createAsyncThunk(
    'reservationPayments/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const data = await reservationPaymentService.getPaymentById(id);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createPayment = createAsyncThunk(
    'reservationPayments/create',
    async (paymentData, { rejectWithValue }) => {
        try {
            const data = await reservationPaymentService.createPayment(paymentData);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updatePayment = createAsyncThunk(
    'reservationPayments/update',
    async ({ id, paymentData }, { rejectWithValue }) => {
        try {
            const data = await reservationPaymentService.updatePayment(id, paymentData);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deletePayment = createAsyncThunk(
    'reservationPayments/delete',
    async (id, { rejectWithValue }) => {
        try {
            await reservationPaymentService.deletePayment(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const reservationPaymentSlice = createSlice({
    name: 'reservationPayments',
    initialState,
    reducers: {
        setSelectedPayment: (state, action) => {
            state.selectedPayment = action.payload;
        },
        clearSelectedPayment: (state) => {
            state.selectedPayment = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchAllPayments.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
            })
            .addCase(fetchAllPayments.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const raw = action.payload || [];
                state.payments = Array.isArray(raw) ? raw.map(normalizePaymentFromApi) : [];
                state.loading = false;
            })
            .addCase(fetchAllPayments.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.loading = false;
            })
            // Fetch By Id
            .addCase(fetchPaymentById.fulfilled, (state, action) => {
                state.selectedPayment = normalizePaymentFromApi(action.payload);
            })
            // Create
            .addCase(createPayment.fulfilled, (state, action) => {
                state.payments.push(normalizePaymentFromApi(action.payload));
            })
            // Update
            .addCase(updatePayment.fulfilled, (state, action) => {
                const normalized = normalizePaymentFromApi(action.payload);
                const index = state.payments.findIndex(payment => payment.id === normalized.id);
                if (index !== -1) {
                    state.payments[index] = normalized;
                }
                if (state.selectedPayment?.id === normalized.id) {
                    state.selectedPayment = normalized;
                }
            })
            // Delete
            .addCase(deletePayment.fulfilled, (state, action) => {
                state.payments = state.payments.filter(payment => payment.id !== action.payload);
                if (state.selectedPayment?.id === action.payload) {
                    state.selectedPayment = null;
                }
            });
    }
});

export const {
    setSelectedPayment,
    clearSelectedPayment,
    clearError
} = reservationPaymentSlice.actions;

export default reservationPaymentSlice.reducer;
