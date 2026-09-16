# v-ai.jp — VNEXT AI Platform Landing Page

Landing page tổng cho 3 sản phẩm **V-Brain · V-Kaimei · CAD Check**, dựng theo
artboard **1a** ("Trang đầy đủ — hero 3 cột") trong `V-AI Landing.dc.html`
(Claude Design project `d57fccc2`).

Static HTML/CSS/JS thuần — không cần build, không dependency.

## Cấu trúc

```
index.html          Toàn bộ nội dung trang (JP)
assets/styles.css   Design tokens + layout + responsive
assets/main.js      Mobile nav, scroll reveal, form handler
assets/vnext/       Logo chính chủ VNEXT (copy từ skill vnext-ui)
assets/i18n.js      Từ điển 3 ngôn ngữ
assets/img/         Ảnh minh hoạ 3 sản phẩm (webp + png)
```

## Logo

Header và footer dùng logo chính chủ từ skill `vnext-ui`, không vẽ lại:

- Header (nền sáng): `vnext-logo-horizontal.svg`, cao 28px
- Footer (nền tối): `vnext-logo-horizontal-light.svg`, cao 26px
- Favicon: `vnext-favicon-64.png` / `vnext-favicon-180.png`

Slogan **Beyond IT, for a Better Tomorrow** đặt ngay dưới logo (xếp dọc) để
tiết kiệm bề ngang cho thanh điều hướng; ẩn ở màn hình ≤ 1180px. Luật dùng logo: xem `references/logo.md` của skill —
giữ tỉ lệ (`height` + `width:auto`), không viền, không đổ bóng, không đổi màu.

## Chạy local

```bash
python -m http.server 4321
```

Mở http://127.0.0.1:4321

## Deploy (Vercel)

```bash
vercel deploy --prod
```

Thư mục gốc là static site, Vercel tự nhận — không cần cấu hình thêm.

## Các chỗ cần hoàn thiện

| Mục | Vị trí | Việc cần làm |
|---|---|---|
| Form liên hệ | `assets/main.js` | Nối API gửi mail / form service; hiện chỉ validate client-side rồi báo "chưa cấu hình" |
| 会社概要 | `#company` | Bổ sung 所在地・設立・代表者・電話番号 khi có thông tin chính thức |
| Privacy policy | footer + form note | Link đang là `#` |
| OG image | `assets/img/og-image.png` | Chưa có file |

## Ảnh minh hoạ sản phẩm

Ba card dùng `<picture>`: trình duyệt lấy WebP, `.png` là bản dự phòng.

| File | WebP | PNG |
|---|---|---|
| `assets/img/shot-brain.*` | 19 KB | 304 KB |
| `assets/img/shot-kaimei.*` | 23 KB | 312 KB |
| `assets/img/shot-cad.*` | 33 KB | 349 KB |

Kích thước gốc 800×500 (tỉ lệ 8:5), hiển thị ở 356×218 nên vẫn nét trên màn
Retina. Bản gửi tới ~1.1 MB mỗi ảnh đã được thu nhỏ và nén lại — đừng ghi đè
bằng file gốc chưa xử lý.

Thay ảnh khác: giữ đúng tỉ lệ 8:5, xuất cả `.webp` và `.png` cùng tên, rồi cập
nhật khoá `brain.alt` / `kaimei.alt` / `cad.alt` trong `i18n.js` cho cả ba ngôn ngữ.

## Ba ngôn ngữ

日本語 (mặc định) · English · Tiếng Việt.

- Từ điển: [assets/i18n.js](assets/i18n.js) — 113 khoá × 3 ngôn ngữ, nhúng thẳng
  bằng `<script>` nên không cần `fetch`, không nháy chữ khi tải.
- Bộ chọn là **một nút** (icon quả địa cầu + mã ngôn ngữ) mở ra danh sách
  日本語 / English / Tiếng Việt. Đóng bằng `Esc` hoặc bấm ra ngoài. Ở màn hình
  ≤ 980px JS chuyển nút vào trong menu hamburger, vùng chạm 44px.
- Đánh dấu trong HTML: `data-i18n` (text), `data-i18n-html` (có thẻ con như
  `<em>`, `<br>`, link), `data-i18n-ph` (placeholder), `data-i18n-aria`,
  `data-i18n-content` (thẻ meta).
- Khi đổi: cập nhật luôn `<title>`, meta description, `<html lang>`, nhãn ARIA;
  lưu lựa chọn vào `localStorage`; lần đầu tự đoán theo `navigator.language`.
- Không dịch: tên sản phẩm, khẩu hiệu thương hiệu, các dòng chữ English thuộc
  nhận diện (`PEOPLE TECHNOLOGY…`, `One Platform…`, `VNEXT AI Platform`,
  `01 VALUE`…).

Thêm chuỗi mới: đặt khoá vào cả ba ngôn ngữ trong `i18n.js`, rồi gắn
`data-i18n="khoá"` vào phần tử. Thiếu khoá thì phần tử giữ nguyên chữ gốc trong HTML.

Chiều cao 3 card được `main.js` đo và cân lại sau mỗi lần đổi ngôn ngữ — độ dài
chữ mỗi thứ tiếng khác nhau nên không thể khoá cứng theo số dòng.

## Chuyển động

Theo ngân sách trong `references/effects.md` của skill `vnext-ui`:

| Hiệu ứng | Chi tiết |
|---|---|
| Nền chuyển động | **1 vùng duy nhất** — quầng sáng `.hero__aura` trôi 26s ở hero |
| Vào màn | `slide-up` 350ms, stagger 60ms, tối đa 6 bậc mỗi cụm |
| Header | Đổ bóng nhẹ khi rời đỉnh trang |
| Điều hướng | Gạch chân mục đang xem, tính theo vị trí cuộn |
| Hover | Card nâng 4px + logo sản phẩm phóng 1.05 + ô capture đổ bóng + CTA ấm lên; STEP mọc vạch xanh; FAQ sáng nền + dấu Q nhích; nút nhấc 1px; link footer mọc gạch chân |
| Bấm | Nút và CTA lún 1px (`:active`) |

Toàn bộ hover nằm trong `@media (hover:hover) and (pointer:fine)` nên máy cảm ứng
không bị kẹt trạng thái; `@media (hover:none)` tắt hiệu ứng nhấc.

Hiệu ứng vào màn dùng thuộc tính `translate`/`scale` riêng, **không dùng**
`transform` — nếu dùng chung thì `.reveal.is-in{transform:none}` sẽ triệt tiêu
mọi `transform` khi hover trên cùng phần tử.

Token thời lượng/easing nằm ở `:root` trong `styles.css` (`--dur-fast` 150ms,
`--dur` 250ms, `--dur-slow` 350ms, `--ease-spring`). Không có animation lặp vô
tận trên nội dung — chỉ nền hero. `prefers-reduced-motion: reduce` tắt toàn bộ.

Nội dung không phụ thuộc JS: class `.js` được gắn trong `<head>`, nếu JS lỗi thì
mọi phần tử `.reveal` hiện bình thường thay vì ẩn vĩnh viễn.

## Design tokens

Navy `#0a2550` · Blue `#1e63d6` · V-Brain `#0a3d91` · V-Kaimei `#c2410c` ·
CAD Check `#15803d` · Font: Noto Sans JP + Space Grotesk.
