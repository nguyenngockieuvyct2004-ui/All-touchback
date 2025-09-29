import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';

export default function ChatWidget(){
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(()=>{
    // auto scroll to bottom on new message
    listRef.current?.scrollTo?.(0, listRef.current.scrollHeight);
  }, [messages, open]);

  // Helper: animate assistant text appearing gradually
  function typeOut(text){
    return new Promise((resolve)=>{
      const full = String(text || '');
      // Append an empty assistant message first
      let assistantIndex = -1;
      setMessages(prev => {
        assistantIndex = prev.length;
        return [...prev, { role:'assistant', content: '' }];
      });
      // Speed settings (faster for long text)
      const baseDelay = full.length > 1200 ? 5 : full.length > 400 ? 10 : 16;
      const step = full.length > 1200 ? 3 : full.length > 400 ? 2 : 1;
      let i = 0;
      // Clear any previous animator
      if(typingTimerRef.current){ clearInterval(typingTimerRef.current); }
      typingTimerRef.current = setInterval(()=>{
        i = Math.min(full.length, i + step);
        const slice = full.slice(0, i);
        setMessages(prev => {
          const copy = [...prev];
          if(copy[assistantIndex]) copy[assistantIndex] = { ...copy[assistantIndex], content: slice };
          return copy;
        });
        if(i >= full.length){
          clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
          resolve();
        }
      }, baseDelay);
    });
  }

  async function send(e){
    e?.preventDefault?.();
    const content = input.trim();
    if(!content) return;
    const next = [...messages, { role:'user', content }];
    setMessages(next); setInput(''); setLoading(true); setError('');
    try {
      const r = await api.post('/chat', { messages: next });
      const reply = r?.data?.reply ?? '(trống)';
      // Start typing animation
      await typeOut(reply);
    } catch(e){
      setError(e.response?.data?.message || 'Gọi chatbot thất bại');
    } finally { setLoading(false); }
  }
  const canChat = !!user;

  return (
    <div className="fixed z-50 right-4 bottom-4">
      {/* Toggle button */}
      {!open && (
        <button onClick={()=>setOpen(true)} className="btn btn-lg rounded-full shadow-glow flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Trợ lý AI TouchBack</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="w-[320px] sm:w-[380px] h-[520px] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-brand-600/10 to-brand-400/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold">AI</div>
              <div>
                <div className="text-sm font-semibold">Trợ lý AI TouchBack</div>
                <div className="text-[11px] text-muted-foreground">Hỏi mọi thứ về TouchBack</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setOpen(false)} className="btn-ghost text-xs">Ẩn</button>
            </div>
          </div>
          {/* Messages */}
          <div ref={listRef} className="p-3 space-y-3 flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-900/40">
            {!messages.length && <div className="text-xs text-muted-foreground">Xin chào! Mình có thể giúp gì cho bạn?</div>}
            {messages.map((m,i)=> (
              <div key={i} className={m.role==='user'? 'text-right' : ''}>
                <div className={
                  'inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ' +
                  (m.role==='user' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800')
                }>
                  {m.content}
                </div>
              </div>
            ))}
            {error && <div className="text-xs text-red-600">{error}</div>}
          </div>
          {/* Composer */}
          <form onSubmit={send} className="p-3 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-white dark:bg-gray-900">
            <input className="input flex-1" value={input} onChange={e=>setInput(e.target.value)} placeholder={canChat ? 'Nhập tin nhắn…' : 'Đăng nhập để chat'} disabled={!canChat || loading} />
            <button className="btn btn-sm" disabled={!canChat || loading}>{loading?'Đang gửi…':'Gửi'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
