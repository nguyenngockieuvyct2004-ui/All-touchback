import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';
import { toast } from '../lib/toast.js';

export default function NfcWizardPage(){
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orderId = sp.get('orderId') || null;
  const initialCardId = sp.get('cardId') || null;

  const [step, setStep] = useState(1);
  const [cardId, setCardId] = useState(initialCardId);
  const [cardInfo, setCardInfo] = useState(null);
  const [profile, setProfile] = useState({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: '',
    title: '',
    company: '',
    website: '',
  });
  const [designId, setDesignId] = useState(null);
  const [featured, setFeatured] = useState([]); // memoryIds

  const canNext = useMemo(() => {
    if (step === 1) return profile.fullName?.trim();
    if (step === 2) return !!designId;
    if (step === 3) return true;
    return false;
  }, [step, profile, designId]);

  const onSubmit = async () => {
    try{
      // Yêu cầu có cardId (thẻ đã được tạo tự động khi thanh toán thành công)
      let targetId = cardId;
      if (!targetId){
        const r = await api.get('/nfc');
        const list = r.data || [];
        if (!list.length) throw new Error('Chưa có thẻ nào. Vui lòng hoàn tất thanh toán để hệ thống tạo thẻ tự động.');
        // chọn thẻ chưa cấu hình tên nếu có, nếu không lấy thẻ mới nhất
        const candidate = list.find(c => !c.profile || !c.profile.name) || list[0];
        targetId = candidate._id;
      }

      // 1) Cập nhật profile cho thẻ đã có
      await api.put(`/nfc/${targetId}`, {
        title: designId ? `Design #${designId}` : undefined,
        profile: {
          name: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          title: profile.title,
          company: profile.company,
          website: profile.website,
        }
      });

      // 2) Gắn memories nổi bật (nếu có)
      if (featured?.length){
        await api.post(`/nfc/${targetId}/link`, { memoryIds: featured });
      }

      toast.success('Đã cập nhật thẻ NFC');
      navigate('/nfc');
    }catch(e){
      toast.error(e.response?.data?.message || 'Không tạo được thẻ');
    }
  };

  // Prefill from saved profile
  useEffect(()=>{
    let cancelled = false;
    api.get('/auth/me/profile').then(r=>{
      if (cancelled) return;
      const p = r.data?.profile || {};
      setProfile(prev => ({
        fullName: p.name || prev.fullName || user?.fullName || user?.name || '',
        email: p.email || prev.email || user?.email || '',
        phone: p.phone || prev.phone || '',
        title: p.title || prev.title || '',
        company: p.company || prev.company || '',
        website: p.website || prev.website || '',
      }));
    }).catch(()=>{});
    return () => { cancelled = true; };
  }, [user?.email, user?.fullName, user?.name]);

  // Lấy card mặc định để cấu hình nếu URL không truyền cardId
  useEffect(()=>{
    let cancelled = false;
    api.get('/nfc').then(r=>{
      if (cancelled) return;
      const list = r.data || [];
      if (initialCardId){
        const found = list.find(x=> x._id===initialCardId);
        if (found){ setCardId(found._id); setCardInfo(found); return; }
      }
      const candidate = list.find(c => !c.profile || !c.profile.name) || list[0];
      if (candidate){ setCardId(candidate._id); setCardInfo(candidate); }
    }).catch(()=>{});
    return ()=>{ cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Cấu hình thẻ NFC</h1>
      <ol className="steps mb-6">
        <li className={step>=1?'step step-primary':'step'}>Hồ sơ</li>
        <li className={step>=2?'step step-primary':'step'}>Thiết kế</li>
        <li className={step>=3?'step step-primary':'step'}>Memories</li>
      </ol>

      {step===1 && (
        <section className="space-y-3">
          {cardInfo && (
            <p className="text-xs text-gray-500">Đang cấu hình thẻ: <span className="font-mono">{cardInfo.slug}</span></p>
          )}
          <p className="text-xs text-gray-500">Đã tự động lấy dữ liệu từ hồ sơ của bạn (nếu có). Bạn có thể chỉnh sửa trước khi tiếp tục.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="input" placeholder="Họ tên" value={profile.fullName} onChange={e=>setProfile(p=>({...p, fullName:e.target.value}))}/>
            <input className="input" placeholder="Email" value={profile.email} onChange={e=>setProfile(p=>({...p, email:e.target.value}))}/>
            <input className="input" placeholder="Số điện thoại" value={profile.phone} onChange={e=>setProfile(p=>({...p, phone:e.target.value}))}/>
            <input className="input" placeholder="Chức danh" value={profile.title} onChange={e=>setProfile(p=>({...p, title:e.target.value}))}/>
            <input className="input" placeholder="Công ty" value={profile.company} onChange={e=>setProfile(p=>({...p, company:e.target.value}))}/>
            <input className="input" placeholder="Website" value={profile.website} onChange={e=>setProfile(p=>({...p, website:e.target.value}))}/>
          </div>
        </section>
      )}

      {step===2 && (
        <section className="space-y-3">
          <p className="text-sm text-gray-500">Chọn thiết kế (design) tương ứng với sản phẩm đã mua.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1,2,3].map(id => (
              <button key={id}
                className={`card p-6 border ${designId===id?'border-brand-600 ring-2 ring-brand-600':''}`}
                onClick={()=>setDesignId(id)}
              >
                <div className="h-24 bg-gray-200 rounded mb-2" />
                <div className="text-sm">Design #{id}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {step===3 && (
        <section className="space-y-3">
          <p className="text-sm text-gray-500">Chọn memories sẽ hiển thị trên trang công khai thẻ.</p>
          <div className="flex flex-wrap gap-2">
            {['mem1','mem2','mem3'].map(mid=>(
              <button key={mid}
                className={`px-3 py-1 rounded-full border ${featured.includes(mid)?'bg-brand-600 text-white border-brand-600':'bg-white'}`}
                onClick={()=>setFeatured(f=>f.includes(mid)?f.filter(x=>x!==mid):[...f, mid])}
              >{mid}</button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button className="btn btn-ghost" disabled={step===1} onClick={()=>setStep(s=>s-1)}>Quay lại</button>
        {step<3
          ? <button className="btn" disabled={!canNext} onClick={()=>setStep(s=>s+1)}>Tiếp tục</button>
          : <button className="btn btn-primary" onClick={onSubmit}>Hoàn tất</button>}
      </div>
    </div>
  );
}
