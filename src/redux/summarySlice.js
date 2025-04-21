import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import summaryService from '../services/summaryService';

// Thunks
export const generateSummary = createAsyncThunk(
    'summary/generate',
    async ({ month, year }, { rejectWithValue }) => {
        try {
            const response = await summaryService.generateSummary(month, year);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchSummaryDetails = createAsyncThunk(
    'summary/fetchDetails',
    async ({ year, month }, { rejectWithValue }) => {
        try {
            const response = await summaryService.getSummaryDetails(year, month);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const downloadSummaryPDF = createAsyncThunk(
    'summary/downloadPDF',
    async ({ year, month }, { rejectWithValue }) => {
        try {
            await summaryService.downloadSummaryPDF(year, month);
            return { year, month };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const sendSummaryEmail = createAsyncThunk(
    'summary/sendEmail',
    async ({ year, month }, { rejectWithValue }) => {
        try {
            const response = await summaryService.sendSummaryEmail(year, month);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Estado inicial
const initialState = {
    currentSummary: {
        totalReservations: 0,
        totalPayments: 0,
        totalRevenue: 0,
        reservations: [],
        payments: [],
        summary: null
    },
    loading: false,
    error: null,
    success: false,
    pdfDownloading: false,
    emailSending: false
};

// Slice
const summarySlice = createSlice({
    name: 'summary',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        resetState: () => initialState
    },
    extraReducers: (builder) => {
        // Generar resumen
        builder
            .addCase(generateSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateSummary.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSummary = {
                    ...state.currentSummary,
                    ...action.payload,
                    totalReservations: action.payload.summary?.totalReservations || 0,
                    totalPayments: action.payload.summary?.totalPayments || 0,
                    totalRevenue: action.payload.summary?.totalRevenue || '0',
                    reservations: action.payload.reservations || [],
                    payments: action.payload.payments || [],
                    summary: action.payload.summary || null
                };
                state.success = true;
            })
            .addCase(generateSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Obtener detalles
        builder
            .addCase(fetchSummaryDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSummaryDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSummary = {
                    ...state.currentSummary,
                    ...action.payload,
                    totalReservations: action.payload.summary?.totalReservations || 0,
                    totalPayments: action.payload.summary?.totalPayments || 0,
                    totalRevenue: action.payload.summary?.totalRevenue || '0',
                    reservations: action.payload.reservations || [],
                    payments: action.payload.payments || [],
                    summary: action.payload.summary || null
                };
            })
            .addCase(fetchSummaryDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Descargar PDF
        builder
            .addCase(downloadSummaryPDF.pending, (state) => {
                state.pdfDownloading = true;
                state.error = null;
            })
            .addCase(downloadSummaryPDF.fulfilled, (state) => {
                state.pdfDownloading = false;
            })
            .addCase(downloadSummaryPDF.rejected, (state, action) => {
                state.pdfDownloading = false;
                state.error = action.payload;
            });

        // Enviar email
        builder
            .addCase(sendSummaryEmail.pending, (state) => {
                state.emailSending = true;
                state.error = null;
            })
            .addCase(sendSummaryEmail.fulfilled, (state) => {
                state.emailSending = false;
                state.success = true;
            })
            .addCase(sendSummaryEmail.rejected, (state, action) => {
                state.emailSending = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, resetState } = summarySlice.actions;
export default summarySlice.reducer; 