# Dogfood Report: دپو سازگار

| Field | Value |
|---|---|
| Date | 2026-07-01 |
| App URL | http://127.0.0.1:4173 |
| Session | depo-qa |
| Scope | صفحه اصلی در دسکتاپ و موبایل، منوی موبایل، صفحه کانتینر ۲۰ فوت، FAQ و صفحه تماس |

## Summary

| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |
| **Total** | **0** |

## Checks Passed

- صفحه اصلی در عرض‌های ۱۲۸۰ و ۳۹۰ پیکسل بدون شکست چیدمان نمایش داده شد.
- منوی موبایل باز شد، `aria-expanded` و برچسب دکمه تغییر کرد و با Escape بسته شد.
- دکمه‌های ثابت تماس و واتساپ در موبایل قابل مشاهده و قابل دسترس بودند.
- صفحه کانتینر ۲۰ فوت در موبایل بدون خطای کنسول یا درخواست ناموفق بارگذاری شد.
- FAQ با کلیک باز شد و وضعیت `details.open` برابر `true` شد.
- صفحه تماس ۹ شماره و ۵ FAQ نمایش داد.
- در صفحات بررسی‌شده خطای JavaScript یا پیام کنسول مشاهده نشد.

## Evidence

- `screenshots/home-desktop.png`
- `screenshots/home-mobile.png`
- `screenshots/mobile-menu-open.png`
- `screenshots/container-20-mobile.png`
- `screenshots/contact-desktop.png`
