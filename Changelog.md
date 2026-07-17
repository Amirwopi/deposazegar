# Changelog

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