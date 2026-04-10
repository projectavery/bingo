import { useState, useMemo } from 'react';
import { gasApi } from '../api/gas';
import { PRIZE_LIST, STAGES } from '../config';
import Scanner from '../components/Scanner';
import { Upload, QrCode, ClipboardList, CheckCircle2, AlertCircle, X } from 'lucide-react';

const LotteryPage = () => {
  const [stage, setStage] = useState('');
  const [rank, setRank] = useState('');
  const [ticketNos, setTicketNos] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedTemp, setScannedTemp] = useState('');

  // 自動對應獎品內容與備註
  const prizeInfo = useMemo(() => {
    return PRIZE_LIST.find(p => p.rank === rank) || { content: '', remark: '' };
  }, [rank]);

  const handleImport = async () => {
    // 欄位檢查與警告
    if (!stage) {
      setStatus({ type: 'error', message: '尚未選擇「抽獎階段」' });
      return;
    }
    if (!rank) {
      setStatus({ type: 'error', message: '尚未選擇「獎次」' });
      return;
    }
    if (!ticketNos.trim()) {
      setStatus({ type: 'error', message: '尚未輸入「摸彩卷號碼」' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const numbers = ticketNos.split(/[\n,]/).map(n => n.trim()).filter(n => n);
      const dataToImport = numbers.map(num => ({
        ticketNo: num,
        stage: stage,
        prizeRank: rank,
        prizeContent: prizeInfo.content,
        remark: prizeInfo.remark
      }));

      await gasApi.import(dataToImport);
      setStatus({ type: 'success', message: `成功匯入 ${dataToImport.length} 筆獎項！` });
      
      // 匯入後清除所有欄位
      setTicketNos('');
      setStage('');
      setRank('');
    } catch (error) {
      setStatus({ type: 'error', message: `匯入失敗：${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const onScanSuccess = (decodedText) => {
    setScannedTemp(decodedText);
  };

  const confirmScan = () => {
    if (scannedTemp) {
      setTicketNos(prev => prev ? `${prev}\n${scannedTemp}` : scannedTemp);
      setScannedTemp('');
      setShowScanner(false);
    }
  };

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 className="tech-title">抽獎管理系統</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '-10px' }}>獎項批量匯入與編號管理</p>
      </header>

      <div className="glass" style={{ padding: '25px' }}>
        <h2 style={{ marginBottom: '20px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ClipboardList size={24} /> 批量獎項匯入
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>抽獎階段</label>
            <select 
              value={stage} 
              onChange={(e) => setStage(e.target.value)}
              style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
            >
              <option value="">請選擇...</option>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>獎次</label>
            <select 
              value={rank} 
              onChange={(e) => setRank(e.target.value)}
              style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
            >
              <option value="">請選擇...</option>
              {PRIZE_LIST.map(p => <option key={p.rank} value={p.rank}>{p.rank}</option>)}
            </select>
          </div>
        </div>

        <div className="glass" style={{ padding: '15px', marginBottom: '20px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>獎品：</span>{prizeInfo.content}
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>備註：</span>{prizeInfo.remark || '無'}
          </div>
        </div>

        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>摸彩卷號碼 (每行一個)</label>
          <button 
            className="neo-button" 
            onClick={() => setShowScanner(true)}
            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(135deg, var(--accent), var(--secondary))' }}
          >
            <QrCode size={14} /> 掃描輸入
          </button>
        </div>

        <textarea
          value={ticketNos}
          onChange={(e) => setTicketNos(e.target.value)}
          placeholder="請輸入或貼上摸彩卷號碼..."
          rows="10"
          style={{ marginBottom: '20px', fontFamily: 'monospace' }}
        />

        <button 
          className="neo-button" 
          onClick={handleImport} 
          disabled={loading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <Upload size={20} /> {loading ? '上傳中...' : '確認上傳至試算表'}
        </button>

        {status && (
          <div style={{ 
            marginTop: '20px', padding: '15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px',
            backgroundColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: status.type === 'success' ? 'var(--success)' : 'var(--error)',
            border: `1px solid ${status.type === 'success' ? 'var(--success)' : 'var(--error)'}`
          }}>
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {status.message}
          </div>
        )}
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass animate-fade" style={{ width: '100%', maxWidth: '500px', padding: '20px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ color: 'var(--primary)' }}>掃描摸彩卷</h3>
              <button onClick={() => setShowScanner(false)} style={{ background: 'none', color: 'white' }}><X /></button>
            </div>
            
            <Scanner onScanSuccess={onScanSuccess} />
            
            <div style={{ marginTop: '15px' }}>
              <p style={{ marginBottom: '10px', color: scannedTemp ? 'var(--primary)' : 'var(--text-dim)' }}>
                {scannedTemp ? `掃描結果: ${scannedTemp}` : '請將準心對準 QR Code'}
              </p>
              <button 
                className="neo-button" 
                onClick={confirmScan} 
                disabled={!scannedTemp}
                style={{ width: '100%' }}
              >
                確定輸入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LotteryPage;
