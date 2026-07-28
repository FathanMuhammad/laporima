/**
 * LAPORIMA - Google Apps Script (Google Sheets Database)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your existing Google Sheet that has the 2000 rows.
 * 2. Go to "Extensions" > "Apps Script".
 * 3. Delete any default code and paste this entire code.
 * 4. Save (Ctrl+S / Cmd+S).
 * 5. Run the "setupHeaders" function once (Select "setupHeaders" from the top dropdown, click Run).
 * 6. Click "Deploy" > "New deployment".
 *    - Select type: "Web app"
 *    - Description: "LaporIma API v3"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 7. Click "Deploy".
 * 8. Copy "Web app URL" and paste to `src/services/sheets.js` (GAS_URL).
 * 
 * IMPORTANT: After pasting this code, you MUST create a NEW deployment 
 * (not edit the existing one) for changes to take effect!
 */

const SHEET_NAME = 'Sheet1'; // Change this if your sheet has a different name

const HEADERS = [
  'NO', 'NAMA', 'SURAT MASUK', 'ALAMAT', 'RT', 'RW', 
  'KELURAHAN', 'KECAMATAN', 'TELP', 'BANTUAN', 'DINAS', 'STATUS', 'EXTRA_DATA'
];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

// Run this once to ensure EXTRA_DATA column exists
function setupHeaders() {
  const sheet = getSheet();
  const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (!currentHeaders.includes('EXTRA_DATA')) {
    sheet.getRange(1, currentHeaders.length + 1).setValue('EXTRA_DATA');
  }
}

// Helper: Create JSON response
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Convert row array to object
function rowToObject(row, headerMap) {
  const obj = {};
  for (const [key, index] of Object.entries(headerMap)) {
    obj[key] = row[index] !== undefined ? row[index] : '';
  }
  return obj;
}

// Handle GET request (Load Data)
function doGet(e) {
  try {
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow < 2) {
      return jsonResponse({ tickets: [], currentUserId: 'ima', botMessages: [] });
    }

    // Force fresh read from the sheet (not from Apps Script cache)
    SpreadsheetApp.flush();
    
    const dataRange = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = dataRange[0];
    const headerMap = {};
    
    headers.forEach((h, i) => {
      const key = h.toString().trim().toUpperCase();
      headerMap[key] = i;
    });

    const tickets = [];
    for (let i = 1; i < dataRange.length; i++) {
      if (!dataRange[i][headerMap['NO']]) continue; // Skip empty rows
      tickets.push(rowToObject(dataRange[i], headerMap));
    }

    return jsonResponse({
      tickets: tickets,
      currentUserId: 'ima',
      botMessages: [],
      _ts: new Date().getTime() // Timestamp to verify freshness
    });
    
  } catch (error) {
    // Return error as JSON instead of HTML error page
    return jsonResponse({
      tickets: [],
      currentUserId: 'ima',
      botMessages: [],
      error: error.toString()
    });
  }
}

// Handle POST request (Save/Update Row)
function doPost(e) {
  // Use Lock Service to prevent race conditions when multiple 
  // users update at the same time
  const lock = LockService.getScriptLock();
  
  try {
    // Wait up to 15 seconds to acquire the lock
    lock.waitLock(15000);
  } catch (lockError) {
    return jsonResponse({ 
      success: false, 
      error: 'Server busy, please try again in a few seconds.' 
    });
  }
  
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = getSheet();
    
    if (payload.action === 'update' && payload.ticket) {
      const ticket = payload.ticket;
      const targetNo = ticket['NO'];
      
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      const dataRange = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      const headers = dataRange[0];
      
      let rowIndex = -1;
      let noColIndex = -1;
      
      // Find headers mapping
      const headerMap = {};
      headers.forEach((h, i) => {
        const key = h.toString().trim().toUpperCase();
        headerMap[key] = i;
        if (key === 'NO') noColIndex = i;
      });

      // Find the row to update
      for (let i = 1; i < dataRange.length; i++) {
        // loose equality to match number vs string
        if (dataRange[i][noColIndex] == targetNo) {
          rowIndex = i + 1; // 1-indexed for Sheets
          break;
        }
      }

      if (rowIndex !== -1) {
        // Update existing row
        const rowData = [];
        headers.forEach((h, i) => {
          const key = h.toString().trim().toUpperCase();
          rowData[i] = ticket[key] !== undefined ? ticket[key] : dataRange[rowIndex-1][i];
        });
        sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
      } else {
        // Insert new row
        const rowData = [];
        headers.forEach((h, i) => {
          const key = h.toString().trim().toUpperCase();
          rowData[i] = ticket[key] !== undefined ? ticket[key] : '';
        });
        sheet.appendRow(rowData);
      }
      
      // CRITICAL: Force all pending changes to be written to the sheet
      // Without this, subsequent GET requests might return stale data
      SpreadsheetApp.flush();
      
      return jsonResponse({ success: true, _ts: new Date().getTime() });
    }
    
    return jsonResponse({ success: false, error: 'Invalid action or payload' });
    
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  } finally {
    // Always release the lock, even if an error occurred
    lock.releaseLock();
  }
}

function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
