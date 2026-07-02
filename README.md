# توسعه وب‌سایت دپو سازگار

این مخزن شامل سورس و ابزار Build وب‌سایت استاتیک «دپو سازگار» است. فایل‌های قابل انتشار فقط داخل `public_html_ready/` ساخته می‌شوند.

## نصب

```bash
npm install
```

## ساخت خروجی نهایی

```bash
npm run build
```

Build پوشه خروجی قبلی را پاک می‌کند، CSS فشرده را می‌سازد، ۲۰ صفحه HTML و Sitemap را تولید می‌کند، دارایی‌های لازم را کپی می‌کند و در پایان artifact نهایی را تست می‌کند.

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
- `public_html_ready/`: خروجی نهایی آماده هاست

## Source و Artifact

پوشه‌های `data/`، `scripts/` و `assets/` سورس توسعه‌اند و به Node.js نیاز دارند. پوشه `public_html_ready/` یک سایت استاتیک مستقل شامل HTML، CSS، JS، تصاویر، فونت‌ها، Sitemap و Robots است.

> `public_html_ready/` خروجی تولیدشده است و نباید دستی ویرایش شود. تغییرات را در سورس اعمال و دوباره `npm run build` اجرا کنید.

## اجرای محلی

پس از Build:

```bash
npm start
```

همچنین می‌توان `public_html_ready/index.html` را مستقیماً در مرورگر باز کرد.

راهنمای انتشار روی هاست در [README-hosting.md](README-hosting.md) قرار دارد.
