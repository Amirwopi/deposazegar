# راهنمای آپلود دپو سازگار روی هاست

برای انتشار سایت فقط **محتوای داخل** پوشه `public_html_ready/` را آپلود کنید. روی هاست به Node.js، npm، Terminal، Tailwind یا هیچ Build Command دیگری نیاز نیست.

## مراحل آپلود در cPanel یا DirectAdmin

1. روی سیستم محلی دستور `npm run build` را اجرا کنید.
2. وارد File Manager هاست شوید.
3. پوشه `public_html` دامنه را باز کنید.
4. تمام محتوای داخل `public_html_ready/` را در `public_html` آپلود کنید.
5. مطمئن شوید `index.html` مستقیماً داخل `public_html` قرار گرفته، نه داخل یک پوشه اضافی.
6. SSL را فعال و ریدایرکت HTTP به HTTPS را تنظیم کنید.
7. آدرس `https://deposazegar.ir/sitemap.xml` را در Google Search Console ثبت کنید.

ساختار نهایی روی هاست باید به این شکل باشد:

```text
public_html/
├── index.html
├── about.html
├── contact.html
├── سایر صفحات HTML
├── sitemap.xml
├── robots.txt
└── assets/
    ├── css/style.css
    ├── js/main.js
    ├── images/
    └── fonts/
```

فایل `.htaccess` تولیدی نیز همراه artifact قرار می‌گیرد و برای Cache و فشرده‌سازی در هاست Apache/cPanel قابل استفاده است.
