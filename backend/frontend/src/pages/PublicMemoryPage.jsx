import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api.js';

export default function PublicMemoryPage(){
  const { slug } = useParams();
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');

  useEffect(()=>{
    api.get(`/nfc/${slug}`)
      .then(r=> setData(r.data))
      .catch(e=> setError(e.response?.data?.message || 'Không tìm thấy'))
      .finally(()=> setLoading(false));
  },[slug]);

  if(loading) return <div className="py-10 text-center text-gray-500">Đang tải...</div>;
  if(error) return <div className="py-10 text-center text-red-600">{error}</div>;

  return <div className="max-w-3xl mx-auto space-y-6">
    <h1 className="text-2xl font-semibold">Kỷ niệm được chia sẻ</h1>
    {!data.memories?.length && <p className="text-sm text-gray-500">Không có nội dung.</p>}
    <div className="space-y-6">
      {data.memories?.map(mem=> <div key={mem._id} className="card">
        <h2 className="font-medium text-lg mb-2">{mem.title}</h2>
        <p className="whitespace-pre-wrap leading-relaxed text-sm text-gray-700">{mem.content}</p>
      </div>)}
    </div>
  </div>;
}
