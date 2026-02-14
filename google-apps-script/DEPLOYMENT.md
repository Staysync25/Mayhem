# Restaurant Metrics Dashboard - Deployment Guide

Complete step-by-step deployment instructions for the automated R365 dashboard.

## Prerequisites

- Google Workspace account with Gmail and Google Sheets
- R365 system sending daily/weekly email reports
- 1-5 restaurant locations
- Basic familiarity with Google Sheets and Apps Script

## Deployment Checklist

Use this checklist to track your deployment progress:

```
Phase 1: Google Sheet Setup
□ Create new Google Sheet
□ Name it "Restaurant Metrics Dashboard"
□ Create 8 required tabs
□ Add headers to RAW tabs
□ Populate DATA_MODEL tab
□ Share with stakeholders

Phase 2: Apps Script Deployment
□ Open Apps Script editor
□ Configure appsscript.json
□ Create 8 .gs files
□ Paste code into each file
□ Update ALERT_EMAIL in Config.gs
□ Save all files

Phase 3: Authorization & Testing
□ Run setupTriggers()
□ Authorize OAuth permissions
□ Run testImport()
□ Verify data in RAW tabs
□ Check KPI calculations
□ Test dashboard filters

Phase 4: Production Launch
□ Create Gmail "R365/Processed" label
□ Monitor first 24 hours
□ Validate data accuracy
□ Train stakeholders
□ Schedule weekly reviews

Phase 5: Post-Launch
□ Set up monitoring routine
□ Document customizations
□ Establish backup schedule
```

---

## Phase 1: Google Sheet Setup

### Step 1.1: Create Google Sheet

1. Open browser, go to https://sheets.google.com
2. Click "+ Blank" to create new spreadsheet
3. Click on "Untitled spreadsheet" at top
4. Rename to: **Restaurant Metrics Dashboard**
5. Note the spreadsheet URL for later

### Step 1.2: Create Required Tabs

Create these 8 tabs (right-click tab bar → Insert sheet):

1. **RAW_SALES**
2. **RAW_THEORETICAL**
3. **RAW_INVENTORY**
4. **RAW_PURCHASES**
5. **RAW_GL**
6. **DATA_MODEL**
7. **KPI_CALCULATIONS**
8. **EXECUTIVE_DASHBOARD**

### Step 1.3: Add Headers to RAW Tabs

#### RAW_SALES (Row 1):
```
DATE | LOCATION | TOTAL_SALES | FOOD_SALES | BEV_SALES | TAX | TIPS | GUESTS | IMPORT_DATE | IMPORT_ID
```

#### RAW_THEORETICAL (Row 1):
```
DATE | LOCATION | CATEGORY | THEORETICAL_COST | ACTUAL_COST | VARIANCE | IMPORT_DATE | IMPORT_ID
```

#### RAW_INVENTORY (Row 1):
```
DATE | LOCATION | ITEM | CATEGORY | QUANTITY | UNIT_COST | TOTAL_VALUE | IMPORT_DATE | IMPORT_ID
```

#### RAW_PURCHASES (Row 1):
```
DATE | LOCATION | VENDOR | ITEM | CATEGORY | QUANTITY | UNIT_PRICE | TOTAL | INVOICE_NUM | IMPORT_DATE | IMPORT_ID
```

#### RAW_GL (Row 1):
```
DATE | LOCATION | ACCOUNT_CODE | ACCOUNT_NAME | DEBIT | CREDIT | DESCRIPTION | IMPORT_DATE | IMPORT_ID
```

**Formatting:**
- Select Row 1 in each RAW tab
- Format → Bold
- Format → Background color → Light gray
- View → Freeze → 1 row

### Step 1.4: Populate DATA_MODEL Tab

Create three sections in DATA_MODEL tab:

**Section 1: Item → Category Map (Starting at A1)**
```
ITEM | PRIMARY_CATEGORY | SUBCATEGORY | IS_FOOD | IS_BEVERAGE
```
Example data:
```
Ground Beef 80/20 | Protein | Beef | TRUE | FALSE
Chicken Breast    | Protein | Poultry | TRUE | FALSE
IPA Draft         | Beverage | Beer | FALSE | TRUE
```

**Section 2: Vendor → Type Map (Starting at A10)**
```
VENDOR | TYPE | PRIMARY_CATEGORY | PAYMENT_TERMS | RISK_LEVEL
```
Example data:
```
Sysco      | Broadline | Multiple | Net 30 | Low
US Foods   | Broadline | Multiple | Net 30 | Low
Local Farm | Specialty | Produce  | Cash   | Medium
```

**Section 3: Location Map (Starting at A20)**
```
LOCATION_CODE | LOCATION_NAME | REGION | MANAGER | COGS_TARGET | VARIANCE_THRESHOLD
```
Example data (update for your locations):
```
LOC001 | Downtown Flagship | Metro   | John Smith | 0.23 | 0.015
LOC002 | Suburban Unit #2  | Suburbs | Jane Doe   | 0.23 | 0.015
```

### Step 1.5: Set Up KPI_CALCULATIONS Tab

Add headers in Row 1:
```
DATE | LOCATION | SALES | COGS_ACTUAL | COGS_THEO | COGS_PCT | VARIANCE_PCT | PRIME_COST | INV_VALUE | INV_TURN | ALERT_FLAG
```

Add formulas in Row 2 (these will auto-calculate as data imports):

**A2 (DATE):** Leave blank initially, will populate from RAW_SALES

**B2 (LOCATION):** Leave blank initially, will populate from RAW_SALES

**C2 (SALES):**
```
=SUMIFS(RAW_SALES!$C:$C, RAW_SALES!$A:$A, A2, RAW_SALES!$B:$B, B2)
```

**D2 (COGS_ACTUAL):**
```
=SUMIFS(RAW_THEORETICAL!$E:$E, RAW_THEORETICAL!$A:$A, A2, RAW_THEORETICAL!$B:$B, B2)
```

**E2 (COGS_THEO):**
```
=SUMIFS(RAW_THEORETICAL!$D:$D, RAW_THEORETICAL!$A:$A, A2, RAW_THEORETICAL!$B:$B, B2)
```

**F2 (COGS_PCT):**
```
=IF(C2>0, D2/C2, 0)
```

**G2 (VARIANCE_PCT):**
```
=IF(E2>0, (D2-E2)/E2, 0)
```

**H2 (PRIME_COST):**
```
=D2
```
(Will add labor later when enabled)

**I2 (INV_VALUE):**
```
=SUMIFS(RAW_INVENTORY!$G:$G, RAW_INVENTORY!$A:$A, A2, RAW_INVENTORY!$B:$B, B2)
```

**J2 (INV_TURN):**
```
=IF(MONTH(A2)=MONTH(A2-1), "", IF(I2>0, C2/I2, 0))
```

**K2 (ALERT_FLAG):**
```
=IF(G2>0.015, "⚠️ Variance High (" & TEXT(G2,"0.0%") & ")",
    IF(F2>0.23, "⚠️ COGS High (" & TEXT(F2,"0.0%") & ")",
       "✓ On Target"))
```

Format:
- Row 1: Bold, light gray background
- Column F & G: Percentage format
- Columns C-J: Number format, 2 decimals

### Step 1.6: Build EXECUTIVE_DASHBOARD Tab

**Row 1-2: Filters**
- A1: "Date Range:"
- B1: Data validation dropdown with values: Last 7 Days, Last 30 Days, Last 90 Days, MTD, YTD
- D1: "Location:"
- E1: Data validation dropdown with values: All, [your location codes]

**Row 4-6: KPI Tiles**
Format cells B4:G6 with borders, large font, center alignment

**B4 (Sales Label):** "SALES"
**B5 (Sales Value):**
```
=TEXT(SUMIFS(KPI_CALCULATIONS!C:C, KPI_CALCULATIONS!A:A, ">="&TODAY()-30), "$#,##0")
```

**D4 (COGS Label):** "COGS %"
**D5 (COGS Value):**
```
=TEXT(SUMIFS(KPI_CALCULATIONS!D:D, KPI_CALCULATIONS!A:A, ">="&TODAY()-30) /
      SUMIFS(KPI_CALCULATIONS!C:C, KPI_CALCULATIONS!A:A, ">="&TODAY()-30), "0.0%")
```

**F4 (Variance Label):** "VARIANCE"
**F5 (Variance Value):**
```
=TEXT(SUMIFS(KPI_CALCULATIONS!D:D, KPI_CALCULATIONS!A:A, ">="&TODAY()-30) /
      SUMIFS(KPI_CALCULATIONS!E:E, KPI_CALCULATIONS!A:A, ">="&TODAY()-30) - 1, "+0.0%;-0.0%")
```

**Charts:**
- Insert → Chart
- Chart type: Line chart
- Data range: KPI_CALCULATIONS A:G (filtered by last 30 days)
- Customize: Add horizontal lines at 23% (COGS target) and 1.5% (variance threshold)

### Step 1.7: Share with Stakeholders

1. Click "Share" button (top right)
2. Add emails of CFO/Director/managers
3. Set permission: "Viewer" (most users)
4. Set permission: "Editor" (only admins who can modify)
5. Click "Done"

---

## Phase 2: Apps Script Deployment

### Step 2.1: Open Apps Script Editor

1. In your Google Sheet, go to: **Extensions → Apps Script**
2. You'll see default `Code.gs` with `myFunction()`
3. Delete all content in `Code.gs` (we'll replace it)

### Step 2.2: Configure appsscript.json

1. Click gear icon (⚙️) → **Project Settings**
2. Check: **"Show 'appsscript.json' manifest file in editor"**
3. Go back to **Editor** tab (< icon)
4. You should now see `appsscript.json` in file list
5. Click on `appsscript.json`
6. Delete existing content
7. Copy and paste the contents from `/home/user/Mayhem/google-apps-script/appsscript.json`
8. Save (Ctrl+S or Cmd+S)

### Step 2.3: Create .gs Files

For each of the 8 files, follow these steps:

1. Click **"+"** next to Files
2. Select **"Script"**
3. Name the file (e.g., `GmailService`)
4. Apps Script will automatically add `.gs` extension
5. Delete default content
6. Copy and paste content from corresponding file
7. Save (Ctrl+S)

**Files to create:**
1. `Code.gs` - Main orchestration
2. `GmailService.gs` - Email processing
3. `ParserService.gs` - CSV/Excel parsing
4. `DataService.gs` - Sheet operations
5. `KPICalculator.gs` - KPI helpers
6. `Config.gs` - Configuration ⚠️
7. `AlertService.gs` - Alerts and logging
8. `Utils.gs` - Utilities

### Step 2.4: Update Config.gs

🚨 **CRITICAL: Update ALERT_EMAIL**

1. Open `Config.gs`
2. Find line: `ALERT_EMAIL: 'your-email@domain.com',`
3. Replace `'your-email@domain.com'` with your actual email address
4. Example: `ALERT_EMAIL: 'director@yourrestaurant.com',`
5. Verify:
   - `COGS_TARGET: 0.23` (23%)
   - `VARIANCE_THRESHOLD: 0.015` (1.5%)
6. Save (Ctrl+S)

### Step 2.5: Save and Name Project

1. Click on "Untitled project" at top
2. Rename to: **Restaurant Metrics Dashboard**
3. Click "OK"

---

## Phase 3: Authorization & Testing

### Step 3.1: Run setupTriggers()

1. In Apps Script editor, find dropdown menu (top center)
2. Select function: **setupTriggers**
3. Click **Run** button (▶️)
4. **First time:** Authorization dialog will appear

### Step 3.2: Authorize Permissions

1. Click **"Review permissions"**
2. Select your Google account
3. You'll see: "Google hasn't verified this app"
4. Click **"Advanced"** (bottom left)
5. Click **"Go to Restaurant Metrics Dashboard (unsafe)"**
   - ⚠️ It's safe! Google shows this for all custom scripts
6. Review permissions list:
   - Read Gmail
   - Modify Gmail labels
   - Access Google Sheets
   - Access Google Drive
   - Run triggers
7. Click **"Allow"**

### Step 3.3: Verify Setup Success

1. Check execution log (View → Logs or Ctrl+Enter)
2. You should see:
   ```
   === Setting up triggers ===
   Successfully created hourly trigger: [ID]
   === Running initial test import ===
   === Starting hourly email fetch at [timestamp] ===
   ```
3. Click Triggers icon (⏰ clock) in left sidebar
4. Verify you see: `hourlyEmailFetch` running every 1 hour

### Step 3.4: Test Manual Import

1. Forward a test R365 email to your Gmail (or wait for next scheduled email)
2. In Apps Script editor, select function: **testImport**
3. Click **Run** (▶️)
4. Watch execution log for:
   ```
   === MANUAL TEST IMPORT ===
   Found X R365 report emails to process
   Processing email 1: [subject]
   Processing attachment: [filename]
   Successfully processed: SALES
   Appending X rows to RAW_SALES
   ```

### Step 3.5: Verify Data Import

1. Go back to your Google Sheet
2. Open **RAW_SALES** tab (or whichever report type you tested)
3. Verify:
   - Row 2+ has data (not just headers)
   - `IMPORT_DATE` column shows current timestamp
   - `IMPORT_ID` column has UUID
   - `DATE` column is formatted as date (not text)
   - `TOTAL_SALES` is numeric (not text with $)

### Step 3.6: Check KPI Calculations

1. Open **KPI_CALCULATIONS** tab
2. Manually add a row with DATE and LOCATION from RAW_SALES
3. Verify formulas calculate correctly:
   - SALES matches RAW_SALES
   - COGS_PCT is a percentage
   - ALERT_FLAG shows status

### Step 3.7: Test Dashboard

1. Open **EXECUTIVE_DASHBOARD** tab
2. Change dropdown filters
3. Verify KPI tiles update
4. Check that charts display data

---

## Phase 4: Production Launch

### Step 4.1: Create Gmail Label

1. Go to Gmail (https://mail.google.com)
2. Click gear icon → "See all settings"
3. Go to "Labels" tab
4. Scroll down to "Labels" section
5. Click "Create new label"
6. Name: **R365/Processed**
   - Gmail will create "R365" parent and "Processed" child
7. Click "Create"

### Step 4.2: Monitor First 24 Hours

**Hour 1:**
- Check Apps Script Executions (View → Executions)
- Verify hourly trigger ran
- Check for green checkmarks (success) or red X (errors)

**Hour 6:**
- Check alert email inbox
- No emails = good (unless you expect errors)
- Error emails = investigate execution logs

**Hour 24:**
- Review RAW tabs for consistent imports
- Check IMPORT_LOG tab (if created)
- Verify data freshness (latest IMPORT_DATE is recent)

### Step 4.3: Validate Data Accuracy

Compare dashboard to R365 web reports:

1. **Sales Validation:**
   - RAW_SALES total for a specific date/location
   - vs R365 Sales Summary report for same date/location
   - Should match exactly

2. **COGS Validation:**
   - KPI_CALCULATIONS COGS% for a specific date/location
   - vs R365 Actual vs Theoretical report
   - Should match within 0.1%

3. **Variance Validation:**
   - KPI_CALCULATIONS VARIANCE_PCT
   - vs R365 calculated variance
   - Formula: (Actual - Theoretical) / Theoretical

If discrepancies found:
- Check R365 column mapping in `ParserService.gs`
- Review `cleanNumeric()` function for currency parsing
- Verify date format parsing in `parseDate()`

### Step 4.4: Train Stakeholders

**CFO/Director Training (30 minutes):**
1. Dashboard navigation
   - How to use filters
   - Understanding KPI tiles
   - Reading trend charts
   - Interpreting alert flags

2. Alerts
   - What triggers variance alerts (>1.5%)
   - What triggers COGS alerts (>23%)
   - How to respond to alert emails

3. Data freshness
   - How to check latest import (IMPORT_DATE)
   - What to do if data is stale (>24 hours old)

4. Weekly review process
   - Review KPI_CALCULATIONS for patterns
   - Update DATA_MODEL with new items/vendors
   - Flag anomalies for investigation

### Step 4.5: Schedule Weekly Reviews

Set recurring calendar event:
- **Frequency:** Weekly (Monday 9am recommended)
- **Attendees:** CFO, Director of Procurement, GM
- **Agenda:**
  - Review EXECUTIVE_DASHBOARD
  - Discuss locations with ⚠️ flags
  - Action items for high variance/COGS locations
  - Update targets if needed

---

## Phase 5: Post-Launch

### Daily Monitoring (5 minutes)

**Morning routine:**
1. Check email for alerts
2. Open EXECUTIVE_DASHBOARD
3. Verify latest date = yesterday or today
4. Quick scan for red flags

**If import failed:**
1. Go to Apps Script → View → Executions
2. Click failed execution (red X)
3. Read error message
4. Common fixes:
   - No emails found: R365 didn't send report
   - Parsing error: R365 changed export format
   - Quota exceeded: Too many emails processed

### Weekly Review (15 minutes)

**Every Monday:**
1. Review KPI_CALCULATIONS tab
2. Identify locations with consistent ⚠️ flags (3+ days)
3. Update DATA_MODEL:
   - Add new items from RAW_INVENTORY
   - Add new vendors from RAW_PURCHASES
   - Update location targets if changed
4. Check IMPORT_LOG for patterns

### Monthly Maintenance (30 minutes)

**First Monday of month:**
1. Export KPI_CALCULATIONS to CSV (File → Download → CSV)
2. Store in Google Drive for historical backup
3. Review vendor concentration:
   - Top 5 vendors by spend
   - Flag if one vendor >50% of purchases
   - Identify backup vendors
4. Update Config.gs if targets changed
5. Run `showImportStats()` to check success rate

### Quarterly Review (1 hour)

**Every 3 months:**
1. CFO meeting to review dashboard effectiveness
2. Identify new KPIs needed
3. Review data volume:
   - Run `showRawTabStats()`
   - If >50K rows, consider archiving
4. Performance optimization:
   - Check formula calculation speed
   - Use Apps Script Profiler if slow
   - Implement named ranges
5. Security review:
   - Audit who has access to sheet
   - Review trigger permissions
   - Check OAuth scopes

---

## Troubleshooting Guide

### Issue: No emails found

**Symptoms:** Execution log says "Found 0 R365 report emails"

**Causes:**
- R365 didn't send reports today
- Email subject lines don't match keywords
- Emails already processed (have R365/Processed label)

**Fixes:**
1. Check Gmail for R365 emails manually
2. Verify subject lines contain keywords from Config.gs
3. If needed, update `SUBJECT_KEYWORDS` in Config.gs
4. Run `clearProcessedLabels()` to re-import (WARNING: duplicates data)

### Issue: Parsing errors

**Symptoms:** "ERROR in parseCSV" or "ERROR in parseExcel"

**Causes:**
- R365 changed export format
- Attachment is corrupted
- Column names don't match mapping

**Fixes:**
1. Download attachment manually from Gmail
2. Open in Excel/Sheets
3. Check column names match expected (see `mapR365Columns` in ParserService.gs)
4. Update column mapping if R365 changed names
5. Check for special characters or encoding issues

### Issue: Authorization errors

**Symptoms:** "You do not have permission" or "ScriptError"

**Causes:**
- OAuth token expired
- Scopes changed
- Account permissions changed

**Fixes:**
1. Re-run `setupTriggers()`
2. Re-authorize when prompted
3. Check appsscript.json has all required scopes
4. Verify Google account has Gmail and Drive access

### Issue: Duplicate data

**Symptoms:** Same date/location appears multiple times

**Causes:**
- Deduplication not running
- DATE or LOCATION column missing
- Date format issues (text vs date)

**Fixes:**
1. Run `deduplicateAllTabs()` manually
2. Check RAW tabs have DATE and LOCATION columns
3. Verify dates are formatted as Date (not Text)
4. Enable `AUTO_DEDUPLICATE: true` in Config.gs

### Issue: KPIs not calculating

**Symptoms:** KPI_CALCULATIONS shows 0 or blank

**Causes:**
- No data in RAW tabs yet
- Formula errors
- Cell references broken

**Fixes:**
1. Verify RAW tabs have data
2. Check formulas in KPI_CALCULATIONS Row 2
3. Verify column names match exactly (case-sensitive)
4. Run `refreshAllKPIs()` manually
5. Re-enter formulas if needed

### Issue: Dashboard filters not working

**Symptoms:** Dropdown changes don't update KPI tiles

**Causes:**
- Formula references wrong cells
- Data validation not set up
- Conditional logic errors

**Fixes:**
1. Check KPI tile formulas reference dropdown cells
2. Verify dropdowns have data validation (Data → Data validation)
3. Test formulas manually with different date ranges
4. Re-create dropdowns if broken

---

## Performance Tuning

### Current Capacity
- 5 locations × 365 days × 5 reports = 9,125 rows/year
- Well within Google Sheets 10M cell limit
- No performance issues expected first year

### If Slow (>10 seconds to load dashboard):

**Use Named Ranges:**
```
Data → Named ranges
Create: SALES_DATA = RAW_SALES!A2:Z
Update formulas: =SUMIFS(SALES_DATA, ...)
```

**Batch Formulas:**
Instead of row-by-row SUMIFS, use QUERY:
```
=QUERY(RAW_SALES!A:C, "SELECT B, SUM(C) GROUP BY B")
```

**Archive Old Data:**
1. Create new tabs: RAW_SALES_2024_Q1, etc.
2. Move data older than 6 months
3. Update formulas to reference active data only

---

## Backup & Recovery

### Backup Schedule

**Weekly (automated):**
- Google Sheets auto-saves, but create manual backup:
  - File → Make a copy
  - Name: "Restaurant Metrics Dashboard - Backup [date]"

**Monthly:**
- Export KPI_CALCULATIONS to CSV
- Store in Google Drive folder: "Dashboard Backups"

### Restore from Backup

If data corruption:
1. Open backup copy
2. Copy RAW tab data
3. Paste into current dashboard
4. Run `deduplicateAllTabs()`
5. Run `refreshAllKPIs()`

### Disaster Recovery

If complete sheet loss:
1. Create new sheet following Phase 1 steps
2. Deploy Apps Script following Phase 2 steps
3. Re-import last 30 days of R365 emails:
   - Run `clearProcessedLabels()` in Apps Script
   - Change `EMAIL_LOOKBACK_HOURS: 720` in Config.gs (30 days)
   - Run `testImport()`
   - Change back to `EMAIL_LOOKBACK_HOURS: 2`

---

## Support Contacts

**For R365 Export Issues:**
- Contact: R365 Support
- Phone: [Your R365 support number]
- What to ask: "Sales Summary export not emailing" or "Column names changed"

**For Google Workspace Issues:**
- Contact: IT/Google Workspace Admin
- What to ask: "Gmail quota exceeded" or "Authorization errors"

**For Dashboard Questions:**
- Refer to: README.md
- Refer to: Full plan at `/root/.claude/plans/calm-spinning-russell.md`

---

## Next Steps

After successful deployment:
1. ✅ Monitor daily for first week
2. ✅ Schedule weekly review meetings
3. ✅ Train all stakeholders
4. ✅ Document any customizations
5. ✅ Plan for adding labor KPIs (future)
6. ✅ Consider expanding to additional locations

---

## Appendix: Quick Reference

### Key Functions to Run
```
setupTriggers()           # One-time setup
testImport()             # Test import manually
showTriggerStatus()      # View triggers
showRawTabStats()        # Data volume
showRecentImports(10)    # Last 10 imports
showImportStats()        # Success rate
logKPISummary()          # KPI flags
deduplicateAllTabs()     # Remove duplicates
refreshAllKPIs()         # Force KPI recalc
clearAllRawTabs()        # Delete all data (WARNING!)
```

### Key Files
- `Config.gs` - All settings (COGS target, alert thresholds)
- `GmailService.gs` - Email search logic
- `ParserService.gs` - Column mapping
- `DataService.gs` - Deduplication logic
- `KPICalculator.gs` - Alert thresholds

### Key Tabs
- `RAW_*` - Imported data (auto-populated)
- `DATA_MODEL` - Reference data (manual)
- `KPI_CALCULATIONS` - Metrics (formula-driven)
- `EXECUTIVE_DASHBOARD` - Visualization (interactive)

### Key Settings in Config.gs
```javascript
ALERT_EMAIL: 'your-email@domain.com'  // UPDATE THIS!
COGS_TARGET: 0.23                     // 23%
VARIANCE_THRESHOLD: 0.015             // 1.5%
EMAIL_LOOKBACK_HOURS: 2               // Check last 2 hours
AUTO_DEDUPLICATE: true                // Remove duplicates
AUTO_REFRESH_KPI: true                // Recalculate KPIs
```

---

## Deployment Complete!

You now have a fully automated restaurant metrics dashboard:
- ✅ Hourly R365 email imports
- ✅ Automatic COGS and variance tracking
- ✅ Executive-level visualization
- ✅ Alert emails for issues
- ✅ Zero manual data entry

Next: Monitor, optimize, and expand as needed!
