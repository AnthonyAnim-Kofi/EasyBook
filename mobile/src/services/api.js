import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'easybook_user';
const SAVED_EMAIL_KEY = 'easybook_saved_email';

// ─── Storage Helpers ───────────────────────────────────────────────────────

export async function getStoredUser() {
  const json = await AsyncStorage.getItem(USER_KEY);
  return json ? JSON.parse(json) : null;
}

export async function setStoredUser(user) {
  return AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearAuth() {
  await AsyncStorage.removeItem(USER_KEY);
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

export default {
  getStoredUser,
  setStoredUser,
  clearAuth,
  getSavedEmail,
  setSavedEmail,
  removeSavedEmail,
};
