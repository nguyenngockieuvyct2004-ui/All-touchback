import React, { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function NfcWizardPage(){
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orderId = sp.get('orderId') || null;

  const [step, setStep] = useState(1);
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
    // TODO: POST /nfc (create) or PATCH existing unactivated cards created after payment
    // payload: { orderId, profile, designId, featuredMemoryIds: featured }
    navigate('/nfc');
  };

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
