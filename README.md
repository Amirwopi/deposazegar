# توسعه وب‌سایت دپو سازگار

این مخزن شامل سورس و ابزار Build وب‌سایت «دپو سازگار» است. صفحات اصلی به‌صورت استاتیک تولید می‌شوند و ثبت نظر کاربران یک endpoint کوچک PHP دارد. فایل‌های قابل انتشار فقط داخل `public_html_ready/` ساخته می‌شوند.

## نصب

```bash
npm install
```

## ساخت خروجی نهایی

```bash
npm run build
```

Build پوشه خروجی قبلی را پاک می‌کند، CSS فشرده را می‌سازد، ۲۱ صفحه HTML و Sitemap را تولید می‌کند، faviconهای ریشه، endpoint نظرها و دارایی‌های لازم را کپی می‌کند و در پایان artifact نهایی را تست می‌کند.

## تست

```bash
npm test
```

تست فقط `public_html_ready/` را بررسی می‌کند؛ بنابراین پیش از اجرای مستقل تست، یک‌بار Build را اجرا کنید.

## ساختار پروژه

- `data/`: اطلاعات و محتوای صفحات
- `scripts/generate-pages.js`: تولید HTML و Sitemap
- `scripts/process-assets.js`: بهینه‌سازی تصاویر
- `scripts/clean.js`: پاک‌سازی و ساخت پوشه خروجی
- `scripts/copy-assets.js`: انتقال دارایی‌های مجاز
- `scripts/seo-audit.js`: نقطه ورود تست artifact
- `scripts/validate-site.js`: قواعد کامل ممیزی
- `assets/css/input.css`: سورس CSS
- `assets/js/main.js`: سورس JavaScript
- `server/api/comments.php`: endpoint ثبت و دریافت نظرهای تأییدشده
- `server/storage/.htaccess`: جلوگیری از دسترسی مستقیم به فایل نظرها
- `public_html_ready/`: خروجی نهایی آماده هاست

## Source و Artifact

پوشه‌های `data/`، `scripts/`، `assets/` و `server/` سورس توسعه‌اند و Build محلی به Node.js نیاز دارد. خروجی `public_html_ready/` شامل HTML، CSS، JS، تصاویر، فونت‌ها، Sitemap، Robots و endpoint PHP نظرها است.

> `public_html_ready/` خروجی تولیدشده است و نباید دستی ویرایش شود. تغییرات را در سورس اعمال و دوباره `npm run build` اجرا کنید.

## اجرای محلی

پس از Build:

```bash
npm start
```

برای دیدن صفحات می‌توان از `npm start` استفاده کرد. ثبت و نمایش نظرها فقط روی هاستی که PHP را اجرا می‌کند فعال است.

راهنمای انتشار روی هاست در [README-hosting.md](README-hosting.md) قرار دارد.
