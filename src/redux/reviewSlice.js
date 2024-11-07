import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reviewService from '../services/reviewService';

export const fetchReviews = createAsyncThunk(
    'reviews/fetchReviews',
    async (_, { rejectWithValue }) => {
        try {
            const response = await reviewService.getAllUsers();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createReview = createAsyncThunk(
    'reviews/createReview',
    async (reviewData, { rejectWithValue }) => {
        try {
            const response = reviewService.createUser(reviewData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteReview = createAsyncThunk(
    'reviews/deleteReview',
    async (id, { rejectWithValue }) => {
        try {
            await reviewService.deleteReview(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const reviewSlice = createSlice({
    name: 'reviews',
    initialState: {
        items: [],
        status: 'idle',
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReviews.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(createReview.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createReview.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(createReview.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(deleteReview.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = state.items.filter(review => review.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteReview.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearError } = reviewSlice.actions;

export default reviewSlice.reducer;