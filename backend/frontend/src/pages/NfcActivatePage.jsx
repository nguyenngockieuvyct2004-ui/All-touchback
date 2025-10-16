import React, { useState } from 'react';

export default function NfcActivatePage(){
  const [code, setCode] = useState('');
  const [tagUid, setTagUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      // TODO: call POST /nfc/activate with token auth
      // const res = await fetch('/api/nfc/activate', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization': `Bearer ${token}`}, body: JSON.stringify({ activationCode: code || null, tagUid: tagUid || null }) });
      // if(!res.ok) throw new Error((await res.json()).message || 'Error');
      setDone(true);
    } catch (e) {
      setError(e.message || 'Không kích hoạt được thẻ');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center space-y-3">
        <h1 className="text-2xl font-semibold">Kích hoạt thành công</h1>
        <p>Bạn có thể cấu hình thẻ trong mục NFC Cards.</p>
        <a className="btn" href="/nfc">Đi tới NFC Cards</a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Kích hoạt thẻ</h1>
      <input className="input w-full" placeholder="Activation code (nếu có)" value={code} onChange={e=>setCode(e.target.value)} />
      <input className="input w-full" placeholder="Tag UID (tuỳ chọn)" value={tagUid} onChange={e=>setTagUid(e.target.value)} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn" disabled={loading} onClick={submit}>Kích hoạt</button>
    </div>
  );
}
