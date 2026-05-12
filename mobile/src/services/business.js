/**
 * Business Service — list, search, detail, favourites
 */
import api from './api';

export const businessService = {
  async list({ query, city, category, sort, limit, offset } = {}) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (city) params.set('city', city);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (limit) params.set('limit', limit);
    if (offset) params.set('offset', offset);
    const qs = params.toString();
    return api.get(`/businesses${qs ? `?${qs}` : ''}`);
  },

  async getDetail(id) {
    return api.get(`/businesses/${id}`);
  },

  async getCategories() {
    return api.get('/categories');
  },

  async getSpecialists({ businessId, limit } = {}) {
    const params = new URLSearchParams();
    if (businessId) params.set('business_id', businessId);
    if (limit) params.set('limit', limit);
    return api.get(`/specialists?${params.toString()}`);
  },

  async getFavourites() {
    return api.get('/favourites');
  },

  async toggleFavourite(businessId) {
    return api.post(`/favourites/${businessId}`);
  },
};

export default businessService;
