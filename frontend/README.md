# TouchBack Frontend (React + Vite)

## Mục tiêu

Skeleton giao diện cho các trang chính: Home, Products, Profile, Contact, Cart, Public Memory (slug NFC).

## Chạy dev

```bash
npm install
npm run dev
```

Ứng dụng chạy mặc định tại http://localhost:5173

## Cấu trúc

```
src/
  main.jsx            // Khởi tạo router
  pages/
    layout/AppLayout  // Layout + Nav
    HomePage
    ProductsPage (fetch products backend)
    ProfilePage
    ContactPage
    CartPage
    MemoryPublicPage  // /m/:slug hiển thị memories public
```

## Kết nối Backend

- Backend URL mặc định: http://localhost:4000
- Cần bật CORS phía server (đã bật origin: true).

## Kế hoạch mở rộng

- State management (Zustand / Redux Toolkit)
- Auth context + lưu JWT (localStorage) + interceptor axios
- Form Contact + gửi API
- CRUD Memory + Upload media
- UI framework (Tailwind / MUI)
