# Restaurant Metrics Dashboard - Google Apps Script

Automated R365 data import and KPI dashboard for restaurant operations.

## Overview

This Google Apps Script project automatically:
- Fetches R365 report emails from Gmail every hour
- Parses CSV/Excel attachments
- Appends data to Google Sheets RAW tabs
- Deduplicates by DATE + LOCATION
- Calculates KPIs (COGS%, Variance%, Prime Cost%, etc.)
- Sends alerts when COGS or Variance exceed targets

## Configuration

**Target Thresholds:**
- COGS Target: 23%
- Variance Alert: 1.5%
- Labor: Skipped (can be enabled later)

**Locations:** 1-5 locations (optimized for small operations)

## Files

### Core Scripts
- `Code.gs` - Main orchestration and triggers
- `GmailService.gs` - Email/attachment processing
- `ParserService.gs` - CSV/Excel parsing
- `DataService.gs` - Sheet operations and deduplication
- `Config.gs` - Configuration (UPDATE YOUR EMAIL HERE!)
- `KPICalculator.gs` - KPI calculation helpers
- `AlertService.gs` - Error logging and notifications
- `Utils.gs` - Shared utilities

### Configuration
- `appsscript.json` - OAuth scopes and runtime settings

## Quick Start

### 1. Create Google Sheet
1. Go to https://sheets.google.com
2. Create new spreadsheet: "Restaurant Metrics Dashboard"
3. Create these tabs:
   - `RAW_SALES`
   - `RAW_THEORETICAL`
   - `RAW_INVENTORY`
   - `RAW_PURCHASES`
   - `RAW_GL`
   - `DATA_MODEL`
   - `KPI_CALCULATIONS`
   - `EXECUTIVE_DASHBOARD`

### 2. Deploy Apps Script
1. In Google Sheet: Extensions → Apps Script
2. Delete default `Code.gs` content
3. Create 8 files and paste code:
   - `Code.gs`
   - `GmailService.gs`
   - `ParserService.gs`
   - `DataService.gs`
   - `KPICalculator.gs`
   - `Config.gs` ⚠️ **UPDATE ALERT_EMAIL!**
   - `AlertService.gs`
   - `Utils.gs`

4. Create `appsscript.json`:
   - Project Settings → Check "Show appsscript.json"
   - Replace contents with provided JSON

### 3. Configure
1. Open `Config.gs`
2. Change `ALERT_EMAIL: 'your-email@domain.com'` to your actual email
3. Verify `COGS_TARGET: 0.23` (23%)
4. Verify `VARIANCE_THRESHOLD: 0.015` (1.5%)
5. Save (Ctrl+S)

### 4. Authorize & Test
1. Select function: `setupTriggers`
2. Click Run (▶️)
3. Authorize when prompted:
   - Click "Review permissions"
   - Select your Google account
   - Click "Advanced" → "Go to Restaurant Dashboard (unsafe)"
   - Click "Allow"
4. Check execution log for success

### 5. Test Import
1. Forward a test R365 email to your Gmail
2. Select function: `testImport`
3. Click Run
4. Check execution log
5. Verify data appears in RAW_* tabs

### 6. Production
1. Go to Gmail → Create label: "R365/Processed"
2. Monitor first 24 hours (View → Executions)
3. Check alert email for any errors
4. Share dashboard with stakeholders

## Google Sheet Structure

### RAW Tabs (Auto-populated)
- `RAW_SALES` - Daily sales data
- `RAW_THEORETICAL` - Theoretical vs actual COGS
- `RAW_INVENTORY` - Inventory valuations
- `RAW_PURCHASES` - Vendor purchases
- `RAW_GL` - General ledger details

All RAW tabs include:
- `IMPORT_DATE` - When data was imported
- `IMPORT_ID` - Unique import batch ID

### Data Model Tab (Manual setup)
Create three sections:
1. **Item → Category Map**
   ```
   ITEM | PRIMARY_CATEGORY | SUBCATEGORY | IS_FOOD | IS_BEVERAGE
   ```
2. **Vendor → Type Map**
   ```
   VENDOR | TYPE | PRIMARY_CATEGORY | PAYMENT_TERMS | RISK_LEVEL
   ```
3. **Location Map**
   ```
   LOCATION_CODE | LOCATION_NAME | REGION | MANAGER | COGS_TARGET | VARIANCE_THRESHOLD
   ```

### KPI Calculations Tab (Formula-driven)
See plan document for full formula examples.

Key formulas:
```
SALES = SUMIFS(RAW_SALES!C:C, RAW_SALES!A:A, A2, RAW_SALES!B:B, B2)
COGS_PCT = COGS_ACTUAL / SALES
VARIANCE_PCT = (COGS_ACTUAL - COGS_THEO) / COGS_THEO
ALERT_FLAG = IF(VARIANCE_PCT>0.015, "⚠️ Variance High", IF(COGS_PCT>0.23, "⚠️ COGS High", "✓"))
```

### Executive Dashboard (Interactive)
- Date range dropdown
- Location selector
- KPI tiles
- Trend charts
- Heat maps
- Vendor concentration charts

## Automation

### Hourly Trigger
- Runs `hourlyEmailFetch()` every hour
- Checks Gmail for new R365 emails (last 2 hours)
- Processes CSV/Excel attachments
- Appends to RAW tabs
- Deduplicates
- Refreshes KPIs

### Email Alerts
Alerts sent when:
- Import fails
- COGS > 23%
- Variance > 1.5%
- Parsing errors

## Monitoring

### Check Status
Run these functions from Apps Script editor:

```javascript
showTriggerStatus()      // View active triggers
showRawTabStats()        // Data volume per tab
showRecentImports(10)    // Last 10 imports
showImportStats()        // Success rate
logKPISummary()          // Current KPI flags
```

### Execution Logs
- Apps Script Editor → View → Executions
- Shows all runs in last 7 days
- Red indicators = errors

### Import Log
Optional `IMPORT_LOG` tab tracks:
- Timestamp
- Status (SUCCESS/ERROR)
- Message
- User
- Error details

## Troubleshooting

### No emails found
- Check Gmail search query in logs
- Verify R365 emails have correct subject lines
- Check `SUBJECT_KEYWORDS` in Config.gs
- Make sure emails are from last 2 hours

### Parsing errors
- Check attachment format (CSV or Excel)
- Verify column names match R365 exports
- Review `mapR365Columns()` in ParserService.gs
- Check execution logs for specific errors

### Authorization issues
- Re-run `setupTriggers()` to re-authorize
- Check OAuth scopes in appsscript.json
- Verify you authorized all requested permissions

### Deduplication not working
- Check DATE and LOCATION columns exist
- Verify data types (DATE should be Date, not String)
- Run `deduplicateAllTabs()` manually

### KPIs not calculating
- Check KPI_CALCULATIONS tab has formulas
- Verify RAW tabs have data
- Run `refreshAllKPIs()` manually
- Check formula cell references

## Maintenance

### Daily (5 minutes)
- Check alert email for failures
- Verify latest import date in dashboard
- Review execution logs for errors

### Weekly (15 minutes)
- Review KPI_CALCULATIONS for consistent ⚠️ flags
- Update DATA_MODEL with new items/vendors
- Check IMPORT_LOG for patterns

### Monthly (30 minutes)
- Update COGS_TARGET if targets change
- Export KPI_CALCULATIONS for historical backup
- Review vendor concentration

### Quarterly (1 hour)
- Meet with CFO to review dashboard effectiveness
- Add new KPI calculations based on needs
- Optimize slow formulas
- Plan archiving if data volume grows

## Advanced Features

### Manual Functions
```javascript
testImport()              // Test import without waiting for trigger
manualRefresh()           // Force deduplication + KPI refresh
clearAllRawTabs()         // Delete all data (WARNING!)
clearImportLog()          // Clear import history
sendDailySummary()        // Send summary email
```

### Customization
- Edit `SUBJECT_KEYWORDS` in Config.gs to match your R365 email subjects
- Adjust `COGS_TARGET` and `VARIANCE_THRESHOLD` based on your targets
- Modify `mapR365Columns()` in ParserService.gs if R365 column names differ
- Add new report types by extending `TAB_MAPPING` in Config.gs

## Performance

### Current Capacity
- 5 locations × 30 days × 5 reports = 750 rows/month
- 12 months = 9,000 rows (well within Google Sheets limits)
- No archiving needed for first year

### Optimization Tips
1. Use named ranges for faster formula calculation
2. Run deduplication daily (not after every import)
3. Batch append operations in DataService.gs
4. Archive data older than 6 months if volume grows

## Support

### Documentation
- Full plan: `/root/.claude/plans/calm-spinning-russell.md`
- Deployment guide: `DEPLOYMENT.md`

### Common Issues
- **"Quota exceeded"**: Reduce `MAX_EMAILS_PER_RUN` in Config.gs
- **"Timeout"**: Split large imports into smaller batches
- **"Permission denied"**: Re-run authorization steps

## Version Control

To track changes with Git:
```bash
cd /home/user/Mayhem/google-apps-script
git add .
git commit -m "Update Google Apps Script code"
git push
```

## Security

- Never commit real credentials
- Use environment-specific Config.gs
- Restrict sheet sharing (view-only for most users)
- Review OAuth scopes before authorizing
- Monitor execution logs for unusual activity

## License

Internal use only - Restaurant operations automation.
