/**
 * KPI Calculator - KPI Calculation Helpers
 *
 * Provides helper functions for calculating restaurant KPIs:
 * - Refreshing KPI calculations
 * - Flagging variance issues
 * - Flagging COGS issues
 * - Calculating inventory turn
 */

/**
 * Refresh all KPI calculations
 * Triggers recalculation of formulas in KPI_CALCULATIONS tab
 *
 * Note: Since KPI_CALCULATIONS uses formulas, this function mainly
 * ensures the sheet is properly set up and triggers any necessary recalculation
 */
function refreshAllKPIs() {
  try {
    Logger.log('Refreshing KPI calculations...');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const kpiSheet = ss.getSheetByName(CONFIG.TABS.KPI_CALCULATIONS);

    if (!kpiSheet) {
      Logger.log('KPI_CALCULATIONS tab does not exist yet');
      Logger.log('Please create this tab manually with formulas as documented');
      return;
    }

    // Force recalculation by editing a cell
    // This ensures formulas update after new data is imported
    const lastRow = kpiSheet.getLastRow();

    if (lastRow > 1) {
      // Touch the last cell to trigger recalculation
      const lastCol = kpiSheet.getLastColumn();
      const lastCell = kpiSheet.getRange(lastRow, lastCol);
      const value = lastCell.getValue();
      lastCell.setValue(value);

      Logger.log('KPI calculations refreshed');
    } else {
      Logger.log('No data in KPI_CALCULATIONS tab yet');
    }

  } catch (error) {
    Logger.log('ERROR in refreshAllKPIs: ' + error.toString());
    // Don't throw - this is not critical enough to fail the entire import
  }
}

/**
 * Flag locations with variance > threshold
 * Scans KPI_CALCULATIONS tab and returns locations with high variance
 *
 * @returns {Array} Array of objects with location and variance data
 */
function flagVariance() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const kpiSheet = ss.getSheetByName(CONFIG.TABS.KPI_CALCULATIONS);

    if (!kpiSheet) {
      return [];
    }

    const data = kpiSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return [];
    }

    const headers = data[0];
    const varianceColIndex = headers.indexOf('VARIANCE_PCT');
    const locationColIndex = headers.indexOf('LOCATION');
    const dateColIndex = headers.indexOf('DATE');

    if (varianceColIndex === -1 || locationColIndex === -1) {
      Logger.log('Could not find VARIANCE_PCT or LOCATION column in KPI_CALCULATIONS');
      return [];
    }

    const flaggedRows = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const variance = row[varianceColIndex];
      const location = row[locationColIndex];
      const date = row[dateColIndex];

      if (typeof variance === 'number' && Math.abs(variance) > CONFIG.VARIANCE_THRESHOLD) {
        flaggedRows.push({
          date: date,
          location: location,
          variance: variance,
          variancePercent: (variance * 100).toFixed(1) + '%'
        });
      }
    }

    return flaggedRows;

  } catch (error) {
    Logger.log('ERROR in flagVariance: ' + error.toString());
    return [];
  }
}

/**
 * Flag locations with COGS > target
 * Scans KPI_CALCULATIONS tab and returns locations exceeding COGS target
 *
 * @returns {Array} Array of objects with location and COGS data
 */
function flagCOGS() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const kpiSheet = ss.getSheetByName(CONFIG.TABS.KPI_CALCULATIONS);

    if (!kpiSheet) {
      return [];
    }

    const data = kpiSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return [];
    }

    const headers = data[0];
    const cogsColIndex = headers.indexOf('COGS_PCT');
    const locationColIndex = headers.indexOf('LOCATION');
    const dateColIndex = headers.indexOf('DATE');

    if (cogsColIndex === -1 || locationColIndex === -1) {
      Logger.log('Could not find COGS_PCT or LOCATION column in KPI_CALCULATIONS');
      return [];
    }

    const flaggedRows = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const cogs = row[cogsColIndex];
      const location = row[locationColIndex];
      const date = row[dateColIndex];

      if (typeof cogs === 'number' && cogs > CONFIG.COGS_TARGET) {
        flaggedRows.push({
          date: date,
          location: location,
          cogs: cogs,
          cogsPercent: (cogs * 100).toFixed(1) + '%',
          target: (CONFIG.COGS_TARGET * 100).toFixed(1) + '%'
        });
      }
    }

    return flaggedRows;

  } catch (error) {
    Logger.log('ERROR in flagCOGS: ' + error.toString());
    return [];
  }
}

/**
 * Calculate inventory turn for a location
 * Inventory Turn = Sales / Average Inventory Value
 *
 * @param {string} location - Location code
 * @param {Date} startDate - Start of period
 * @param {Date} endDate - End of period
 * @returns {number} Inventory turn ratio
 */
function calculateInventoryTurn(location, startDate, endDate) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Get sales for period
    const salesSheet = ss.getSheetByName(CONFIG.TABS.RAW_SALES);
    if (!salesSheet) {
      return 0;
    }

    const salesData = salesSheet.getDataRange().getValues();
    const salesHeaders = salesData[0];
    const salesDateCol = salesHeaders.indexOf('DATE');
    const salesLocationCol = salesHeaders.indexOf('LOCATION');
    const totalSalesCol = salesHeaders.indexOf('TOTAL_SALES');

    let totalSales = 0;

    for (let i = 1; i < salesData.length; i++) {
      const row = salesData[i];
      const rowDate = new Date(row[salesDateCol]);
      const rowLocation = row[salesLocationCol];

      if (rowLocation === location &&
          rowDate >= startDate &&
          rowDate <= endDate) {
        totalSales += row[totalSalesCol] || 0;
      }
    }

    // Get average inventory for period
    const invSheet = ss.getSheetByName(CONFIG.TABS.RAW_INVENTORY);
    if (!invSheet) {
      return 0;
    }

    const invData = invSheet.getDataRange().getValues();
    const invHeaders = invData[0];
    const invDateCol = invHeaders.indexOf('DATE');
    const invLocationCol = invHeaders.indexOf('LOCATION');
    const totalValueCol = invHeaders.indexOf('TOTAL_VALUE');

    let invCount = 0;
    let invSum = 0;

    for (let i = 1; i < invData.length; i++) {
      const row = invData[i];
      const rowDate = new Date(row[invDateCol]);
      const rowLocation = row[invLocationCol];

      if (rowLocation === location &&
          rowDate >= startDate &&
          rowDate <= endDate) {
        invSum += row[totalValueCol] || 0;
        invCount++;
      }
    }

    const avgInventory = invCount > 0 ? invSum / invCount : 0;

    if (avgInventory === 0) {
      return 0;
    }

    return totalSales / avgInventory;

  } catch (error) {
    Logger.log('ERROR in calculateInventoryTurn: ' + error.toString());
    return 0;
  }
}

/**
 * Generate KPI summary report
 * Returns a summary of all current KPI flags
 *
 * @returns {Object} Summary object with variance and COGS flags
 */
function getKPISummary() {
  try {
    const varianceFlags = flagVariance();
    const cogsFlags = flagCOGS();

    const summary = {
      timestamp: new Date(),
      varianceIssues: varianceFlags.length,
      cogsIssues: cogsFlags.length,
      totalIssues: varianceFlags.length + cogsFlags.length,
      varianceFlags: varianceFlags,
      cogsFlags: cogsFlags
    };

    return summary;

  } catch (error) {
    Logger.log('ERROR in getKPISummary: ' + error.toString());
    return {
      timestamp: new Date(),
      varianceIssues: 0,
      cogsIssues: 0,
      totalIssues: 0,
      varianceFlags: [],
      cogsFlags: [],
      error: error.toString()
    };
  }
}

/**
 * Log KPI summary to Logger
 * Useful for debugging and monitoring
 */
function logKPISummary() {
  Logger.log('=== KPI Summary ===');

  const summary = getKPISummary();

  Logger.log('Timestamp: ' + summary.timestamp);
  Logger.log('Total Issues: ' + summary.totalIssues);
  Logger.log('');

  if (summary.varianceIssues > 0) {
    Logger.log('Variance Issues (' + summary.varianceIssues + '):');
    for (let i = 0; i < summary.varianceFlags.length; i++) {
      const flag = summary.varianceFlags[i];
      Logger.log('  ' + flag.location + ' (' + flag.date + '): ' + flag.variancePercent);
    }
    Logger.log('');
  }

  if (summary.cogsIssues > 0) {
    Logger.log('COGS Issues (' + summary.cogsIssues + '):');
    for (let i = 0; i < summary.cogsFlags.length; i++) {
      const flag = summary.cogsFlags[i];
      Logger.log('  ' + flag.location + ' (' + flag.date + '): ' + flag.cogsPercent +
                 ' (target: ' + flag.target + ')');
    }
    Logger.log('');
  }

  if (summary.totalIssues === 0) {
    Logger.log('No KPI issues detected ✓');
  }
}

/**
 * Send KPI alert email if issues detected
 * Called automatically if there are variance or COGS issues
 */
function sendKPIAlert() {
  try {
    const summary = getKPISummary();

    if (summary.totalIssues === 0) {
      return; // No issues, no alert
    }

    let emailBody = 'Restaurant Metrics KPI Alert\n\n';
    emailBody += 'Timestamp: ' + summary.timestamp + '\n';
    emailBody += 'Total Issues: ' + summary.totalIssues + '\n\n';

    if (summary.varianceIssues > 0) {
      emailBody += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      emailBody += 'VARIANCE ISSUES (' + summary.varianceIssues + ')\n';
      emailBody += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

      for (let i = 0; i < summary.varianceFlags.length; i++) {
        const flag = summary.varianceFlags[i];
        emailBody += '⚠️ ' + flag.location + ' (' + flag.date + ')\n';
        emailBody += '   Variance: ' + flag.variancePercent + '\n';
        emailBody += '   Threshold: ' + (CONFIG.VARIANCE_THRESHOLD * 100).toFixed(1) + '%\n\n';
      }
    }

    if (summary.cogsIssues > 0) {
      emailBody += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      emailBody += 'COGS ISSUES (' + summary.cogsIssues + ')\n';
      emailBody += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

      for (let i = 0; i < summary.cogsFlags.length; i++) {
        const flag = summary.cogsFlags[i];
        emailBody += '⚠️ ' + flag.location + ' (' + flag.date + ')\n';
        emailBody += '   COGS: ' + flag.cogsPercent + '\n';
        emailBody += '   Target: ' + flag.target + '\n\n';
      }
    }

    emailBody += '\nPlease review the Executive Dashboard for details.';

    GmailApp.sendEmail(
      CONFIG.ALERT_EMAIL,
      '⚠️ Restaurant Metrics KPI Alert - ' + summary.totalIssues + ' Issues',
      emailBody
    );

    Logger.log('KPI alert email sent to: ' + CONFIG.ALERT_EMAIL);

  } catch (error) {
    Logger.log('ERROR in sendKPIAlert: ' + error.toString());
  }
}
