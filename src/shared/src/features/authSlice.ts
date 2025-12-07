import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { apiSlice } from '../services/api';
import type { TokenStorage } from '../storage';
import type { ApiAuthResponse, AuthState, User } from '../types';

// Store the token handling

export const persistToken = createAsyncThunk(
  'auth/persistToken',
  async (token: string, { extra, rejectWithValue }) => {
    try {
      const storage = (extra as { storage: TokenStorage }).storage;
      await storage.setToken(token);
      return token;
    } catch (error) {
      console.error('Failed to persist token to storage:', error);
      console.warn(
        'Token persistence failed. You may be logged out on refresh. Check storage quota and permissions.'
      );
      // Return the token anyway so the user can continue their session
      // They'll just be logged out on refresh
      return rejectWithValue(token);
    }
  }
);

// Clear the token from the storage

export const clearToken = createAsyncThunk(
  'auth/clearToken',
  async (_, { extra }) => {
    try {
      const storage = (extra as { storage: TokenStorage }).storage;
      await storage.removeToken();
      return null;
    } catch (error) {
      console.error('Failed to clear token from storage:', error);
      // Continue anyway - we'll clear the in-memory state
      return null;
    }
  }
);

// Load token if present

export const loadToken = createAsyncThunk(
  'auth/loadToken',
  async (_, { extra }) => {
    try {
      const storage = (extra as { storage: TokenStorage }).storage;
      return await storage.getToken();
    } catch (error) {
      console.error('Failed to load token from storage:', error);
      return null;
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  // These reducers react to actions dispatched from other parts of the application
  // NOTE: Circular dependency with apiSlice - both import each other.
  // This works but should be refactored to extract token persistence into a separate module.
  extraReducers: (builder) => {
    builder
      .addMatcher(
        apiSlice.endpoints.login.matchFulfilled,
        (state, { payload }: PayloadAction<ApiAuthResponse>) => {
          state.user = payload.user;
        }
      )
      .addMatcher(
        apiSlice.endpoints.getProfile.matchFulfilled,
        (state, { payload }: PayloadAction<User>) => {
          state.user = payload;
          state.isAuthenticated = !!state.token;
        }
      )
      // Handle token state changes from all token-related actions
      .addMatcher(
        isAnyOf(
          persistToken.fulfilled,
          loadToken.fulfilled,
          clearToken.fulfilled
        ),
        (state, action: PayloadAction<string | null>) => {
          state.token = action.payload;
          state.isAuthenticated = !!action.payload;
        }
      )
      // Handle persistToken rejection - keep token in memory but warn user
      .addMatcher(isAnyOf(persistToken.rejected), (state, action) => {
        // Token is in the meta.arg, use it for the session
        const token = action.meta.arg as string;
        state.token = token;
        state.isAuthenticated = !!token;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
