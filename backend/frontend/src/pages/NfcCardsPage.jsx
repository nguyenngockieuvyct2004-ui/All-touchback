import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function NfcCardsPage(){
  const [cards,setCards] = useState([]);
  const [memories,setMemories] = useState([]);
  const [selected,setSelected] = useState([]);
  const [error,setError] = useState('');
  const [creating,setCreating] = useState(false);
  const [linking,setLinking] = useState(false);
  const [savingProfileId, setSavingProfileId] = useState(null);
  const [loadingMem, setLoadingMem] = useState({}); // {cardId: boolean}
  const [uploadingAvatar, setUploadingAvatar] = useState({}); // {cardId: boolean}
  const [lastSaved, setLastSaved] = useState({}); // {cardId: timestamp}

  useEffect(()=>{
    api.get('/memories').then(r=> setMemories(r.data)).catch(()=>{});
    api.get('/nfc').then(async r=>{
      const list = r.data||[]; setCards(list);
      // fetch card-linked memories for primary selection
      for (const c of list){
        setLoadingMem(s=> ({...s, [c._id]: true}));
        try{
          const resp = await api.get(`/nfc/${c._id}/memories`);
          setMemories(prev => prev); // keep global
          setCards(cs=> cs.map(x=> x._id===c._id? { ...x, __cardMems: resp.data } : x));
        } finally { setLoadingMem(s=> ({...s, [c._id]: false})); }
      }
    }).catch(()=>{});
  },[]);

  async function createCard(){
    setCreating(true); setError('');
    try {
      const r = await api.post('/nfc');
      setCards(c=>[r.data, ...c]);
    } catch(e){
      setError(e.response?.data?.message || 'Tạo thẻ thất bại');
    } finally { setCreating(false); }
  }

  async function link(card){
    if(!selected.length) return;
    setLinking(true); setError('');
    try {
      await api.post(`/nfc/${card._id}/link`, { memoryIds: selected });
      // naive update
      setCards(cs=> cs.map(c=> c._id===card._id ? { ...c, linkedMemoryIds: selected } : c));
      setSelected([]);
    } catch(e){ setError(e.response?.data?.message || 'Gắn thất bại'); }
    finally { setLinking(false); }
  }

  function updateLocalCard(id, patch){
    setCards(cs=> cs.map(c=> (c._id===id ? { ...c, ...patch } : c)));
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
    const socials = [...(card.profile?.socials||[]), { label: '', url: '' }];
    updateLocalCard(card._id, { profile: { ...(card.profile||{}), socials } });
  }

  function updateSocial(card, idx, field, value){
    const socials = [...(card.profile?.socials||[])];
    socials[idx] = { ...(socials[idx]||{}), [field]: value };
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
    }catch(e){ setError(e.response?.data?.message || 'Lưu profile thất bại'); }
    finally{ setSavingProfileId(null); }
  }

  return <div className="space-y-6">
    <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">NFC Cards</h1>
        <button onClick={createCard} disabled={creating} className="btn btn-primary md:min-w-[120px] w-full md:w-auto">{creating?'Đang tạo...':'Tạo thẻ'}</button>
      </div>
    <ErrorMessage error={error} />
    {!cards.length && <EmptyState title="Chưa có thẻ" description="Tạo thẻ mới để gắn với các memories." action={<button onClick={createCard} disabled={creating} className="btn btn-primary">Tạo thẻ</button>} />}
    {!!cards.length && <div className="grid gap-6 md:grid-cols-2">
      {cards.map(card=> <div key={card._id} className="panel space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-base flex items-center gap-2">Slug: <span className="font-mono text-primary text-sm bg-primary/5 px-2 py-0.5 rounded border border-primary/20">{card.slug}</span></h3>
            <div className="text-[11px] text-muted-foreground">ID: {card._id}</div>
          </div>
          <div className="flex items-center gap-3">
            <a href={`/m/${card.slug}`} target="_blank" rel="noreferrer" className="text-xs link">Xem memory</a>
            <a href={`/c/${card.slug}`} target="_blank" rel="noreferrer" className="text-xs link">Xem danh thiếp</a>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Chọn memories để gắn</p>
            {card.linkedMemoryIds?.length ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[11px] border border-emerald-500/20">{card.linkedMemoryIds.length} đã gắn</span>: null}
          </div>
          <div className="flex flex-wrap gap-2">
            {memories.map(m=> <label key={m._id} className={"relative cursor-pointer select-none text-xs px-2 py-1 rounded-md border transition shadow-sm "+(selected.includes(m._id)?'bg-primary text-white border-primary shadow-primary/40':'bg-muted/40 hover:bg-muted border-border')}>
              <input type="checkbox" className="hidden" checked={selected.includes(m._id)} onChange={()=> setSelected(sel=> sel.includes(m._id)? sel.filter(x=>x!==m._id): [...sel,m._id])} />
              <span>{m.title}</span>
            </label>)}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>link(card)} disabled={linking || !selected.length} className="btn btn-outline btn-sm md:min-w-[110px] w-full md:w-auto">{linking?'Đang gắn...':'Gắn vào thẻ'}</button>
            {!!selected.length && <span className="hidden md:inline-block text-[11px] text-muted-foreground">{selected.length} mục đang chọn</span>}
          </div>
        </div>

        {/* Primary memory selector */}
        <div className="space-y-1">
          <label className="label">Memory chính</label>
          <select className="input" value={card.primaryMemoryId || ''} onChange={(e)=> updateLocalCard(card._id, { primaryMemoryId: e.target.value || null })}>
            <option value="">— Lấy public mới nhất —</option>
            {(card.__cardMems||[]).map(m=> <option key={m.id} value={m.id}>{m.title || '(Không tiêu đề)'} {m.isPublic? '' : '· (private)'}</option>)}
          </select>
          {loadingMem[card._id] && <div className="text-[11px] text-muted-foreground">Đang tải danh sách...</div>}
        </div>

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
              </div>
            </div>
            <div className="space-y-1">
              <label className="label">Ảnh cover (URL)</label>
              <input className="input" value={card.profile?.cover||''} onChange={e=> onProfileFieldChange(card._id, 'profile.cover', e.target.value)} placeholder="https://...jpg" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted border">
            {card.profile?.avatar ? <img loading="lazy" src={card.profile.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-sm">🪪</div>}
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={()=>uploadAvatar(card)} disabled={!!uploadingAvatar[card._id]}>
              {uploadingAvatar[card._id] ? 'Đang tải...' : 'Tải ảnh đại diện'}
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="label">Tên</label>
              <input className="input" value={card.profile?.name||''} onChange={e=> onProfileFieldChange(card._id, 'profile.name', e.target.value)} placeholder="Nguyễn Văn A" />
            </div>
            <div className="space-y-1">
              <label className="label">Chức danh</label>
              <input className="input" value={card.profile?.title||''} onChange={e=> onProfileFieldChange(card._id, 'profile.title', e.target.value)} placeholder="Software Engineer" />
            </div>
            <div className="space-y-1">
              <label className="label">Công ty</label>
              <input className="input" value={card.profile?.company||''} onChange={e=> onProfileFieldChange(card._id, 'profile.company', e.target.value)} placeholder="TouchBack" />
            </div>
            <div className="space-y-1">
              <label className="label">Số điện thoại</label>
              <input className="input" value={card.profile?.phone||''} onChange={e=> onProfileFieldChange(card._id, 'profile.phone', e.target.value)} placeholder="0909..." />
            </div>
            <div className="space-y-1">
              <label className="label">Email</label>
              <input className="input" value={card.profile?.email||''} onChange={e=> onProfileFieldChange(card._id, 'profile.email', e.target.value)} placeholder="a@example.com" />
            </div>
            <div className="space-y-1">
              <label className="label">Website</label>
              <input className="input" value={card.profile?.website||''} onChange={e=> onProfileFieldChange(card._id, 'profile.website', e.target.value)} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="label">Địa chỉ</label>
              <input className="input" value={card.profile?.address||''} onChange={e=> onProfileFieldChange(card._id, 'profile.address', e.target.value)} placeholder="Địa chỉ" />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="label">Ảnh đại diện (URL)</label>
              <input className="input" value={card.profile?.avatar||''} onChange={e=> onProfileFieldChange(card._id, 'profile.avatar', e.target.value)} placeholder="https://...jpg" />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="label">Ảnh cover (URL)</label>
              <input className="input" value={card.profile?.cover||''} onChange={e=> onProfileFieldChange(card._id, 'profile.cover', e.target.value)} placeholder="https://...jpg" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label">Mạng xã hội / Liên kết</label>
              <button type="button" onClick={()=>addSocial(card)} className="btn btn-outline btn-sm">Thêm link</button>
            </div>
            {(card.profile?.socials||[]).map((s,idx)=> (
              <div key={idx} className="flex gap-2">
                <input value={s.label||''} onChange={e=> updateSocial(card, idx, 'label', e.target.value)} className="input flex-[0.5]" placeholder="Facebook / LinkedIn / ..." />
                <input value={s.url||''} onChange={e=> updateSocial(card, idx, 'url', e.target.value)} className="input flex-1" placeholder="https://..." />
                <button type="button" onClick={()=>removeSocial(card, idx)} className="btn btn-outline">Xoá</button>
              </div>
            ))}
          </div>

          <div className="pt-1 flex flex-col md:flex-row items-center gap-4">
            <button onClick={()=>saveProfile(card)} disabled={savingProfileId===card._id} className="btn btn-primary md:min-w-[120px] w-full md:w-auto">{savingProfileId===card._id? 'Đang lưu...' : 'Lưu hồ sơ'}</button>
            {lastSaved[card._id] && (
              <span className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-fadeInUp">
                <span>Đã lưu</span>
              </span>
            )}
          </div>
        </div>
      </div>)}
    </div>}
  </div>;
}
