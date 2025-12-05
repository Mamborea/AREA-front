import {
  configureStore,
  isRejectedWithValue,
  type Middleware,
} from '@reduxjs/toolkit';
import authReducer, { clearToken } from '../features/authSlice';
import configReducer from '../features/configSlice';
import { apiSlice } from '../services/api';
import type { TokenStorage } from '../storage';

const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    console.group('RTK Query Error');
    console.error('An API error occurred:', action.payload);
    console.groupEnd();
  }
  return next(action);
};

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
      }).concat(apiSlice.middleware, logoutMiddleware, rtkQueryErrorLogger),
  });
};

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
export type AppDispatch = ReturnType<typeof createStore>['dispatch'];
