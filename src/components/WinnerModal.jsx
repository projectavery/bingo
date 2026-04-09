import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TAIWAN_DISTRICTS } from '../config';

const WinnerModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  // 解析初始地址 (假設格式：縣市+地區+詳細地址)
  const parseInitialAddress = (fullAddr) => {
    if (!fullAddr) return { county: '', district: '', detail: '' };
    
    const counties = Object.keys(TAIWAN_DISTRICTS);
    let foundCounty = '';
    let foundDistrict = '';
    let detail = fullAddr;

    for (const c of counties) {
      if (fullAddr.startsWith(c)) {
        foundCounty = c;
        const districts = TAIWAN_DISTRICTS[c];
        const remaining = fullAddr.substring(c.length);
        for (const d of districts) {
          if (remaining.startsWith(d)) {
            foundDistrict = d;
            detail = remaining.substring(d.length);
            break;
          }
        }
        break;
      }
    }
    return { county: foundCounty, district: foundDistrict, detail: detail };
  };

  const initialParsed = parseInitialAddress(initialData?.address);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    idCard: initialData?.idCard || '',
    phone: initialData?.phone || '',
    county: initialParsed.county,
    district: initialParsed.district,
    detail: initialParsed.detail
  });

  // 當選擇縣市改變時，清空區域
  useEffect(() => {
    if (initialData) {
      const parsed = parseInitialAddress(initialData.address);
      setFormData({
        name: initialData.name || '',
        idCard: initialData.idCard || '',
        phone: initialData.phone || '',
        county: parsed.county,
        district: parsed.district,
        detail: parsed.detail
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'county') {
      setFormData({ ...formData, county: value, district: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullAddress = `${formData.county}${formData.district}${formData.detail}`;
    onSubmit({
      name: formData.name,
      idCard: formData.idCard,
      phone: formData.phone,
      address: fullAddress
    });
  };

  const counties = Object.keys(TAIWAN_DISTRICTS);
  const districts = formData.county ? TAIWAN_DISTRICTS[formData.county] : [];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', zIndex: 3000,
      padding: '20px'
    }}>
      <div className="glass animate-fade" style={{ 
        width: '100%', maxWidth: '540px', padding: '30px', position: 'relative',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <button onClick={onClose} style={{ 
          position: 'absolute', top: 15, right: 15, background: 'none', color: 'white' 
        }}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>填寫中獎人資訊</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>姓名</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>身分證字號</label>
            <input name="idCard" value={formData.idCard} onChange={handleChange} required />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>電話</label>
            <input name="phone" value={formData.phone} onChange={handleChange} required />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>地址</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <select name="county" value={formData.county} onChange={handleChange} required>
                <option value="">選擇縣市</option>
                {counties.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select name="district" value={formData.district} onChange={handleChange} required disabled={!formData.county}>
                <option value="">選擇地區</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <input 
              name="detail" 
              placeholder="詳細地址 (如：一段123號5樓)" 
              value={formData.detail} 
              onChange={handleChange} 
              required 
              disabled={!formData.district}
            />
          </div>
          
          <button type="submit" className="neo-button" style={{ width: '100%', marginTop: '10px' }}>
            提交資訊
          </button>
        </form>
      </div>
    </div>
  );
};

export default WinnerModal;
