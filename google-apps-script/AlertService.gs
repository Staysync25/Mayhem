/**
 * Alert Service - Error Logging and Notifications
 *
 * Handles all error logging and email notifications:
 * - Sending alert emails on failures
 * - Logging successful imports
 * - Logging errors to spreadsheet
 * - Managing import history
 */

/**
 * Send alert email for critical errors
 *
 * @param {string} subject - Alert subject (without prefix)
 * @param {string} message - Alert message body
 */
function sendAlert(subject, message) {
  try {
    const fullSubject = '🚨 Restaurant Metrics Alert: ' + subject;
    const timestamp = new Date();

    const emailBody =
      'Restaurant Metrics Dashboard - Alert\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'Time: ' + timestamp + '\n\n' +
      'Alert: ' + subject + '\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      message + '\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'Action Required:\n' +
      '1. Check Apps Script execution logs (View → Executions)\n' +
      '2. Review Gmail for missing R365 reports\n' +
      '3. Verify RAW_* tabs in Google Sheet\n\n' +
      'Need help? Review the deployment documentation.';

    GmailApp.sendEmail(CONFIG.ALERT_EMAIL, fullSubject, emailBody);

    Logger.log('Alert email sent to: ' + CONFIG.ALERT_EMAIL);
    Logger.log('Subject: ' + fullSubject);

    // Also log to import log if enabled
    if (CONFIG.LOG_IMPORTS) {
      logError(subject, message);
    }

  } catch (error) {
    // If we can't send email, at least log it
    Logger.log('CRITICAL: Could not send alert email!');
    Logger.log('Alert subject: ' + subject);
    Logger.log('Alert message: ' + message);
    Logger.log('Email error: ' + error.toString());
  }
}

/**
 * Log successful import
 *
 * @param {string} message - Success message
 */
function logSuccess(message) {
  try {
    Logger.log('SUCCESS: ' + message);

    if (!CONFIG.LOG_IMPORTS) {
      return;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = ss.getSheetByName(CONFIG.TABS.IMPORT_LOG);

    // Create import log sheet if it doesn't exist
    if (!logSheet) {
      logSheet = createImportLogSheet();
    }

    // Append log entry
    const timestamp = new Date();
    const user = Session.getActiveUser().getEmail();

    logSheet.appendRow([
      timestamp,
      'SUCCESS',
      message,
      user,
      '' // error details (blank for success)
    ]);

    // Send success email if configured
    if (CONFIG.SEND_SUCCESS_EMAIL) {
      GmailApp.sendEmail(
        CONFIG.ALERT_EMAIL,
        '✓ Restaurant Metrics - Import Successful',
        'Import completed successfully at ' + timestamp + '\n\n' + message
      );
    }

  } catch (error) {
    Logger.log('ERROR in logSuccess: ' + error.toString());
    // Don't throw - logging failures shouldn't break the import
  }
}

/**
 * Log error to spreadsheet
 *
 * @param {string} errorType - Type/category of error
 * @param {string} errorDetails - Detailed error message
 */
function logError(errorType, errorDetails) {
  try {
    if (!CONFIG.LOG_IMPORTS) {
      return;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = ss.getSheetByName(CONFIG.TABS.IMPORT_LOG);

    // Create import log sheet if it doesn't exist
    if (!logSheet) {
      logSheet = createImportLogSheet();
    }

    // Append error entry
    const timestamp = new Date();
    const user = Session.getActiveUser().getEmail();

    logSheet.appendRow([
      timestamp,
      'ERROR',
      errorType,
      user,
      errorDetails
    ]);

    Logger.log('Error logged to IMPORT_LOG tab');

  } catch (error) {
    Logger.log('ERROR in logError: ' + error.toString());
    // Don't throw - logging failures shouldn't break anything
  }
}

/**
 * Create the IMPORT_LOG sheet if it doesn't exist
 *
 * @returns {Sheet} Import log sheet
 */
function createImportLogSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.insertSheet(CONFIG.TABS.IMPORT_LOG);

    // Add headers
    const headers = ['TIMESTAMP', 'STATUS', 'MESSAGE', 'USER', 'ERROR_DETAILS'];
    logSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Format header row
    const headerRange = logSheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f3f3f3');

    // Freeze header row
    logSheet.setFrozenRows(1);

    // Set column widths
    logSheet.setColumnWidth(1, 180); // TIMESTAMP
    logSheet.setColumnWidth(2, 80);  // STATUS
    logSheet.setColumnWidth(3, 300); // MESSAGE
    logSheet.setColumnWidth(4, 200); // USER
    logSheet.setColumnWidth(5, 400); // ERROR_DETAILS

    Logger.log('Created IMPORT_LOG sheet');

    return logSheet;

  } catch (error) {
    Logger.log('ERROR in createImportLogSheet: ' + error.toString());
    throw error;
  }
}

/**
 * Get recent import history
 *
 * @param {number} limit - Number of recent imports to return
 * @returns {Array} Array of import log entries
 */
function getRecentImports(limit) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName(CONFIG.TABS.IMPORT_LOG);

    if (!logSheet) {
      return [];
    }

    const data = logSheet.getDataRange().getValues();

    if (data.length <= 1) {
      return [];
    }

    // Get last N rows (excluding header)
    const startRow = Math.max(1, data.length - limit);
    const recentData = data.slice(startRow);

    // Convert to objects
    const headers = data[0];
    const imports = [];

    for (let i = 0; i < recentData.length; i++) {
      const row = recentData[i];
      const importEntry = {};

      for (let j = 0; j < headers.length; j++) {
        importEntry[headers[j]] = row[j];
      }

      imports.push(importEntry);
    }

    return imports;

  } catch (error) {
    Logger.log('ERROR in getRecentImports: ' + error.toString());
    return [];
  }
}

/**
 * Show recent import history in logs
 *
 * @param {number} limit - Number of recent imports to show (default: 10)
 */
function showRecentImports(limit) {
  if (!limit) {
    limit = 10;
  }

  Logger.log('=== Recent Import History (Last ' + limit + ') ===');

  const imports = getRecentImports(limit);

  if (imports.length === 0) {
    Logger.log('No import history found');
    return;
  }

  for (let i = 0; i < imports.length; i++) {
    const imp = imports[i];
    Logger.log('');
    Logger.log((i + 1) + '. ' + imp.TIMESTAMP);
    Logger.log('   Status: ' + imp.STATUS);
    Logger.log('   Message: ' + imp.MESSAGE);

    if (imp.ERROR_DETAILS) {
      Logger.log('   Error: ' + imp.ERROR_DETAILS);
    }
  }
}

/**
 * Clear import log (keep header)
 * WARNING: This deletes all import history!
 */
function clearImportLog() {
  try {
    Logger.log('=== Clearing Import Log ===');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName(CONFIG.TABS.IMPORT_LOG);

    if (!logSheet) {
      Logger.log('IMPORT_LOG sheet does not exist');
      return;
    }

    const lastRow = logSheet.getLastRow();

    if (lastRow > 1) {
      logSheet.deleteRows(2, lastRow - 1);
      Logger.log('Cleared ' + (lastRow - 1) + ' log entries');
    } else {
      Logger.log('Import log is already empty');
    }

  } catch (error) {
    Logger.log('ERROR in clearImportLog: ' + error.toString());
    throw error;
  }
}

/**
 * Get import statistics
 *
 * @returns {Object} Import statistics
 */
function getImportStats() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName(CONFIG.TABS.IMPORT_LOG);

    if (!logSheet) {
      return {
        totalImports: 0,
        successCount: 0,
        errorCount: 0,
        successRate: 0
      };
    }

    const data = logSheet.getDataRange().getValues();

    if (data.length <= 1) {
      return {
        totalImports: 0,
        successCount: 0,
        errorCount: 0,
        successRate: 0
      };
    }

    const headers = data[0];
    const statusColIndex = headers.indexOf('STATUS');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 1; i < data.length; i++) {
      const status = data[i][statusColIndex];

      if (status === 'SUCCESS') {
        successCount++;
      } else if (status === 'ERROR') {
        errorCount++;
      }
    }

    const totalImports = successCount + errorCount;
    const successRate = totalImports > 0 ? (successCount / totalImports * 100).toFixed(1) : 0;

    return {
      totalImports: totalImports,
      successCount: successCount,
      errorCount: errorCount,
      successRate: successRate + '%'
    };

  } catch (error) {
    Logger.log('ERROR in getImportStats: ' + error.toString());
    return {
      totalImports: 0,
      successCount: 0,
      errorCount: 0,
      successRate: 0,
      error: error.toString()
    };
  }
}

/**
 * Show import statistics in logs
 */
function showImportStats() {
  Logger.log('=== Import Statistics ===');

  const stats = getImportStats();

  Logger.log('Total Imports: ' + stats.totalImports);
  Logger.log('Successful: ' + stats.successCount);
  Logger.log('Errors: ' + stats.errorCount);
  Logger.log('Success Rate: ' + stats.successRate);

  if (stats.error) {
    Logger.log('Error: ' + stats.error);
  }
}

/**
 * Send daily summary email
 * Can be set up as a separate daily trigger
 */
function sendDailySummary() {
  try {
    const stats = getImportStats();
    const recentImports = getRecentImports(10);
    const kpiSummary = KPICalculator.getKPISummary();

    let emailBody = 'Restaurant Metrics Dashboard - Daily Summary\n\n';
    emailBody += 'Date: ' + new Date().toLocaleDateString() + '\n\n';

    emailBody += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    emailBody += 'IMPORT STATISTICS\n';
    emailBody += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    emailBody += 'Total Imports: ' + stats.totalImports + '\n';
    emailBody += 'Success Rate: ' + stats.successRate + '\n';
    emailBody += 'Errors: ' + stats.errorCount + '\n\n';

    emailBody += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    emailBody += 'KPI SUMMARY\n';
    emailBody += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    emailBody += 'Variance Issues: ' + kpiSummary.varianceIssues + '\n';
    emailBody += 'COGS Issues: ' + kpiSummary.cogsIssues + '\n';
    emailBody += 'Total Issues: ' + kpiSummary.totalIssues + '\n\n';

    emailBody += 'View full dashboard: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl();

    GmailApp.sendEmail(
      CONFIG.ALERT_EMAIL,
      '📊 Restaurant Metrics - Daily Summary',
      emailBody
    );

    Logger.log('Daily summary email sent');

  } catch (error) {
    Logger.log('ERROR in sendDailySummary: ' + error.toString());
  }
}
