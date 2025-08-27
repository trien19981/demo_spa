## Hướng dẫn tích hợp và flow sử dụng Salesforce Interactions (Personalization)

Tài liệu này mô tả đầy đủ các bước để tích hợp và sử dụng Salesforce Interactions (PS/Personalization) trong dự án Nuxt 3, theo flow SPA (single-page application) giống như màn hình `sample/spa` trong repo.

### 1) Chuẩn bị
- **Tài khoản Salesforce Personalization** (trước đây là Interaction Studio / Evergage) và quyền tạo Campaign, Template, và Beacon.
- **Beacon Script** (đoạn `<script>` nhúng) hoặc thông tin để tải SDK `window.SalesforceInteractions` theo domain của bạn.
- Tạo project Nuxt 3 mới hoặc sử dụng project hiện tại.

### 2) Khởi tạo dự án Nuxt 3 (nếu bắt đầu từ đầu)
```bash
npm create nuxt@latest my-app
cd my-app
npm install
npm run dev
```

### 3) Cấu hình cơ bản trong Nuxt
- Bật SSR hoặc SPA đều được. Với PS, trang SPA cần "reinit" khi điều hướng nội bộ để PS nhận biết thay đổi màn hình.
- Tạo một plugin để nạp Beacon/SDK trên client.

Tạo file plugin, ví dụ: `app/plugins/salesforce-interactions.client.ts`:
```ts
export default defineNuxtPlugin(() => {
  if (process.server) return
  // 1) Chèn beacon của bạn (nếu dùng thẳng script) hoặc dùng <script> trong app.vue/head
  // 2) Sau khi script tải, SDK sẽ gắn vào window.SalesforceInteractions
})
```

Lưu ý: Ở dự án mẫu này, bạn có thể đặt thẳng beacon script vào `app/app.vue` hoặc `nuxt.config.ts` (useHead) miễn là chỉ chạy phía client.

Ví dụ tối giản (dùng useHead trong `app/app.vue`):
```ts
// app/app.vue (script setup)
useHead({
  script: [
    {
      src: 'https://<your-beacon-domain>/path/to/beacon.js',
      defer: true
    }
  ]
})
```

### 4) Định nghĩa vùng hiển thị (zones) cho PS
Trong template, tạo các container có `data-zone` để PS render nội dung khuyến nghị hoặc campaign:
```html
<div data-zone="ps-recommend-a" />
<div data-zone="ps-recommend-b" />
<div data-zone="ps-recommend-c" />
```

Trong repo này, các zone được đặt trực tiếp bên trong khung đề xuất ở `app/components/SpaTabs.vue` để sản phẩm hiển thị bên trong hộp.

### 5) Flow điều hướng SPA và reinit()
- Với SPA, khi người dùng đổi tab/route nội bộ, DOM thay đổi nhưng trang không reload, PS cần được báo hiệu để re-scan DOM.
- Gọi `window.SalesforceInteractions.reinit()` sau mỗi lần điều hướng nội bộ liên quan đến khu vực hiển thị PS.

Ví dụ (trích từ `SpaTabs.vue`):
```ts
const reinitSalesforceInteractions = () => {
  if (typeof window === 'undefined') return
  // @ts-expect-error global injected by beacon/PS
  const SI = window.SalesforceInteractions
  if (SI && typeof SI.reinit === 'function') {
    try { SI.reinit() } catch {}
  }
}

const setTab = (key) => {
  activeTab.value = key
  window.location.hash = `#${key}`
  reinitSalesforceInteractions()
}
```

Ngoài ra, lắng nghe sự kiện `hashchange` hoặc điều hướng router để gọi lại `reinit()` khi URL thay đổi:
```ts
window.addEventListener('hashchange', () => {
  reinitSalesforceInteractions()
})
```

### 6) Mapping zone với Campaign/Template trên Salesforce
1. Tạo Campaign trong Personalization.
2. Tạo Template/Content cho campaign và cấu hình để render vào các selector/zone tương ứng (`[data-zone="ps-recommend-a"]` ...).
3. Thiết lập tiêu chí hiển thị, audience, và thử nghiệm A/B nếu cần.
4. Publish campaign.

Khi trang của bạn tải và `reinit()` chạy, PS sẽ tra DOM theo selector/zone và render nội dung đã cấu hình.

### 7) Kiểm thử tích hợp
- Mở DevTools, kiểm tra `window.SalesforceInteractions` đã tồn tại.
- Quan sát network xem beacon/SDK được nạp thành công.
- Thay đổi tab hoặc route trong SPA, xác nhận sản phẩm/khuyến nghị render lại bên trong zone.

### 8) Ghi chú về SSR, bảo mật, và hiệu năng
- Chỉ tải beacon/SDK ở client. Tránh chạy trên server (SSR) để không gây lỗi.
- Dùng thuộc tính `defer` hoặc `async` cho script để không chặn render.
- Bao vùng hiển thị trong khung có `overflow: auto` để tránh giãn layout khi render nhiều sản phẩm.

### 9) Xử lý lỗi và fallback
- Bọc `SI.reinit()` trong `try/catch` để không làm hỏng UX nếu SDK tạm thời lỗi.
- Có thể hiển thị placeholder mặc định khi chưa có nội dung từ PS.

### 10) Quy trình tóm tắt từ lúc tạo dự án
1. Tạo dự án Nuxt 3 và chạy dev.
2. Chèn beacon/SDK PS (qua `useHead` hoặc plugin client).
3. Tạo các zone `data-zone` tại nơi muốn hiển thị.
4. Cài đặt luồng SPA: gọi `reinit()` sau mỗi lần điều hướng/tab change.
5. Tạo/Pub campaign và map selector tới zone tương ứng trong PS.
6. Kiểm thử, theo dõi log, đảm bảo nội dung render đúng vị trí.

Tham khảo thực thi trong dự án: `app/components/SpaTabs.vue`.


