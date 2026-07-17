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

Build پوشه خروجی قبلی را پاک می‌کند، CSS فشرده را می‌سازد، ۲۴۵ صفحه HTML و Sitemap split (index + 4 child) را تولید می‌کند، faviconهای ریشه، endpoint نظرها و دارایی‌های لازم را کپی می‌کند و در پایان artifact نهایی را تست می‌کند.

## تست

```bash
npm test
```

تست فقط `public_html_ready/` را بررسی می‌کند؛ بنابراین پیش از اجرای مستقل تست، یک‌بار Build را اجرا کنید.

## ساختار URL و SEO

- **Clean URL**: همه ۲۴۵ صفحه با URL بدون پسوند `.html` سرو می‌شوند (مانند `/container-storage`، `/pricing`، `/location/west-tehran`، `/ejare-anbar-tehran`). فایل‌ها روی دیسک با `.html` ذخیره می‌شوند اما `mod_rewrite` آن‌ها را بدون پسوند سرو می‌کند.
- **Blanket 301 redirect**: هر درخواست مستقیم برای `*.html` با 301 به URL بدون پسوند هدایت می‌شود (در `.htaccess` با `%{THE_REQUEST}` برای جلوگیری از تداخل با `mod_rewrite` داخلی).
- **301 Redirect اسلاگ‌های قدیمی**: ۷ اسلاگ قدیمی فارسی با 301 به URLهای clean جدید هدایت می‌شوند (در `.htaccess`).
- **`/index.html` → `/` redirect**: درخواست مستقیم `/index.html` با 301 به ریشه `/` هدایت می‌شود (در `.htaccess` با `%{THE_REQUEST}` برای جلوگیری از حلقه با `DirectoryIndex`). این رفع مشکل duplicate-canonical در GSC است.
- **Canonical trailing slash**: canonical صفحه اصلی `https://deposazegar.com/` (با اسلش انتهایی) است، نه `https://deposazegar.com` بدون اسلش.
- **mod_rewrite**: URLهای clean بدون پسوند `.html` سرو می‌شوند.
- **Sitemap split**: `sitemap.xml` به‌صورت index با 4 child sitemap است (`sitemap-pages.xml`، `sitemap-services.xml`، `sitemap-locations.xml`، `sitemap-posts.xml`). فرمت `<lastmod>` از نوع W3C datetime با timezone تهران (`+03:30`) است و `<priority>` یا `<changefreq>` استفاده نمی‌شود.
- **Schema markup**: `LocalBusiness` فقط در صفحه اصلی و تماس قرار دارد. `Organization`، `WebSite`، `Service`، `FAQPage` و `BreadcrumbList` در همه صفحات وجود دارد. `priceRange` در `LocalBusiness` و `Service` (صفحات خدماتی) گنجانده شده است.
- **دایرکتوری `location/`**: صفحات منطقه‌ای با clean URL در زیردایرکتوری `location/` قرار می‌گیرند.
- **لینک‌سازی داخلی اختصاصی هر منطقه**: هر یک از ۶ صفحه منطقه (غرب/شرق/شمال/مرکز/جنوب تهران + کرج) آرایه `links` مخصوص خود را دارد که به صفحات محله و منطقه همان جهت اشاره می‌کند. این باعث می‌شود هر صفحه منطقه لینک‌های یکتا داشته باشد و Google آن‌ها را به‌عنوان صفحات متمایز شناسایی کند.
- **Cross-link تهران ↔ کرج**: صفحه خدماتی `ejare-anbar-tehran` به صفحه `ejare-anbar-karaj` لینک می‌دهد تا canonical تکراری رفع شود.
- **Google Analytics 4**: کد ردیابی GA4 (`G-S1LTRCP1GH`) در `<head>` همه ۲۴۵ صفحه تزریق می‌شود. Property ID: `546001761`.
- **متادیتای پویای صفحات محلی**: عنوان و توضیحات متای صفحات محله و منطقه به‌صورت پویا از داده پروفایل تولید می‌شود. الگوی عنوان: `اجاره انبار در [نام محله] [شهر] + قیمت کانتینر و اتاقک | دپو سازگار`. توضیحات متا بین ۱۴۰ تا ۱۶۰ کاراکتر با اشاره به محدوده، امنیت ۲۴ ساعته و CTA تماس.

## ساختار پروژه

- `data/`: اطلاعات و محتوای صفحات
- `assets/image-new/`: تصاویر خام ورودی برای ساخت نسخه‌های استاندارد JPG/WebP، تصویر پشتیبانی و favicon VIP
- `scripts/generate-pages.js`: تولید HTML و Sitemap
- `scripts/process-assets.js`: بهینه‌سازی تصاویر
- `scripts/clean.js`: پاک‌سازی و ساخت پوشه خروجی
- `scripts/copy-assets.js`: انتقال دارایی‌های مجاز
- `scripts/seo-audit.js`: نقطه ورود تست artifact
- `scripts/validate-site.js`: قواعد کامل ممیزی
- `assets/css/input.css`: سورس CSS
- `assets/js/main.js`: سورس JavaScript
- `server/api/comments.php`: endpoint ثبت و دریافت نظرهای تأییدشده
- `server/admin/comments.php`: پنل ورود و مدیریت کامل نظرها
- `server/admin/admin.css`: رابط مستقل پنل مدیریت
- `server/storage/.htaccess`: جلوگیری از دسترسی مستقیم به فایل نظرها
- `public_html_ready/`: خروجی نهایی آماده هاست (شامل زیردایرکتوری `location/` برای صفحات منطقه‌ای با clean URL)
- `.htaccess`: قواعد rewrite شامل HTTPS/non-www redirect، 301 اسلاگ‌های قدیمی به clean URL و سرو فایل‌های `.html` بدون پسوند
- `Changelog.md`: تاریخچه تغییرات پروژه

## Source و Artifact

پوشه‌های `data/`، `scripts/`، `assets/` و `server/` سورس توسعه‌اند و Build محلی به Node.js نیاز دارد. خروجی `public_html_ready/` شامل HTML، CSS، JS، تصاویر، فونت‌ها، Sitemap، Robots و endpoint PHP نظرها است.

> `public_html_ready/` خروجی تولیدشده است و نباید دستی ویرایش شود. تغییرات را در سورس اعمال و دوباره `npm run build` اجرا کنید.

## اجرای محلی

پس از Build:

```bash
npm start
```

برای دیدن صفحات می‌توان از `npm start` استفاده کرد. ثبت و نمایش نظرها فقط روی هاستی که PHP را اجرا می‌کند فعال است.

نام فایل CSS و JavaScript در HTML با Hash محتوای Build نسخه‌گذاری می‌شود تا پس از انتشار، Cache قدیمی باعث نمایش ناقص رابط یا اجرای کد قبلی نشود. صفحات خدمات آماده‌سازی شامل بسته‌بندی، حمل‌ونقل و چیدمان از `data/pages.json` و `data/page-content.js` تولید می‌شوند و در Sitemap دامنه `deposazegar.com` قرار می‌گیرند.

راهنمای انتشار روی هاست در [README-hosting.md](README-hosting.md) قرار دارد.
