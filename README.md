# EdTech Open Day 2025 — Landing Page

Trang web giới thiệu sự kiện Open Day của CLB EdTech.
Dark theme · Frosted Glass UI · Fully responsive · Zero dependencies.

---

## 📁 Cấu trúc thư mục

```
edtech-openday/
├── index.html                  ← Trang chính (duy nhất)
├── assets/
│   ├── css/
│   │   ├── main.css            ← Reset, variables, layout, animations
│   │   └── components.css      ← Tất cả components (nav, cards, buttons...)
│   ├── js/
│   │   └── main.js             ← Countdown, scroll reveal, FAQ, form
│   ├── images/                 ← Thêm ảnh vào đây
│   │   ├── hero-photo.jpg      ← Ảnh hero phải (330×375px)
│   │   ├── og-cover.jpg        ← Open Graph cover (1200×630px)
│   │   ├── favicon.svg         ← Favicon
│   │   ├── act-1.jpg           ← Ảnh hoạt động 1–4
│   │   ├── act-2.jpg
│   │   ├── act-3.jpg
│   │   ├── act-4.jpg
│   │   ├── prog-1.jpg          ← Ảnh chương trình 1–3
│   │   ├── prog-2.jpg
│   │   ├── prog-3.jpg
│   │   ├── speaker-1.jpg       ← Ảnh diễn giả (vuông, tối thiểu 128×128px)
│   │   ├── speaker-2.jpg
│   │   ├── speaker-3.jpg
│   │   ├── speaker-4.jpg
│   │   ├── gallery-1.jpg       ← Ảnh gallery sự kiện
│   │   ├── gallery-2.jpg
│   │   ├── gallery-3.jpg
│   │   ├── gallery-4.jpg
│   │   ├── gallery-5.jpg
│   │   ├── video-thumb-main.jpg← Thumbnail video chính (16:9)
│   │   ├── video-thumb-2.jpg
│   │   └── video-thumb-3.jpg
│   └── videos/                 ← (tuỳ chọn) video self-hosted
└── README.md
```

---

## ✏️ Hướng dẫn thay nội dung

Tất cả chỗ cần thay đều được đánh dấu `<!-- THAY: ... -->` trong `index.html`.

### Thông tin cơ bản
| Chỗ cần thay | Tìm dòng |
|---|---|
| Tên CLB / sự kiện | `EduVerse`, `EDTECH OPEN DAY 2025` |
| Slogan hero | `KẾT NỐI TRI THỨC / KIẾN TẠO TƯƠNG LAI` |
| Ngày, giờ, địa điểm | phần `hero__meta` |
| Ngày đếm ngược | `main.js` → dòng `EVENT_DATE` |
| Số liệu stats | `stats-band__inner` |
| Email liên hệ | footer |

### Thay ảnh
Uncomment các dòng `<img>` trong HTML và thêm ảnh vào `assets/images/`.

```html
<!-- Ví dụ: hero visual -->
<div class="hero__visual">
  <img src="assets/images/hero-photo.jpg" alt="Hội trường sự kiện" />
  <div class="hero__scan"></div>
</div>

<!-- Ví dụ: speaker avatar -->
<div class="speaker-card__avatar speaker-card__avatar--1">
  <img src="assets/images/speaker-1.jpg" alt="Nguyễn Hoàng" />
</div>
```

### Video YouTube
Thay `data-video-id` trong các `.recap-card`:
```html
<div class="recap-card recap-card--main" data-video-id="YOUR_VIDEO_ID">
```

### Form đăng ký
Dùng [Formspree](https://formspree.io) (miễn phí):
```html
<form class="cta-box__form" action="https://formspree.io/f/YOUR_ID" method="POST">
```

---

## 🚀 Deploy

### GitHub Pages
```bash
# 1. Tạo repo trên GitHub
# 2. Push code lên
git init
git add .
git commit -m "init: EdTech Open Day landing page"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# 3. Vào Settings → Pages → Source: main branch → /root
# 4. URL: https://USERNAME.github.io/REPO/
```

### Netlify (kéo thả — đơn giản nhất)
1. Vào [netlify.com](https://netlify.com) → **Add new site → Deploy manually**
2. Kéo thả **toàn bộ thư mục** `edtech-openday/` vào
3. Xong — có URL ngay lập tức

### Vercel
```bash
npm i -g vercel
cd edtech-openday
vercel
```

---

## 🎨 Tuỳ chỉnh màu sắc

Mở `assets/css/main.css` → sửa phần `:root`:

```css
:root {
  --indigo:  #5B6AF5;   /* màu chủ đạo — thay thành màu CLB */
  --violet:  #A78BFA;   /* màu phụ */
  --cyan:    #22D3EE;   /* accent xanh */
  --emerald: #34D399;   /* accent xanh lá */
}
```

---

## 📦 Không cần cài đặt gì
- Không có `node_modules`
- Không có build step
- Chỉ cần trình duyệt là xem được
- Font load từ Google Fonts (cần internet)
