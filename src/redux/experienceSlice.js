import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import experienceService from '../services/experienceService';

export const fetchAllExperiences = createAsyncThunk(
    'experiences/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            return await experienceService.getAll(params);
        } catch (error) {
            return rejectWithValue(error?.response?.data?.error || error?.response?.data?.message || 'Error fetching experiences');
        }
    }
);

export const createExperience = createAsyncThunk(
    'experiences/create',
    async (formData, { rejectWithValue }) => {
        try {
            return await experienceService.create(formData);
        } catch (error) {
            return rejectWithValue(error?.response?.data?.error || error?.response?.data?.message || 'Error creating experience');
        }
    }
);

export const updateExperience = createAsyncThunk(
    'experiences/update',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            return await experienceService.update(id, formData);
        } catch (error) {
            return rejectWithValue(error?.response?.data?.error || error?.response?.data?.message || 'Error updating experience');
        }
    }
);

export const deleteExperience = createAsyncThunk(
    'experiences/delete',
    async (id, { rejectWithValue }) => {
        try {
            await experienceService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.error || error?.response?.data?.message || 'Error deleting experience');
        }
    }
);

const experienceSlice = createSlice({
    name: 'experiences',
    initialState: { experiences: [], status: 'idle', error: null, pagination: null },
    reducers: {
        clearError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllExperiences.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllExperiences.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const raw = action.payload;
                if (Array.isArray(raw)) {
                    state.experiences = raw;
                    state.pagination = null;
                } else if (raw?.data && raw?.pagination) {
                    state.experiences = raw.data;
                    state.pagination = raw.pagination;
                } else {
                    state.experiences = [];
                    state.pagination = null;
                }
            })
            .addCase(fetchAllExperiences.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(createExperience.fulfilled, (state, action) => {
                state.experiences.unshift(action.payload);
            })
            .addCase(createExperience.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateExperience.fulfilled, (state, action) => {
                const idx = state.experiences.findIndex(e => e.id === action.payload.id);
                if (idx !== -1) state.experiences[idx] = action.payload;
            })
            .addCase(updateExperience.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteExperience.fulfilled, (state, action) => {
                state.experiences = state.experiences.filter(e => e.id !== action.payload);
            })
            .addCase(deleteExperience.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearError } = experienceSlice.actions;

export const selectAllExperiences = (state) => state.experiences.experiences;
export const selectExperiencesStatus = (state) => state.experiences.status;
export const selectExperiencesError = (state) => state.experiences.error;
export const selectExperiencesPagination = (state) => state.experiences.pagination;

export default experienceSlice.reducer;
