import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
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

export const createUser = createAsyncThunk(
    'users/createUser',
    async (userData, { rejectWithValue }) => {
        try {
            const data = await userService.createUser(userData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error creating user');
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await userService.updateUser(id, data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error updating user');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (id, { rejectWithValue }) => {
        try {
            await userService.deleteUser(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error deleting user');
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState: {
        users: [],
        selectedUser: null,
        status: 'idle',
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload;
                state.error = null;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Create User
            .addCase(createUser.fulfilled, (state, action) => {
                state.users.push(action.payload);
                state.error = null;
            })
            .addCase(createUser.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Update User
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.users.findIndex(user => user.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser = action.payload;
                }
                state.error = null;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Delete User
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(user => user.id !== action.payload);
                if (state.selectedUser?.id === action.payload) {
                    state.selectedUser = null;
                }
                state.error = null;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearError, setSelectedUser, clearSelectedUser } = userSlice.actions;

export default userSlice.reducer;

// Selectores base
const selectUsersState = (state) => state.users;
const selectUsersArray = (state) => state.users.users;

// Selectores memorizados
export const selectUserCount = createSelector(
    [selectUsersArray],
    (users) => users?.length || 0
);

export const selectAllUsers = createSelector(
    [selectUsersArray],
    (users) => {
        if (!users) return [];
        return users.map(user => ({
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
    }
);

export const selectUserStatus = createSelector(
    [selectUsersState],
    (users) => users.status
);

export const selectUserError = createSelector(
    [selectUsersState],
    (users) => users.error
);

export const selectSelectedUser = createSelector(
    [selectUsersState],
    (users) => users.selectedUser
);