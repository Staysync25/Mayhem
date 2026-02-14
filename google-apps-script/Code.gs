/**
 * Restaurant Metrics Dashboard - Main Orchestration
 *
 * This is the main entry point for the automated R365 data import system.
 * It coordinates email fetching, data parsing, sheet updates, and KPI calculations.
 *
 * Key Functions:
 * - hourlyEmailFetch(): Main trigger function that runs every hour
 * - setupTriggers(): One-time setup to create time-based triggers
 * - testImport(): Manual testing function for debugging
 */

/**
 * Main trigger function - runs every hour to fetch and process R365 emails
 * This function is called automatically by the time-based trigger
 */
function hourlyEmailFetch() {
  const startTime = new Date();

  try {
    Logger.log('=== Starting hourly email fetch at ' + startTime + ' ===');

    // Fetch R365 report emails from Gmail
    const emails = GmailService.fetchReportEmails();
    Logger.log('Found ' + emails.length + ' R365 report emails to process');

    if (emails.length === 0) {
      Logger.log('No new R365 emails found. Exiting.');
      AlertService.logSuccess('No new emails found');
      return;
    }

    let processedCount = 0;
    let errorCount = 0;
    const processedEmails = [];

    // Process each email and its attachments
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];

      try {
        Logger.log('Processing email ' + (i + 1) + ': ' + email.getSubject());

        // Get CSV/Excel attachments from this email
        const attachments = GmailService.getAttachments(email);

        if (attachments.length === 0) {
          Logger.log('No attachments found in this email, skipping');
          continue;
        }

        // Process each attachment
        for (let j = 0; j < attachments.length; j++) {
          const attachment = attachments[j];

          try {
            Logger.log('  Processing attachment: ' + attachment.getName());

            // Parse the attachment (CSV or Excel)
            const parsed = ParserService.parseAttachment(attachment, email.getSubject());

            if (!parsed || !parsed.data || parsed.data.length === 0) {
              Logger.log('  No data parsed from attachment, skipping');
              continue;
            }

            // Append parsed data to the appropriate RAW tab
            DataService.appendToRawTab(parsed);

            processedCount++;
            Logger.log('  Successfully processed: ' + parsed.reportType);

          } catch (attachmentError) {
            errorCount++;
            Logger.log('  ERROR processing attachment: ' + attachmentError.toString());
          }
        }

        // Mark email as processed
        processedEmails.push(email);

      } catch (emailError) {
        errorCount++;
        Logger.log('ERROR processing email: ' + emailError.toString());
      }
    }

    // Mark all processed emails with label
    if (processedEmails.length > 0) {
      GmailService.markAsProcessed(processedEmails);
    }

    // Deduplicate all raw data tabs
    if (processedCount > 0) {
      Logger.log('Running deduplication on all tabs...');
      DataService.deduplicateAllTabs();

      // Refresh KPI calculations
      Logger.log('Refreshing KPI calculations...');
      KPICalculator.refreshAllKPIs();
    }

    // Log final results
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    const message = 'Import completed: ' + processedCount + ' attachments processed, ' +
                    errorCount + ' errors, ' + duration.toFixed(1) + ' seconds';

    Logger.log('=== ' + message + ' ===');
    AlertService.logSuccess(message);

    // Send alert if there were errors
    if (errorCount > 0) {
      AlertService.sendAlert(
        'Import completed with errors',
        message + '\n\nCheck execution logs for details.'
      );
    }

  } catch (error) {
    // Critical error - send alert email
    Logger.log('CRITICAL ERROR in hourlyEmailFetch: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);

    AlertService.sendAlert(
      'Critical import failure',
      'Error: ' + error.message + '\n\n' +
      'Stack: ' + error.stack + '\n\n' +
      'Time: ' + new Date()
    );

    throw error; // Re-throw to show in execution logs
  }
}

/**
 * Manual testing function - run this from Apps Script editor to test import
 * This is useful for debugging without waiting for the hourly trigger
 */
function testImport() {
  Logger.log('=== MANUAL TEST IMPORT ===');
  Logger.log('Running hourlyEmailFetch manually for testing...');

  try {
    hourlyEmailFetch();
    Logger.log('Test import completed successfully!');
    Logger.log('Check the RAW_* tabs in your spreadsheet for imported data');
  } catch (error) {
    Logger.log('Test import failed: ' + error.toString());
    throw error;
  }
}

/**
 * One-time setup function - creates the hourly time-based trigger
 * Run this once after deploying the script to enable automation
 *
 * IMPORTANT: You only need to run this ONCE. Running it multiple times
 * will create duplicate triggers.
 */
function setupTriggers() {
  Logger.log('=== Setting up triggers ===');

  try {
    // Delete any existing triggers for hourlyEmailFetch (prevent duplicates)
    const existingTriggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < existingTriggers.length; i++) {
      if (existingTriggers[i].getHandlerFunction() === 'hourlyEmailFetch') {
        Logger.log('Deleting existing trigger: ' + existingTriggers[i].getUniqueId());
        ScriptApp.deleteTrigger(existingTriggers[i]);
      }
    }

    // Create new hourly trigger
    const trigger = ScriptApp.newTrigger('hourlyEmailFetch')
      .timeBased()
      .everyHours(1)
      .create();

    Logger.log('Successfully created hourly trigger: ' + trigger.getUniqueId());
    Logger.log('The hourlyEmailFetch function will now run automatically every hour');

    // Test that everything is working
    Logger.log('Running initial test import...');
    testImport();

    Logger.log('=== Setup complete! ===');
    Logger.log('Check the Triggers page (clock icon) to see your new trigger');

  } catch (error) {
    Logger.log('ERROR setting up triggers: ' + error.toString());
    throw error;
  }
}

/**
 * Utility function to delete all triggers (for cleanup/reset)
 * Only use this if you need to completely reset the automation
 */
function deleteAllTriggers() {
  Logger.log('=== Deleting all triggers ===');

  const triggers = ScriptApp.getProjectTriggers();

  for (let i = 0; i < triggers.length; i++) {
    Logger.log('Deleting trigger: ' + triggers[i].getHandlerFunction() + ' (' + triggers[i].getUniqueId() + ')');
    ScriptApp.deleteTrigger(triggers[i]);
  }

  Logger.log('All triggers deleted. Run setupTriggers() to re-enable automation.');
}

/**
 * Function to manually trigger deduplication and KPI refresh
 * Useful if you suspect data issues or want to force a recalculation
 */
function manualRefresh() {
  Logger.log('=== Manual Refresh ===');

  try {
    Logger.log('Running deduplication...');
    DataService.deduplicateAllTabs();

    Logger.log('Refreshing KPI calculations...');
    KPICalculator.refreshAllKPIs();

    Logger.log('Manual refresh completed successfully!');
    AlertService.logSuccess('Manual refresh completed');

  } catch (error) {
    Logger.log('ERROR during manual refresh: ' + error.toString());
    AlertService.sendAlert('Manual refresh failed', error.toString());
    throw error;
  }
}

/**
 * Utility function to show current trigger status
 * Run this to see all active triggers
 */
function showTriggerStatus() {
  const triggers = ScriptApp.getProjectTriggers();

  Logger.log('=== Current Triggers ===');
  Logger.log('Total triggers: ' + triggers.length);

  for (let i = 0; i < triggers.length; i++) {
    const trigger = triggers[i];
    Logger.log('');
    Logger.log('Trigger ' + (i + 1) + ':');
    Logger.log('  Function: ' + trigger.getHandlerFunction());
    Logger.log('  Type: ' + trigger.getEventType());
    Logger.log('  ID: ' + trigger.getUniqueId());
  }

  if (triggers.length === 0) {
    Logger.log('No triggers found. Run setupTriggers() to enable automation.');
  }
}
