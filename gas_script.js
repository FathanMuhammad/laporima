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
 *    - Description: "LaporIma API v2"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 7. Click "Deploy".
 * 8. Copy "Web app URL" and paste to `src/services/sheets.js` (GAS_URL).
 */

const SHEET_NAME = 'Sheet1'; // Change this if your sheet has a different name

const HEADERS = [
  'NO', 'NAMA', 'SURAT MASUK', 'ALAMAT', 'RT', 'RW', 
  'KELURAHAN', 'KECAMATAN', 'TELP', 'BANTUAN', 'DINAS', 'STATUS', 'EXTRA_DATA'
];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Try to find the active sheet, or fallback to the first sheet
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
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  if (lastRow < 2) {
    return ContentService.createTextOutput(JSON.stringify({ tickets: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

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

  // Return data
  return ContentService.createTextOutput(JSON.stringify({
    tickets: tickets,
    currentUserId: 'ima', // Default for now
    botMessages: []
  })).setMimeType(ContentService.MimeType.JSON);
}

// Handle POST request (Save/Update Row)
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = getSheet();
    
    // We expect payload to be { action: 'update', ticket: { ...row data... } }
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
      
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid action or payload' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
