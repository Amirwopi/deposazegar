# راهنمای آپلود دپو سازگار روی هاست

برای انتشار سایت فقط **محتوای داخل** پوشه `public_html_ready/` را آپلود کنید. روی هاست به Node.js، npm، Terminal یا Tailwind نیاز نیست؛ برای فرم نظرها PHP 7.4 یا جدیدتر لازم است.

## مراحل آپلود در cPanel یا DirectAdmin

1. روی سیستم محلی دستور `npm run build` را اجرا کنید.
2. وارد File Manager هاست شوید.
3. پوشه `public_html` دامنه را باز کنید.
4. تمام محتوای داخل `public_html_ready/` را در `public_html` آپلود کنید.
5. مطمئن شوید `index.html` مستقیماً داخل `public_html` قرار گرفته، نه داخل یک پوشه اضافی.
6. SSL را فعال و ریدایرکت HTTP به HTTPS را تنظیم کنید.
7. آدرس `https://deposazegar.ir/sitemap.xml` را در Google Search Console ثبت کنید.
8. مطمئن شوید PHP اجازه ساخت فایل در پوشه `storage/` را دارد؛ معمولاً سطح دسترسی ۷۵۰ یا ۷۵۵ برای پوشه کافی است.
9. پس از تغییر favicon، صفحه اصلی را در URL Inspection برای بازخزیدن ارسال کنید.

ساختار نهایی روی هاست باید به این شکل باشد:

```text
public_html/
├── index.html
├── about.html
├── contact.html
├── سایر صفحات HTML
├── sitemap.xml
├── robots.txt
├── favicon.ico
├── favicon-96.png
├── apple-touch-icon.png
├── api/comments.php
├── storage/.htaccess
└── assets/
    ├── css/style.css
    ├── js/main.js
    ├── images/
    └── fonts/
```

فایل `.htaccess` تولیدی نیز همراه artifact قرار می‌گیرد و برای Cache و فشرده‌سازی در هاست Apache/cPanel قابل استفاده است.

## مدیریت نظر کاربران

نظر تازه در `storage/comments.json` با وضعیت `pending` ذخیره می‌شود و تا زمان تأیید عمومی نیست. برای انتشار:

1. در File Manager فایل `storage/comments.json` را باز کنید.
2. نظر موردنظر را بررسی کنید و مقدار `"status": "pending"` را به `"status": "approved"` تغییر دهید.
3. اطلاعات شخصی، توهین، تبلیغ یا محتوای نامرتبط را منتشر نکنید.

هنگام آپلود نسخه جدید، فایل زنده `storage/comments.json` را حذف یا جایگزین نکنید. پوشه سورس عمداً فایل خالی نظرها ندارد تا داده‌های ثبت‌شده در انتشار بعدی حفظ شوند.
