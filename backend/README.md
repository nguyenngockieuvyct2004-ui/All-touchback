# TouchBack Backend (Node.js + Express + MongoDB)

## Mục tiêu

Cung cấp API cho hệ thống: Auth (Local + Google), Sản phẩm, Giỏ hàng, Memories, Thẻ NFC.

## Kiến trúc & MVC

- models/: Định nghĩa schema Mongoose
- controllers/: Xử lý logic nghiệp vụ theo tài nguyên
- routes/: Khai báo endpoint, gọi controller + middleware auth/role
- middleware/: Xử lý cross-cutting (auth, error handler)
- utils/: Hàm tiện ích (generateSlug, ...)
- config/: Kết nối DB, cấu hình Passport

## Chức năng đã có (MVP)

- Đăng ký / đăng nhập (JWT)
- Google OAuth (callback tạo JWT redirect về FRONTEND_URL)
- CRUD cơ bản Product (Create yêu cầu role admin/manager, list public)
- Giỏ hàng (thêm, cập nhật số lượng, xem)
- Memory (create/list/get/update/delete cho user sở hữu)
- NFC Card: tạo, liên kết memories, public resolve slug `/nfc/:slug` hoặc `/m/:slug`

### Google Đăng nhập (2 cách)
1. Redirect OAuth (đã cấu hình `/auth/google`) → Backend redirect lại Frontend kèm JWT.
2. Google Identity Services (One Tap / Button) dùng thẻ script:
	 ```html
	 <script src="https://accounts.google.com/gsi/client" async defer></script>
	 <div id="g_id_onload"
				data-client_id="YOUR_GOOGLE_CLIENT_ID"
				data-context="signin"
				data-callback="handleGoogle" ></div>
	 <div class="g_id_signin" data-type="standard"></div>
	 <script>
		 async function handleGoogle(response){
			 const res = await fetch('http://localhost:4000/auth/google-token',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ credential: response.credential }) });
			 const data = await res.json();
			 console.log('JWT từ server:', data.token);
			 // lưu localStorage rồi redirect
		 }
	 </script>
	 ```
	 Backend endpoint: `POST /auth/google-token` body `{ credential: <id_token> }`.

## Validation

Sử dụng Joi trong controller để kiểm tra dữ liệu đầu vào. Trả lỗi 400 nếu không hợp lệ.

## Chạy dự án

1. Copy `.env.example` -> `.env` và cập nhật biến môi trường.
2. Cài đặt dependency:

```bash
npm install
```

3. Chạy dev:

```bash
npm run dev
```

## Các endpoint chính

- POST /auth/register
- POST /auth/login
- GET /products
- POST /products (admin/manager)
- GET /cart (auth)
- POST /cart/add (auth)
- POST /cart/update (auth)
- GET /memories (auth)
- POST /memories (auth)
- GET /memories/:id (auth)
- PUT /memories/:id (auth)
- DELETE /memories/:id (auth)
- POST /nfc (auth)
- POST /nfc/:id/link (auth)
- GET /nfc/:slug (public)

## Mở rộng tiếp theo

- Upload media (Cloudinary / S3)
- Contact form + quản trị
- Orders + Payment
- Refresh token flow & bảo mật nâng cao (rate limit, audit log)

## Ghi chú

Code viết bằng JavaScript (ESM) để đơn giản. Có thể chuyển sang TypeScript sau.
