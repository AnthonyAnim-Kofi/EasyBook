import { supabase } from '@/utils/supabase';

export const businessService = {
  async list({ query, city, category, sort, limit, offset } = {}) {
    let q = supabase
      .from('businesses')
      .select('*');

    if (query) {
      q = q.ilike('name', `%${query}%`);
    }
    if (city) {
      q = q.eq('city', city);
    }
    if (category) {
      // In Supabase, we might filter by services_tags containing the category
      q = q.contains('services_tags', [category]);
    }

    if (sort === 'rating') {
      q = q.order('rating', { ascending: false });
    } else {
      q = q.order('created_at', { ascending: false });
    }

    if (limit) {
      q = q.range(offset || 0, (offset || 0) + limit - 1);
    }

    const { data, error } = await q;
    if (error) throw error;
    return { businesses: data };
  },

  async getDetail(id) {
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        specialists (*),
        packages (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return { categories: data };
  },

  async getSpecialists({ businessId, limit } = {}) {
    let q = supabase
      .from('specialists')
      .select('*');

    if (businessId) q = q.eq('business_id', businessId);
    if (limit) q = q.limit(limit);

    const { data, error } = await q;
    if (error) throw error;
    return { specialists: data };
  },

  async getFavourites() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { businesses: [] };

    const { data, error } = await supabase
      .from('favourites')
      .select('business:businesses(*)')
      .eq('user_id', user.id);

    if (error) throw error;
    return { businesses: data.map(f => f.business) };
  },

  async toggleFavourite(businessId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if already favourite
    const { data: existing } = await supabase
      .from('favourites')
      .select('*')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .single();

    if (existing) {
      await supabase
        .from('favourites')
        .delete()
        .eq('user_id', user.id)
        .eq('business_id', businessId);
      return { favourited: false };
    } else {
      await supabase
        .from('favourites')
        .insert({ user_id: user.id, business_id: businessId });
      return { favourited: true };
    }
  },
};

export default businessService;
