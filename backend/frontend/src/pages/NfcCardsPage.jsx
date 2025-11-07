import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { toast } from '../lib/toast.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LostModeSwitch from '../components/LostModeSwitch.jsx';

export default function NfcCardsPage(){
  const [cards,setCards] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  // Memory selection will be handled elsewhere per request
  const [error,setError] = useState('');
  const [creating,setCreating] = useState(false); // deprecated: auto-provisioned on paid
  const [linking,setLinking] = useState(false);
  const [savingProfileId, setSavingProfileId] = useState(null);
  const [loadingMem, setLoadingMem] = useState({}); // {cardId: boolean}
  const [uploadingAvatar, setUploadingAvatar] = useState({}); // {cardId: boolean}
  const [lastSaved, setLastSaved] = useState({}); // {cardId: timestamp}
  const [highlightedCards, setHighlightedCards] = useState({});
  const [savingLost, setSavingLost] = useState({}); // {cardId:boolean}

  function inputClass(cardId){
    return highlightedCards[cardId] ? 'ring-2 ring-emerald-300 animate-pulse' : '';
  }

  useEffect(()=>{
    let mounted = true;
    async function load(){
      try{
        const r = await api.get('/nfc');
        const list = r.data || [];
        // Try to fetch the user's saved profile and use it to prefill card profiles
        try{
          const pr = await api.get('/auth/me/profile');
          const user = pr.data || {};
          const fetchedProfile = user.profile || {
            avatar: '', cover: '', name: user.name || '', title: '', company: '', phone: '', email: user.email || '', website: '', address: '', socials: []
          };
          // store for later use by prefill button
          setUserProfile(fetchedProfile);
          const merged = list.map(card => {
            const cp = card.profile || {};
            return {
              ...card,
              profile: {
                avatar: cp.avatar || fetchedProfile.avatar || '',
                cover: cp.cover || fetchedProfile.cover || '',
                name: cp.name || fetchedProfile.name || '',
                title: cp.title || fetchedProfile.title || '',
                company: cp.company || fetchedProfile.company || '',
                phone: cp.phone || fetchedProfile.phone || '',
                email: cp.email || fetchedProfile.email || '',
                website: cp.website || fetchedProfile.website || '',
                address: cp.address || fetchedProfile.address || '',
                socials: (cp.socials && cp.socials.length) ? cp.socials : (fetchedProfile.socials || [])
              }
            };
          });
          if(mounted) setCards(merged);
        }catch(e){
          if(mounted) setCards(list);
        }
      }catch(e){
        // ignore
      }
    }
    load();
    return ()=>{ mounted = false; };
  },[]);

  // Card creation is now automatic when order status becomes 'paid'

  // Linking memories is moved out from this page

  function updateLocalCard(id, patch){
    setCards(cs=> cs.map(c=> (c._id===id ? { ...c, ...patch } : c)));
  }
  
  async function prefillFromProfile(cardId){
    try{
      let profile = userProfile;
      if(!profile){
        const pr = await api.get('/auth/me/profile');
        const user = pr.data || {};
        profile = user.profile || { avatar:'', cover:'', name:user.name||'', title:'', company:'', phone:'', email:user.email||'', website:'', address:'', socials:[] };
        setUserProfile(profile);
      }

      // build the updated card and update local state
      let updatedCard = null;
      setCards(cs => cs.map(c => {
        if(c._id !== cardId) return c;
        const cp = c.profile || {};
        const merged = {
          ...c,
          profile: {
            avatar: cp.avatar || profile.avatar || '',
            cover: cp.cover || profile.cover || '',
            name: cp.name || profile.name || '',
            title: cp.title || profile.title || '',
            company: cp.company || profile.company || '',
            phone: cp.phone || profile.phone || '',
            email: cp.email || profile.email || '',
            website: cp.website || profile.website || '',
            address: cp.address || profile.address || '',
            socials: (cp.socials && cp.socials.length) ? cp.socials : (profile.socials || [])
          }
        };
        updatedCard = merged;
        return merged;
      }));

      // highlight updated card fields briefly
      setHighlightedCards(h => ({ ...h, [cardId]: true }));
      setTimeout(()=> setHighlightedCards(h => { const n = { ...(h||{}) }; delete n[cardId]; return n; }), 2200);

      // Ask user for confirmation before auto-saving
      const confirmSave = window.confirm('Áp thông tin từ hồ sơ vào biểu mẫu. Bạn có muốn lưu tự động các thay đổi lên server?');
      if (confirmSave){
        const ok = await saveProfile(updatedCard);
        if (ok) toast.success('Đã áp hồ sơ và lưu vào thẻ');
        else toast.error('Lưu tự động thất bại');
      } else {
        toast.success('Đã cập nhật từ hồ sơ thành công');
      }
    }catch(e){
      toast.error('Không thể lấy hồ sơ người dùng');
    }
  }

  function onProfileFieldChange(cardId, path, value){
    setCards(cs=> cs.map(c=>{
      if(c._id!==cardId) return c;
      const profile = { ...(c.profile||{}) };
      // simple path: 'profile.name' etc. For this form we only use top-level keys under profile
      const key = path.replace('profile.', '');
      profile[key] = value;
      return { ...c, profile };
    }));
  }

  function addSocial(card){
    const socials = [...(card.profile?.socials||[]), { url: '' }];
    updateLocalCard(card._id, { profile: { ...(card.profile||{}), socials } });
  }

  function updateSocial(card, idx, value){
    const socials = [...(card.profile?.socials||[])];
    socials[idx] = { url: value };
    updateLocalCard(card._id, { profile: { ...(card.profile||{}), socials } });
  }

  function removeSocial(card, idx){
    const socials = (card.profile?.socials||[]).filter((_,i)=> i!==idx);
    updateLocalCard(card._id, { profile: { ...(card.profile||{}), socials } });
  }

  async function uploadAvatar(card){
    const id = card._id;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if(!file) return;
      try{
        setUploadingAvatar(s=> ({...s, [id]: true}));
        const fd = new FormData();
        fd.append('files', file);
        const r = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        const url = r.data?.files?.[0]?.url;
        if(!url){ alert('Tải file thất bại'); return; }
        const profile = { ...(card.profile||{}), avatar: url };
        updateLocalCard(id, { profile });
      } catch(e){ alert(e.response?.data?.message || 'Tải file thất bại'); }
      finally{ setUploadingAvatar(s=> ({...s, [id]: false})); }
    };
    input.click();
  }

  function uploadCover(card){
    const id = card._id;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if(!file) return;
      try{
        setUploadingAvatar(s=> ({...s, ['cover_'+id]: true}));
        const fd = new FormData();
        fd.append('files', file);
        const r = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        const url = r.data?.files?.[0]?.url;
        if(!url){ alert('Tải file thất bại'); return; }
        const profile = { ...(card.profile||{}), cover: url };
        updateLocalCard(id, { profile });
      } catch(e){ alert(e.response?.data?.message || 'Tải file thất bại'); }
      finally{ setUploadingAvatar(s=> ({...s, ['cover_'+id]: false})); }
    };
    input.click();
  }

  async function saveProfile(card){
    setSavingProfileId(card._id);
    setError('');
    try{
      const payload = { title: card.title || '', isActive: card.isActive!==false, profile: card.profile||{}, primaryMemoryId: card.primaryMemoryId || '' };
      const r = await api.put(`/nfc/${card._id}`, payload);
      updateLocalCard(card._id, r.data);
      setLastSaved(s=> ({ ...s, [card._id]: Date.now() }));
      return true;
    }catch(e){ setError(e.response?.data?.message || 'Lưu profile thất bại'); return false; }
    finally{ setSavingProfileId(null); }
  }

  return <div className="space-y-6">
    <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">NFC Cards</h1>
      </div>
    <ErrorMessage error={error} />
  {!cards.length && <EmptyState title="Chưa có thẻ" description="Thẻ sẽ được tự động tạo sau khi đơn hàng được đánh dấu 'paid' (đã thanh toán)." />}
    {!!cards.length && <div className="grid gap-6 md:grid-cols-2">
      {cards.map(card=> {
        const isActive = (card.status ? card.status === 'active' : card.isActive !== false);
        return <div key={card._id} className="panel space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-base flex items-center gap-2">Slug: <span className="font-mono text-primary text-sm bg-primary/5 px-2 py-0.5 rounded border border-primary/20">{card.slug}</span></h3>
            <div className="text-[11px] text-muted-foreground">ID: {card._id}</div>
          </div>
          <div className="flex items-center gap-3">
            {!isActive && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[11px] border border-amber-500/20">Chưa kích hoạt</span>}
            {isActive ? (
              <>
                <a href={`/c/${card.slug}`} target="_blank" rel="noreferrer" className="text-xs link">Xem danh thiếp</a>
              </>
            ) : (
              <a href="/nfc/activate" className="text-xs link">Kích hoạt</a>
            )}
          </div>
        </div>

        {/* (Chế độ sẽ hiển thị trong header của phần Lost editor bên dưới) */}

        {/* Profile form */}
        <div className="pt-2 border-t border-border space-y-3">
          <h4 className="text-sm font-medium">Hồ sơ danh thiếp</h4>
          {/* Cover preview */}
          <div className="space-y-2">
            <div className="w-full aspect-[16/6] rounded-lg overflow-hidden bg-muted relative">
                {card.profile?.cover ? <img loading="lazy" src={card.profile.cover} alt="cover" className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">Chưa có cover</div>}
              <div className="absolute bottom-2 right-2 flex gap-2">
                {card.profile?.cover && <button type="button" onClick={()=> { onProfileFieldChange(card._id,'profile.cover',''); }} className="btn btn-outline btn-sm">Xoá</button>}
                <button type="button" onClick={()=>uploadCover(card)} className="btn btn-outline btn-sm" disabled={!!uploadingAvatar['cover_'+card._id]}>{uploadingAvatar['cover_'+card._id]?'Đang tải...':'Tải cover'}</button>
                {/* <button type="button" onClick={()=>prefillFromProfile(card._id)} className="btn btn-outline btn-sm">Lấy thông tin từ hồ sơ</button> */}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted border">
            {card.profile?.avatar ? <img loading="lazy" src={card.profile.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-sm">🪪</div>}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="btn btn-outline btn-sm" onClick={()=>prefillFromProfile(card._id)}>
                Lấy thông tin từ hồ sơ
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={()=>uploadAvatar(card)} disabled={!!uploadingAvatar[card._id]}>
                {uploadingAvatar[card._id] ? 'Đang tải...' : 'Tải ảnh đại diện'}
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="label">Tên</label>
              <input className={`input ${inputClass(card._id)}`} value={card.profile?.name||''} onChange={e=> onProfileFieldChange(card._id, 'profile.name', e.target.value)} placeholder="Nguyễn Văn A" />
            </div>
            <div className="space-y-1">
              <label className="label">Chức danh</label>
              <input className={`input ${inputClass(card._id)}`} value={card.profile?.title||''} onChange={e=> onProfileFieldChange(card._id, 'profile.title', e.target.value)} placeholder="Software Engineer" />
            </div>
            <div className="space-y-1">
              <label className="label">Công ty</label>
              <input className={`input ${inputClass(card._id)}`} value={card.profile?.company||''} onChange={e=> onProfileFieldChange(card._id, 'profile.company', e.target.value)} placeholder="TouchBack" />
            </div>
            <div className="space-y-1">
              <label className="label">Số điện thoại</label>
              <input className={`input ${inputClass(card._id)}`} value={card.profile?.phone||''} onChange={e=> onProfileFieldChange(card._id, 'profile.phone', e.target.value)} placeholder="0909..." />
            </div>
            <div className="space-y-1">
              <label className="label">Email</label>
              <input className={`input ${inputClass(card._id)}`} value={card.profile?.email||''} onChange={e=> onProfileFieldChange(card._id, 'profile.email', e.target.value)} placeholder="a@example.com" />
            </div>
            <div className="space-y-1">
              <label className="label">Website</label>
              <input className={`input ${inputClass(card._id)}`} value={card.profile?.website||''} onChange={e=> onProfileFieldChange(card._id, 'profile.website', e.target.value)} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="label">Địa chỉ</label>
              <input className={`input ${inputClass(card._id)}`} value={card.profile?.address||''} onChange={e=> onProfileFieldChange(card._id, 'profile.address', e.target.value)} placeholder="Địa chỉ" />
            </div>
            {/* URL inputs for avatar/cover removed; upload dùng nút ở trên */}
          </div>

          {/* Intro / About field */}
          <div className="space-y-1">
            <label className="label">Giới thiệu</label>
            <textarea
              className={`input min-h-[96px] ${inputClass(card._id)}`}
              value={card.profile?.intro || ''}
              onChange={e=> onProfileFieldChange(card._id, 'profile.intro', e.target.value)}
              placeholder="Đoạn giới thiệu ngắn về bạn hoặc doanh nghiệp..."
            />
            <div className="text-[11px] text-muted-foreground">Hiển thị ở mục “Giới thiệu” trên trang danh thiếp công khai.</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label">Mạng xã hội / Liên kết</label>
              <button type="button" onClick={()=>addSocial(card)} className="btn btn-outline btn-sm">Thêm link</button>
            </div>
            {(card.profile?.socials||[]).map((s,idx)=> (
              <div key={idx} className="flex gap-2">
                <input value={s.url||''} onChange={e=> updateSocial(card, idx, e.target.value)} className={`input flex-1 ${inputClass(card._id)}`} placeholder="https://www.facebook.com/yourname" />
                <button type="button" onClick={()=>removeSocial(card, idx)} className="btn btn-outline">Xoá</button>
              </div>
            ))}
          </div>

          <div className="pt-1 flex flex-col md:flex-row items-center gap-4">
            {/* <button type="button" onClick={()=>prefillFromProfile(card._id)} className="btn btn-outline md:min-w-[140px] w-full md:w-auto">Áp từ hồ sơ</button> */}
            <button onClick={()=>saveProfile(card)} disabled={savingProfileId===card._id} className="btn btn-primary md:min-w-[120px] w-full md:w-auto">{savingProfileId===card._id? 'Đang lưu...' : 'Lưu hồ sơ'}</button>
            {lastSaved[card._id] && (
              <span className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-fadeInUp">
                <span>Đã lưu</span>
              </span>
            )}
          </div>

          {/* Lost mode editor */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Trường hợp bị mất</h4>
              <LostModeSwitch isLost={!!card.lost?.isLost} disabled={!!savingLost[card._id]} onToggle={async (next)=>{
                try{ setSavingLost(s=>({...s,[card._id]:true})); const r = await api.patch(`/nfc/${card._id}/lost`, { isLost: !!next }); updateLocalCard(card._id, { lost: r.data.lost }); toast.success(next?'Đã bật Lost mode':'Đã chuyển Active'); }
                catch(e){ toast.error(e.response?.data?.message||'Lỗi cập nhật'); }
                finally{ setSavingLost(s=>({...s,[card._id]:false})); }
              }} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="label">Tiêu đề</label>
                <input className="input" value={card.lost?.title||''} onChange={e=> updateLocalCard(card._id, { lost: { ...(card.lost||{}), title: e.target.value } })} placeholder="Tôi bị mất thẻ..." />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="label">Lời nhắn</label>
                <textarea className="input min-h-[100px]" value={card.lost?.message||''} onChange={e=> updateLocalCard(card._id, { lost: { ...(card.lost||{}), message: e.target.value } })} placeholder="Nếu bạn nhặt được, xin liên hệ..." />
              </div>
              <div className="space-y-1">
                <label className="label">Tên liên hệ</label>
                <input className="input" value={card.lost?.contact?.name||''} onChange={e=> updateLocalCard(card._id, { lost: { ...(card.lost||{}), contact: { ...(card.lost?.contact||{}), name: e.target.value } } })} />
              </div>
              <div className="space-y-1">
                <label className="label">Số điện thoại</label>
                <input className="input" value={card.lost?.contact?.phone||''} onChange={e=> updateLocalCard(card._id, { lost: { ...(card.lost||{}), contact: { ...(card.lost?.contact||{}), phone: e.target.value } } })} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="label">Email</label>
                <input className="input" value={card.lost?.contact?.email||''} onChange={e=> updateLocalCard(card._id, { lost: { ...(card.lost||{}), contact: { ...(card.lost?.contact||{}), email: e.target.value } } })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="btn btn-outline" disabled={savingProfileId===card._id} onClick={async ()=>{
                try{
                  setSavingProfileId(card._id);
                  const payload = { isLost: !!(card.lost?.isLost), title: card.lost?.title||'', message: card.lost?.message||'', contact: { name: card.lost?.contact?.name||'', phone: card.lost?.contact?.phone||'', email: card.lost?.contact?.email||'' } };
                  const r = await api.patch(`/nfc/${card._id}/lost`, payload);
                  updateLocalCard(card._id, { lost: r.data.lost });
                  toast.success('Đã lưu Lost mode');
                  const el = document.querySelector(`[data-saved-badge="${card._id}"]`);
                  if(el){
                    el.textContent = 'Đã lưu';
                    el.style.opacity = '1';
                    setTimeout(()=>{ if(el){ el.style.opacity = '0'; el.textContent=''; } }, 1800);
                  }
                }catch(e){ toast.error(e.response?.data?.message||'Lưu thất bại'); }
                finally{ setSavingProfileId(null); }
              }}>Lưu Lost mode</button>
              <span className="text-[11px] px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 opacity-0 transition" data-saved-badge={card._id}></span>
            </div>
          </div>
        </div>
      </div>})}
    </div>}
  </div>;
}
