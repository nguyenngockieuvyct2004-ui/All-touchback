import React from 'react';
export default function ErrorMessage({error}){ if(!error) return null; return <div className="p-3 mb-4 rounded bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>; }
