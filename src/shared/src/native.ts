import { Platform } from 'react-native'
import { createStore } from './store'
import type { TokenStorage } from './storage'
import { setBaseUrl } from './features/configSlice'
import { loadToken } from './features/authSlice'
import AsyncStorage from '@react-native-async-storage/async-storage'

const nativeStorage: TokenStorage = {
  getToken: () => AsyncStorage.getItem('token'),
  setToken: (token: string) => AsyncStorage.setItem('token', token),
  removeToken: () => AsyncStorage.removeItem('token'),
}

export const store = createStore({
  storage: nativeStorage,
})

const baseUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080'
store.dispatch(setBaseUrl(baseUrl))

store.dispatch(loadToken())

export * from '.'
