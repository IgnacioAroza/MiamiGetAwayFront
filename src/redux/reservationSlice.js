import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reservationService from '../services/reservationService';

const initialState = {
    reservations: [],
    selectedReservation: null,
    reservationPayments: [],
    status: 'idle',
    error: null,
    loading: false,
};

// Thunks para operaciones principales
export const fetchReservations = createAsyncThunk(
    'reservations/fetchAll',
    async (filters, { rejectWithValue }) => {
        try {
            const data = await reservationService.getAll(filters);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error fetching reservations');
        }
    }
);

export const fetchReservationById = createAsyncThunk(
    'reservations/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const data = await reservationService.getById(id);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error fetching reservation');
        }
    }
);

export const createReservation = createAsyncThunk(
    'reservations/create',
    async (reservationData, { rejectWithValue }) => {
        try {
            const data = await reservationService.create(reservationData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error creating reservation');
        }
    }
);

export const updateReservation = createAsyncThunk(
    'reservations/update',
    async ({ id, reservationData }, { rejectWithValue }) => {
        try {
            const data = await reservationService.update(id, reservationData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error updating reservation');
        }
    }
);

export const deleteReservation = createAsyncThunk(
    'reservations/delete',
    async (id, { rejectWithValue }) => {
        try {
            await reservationService.deleteReservation(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error deleting reservation');
        }
    }
);

// Thunks para pagos
export const registerPayment = createAsyncThunk(
    'reservations/registerPayment',
    async ({ id, paymentData }, { rejectWithValue }) => {
        try {
            const data = await reservationService.registerPayment(id, paymentData);
            return { id, payment: data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error registering payment');
        }
    }
);

export const fetchReservationPayments = createAsyncThunk(
    'reservations/fetchPayments',
    async (id, { rejectWithValue }) => {
        try {
            const data = await reservationService.getReservationPayments(id);
            return { id, payments: data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error fetching payments');
        }
    }
);

// Thunks para documentos y confirmaciones
export const generateReservationPdf = createAsyncThunk(
    'reservations/generatePdf',
    async ({ id, email }, { rejectWithValue }) => {
        try {
            // Generar el PDF
            const pdfBlob = await reservationService.generatePdf(id);

            // Crear URL del blob para descarga
            const pdfUrl = URL.createObjectURL(pdfBlob);

            // Si se proporciona email, enviar el PDF
            if (email) {
                await reservationService.sendPdfByEmail(id, email, pdfBlob);
            }

            return {
                id,
                pdfUrl,
                email
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error generating PDF');
        }
    }
);

export const sendReservationConfirmation = createAsyncThunk(
    'reservations/sendConfirmation',
    async (id, { rejectWithValue }) => {
        try {
            const data = await reservationService.sendConfirmation(id);
            return { id, confirmation: data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error sending confirmation');
        }
    }
);

const reservationSlice = createSlice({
    name: 'reservations',
    initialState,
    reducers: {
        setSelectedReservation: (state, action) => {
            state.selectedReservation = action.payload;
        },
        clearSelectedReservation: (state) => {
            state.selectedReservation = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearReservationPayments: (state) => {
            state.reservationPayments = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchReservations.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
            })
            .addCase(fetchReservations.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.reservations = action.payload;
                state.loading = false;
            })
            .addCase(fetchReservations.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.loading = false;
            })
            // Fetch By Id
            .addCase(fetchReservationById.fulfilled, (state, action) => {
                state.selectedReservation = action.payload;
            })
            // Create
            .addCase(createReservation.fulfilled, (state, action) => {
                state.reservations.push(action.payload);
            })
            // Update
            .addCase(updateReservation.fulfilled, (state, action) => {
                const index = state.reservations.findIndex(res => res.id === action.payload.id);
                if (index !== -1) {
                    state.reservations[index] = action.payload;
                }
                if (state.selectedReservation?.id === action.payload.id) {
                    state.selectedReservation = action.payload;
                }
            })
            // Delete
            .addCase(deleteReservation.fulfilled, (state, action) => {
                state.reservations = state.reservations.filter(res => res.id !== action.payload);
                if (state.selectedReservation?.id === action.payload) {
                    state.selectedReservation = null;
                }
            })
            // Register Payment
            .addCase(registerPayment.fulfilled, (state, action) => {
                const { id, payment } = action.payload;
                const reservation = state.reservations.find(res => res.id === id);
                if (reservation) {
                    reservation.payments = reservation.payments || [];
                    reservation.payments.push(payment);
                }
                if (state.selectedReservation?.id === id) {
                    state.selectedReservation.payments = state.selectedReservation.payments || [];
                    state.selectedReservation.payments.push(payment);
                }
            })
            // Fetch Payments
            .addCase(fetchReservationPayments.fulfilled, (state, action) => {
                const { id, payments } = action.payload;
                state.reservationPayments = payments;
            })
            // Generate PDF
            .addCase(generateReservationPdf.fulfilled, (state, action) => {
                const { id, pdfUrl, email } = action.payload;
                if (state.selectedReservation?.id === id) {
                    state.selectedReservation.pdfUrl = pdfUrl;
                }
            })
            // Send Confirmation
            .addCase(sendReservationConfirmation.fulfilled, (state, action) => {
                if (state.selectedReservation?.id === action.payload.id) {
                    state.selectedReservation.confirmation = action.payload.confirmation;
                }
            });
    }
});

export const {
    setSelectedReservation,
    clearSelectedReservation,
    clearError,
    clearReservationPayments
} = reservationSlice.actions;

export default reservationSlice.reducer;

