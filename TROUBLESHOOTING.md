# Troubleshooting - Khắc Phục Lỗi

## ❌ Lỗi thường gặp và cách khắc phục

### 1. Firebase Initialization Errors

#### **TypeError: Cannot read properties of undefined (reading 'db')**
**Nguyên nhân**: Firebase chưa được load hoàn tất  
**Khắc phục**:
- Đảm bảo có internet connection
- Kiểm tra Firebase config trong `firebase-config.js`
- Refresh trang và đợi Firebase load

#### **Failed to initialize Firebase**
**Nguyên nhân**: Config sai hoặc project Firebase không tồn tại  
**Khắc phục**:
1. Kiểm tra config trong `firebase-config.js`
2. Đảm bảo project ID đúng
3. Kiểm tra API key và domain

### 2. Data Loading Errors

#### **Cannot read properties of undefined (reading 'forEach')**
**Nguyên nhân**: Dữ liệu chưa load hoặc null  
**Khắc phục**: Đã được fix trong version mới - hệ thống tự handle null data

#### **Chưa có bài tập nào / Chưa có học viên nào**
**Nguyên nhân**: Bình thường - chưa có dữ liệu  
**Khắc phục**: Tạo dữ liệu mới (admin tạo học viên, giao bài tập)

### 3. Authentication Issues

#### **ID không hợp lệ**
**Nguyên nhân**: Student ID chưa được admin tạo  
**Khắc phục**:
1. Admin đăng nhập và tạo student ID
2. Hoặc sử dụng demo IDs: `ADMIN2024`, `THUTHAO_CPP`

#### **Không thể đăng nhập**
**Nguyên nhân**: Lỗi local storage hoặc data corruption  
**Khắc phục**:
```javascript
// Clear all data (F12 Console)
localStorage.clear();
location.reload();
```

### 4. Connection Status Issues

#### **Connection status không update**
**Nguyên nhân**: Firebase connection check fail  
**Khắc phục**: Tự động fallback về localStorage

#### **Dữ liệu không sync giữa devices**
**Nguyên nhân**: Chưa setup Firebase đúng cách  
**Khắc phục**: 
1. Setup Firebase theo `FIREBASE_SETUP.md`
2. Hoặc sử dụng `demo.html` cho local testing

### 5. Performance Issues

#### **Trang load chậm**
**Nguyên nhân**: Firebase initialization  
**Khắc phục**:
- Đợi vài giây cho Firebase connect
- Hoặc dùng demo.html để test nhanh

#### **Button không respond**
**Nguyên nhân**: JavaScript async operations  
**Khắc phục**: Đợi operation hoàn tất, không click spam

### 6. Browser Compatibility

#### **Lỗi trên browser cũ**
**Nguyên nhân**: ES6+ syntax không support  
**Khắc phục**: Dùng modern browsers:
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 80+

#### **Mobile layout bị vỡ**
**Nguyên nhân**: CSS responsive issue  
**Khắc phục**: Đã được fix - responsive design

### 7. Data Storage Issues

#### **Dữ liệu bị mất khi clear cache**
**Nguyên nhân**: Dùng localStorage  
**Khắc phục**: Setup Firebase để lưu cloud

#### **Quota exceeded**
**Nguyên nhân**: localStorage hoặc Firebase quota  
**Khắc phục**:
- LocalStorage: Clear old data
- Firebase: Upgrade plan hoặc optimize data

### 8. Development Issues

#### **Code changes không có effect**
**Nguyên nhân**: Browser cache  
**Khắc phục**:
- Hard refresh: `Ctrl+F5` (Windows) / `Cmd+Shift+R` (Mac)
- Clear cache
- Sử dụng incognito mode

#### **Console errors**
**Nguyên nhân**: JS syntax hoặc missing dependencies  
**Khắc phục**: Check console (F12) và fix theo error message

## 🛠️ Debug Tools

### Console Commands (F12)
```javascript
// Check current user
console.log(exerciseManager.currentUser);

// Check Firebase status
console.log(window.dataAdapter.getConnectionStatus());

// Check user data
exerciseManager.getUserData().then(data => console.log(data));

// Clear all data
localStorage.clear();

// Force Firebase re-initialization
location.reload();
```

### Connection Diagnostics
```javascript
// Test Firebase connection
async function testFirebase() {
    try {
        const testData = await window.dataAdapter.getUserData('test');
        console.log('Firebase OK');
    } catch (error) {
        console.log('Firebase Error:', error);
    }
}
testFirebase();
```

## 🔧 Quick Fixes

### Reset Everything
```javascript
// Run in Console (F12)
localStorage.clear();
location.reload();
```

### Force Local Storage Mode
```javascript
// Run in Console to disable Firebase
window.dataAdapter.useFirebase = false;
location.reload();
```

### Test with Demo Data
1. Mở `demo.html` thay vì `index.html`
2. Dùng IDs: `ADMIN2024`, `THUTHAO_CPP`
3. Test tất cả tính năng

## 📞 Support

### Khi nào cần báo bug:
- Error persist sau khi thử các cách trên
- Data corruption không fix được
- Feature không hoạt động như expected

### Thông tin cần cung cấp:
- Browser và version
- Error message (F12 Console)
- Steps to reproduce
- Screenshot nếu có

### Workarounds:
- Dùng `demo.html` cho local testing
- Dùng incognito mode
- Clear cache và retry
- Test trên browser khác

---

**Lưu ý**: Hầu hết các lỗi đã được fix trong version hiện tại. Nếu vẫn gặp vấn đề, hãy thử refresh page hoặc clear cache.