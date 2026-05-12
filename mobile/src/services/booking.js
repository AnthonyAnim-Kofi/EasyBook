/**
 * Booking Service
 */
import api from './api';

export const bookingService = {
  async create({ businessId, specialistId, packageId, date, time, notes }) {
    return api.post('/bookings', {
      business_id: businessId,
      specialist_id: specialistId,
      package_id: packageId,
      date,
      time,
      notes,
    });
  },

  async list({ status, limit, offset } = {}) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (limit) params.set('limit', limit);
    if (offset) params.set('offset', offset);
    return api.get(`/bookings?${params.toString()}`);
  },

  async getDetail(id) {
    return api.get(`/bookings/${id}`);
  },

  async updateStatus(id, status) {
    return api.patch(`/bookings/${id}`, { status });
  },

  async cancel(id) {
    return api.patch(`/bookings/${id}`, { status: 'cancelled' });
  },
};

export default bookingService;
