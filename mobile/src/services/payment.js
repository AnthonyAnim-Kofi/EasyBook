/**
 * Payment Service
 */
import api from './api';

export const paymentService = {
  async initiate({ bookingId, method, provider, phoneNumber }) {
    return api.post('/payments', {
      booking_id: bookingId,
      method,
      provider,
      phone_number: phoneNumber,
    });
  },

  async getByBooking(bookingId) {
    return api.get(`/payments/booking/${bookingId}`);
  },

  async list() {
    return api.get('/payments');
  },
};

export default paymentService;
