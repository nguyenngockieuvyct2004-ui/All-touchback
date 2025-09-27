import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CartPage from './pages/CartPage.jsx';
import MemoriesPage from './pages/MemoriesPage.jsx';
import MemoryEditPage from './pages/MemoryEditPage.jsx';
import MemoryViewPage from './pages/MemoryViewPage.jsx';
import NfcCardsPage from './pages/NfcCardsPage.jsx';
import PublicMemoryPage from './pages/PublicMemoryPage.jsx';
import AdminProductsPage from './pages/AdminProductsPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function PageWrapper({ children }){
  return (
    <motion.div
      initial={{ opacity:0, y:8 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, y:-8 }}
      transition={{ duration:0.35, ease:[0.22,0.58,0.12,0.98] }}
      className="page py-8"
    >
      {children}
    </motion.div>
  );
}

function NotFound(){
  return <PageWrapper>
    <div className="max-w-md mx-auto text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-600/10 to-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
        <span className="text-3xl font-bold">404</span>
      </div>
      <h1 className="text-2xl font-semibold">Không tìm thấy trang</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Liên kết bạn truy cập có thể đã bị thay đổi hoặc không tồn tại nữa.</p>
      <a href="/" className="btn">Về trang chủ</a>
    </div>
  </PageWrapper>;
}

export default function App(){
  const location = useLocation();
  return (
    <Layout>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="/products" element={<PageWrapper><ProductsPage /></PageWrapper>} />
          <Route path="/products/:id" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
          <Route path="/cart" element={<ProtectedRoute><PageWrapper><CartPage /></PageWrapper></ProtectedRoute>} />
          <Route path="/memories" element={<ProtectedRoute><PageWrapper><MemoriesPage /></PageWrapper></ProtectedRoute>} />
          <Route path="/memories/:id" element={<ProtectedRoute><PageWrapper><MemoryViewPage /></PageWrapper></ProtectedRoute>} />
          <Route path="/memories/:id/edit" element={<ProtectedRoute><PageWrapper><MemoryEditPage /></PageWrapper></ProtectedRoute>} />
          <Route path="/nfc" element={<ProtectedRoute><PageWrapper><NfcCardsPage /></PageWrapper></ProtectedRoute>} />
          <Route path="/m/:slug" element={<PageWrapper><PublicMemoryPage /></PageWrapper>} />
          <Route path="/admin/products" element={<ProtectedRoute roles={["admin","manager"]}><PageWrapper><AdminProductsPage /></PageWrapper></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
