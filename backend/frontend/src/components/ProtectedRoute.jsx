import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, roles }){
  const { user, loading } = useAuth();
  const location = useLocation();
  if(loading) return <div className="text-center py-10">Loading...</div>;
  if(!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if(roles && !roles.includes(user.role)) return <div className="text-center py-10 text-red-600">Bạn không có quyền truy cập.</div>;
  return children;
}
