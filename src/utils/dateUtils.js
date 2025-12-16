// frontend/src/utils/dateUtils.js

/**
 * Format date to human readable format
 * @param {string|Date} date - ISO string or Date object
 * @param {string} format - 'short', 'medium', 'long', 'full'
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'medium') => {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const options = {
      short: {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      },
      medium: {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      },
      long: {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      },
      full: {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      }
    };
    
    return dateObj.toLocaleDateString('en-US', options[format] || options.medium);
  };
  
  /**
   * Get relative time (e.g., "2 days ago", "Due tomorrow")
   * @param {string|Date} date - ISO string or Date object
   * @param {boolean} isDueDate - Whether this is a due date for status
   * @returns {string} Relative time string
   */
  export const getRelativeTime = (date, isDueDate = false) => {
    if (!date) return 'No date';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = dateObj - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (isDueDate) {
      if (diffDays === 0) return 'Due today';
      if (diffDays === 1) return 'Due tomorrow';
      if (diffDays === -1) return 'Was due yesterday';
      if (diffDays > 0) return `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
      if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
    }
    
    if (Math.abs(diffMins) < 60) {
      if (Math.abs(diffMins) < 1) return 'Just now';
      return `${Math.abs(diffMins)} min${Math.abs(diffMins) === 1 ? '' : 's'} ${diffMins < 0 ? 'ago' : 'from now'}`;
    }
    
    if (Math.abs(diffHours) < 24) {
      return `${Math.abs(diffHours)} hour${Math.abs(diffHours) === 1 ? '' : 's'} ${diffHours < 0 ? 'ago' : 'from now'}`;
    }
    
    if (Math.abs(diffDays) < 7) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} ${diffDays < 0 ? 'ago' : 'from now'}`;
    }
    
    if (Math.abs(diffDays) < 30) {
      const weeks = Math.floor(Math.abs(diffDays) / 7);
      return `${weeks} week${weeks === 1 ? '' : 's'} ${diffDays < 0 ? 'ago' : 'from now'}`;
    }
    
    return formatDate(dateObj, 'short');
  };
  
  /**
   * Check if date is overdue
   * @param {string|Date} dueDate - Due date to check
   * @returns {boolean} True if overdue
   */
  export const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    return due < new Date();
  };
  
  /**
   * Get days until due date
   * @param {string|Date} dueDate - Due date
   * @returns {number} Days until due (negative if overdue)
   */
  export const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const now = new Date();
    const diffMs = due - now;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };
  
  /**
   * Format date for input field (YYYY-MM-DD)
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date string
   */
  export const formatDateForInput = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Add days to a date
   * @param {string|Date} date - Starting date
   * @param {number} days - Days to add (can be negative)
   * @returns {Date} New date
   */
  export const addDays = (date, days) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const result = new Date(dateObj);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  /**
   * Get week number from date
   * @param {string|Date} date - Date to get week number for
   * @returns {number} Week number (1-52)
   */
  export const getWeekNumber = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1);
    const pastDaysOfYear = (dateObj - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  
  export default {
    formatDate,
    getRelativeTime,
    isOverdue,
    getDaysUntilDue,
    formatDateForInput,
    addDays,
    getWeekNumber
  };