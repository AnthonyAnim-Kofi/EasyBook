import { supabase } from '@/utils/supabase';
import { setStoredUser, clearAuth, getStoredUser } from './api';
import { useAuthStore } from '@/utils/auth/store';

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
    
    // If session is null, it means email confirmation is enabled in Supabase
    if (!data.session) {
      return { user: data.user, session: null, confirmationRequired: true };
    }

    const profile = await this.getMe();
    return { user: profile, session: data.session, confirmationRequired: false };
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
        .maybeSingle(); // Use maybeSingle to avoid error if missing

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        const basicUser = { ...user, ...user.user_metadata };
        await setStoredUser(basicUser);
        useAuthStore.getState().setAuth(basicUser);
        return basicUser;
      }

      // If profile is missing but we have a user, create it
      if (!profile) {
        console.warn('Profile missing for authenticated user, creating on the fly...');
        const newProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          phone: parseInt(user.user_metadata?.phone?.replace(/[^0-9]/g, '') || '0'),
          role: user.user_metadata?.role || 'customer',
          username: user.user_metadata?.username,
          avatar_url: user.user_metadata?.avatar_url,
          business_name: user.user_metadata?.business_name,
          business_location: user.user_metadata?.business_location,
          business_category: user.user_metadata?.business_category,
        };

        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (!createError && created) {
          await setStoredUser(created);
          useAuthStore.getState().setAuth(created);
          return created;
        }

        // Fallback to metadata if creation fails
        const fallback = { ...user, ...user.user_metadata };
        await setStoredUser(fallback);
        useAuthStore.getState().setAuth(fallback);
        return fallback;
      }

      // If role is business_owner, check if they have a business registered
      let hasBusiness = false;
      if (profile.role === 'business_owner') {
        const { data: biz } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', profile.id)
          .maybeSingle();
        hasBusiness = !!biz;
      }

      const finalProfile = { ...profile, has_business: hasBusiness };
      await setStoredUser(finalProfile);
      useAuthStore.getState().setAuth(finalProfile);
      return finalProfile;
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
    useAuthStore.getState().setAuth(data);
    return data;
  },

  async signOut() {
    await supabase.auth.signOut();
    await clearAuth();
    useAuthStore.getState().setAuth(null);
  },

  getStoredUser,
};

export default authService;
