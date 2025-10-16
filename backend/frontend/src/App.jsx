import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import PublicCardPage from './pages/PublicCardPage.jsx';
import AdminProductsPage from './pages/AdminProductsPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminOrdersPage from './pages/AdminOrdersPage.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import MyOrdersPage from './pages/MyOrdersPage.jsx';
import { useAuth } from './context/AuthContext.jsx';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage.jsx';
import NfcWizardPage from './pages/NfcWizardPage.jsx';
import NfcActivatePage from './pages/NfcActivatePage.jsx';

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
  const { user } = useAuth();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Admin shell (no public navbar) */}
        <Route path="/admin" element={<ProtectedRoute roles={["admin","manager"]}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<PageWrapper><AdminDashboardPage /></PageWrapper>} />
          <Route path="products" element={<PageWrapper><AdminProductsPage /></PageWrapper>} />
          <Route path="users" element={<ProtectedRoute roles={["admin"]}><PageWrapper><AdminUsersPage /></PageWrapper></ProtectedRoute>} />
          <Route path="orders" element={<PageWrapper><AdminOrdersPage /></PageWrapper>} />
        </Route>

        {/* Public site wrapped per-route with Layout */}
        <Route path="/" element={
          (user && (user.role==='admin' || user.role==='manager'))
            ? <Navigate to="/admin" replace />
            : <Layout><PageWrapper><HomePage /></PageWrapper></Layout>
        } />
        <Route path="/products" element={<Layout><PageWrapper><ProductsPage /></PageWrapper></Layout>} />
        <Route path="/products/:id" element={<Layout><PageWrapper><ProductDetailPage /></PageWrapper></Layout>} />
        <Route path="/login" element={<Layout><PageWrapper><LoginPage /></PageWrapper></Layout>} />
        <Route path="/register" element={<Layout><PageWrapper><RegisterPage /></PageWrapper></Layout>} />
        <Route path="/forgot-password" element={<Layout><PageWrapper><ForgotPasswordPage /></PageWrapper></Layout>} />
        <Route path="/reset-password" element={<Layout><PageWrapper><ResetPasswordPage /></PageWrapper></Layout>} />
        <Route path="/cart" element={<Layout><ProtectedRoute><PageWrapper><CartPage /></PageWrapper></ProtectedRoute></Layout>} />
  <Route path="/checkout/success" element={<Layout><ProtectedRoute><PageWrapper><CheckoutSuccessPage /></PageWrapper></ProtectedRoute></Layout>} />
        <Route path="/memories" element={<Layout><ProtectedRoute><PageWrapper><MemoriesPage /></PageWrapper></ProtectedRoute></Layout>} />
        <Route path="/memories/new" element={<Layout><ProtectedRoute><PageWrapper><MemoryEditPage /></PageWrapper></ProtectedRoute></Layout>} />
        <Route path="/memories/:id" element={<Layout><ProtectedRoute><PageWrapper><MemoryViewPage /></PageWrapper></ProtectedRoute></Layout>} />
        <Route path="/memories/:id/edit" element={<Layout><ProtectedRoute><PageWrapper><MemoryEditPage /></PageWrapper></ProtectedRoute></Layout>} />
        <Route path="/nfc" element={<Layout><ProtectedRoute><PageWrapper><NfcCardsPage /></PageWrapper></ProtectedRoute></Layout>} />
  <Route path="/nfc/new" element={<Layout><ProtectedRoute><PageWrapper><NfcWizardPage /></PageWrapper></ProtectedRoute></Layout>} />
  <Route path="/nfc/activate" element={<Layout><PageWrapper><NfcActivatePage /></PageWrapper></Layout>} />
        <Route path="/chat" element={<Layout><ProtectedRoute><PageWrapper><ChatPage /></PageWrapper></ProtectedRoute></Layout>} />
        <Route path="/orders" element={<Layout><ProtectedRoute><PageWrapper><MyOrdersPage /></PageWrapper></ProtectedRoute></Layout>} />
        <Route path="/m/:slug" element={<Layout><PageWrapper><PublicMemoryPage /></PageWrapper></Layout>} />
        <Route path="/c/:slug" element={<Layout><PageWrapper><PublicCardPage /></PageWrapper></Layout>} />

        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </AnimatePresence>
  );
}
