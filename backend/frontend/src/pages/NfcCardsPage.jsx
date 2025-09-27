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

  // For demo: there is no GET /nfc list route, so we only manage newly created cards locally.

  useEffect(()=>{
    api.get('/memories').then(r=> setMemories(r.data)).catch(()=>{});
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

  return <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold tracking-tight">NFC Cards</h1>
      <button onClick={createCard} disabled={creating} className="btn btn-primary min-w-[120px]">{creating?'Đang tạo...':'Tạo thẻ'}</button>
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
          <a href={`/m/${card.slug}`} target="_blank" rel="noreferrer" className="text-xs link">Xem công khai</a>
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
            <button onClick={()=>link(card)} disabled={linking || !selected.length} className="btn btn-outline btn-sm min-w-[110px]">{linking?'Đang gắn...':'Gắn vào thẻ'}</button>
            {!!selected.length && <span className="text-[11px] text-muted-foreground">{selected.length} mục đang chọn</span>}
          </div>
        </div>
      </div>)}
    </div>}
  </div>;
}
