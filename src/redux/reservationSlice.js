import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reservationService from '../services/reservationService';
import { normalizeReservationFromApi } from '../utils/normalizers';

const initialState = {
    reservations: [],
    selectedReservation: null,
    reservationPayments: [],
    status: 'idle',
    error: null,
    loading: false,
    lastSynced: null,
    syncStatus: 'idle'
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
            // Asegurarse de que parkingFee sea un número
            if (reservationData.parkingFee !== undefined) {
                // Asegurar que sea un número
                if (typeof reservationData.parkingFee === 'string') {
                    reservationData.parkingFee = parseFloat(reservationData.parkingFee);
                }
            }

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
            // Preservar el error completo con sus propiedades personalizadas
            if (error.isRelatedDataError) {
                return rejectWithValue({
                    message: error.message,
                    details: error.details,
                    suggestedAction: error.suggestedAction,
                    isRelatedDataError: true
                });
            }

            // Para otros errores, usar el mensaje original
            const message = error.message || error.response?.data?.message || 'Error deleting reservation';
            return rejectWithValue({ message, isRelatedDataError: false });
        }
    }
);

// Thunks para pagos
export const registerPayment = createAsyncThunk(
    'reservations/registerPayment',
    async ({ id, paymentData }, { rejectWithValue }) => {
        try {
            const response = await reservationService.registerPayment(id, paymentData);
            return response.data;
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
            // Si se proporciona email, enviar el PDF por email
            if (email) {
                await reservationService.sendPdfByEmail(id, email);
                return {
                    id,
                    email,
                    sentByEmail: true
                };
            }
            // Si no hay email, descargar el PDF directamente
            else {
                // Iniciar la descarga directa del PDF
                const downloadUrl = await reservationService.downloadPdf(id);

                return {
                    id,
                    downloadUrl,
                    sentByEmail: false
                };
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error generating PDF');
        }
    }
);

export const sendReservationConfirmation = createAsyncThunk(
    'reservations/sendConfirmation',
    async ({ id, notificationType = 'confirmation' }) => {
        const data = await reservationService.sendConfirmation(id, notificationType);
        return { id, notificationType, confirmation: data };
    }
);

export const updateReservationPaymentStatus = createAsyncThunk(
    'reservations/updatePaymentStatus',
    async ({ id, paymentData }, { rejectWithValue }) => {
        try {
            const data = await reservationService.updatePaymentStatus(id, paymentData);
            return { id, data };
        } catch (error) {
            return rejectWithValue(error);
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
        },
        // Actualiza el estado de pago de una reserva
        updatePaymentStatus: (state, action) => {
            const { id, paymentStatus, amountPaid, amountDue } = action.payload;
            const reservation = state.reservations.find(res => res.id === id);
            if (reservation) {
                reservation.paymentStatus = paymentStatus;
                reservation.amountPaid = amountPaid;
                reservation.amountDue = amountDue;
            }
            if (state.selectedReservation?.id === id) {
                state.selectedReservation.paymentStatus = paymentStatus;
                state.selectedReservation.amountPaid = amountPaid;
                state.selectedReservation.amountDue = amountDue;
            }
        },
        // Actualiza el estado de una reserva
        updateReservationStatus: (state, action) => {
            const { id, status } = action.payload;
            const reservation = state.reservations.find(res => res.id === id);
            if (reservation) {
                reservation.status = status;
            }
            if (state.selectedReservation?.id === id) {
                state.selectedReservation.status = status;
            }
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
                const raw = action.payload || [];
                state.reservations = Array.isArray(raw) ? raw.map(normalizeReservationFromApi) : [];
                state.loading = false;
            })
            .addCase(fetchReservations.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.loading = false;
            })
            // Fetch By Id
            .addCase(fetchReservationById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReservationById.fulfilled, (state, action) => {
                state.selectedReservation = normalizeReservationFromApi(action.payload);
                state.loading = false;
            })
            .addCase(fetchReservationById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error al cargar la reserva';
            })
            // Create
            .addCase(createReservation.fulfilled, (state, action) => {
                const normalized = normalizeReservationFromApi(action.payload);
                state.reservations.push(normalized);
            })
            // Update
            .addCase(updateReservation.fulfilled, (state, action) => {
                const updated = normalizeReservationFromApi(action.payload);
                const index = state.reservations.findIndex(res => res.id === updated.id);
                if (index !== -1) {
                    state.reservations[index] = updated;
                }
                if (state.selectedReservation?.id === updated.id) {
                    state.selectedReservation = updated;
                }
            })
            .addCase(updateReservation.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.loading = false;
            })
            // Delete
            .addCase(deleteReservation.fulfilled, (state, action) => {
                state.reservations = state.reservations.filter(res => res.id !== action.payload);
                if (state.selectedReservation?.id === action.payload) {
                    state.selectedReservation = null;
                }
            })
            // Register Payment
            .addCase(registerPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerPayment.fulfilled, (state, action) => {
                state.loading = false;
                // Actualizar la reserva seleccionada con los nuevos datos
                if (state.selectedReservation && state.selectedReservation.id === action.payload.id) {
                    state.selectedReservation = action.payload;
                }
            })
            .addCase(registerPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Payments
            .addCase(fetchReservationPayments.fulfilled, (state, action) => {
                const { id, payments } = action.payload;
                state.reservationPayments = payments;
            })
            // Generate PDF
            .addCase(generateReservationPdf.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateReservationPdf.fulfilled, (state, action) => {
                state.loading = false;
                const { id, pdfUrl, email } = action.payload;
                if (state.selectedReservation?.id === id) {
                    state.selectedReservation.pdfUrl = pdfUrl;
                }
            })
            .addCase(generateReservationPdf.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error al generar el PDF';
            })
            // Send Confirmation
            .addCase(sendReservationConfirmation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendReservationConfirmation.fulfilled, (state, action) => {
                state.loading = false;
                const { id, notificationType, confirmation } = action.payload;
                if (state.selectedReservation?.id === id) {
                    state.selectedReservation.notifications = state.selectedReservation.notifications || [];
                    state.selectedReservation.notifications.push({
                        type: notificationType,
                        sentAt: new Date(), // Ahora el backend esperará este formato MM-DD-YYYY HH:mm
                        ...confirmation
                    });
                }
            })
            .addCase(sendReservationConfirmation.rejected, (state, action) => {
                state.loading = false;
                // No establecer el error en el estado global
            })
            // update payment status
            .addCase(updateReservationPaymentStatus.pending, (state) => {
                state.status = 'loading';
                state.loading = true;
            })
            .addCase(updateReservationPaymentStatus.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.loading = false;

                const { id, data } = action.payload || {};
                const normalized = data ? normalizeReservationFromApi(data) : {};

                // Campos de pago a actualizar si vienen del backend
                const paymentPatch = {
                    ...(normalized.paymentStatus !== undefined ? { paymentStatus: normalized.paymentStatus } : {}),
                    ...(normalized.amountPaid !== undefined ? { amountPaid: normalized.amountPaid } : {}),
                    ...(normalized.amountDue !== undefined ? { amountDue: normalized.amountDue } : {}),
                };

                const index = state.reservations.findIndex(res => res.id === id);
                if (index !== -1 && (data || Object.keys(paymentPatch).length)) {
                    state.reservations[index] = {
                        ...state.reservations[index],
                        ...paymentPatch
                    };
                }

                if (state.selectedReservation?.id === id && (data || Object.keys(paymentPatch).length)) {
                    state.selectedReservation = {
                        ...state.selectedReservation,
                        ...paymentPatch
                    };
                }
            })
            .addCase(updateReservationPaymentStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.loading = false;
            });
    }
});

export const {
    setSelectedReservation,
    clearSelectedReservation,
    clearError,
    clearReservationPayments,
    updatePaymentStatus,
    updateReservationStatus
} = reservationSlice.actions;

export default reservationSlice.reducer;
