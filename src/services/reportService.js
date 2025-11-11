import api from './api';

export const reportService = {
  // Get all reports
  async getReports(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`/reports?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  // Get report by ID
  async getReportById(id) {
    try {
      const response = await api.get(`/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  },

  // Create new report
  async createReport(reportData) {
    try {
      const response = await api.post('/reports', reportData);
      return response.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  // Update report
  async updateReport(id, reportData) {
    try {
      const response = await api.put(`/reports/${id}`, reportData);
      return response.data;
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  },

  // Delete report
  async deleteReport(id) {
    try {
      const response = await api.delete(`/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  },

  // Execute report
  async executeReport(id, filters = []) {
    try {
      const response = await api.post(`/reports/${id}/execute`, { filters });
      return response.data;
    } catch (error) {
      console.error('Error executing report:', error);
      throw error;
    }
  },

  // Export report
  async exportReport(id, format = 'excel', filters = []) {
    try {
      const response = await api.post(`/reports/${id}/export`, 
        { format, filters },
        { responseType: 'blob' }
      );
      return response;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  },

  // Toggle favorite
  async toggleFavorite(id) {
    try {
      const response = await api.post(`/reports/${id}/favorite`);
      return response.data;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  // Get templates
  async getTemplates() {
    try {
      const response = await api.get('/reports/templates/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  // Get executions history
  async getExecutions(id, page = 1) {
    try {
      const response = await api.get(`/reports/${id}/executions?page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching executions:', error);
      throw error;
    }
  }
};