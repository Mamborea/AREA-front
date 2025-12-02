import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { apiSlice } from '../services/api';
import type { TokenStorage } from '../storage';
import type { ApiAuthResponse, AuthState, User } from '../types';

// Store the token handling

export const persistToken = createAsyncThunk(
  'auth/persistToken',
  async (token: string, { extra }) => {
    const storage = (extra as { storage: TokenStorage }).storage;
    await storage.setToken(token);
    return token;
  }
);

// Clear the token from the storage

export const clearToken = createAsyncThunk(
  'auth/clearToken',
  async (_, { extra }) => {
    const storage = (extra as { storage: TokenStorage }).storage;
    await storage.removeToken();
  }
);

// Load token if present

export const loadToken = createAsyncThunk(
  'auth/loadToken',
  async (_, { extra }) => {
    const storage = (extra as { storage: TokenStorage }).storage;
    return await storage.getToken();
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
      .addMatcher(
        isAnyOf(persistToken.fulfilled, loadToken.fulfilled),
        (state, action: PayloadAction<string | null>) => {
          state.token = action.payload;
          state.isAuthenticated = !!action.payload;
        }
      );
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
