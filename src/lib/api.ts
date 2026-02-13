const API_URL = import.meta.env.VITE_API_URL || 'https://watchparty-backend-jx6f.onrender.com/api';

class ApiClient {
  private token: string | null = null;

  setAuthToken(token: string | null) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['x-auth-token'] = this.token;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async updateProfile(data: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Rooms
  async getRooms(params?: { page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    return this.request(`/rooms?${queryParams.toString()}`);
  }

  async getMyRooms() {
    return this.request('/rooms/my-rooms');
  }

  async getRoom(code: string) {
    return this.request(`/rooms/${code}`);
  }

  async createRoom(data: {
    name: string;
    description?: string;
    isPrivate?: boolean;
    password?: string;
    maxParticipants?: number;
  }) {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinRoom(code: string, password?: string) {
    return this.request(`/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async updateRoom(code: string, data: any) {
    return this.request(`/rooms/${code}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRoom(code: string) {
    return this.request(`/rooms/${code}`, {
      method: 'DELETE',
    });
  }

  async getRoomMessages(code: string, params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return this.request(`/rooms/${code}/messages?${queryParams.toString()}`);
  }

  // Users
  async getUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    
    return this.request(`/users?${queryParams.toString()}`);
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  async updateUserRole(userId: string, role: string) {
    return this.request(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async banUser(userId: string, reason?: string, duration?: number) {
    return this.request(`/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason, duration }),
    });
  }

  async unbanUser(userId: string) {
    return this.request(`/users/${userId}/unban`, {
      method: 'POST',
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Admin
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getAdminAnalytics(days?: number) {
    const queryParams = new URLSearchParams();
    if (days) queryParams.append('days', days.toString());
    
    return this.request(`/admin/analytics?${queryParams.toString()}`);
  }

  async getAdminUsers(params?: { page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    return this.request(`/admin/users?${queryParams.toString()}`);
  }

  async getAdminRooms(params?: { page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    return this.request(`/admin/rooms?${queryParams.toString()}`);
  }

  async getSystemStats() {
    return this.request('/admin/system');
  }

  // Generic methods
  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async post(endpoint: string, body?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint: string, body?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch(endpoint: string, body?: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
