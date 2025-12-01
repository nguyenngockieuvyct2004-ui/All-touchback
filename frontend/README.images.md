# Ảnh sản phẩm: hiển thị đẹp cho ảnh dọc và ngang

Thành phần `src/components/ResponsiveImage.jsx` giúp hình sản phẩm luôn cân đối:

- Tự phát hiện ảnh dọc hay ngang dựa trên kích thước thật khi tải xong.
- Bao ngoài bằng tỉ lệ cố định (mặc định 16:9) để lưới sản phẩm thẳng hàng.
- Ảnh dọc dùng `object-contain` để tránh cắt xén, có nền letterbox mờ để không bị mảng trống.
- Ảnh ngang dùng `object-cover` để lấp đầy khung.
- Có skeleton khi đang tải và hỗ trợ `srcSet/sizes` qua `lib/images.js`.

Cách dùng:

```jsx
import ResponsiveImage from "@/components/ResponsiveImage.jsx";

<ResponsiveImage src={url} alt="Ảnh sản phẩm" ratio="aspect-video" />;
```

Đã áp dụng ở `ProductCard.jsx` và hình chính trong `ProductDetailPage.jsx`.
