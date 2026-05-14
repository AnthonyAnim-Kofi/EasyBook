import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export const authKey = `${process.env.EXPO_PUBLIC_PROJECT_GROUP_ID}-jwt`;

/**
 * This store manages the authentication state of the application.
 */
export const useAuthStore = create((set) => ({
  isReady: false,
  auth: null,
  appMode: 'customer', // 'customer' or 'business'
  setAuth: (auth) => {
    if (auth) {
      SecureStore.setItemAsync(authKey, JSON.stringify(auth));
      // Default appMode based on role if not set
      set((state) => ({ 
        auth, 
        appMode: state.appMode || (auth.role === 'business_owner' ? 'business' : 'customer')
      }));
    } else {
      SecureStore.deleteItemAsync(authKey);
      set({ auth, appMode: 'customer' });
    }
  },
  setAppMode: (mode) => set({ appMode: mode }),
}));

/**
 * This store manages the state of the authentication modal.
 */
export const useAuthModal = create((set) => ({
  isOpen: false,
  mode: 'signup',
  open: (options) => set({ isOpen: true, mode: options?.mode || 'signup' }),
  close: () => set({ isOpen: false }),
}));