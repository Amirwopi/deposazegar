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
├── admin/
│   ├── comments.php
│   └── admin.css
├── storage/.htaccess
└── assets/
    ├── css/style.css
    ├── js/main.js
    ├── images/
    └── fonts/
```

فایل `.htaccess` تولیدی نیز همراه artifact قرار می‌گیرد و برای Cache و فشرده‌سازی در هاست Apache/cPanel قابل استفاده است.

## راه‌اندازی پنل مدیریت نظرها

پس از اولین آپلود:

1. در تنظیمات File Manager نمایش فایل‌های مخفی را فعال کنید، سپس فایل `storage/.admin-setup-token` را باز و کد داخل آن را کپی کنید.
2. وارد `https://deposazegar.ir/admin/comments.php` شوید.
3. کد راه‌اندازی، نام کاربری دلخواه و یک رمز حداقل ۱۲ نویسه‌ای را وارد کنید.
4. پس از ساخت حساب، فایل کد راه‌اندازی خودکار حذف و رمز فقط به‌صورت Hash ذخیره می‌شود.

در پنل مدیریت می‌توانید نظرها را جست‌وجو، تأیید و منتشر، رد یا برای همیشه حذف کنید و رمز مدیر را تغییر دهید. پس از پنج ورود ناموفق، دسترسی آن IP برای ۱۵ دقیقه محدود می‌شود.

نظر تازه در `storage/comments.json` با وضعیت `pending` ذخیره می‌شود و تا زمان تأیید مدیر عمومی نیست. هنگام آپلود نسخه جدید، فایل‌های زنده `storage/comments.json` و `storage/admin.json` را حذف یا جایگزین نکنید.

اگر رمز مدیر فراموش شد، `storage/admin.json` را حذف کنید، یک Build تازه بگیرید و فقط فایل جدید `storage/.admin-setup-token` را آپلود کنید؛ سپس مراحل راه‌اندازی اولیه را تکرار کنید.

CSS و JavaScript عمومی با Hash نسخه‌گذاری می‌شوند؛ بنابراین بعد از انتشار جدید، مرورگر فایل قدیمی Cache‌شده را استفاده نمی‌کند.
