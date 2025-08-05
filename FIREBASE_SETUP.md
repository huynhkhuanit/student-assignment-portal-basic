# Hướng Dẫn Cấu Hình Firebase

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Nhấn "Create a project" (Tạo project)
3. Nhập tên project (ví dụ: `student-assignment-portal`)
4. Bỏ chọn Google Analytics (không cần thiết)
5. Nhấn "Create project"

## Bước 2: Cấu Hình Firestore Database

1. Trong project dashboard, chọn "Firestore Database"
2. Nhấn "Create database"
3. Chọn "Start in test mode" (có thể thay đổi sau)
4. Chọn location gần nhất (asia-southeast1 cho Việt Nam)
5. Nhấn "Done"

## Bước 3: Thiết Lập Web App

1. Trong project overview, nhấn icon Web (</>)
2. Nhập nickname cho app (ví dụ: `student-portal-web`)
3. Bỏ chọn "Firebase Hosting" (sẽ dùng GitHub Pages)
4. Nhấn "Register app"
5. Sao chép configuration object

## Bước 4: Cập Nhật File Cấu Hình

Mở file `firebase-config.js` và thay đổi:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## Bước 5: Cấu Hình Security Rules

Trong Firestore Database > Rules, thay đổi thành:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for all authenticated users
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Lưu ý**: Đây là rule đơn giản cho demo. Trong production cần rule bảo mật hơn.

## Bước 6: Database Structure

Hệ thống sẽ tạo tự động các collections:

### `admin` collection:
```
admin/
  data/
    students: []
    systemStats: {}
    createdAt: timestamp
    lastUpdated: timestamp
```

### `users` collection:
```
users/
  {userId}/
    codingExercises: {}
    quizExercises: {}
    assignments: { coding: [], quiz: [] }
    attendance: []
    activities: []
    profile: {}
    createdAt: timestamp
    lastUpdated: timestamp
```

### `assignments` collection:
```
assignments/
  {assignmentId}/
    id: string
    studentId: string
    type: "coding" | "quiz"
    title: string
    description: string
    assignedAt: timestamp
    status: "pending" | "in-progress" | "submitted" | "graded"
    // Các fields khác tùy theo loại assignment
```

## Bước 7: Test Connection

1. Mở trang web
2. Kiểm tra Console (F12) xem có message "Firebase initialized successfully"
3. Thử đăng nhập với ID admin: `ADMIN2024`
4. Tạo học viên mới và test assignment

## Bước 8: Deploy lên GitHub Pages

1. Commit tất cả files vào GitHub repository
2. Vào Settings > Pages
3. Chọn Source: "Deploy from branch"
4. Chọn branch: `main`
5. Folder: `/ (root)`
6. Nhấn Save

## Troubleshooting

### Lỗi CORS
Nếu gặp lỗi CORS, thêm domain của GitHub Pages vào Firebase:
1. Project Settings > General
2. Scroll xuống "Your apps"
3. Trong Web app config, thêm domain GitHub Pages

### Lỗi Permission Denied
- Kiểm tra Security Rules
- Đảm bảo project ID đúng trong config

### Không kết nối được Firebase
- Kiểm tra console log
- Hệ thống sẽ fallback về localStorage tự động

## Security Rules Production

Khi deploy production, sử dụng rules bảo mật hơn:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin data - chỉ system có thể truy cập
    match /admin/{document} {
      allow read, write: if true; // Có thể thêm auth sau
    }
    
    // User data - chỉ user đó có thể truy cập
    match /users/{userId} {
      allow read, write: if true; // Có thể thêm auth sau
    }
    
    // Assignments - student chỉ đọc được assignment của mình
    match /assignments/{assignmentId} {
      allow read, write: if true; // Có thể thêm auth sau
    }
  }
}
```

## Monitoring

Firebase cung cấp dashboard để monitor:
- Số lượng reads/writes
- Storage usage
- Performance
- Errors

Truy cập tại Firebase Console > Project Overview.