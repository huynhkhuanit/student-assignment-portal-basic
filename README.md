# Hệ Thống Quản Lý Bài Tập Lập Trình

Một hệ thống quản lý bài tập lập trình và trắc nghiệm với tính năng xác thực ID, hỗ trợ cả admin (giáo viên) và student (học viên).

## ✨ Tính Năng Chính

### 👨‍🏫 Dành cho Giáo viên (Admin)
- **Quản lý học viên**: Thêm, sửa, xóa học viên
- **Giao bài tập**: Tạo và giao bài tập lập trình và trắc nghiệm
- **Chấm điểm**: Xem bài làm và chấm điểm cho học viên
- **Thống kê**: Xem tiến độ và thống kê của từng học viên
- **Giao bài hằng ngày**: Giao bài tập cho cả lớp cùng lúc

### 👨‍🎓 Dành cho Học viên (Student)
- **Làm bài tập**: Làm bài tập lập trình với code editor
- **Trắc nghiệm**: Làm câu hỏi trắc nghiệm có giải thích
- **Điểm danh**: Điểm danh hằng ngày với streak counter
- **Theo dõi tiến độ**: Xem tiến độ học tập và điểm số
- **Lịch sử**: Xem lại các bài đã làm

## 🚀 Demo

### Thử ngay (Local Storage)
Mở file `demo.html` để test ngay hệ thống với:
- **Admin Demo**: `ADMIN2024`
- **Student Demo**: `THUTHAO_CPP`

### Phiên bản Production (Firebase)
Để sử dụng với Firebase (lưu trữ đám mây):
1. Đọc hướng dẫn trong `FIREBASE_SETUP.md`
2. Mở file `index.html`

## 📱 Lưu Trữ Dữ Liệu

### Local Storage (Demo)
- Dữ liệu chỉ lưu trên thiết bị hiện tại
- Phù hợp để test và demo
- Không cần cấu hình gì thêm

### Firebase Firestore (Production)
- Dữ liệu lưu trên cloud, truy cập từ mọi nơi
- Real-time sync giữa các thiết bị
- Cần setup Firebase project (xem `FIREBASE_SETUP.md`)

## 🛠️ Cài Đặt

### Cách 1: Clone Repository
```bash
git clone [repository-url]
cd exercise-management-system
```

### Cách 2: Download ZIP
Download và giải nén vào thư mục của bạn

### Cách 3: GitHub Pages
Fork repository và enable GitHub Pages để có hosting miễn phí

## 🔧 Cấu Hình

### Sử dụng Local Storage (Đơn giản)
1. Mở `demo.html` trong trình duyệt
2. Đăng nhập với ID demo
3. Bắt đầu sử dụng ngay!

### Sử dụng Firebase (Khuyến nghị)
1. Tạo Firebase project
2. Cấu hình Firestore Database
3. Cập nhật `firebase-config.js`
4. Mở `index.html`

Chi tiết xem file `FIREBASE_SETUP.md`

## 📖 Hướng Dẫn Sử Dụng

### Đăng Nhập Lần Đầu

**Admin (Giáo viên):**
- Sử dụng ID: `ADMIN2024`, `ADMIN123`, hoặc `GIAOVIEN`
- Có thể thêm ID admin khác trong `script.js`

**Student (Học viên):**
- Admin phải tạo tài khoản học viên trước
- Học viên đăng nhập bằng ID được cấp

### Workflow Cơ Bản

1. **Admin đăng nhập** → Tạo học viên → Giao bài tập
2. **Student đăng nhập** → Điểm danh → Làm bài tập → Nộp bài
3. **Admin xem bài** → Chấm điểm → Giao bài mới

## 🎨 Giao Diện

- **Responsive Design**: Hoạt động tốt trên mobile và desktop
- **Dark Mode Code Editor**: Dễ nhìn khi code
- **Syntax Highlighting**: Hỗ trợ nhiều ngôn ngữ lập trình
- **Modern UI**: Thiết kế hiện đại với Inter font

## 💻 Công Nghệ Sử Dụng

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: Firebase Firestore / localStorage
- **Code Highlighting**: Prism.js
- **Icons**: Font Awesome
- **Hosting**: GitHub Pages / Firebase Hosting

## 🔒 Bảo Mật

### Local Storage
- Dữ liệu chỉ trên thiết bị, không có bảo mật đặc biệt

### Firebase
- Firestore Security Rules để bảo vệ dữ liệu
- Có thể thêm Firebase Authentication sau
- HTTPS encryption mặc định

## 📱 Tương Thích

- **Browsers**: Chrome, Firefox, Safari, Edge (modern versions)
- **Mobile**: iOS Safari, Android Chrome
- **Offline**: Hoạt động offline với localStorage

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

MIT License - Xem file `LICENSE` để biết chi tiết

## 🆘 Hỗ Trợ

### Báo Lỗi
Tạo issue trên GitHub với mô tả chi tiết

### Tính Năng Mới
Tạo feature request với use case cụ thể

### FAQ

**Q: Dữ liệu có mất khi tắt trình duyệt không?**
A: Với localStorage thì không, với Firebase thì được sync real-time

**Q: Có thể dùng cho bao nhiều học viên?**
A: Không giới hạn, tùy thuộc vào quota Firebase

**Q: Có mobile app không?**
A: Chưa có, nhưng web responsive hoạt động tốt trên mobile

**Q: Có thể customize không?**
A: Có, source code mở hoàn toàn

## 🔮 Roadmap

- [ ] Firebase Authentication
- [ ] File upload cho bài tập
- [ ] Video tutorials
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support

---

**Phát triển bởi**: Hệ thống quản lý bài tập lập trình  
**Version**: 1.0.0  
**Last Updated**: 2024