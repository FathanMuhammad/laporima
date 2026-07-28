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
 *    - Description: "LaporIma API v4"
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

    SpreadsheetApp.flush();
    
    const dataRange = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = dataRange[0];
    const headerMap = {};
    
    headers.forEach((h, i) => {
      const key = h.toString().trim().toUpperCase();
      headerMap[key] = i;
    });

    let sheetModified = false;
    let maxNo = 0;
    
    // First pass: Find the highest NO currently in the sheet
    for (let i = 1; i < dataRange.length; i++) {
      const val = parseInt(dataRange[i][headerMap['NO']], 10);
      if (!isNaN(val) && val > maxNo) {
        maxNo = val;
      }
    }

    const tickets = [];
    for (let i = 1; i < dataRange.length; i++) {
      // 1. If NAMA is completely empty, skip it (ignores pre-filled empty rows)
      if (!dataRange[i][headerMap['NAMA']] || dataRange[i][headerMap['NAMA']].toString().trim() === '') {
        continue;
      }
      
      // 2. AUTO-HEAL: If NO is empty but NAMA exists (e.g. inserted by n8n)
      if (!dataRange[i][headerMap['NO']]) {
        maxNo++;
        dataRange[i][headerMap['NO']] = maxNo;
        // Instantly write the new NO back to the Google Sheet
        sheet.getRange(i + 1, headerMap['NO'] + 1).setValue(maxNo);
        sheetModified = true;
      }
      
      tickets.push(rowToObject(dataRange[i], headerMap));
    }
    
    // If we auto-healed any rows, flush the changes to the sheet
    if (sheetModified) {
      SpreadsheetApp.flush();
    }

    return jsonResponse({
      tickets: tickets,
      currentUserId: 'ima',
      botMessages: [],
      _ts: new Date().getTime() 
    });
    
  } catch (error) {
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
  const lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(15000);
  } catch (lockError) {
    return jsonResponse({ success: false, error: 'Server busy' });
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
      
      const headerMap = {};
      headers.forEach((h, i) => {
        const key = h.toString().trim().toUpperCase();
        headerMap[key] = i;
        if (key === 'NO') noColIndex = i;
      });

      for (let i = 1; i < dataRange.length; i++) {
        if (dataRange[i][noColIndex] == targetNo) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex !== -1) {
        const rowData = [];
        headers.forEach((h, i) => {
          const key = h.toString().trim().toUpperCase();
          rowData[i] = ticket[key] !== undefined ? ticket[key] : dataRange[rowIndex-1][i];
        });
        sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
      } else {
        const rowData = [];
        headers.forEach((h, i) => {
          const key = h.toString().trim().toUpperCase();
          rowData[i] = ticket[key] !== undefined ? ticket[key] : '';
        });
        sheet.appendRow(rowData);
      }
      
      SpreadsheetApp.flush();
      return jsonResponse({ success: true, _ts: new Date().getTime() });
    }
    
    return jsonResponse({ success: false, error: 'Invalid action' });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doOptions(e) {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}
