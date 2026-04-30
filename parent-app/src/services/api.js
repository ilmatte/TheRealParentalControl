import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
    });

    // Add auth interceptor
    this.client.interceptors.request.use(async (config) => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      return config;
    });
  }

  // Auth endpoints
  async login(email, password) {
    return this.client.post('/auth/login', { email, password });
  }

  async register(email, password, username) {
    return this.client.post('/auth/register', {
      email,
      password,
      username,
      role: 'parent',
    });
  }

  async getCurrentUser() {
    return this.client.get('/auth/me');
  }

  // Device endpoints
  async getDevices() {
    return this.client.get('/devices/list');
  }

  async getDeviceDetails(deviceId) {
    return this.client.get(`/devices/${deviceId}`);
  }

  // Restriction endpoints
  async getChildRestrictions(childId) {
    return this.client.get(`/restrictions/child/${childId}`);
  }

  async createRestriction(data) {
    return this.client.post('/restrictions', data);
  }

  async updateRestriction(restrictionId, data) {
    return this.client.put(`/restrictions/${restrictionId}`, data);
  }

  async blockWebsite(restrictionId, website) {
    return this.client.post(`/restrictions/${restrictionId}/block-website`, {
      website,
    });
  }

  async unblockWebsite(restrictionId, website) {
    return this.client.post(`/restrictions/${restrictionId}/unblock-website`, {
      website,
    });
  }

  async lockScreen(restrictionId, reason) {
    return this.client.post(`/restrictions/${restrictionId}/lock-screen`, {
      reason,
    });
  }

  async unlockScreen(restrictionId) {
    return this.client.post(`/restrictions/${restrictionId}/unlock-screen`);
  }

  // Activity endpoints
  async getChildActivity(childId, options = {}) {
    return this.client.get(`/activity/child/${childId}`, { params: options });
  }

  async getWebsiteSummary(childId) {
    return this.client.get(`/activity/child/${childId}/websites`);
  }

  async getScreenTimeSummary(childId) {
    return this.client.get(`/activity/child/${childId}/screen-time`);
  }

  async logActivity(activity) {
    return this.client.post('/activity/log', activity);
  }
}

export default new ApiService();
