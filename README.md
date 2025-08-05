# 🎓 Hệ Thống Quản Lý Bài Tập Học Viên

> Hệ thống quản lý bài tập trực tuyến toàn diện với kiểm soát quyền truy cập theo vai trò, bao gồm bài tập lập trình, trắc nghiệm và theo dõi tiến độ học tập.

[![GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://huynhkhuanit.github.io/student-assignment-portal-basic/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#giấy-phép)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange?style=for-the-badge)]()

## 🌟 Tính Năng

### 👨‍🏫 Dành Cho Giáo Viên/Quản Trị Viên
- **Quản Lý Học Viên**: Thêm, sửa, xóa và xem tiến độ học viên
- **Tạo Bài Tập**: Tạo bài tập lập trình và trắc nghiệm với nhiều ngôn ngữ lập trình
- **Phân Phối Bài Tập**: Giao bài tập cho từng học viên hoặc cả lớp
- **Theo Dõi Tiến Độ**: Theo dõi tỷ lệ hoàn thành và điểm danh của học viên
- **Bài Tập Hằng Ngày**: Lên lịch và quản lý nhiệm vụ hằng ngày
- **Hệ Thống Chấm Điểm**: Xem xét và chấm điểm bài nộp

### 👨‍🎓 Dành Cho Học Viên
- **Bảng Điều Khiển Bài Tập**: Xem tất cả bài tập được giao và hạn nộp
- **Trình Soạn Thảo Code**: Nộp bài tập lập trình với làm nổi bật cú pháp
- **Giao Diện Quiz**: Làm bài trắc nghiệm tương tác
- **Theo Dõi Tiến Độ**: Theo dõi tiến độ học tập cá nhân và chuỗi ngày
- **Điểm Danh Hằng Ngày**: Hệ thống theo dõi điểm danh
- **Lịch Sử Nộp Bài**: Xem lại các bài nộp và điểm số trước đây

### 🎨 Tính Năng Kỹ Thuật
- **Thiết Kế Responsive**: Hoạt động mượt mà trên desktop, tablet và mobile
- **Giao Diện Dark Theme**: Giao diện hiện đại, thân thiện với mắt
- **Làm Nổi Bật Cú Pháp**: Hỗ trợ 20+ ngôn ngữ lập trình sử dụng Prism.js
- **Lưu Trữ Cục Bộ**: Lưu trữ dữ liệu phía client
- **Phân Quyền Theo Vai Trò**: Phân tách vai trò admin/học viên bảo mật
- **Cập Nhật Real-time**: Tải và cập nhật nội dung động

## 🚀 Demo Trực Tuyến

**Demo**: [https://huynhkhuanit.github.io/student-assignment-portal-basic/](https://huynhkhuanit.github.io/student-assignment-portal-basic/)

### Tài Khoản Demo

| Vai Trò | Tên Đăng Nhập | Mô Tả |
|---------|---------------|-------|
| **Quản Trị** | `ADMIN2024` | Quyền quản trị đầy đủ |
| **Quản Trị** | `GIAOVIEN` | Tài khoản admin thay thế |
| **Học Viên** | `HV2024_001` | Tài khoản học viên mẫu |

## 📸 Hình Ảnh Minh Họa

### Bảng Điều Khiển Quản Trị
![Bảng Điều Khiển Quản Trị](https://via.placeholder.com/800x400/1e293b/ffffff?text=Bảng+Điều+Khiển+Quản+Trị)

### Giao Diện Học Viên
![Giao Diện Học Viên](https://via.placeholder.com/800x400/1e293b/ffffff?text=Giao+Diện+Học+Viên)

### Trình Soạn Thảo Code
![Trình Soạn Thảo Code](https://via.placeholder.com/800x400/1e293b/ffffff?text=Trình+Soạn+Thảo+Code+với+Làm+Nổi+Bật+Cú+Pháp)

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: CSS tùy chỉnh với CSS Variables
- **Làm Nổi Bật Cú Pháp**: [Prism.js](https://prismjs.com/)
- **Icons**: [Font Awesome 6](https://fontawesome.com/)
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter)
- **Lưu Trữ**: Browser LocalStorage
- **Triển Khai**: GitHub Pages

## ⚡ Bắt Đầu Nhanh

### Yêu Cầu Hệ Thống
- Trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge)
- Không cần cài đặt server - chạy hoàn toàn trên trình duyệt!

### Cài Đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/huynhkhuanit/student-assignment-portal-basic.git
   cd student-assignment-portal-basic
   ```

2. **Mở trong trình duyệt**
   ```bash
   # Cách 1: Truy cập trực tiếp file
   open index.html
   
   # Cách 2: Server cục bộ (khuyến nghị)
   python -m http.server 8000
   # Sau đó truy cập http://localhost:8000
   ```

3. **Bắt đầu sử dụng**
   - Đăng nhập với tài khoản admin để thiết lập hệ thống
   - Tạo tài khoản học viên
   - Bắt đầu tạo và giao bài tập!

## 📖 Hướng Dẫn Sử Dụng

### Dành Cho Giáo Viên/Quản Trị Viên

1. **Thiết Lập Ban Đầu**
   - Đăng nhập với `ADMIN2024` hoặc `GIAOVIEN`
   - Vào "Quản Lý Học Viên" để thêm học viên
   - Tạo mẫu bài tập trong "Bài Tập Code" và "Bài Trắc Nghiệm"

2. **Quản Lý Học Viên**
   - Thêm học viên với ID duy nhất
   - Xem tiến độ từng học viên
   - Chỉnh sửa thông tin học viên khi cần

3. **Tạo Bài Tập**
   - Vào "Quản Lý Bài Tập"
   - Chọn học viên và tạo bài tập
   - Đặt hạn nộp và yêu cầu
   - Theo dõi trạng thái nộp bài

4. **Hoạt Động Hằng Ngày**
   - Sử dụng "Giao Bài Hằng Ngày" cho bài tập hằng ngày
   - Kiểm tra "Tiến Độ" cho thống kê toàn hệ thống
   - Chấm điểm bài nộp và đưa ra phản hồi

### Dành Cho Học Viên

1. **Bắt Đầu**
   - Nhận ID học viên từ giáo viên
   - Đăng nhập để truy cập bảng điều khiển cá nhân
   - Hoàn thành điểm danh hằng ngày

2. **Làm Bài Tập**
   - Xem bài tập trong "Bài Tập Code" hoặc "Bài Trắc Nghiệm"
   - Click vào bài tập để bắt đầu làm
   - Nộp code hoặc câu trả lời quiz
   - Kiểm tra điểm và phản hồi

3. **Theo Dõi Tiến Độ**
   - Theo dõi tỷ lệ hoàn thành trong "Tiến Độ"
   - Xem lịch điểm danh
   - Theo dõi chuỗi ngày học

## 🏗️ Cấu Trúc Dự Án

```
student-assignment-portal-basic/
├── index.html              # File HTML chính
├── script.js               # Chức năng JavaScript cốt lõi
├── styles.css              # Styling và responsive design
├── student-config.json     # Cấu hình học viên mẫu
├── README.md               # Tài liệu dự án
├── .gitignore             # Patterns ignore Git
└── _config.yml            # Cấu hình GitHub Pages
```

### Thành Phần Chính

- **Lớp ExerciseManager**: Logic ứng dụng chính
- **Hệ Thống Xác Thực**: Đăng nhập và kiểm soát truy cập theo vai trò
- **Quản Lý Dữ Liệu**: Thao tác LocalStorage và lưu trữ dữ liệu
- **Thành Phần UI**: Modal dialogs, forms và các phần tử tương tác
- **Làm Nổi Bật Cú Pháp**: Tích hợp Prism.js để hiển thị code

## 🌍 Ngôn Ngữ Lập Trình Được Hỗ Trợ

Hệ thống hỗ trợ làm nổi bật cú pháp cho:

| Ngôn Ngữ | Phần Mở Rộng | Ngôn Ngữ | Phần Mở Rộng |
|----------|-------------|----------|-------------|
| JavaScript | `.js` | Python | `.py` |
| TypeScript | `.ts` | Java | `.java` |
| C++ | `.cpp` | C | `.c` |
| C# | `.cs` | PHP | `.php` |
| Ruby | `.rb` | Go | `.go` |
| Rust | `.rs` | Kotlin | `.kt` |
| Swift | `.swift` | SQL | `.sql` |
| HTML | `.html` | CSS | `.css` |
| JSON | `.json` | YAML | `.yml` |
| Bash | `.sh` | PowerShell | `.ps1` |
| Markdown | `.md` | XML | `.xml` |

## 🔧 Cấu Hình

### Thêm ID Quản Trị Mới
Chỉnh sửa mảng `adminIds` trong `script.js`:
```javascript
this.adminIds = ['ADMIN2024', 'ADMIN123', 'GIAOVIEN', 'ID_ADMIN_MỚI'];
```

### Tùy Chỉnh Giao Diện
Sửa đổi CSS variables trong `styles.css`:
```css
:root {
    --primary-color: #3b82f6;     /* Màu xanh chính */
    --secondary-color: #64748b;   /* Màu xám phụ */
    --background: #0f172a;        /* Nền tối */
    /* ... các biến khác */
}
```

## 📱 Tương Thích Trình Duyệt

| Trình Duyệt | Phiên Bản | Trạng Thái |
|-------------|-----------|------------|
| Chrome | 70+ | ✅ Hỗ Trợ Đầy Đủ |
| Firefox | 65+ | ✅ Hỗ Trợ Đầy Đủ |
| Safari | 12+ | ✅ Hỗ Trợ Đầy Đủ |
| Edge | 79+ | ✅ Hỗ Trợ Đầy Đủ |
| Opera | 60+ | ✅ Hỗ Trợ Đầy Đủ |

## 🤝 Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng làm theo các bước sau:

1. **Fork repository**
2. **Tạo nhánh tính năng**
   ```bash
   git checkout -b feature/tinh-nang-tuyet-voi
   ```
3. **Commit thay đổi**
   ```bash
   git commit -m 'Thêm tính năng tuyệt vời'
   ```
4. **Push lên nhánh**
   ```bash
   git push origin feature/tinh-nang-tuyet-voi
   ```
5. **Mở Pull Request**

### Hướng Dẫn Phát Triển

- Tuân theo style code và conventions hiện có
- Thêm comments cho chức năng phức tạp
- Test trên nhiều trình duyệt
- Đảm bảo responsive design hoạt động trên mọi thiết bị

## 🐛 Vấn Đề Đã Biết & Hạn Chế

- **Lưu Trữ Dữ Liệu**: Sử dụng LocalStorage - dữ liệu chỉ theo thiết bị
- **Upload File**: Không hỗ trợ đính kèm file trong bài tập
- **Cộng Tác Real-time**: Không có tính năng đa người dùng real-time
- **Chấm Điểm Nâng Cao**: Hệ thống chấm điểm cơ bản, không có rubrics
- **Xuất/Nhập Dữ Liệu**: Không có chức năng xuất/nhập dữ liệu

## 🗺️ Lộ Trình Phát Triển

- [ ] **Tích Hợp Backend**: Thay thế LocalStorage bằng database thực
- [ ] **Hỗ Trợ Upload File**: Cho phép học viên nộp file
- [ ] **Phân Tích Nâng Cao**: Báo cáo và phân tích tiến độ chi tiết
- [ ] **Hỗ Trợ Đa Ngôn Ngữ**: Quốc tế hóa (i18n)
- [ ] **Ứng Dụng Mobile**: Ứng dụng React Native hoặc Flutter
- [ ] **API Tích Hợp**: Kết nối với các nền tảng LMS phổ biến
- [ ] **Trình Soạn Thảo Code Nâng Cao**: Tích hợp Monaco Editor
- [ ] **Phát Hiện Đạo Văn**: Kiểm tra tương đồng code cơ bản

## 📄 Giấy Phép

Dự án này được cấp phép theo MIT License - xem file [LICENSE](LICENSE) để biết chi tiết.

```
MIT License

Copyright (c) 2024 Hệ Thống Quản Lý Bài Tập Học Viên

Được cấp phép miễn phí cho bất kỳ ai có được bản sao của phần mềm này 
và các file tài liệu đi kèm (gọi chung là "Phần Mềm"), để sử dụng Phần Mềm 
không giới hạn, bao gồm nhưng không hạn chế quyền sử dụng, sao chép, 
sửa đổi, hợp nhất, xuất bản, phân phối, cấp phép con và/hoặc bán các bản 
sao của Phần Mềm, và cho phép những người được cung cấp Phần Mềm thực hiện 
điều tương tự, tuân theo các điều kiện sau:

Thông báo bản quyền ở trên và thông báo giấy phép này phải được bao gồm 
trong tất cả các bản sao hoặc phần quan trọng của Phần Mềm.
```

## 🙏 Lời Cảm Ơn

- **[Prism.js](https://prismjs.com/)** - Thư viện làm nổi bật cú pháp
- **[Font Awesome](https://fontawesome.com/)** - Thư viện icons
- **[Google Fonts](https://fonts.google.com/)** - Font chữ Inter
- **[GitHub Pages](https://pages.github.com/)** - Nền tảng hosting miễn phí

## 📞 Hỗ Trợ

- **Issues**: [GitHub Issues](https://github.com/huynhkhuanit/student-assignment-portal-basic/issues)
- **Email**: [huynhkhuanit@gmail.com](mailto:huynhkhuanit@gmail.com)

---

<div align="center">

**⭐ Hãy star repository này nếu bạn thấy hữu ích!**

[Demo](https://huynhkhuanit.github.io/student-assignment-portal-basic/) • [Issues](https://github.com/huynhkhuanit/student-assignment-portal-basic/issues)

Được tạo với ❤️ bởi [huynhkhuanit](https://github.com/huynhkhuanit)

</div>