# Changelog

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