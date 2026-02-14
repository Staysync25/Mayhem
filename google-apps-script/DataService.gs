/**
 * Data Service - Google Sheets Operations
 *
 * Handles all interactions with Google Sheets:
 * - Appending parsed data to RAW tabs
 * - Creating tabs if they don't exist
 * - Deduplicating data by DATE + LOCATION
 * - Batch operations for performance
 */

/**
 * Append parsed data to the appropriate RAW tab
 *
 * @param {Object} parsedData - Parsed data from ParserService
 */
function appendToRawTab(parsedData) {
  try {
    const reportType = parsedData.reportType;
    const tabName = CONFIG.TABS['RAW_' + reportType];

    if (!tabName) {
      throw new Error('Unknown report type: ' + reportType);
    }

    Logger.log('Appending data to tab: ' + tabName);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(tabName);

    // Create tab if it doesn't exist
    if (!sheet) {
      Logger.log('Tab "' + tabName + '" does not exist, creating...');
      sheet = createRawTab(tabName, parsedData.headers);
    }

    // Check if headers match (if tab already exists)
    const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const expectedHeaders = parsedData.headers.concat(['IMPORT_DATE', 'IMPORT_ID']);

    if (existingHeaders.length > 0 && existingHeaders.join(',') !== expectedHeaders.join(',')) {
      Logger.log('WARNING: Headers mismatch in tab "' + tabName + '"');
      Logger.log('  Expected: ' + expectedHeaders.join(', '));
      Logger.log('  Found: ' + existingHeaders.join(', '));
      // Continue anyway - we'll append to the end
    }

    // Prepare data rows with metadata
    const dataToAppend = [];
    for (let i = 0; i < parsedData.data.length; i++) {
      const row = parsedData.data[i].slice(); // Copy array
      row.push(parsedData.importDate);
      row.push(parsedData.importId);
      dataToAppend.push(row);
    }

    if (dataToAppend.length === 0) {
      Logger.log('No data to append');
      return;
    }

    // Batch append for performance
    const lastRow = sheet.getLastRow();
    const startRow = lastRow + 1;
    const numRows = dataToAppend.length;
    const numCols = dataToAppend[0].length;

    Logger.log('Appending ' + numRows + ' rows starting at row ' + startRow);

    sheet.getRange(startRow, 1, numRows, numCols).setValues(dataToAppend);

    Logger.log('Successfully appended ' + numRows + ' rows to ' + tabName);

  } catch (error) {
    Logger.log('ERROR in appendToRawTab: ' + error.toString());
    throw error;
  }
}

/**
 * Create a new RAW tab with headers
 *
 * @param {string} tabName - Name of tab to create
 * @param {string[]} headers - Column headers
 * @returns {Sheet} Created sheet
 */
function createRawTab(tabName, headers) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.insertSheet(tabName);

    // Add headers with metadata columns
    const fullHeaders = headers.concat(['IMPORT_DATE', 'IMPORT_ID']);
    sheet.getRange(1, 1, 1, fullHeaders.length).setValues([fullHeaders]);

    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, fullHeaders.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f3f3f3');

    // Freeze header row
    sheet.setFrozenRows(1);

    Logger.log('Created new tab: ' + tabName);

    return sheet;

  } catch (error) {
    Logger.log('ERROR in createRawTab: ' + error.toString());
    throw error;
  }
}

/**
 * Deduplicate all RAW tabs
 * Removes duplicate rows based on DATE + LOCATION composite key
 */
function deduplicateAllTabs() {
  try {
    Logger.log('Starting deduplication of all RAW tabs...');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let totalRemoved = 0;

    // Iterate through all RAW tab names in config
    for (const key in CONFIG.TABS) {
      if (key.startsWith('RAW_')) {
        const tabName = CONFIG.TABS[key];
        const sheet = ss.getSheetByName(tabName);

        if (sheet) {
          const removed = deduplicateSheet(sheet);
          totalRemoved += removed;
          Logger.log('  ' + tabName + ': removed ' + removed + ' duplicates');
        }
      }
    }

    Logger.log('Deduplication complete: ' + totalRemoved + ' total duplicates removed');

  } catch (error) {
    Logger.log('ERROR in deduplicateAllTabs: ' + error.toString());
    throw error;
  }
}

/**
 * Deduplicate a single sheet
 *
 * @param {Sheet} sheet - Sheet to deduplicate
 * @returns {number} Number of duplicates removed
 */
function deduplicateSheet(sheet) {
  try {
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return 0; // Only header row, nothing to deduplicate
    }

    const headers = data[0];
    const dateColIndex = headers.indexOf('DATE');
    const locationColIndex = headers.indexOf('LOCATION');

    // If DATE or LOCATION column not found, skip deduplication
    if (dateColIndex === -1 || locationColIndex === -1) {
      Logger.log('  Skipping ' + sheet.getName() + ': DATE or LOCATION column not found');
      return 0;
    }

    // Track unique rows by DATE + LOCATION key
    const seen = {};
    const uniqueRows = [headers]; // Start with header row
    let duplicateCount = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const date = row[dateColIndex];
      const location = row[locationColIndex];

      // Create composite key
      const key = date + '|' + location;

      // Keep first occurrence, skip duplicates
      if (!seen[key]) {
        seen[key] = true;
        uniqueRows.push(row);
      } else {
        duplicateCount++;
      }
    }

    // If duplicates found, rewrite sheet
    if (duplicateCount > 0) {
      Logger.log('  Found ' + duplicateCount + ' duplicates in ' + sheet.getName());

      // Clear sheet
      sheet.clear();

      // Write unique rows
      if (uniqueRows.length > 0) {
        sheet.getRange(1, 1, uniqueRows.length, uniqueRows[0].length).setValues(uniqueRows);

        // Reformat header row
        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#f3f3f3');
      }
    }

    return duplicateCount;

  } catch (error) {
    Logger.log('ERROR in deduplicateSheet: ' + error.toString());
    throw error;
  }
}

/**
 * Get the active spreadsheet
 * Utility function for accessing the current spreadsheet
 *
 * @returns {Spreadsheet} Active spreadsheet
 */
function getActiveSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Check if a tab exists
 *
 * @param {string} tabName - Name of tab to check
 * @returns {boolean} True if tab exists
 */
function tabExists(tabName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(tabName) !== null;
}

/**
 * Get row count for a tab (excluding header)
 *
 * @param {string} tabName - Name of tab
 * @returns {number} Number of data rows (excluding header)
 */
function getTabRowCount(tabName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(tabName);

    if (!sheet) {
      return 0;
    }

    const lastRow = sheet.getLastRow();
    return lastRow > 0 ? lastRow - 1 : 0; // Subtract header row

  } catch (error) {
    Logger.log('ERROR in getTabRowCount: ' + error.toString());
    return 0;
  }
}

/**
 * Clear all data from RAW tabs (keep headers)
 * WARNING: This deletes all imported data!
 * Use only for testing or complete reset
 */
function clearAllRawTabs() {
  try {
    Logger.log('=== WARNING: Clearing all RAW tabs ===');

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    for (const key in CONFIG.TABS) {
      if (key.startsWith('RAW_')) {
        const tabName = CONFIG.TABS[key];
        const sheet = ss.getSheetByName(tabName);

        if (sheet) {
          const lastRow = sheet.getLastRow();
          if (lastRow > 1) {
            sheet.deleteRows(2, lastRow - 1);
            Logger.log('Cleared ' + (lastRow - 1) + ' rows from ' + tabName);
          }
        }
      }
    }

    Logger.log('All RAW tabs cleared');

  } catch (error) {
    Logger.log('ERROR in clearAllRawTabs: ' + error.toString());
    throw error;
  }
}

/**
 * Show stats for all RAW tabs
 * Useful for monitoring data volume
 */
function showRawTabStats() {
  Logger.log('=== RAW Tab Statistics ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  for (const key in CONFIG.TABS) {
    if (key.startsWith('RAW_')) {
      const tabName = CONFIG.TABS[key];
      const sheet = ss.getSheetByName(tabName);

      if (sheet) {
        const rowCount = getTabRowCount(tabName);
        const lastRow = sheet.getLastRow();
        const lastCol = sheet.getLastColumn();

        Logger.log('');
        Logger.log(tabName + ':');
        Logger.log('  Rows: ' + rowCount + ' (data) + 1 (header) = ' + lastRow + ' total');
        Logger.log('  Columns: ' + lastCol);
        Logger.log('  Cells: ' + (lastRow * lastCol));

        if (rowCount > 0) {
          const lastImportDate = sheet.getRange(lastRow, lastCol - 1).getValue();
          Logger.log('  Last import: ' + lastImportDate);
        }
      } else {
        Logger.log(tabName + ': (does not exist)');
      }
    }
  }
}
