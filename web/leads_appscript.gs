/**
 * Google Apps Script — receives lead POSTs from the directory and appends
 * them as rows to the bound Google Sheet.
 *
 * SETUP (one time):
 *  1. Open your sheet:
 *     https://docs.google.com/spreadsheets/d/1hYGD1rYV3RRcD5qNI_F1ZeXKUmCfLLGH5XBSR90RcZ0/edit
 *  2. Extensions -> Apps Script. Delete any code, paste ALL of this, Save.
 *  3. Deploy -> New deployment -> type "Web app".
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     Click Deploy, authorize when prompted, and COPY the Web app URL
 *     (looks like https://script.google.com/macros/s/AKfy.../exec).
 *  4. Send that URL to Claude — it gets set as LEAD_WEBHOOK in Vercel.
 *
 * Test: open the /exec URL in a browser -> should say "Lead endpoint OK".
 */

var HEADERS = ['timestamp', 'name', 'phone', 'email', 'city', 'service',
               'details', 'user_agent'];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // write header row once
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    sheet.appendRow([
      data.ts || new Date().toISOString(),
      data.name || '', data.phone || '', data.email || '',
      data.city || '', data.service || '', data.details || '',
      data.ua || ''
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Lead endpoint OK');
}
