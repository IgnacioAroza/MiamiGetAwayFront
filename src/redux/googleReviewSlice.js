import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import googleReviewService from '../services/googleReviewService';

// Acción async para obtener reviews de Google Business
export const fetchGoogleReviews = createAsyncThunk(
    'googleReviews/fetchGoogleReviews',
    async ({ limit = 50, offset = 0 } = {}, { rejectWithValue }) => {
        try {
            const response = await googleReviewService.getGoogleReviews({ limit, offset });
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Acción async para cargar más reviews (paginación)
export const loadMoreGoogleReviews = createAsyncThunk(
    'googleReviews/loadMoreGoogleReviews',
    async ({ limit = 50, offset }, { getState, rejectWithValue }) => {
        try {
            const response = await googleReviewService.getGoogleReviews({ limit, offset });
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const googleReviewSlice = createSlice({
    name: 'googleReviews',
    initialState: {
        items: [],
        count: 0,
        total: 0,
        limit: 50,
        offset: 0,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        loadMoreStatus: 'idle', // Para manejar el estado de carga de más items
        error: null,
        hasMore: true // Indica si hay más reviews para cargar
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetGoogleReviews: (state) => {
            state.items = [];
            state.count = 0;
            state.total = 0;
            state.offset = 0;
            state.status = 'idle';
            state.loadMoreStatus = 'idle';
            state.error = null;
            state.hasMore = true;
        },
        updatePaginationParams: (state, action) => {
            const { limit, offset } = action.payload;
            if (limit !== undefined) state.limit = limit;
            if (offset !== undefined) state.offset = offset;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch initial Google Reviews
            .addCase(fetchGoogleReviews.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchGoogleReviews.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const { data } = action.payload;

                state.items = data.reviews || [];
                state.count = data.count || 0;
                state.total = data.total || 0;
                state.hasMore = state.items.length < state.total;
                state.error = null;
            })
            .addCase(fetchGoogleReviews.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Load More Google Reviews (pagination)
            .addCase(loadMoreGoogleReviews.pending, (state) => {
                state.loadMoreStatus = 'loading';
            })
            .addCase(loadMoreGoogleReviews.fulfilled, (state, action) => {
                state.loadMoreStatus = 'succeeded';
                const { data } = action.payload;
                const newReviews = data.reviews || [];

                // Agregar nuevas reviews evitando duplicados
                const existingIds = new Set(state.items.map(review => review.id));
                const uniqueNewReviews = newReviews.filter(review => !existingIds.has(review.id));

                state.items = [...state.items, ...uniqueNewReviews];
                state.count = data.count || 0;
                state.total = data.total || 0;
                state.offset += newReviews.length;
                state.hasMore = state.items.length < state.total;
            })
            .addCase(loadMoreGoogleReviews.rejected, (state, action) => {
                state.loadMoreStatus = 'failed';
                state.error = action.payload;
            });
    },
});

export const {
    clearError,
    resetGoogleReviews,
    updatePaginationParams
} = googleReviewSlice.actions;

// Selectores útiles
export const selectGoogleReviews = (state) => state.googleReviews.items;
export const selectGoogleReviewsStatus = (state) => state.googleReviews.status;
export const selectGoogleReviewsError = (state) => state.googleReviews.error;
export const selectGoogleReviewsPagination = (state) => ({
    count: state.googleReviews.count,
    total: state.googleReviews.total,
    limit: state.googleReviews.limit,
    offset: state.googleReviews.offset,
    hasMore: state.googleReviews.hasMore
});
export const selectLoadMoreStatus = (state) => state.googleReviews.loadMoreStatus;

export default googleReviewSlice.reducer;