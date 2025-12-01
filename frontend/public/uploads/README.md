Hướng dẫn: copy các ảnh avatar vào thư mục này để frontend có thể truy cập qua đường dẫn /uploads/<filename>

Files to copy (suggested source files located at project root ./uploads/):

- Huy-1760376086071.jpg -> rename to nhat-quang.jpg (or keep original)
- Huyyyyyy-1759251608588.jpg -> rename to hoang-minh.jpg
- huy1-1760374796328.jpg -> rename to minh-huy.jpg
- z7112506055212_4f4145cb55352eda4424bb67829768d9-1760507386690.jpg -> rename to my-hang.jpg
- z7112506098641_6ffddb9de21e3c8fe097e6a0b3075a15-1760507382518.jpg -> rename to kieu-vy.jpg

Example (powershell):

# Run in project root

# Copy and rename files into frontend public uploads

cp .\uploads\Huy-1760376086071.jpg .\backend\frontend\public\uploads\nhat-quang.jpg
cp .\uploads\Huyyyyyy-1759251608588.jpg .\backend\frontend\public\uploads\hoang-minh.jpg
cp .\uploads\huy1-1760374796328.jpg .\backend\frontend\public\uploads\minh-huy.jpg
cp .\uploads\z7112506055212_4f4145cb55352eda4424bb67829768d9-1760507386690.jpg .\backend\frontend\public\uploads\my-hang.jpg
cp .\uploads\z7112506098641_6ffddb9de21e3c8fe097e6a0b3075a15-1760507382518.jpg .\backend\frontend\public\uploads\kieu-vy.jpg

If you prefer I can perform the copy for you if you give permission to modify files in the repository.
