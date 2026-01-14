// frontend/src/services/informationRequestService.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const informationRequestService = {
  // Get all requests for the vendor
  getVendorRequests: async (params = {}) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/api/information-requests/vendor/requests`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor requests:', error);
      throw error.response?.data || { error: 'Failed to fetch requests' };
    }
  },

  // Get request details
  getRequestDetails: async (requestId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${API_URL}/api/information-requests/vendor/requests/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching request details:', error);
      throw error.response?.data || { error: 'Failed to fetch request details' };
    }
  },

  // Submit response to a request
  submitResponse: async (requestId, responseData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_URL}/api/information-requests/vendor/requests/${requestId}/respond`,
        responseData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting response:', error);
      throw error.response?.data || { error: 'Failed to submit response' };
    }
  },

  // Get request statistics
  getRequestStats: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${API_URL}/api/information-requests/vendor/requests/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching request stats:', error);
      throw error.response?.data || { error: 'Failed to fetch request statistics' };
    }
  },

  // Upload file (you might need to adjust based on your upload endpoint)
  uploadFile: async (file) => {
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_URL}/documents/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error.response?.data || { error: 'Failed to upload file' };
    }
  },

  // Send reminder
  sendReminder: async (requestId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_URL}/api/information-requests/vendor/requests/${requestId}/reminder`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error.response?.data || { error: 'Failed to send reminder' };
    }
  }
};

export default informationRequestService;