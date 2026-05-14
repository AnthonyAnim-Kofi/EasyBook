import { supabase } from '@/utils/supabase';
import { setStoredUser, clearAuth, getStoredUser } from './api';

export const authService = {
  async signUp({ fullName, email, phone, password, role }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role,
        },
      },
    });

    if (error) throw error;
    
    // The handle_new_user trigger in Postgres will create the profile automatically
    // We fetch the profile to ensure we have the synced data
    const profile = await this.getMe();
    return { user: profile, session: data.session };
  },

  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    const profile = await this.getMe();
    return { user: profile, session: data.session };
  },

  async getMe() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        // If Supabase says no user, but we have one stored, it's a stale session
        const stored = await getStoredUser();
        if (stored) {
          console.warn('Supabase session missing, clearing stale local user');
          await clearAuth();
        }
        return null;
      }

      // Fetch profile from public table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        const basicUser = { ...user, ...user.user_metadata };
        await setStoredUser(basicUser);
        return basicUser;
      }

      await setStoredUser(profile);
      return profile;
    } catch (err) {
      console.error('getMe error:', err);
      return getStoredUser();
    }
  },

  async updateProfile(updates) {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      await clearAuth(); // Clear stale state
      throw new Error('Your session has expired. Please log in again.');
    }

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    await setStoredUser(data);
    return data;
  },

  async signOut() {
    await supabase.auth.signOut();
    await clearAuth();
  },

  getStoredUser,
};

export default authService;
