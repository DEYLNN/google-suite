// datetime-utils.js - Utility functions for consistent datetime handling
// across local development and production environments

/**
 * Converts any date input to WIB (Asia/Jakarta) timezone with consistent formatting
 * Handles various edge cases and invalid dates properly
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string in WIB or "-" for invalid dates
 */
function toWIB(dateInput) {
  // Handle null, undefined, or empty values
  if (!dateInput || 
      dateInput === "Invalid Date" || 
      dateInput === "01/01/1970, 07.00.00" || 
      dateInput === "1/1/1970, 07.00.00" ||
      dateInput === "-" ||
      dateInput === "1970-01-01T00:00:00.000Z") {
    return "-";
  }
  
  try {
    const d = new Date(dateInput);
    
    // Check if date is valid and not epoch (1970)
    if (isNaN(d) || d.getFullYear() <= 1970) {
      return "-";
    }
    
    // Convert to WIB timezone with consistent formatting
    return d.toLocaleString('id-ID', { 
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  } catch (error) {
    console.error('Date parsing error:', error, 'for input:', dateInput);
    return "-";
  }
}

/**
 * Checks if a date represents "never logged in" status
 * Handles various formats from different environments
 * @param {string|Date} dateInput - Date to check
 * @returns {boolean} True if user never logged in
 */
function isNeverLoggedIn(dateInput) {
  return !dateInput || 
         dateInput === "Invalid Date" ||
         dateInput === "01/01/1970, 07.00.00" ||
         dateInput === "1/1/1970, 07.00.00" ||
         dateInput === "-" ||
         dateInput === "1970-01-01T00:00:00.000Z" ||
         (dateInput && new Date(dateInput).getFullYear() <= 1970);
}

/**
 * Checks if a date represents a valid login time
 * @param {string|Date} dateInput - Date to check
 * @returns {boolean} True if user has logged in
 */
function hasLoggedIn(dateInput) {
  return dateInput && 
         dateInput !== "Invalid Date" &&
         dateInput !== "01/01/1970, 07.00.00" &&
         dateInput !== "1/1/1970, 07.00.00" &&
         dateInput !== "-" &&
         dateInput !== "1970-01-01T00:00:00.000Z" &&
         new Date(dateInput).getFullYear() > 1970;
}

// Export for use in other files (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { toWIB, isNeverLoggedIn, hasLoggedIn };
}

// Global functions for use in scripts
window.toWIB = toWIB;
window.isNeverLoggedIn = isNeverLoggedIn;
window.hasLoggedIn = hasLoggedIn;