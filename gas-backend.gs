/**
 * Google Apps Script 為兌獎系統之後端
 * 請將此代碼貼上至 Google Sheet 的「擴充功能 > Apps Script」中
 */

const SHEET_NAME = '中獎清單';

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    return createResponse({ error: '找不到工作表: ' + SHEET_NAME });
  }

  if (action === 'query') {
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    const ticketNo = e.parameter.ticketNo ? String(e.parameter.ticketNo).trim() : '';
    
    let results = rows.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        // 去除表頭空白，確保屬性名稱精確
        obj[String(header).trim()] = row[index];
      });
      return obj;
    });

    if (ticketNo) {
      // 魯棒性匹配：同時考慮字串比對與去零後的純數字比對
      results = results.filter(r => {
        const val = String(r['摸彩卷號碼']).trim();
        return val === ticketNo || Number(val) === Number(ticketNo);
      });
    }

    return createResponse(results);
  }

  return createResponse({ error: '無效的 Action' });
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['摸彩卷號碼', '抽獎階段', '獎次', '獎品內容', '備註', '兌獎狀態', '姓名', '身分證ID', '電話', '地址']);
  }

  if (action === 'import') {
    const items = params.data;
    const data = sheet.getDataRange().getValues();
    // 取得現有所有摸彩卷號碼 (第一欄)，轉為字串並去除空白
    const existingNumbers = new Set(data.slice(1).map(row => String(row[0]).trim()));
    
    let addedCount = 0;
    const skipped = [];

    items.forEach(item => {
      const ticketNo = String(item.ticketNo || '').trim();
      if (existingNumbers.has(ticketNo)) {
        skipped.push(ticketNo);
      } else {
        sheet.appendRow([
          "'" + ticketNo, 
          item.stage || '',
          item.prizeRank || '',
          item.prizeContent || '',
          item.remark || '',
          '未兌獎',
          '', '', '', ''
        ]);
        existingNumbers.add(ticketNo); // 防止傳入的清單本身有重複
        addedCount++;
      }
    });

    return createResponse({ 
      success: true, 
      count: addedCount, 
      skipped: skipped,
      total: items.length 
    });
  }

  if (action === 'update') {
    const ticketNo = String(params.ticketNo || '').trim();
    const data = sheet.getDataRange().getValues();
    
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      const val = String(data[i][0]).trim();
      if (val === ticketNo || Number(val) === Number(ticketNo)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      return createResponse({ error: '找不到該號碼: ' + ticketNo });
    }

    if (params.status) sheet.getRange(rowIndex, 6).setValue(params.status);
    if (params.name !== undefined) sheet.getRange(rowIndex, 7).setValue(params.name);
    if (params.idCard !== undefined) sheet.getRange(rowIndex, 8).setValue(params.idCard);
    if (params.phone !== undefined) sheet.getRange(rowIndex, 9).setValue(params.phone);
    if (params.address !== undefined) sheet.getRange(rowIndex, 10).setValue(params.address);

    return createResponse({ success: true });
  }

  return createResponse({ error: '無效的 Action' });
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
