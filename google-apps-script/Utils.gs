/**
 * Utilities - Shared Utility Functions
 *
 * Common utility functions used across the project:
 * - ID generation
 * - Date parsing
 * - Numeric cleaning
 * - String manipulation
 */

/**
 * Generate unique import ID
 * Uses UUID format for tracking import batches
 *
 * @returns {string} Unique import ID
 */
function generateImportId() {
  return Utilities.getUuid();
}

/**
 * Parse date from various formats
 * Handles common R365 date formats
 *
 * @param {*} value - Date value (string, Date object, or number)
 * @returns {Date} Parsed date object
 */
function parseDate(value) {
  try {
    // Already a Date object
    if (value instanceof Date) {
      return value;
    }

    // Numeric date (Excel serial number)
    if (typeof value === 'number') {
      // Excel date serial number (days since 1/1/1900)
      const excelEpoch = new Date(1899, 11, 30);
      return new Date(excelEpoch.getTime() + value * 86400000);
    }

    // String date
    if (typeof value === 'string') {
      value = value.trim();

      // Try built-in Date parsing first
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }

      // Try common formats manually
      // MM/DD/YYYY
      let match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match) {
        return new Date(match[3], match[1] - 1, match[2]);
      }

      // YYYY-MM-DD
      match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (match) {
        return new Date(match[1], match[2] - 1, match[3]);
      }

      // MM-DD-YYYY
      match = value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
      if (match) {
        return new Date(match[3], match[1] - 1, match[2]);
      }
    }

    // Fallback: return current date and log warning
    Logger.log('WARNING: Could not parse date: ' + value + ' (using current date)');
    return new Date();

  } catch (error) {
    Logger.log('ERROR in parseDate: ' + error.toString() + ' for value: ' + value);
    return new Date();
  }
}

/**
 * Clean numeric value
 * Removes currency symbols, commas, and converts to number
 *
 * @param {*} value - Numeric value (possibly with formatting)
 * @returns {number} Clean numeric value
 */
function cleanNumeric(value) {
  try {
    // Already a number
    if (typeof value === 'number') {
      return value;
    }

    // Null or undefined
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    // String - remove formatting
    if (typeof value === 'string') {
      // Remove currency symbols ($, €, £, etc.)
      value = value.replace(/[$€£¥]/g, '');

      // Remove commas
      value = value.replace(/,/g, '');

      // Remove whitespace
      value = value.trim();

      // Handle parentheses as negative (accounting format)
      if (value.startsWith('(') && value.endsWith(')')) {
        value = '-' + value.substring(1, value.length - 1);
      }

      // Convert to number
      const num = parseFloat(value);

      // Check if valid
      if (isNaN(num)) {
        Logger.log('WARNING: Could not parse numeric value: ' + value + ' (using 0)');
        return 0;
      }

      return num;
    }

    // Unknown type
    Logger.log('WARNING: Unknown type for numeric value: ' + typeof value + ' (using 0)');
    return 0;

  } catch (error) {
    Logger.log('ERROR in cleanNumeric: ' + error.toString() + ' for value: ' + value);
    return 0;
  }
}

/**
 * Format number as currency
 *
 * @param {number} value - Numeric value
 * @param {string} currency - Currency symbol (default: $)
 * @returns {string} Formatted currency string
 */
function formatCurrency(value, currency) {
  if (!currency) {
    currency = '$';
  }

  if (typeof value !== 'number') {
    value = cleanNumeric(value);
  }

  return currency + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format number as percentage
 *
 * @param {number} value - Numeric value (0.25 = 25%)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
function formatPercent(value, decimals) {
  if (!decimals && decimals !== 0) {
    decimals = 1;
  }

  if (typeof value !== 'number') {
    value = cleanNumeric(value);
  }

  return (value * 100).toFixed(decimals) + '%';
}

/**
 * Trim whitespace from all strings in an array
 *
 * @param {Array} arr - Array of values
 * @returns {Array} Array with trimmed strings
 */
function trimArray(arr) {
  return arr.map(function(value) {
    return typeof value === 'string' ? value.trim() : value;
  });
}

/**
 * Check if value is empty (null, undefined, empty string, or whitespace)
 *
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  return false;
}

/**
 * Get batch range for efficient sheet operations
 * Calculates optimal range for batch read/write
 *
 * @param {number} startRow - Starting row (1-indexed)
 * @param {number} startCol - Starting column (1-indexed)
 * @param {number} numRows - Number of rows
 * @param {number} numCols - Number of columns
 * @returns {string} Range in A1 notation
 */
function getBatchRange(startRow, startCol, numRows, numCols) {
  const startCell = columnToLetter(startCol) + startRow;
  const endCell = columnToLetter(startCol + numCols - 1) + (startRow + numRows - 1);
  return startCell + ':' + endCell;
}

/**
 * Convert column number to letter (1 = A, 2 = B, etc.)
 *
 * @param {number} column - Column number (1-indexed)
 * @returns {string} Column letter
 */
function columnToLetter(column) {
  let letter = '';
  let temp;

  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }

  return letter;
}

/**
 * Convert column letter to number (A = 1, B = 2, etc.)
 *
 * @param {string} letter - Column letter
 * @returns {number} Column number (1-indexed)
 */
function letterToColumn(letter) {
  let column = 0;
  const length = letter.length;

  for (let i = 0; i < length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }

  return column;
}

/**
 * Sleep for specified milliseconds
 * Useful for avoiding quota issues
 *
 * @param {number} milliseconds - Time to sleep
 */
function sleep(milliseconds) {
  Utilities.sleep(milliseconds);
}

/**
 * Retry a function if it fails
 *
 * @param {Function} func - Function to retry
 * @param {number} maxAttempts - Maximum number of attempts (default: 3)
 * @param {number} delayMs - Delay between attempts in ms (default: 1000)
 * @returns {*} Result of function
 */
function retry(func, maxAttempts, delayMs) {
  if (!maxAttempts) {
    maxAttempts = 3;
  }

  if (!delayMs) {
    delayMs = 1000;
  }

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      Logger.log('Attempt ' + attempt + ' of ' + maxAttempts);
      return func();
    } catch (error) {
      lastError = error;
      Logger.log('Attempt ' + attempt + ' failed: ' + error.toString());

      if (attempt < maxAttempts) {
        Logger.log('Retrying in ' + delayMs + 'ms...');
        Utilities.sleep(delayMs);
      }
    }
  }

  throw new Error('All ' + maxAttempts + ' attempts failed. Last error: ' + lastError.toString());
}

/**
 * Get current timestamp as string
 *
 * @returns {string} Formatted timestamp
 */
function getTimestamp() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Log message with timestamp
 *
 * @param {string} message - Message to log
 */
function logWithTimestamp(message) {
  Logger.log('[' + getTimestamp() + '] ' + message);
}
