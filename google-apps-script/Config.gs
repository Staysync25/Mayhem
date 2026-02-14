/**
 * Configuration - Central Configuration File
 *
 * All configuration constants for the Restaurant Metrics Dashboard
 * Modify these values to customize for your specific needs
 */

/**
 * Main configuration object
 * IMPORTANT: Update ALERT_EMAIL with your actual email address!
 */
const CONFIG = {
  // ============================================================================
  // EMAIL SETTINGS
  // ============================================================================

  /**
   * Email address to receive alert notifications
   * IMPORTANT: Change this to your email address!
   */
  ALERT_EMAIL: 'your-email@domain.com',

  /**
   * Gmail label to apply to processed emails
   * This prevents re-importing the same emails
   */
  PROCESSED_LABEL: 'R365/Processed',

  /**
   * Subject line keywords to search for in Gmail
   * Emails containing these keywords will be processed
   */
  SUBJECT_KEYWORDS: [
    'Sales Summary',
    'Actual vs Theoretical',
    'Inventory Valuation',
    'Purchases by Vendor',
    'GL Detail'
  ],

  // ============================================================================
  // ALERT THRESHOLDS
  // ============================================================================

  /**
   * Target COGS percentage (23% = 0.23)
   * Alert will trigger if actual COGS exceeds this target
   */
  COGS_TARGET: 0.23,

  /**
   * Variance threshold (1.5% = 0.015)
   * Alert will trigger if variance between actual and theoretical exceeds this
   */
  VARIANCE_THRESHOLD: 0.015,

  /**
   * Labor percentage target (skipped for now, but included for future use)
   * Set to 0 to disable labor alerts
   */
  LABOR_TARGET: 0,

  // ============================================================================
  // GOOGLE SHEETS TAB NAMES
  // ============================================================================

  /**
   * Names of all tabs in the Google Sheet
   * These must match the actual tab names in your spreadsheet
   */
  TABS: {
    // Raw data tabs (auto-populated from emails)
    RAW_SALES: 'RAW_SALES',
    RAW_MENU_MIX: 'RAW_MENU_MIX',
    RAW_THEORETICAL: 'RAW_THEORETICAL',
    RAW_INVENTORY: 'RAW_INVENTORY',
    RAW_PURCHASES: 'RAW_PURCHASES',
    RAW_GL: 'RAW_GL',

    // Reference and calculation tabs
    DATA_MODEL: 'DATA_MODEL',
    KPI_CALCULATIONS: 'KPI_CALCULATIONS',
    DASHBOARD: 'EXECUTIVE_DASHBOARD',
    IMPORT_LOG: 'IMPORT_LOG' // Optional - created if needed
  },

  // ============================================================================
  // PERFORMANCE SETTINGS
  // ============================================================================

  /**
   * Maximum number of email threads to process per run
   * Prevents quota issues if you have many R365 emails
   */
  MAX_EMAILS_PER_RUN: 50,

  /**
   * Number of hours to look back for new emails
   * 2 hours ensures we catch all emails since last hourly run
   */
  EMAIL_LOOKBACK_HOURS: 2,

  /**
   * Enable/disable deduplication after each import
   * Set to false if you want to run deduplication manually
   */
  AUTO_DEDUPLICATE: true,

  /**
   * Enable/disable KPI refresh after each import
   * Set to false if you want to refresh KPIs manually
   */
  AUTO_REFRESH_KPI: true,

  // ============================================================================
  // LOGGING SETTINGS
  // ============================================================================

  /**
   * Enable verbose logging for debugging
   * Set to false in production to reduce log clutter
   */
  VERBOSE_LOGGING: true,

  /**
   * Log successful imports to IMPORT_LOG tab
   * Useful for tracking import history
   */
  LOG_IMPORTS: true,

  /**
   * Send success email after each import
   * Set to false to only receive error notifications
   */
  SEND_SUCCESS_EMAIL: false,

  // ============================================================================
  // DATA VALIDATION SETTINGS
  // ============================================================================

  /**
   * Minimum sales value to consider valid (in dollars)
   * Rows with sales below this will be flagged in logs
   */
  MIN_VALID_SALES: 0,

  /**
   * Maximum COGS percentage to consider valid (100% = 1.0)
   * Rows with COGS above this will be flagged as data errors
   */
  MAX_VALID_COGS: 1.0,

  /**
   * Location codes to expect in imports
   * Leave empty to accept any location code
   * Example: ['LOC001', 'LOC002', 'LOC003']
   */
  VALID_LOCATIONS: []
};

/**
 * Get configuration value by key
 * Useful for accessing config in other files
 *
 * @param {string} key - Configuration key (e.g., 'COGS_TARGET')
 * @returns {*} Configuration value
 */
function getConfig(key) {
  return CONFIG[key];
}

/**
 * Update configuration value
 * IMPORTANT: Changes are only in memory, not persisted
 * To permanently change config, edit this file directly
 *
 * @param {string} key - Configuration key
 * @param {*} value - New value
 */
function setConfig(key, value) {
  CONFIG[key] = value;
  Logger.log('Updated config: ' + key + ' = ' + value);
}

/**
 * Show all current configuration values
 * Useful for debugging
 */
function showConfig() {
  Logger.log('=== Current Configuration ===');

  for (const key in CONFIG) {
    let value = CONFIG[key];

    // Format complex objects for readability
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        value = '[' + value.join(', ') + ']';
      } else {
        value = JSON.stringify(value, null, 2);
      }
    }

    Logger.log(key + ': ' + value);
  }
}

/**
 * Validate configuration
 * Checks for common configuration errors
 *
 * @returns {boolean} True if configuration is valid
 */
function validateConfig() {
  Logger.log('=== Validating Configuration ===');

  let isValid = true;

  // Check alert email
  if (CONFIG.ALERT_EMAIL === 'your-email@domain.com') {
    Logger.log('ERROR: ALERT_EMAIL is still set to default value');
    Logger.log('  Please update ALERT_EMAIL in Config.gs to your actual email');
    isValid = false;
  }

  // Check COGS target
  if (CONFIG.COGS_TARGET <= 0 || CONFIG.COGS_TARGET > 1) {
    Logger.log('WARNING: COGS_TARGET seems unusual: ' + CONFIG.COGS_TARGET);
    Logger.log('  Expected value between 0.15 and 0.40 (15% - 40%)');
  }

  // Check variance threshold
  if (CONFIG.VARIANCE_THRESHOLD <= 0 || CONFIG.VARIANCE_THRESHOLD > 0.5) {
    Logger.log('WARNING: VARIANCE_THRESHOLD seems unusual: ' + CONFIG.VARIANCE_THRESHOLD);
    Logger.log('  Expected value between 0.01 and 0.05 (1% - 5%)');
  }

  // Check tab names
  for (const key in CONFIG.TABS) {
    const tabName = CONFIG.TABS[key];
    if (!tabName || tabName === '') {
      Logger.log('ERROR: Tab name for ' + key + ' is empty');
      isValid = false;
    }
  }

  if (isValid) {
    Logger.log('Configuration is valid ✓');
  } else {
    Logger.log('Configuration has errors ✗');
  }

  return isValid;
}

/**
 * Reset configuration to defaults
 * WARNING: This will overwrite any custom settings
 */
function resetConfig() {
  Logger.log('=== Resetting Configuration to Defaults ===');
  Logger.log('WARNING: This function does not actually reset the config file');
  Logger.log('To reset configuration, manually edit Config.gs and restore default values');
}
