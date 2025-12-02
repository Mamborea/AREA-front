import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { loadToken } from './features/authSlice';
import { setBaseUrl } from './features/configSlice';
import type { TokenStorage } from './storage';
import { createStore } from './store';

const nativeStorage: TokenStorage = {
  getToken: () => AsyncStorage.getItem('token'),
  setToken: (token: string) => AsyncStorage.setItem('token', token),
  removeToken: () => AsyncStorage.removeItem('token'),
};

export const store = createStore({
  storage: nativeStorage,
});

const baseUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
store.dispatch(setBaseUrl(baseUrl));

store.dispatch(loadToken());

export * from '.';
