/**
 * Parser Service - CSV and Excel Data Parsing
 *
 * Handles parsing of R365 report attachments:
 * - Detects file type (CSV vs Excel)
 * - Parses data into structured format
 * - Maps R365 column names to our normalized schema
 * - Identifies report type for routing to correct RAW tab
 */

/**
 * Main parser function - routes to appropriate parser based on file type
 *
 * @param {GmailAttachment} attachment - Email attachment to parse
 * @param {string} emailSubject - Email subject line (used for report type identification)
 * @returns {Object} Parsed data with reportType, headers, data, and importDate
 */
function parseAttachment(attachment, emailSubject) {
  try {
    const filename = attachment.getName();
    Logger.log('Parsing attachment: ' + filename);

    // Identify report type from filename or email subject
    let reportType = identifyReportType(filename);
    if (reportType === 'UNKNOWN') {
      reportType = GmailService.identifyReportTypeFromSubject(emailSubject);
      Logger.log('Report type identified from email subject: ' + reportType);
    } else {
      Logger.log('Report type identified from filename: ' + reportType);
    }

    // Parse based on file extension
    let parsed;
    if (filename.toLowerCase().endsWith('.csv')) {
      parsed = parseCSV(attachment, reportType);
    } else if (filename.toLowerCase().endsWith('.xlsx') ||
               filename.toLowerCase().endsWith('.xls')) {
      parsed = parseExcel(attachment, reportType);
    } else {
      throw new Error('Unsupported file type: ' + filename);
    }

    // Add metadata
    parsed.reportType = reportType;
    parsed.importDate = new Date();
    parsed.importId = Utils.generateImportId();
    parsed.filename = filename;

    Logger.log('Parsed ' + parsed.data.length + ' rows from ' + filename);

    return parsed;

  } catch (error) {
    Logger.log('ERROR in parseAttachment: ' + error.toString());
    throw error;
  }
}

/**
 * Parse CSV attachment
 *
 * @param {GmailAttachment} attachment - CSV attachment
 * @param {string} reportType - Report type identifier
 * @returns {Object} Parsed data with headers and rows
 */
function parseCSV(attachment, reportType) {
  try {
    Logger.log('Parsing CSV file...');

    // Convert attachment to string
    const content = attachment.getDataAsString();

    // Parse CSV using built-in Utilities
    const rows = Utilities.parseCsv(content);

    if (rows.length === 0) {
      throw new Error('CSV file is empty');
    }

    // First row is headers
    const rawHeaders = rows[0];
    const headers = mapR365Columns(rawHeaders, reportType);

    // Remaining rows are data
    const data = rows.slice(1);

    // Clean and validate data
    const cleanedData = cleanDataRows(data, headers);

    return {
      headers: headers,
      data: cleanedData,
      rawHeaders: rawHeaders
    };

  } catch (error) {
    Logger.log('ERROR in parseCSV: ' + error.toString());
    throw error;
  }
}

/**
 * Parse Excel attachment
 * Converts Excel to temporary Google Sheet, extracts data, then cleans up
 *
 * @param {GmailAttachment} attachment - Excel attachment
 * @param {string} reportType - Report type identifier
 * @returns {Object} Parsed data with headers and rows
 */
function parseExcel(attachment, reportType) {
  let tempFile = null;
  let tempSheet = null;

  try {
    Logger.log('Parsing Excel file...');

    // Create temporary file in Drive
    const blob = attachment.copyBlob();
    tempFile = DriveApp.createFile(blob);
    const tempFileId = tempFile.getId();
    Logger.log('Created temporary file: ' + tempFileId);

    // Convert to Google Sheets
    const resource = {
      title: 'TEMP_' + tempFile.getName(),
      mimeType: MimeType.GOOGLE_SHEETS,
      parents: [{id: tempFile.getParents().next().getId()}]
    };

    const convertedFile = Drive.Files.insert(resource, blob);
    tempSheet = SpreadsheetApp.openById(convertedFile.id);
    Logger.log('Converted to Google Sheet: ' + convertedFile.id);

    // Get data from first sheet
    const sheet = tempSheet.getSheets()[0];
    const dataRange = sheet.getDataRange();
    const rows = dataRange.getValues();

    if (rows.length === 0) {
      throw new Error('Excel file is empty');
    }

    // First row is headers
    const rawHeaders = rows[0];
    const headers = mapR365Columns(rawHeaders, reportType);

    // Remaining rows are data
    const data = rows.slice(1);

    // Clean and validate data
    const cleanedData = cleanDataRows(data, headers);

    // Clean up temporary files
    DriveApp.getFileById(tempFileId).setTrashed(true);
    DriveApp.getFileById(convertedFile.id).setTrashed(true);
    Logger.log('Cleaned up temporary files');

    return {
      headers: headers,
      data: cleanedData,
      rawHeaders: rawHeaders
    };

  } catch (error) {
    // Clean up on error
    if (tempFile) {
      try {
        tempFile.setTrashed(true);
      } catch (cleanupError) {
        Logger.log('Could not clean up temp file: ' + cleanupError.toString());
      }
    }
    if (tempSheet) {
      try {
        DriveApp.getFileById(tempSheet.getId()).setTrashed(true);
      } catch (cleanupError) {
        Logger.log('Could not clean up temp sheet: ' + cleanupError.toString());
      }
    }

    Logger.log('ERROR in parseExcel: ' + error.toString());
    throw error;
  }
}

/**
 * Identify report type from filename
 *
 * @param {string} filename - Attachment filename
 * @returns {string} Report type identifier
 */
function identifyReportType(filename) {
  const lower = filename.toLowerCase();

  if (lower.includes('sales summary') || lower.includes('sales_summary')) {
    return 'SALES';
  } else if (lower.includes('menu mix') || lower.includes('menu_mix')) {
    return 'MENU_MIX';
  } else if (lower.includes('theoretical') || lower.includes('actual vs theoretical')) {
    return 'THEORETICAL';
  } else if (lower.includes('inventory')) {
    return 'INVENTORY';
  } else if (lower.includes('purchases') || lower.includes('vendor')) {
    return 'PURCHASES';
  } else if (lower.includes('gl detail') || lower.includes('gl_detail') || lower.includes('general ledger')) {
    return 'GL';
  }

  return 'UNKNOWN';
}

/**
 * Map R365 column names to our normalized schema
 * This handles variations in R365 export column names
 *
 * @param {string[]} rawHeaders - Original column headers from R365
 * @param {string} reportType - Report type identifier
 * @returns {string[]} Normalized column headers
 */
function mapR365Columns(rawHeaders, reportType) {
  const COLUMN_MAPS = {
    'SALES': {
      'Business Date': 'DATE',
      'Date': 'DATE',
      'Store': 'LOCATION',
      'Location': 'LOCATION',
      'Store Name': 'LOCATION',
      'Net Sales': 'TOTAL_SALES',
      'Total Sales': 'TOTAL_SALES',
      'Sales': 'TOTAL_SALES',
      'Food Sales': 'FOOD_SALES',
      'Beverage Sales': 'BEV_SALES',
      'Beer Sales': 'BEV_SALES',
      'Wine Sales': 'BEV_SALES',
      'Liquor Sales': 'BEV_SALES',
      'Sales Tax': 'TAX',
      'Tax': 'TAX',
      'Tips': 'TIPS',
      'Tip': 'TIPS',
      'Guest Count': 'GUESTS',
      'Guests': 'GUESTS',
      'Covers': 'GUESTS'
    },
    'THEORETICAL': {
      'Business Date': 'DATE',
      'Date': 'DATE',
      'Store': 'LOCATION',
      'Location': 'LOCATION',
      'Category': 'CATEGORY',
      'Theoretical Cost': 'THEORETICAL_COST',
      'Theoretical': 'THEORETICAL_COST',
      'Actual Cost': 'ACTUAL_COST',
      'Actual': 'ACTUAL_COST',
      'Variance': 'VARIANCE',
      'Variance $': 'VARIANCE'
    },
    'INVENTORY': {
      'Business Date': 'DATE',
      'Date': 'DATE',
      'Inventory Date': 'DATE',
      'Store': 'LOCATION',
      'Location': 'LOCATION',
      'Item': 'ITEM',
      'Item Name': 'ITEM',
      'Category': 'CATEGORY',
      'Quantity': 'QUANTITY',
      'Qty': 'QUANTITY',
      'Unit Cost': 'UNIT_COST',
      'Cost': 'UNIT_COST',
      'Total Value': 'TOTAL_VALUE',
      'Value': 'TOTAL_VALUE',
      'Extended Cost': 'TOTAL_VALUE'
    },
    'PURCHASES': {
      'Business Date': 'DATE',
      'Date': 'DATE',
      'Invoice Date': 'DATE',
      'Store': 'LOCATION',
      'Location': 'LOCATION',
      'Vendor': 'VENDOR',
      'Vendor Name': 'VENDOR',
      'Item': 'ITEM',
      'Item Name': 'ITEM',
      'Category': 'CATEGORY',
      'Quantity': 'QUANTITY',
      'Qty': 'QUANTITY',
      'Unit Price': 'UNIT_PRICE',
      'Price': 'UNIT_PRICE',
      'Total': 'TOTAL',
      'Total Cost': 'TOTAL',
      'Extended Cost': 'TOTAL',
      'Invoice Number': 'INVOICE_NUM',
      'Invoice #': 'INVOICE_NUM',
      'Invoice': 'INVOICE_NUM'
    },
    'GL': {
      'Business Date': 'DATE',
      'Date': 'DATE',
      'Transaction Date': 'DATE',
      'Store': 'LOCATION',
      'Location': 'LOCATION',
      'Account Code': 'ACCOUNT_CODE',
      'Account #': 'ACCOUNT_CODE',
      'Account': 'ACCOUNT_CODE',
      'Account Name': 'ACCOUNT_NAME',
      'Debit': 'DEBIT',
      'Credit': 'CREDIT',
      'Description': 'DESCRIPTION',
      'Memo': 'DESCRIPTION'
    }
  };

  const columnMap = COLUMN_MAPS[reportType] || {};
  const mappedHeaders = [];

  for (let i = 0; i < rawHeaders.length; i++) {
    const rawHeader = rawHeaders[i].toString().trim();
    const mappedHeader = columnMap[rawHeader] || rawHeader.toUpperCase().replace(/ /g, '_');
    mappedHeaders.push(mappedHeader);
  }

  return mappedHeaders;
}

/**
 * Clean and validate data rows
 * Removes empty rows, trims whitespace, converts dates
 *
 * @param {Array[]} data - Raw data rows
 * @param {string[]} headers - Column headers
 * @returns {Array[]} Cleaned data rows
 */
function cleanDataRows(data, headers) {
  const cleanedData = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Skip completely empty rows
    if (isEmptyRow(row)) {
      continue;
    }

    const cleanedRow = [];

    for (let j = 0; j < row.length; j++) {
      let value = row[j];

      // Convert dates
      if (headers[j] === 'DATE' && value) {
        value = Utils.parseDate(value);
      }

      // Clean numeric values (remove $, commas)
      if (typeof value === 'string' &&
          (headers[j].includes('SALES') ||
           headers[j].includes('COST') ||
           headers[j].includes('PRICE') ||
           headers[j].includes('TOTAL') ||
           headers[j].includes('VALUE') ||
           headers[j].includes('TAX') ||
           headers[j].includes('TIPS') ||
           headers[j].includes('DEBIT') ||
           headers[j].includes('CREDIT'))) {
        value = Utils.cleanNumeric(value);
      }

      // Trim strings
      if (typeof value === 'string') {
        value = value.trim();
      }

      cleanedRow.push(value);
    }

    cleanedData.push(cleanedRow);
  }

  return cleanedData;
}

/**
 * Check if a row is completely empty
 *
 * @param {Array} row - Data row
 * @returns {boolean} True if row is empty
 */
function isEmptyRow(row) {
  for (let i = 0; i < row.length; i++) {
    if (row[i] !== null && row[i] !== undefined && row[i] !== '') {
      return false;
    }
  }
  return true;
}

/**
 * Test function to parse a sample attachment
 * Useful for debugging parser logic
 */
function testParser() {
  Logger.log('=== Testing Parser ===');
  Logger.log('This function requires a sample email with R365 attachments');
  Logger.log('Run testEmailSearch() first to find an email, then modify this function');
  Logger.log('to parse a specific attachment');
}
