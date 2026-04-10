import { useState } from 'react';
import { gasApi } from '../api/gas';
import Scanner from '../components/Scanner';
import WinnerModal from '../components/WinnerModal';
import { QrCode, Search, Gift, UserCheck, Edit3 } from 'lucide-react';

const RedeemPage = () => {
  const [ticketNo, setTicketNo] = useState('');
  const [prizeData, setPrizeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrize = async (num = ticketNo) => {
    if (!num) return;
    setLoading(true);
    setError(null);
    try {
      const data = await gasApi.query(num);
      const exactMatch = Array.isArray(data) ? data.find(p => String(p['摸彩卷號碼']) === String(num)) : null;
      setPrizeData(exactMatch);
      if (!exactMatch) {
        setError('找不到該中獎號碼，請確認號碼是否正確。');
      }
    } catch (err) {
      setError(err.message);
      setPrizeData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemClick = () => {
    const remark = String(prizeData['備註'] || '');
    if (remark.includes('需身分證')) {
      setShowModal(true);
    } else {
      // 一般兌獎
      submitRedemption({});
    }
  };

  const submitRedemption = async (winnerInfo) => {
    setLoading(true);
    setShowModal(false);
    try {
      await gasApi.update({
        ticketNo: prizeData['摸彩卷號碼'],
        status: '已兌獎',
        ...winnerInfo
      });
      // 重新整理資料
      await fetchPrize(prizeData['摸彩卷號碼']);
    } catch (err) {
      alert(`兌獎失敗：${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onScanSuccess = (decodedText) => {
    setTicketNo(decodedText);
    setShowScanner(false);
    fetchPrize(decodedText);
  };

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 className="tech-title">兌獎作業系統</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '-10px' }}>核對中獎資訊並錄入領獎人個資</p>
      </header>

      <div className="glass" style={{ padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '15px', color: 'var(--primary)' }}>兌獎作業</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input 
            placeholder="掃描或輸入完整號碼" 
            value={ticketNo}
            onChange={(e) => setTicketNo(e.target.value)}
          />
          <button className="neo-button" onClick={() => fetchPrize()} disabled={loading}>
            <Search size={20} />
          </button>
          <button 
            className="neo-button" 
            onClick={() => setShowScanner(!showScanner)}
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--secondary))' }}
          >
            <QrCode size={20} />
          </button>
        </div>

        {showScanner && <Scanner onScanSuccess={onScanSuccess} />}
      </div>

      {error && !loading && (
        <div className="glass animate-fade" style={{ padding: '15px', marginBottom: '20px', border: '1px solid var(--error)', color: 'var(--error)', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      {loading && <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>處理中...</p>}

      {prizeData && !loading && (
        <div className="glass animate-fade" style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 242, 255, 0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
          }}>
            <Gift size={40} color="var(--primary)" />
          </div>
          
          <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{prizeData['獎品內容']}</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>
            {prizeData['獎次']} | 摸彩卷號碼：{prizeData['摸彩卷號碼']}<br/>
            狀態：<span style={{ color: prizeData['兌獎狀態'] === '已兌獎' ? 'var(--success)' : 'var(--primary)' }}>
              {prizeData['兌獎狀態']}
            </span>
          </p>

          <div className="glass" style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', marginBottom: '25px', textAlign: 'left' }}>
            <p style={{ fontSize: '0.9rem' }}>備註：{prizeData['備註'] || '無'}</p>
          </div>

          {prizeData['兌獎狀態'] === '未兌獎' ? (
            <button className="neo-button" onClick={handleRedeemClick} style={{ width: '100%' }}>
              確認兌獎
            </button>
          ) : (
            <div>
              <div style={{ padding: '15px', color: 'var(--success)', border: '1px dashed var(--success)', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> 此獎項已完成兌獎
              </div>
              
              {/* 修改中獎人資訊按鈕 (僅在有備註需身分證時顯示或全部顯示) */}
              <button 
                onClick={() => setShowModal(true)}
                style={{ background: 'transparent', color: 'var(--text-dim)', border: '1px solid var(--glass-border)', padding: '10px', borderRadius: '8px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Edit3 size={16} /> 修改中獎人資訊
              </button>
            </div>
          )}

          <WinnerModal 
            isOpen={showModal} 
            onClose={() => setShowModal(false)} 
            onSubmit={submitRedemption}
            initialData={{
              name: prizeData['姓名'] || '',
              idCard: prizeData['身分證ID'] || '',
              phone: prizeData['電話'] || '',
              address: prizeData['地址'] || ''
            }}
          />
        </div>
      )}
    </div>
  );
};

export default RedeemPage;
