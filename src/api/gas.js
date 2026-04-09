const GOOGLE_APP_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL;

export const gasApi = {
  async query(ticketNo = '') {
    const url = `${GOOGLE_APP_SCRIPT_URL}?action=query&ticketNo=${ticketNo}`;
    const response = await fetch(url);
    return response.json();
  },

  async import(data) {
    const response = await fetch(GOOGLE_APP_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // 重要：GAS 通常需要 no-cors 或處理轉向
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'import',
        data: data
      })
    });
    // 注意：no-cors 模式下無法讀取 response body，
    // 如果需要確認成功，GAS 必須設定正確的 CORS 或是使用其他方式。
    // 這裡我們假設呼叫成功即成功，或提醒使用者 GAS 需正確處理權限。
    return { success: true };
  },

  async update(params) {
    const response = await fetch(GOOGLE_APP_SCRIPT_URL, {
      method: 'POST',
      // GAS POST 請求通常需要跟隨轉向，fetch 直接處理可能會有 CORS 問題。
      // 建議 GAS 部署時將權限設為 Anyone。
      body: JSON.stringify({
        action: 'update',
        ...params
      })
    });
    return response.json();
  }
};
