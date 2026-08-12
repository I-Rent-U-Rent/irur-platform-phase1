import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('irur_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const propertiesApi = {
  getAll: (params?: Record<string, any>) => api.get('/properties', { params }).then(r => r.data),
  getStats: () => api.get('/properties/stats').then(r => r.data),
  getSearchOptions: () => api.get('/properties/search-options').then(r => r.data),
  getOne: (id: number) => api.get(`/properties/${id}`).then(r => r.data),
  create: (data: FormData) => api.post('/properties', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  update: (id: number, data: FormData) => api.put(`/properties/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  patchStatus: (id: number, status: string) => api.patch(`/properties/${id}/status`, { status }).then(r => r.data),
  syncZillowPhotos: (id: number) => api.post(`/properties/${id}/sync-zillow-photos`).then(r => r.data),
  delete: (id: number) => api.delete(`/properties/${id}`).then(r => r.data),
};

export const leadsApi = {
  submit: (data: Record<string, any>) => api.post('/leads', data).then(r => r.data),
  getAll: (params?: Record<string, any>) => api.get('/leads', { params }).then(r => r.data),
  getStats: () => api.get('/leads/stats').then(r => r.data),
  markContacted: (id: number) => api.patch(`/leads/${id}/contacted`, {}).then(r => r.data),
  delete: (id: number) => api.delete(`/leads/${id}`).then(r => r.data),
};

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
};

export default api;
