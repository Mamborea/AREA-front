import { configureStore, type Middleware } from '@reduxjs/toolkit';
import authReducer, { clearToken } from '../features/authSlice';
import configReducer from '../features/configSlice';
import { apiSlice } from '../services/api';
import type { TokenStorage } from '../storage';

// Auto clear token on logout

const logoutMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === 'auth/logout') {
    store.dispatch(clearToken());
  }
  return next(action);
};

// Redux Store (will break the app easily on modification)

export const createStore = (config: { storage: TokenStorage }) => {
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      auth: authReducer,
      config: configReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: { storage: config.storage },
        },
      }).concat(apiSlice.middleware, logoutMiddleware),
  });
};

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
export type AppDispatch = ReturnType<typeof createStore>['dispatch'];
