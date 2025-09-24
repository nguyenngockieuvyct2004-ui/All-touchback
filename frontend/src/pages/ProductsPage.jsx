import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProductsPage(){
  const [products,setProducts] = useState([]);
  useEffect(()=>{
    axios.get('http://localhost:4000/products').then(r=> setProducts(r.data));
  },[]);
  return <div>
    <h1>Products</h1>
    <ul>
      {products.map(p=> <li key={p._id}>{p.name} - {p.price}</li>)}
    </ul>
  </div>;
}
