# QUICK DEPLOY - 30 Minute Setup

Follow these steps in order. Total time: ~30 minutes.

## ⏱️ Step 1: Create Google Sheet (5 min)

1. Go to: https://sheets.google.com
2. Click: "+ Blank"
3. Rename: "Restaurant Metrics Dashboard"
4. Create 8 tabs (right-click tab bar → Insert sheet):
   - RAW_SALES
   - RAW_THEORETICAL
   - RAW_INVENTORY
   - RAW_PURCHASES
   - RAW_GL
   - DATA_MODEL
   - KPI_CALCULATIONS
   - EXECUTIVE_DASHBOARD

## ⏱️ Step 2: Add Headers (3 min)

Copy/paste these headers into Row 1 of each tab:

**RAW_SALES:**
```
DATE	LOCATION	TOTAL_SALES	FOOD_SALES	BEV_SALES	TAX	TIPS	GUESTS	IMPORT_DATE	IMPORT_ID
```

**RAW_THEORETICAL:**
```
DATE	LOCATION	CATEGORY	THEORETICAL_COST	ACTUAL_COST	VARIANCE	IMPORT_DATE	IMPORT_ID
```

**RAW_INVENTORY:**
```
DATE	LOCATION	ITEM	CATEGORY	QUANTITY	UNIT_COST	TOTAL_VALUE	IMPORT_DATE	IMPORT_ID
```

**RAW_PURCHASES:**
```
DATE	LOCATION	VENDOR	ITEM	CATEGORY	QUANTITY	UNIT_PRICE	TOTAL	INVOICE_NUM	IMPORT_DATE	IMPORT_ID
```

**RAW_GL:**
```
DATE	LOCATION	ACCOUNT_CODE	ACCOUNT_NAME	DEBIT	CREDIT	DESCRIPTION	IMPORT_DATE	IMPORT_ID
```

For each RAW tab:
- Select Row 1 → Format → Bold
- Select Row 1 → Fill color → Light gray
- View → Freeze → 1 row

## ⏱️ Step 3: Setup DATA_MODEL (5 min)

In DATA_MODEL tab, create your location mapping starting at Row 1:

```
LOCATION_CODE	LOCATION_NAME	REGION	MANAGER	COGS_TARGET	VARIANCE_THRESHOLD
LOC001	Your Location Name	Your Region	Manager Name	0.23	0.015
```

Add a row for each of your 1-5 locations.

## ⏱️ Step 4: Deploy Apps Script (10 min)

### A. Open Apps Script
1. In Google Sheet: **Extensions → Apps Script**
2. You'll see default `Code.gs`

### B. Configure appsscript.json
1. Click gear icon ⚙️ → **Project Settings**
2. Check: **"Show 'appsscript.json' manifest file in editor"**
3. Click **Editor** tab (< icon)
4. Click `appsscript.json` in file list
5. Delete all content
6. Copy/paste from: `/home/user/Mayhem/google-apps-script/appsscript.json`
7. Save (Ctrl+S)

### C. Create .gs files

For EACH of these 8 files:
1. Click + next to Files → Script
2. Name it (e.g., "GmailService")
3. Delete default content
4. Copy/paste from corresponding file in `/home/user/Mayhem/google-apps-script/`
5. Save (Ctrl+S)

**Files to create:**
- ✅ Code.gs (replace existing)
- ✅ GmailService.gs
- ✅ ParserService.gs
- ✅ DataService.gs
- ✅ KPICalculator.gs
- ✅ Config.gs ⚠️
- ✅ AlertService.gs
- ✅ Utils.gs

### D. Update Config.gs
🚨 **CRITICAL:**
1. Open `Config.gs`
2. Line 17: Change `ALERT_EMAIL: 'your-email@domain.com'` to YOUR email
3. Save (Ctrl+S)

### E. Rename project
1. Click "Untitled project" at top
2. Rename: "Restaurant Metrics Dashboard"

## ⏱️ Step 5: Authorize & Test (5 min)

### A. Run Setup
1. Select function dropdown: **setupTriggers**
2. Click **Run** (▶️)
3. Authorization dialog appears → Click **"Review permissions"**
4. Select your Google account
5. Click **"Advanced"** → **"Go to Restaurant Dashboard (unsafe)"**
6. Click **"Allow"**

### B. Test Import
1. Forward a test R365 email to your Gmail
2. Select function: **testImport**
3. Click **Run** (▶️)
4. Check execution log (Ctrl+Enter or View → Logs)
5. Look for: "Successfully processed: SALES"

### C. Verify Data
1. Go back to your Google Sheet
2. Open RAW_SALES tab
3. Check: Row 2+ has data
4. Check: IMPORT_DATE and IMPORT_ID columns populated

## ⏱️ Step 6: Production Setup (2 min)

### A. Create Gmail Label
1. Go to Gmail: https://mail.google.com
2. Settings (gear) → "See all settings"
3. Labels tab → "Create new label"
4. Name: **R365/Processed**
5. Click "Create"

### B. Verify Trigger
1. In Apps Script: Click Triggers icon (⏰ clock)
2. Verify: `hourlyEmailFetch` runs every 1 hour

## ✅ DEPLOYMENT COMPLETE!

Your dashboard is now live and will automatically:
- Check Gmail every hour for R365 emails
- Parse CSV/Excel attachments
- Append to RAW tabs
- Deduplicate data
- Send alerts if COGS > 23% or Variance > 1.5%

## 📊 Next Steps

1. **Add KPI Formulas** (see DEPLOYMENT.md for formulas)
2. **Build Dashboard** (filters, KPI tiles, charts)
3. **Monitor First 24 Hours**
   - Check: Apps Script → View → Executions
   - Check: Your email for alerts
4. **Share with CFO/Team**

## 🆘 Troubleshooting

**No data importing?**
- Check execution logs: Apps Script → View → Executions
- Run `showTriggerStatus()` to verify trigger is active
- Run `testEmailSearch()` to see if Gmail finds R365 emails

**Need help?**
- See: DEPLOYMENT.md (full guide)
- See: README.md (quick reference)
- Check execution logs for error messages

## 🔑 Critical Settings in Config.gs

```javascript
ALERT_EMAIL: 'YOUR-EMAIL@domain.com'  // UPDATE THIS!
COGS_TARGET: 0.23                     // 23% target
VARIANCE_THRESHOLD: 0.015             // 1.5% alert
```

## 📁 File Locations

All code files are in:
```
/home/user/Mayhem/google-apps-script/
```

Copy/paste from there into Apps Script editor.

---

**Estimated time to first import:** 1 hour (next hourly trigger)
**Alternative:** Run `testImport()` manually for immediate results

Good luck! 🚀
