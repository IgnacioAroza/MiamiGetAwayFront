import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reservationPaymentService from '../services/reservationPaymentsService';

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
    async (_, { rejectWithValue }) => {
        try {
            const data = await reservationPaymentService.getAllPayments();
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
                state.payments = action.payload;
                state.loading = false;
            })
            .addCase(fetchAllPayments.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.loading = false;
            })
            // Fetch By Id
            .addCase(fetchPaymentById.fulfilled, (state, action) => {
                state.selectedPayment = action.payload;
            })
            // Create
            .addCase(createPayment.fulfilled, (state, action) => {
                state.payments.push(action.payload);
            })
            // Update
            .addCase(updatePayment.fulfilled, (state, action) => {
                const index = state.payments.findIndex(payment => payment.id === action.payload.id);
                if (index !== -1) {
                    state.payments[index] = action.payload;
                }
                if (state.selectedPayment?.id === action.payload.id) {
                    state.selectedPayment = action.payload;
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
