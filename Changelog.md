# Changelog

## 2026-07-18 — Ahrefs Site Audit Fixes (P1/P2/P3)

### P1 — Critical 404 Fixes (commit `2b4259f`)
- Added `absPath()` helper to `generate-pages.js` for absolute path generation
- Converted all internal links from relative to absolute `/`-prefixed paths across `picture()`, `pageHref()`, `localSizesLinks()`, `relatedLinks()`, `directoryLinkList()`, `breadcrumbTrail()`, nav links, HTML template preloads, brand image, script tag, and content function inline hrefs
- Fixed 47 broken `href` attributes (missing closing quotes)
- Fixed `data/local-seo.js` `parentHref` values to absolute paths
- Updated `scripts/validate-site.js` regexes to match `/assets/...` absolute paths
- Build verified: 245 pages, 5 sitemaps, 0 warnings (was 5521 broken local reference warnings)

### P2 — Warning Fixes (commit `a148e91`)
- **Alt text**: Added non-empty alt text to all 975 `img` tags across 245 pages (was 494 empty)
  - `brand-mark.svg` logos: `alt="لوگوی دپو سازگار"`
  - Homepage hero: `alt="انبار شخصی برای دپو لوازم خانه در تهران"`
  - `server/admin/comments.php`: 3 logo images fixed
  - `data/local-seo.js`: alt text for local page images
- **Long titles**: Shortened 4 titles in `data/pages.json` (71→48, 67→53, 66→52, 66→52 chars) by removing redundant `| دپو سازگار` suffix; refactored `data/local-seo.js` title templates with conditional length logic (drops `+ قیمت کانتینر و اتاقک` when > 60 chars)
- **3XX redirects**: Verified resolved — 0 internal links point to `.html` URLs; sitemaps use clean URLs

### P3 — Notice Fixes (commit `720898e`)
- **JSON-LD schema validation**:
  - `Organization`/`LocalBusiness` `telephone`: array → string (Schema.org spec requires `Text`, not array)
  - Removed `SearchAction` from `WebSite` schema (site has no search page)
  - All 9 phone numbers remain in `contactPoint` array
- **Validator**: Phone appearance threshold 4 → 3 (telephone field no longer holds all numbers)
- **HTTP→HTTPS links**: Verified resolved — 0 `http://` internal links found
- **Orphan internal links**: Verified resolved — no real orphans (homepage linked from 241 pages via `/`)
- **IndexNow**: Added key file `7e011271f48ceca10963307f87c64a7b.txt` and `scripts/submit-indexnow.js` for post-deployment URL submission

### P3 — Internal Linking Fixes (commit pending)
- **WhatsApp 302 → 200**: Changed `whatsappButton()` in `generate-pages.js` from `wa.me` (302 redirect) to `api.whatsapp.com/send/?phone=...` (direct 200); updated `validate-site.js` regex to match
- **`localSizesLinks()` expansion**: Added 15-foot and 30-foot container links to all local/district pages (was missing); `ejare-container-15-foot` now has 213 inlinks, `ejare-container-30-foot` has 212
- **`boland-moddat` cross-links**: Added `ejare-anbar-boland-moddat` link to `asbabkeshi`, `commercial-storage`, and `kootah-moddat` service pages; `boland-moddat` now has 4 inlinks (was 1)
- **Bidirectional `nearby` links**: Added reverse-nearby pass in `data/local-seo.js` so if page A lists B as nearby, B also links back to A; all phase-two local pages now have 5–8 inlinks (was 1)
- **5 Karaj phase-two pages**: Added `chaharbagh`, `kalak`, `rajai-shahr`, `shahin-vila`, `shahrak-vahdat` to nearby arrays of geographically close phase-one Karaj pages (`mehrshahr`, `baghestan`, `gohardasht`, `golshahr`, `fardis`); all 5 now have 2 inlinks (was 1)
- **Final sweep**: 0 pages with <2 incoming internal links (was 8 pages)

### Post-Deployment Steps
1. Deploy `public_html_ready/` to live site
2. Run `node scripts/submit-indexnow.js` to submit all 245 URLs to IndexNow
3. Trigger Ahrefs re-crawl to verify 100% health score

## 2026-07-17 — Phase 2: Clean URLs & Dynamic Meta Tags

### Added
- **Blanket 301 redirect** in `.htaccess`: any direct `*.html` request is 301-redirected to its clean URL (using `%{THE_REQUEST}` to avoid interfering with internal `mod_rewrite`)
- **Dynamic meta tag templates** for local/district pages:
  - Title: `اجاره انبار در [name] [city] + قیمت کانتینر و اتاقک | دپو سازگار`
  - Description: `اجاره انبار وسایل منزل یا کالا در محدوده [name]؟ کانتینرهای اختصاصی دپو سازگار در نزدیک‌ترین شعبه با امنیت ۲۴ ساعته و نگهبانی. همین حالا تماس بگیرید.` (140–160 chars for all 217 location pages)

### Changed
- **All internal links** across `generate-pages.js`, `data/page-content.js`, `data/phase-two-services.js`, and `data/local-seo.js` (parentHref values) updated to clean URLs — zero `.html` extensions in any `href`, canonical, or sitemap `<loc>`
- `canonicalUrl()` and `pageHref()` in `generate-pages.js`: return clean URLs (no `.html`) for all 245 pages
- `pageCanonicalUrl()` in `validate-site.js`: returns clean URLs (no `.html`)
- Internal link filter in `validate-site.js`: detects clean internal paths (no protocol, no leading slash, no dot, no `assets/` prefix) instead of matching `.html` endings
- Report text in `validate-site.js`: all `.html` references updated to clean URLs
- README.md: updated Clean URL section to reflect all 245 pages now use clean URLs, added blanket 301 and dynamic meta tag documentation

### Verified
- 245 pages generated, all validation passing
- Zero `.html` in internal links, canonicals, or sitemaps in `public_html_ready/`
- Meta description lengths: 146–158 chars for all 217 location pages (within 140–160 target)

## 2026-07-17 — GSC Coverage Report Fixes

### Added
- `/index.html` → `/` 301 redirect in `.htaccess` (using `%{THE_REQUEST}` to avoid loop with `DirectoryIndex`)
- Location-specific `links` arrays in all 6 `locationProfiles` entries in `data/page-content.js`:
  - West Tehran: links to سعادت‌آباد, چیتگر, regions 2/5/22, Tehran guide, container-storage, contact
  - East Tehran: links to تهرانپارس, پاسداران, regions 4/8/13, Tehran guide, home-appliances, contact
  - North Tehran: links to اقدسیه, ونک, پاسداران, regions 1/3, Tehran guide, container-storage, contact
  - Central Tehran: links to regions 6/7/11/12, Tehran guide, home-appliances, contact
  - South Tehran: links to regions 16/18/19/20, Tehran guide, container-storage, contact
  - Karaj: links to عظیمیه کرج, Karaj regions 1/3/4/5, Tehran guide, container-storage, contact
- `ejare-anbar-karaj.html` link added to `ejare-anbar-tehran` service profile `links` array (cross-linking to fix duplicate canonical)

### Changed
- `canonicalUrl()` in `generate-pages.js` line 139: now returns `baseSiteUrl + '/'` (with trailing slash) for index page — was returning `baseSiteUrl` without slash
- `locationContent()` template in `generate-pages.js`: now uses `profile.links || [default links]` instead of hardcoded `relatedLinks` array — each location page renders its own unique set of internal links
- `pageCanonicalUrl()` in `validate-site.js` line 30: updated to return `https://deposazegar.com/` (with trailing slash) for index page to match new canonical
- Karaj location profile `audience` field expanded to include فردیس, مهرشهر, گوهردشت, جهانشهر, عظیمیه

### Fixed
- **`/index.html` duplicate canonical** (GSC: "Alternate page with proper canonical tag"): 301 redirect now resolves `/index.html` → `/`
- **Home page canonical missing trailing slash**: canonical now `https://deposazegar.com/` instead of `https://deposazegar.com`
- **`ejare-anbar-karaj.html` duplicate canonical** (GSC: "Duplicate, Google chose different canonical"): Karaj page now has unique location-specific links to Karaj district/neighborhood pages, differentiating it from Tehran page; Tehran service page now links to Karaj page
- **Low internal linking on location pages** (GSC: "Discovered/Crawled - currently not indexed"): each location page now has 8 location-specific internal links instead of 5 identical generic links

## 2026-07-17 — Information Architecture Restructure

### Added
- Clean URL mapping for 7 key pages: `container-storage`, `home-appliances-storage`, `commercial-storage`, `pricing`, `location/west-tehran`, `location/east-tehran`, `location/south-tehran`
- Split sitemap structure: `sitemap.xml` index pointing to 4 child sitemaps (`sitemap-pages.xml`, `sitemap-services.xml`, `sitemap-locations.xml`, `sitemap-posts.xml`)
- W3C datetime `<lastmod>` format with Tehran timezone (`+03:30`) in all sitemap entries
- `priceRange` field in `LocalBusiness` schema (`از ۵۰۰٬۰۰۰ تومان ماهانه`)
- `priceRange` field in `Service` schema on service-type pages
- 301 redirects in `.htaccess` for all 7 old Persian slugs → new clean URLs
- Clean URL rewrite rule in `.htaccess` (mod_rewrite serves `.html` files without extension)
- `location/` subdirectory in output for location-type clean URL pages
- `cleanUrlMap`, `pageFilePath()`, and `pageCanonicalUrl()` helpers in both `generate-pages.js` and `validate-site.js`
- "ساختار URL و SEO" section in README.md documenting the new architecture

### Changed
- `canonicalUrl()` and `pageHref()` in `generate-pages.js` now return clean URLs for mapped slugs
- `breadcrumbTrail()` uses `pageHref(page.slug)` instead of inline `${page.slug}.html`
- `schemaGraph()`: `LocalBusiness` now conditional — only emitted on `index` and `contact` pages (was on every page)
- Sitemap generation replaced: old flat `<urlset>` with `<priority>`/`<changefreq>` removed; new index + 4 children with W3C datetime lastmod, no priority/changefreq
- Output path logic in `generate-pages.js` creates subdirectories via `fs.mkdirSync({recursive:true})` for `location/` pages
- `validate-site.js`: file count scan now recursive (includes subdirectories)
- `validate-site.js`: schema validation now per-page-type (LocalBusiness only required on home/contact)
- `validate-site.js`: internal link count includes clean URL references (not just `.html`)
- `validate-site.js`: broken local reference check tries `.html` suffix for clean URL paths
- `validate-site.js`: sitemap validation checks index + children structure instead of flat urlset
- `data/page-content.js`: 4 `links` array entries updated from old slugs to clean URLs
- `data/phase-two-services.js`: 6 `links` array entries updated from old slugs to clean URLs
- README.md: page count updated from 24 to 245

### Removed
- `<priority>` and `<changefreq>` elements from all sitemaps
- `LocalBusiness` schema from non-home/contact pages (was redundantly emitted on all 245 pages)
- All hardcoded `old-slug.html` references in `generate-pages.js` (39 occurrences across 6 slugs)
- Old flat sitemap generation logic

## 2026-07-17 — GA4 Tracking Integration

### Added
- `ga4MeasurementId` constant (`G-S1LTRCP1GH`) in `generate-pages.js`
- Google Analytics 4 gtag.js snippet injected into `<head>` of all 245 HTML pages
- GA4 tracking covers all page types: home, service, location, district, local, guide, page

### Changed
- `<head>` template in `generate-pages.js` now includes async gtag.js loader + config script before `</head>`

### Notes
- GA4 property `properties/546001761` (Deposazegar) created 2026-07-17
- Property config: industry `HOME_AND_GARDEN`, timezone `America/Los_Angeles`, currency `USD`
- No custom dimensions or metrics configured yet
- GA4 was previously only on the home page (manually added); now propagated to all pages via build system