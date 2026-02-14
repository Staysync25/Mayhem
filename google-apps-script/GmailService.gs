/**
 * Gmail Service - Email and Attachment Processing
 *
 * Handles all Gmail API interactions:
 * - Fetching R365 report emails based on subject keywords
 * - Extracting CSV/Excel attachments
 * - Labeling processed emails to prevent duplicates
 */

/**
 * Fetch R365 report emails from Gmail
 * Searches for emails with specific subject keywords from the past 2 hours
 *
 * @returns {GmailMessage[]} Array of Gmail messages with R365 reports
 */
function fetchReportEmails() {
  try {
    // Build search query using subject keywords from config
    const subjectQueries = CONFIG.SUBJECT_KEYWORDS.map(function(keyword) {
      return 'subject:"' + keyword + '"';
    });

    const query = '(' + subjectQueries.join(' OR ') + ') ' +
                  'has:attachment ' +
                  'newer_than:2h ' +
                  '-label:' + CONFIG.PROCESSED_LABEL.replace('/', '-');

    Logger.log('Gmail search query: ' + query);

    // Search Gmail (limit to 50 threads to avoid quota issues)
    const threads = GmailApp.search(query, 0, 50);
    Logger.log('Found ' + threads.length + ' email threads matching criteria');

    // Extract all messages from threads
    const messages = [];
    for (let i = 0; i < threads.length; i++) {
      const threadMessages = threads[i].getMessages();
      for (let j = 0; j < threadMessages.length; j++) {
        messages.push(threadMessages[j]);
      }
    }

    Logger.log('Total messages to process: ' + messages.length);
    return messages;

  } catch (error) {
    Logger.log('ERROR in fetchReportEmails: ' + error.toString());
    throw error;
  }
}

/**
 * Extract CSV/Excel attachments from an email message
 *
 * @param {GmailMessage} message - Gmail message to extract attachments from
 * @returns {GmailAttachment[]} Array of CSV/Excel attachments
 */
function getAttachments(message) {
  try {
    const allAttachments = message.getAttachments();
    const validAttachments = [];

    for (let i = 0; i < allAttachments.length; i++) {
      const attachment = allAttachments[i];
      const filename = attachment.getName().toLowerCase();

      // Only accept CSV and Excel files
      if (filename.endsWith('.csv') ||
          filename.endsWith('.xlsx') ||
          filename.endsWith('.xls')) {

        Logger.log('  Found valid attachment: ' + attachment.getName() +
                   ' (' + attachment.getSize() + ' bytes)');
        validAttachments.push(attachment);
      } else {
        Logger.log('  Skipping non-CSV/Excel attachment: ' + attachment.getName());
      }
    }

    return validAttachments;

  } catch (error) {
    Logger.log('ERROR in getAttachments: ' + error.toString());
    throw error;
  }
}

/**
 * Mark emails as processed by applying a Gmail label
 * This prevents re-importing the same emails in future runs
 *
 * @param {GmailMessage[]} messages - Array of messages to mark as processed
 */
function markAsProcessed(messages) {
  try {
    if (messages.length === 0) {
      return;
    }

    // Get or create the processed label
    let label = GmailApp.getUserLabelByName(CONFIG.PROCESSED_LABEL);

    if (!label) {
      Logger.log('Creating new label: ' + CONFIG.PROCESSED_LABEL);
      label = GmailApp.createLabel(CONFIG.PROCESSED_LABEL);
    }

    // Get threads for all messages (need to label threads, not individual messages)
    const threads = [];
    for (let i = 0; i < messages.length; i++) {
      const thread = messages[i].getThread();
      // Avoid duplicates
      if (threads.indexOf(thread) === -1) {
        threads.push(thread);
      }
    }

    // Apply label to all threads
    Logger.log('Applying "' + CONFIG.PROCESSED_LABEL + '" label to ' + threads.length + ' thread(s)');
    label.addToThreads(threads);

  } catch (error) {
    Logger.log('ERROR in markAsProcessed: ' + error.toString());
    // Don't throw - this is not critical enough to fail the entire import
  }
}

/**
 * Identify report type from email subject line
 * Used as a fallback if filename doesn't clearly indicate report type
 *
 * @param {string} subject - Email subject line
 * @returns {string} Report type identifier
 */
function identifyReportTypeFromSubject(subject) {
  const lowerSubject = subject.toLowerCase();

  if (lowerSubject.includes('sales summary')) {
    return 'SALES';
  } else if (lowerSubject.includes('menu mix')) {
    return 'MENU_MIX';
  } else if (lowerSubject.includes('actual vs theoretical') ||
             lowerSubject.includes('theoretical')) {
    return 'THEORETICAL';
  } else if (lowerSubject.includes('inventory valuation') ||
             lowerSubject.includes('inventory')) {
    return 'INVENTORY';
  } else if (lowerSubject.includes('purchases by vendor') ||
             lowerSubject.includes('purchases')) {
    return 'PURCHASES';
  } else if (lowerSubject.includes('gl detail') ||
             lowerSubject.includes('general ledger')) {
    return 'GL';
  }

  return 'UNKNOWN';
}

/**
 * Get email metadata for logging/debugging
 *
 * @param {GmailMessage} message - Gmail message
 * @returns {Object} Object with email metadata
 */
function getEmailMetadata(message) {
  return {
    subject: message.getSubject(),
    from: message.getFrom(),
    date: message.getDate(),
    id: message.getId()
  };
}

/**
 * Test function to list recent R365 emails without processing them
 * Useful for debugging email search query
 */
function testEmailSearch() {
  Logger.log('=== Testing Email Search ===');

  try {
    const messages = fetchReportEmails();

    Logger.log('Found ' + messages.length + ' messages');
    Logger.log('');

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const metadata = getEmailMetadata(message);
      const attachments = getAttachments(message);

      Logger.log('Email ' + (i + 1) + ':');
      Logger.log('  Subject: ' + metadata.subject);
      Logger.log('  From: ' + metadata.from);
      Logger.log('  Date: ' + metadata.date);
      Logger.log('  Attachments: ' + attachments.length);

      for (let j = 0; j < attachments.length; j++) {
        Logger.log('    - ' + attachments[j].getName());
      }

      Logger.log('');
    }

  } catch (error) {
    Logger.log('ERROR in testEmailSearch: ' + error.toString());
    throw error;
  }
}

/**
 * Utility function to create the processed label if it doesn't exist
 * Run this manually if you want to set up the label before the first import
 */
function createProcessedLabel() {
  try {
    let label = GmailApp.getUserLabelByName(CONFIG.PROCESSED_LABEL);

    if (label) {
      Logger.log('Label "' + CONFIG.PROCESSED_LABEL + '" already exists');
    } else {
      label = GmailApp.createLabel(CONFIG.PROCESSED_LABEL);
      Logger.log('Created label: ' + CONFIG.PROCESSED_LABEL);
    }

  } catch (error) {
    Logger.log('ERROR creating label: ' + error.toString());
    throw error;
  }
}

/**
 * Utility function to remove processed label from all emails
 * Use this if you want to re-import historical emails
 * WARNING: This will cause all R365 emails to be re-imported on next run!
 */
function clearProcessedLabels() {
  try {
    const label = GmailApp.getUserLabelByName(CONFIG.PROCESSED_LABEL);

    if (!label) {
      Logger.log('Label "' + CONFIG.PROCESSED_LABEL + '" does not exist');
      return;
    }

    const threads = label.getThreads();
    Logger.log('Removing label from ' + threads.length + ' threads');

    label.removeFromThreads(threads);
    Logger.log('All processed labels cleared');
    Logger.log('WARNING: Next import will re-process these emails!');

  } catch (error) {
    Logger.log('ERROR clearing labels: ' + error.toString());
    throw error;
  }
}
