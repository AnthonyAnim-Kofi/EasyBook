/**
 * Auth Service — signup, signin, get profile, update profile
 */
import api, { setToken, setStoredUser, clearAuth, getStoredUser } from './api';

export const authService = {
  async signUp({ fullName, email, phone, password, role }) {
    const data = await api.post('/auth/signup', {
      full_name: fullName,
      email,
      phone,
      password,
      role,
    });
    await setToken(data.token);
    await setStoredUser(data.user);
    return data;
  },

  async signIn({ email, password }) {
    const data = await api.post('/auth/signin', { email, password });
    await setToken(data.token);
    await setStoredUser(data.user);
    return data;
  },

  async getMe() {
    try {
      const data = await api.get('/auth/me');
      await setStoredUser(data.user);
      return data.user;
    } catch (err) {
      // If token expired, try returning cached user
      if (err.status === 401) {
        return getStoredUser();
      }
      throw err;
    }
  },

  async updateProfile({ fullName, phone, avatarUrl, location }) {
    const data = await api.put('/auth/me', {
      full_name: fullName,
      phone,
      avatar_url: avatarUrl,
      location,
    });
    await setStoredUser(data.user);
    return data.user;
  },

  async signOut() {
    await clearAuth();
  },

  getStoredUser,
};

export default authService;
