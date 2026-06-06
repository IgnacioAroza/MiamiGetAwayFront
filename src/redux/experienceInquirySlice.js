import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import experienceService from '../services/experienceService';

export const fetchAllInquiries = createAsyncThunk(
    'experienceInquiries/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await experienceService.getAllInquiries();
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || 'Error fetching inquiries');
        }
    }
);

export const updateInquiryStatus = createAsyncThunk(
    'experienceInquiries/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await experienceService.updateInquiryStatus(id, status);
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || 'Error updating inquiry status');
        }
    }
);

const experienceInquirySlice = createSlice({
    name: 'experienceInquiries',
    initialState: { inquiries: [], status: 'idle', error: null },
    reducers: {
        clearError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllInquiries.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllInquiries.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.inquiries = action.payload;
            })
            .addCase(fetchAllInquiries.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(updateInquiryStatus.fulfilled, (state, action) => {
                const idx = state.inquiries.findIndex(i => i.id === action.payload.id);
                if (idx !== -1) state.inquiries[idx] = action.payload;
            })
            .addCase(updateInquiryStatus.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearError: clearInquiryError } = experienceInquirySlice.actions;

export const selectAllInquiries = (state) => state.experienceInquiries.inquiries;
export const selectInquiriesStatus = (state) => state.experienceInquiries.status;
export const selectInquiriesError = (state) => state.experienceInquiries.error;

export default experienceInquirySlice.reducer;
