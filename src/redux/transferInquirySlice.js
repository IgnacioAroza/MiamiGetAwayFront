import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transferService from '../services/transferService';

export const fetchAllTransferInquiries = createAsyncThunk(
    'transferInquiries/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const res = await transferService.getAllInquiries(params);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Error fetching inquiries');
        }
    }
);

export const updateTransferInquiryStatus = createAsyncThunk(
    'transferInquiries/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await transferService.updateInquiryStatus(id, status);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Error updating inquiry status');
        }
    }
);

const transferInquirySlice = createSlice({
    name: 'transferInquiries',
    initialState: {
        inquiries: [],
        loading: false,
        error: null,
        pagination: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllTransferInquiries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllTransferInquiries.fulfilled, (state, action) => {
                state.loading = false;
                const raw = action.payload;
                if (Array.isArray(raw)) {
                    state.inquiries = raw;
                    state.pagination = null;
                } else if (raw?.data && raw?.pagination) {
                    state.inquiries = raw.data;
                    state.pagination = raw.pagination;
                } else {
                    state.inquiries = [];
                    state.pagination = null;
                }
            })
            .addCase(fetchAllTransferInquiries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateTransferInquiryStatus.pending, (state) => {
                state.error = null;
            })
            .addCase(updateTransferInquiryStatus.fulfilled, (state, action) => {
                const idx = state.inquiries.findIndex((i) => i.id === action.payload.id);
                if (idx !== -1) state.inquiries[idx] = action.payload;
            })
            .addCase(updateTransferInquiryStatus.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export default transferInquirySlice.reducer;

export const selectAllTransferInquiries = (state) => state.transferInquiries.inquiries;
export const selectTransferInquiriesLoading = (state) => state.transferInquiries.loading;
export const selectTransferInquiriesError = (state) => state.transferInquiries.error;
export const selectTransferInquiriesPagination = (state) => state.transferInquiries.pagination;
