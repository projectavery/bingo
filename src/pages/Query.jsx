import { useState, useEffect } from 'react';
import { gasApi } from '../api/gas';
import Scanner from '../components/Scanner';
import { Search, QrCode, CheckCircle2 } from 'lucide-react';

const QueryPage = () => {
  const [ticketNo, setTicketNo] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (num = ticketNo) => {
    const cleanNum = String(num).trim();
    if (!cleanNum) return;
    setLoading(true);
    setError(null);
    try {
      const data = await gasApi.query(cleanNum);
      const exactMatch = Array.isArray(data) ? data.filter(item => String(item['摸彩卷號碼']) === String(num)) : [];
      setResults(exactMatch);
      if (exactMatch.length === 0) {
        // 只有在查詢成功但沒結果時才不設定 error
      }
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const onScanSuccess = (decodedText) => {
    setTicketNo(decodedText);
    setShowScanner(false);
    // 掃描後直接觸發查詢，不需手動按鍵
    handleSearch(decodedText);
  };

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 className="tech-title">中獎查詢系統</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '-10px' }}>輸入或掃描摸彩卷號碼查詢中獎資訊</p>
      </header>

      <div className="glass" style={{ padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '15px', color: 'var(--primary)' }}>中獎查詢</h2>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input 
            placeholder="請輸入完整號碼查詢" 
            value={ticketNo}
            onChange={(e) => setTicketNo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="neo-button" onClick={() => handleSearch()} style={{ padding: '12px' }}>
            <Search size={20} />
          </button>
          <button 
            className="neo-button" 
            onClick={() => setShowScanner(!showScanner)}
            style={{ padding: '12px', background: 'linear-gradient(135deg, var(--accent), var(--secondary))' }}
          >
            <QrCode size={20} />
          </button>
        </div>

        {showScanner && <Scanner onScanSuccess={onScanSuccess} />}
      </div>

      {error && (
        <div className="glass animate-fade" style={{ padding: '15px', marginBottom: '20px', border: '1px solid var(--error)', color: 'var(--error)', textAlign: 'center' }}>
          ⚠️ 查詢失敗：{error}
        </div>
      )}

      <div className="results-list">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>查詢中...</p>
        ) : results.length > 0 ? (
          results.map((item, index) => (
            <div key={index} className="glass animate-fade" style={{ 
              padding: '15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderLeft: `4px solid ${item['兌獎狀態'] === '已兌獎' ? 'var(--success)' : 'var(--primary)'}`
            }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item['摸彩卷號碼']} - {item['獎品內容']}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  {item['抽獎階段']} | {item['獎次']} | 備註: {item['備註']}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem',
                  backgroundColor: item['兌獎狀態'] === '已兌獎' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 242, 255, 0.2)',
                  color: item['兌獎狀態'] === '已兌獎' ? 'var(--success)' : 'var(--primary)'
                }}>
                  {item['兌獎狀態']}
                </span>
              </div>
            </div>
          ))
        ) : ticketNo && (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            別氣餒!還有很多獎項未開出，下一個幸運兒就是你..
          </p>
        )}
      </div>
    </div>
  );
};

export default QueryPage;
