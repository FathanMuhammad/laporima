/**
 * LAPORIMA - Google Apps Script (Google Sheets Database)
 * 
 * 1. Buka Google Sheets baru, namai "Database LaporIma".
 * 2. Masuk ke menu "Extensions" > "Apps Script".
 * 3. Hapus semua kode default, paste kode di bawah ini.
 * 4. Simpan (Ctrl+S / Cmd+S).
 * 5. Klik "Deploy" > "New deployment".
 *    - Select type: "Web app"
 *    - Description: "LaporIma API v1"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (Penting agar web bisa akses)
 * 6. Klik "Deploy".
 * 7. Copy "Web app URL" dan paste ke `src/services/sheets.js` (variabel GAS_URL).
 */

const SHEET_NAME = 'Data';

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Data JSON']);
    // Initial empty data
    sheet.appendRow([JSON.stringify({ tickets: [], counter: 1, currentUserId: 'koor', botMessages: [] })]);
  }
}

// Handle GET request (Load Data)
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  
  if (sheet.getLastRow() < 2) {
    setupSheet();
  }

  const rawData = sheet.getRange(2, 1).getValue();
  
  return ContentService.createTextOutput(rawData)
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle POST request (Save Data)
function doPost(e) {
  try {
    const data = e.postData.contents;
    
    // Parse to ensure it's valid JSON
    JSON.parse(data);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Data JSON']);
    }
    
    // Write JSON string to A2
    sheet.getRange(2, 1).setValue(data);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// To bypass CORS for preflight requests in some environments
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
