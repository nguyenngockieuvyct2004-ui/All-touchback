import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { toast } from '../lib/toast.js';

export default function ProfilePage(){
  const [profile,setProfile] = useState({
    avatar:'', cover:'', name:'', title:'', company:'', phone:'', email:'', website:'', address:'', socials:[]
  });
  const [saving,setSaving] = useState(false);
  const [msg,setMsg] = useState('');
  const [errors,setErrors] = useState({});

  function validate(p){
    const e = {};
    if (p.name && p.name.length > 80) e.name = 'Tên quá dài (≤ 80 ký tự)';
    if (p.title && p.title.length > 80) e.title = 'Chức danh quá dài';
    if (p.company && p.company.length > 120) e.company = 'Tên công ty quá dài';
    if (p.phone && p.phone.length > 30) e.phone = 'Số điện thoại quá dài';
    if (p.email && !/^\S+@\S+\.\S+$/.test(p.email)) e.email = 'Email không hợp lệ';
    if (p.website && !/^https?:\/\//i.test(p.website)) e.website = 'Website phải bắt đầu bằng http(s)://';
    (p.socials||[]).forEach((s,idx)=>{
      if (s.url && !/^https?:\/\//i.test(s.url)) e[`social_${idx}`] = 'Link phải bắt đầu bằng http(s)://';
    });
    return e;
  }

  useEffect(()=>{
    api.get('/auth/me/profile').then(r=>{
      setProfile({
        avatar: r.data?.profile?.avatar || '',
        cover: r.data?.profile?.cover || '',
        name: r.data?.profile?.name || '',
        title: r.data?.profile?.title || '',
        company: r.data?.profile?.company || '',
        phone: r.data?.profile?.phone || '',
        email: r.data?.profile?.email || r.data?.email || '',
        website: r.data?.profile?.website || '',
        address: r.data?.profile?.address || '',
        socials: r.data?.profile?.socials || []
      });
    }).catch(()=>{});
  },[]);

  function setSocial(i, key, val){
    setProfile(p=>{ const s=[...(p.socials||[])]; s[i] = { ...(s[i]||{}), [key]: val }; return { ...p, socials:s }; });
  }

  async function onSave(){
    setSaving(true); setMsg('');
    try {
      const v = validate(profile);
      setErrors(v);
      if (Object.keys(v).length){
        toast.warn('Vui lòng kiểm tra lại các trường nhập.');
        return;
      }
      await api.put('/auth/me/profile', { profile });
      setMsg('Đã lưu hồ sơ.');
      toast.success('Đã lưu hồ sơ');
    } catch(e){ setMsg(e.response?.data?.message || 'Lưu thất bại'); }
    finally{ setSaving(false); }
  }

  async function handleUpload(kind, file){
    if (!file) return;
    const form = new FormData();
    form.append('files', file);
    try{
      const res = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data?.files?.[0]?.url || '';
      if (!url){ toast.error('Tải lên thất bại'); return; }
      setProfile(p=> ({ ...p, [kind]: url }));
      toast.success('Tải ảnh lên thành công');
    }catch(e){ toast.error(e.response?.data?.message || 'Tải lên thất bại'); }
  }

  return (
    <div className="page">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold" style={{fontFamily:'var(--font-display, ui-serif)'}}>Hồ sơ danh thiếp</h1>
        <div className="panel space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label">ẢNH COVER</label>
              <label className="btn cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={e=>handleUpload('cover', e.target.files?.[0])} />
                Tải cover
              </label>
            </div>
            <div className="h-44 rounded-md bg-[#f3ecdf] border border-black/10 flex items-center justify-center text-xs text-gray-500">
              {profile.cover? <img src={profile.cover} alt="cover" className="h-full w-full object-cover rounded"/> : 'Chưa có cover'}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="label">ẢNH ĐẠI DIỆN</label>
                <label className="btn cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={e=>handleUpload('avatar', e.target.files?.[0])} />
                  Tải ảnh đại diện
                </label>
              </div>
              <div className="h-14 w-14 rounded-full bg-[#f3ecdf] border border-black/10 overflow-hidden flex items-center justify-center text-xs text-gray-500">
                {profile.avatar? <img src={profile.avatar} alt="avatar" className="h-full w-full object-cover"/> : '—'}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2"><label className="label">TÊN</label><input className="input" value={profile.name} onChange={e=>setProfile({...profile, name:e.target.value})} placeholder="Nguyễn Văn A"/>{errors.name && <p className="text-xs text-red-600">{errors.name}</p>}</div>
            <div className="space-y-2"><label className="label">CHỨC DANH</label><input className="input" value={profile.title} onChange={e=>setProfile({...profile, title:e.target.value})} placeholder="Software Engineer"/></div>
            <div className="space-y-2"><label className="label">CÔNG TY</label><input className="input" value={profile.company} onChange={e=>setProfile({...profile, company:e.target.value})} placeholder="TouchBack"/></div>
            <div className="space-y-2"><label className="label">SỐ ĐIỆN THOẠI</label><input className="input" value={profile.phone} onChange={e=>setProfile({...profile, phone:e.target.value})} placeholder="090..."/></div>
            <div className="space-y-2"><label className="label">EMAIL</label><input className="input" value={profile.email} onChange={e=>setProfile({...profile, email:e.target.value})} placeholder="a@example.com"/>{errors.email && <p className="text-xs text-red-600">{errors.email}</p>}</div>
            <div className="space-y-2"><label className="label">WEBSITE</label><input className="input" value={profile.website} onChange={e=>setProfile({...profile, website:e.target.value})} placeholder="https://..."/>{errors.website && <p className="text-xs text-red-600">{errors.website}</p>}</div>
          </div>

          <div className="space-y-2">
            <label className="label">ĐỊA CHỈ</label>
            <input className="input" value={profile.address} onChange={e=>setProfile({...profile, address:e.target.value})} placeholder="Địa chỉ"/>
          </div>

          <div className="space-y-2">
            <label className="label">MẠNG XÃ HỘI / LIÊN KẾT</label>
            {(profile.socials||[]).map((s,i)=> (
              <div key={i} className="grid grid-cols-12 gap-2">
                <input className="input col-span-4" placeholder="Nhãn (Facebook)" value={s.label||''} onChange={e=>setSocial(i,'label',e.target.value)} />
                <input className="input col-span-7" placeholder="https://..." value={s.url||''} onChange={e=>setSocial(i,'url',e.target.value)} />
                {errors[`social_${i}`] && <p className="col-span-12 text-xs text-red-600">{errors[`social_${i}`]}</p>}
                <button className="btn col-span-1" onClick={()=> setProfile(p=>({...p, socials:p.socials.filter((_,idx)=>idx!==i)}))}>-</button>
              </div>
            ))}
            <button className="btn" onClick={()=> setProfile(p=>({...p, socials:[...(p.socials||[]), {label:'',url:''}]}))}>Thêm link</button>
          </div>

          <div className="pt-2">
            <button className="btn" onClick={onSave} disabled={saving}>{saving? 'Đang lưu…':'Lưu hồ sơ'}</button>
            {msg && <span className="ml-3 text-sm text-gray-600">{msg}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
