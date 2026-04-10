const GOOGLE_APP_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;

// 檢查環境變數是否設定
const checkConfig = () => {
  if (!GOOGLE_APP_SCRIPT_URL) {
    console.error('❌ 錯誤：未設定 VITE_GOOGLE_APP_SCRIPT_URL 環境變數。請在 .env 或 GitHub Secrets 中設定。');
    return false;
  }
  return true;
};

export const gasApi = {
  async query(ticketNo = '') {
    if (!checkConfig()) throw new Error('API 網址未設定');
    
    try {
      const url = `${GOOGLE_APP_SCRIPT_URL}?action=query&ticketNo=${ticketNo}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('連線失敗');
      return await response.json();
    } catch (error) {
      console.error('Query Error:', error);
      throw error;
    }
  },

  async import(data) {
    if (!checkConfig()) throw new Error('API 網址未設定');

    try {
      const response = await fetch(GOOGLE_APP_SCRIPT_URL, {
        method: 'POST',
        // 使用 text/plain 可以避免 CORS preflight (OPTIONS 請求) 在某些瀏覽器失敗
        // GAS 的 doPost 可以正確讀取 postData.contents 並解析 JSON
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'import',
          data: data
        })
      });
      
      if (!response.ok) throw new Error('上傳失敗');
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      return result;
    } catch (error) {
      console.error('Import Error:', error);
      throw error;
    }
  },

  async update(params) {
    if (!checkConfig()) throw new Error('API 網址未設定');

    try {
      const response = await fetch(GOOGLE_APP_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'update',
          ...params
        })
      });
      
      if (!response.ok) throw new Error('更新失敗');
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      return result;
    } catch (error) {
      console.error('Update Error:', error);
      throw error;
    }
  }
};
