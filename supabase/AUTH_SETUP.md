# Hướng dẫn cấu hình Supabase cho đăng ký/đăng nhập bằng Username

## Cách hoạt động

- **Đăng ký**: User nhập Username + Password → Hệ thống tự tạo email giả `{username}@mathup.local`
- **Đăng nhập**: User nhập Username + Password → Hệ thống tìm email → Đăng nhập
- **Email giả**: Chỉ để Supabase hoạt động, user không cần biết

## Bước 1: Tắt Email Confirmation

1. Vào **Supabase Dashboard** → Chọn project
2. Vào **Authentication** → **Providers** → **Email**
3. **Tắt** option "Confirm email" (nếu có)
4. Click **Save**

> **Lưu ý**: Nếu không có option này, email confirmation có thể được xử lý ở mức độ khác. Hãy thử đăng ký và xem có nhận email không.

## Bước 2: Chạy Migration SQL

Mở **SQL Editor** trong Supabase Dashboard và chạy:

```sql
-- Migration: Add username support for login
-- Bảng user_profiles đã tồn tại, chỉ cần thêm những gì còn thiếu

-- 1. Thêm cột email nếu chưa có (để lưu email giả từ username)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- 2. Tạo index trên username để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- 3. Thêm UNIQUE constraint cho username nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_username_key'
    ) THEN
        ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- 4. Enable RLS (nếu chưa)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Xóa policies cũ nếu tồn tại rồi tạo mới
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow username lookup" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow public read" ON public.user_profiles;

-- 6. Tạo RLS Policies
-- Cho phép mọi người đọc (để check username khi đăng ký và login)
CREATE POLICY "Allow public read" ON public.user_profiles
    FOR SELECT USING (true);

-- Cho phép insert (khi đăng ký user mới chưa có auth.uid())
CREATE POLICY "Allow public insert" ON public.user_profiles
    FOR INSERT WITH CHECK (true);

-- User có thể update profile của mình
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 7. Function tự động tạo profile khi user mới đăng ký (cho Google OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, username, full_name, email, role, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'full_name',
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- 8. Trigger tự động tạo profile (xóa trigger cũ nếu có)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Function lấy email theo username (dùng cho login)
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_email TEXT;
BEGIN
    SELECT email INTO v_email
    FROM public.user_profiles
    WHERE LOWER(username) = LOWER(p_username);

    RETURN v_email;
END;
$$;
```

## Bước 3: Test

### Đăng ký bằng Username + Password
1. Đi đến `/signup`
2. Nhập: Họ tên, Username, Password, Vai trò, Lớp
3. Click "Đăng ký thành viên"
4. → Tự động đăng nhập và chuyển về trang chủ

### Đăng nhập bằng Username + Password
1. Đi đến `/login`
2. Nhập: Username (hoặc email), Password
3. Click "Đăng nhập"
4. → Chuyển về trang chủ

### Đăng nhập bằng Google
1. Click "Đăng nhập với Google"
2. → Chấp nhận trên Google
3. → Tự động tạo profile và chuyển về trang chủ

## Cấu trúc dữ liệu

### Bảng user_profiles

| Column | Type | Mô tả |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK đến auth.users (unique) |
| full_name | text | Họ tên đầy đủ |
| username | text | Tên đăng nhập (unique) |
| email | text | Email (giả: `username@mathup.local`) |
| role | text | student/teacher/parent |
| grade | text | Lớp học |
| avatar_url | text | URL avatar |

### Ví dụ dữ liệu

```
user_id: 550e8400-e29b-41d4-a716-446655440000
username: mathpro123
email: mathpro123@mathup.local
full_name: Nguyễn Văn A
role: student
grade: 5
```

## Lưu ý

- Username: 3-20 ký tự, chỉ chứa chữ cái thường, số, gạch dưới (_)
- Username không phân biệt hoa thường (case-insensitive)
- Password: tối thiểu 6 ký tự
- Email giả `{username}@mathup.local` chỉ dùng nội bộ, user không cần biết