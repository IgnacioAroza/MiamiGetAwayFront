import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../services/userService';

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const data = await userService.getAllUsers();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error fetching users');
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState: {
        users: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearError } = userSlice.actions;

export default userSlice.reducer;

export const selectUserCount = (state) => state.users?.users?.length || 0;
export const selectUserInfo = (state) => {
    if (!state.users?.users) return [];
    return state.users.users.map(user => ({
        id: user.id,
        firstName: user.name,
        lastName: user.lastname,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        notes: user.notes,
    }));
};