import React, { useState } from 'react';
import api from '../lib/api.js';

export default function ChatPage(){
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function send(e){
    e?.preventDefault?.();
    const content = input.trim();
    if(!content) return;
    const next = [...messages, { role:'user', content }];
    setMessages(next); setInput(''); setLoading(true); setError('');
    try {
      const r = await api.post('/chat', { messages: next });
      setMessages([...next, { role:'assistant', content: r.data.reply || '(trống)' }]);
    } catch(e){
      setError(e.response?.data?.message || 'Gọi chatbot thất bại');
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Chatbot</h1>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="panel space-y-4">
        <div className="space-y-3 max-h-[55vh] overflow-auto pr-1">
          {messages.length===0 && <div className="text-sm text-muted-foreground">Bắt đầu trò chuyện…</div>}
          {messages.map((m,i)=> (
            <div key={i} className={m.role==='user'? 'text-right' : ''}>
              <div className={
                'inline-block rounded-lg px-3 py-2 text-sm ' +
                (m.role==='user' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800')
              }>
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="flex items-center gap-2">
          <input className="input flex-1" value={input} onChange={e=>setInput(e.target.value)} placeholder="Nhập tin nhắn…" />
          <button className="btn" disabled={loading}>{loading?'Đang gửi…':'Gửi'}</button>
        </form>
      </div>
    </div>
  );
}
