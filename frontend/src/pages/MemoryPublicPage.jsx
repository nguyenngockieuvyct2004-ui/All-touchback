import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function MemoryPublicPage(){
  const { slug } = useParams();
  const [data,setData] = useState(null);
  const [error,setError] = useState('');
  useEffect(()=>{
    axios.get(`http://localhost:4000/nfc/${slug}`)
      .then(r=> setData(r.data))
      .catch(()=> setError('Không tìm thấy thẻ'));
  },[slug]);
  if(error) return <p>{error}</p>;
  if(!data) return <p>Loading...</p>;
  return <div>
    <h1>Memory Card: {data.card.title || data.card.slug}</h1>
    <ul>
      {data.memories.map(m=> <li key={m._id}>{m.title}</li>)}
    </ul>
  </div>;
}
