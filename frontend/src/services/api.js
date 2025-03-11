import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}token/refresh/`, {
          refresh: refreshToken,
        });
        
        // Save the new tokens
        localStorage.setItem('access_token', response.data.access);
        
        // Retry the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => apiClient.post('register/', userData),
  login: (credentials) => apiClient.post('token/', credentials),
  refreshToken: (refreshToken) => apiClient.post('token/refresh/', { refresh: refreshToken }),
  getProfile: () => apiClient.get('profile/'),
  updateProfile: (userData) => apiClient.patch('profile/', userData),
};

// File services
export const fileService = {
  getFiles: () => apiClient.get('files/'),
  uploadFile: (fileData) => {
    const formData = new FormData();
    formData.append('file', fileData);
    return apiClient.post('files/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: (fileId) => apiClient.delete(`files/${fileId}/`),
  downloadFile: (fileId) => apiClient.get(`download/${fileId}/`, { responseType: 'blob' }),
};

// Address services
export const addressService = {
  getAddresses: () => apiClient.get('addresses/'),
  createAddress: (addressData) => apiClient.post('addresses/', addressData),
  updateAddress: (addressId, addressData) => apiClient.put(`addresses/${addressId}/`, addressData),
  deleteAddress: (addressId) => apiClient.delete(`addresses/${addressId}/`),
};

// Phone number services
export const phoneService = {
  getPhoneNumbers: () => apiClient.get('phone-numbers/'),
  createPhoneNumber: (phoneData) => apiClient.post('phone-numbers/', phoneData),
  updatePhoneNumber: (phoneId, phoneData) => apiClient.put(`phone-numbers/${phoneId}/`, phoneData),
  deletePhoneNumber: (phoneId) => apiClient.delete(`phone-numbers/${phoneId}/`),
};

// Stats service
export const statsService = {
  getStats: () => apiClient.get('stats/'),
};

export default apiClient;