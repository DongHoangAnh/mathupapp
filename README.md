# MathUp - Nền Tảng Học Toán Thông Minh

Nền tảng giáo dục toán học với AI, hỗ trợ 3 vai trò: **Học sinh**, **Giáo viên**, và **Phụ huynh**.

## ✨ Tính Năng Chính

### 🎓 Dành Cho Học Sinh
- **Đánh giá thích ứng**: Hệ thống đánh giá thông minh tạo bản đồ kiến thức cá nhân hóa
- **Game Show**: Quiz game tương tác với gợi ý AI và các tùy chọn trợ giúp
- **Lộ trình học tập**: Lộ trình học tùy chỉnh dựa trên kết quả đánh giá
- **AI Assistant**: Trợ lý AI hỗ trợ học tập 24/7
- **Theo dõi tiến độ**: Hệ thống thành tích và theo dõi tiến độ trực quan

### 👨‍🏫 Dành Cho Giáo Viên
- Quản lý lớp học
- Theo dõi tiến độ học sinh
- Tạo và quản lý bài đánh giá
- Báo cáo chi tiết về từng học sinh

### 👨‍👩‍👧 Dành Cho Phụ Huynh
- Xem danh sách con
- Theo dõi tiến độ học tập
- Xem chi tiết thành tích và thử thách
- Phân tích điểm yếu và khoảng trống kiến thức

## 🚀 Cài Đặt

### Yêu Cầu
- **Node.js** 18 trở lên
- **npm** hoặc **yarn**
- Tài khoản **Supabase** (miễn phí)

### Các Bước Cài Đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/hainguyenvie/personalizedmath.git
   cd personalizedmath
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Cấu hình environment variables**
   ```bash
   # Copy file .env.example thành .env
   cp .env.example .env
   
   # Sau đó chỉnh sửa .env với thông tin Supabase của bạn
   ```

4. **Chạy ứng dụng**
   ```bash
   npm run dev
   ```

Ứng dụng sẽ chạy tại `http://localhost:5000`

## 📦 Deploy Trên Replit

### Bước 1: Import từ GitHub
1. Vào [Replit](https://replit.com)
2. Nhấn "Create" → "Import from GitHub"
3. Paste URL repository: `https://github.com/hainguyenvie/personalizedmath`

### Bước 2: Cấu hình Environment Variables
1. Mở tab "Tools" → "Secrets" (hoặc biểu tượng khóa 🔐)
2. Thêm các biến môi trường:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

### Bước 3: Run
1. Nhấn nút "Run" ▶️
2. Replit sẽ tự động:
   - Cài đặt dependencies (`npm install`)
   - Build và chạy ứng dụng (`npm run dev`)

### Lưu Ý Khi Deploy
- Đảm bảo `.env` **KHÔNG** được commit lên GitHub
- Sử dụng Secrets của Replit để lưu environment variables
- Port mặc định: 5000 (Replit sẽ tự động expose)

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **React 18** với TypeScript
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - UI Components
- **Lucide React** - Icons
- **Wouter** - Routing

### Backend
- **Express.js** - Server
- **Supabase** - Authentication & Database
- **TypeScript** - Type safety

### Build Tools
- **Vite** - Fast development & build
- **tsx** - TypeScript execution
- **esbuild** - Fast bundling

## 📁 Cấu Trúc Project

```
personalizedmath/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── app-header.tsx    # Header thống nhất
│   │   │   └── role-selection-modal.tsx
│   │   ├── pages/          # Pages
│   │   │   ├── home-ocean-v2.tsx    # Homepage
│   │   │   ├── signin.tsx           # Đăng nhập
│   │   │   ├── signup.tsx           # Đăng ký
│   │   │   ├── profile.tsx          # Profile
│   │   │   ├── assessment.tsx       # Đánh giá
│   │   │   ├── gameshow.tsx         # Game Show
│   │   │   ├── teacher-classes.tsx  # Lớp học (GV)
│   │   │   ├── parent-children.tsx  # Danh sách con (PH)
│   │   │   └── ...
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utils & configs
├── server/                 # Backend Express
│   └── index.ts
├── shared/                 # Shared types
├── .env.example           # Template cho .env
├── package.json
└── README.md
```

## 🎯 Các Trang Chính

| Route | Mô tả | Vai trò |
|-------|-------|---------|
| `/` | Trang chủ | Tất cả |
| `/login` | Đăng nhập | Public |
| `/signup` | Đăng ký | Public |
| `/profile` | Trang cá nhân | Đã đăng nhập |
| `/assessment` | Đánh giá | Học sinh |
| `/gameshow` | Game show | Học sinh |
| `/learning` | Học tập | Học sinh |
| `/payment` | Thanh toán | Học sinh |
| `/teacher/classes` | Quản lý lớp | Giáo viên |
| `/teacher/classes/:id` | Chi tiết lớp | Giáo viên |
| `/parent/children` | Danh sách con | Phụ huynh |
| `/parent/children/:id` | Chi tiết con | Phụ huynh |
| `/parent/children/:id/weak-points` | Điểm cần lưu ý | Phụ huynh |

## 🔐 Authentication

Ứng dụng sử dụng **Supabase Auth** với:
- ✅ Email/Password authentication
- ✅ Role-based access control (student/teacher/parent)
- ✅ Protected routes
- ✅ Persistent sessions

### Tài Khoản Demo (Có thể tạo mới)
```
Email: student@test.com / teacher@test.com / parent@test.com
Password: 123456
```

## 🎨 Hệ Thống UI/UX

### Design System
- **Font**: Inter (thống nhất toàn bộ header)
- **Colors**: 
  - Primary: `#00A8E8` (Blue)
  - Secondary: `#FF9F1C` (Orange)
  - Navy: `#0F4C75`
  - Background: `#EAF6FF`

### Responsive
- ✅ Mobile-first design
- ✅ Tablet optimized
- ✅ Desktop enhanced

## 🐛 Troubleshooting

### Lỗi Thường Gặp

**1. `npm install` thất bại**
```bash
# Xóa node_modules và thử lại
rm -rf node_modules package-lock.json
npm install
```

**2. Port 5000 đã được sử dụng**
```bash
# Thay đổi port trong server/index.ts
# Hoặc kill process đang dùng port 5000
```

**3. Supabase connection error**
- Kiểm tra lại `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`
- Đảm bảo Supabase project đã được tạo
- Check network connection

**4. Font không nhất quán**
- Đã được fix với Inter font global
- Clear browser cache và reload

## 📝 Scripts

```bash
# Development
npm run dev          # Chạy dev server (cả frontend + backend)

# Build
npm run build        # Build production

# Production
npm start            # Chạy production build

# Database
npm run db:push      # Push schema changes to Supabase

# Type checking
npm run check        # TypeScript type check
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - free to use for educational purposes.

## 🙏 Credits

Developed with ❤️ for Vietnamese students.

---

**Made by Hai Nguyen** | [GitHub](https://github.com/hainguyenvie/personalizedmath)