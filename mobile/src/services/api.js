/**
 * EasyBook API Client
 * Base configuration for all API calls from the mobile app.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend URL
const BASE_URL = __DEV__
  ? 'http://localhost:3001/api'  // Development
  : 'https://api.easybook.com/api'; // Production

const TOKEN_KEY = 'easybook_auth_token';
const USER_KEY = 'easybook_user';
const SAVED_EMAIL_KEY = 'easybook_saved_email';

// ─── Token Management ───────────────────────────────────────────────────────

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token) {
  return AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken() {
  return AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getStoredUser() {
  const json = await AsyncStorage.getItem(USER_KEY);
  return json ? JSON.parse(json) : null;
}

export async function setStoredUser(user) {
  return AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearAuth() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

export async function getSavedEmail() {
  return AsyncStorage.getItem(SAVED_EMAIL_KEY);
}

export async function setSavedEmail(email) {
  return AsyncStorage.setItem(SAVED_EMAIL_KEY, email);
}

export async function removeSavedEmail() {
  return AsyncStorage.removeItem(SAVED_EMAIL_KEY);
}

// ─── Base Fetch Wrapper ─────────────────────────────────────────────────────

async function apiFetch(endpoint, options = {}) {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, message: data.error || 'Something went wrong', data };
    }

    return data;
  } catch (error) {
    if (error.status) throw error; // Re-throw API errors
    throw { status: 0, message: 'Network error. Please check your connection.' };
  }
}

// ─── API Methods ────────────────────────────────────────────────────────────

export const api = {
  get: (endpoint) => apiFetch(endpoint),
  post: (endpoint, body) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
};

export default api;
