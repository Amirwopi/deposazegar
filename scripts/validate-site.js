const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const basePages = require('../data/pages.json');
const {
  districtPages,
  localPages,
  localProfiles,
  districtProfiles
} = require('../data/local-seo');
const { phaseTwoServicePages } = require('../data/phase-two-services');

const pages = [...basePages, ...phaseTwoServicePages, ...districtPages, ...localPages];

const cleanUrlMap = {
  'ejare-anbar-containeri-tehran': 'container-storage',
  'depo-lavazem-khaneh': 'home-appliances-storage',
  'ejare-anbar-vasayel-sherkat': 'commercial-storage',
  'gheymat-ejare-anbar-tehran': 'pricing',
  'ejare-anbar-gharb-tehran': 'location/west-tehran',
  'ejare-anbar-shargh-tehran': 'location/east-tehran',
  'ejare-anbar-jonoub-tehran': 'location/south-tehran'
};
const pageFilePath = (page) => {
  if (page.slug === 'index') return 'index.html';
  const clean = cleanUrlMap[page.slug];
  return clean ? `${clean}.html` : `${page.slug}.html`;
};
const pageCanonicalUrl = (page) => {
  if (page.slug === 'index') return 'https://deposazegar.com/';
  const clean = cleanUrlMap[page.slug];
  return clean ? `https://deposazegar.com/${clean}` : `https://deposazegar.com/${page.slug}`;
};

const projectRoot = path.resolve(__dirname, '..');
const rootDir = path.join(projectRoot, 'public_html_ready');
const requiredSchemaTypes = ['Organization', 'WebSite', 'Service', 'FAQPage', 'BreadcrumbList'];
const phoneNumbers = [
  '02188988459', '02188913383', '02188913307', '02188913308',
  '09034386673', '09102567906', '09102369064', '09192147106', '09192147105'
];
const requiredBranchNames = [
  'تهرانسر',
  'چیتگر',
  'چهارراه ایران‌خودرو',
  'اتوبان لشگری',
  'احمدآباد مستوفی',
  'اتوبان آزادگان',
  'پایین تهرانسر',
  'محدوده اتوبان ساوه',
  'محدوده احمدآباد',
  'کنارگذر اتوبان آزادگان',
  'محدوده حکیمیه'
];
const errors = [];
const auditRows = [];

const fail = (file, message) => errors.push(`${file}: ${message}`);
const countPersianWords = (html) => (html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .match(/[\u0600-\u06FF]+(?:‌[\u0600-\u06FF]+)*/g) || []).length;

async function validate() {
  const substantialParagraphs = new Map();
  const forbiddenTopLevelEntries = [
    'node_modules',
    'package.json',
    'package-lock.json',
    'tailwind.config.js',
    'scripts',
    'data',
    'README-dev.md'
  ];

  if (!fs.existsSync(rootDir)) {
    throw new Error('public_html_ready/ does not exist. Run npm run build first.');
  }

  for (const entry of forbiddenTopLevelEntries) {
    if (fs.existsSync(path.join(rootDir, entry))) {
      fail('public_html_ready', `forbidden development entry exists: ${entry}`);
    }
  }

  if (fs.existsSync(path.join(rootDir, 'assets', 'css', 'input.css'))) {
    fail('public_html_ready', 'assets/css/input.css must not be included');
  }

  const builtHtmlFiles = [];
  const scanDir = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) scanDir(path.join(dir, entry.name));
      else if (entry.name.endsWith('.html')) builtHtmlFiles.push(path.relative(rootDir, path.join(dir, entry.name)));
    }
  };
  scanDir(rootDir);
  if (builtHtmlFiles.length !== pages.length) {
    fail('public_html_ready', `expected ${pages.length} HTML files, found ${builtHtmlFiles.length}`);
  }

  for (const page of pages) {
    const file = pageFilePath(page);
    const fullPath = path.join(rootDir, file);
    if (!fs.existsSync(fullPath)) {
      fail(file, 'missing generated page');
      continue;
    }

    const html = fs.readFileSync(fullPath, 'utf8');
    const main = html.match(/<main id="main-content">([\s\S]*?)<\/main>/)?.[1] || '';
    const wordCount = countPersianWords(main);
    const minimumWords = ['about', 'contact'].includes(page.slug) ? 700 : 900;
    if (page.slug !== 'index' && (wordCount < minimumWords || wordCount > 1400)) {
      fail(file, `Persian main-content word count is ${wordCount}; expected ${minimumWords}–1400`);
    }

    const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1].trim() || '';
    const metaDescription = html.match(/<meta name="description" content="([^"]+)">/)?.[1] || '';
    const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1] || '';
    const h1Count = (main.match(/<h1(?:\s|>)/g) || []).length;
    const h2Count = (main.match(/<h2(?:\s|>)/g) || []).length;
    const faqCount = (main.match(/<details class="faq-item">/g) || []).length;
    const internalLinks = new Set(
      [...main.matchAll(/href="([^"]+)"/g)]
        .map((match) => match[1].split('#')[0])
        .filter((reference) => reference.startsWith('/') && !reference.startsWith('/assets/') && !reference.includes('.'))
    );
    auditRows.push({ file, wordCount, title, descriptionLength: [...metaDescription].length, h1Count, h2Count, faqCount, internalLinks: internalLinks.size });

    if (!title) fail(file, 'missing title');
    if (!metaDescription) fail(file, 'missing meta description');
    if (metaDescription && ([...metaDescription].length < 140 || [...metaDescription].length > 160)) {
      fail(file, `meta description length is ${[...metaDescription].length}; expected 140–160 characters`);
    }
    if (!canonical) fail(file, 'missing canonical');
    if (!/<link rel="stylesheet" href="\/assets\/css\/style\.css\?v=[a-f0-9]{10}">/.test(html)) fail(file, 'missing versioned production CSS reference');
    if (!/<script src="\/assets\/js\/main\.js\?v=[a-f0-9]{10}" defer><\/script>/.test(html)) fail(file, 'missing versioned production JavaScript reference');
    if (/\.\.\/(?:data|scripts)|localhost|node_modules|tailwind\.config\.js|input\.css/i.test(html)) {
      fail(file, 'contains a development-only path or reference');
    }
    if (h1Count !== 1) fail(file, `expected exactly one H1, found ${h1Count}`);
    if (h2Count < 4) fail(file, `expected at least four H2 headings, found ${h2Count}`);
    if (internalLinks.size < 5) fail(file, `expected at least five unique internal content links, found ${internalLinks.size}`);
    if (!/class="page-hero"|class="home-hero"/.test(main) || !/class="mid-cta"/.test(main) || !/class="final-cta"/.test(main)) {
      fail(file, 'top, middle and final CTA structure is incomplete');
    }

    const paragraphs = [...main.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)]
      .map((match) => match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
      .filter((text) => text.length > 180);
    substantialParagraphs.set(file, paragraphs);

    if (!/<meta name="robots" content="index,follow,max-image-preview:large">/.test(html)) fail(file, 'missing index/follow robots meta');
    if (!/<meta property="og:image"/.test(html) || !/<meta name="twitter:card" content="summary_large_image">/.test(html)) fail(file, 'incomplete social metadata');
    if (!/rel="icon"[^>]+\/favicon\.ico/.test(html)
      || !/rel="icon"[^>]+\/favicon-96\.png/.test(html)
      || !/rel="apple-touch-icon"[^>]+\/apple-touch-icon\.png/.test(html)) {
      fail(file, 'missing stable root-level favicon links');
    }
    if (faqCount < 5) fail(file, 'fewer than five details-based FAQ items');
    if ((html.match(/<summary>/g) || []).length < 5) fail(file, 'FAQ summaries missing');
    if (/\bprose(?:-|\s|")/.test(html)) fail(file, 'typography plugin prose class remains');
    if (/depoco\.ir|logo\.png|Vazirmatn-Black|assets\/images\/\d+\.(?:jpg|webp)/i.test(html)) fail(file, 'watermarked, broken or non-semantic image asset is referenced');
    if (!/class="mobile-contact-bar"/.test(html) || !/data-sheet-open="phone-sheet"/.test(html) || !/data-sheet-open="locations-sheet"/.test(html)) {
      fail(file, 'mobile contact and locations actions are missing');
    }
    if (!/https:\/\/wa\.me\/989102567906/.test(html)) fail(file, 'WhatsApp consultation CTA is missing');
    if (!/href="https:\/\/github\.com\/amirwopi"[^>]*>Amirwopi<\/a>/.test(html)) fail(file, 'Amirwopi copyright link is missing');

    for (const phone of phoneNumbers) {
      const appearances = (html.match(new RegExp(phone, 'g')) || []).length;
      if (appearances < 3) fail(file, `phone ${phone} is not present in schema, CTA and footer`);
    }

    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    if (!jsonLd) {
      fail(file, 'missing JSON-LD');
    } else {
      try {
        const graph = JSON.parse(jsonLd)['@graph'] || [];
        const graphTypes = graph.map((item) => item['@type']);
        const requiredTypes = ['index', 'contact'].includes(page.slug)
          ? [...requiredSchemaTypes, 'LocalBusiness']
          : requiredSchemaTypes;
        for (const type of requiredTypes) {
          if (!graphTypes.includes(type)) fail(file, `missing ${type} schema`);
        }
        const faqSchema = graph.find((item) => item['@type'] === 'FAQPage');
        if (!faqSchema || faqSchema.mainEntity?.length !== faqCount) fail(file, 'FAQPage schema does not match visible page FAQs');
        const localBusiness = graph.find((item) => item['@type'] === 'LocalBusiness');
        if (localBusiness) {
          if (localBusiness.address) fail(file, 'LocalBusiness contains an unverified postal address');
          if (!Array.isArray(localBusiness.department) || localBusiness.department.length !== requiredBranchNames.length) {
            fail(file, 'LocalBusiness schema does not contain every confirmed branch');
          }
          if (!Array.isArray(localBusiness.areaServed)
            || !localBusiness.areaServed.some((area) => area.name === 'استان تهران')
            || !localBusiness.areaServed.some((area) => area.name === 'استان البرز')
            || !localBusiness.areaServed.some((area) => area.name === 'کرج')) {
            fail(file, 'LocalBusiness schema does not include Tehran Province, Alborz Province and Karaj');
          }
        }
      } catch (error) {
        fail(file, `invalid JSON-LD: ${error.message}`);
      }
    }

    for (const match of html.matchAll(/<img\s+([^>]+)>/g)) {
      const attributes = match[1];
      const src = attributes.match(/src="([^"]+)"/)?.[1];
      const width = Number(attributes.match(/width="(\d+)"/)?.[1]);
      const height = Number(attributes.match(/height="(\d+)"/)?.[1]);
      if (!src || !width || !height) {
        fail(file, `image missing src or intrinsic dimensions: ${match[0].slice(0, 100)}`);
        continue;
      }
      if (!src.endsWith('.svg')) {
        const assetPath = path.join(rootDir, src);
        if (!fs.existsSync(assetPath)) {
          fail(file, `missing image ${src}`);
        } else {
          const metadata = await sharp(assetPath).metadata();
          if (metadata.width !== width || metadata.height !== height) {
            fail(file, `${src} dimensions ${width}×${height} do not match ${metadata.width}×${metadata.height}`);
          }
        }
      }
    }

    for (const match of html.matchAll(/(?:href|src)="([^"#?]+)"/g)) {
      const reference = match[1];
      if (/^(?:https?:|tel:|mailto:)/.test(reference)) continue;
      const localPath = path.join(rootDir, reference);
      if (fs.existsSync(localPath)) continue;
      if (fs.existsSync(`${localPath}.html`)) continue;
      fail(file, `broken local reference ${reference}`);
    }

    const pictures = [...html.matchAll(/<picture>([\s\S]*?)<\/picture>/g)];
    for (const [, markup] of pictures) {
      if (!/<source srcset="[^"]+\.webp" type="image\/webp">/.test(markup) || !/<img src="[^"]+\.jpg"/.test(markup)) {
        fail(file, 'picture does not provide WebP source and JPG fallback');
        continue;
      }
      const webpReference = markup.match(/<source srcset="([^"]+\.webp)"/)?.[1];
      const jpgReference = markup.match(/<img src="([^"]+\.jpg)"/)?.[1];
      const webpPath = path.join(rootDir, webpReference);
      const jpgPath = path.join(rootDir, jpgReference);
      if (!fs.existsSync(webpPath)) {
        fail(file, `missing WebP source ${webpReference}`);
      } else {
        const [webpMetadata, jpgMetadata] = await Promise.all([
          sharp(webpPath).metadata(),
          sharp(jpgPath).metadata()
        ]);
        if (webpMetadata.width !== jpgMetadata.width || webpMetadata.height !== jpgMetadata.height) {
          fail(file, `${webpReference} dimensions differ from JPG fallback`);
        }
      }
    }
  }

  const files = [...substantialParagraphs.keys()];
  for (let i = 0; i < files.length; i += 1) {
    for (let j = i + 1; j < files.length; j += 1) {
      const first = substantialParagraphs.get(files[i]);
      const second = new Set(substantialParagraphs.get(files[j]));
      const repeated = first.filter((paragraph) => second.has(paragraph)).length;
      if (repeated > Math.min(first.length, second.size) * 0.6) {
        fail(`${files[i]} + ${files[j]}`, 'more than 60% of substantial paragraphs are identical');
      }
    }
  }

  const sitemapIndex = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8');
  const childSitemaps = ['sitemap-pages.xml', 'sitemap-services.xml', 'sitemap-locations.xml', 'sitemap-posts.xml'];
  for (const child of childSitemaps) {
    if (!sitemapIndex.includes(`<loc>https://deposazegar.com/${child}</loc>`)) fail('sitemap.xml', `missing ${child} in sitemap index`);
  }
  const allSitemapUrls = new Set();
  for (const child of childSitemaps) {
    const childPath = path.join(rootDir, child);
    if (!fs.existsSync(childPath)) { fail(child, 'missing child sitemap'); continue; }
    const childContent = fs.readFileSync(childPath, 'utf8');
    for (const match of childContent.matchAll(/<loc>([^<]+)<\/loc>/g)) allSitemapUrls.add(match[1]);
    if (!/<lastmod>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}<\/lastmod>/.test(childContent)) {
      fail(child, 'missing valid W3C datetime lastmod');
    }
  }
  for (const page of pages) {
    const url = pageCanonicalUrl(page);
    if (!allSitemapUrls.has(url)) fail('sitemap', `missing ${url}`);
  }
  if (allSitemapUrls.size !== pages.length) fail('sitemap', `URL count ${allSitemapUrls.size} does not match page count ${pages.length}`);

  const robots = fs.readFileSync(path.join(rootDir, 'robots.txt'), 'utf8');
  if (!/User-agent:\s*\*/.test(robots) || !/Allow:\s*\//.test(robots) || !/Sitemap:\s*https:\/\/deposazegar\.com\/sitemap\.xml/.test(robots)) {
    fail('robots.txt', 'required allow and sitemap directives are missing');
  }

  const llmsPath = path.join(rootDir, 'llms.txt');
  if (!fs.existsSync(llmsPath)) {
    fail('llms.txt', 'missing llms.txt file');
  } else {
    const llmsContent = fs.readFileSync(llmsPath, 'utf8');
    if (!llmsContent.includes('# دپو سازگار (Deposazegar)') || !llmsContent.includes('# Deposazegar (Finglish Version)')) {
      fail('llms.txt', 'llms.txt is missing required Persian or Finglish sections');
    }
  }

  const contactHtml = fs.readFileSync(path.join(rootDir, 'contact.html'), 'utf8');
  for (const phone of phoneNumbers) {
    if (!contactHtml.includes(phone)) fail('contact.html', `missing phone number ${phone}`);
  }
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  if (!/data-comment-form/.test(indexHtml)
    || !/action="api\/comments\.php"/.test(indexHtml)
    || !/data-comment-toast/.test(indexHtml)
    || !fs.existsSync(path.join(rootDir, 'api', 'comments.php'))
    || !fs.existsSync(path.join(rootDir, 'admin', 'comments.php'))
    || !fs.existsSync(path.join(rootDir, 'admin', 'admin.css'))
    || !fs.existsSync(path.join(rootDir, 'storage', '.htaccess'))) {
    fail('index.html', 'moderated comments form, toast, API or admin panel is missing');
  }
  const setupTokenPath = path.join(rootDir, 'storage', '.admin-setup-token');
  const setupToken = fs.existsSync(setupTokenPath) ? fs.readFileSync(setupTokenPath, 'utf8').trim() : '';
  if (!/^[a-f0-9]{48}$/.test(setupToken)) fail('storage/.admin-setup-token', 'missing secure first-run admin setup token');
  const commentApi = fs.readFileSync(path.join(rootDir, 'api', 'comments.php'), 'utf8');
  if (!/Location: \/\?comment=\{\$result\}#comments/.test(commentApi)) fail('api/comments.php', 'non-JavaScript form fallback does not redirect back to comments');
  const adminPhp = fs.readFileSync(path.join(rootDir, 'admin', 'comments.php'), 'utf8');
  for (const securityControl of ['password_hash', 'password_verify', 'hash_equals', 'session_regenerate_id', 'admin_valid_csrf', 'X-Robots-Tag: noindex']) {
    if (!adminPhp.includes(securityControl)) fail('admin/comments.php', `missing admin security control ${securityControl}`);
  }
  for (const [feet, meters] of [['۱۰', '۶'], ['۱۵', '۱۲'], ['۲۰', '۱۸'], ['۴۰', '۲۷']]) {
    const mappingMarkup = new RegExp(`${feet} فوت\\s*<small>\\(${meters} متر\\)<\\/small>`);
    if (!mappingMarkup.test(indexHtml)) fail('index.html', `missing requested size mapping ${feet} foot (${meters} meter)`);
  }
  for (const branch of requiredBranchNames) {
    if (!indexHtml.includes(branch)) fail('index.html', `missing confirmed branch ${branch}`);
    if (!contactHtml.includes(branch)) fail('contact.html', `missing confirmed branch ${branch}`);
  }

  const socialMetadata = await sharp(path.join(rootDir, 'assets', 'images', 'og-cover.jpg')).metadata();
  if (socialMetadata.width !== 1200 || socialMetadata.height !== 630) fail('assets/images/og-cover.jpg', 'expected 1200×630');
  const touchMetadata = await sharp(path.join(rootDir, 'assets', 'images', 'apple-touch-icon.png')).metadata();
  if (touchMetadata.width !== 180 || touchMetadata.height !== 180) fail('assets/images/apple-touch-icon.png', 'expected 180×180');
  const faviconMetadata = await sharp(path.join(rootDir, 'favicon-96.png')).metadata();
  if (faviconMetadata.width !== 96 || faviconMetadata.height !== 96) fail('favicon-96.png', 'expected 96×96');
  if (!fs.existsSync(path.join(rootDir, 'favicon.ico'))) fail('favicon.ico', 'missing root favicon');

  const reportStatus = errors.length ? 'نیازمند اصلاح' : 'پاس';
  const report = `# گزارش ممیزی SEO دپو سازگار

تاریخ اجرا: ${new Date().toISOString().slice(0, 10)}

وضعیت کلی: **${reportStatus}**

## خلاصه

- تعداد صفحات بررسی‌شده: ${pages.length}
- صفحات موجود در Sitemap: ${allSitemapUrls.size}
- Schemaهای الزامی: ${requiredSchemaTypes.join('، ')}
- تصاویر: WebP با JPG fallback و ابعاد ذاتی کنترل‌شده
- شماره‌های تماس: ۹ شماره در Schema، CTA، صفحه تماس و فوتر
- تماس: پنل کشویی شامل هر ۹ شماره و CTA مشاوره واتساپ
- نظر کاربران: فرم PHP، Toast داخل صفحه و بازگشت امن بدون نمایش API
- مدیریت نظرها: ورود امن، CSRF، محدودسازی تلاش ورود، تأیید، رد، حذف و تغییر رمز

## شاخص‌های هر صفحه

| صفحه | واژه فارسی | طول توضیح متا | H1 | H2 | FAQ | لینک داخلی یکتا |
|---|---:|---:|---:|---:|---:|---:|
${auditRows.map((row) => `| ${row.file} | ${row.wordCount} | ${row.descriptionLength} | ${row.h1Count} | ${row.h2Count} | ${row.faqCount} | ${row.internalLinks} |`).join('\n')}

## کنترل‌های انجام‌شده

- Title، meta description، canonical و meta robots
- یک H1 و حداقل چهار H2 در محتوای اصلی
- ۹۰۰ تا ۱۴۰۰ واژه برای صفحات محتوایی و حداقل ۷۰۰ واژه برای درباره/تماس
- حداقل ۵ FAQ نمایشی و تطبیق کامل با FAQPage Schema
- حداقل ۵ لینک داخلی یکتا در محتوای اصلی
- Organization، WebSite، Service، FAQPage و BreadcrumbList در همه صفحات؛ LocalBusiness فقط در صفحه اصلی و تماس
- نبود آدرس پستی تأییدنشده در LocalBusiness
- نبود لینک داخلی شکسته یا ارجاع به تصویر واترمارک‌دار
- WebP/JPG، ابعاد واقعی، OG image و Apple Touch Icon
- ${pages.length} URL با canonical و lastmod (W3C datetime) در Sitemap split (index + 4 child)
- شعب غرب، جنوب و شرق استان تهران و پوشش استان البرز در محتوا و Schema

## گزارش صفحات محلی و منطقه ای

- صفحات مادر تهران: ${districtPages.filter((page) => districtProfiles[page.slug]?.city === 'تهران').length}
- صفحات مادر کرج: ${districtPages.filter((page) => districtProfiles[page.slug]?.city === 'کرج').length}
- صفحات محله ای منتشرشده: ${localPages.length}
- صفحات خدماتی و راهنمای مرحله دوم: ${phaseTwoServicePages.length}
- هر صفحه محله ای شامل H1 اختصاصی، intro اختصاصی، نیاز کاربران، خدمات، مزایا، قیمت، انتخاب متراژ، محله های نزدیک، FAQ و CTA است.

## کلمات کلیدی هدف صفحات محله ای

| صفحه | کلمات کلیدی اصلی |
|---|---|
${localPages.map((page) => {
  const profile = localProfiles[page.slug];
  return `| ${pageFilePath(page)} | اجاره انبار در ${profile.name}، اجاره انبار وسایل منزل در ${profile.name}، دپو لوازم خانه در ${profile.name}، اجاره کانتینر در ${profile.name} |`;
}).join('\n')}

## گزارش لینک سازی داخلی

- صفحه اصلی به همه صفحات مادر منطقه ای تهران و کرج، بخشی از محله های اولویت دار و همه صفحات خدماتی مرحله دوم لینک می دهد.
- هر صفحه مادر منطقه ای به محله های منتشرشده همان منطقه و صفحات خدماتی، متراژها، بسته بندی، حمل ونقل و تماس لینک می دهد.
- هر صفحه محله ای به صفحه مادر منطقه، صفحه شهر، محله های نزدیک، صفحات متراژ، دپو لوازم خانه، بسته بندی، حمل ونقل و تماس لینک می دهد.
- Sitemap شامل همه URLهای تولیدشده است و شمار URLها با فهرست صفحات مولد برابر است.

## گزارش canonical و redirect

- Canonical هر صفحه روی نسخه اصلی دامنه com و URL همان صفحه تنظیم شده است.
- robots.txt فقط مسیرهای عمومی را allow می کند و به Sitemap اصلی اشاره دارد.
- .htaccess باید نسخه های http، www و دامنه ir را با 301 به https://deposazegar.com/ هدایت کند.
- ۷ اسلاگ قدیمی فارسی با 301 به URLهای clean جدید هدایت می شوند (container-storage، home-appliances-storage، commercial-storage، pricing، location/west-tehran، location/east-tehran، location/south-tehran).
- URLهای clean بدون پسوند .html سرو می شوند (mod_rewrite).
- برای صفحات محلی از canonical متقابل یا noindex استفاده نشده است؛ هر صفحه محتوای مستقل و قابل ایندکس دارد.

## صفحات محله ای منتشرشده و اولویت دار

${localPages.map((page, index) => {
  const profile = localProfiles[page.slug];
  return `${index + 1}. ${pageFilePath(page)} - ${profile.name} (${profile.city}، ${profile.regionLabel})`;
}).join('\n')}

## ۲۰ صفحه اولویت دار برای مرحله سوم

${[
  'pricing - تقویت با داده قیمت واقعی در صورت تأیید مالک',
  'ejare-anbar-saadat-abad - بررسی CTR و افزودن مثال های واقعی از مسیر حمل',
  'ejare-anbar-tehranpars - تقویت لینک داخلی از صفحات شرق تهران',
  'ejare-anbar-karaj-azimiyeh - افزودن اطلاعات دقیق تر پوشش البرز پس از داده Search Console',
  'ejare-anbar-chitgar - بررسی کوئری های دریاچه و برج های نوساز',
  'ejare-anbar-kootah-moddat - توسعه FAQ بر اساس impressionهای Search Console',
  'ejare-anbar-asbabkeshi - افزودن چک لیست اسباب کشی قابل دانلود در صورت نیاز',
  'rahnamay-entekhab-metraje-anbar - افزودن جدول ظرفیت با داده واقعی',
  'tafavot-anbar-container-kanex - تقویت برای کوئری های کانکس و کانتینر',
  'ejare-anbar-arzan-tehran - پایش حساسیت کلمه ارزان و جلوگیری از وعده قیمت غیرواقعی',
  'location/west-tehran - لینک بیشتر به محله های جدید غرب',
  'location/east-tehran - لینک بیشتر به تهرانپارس، نارمک، حکیمیه و رسالت',
  'ejare-anbar-shomal-tehran - لینک بیشتر به محله های منطقه ۱ و ۳',
  'ejare-anbar-karaj - تقویت با مناطق و محله های کرج',
  'home-appliances-storage - افزودن سناریوهای جهیزیه و بازسازی',
  'bastebandi-lavazem-anbar - افزودن تصویر یا جدول مواد بسته بندی',
  'haml-o-naghl-anbar - افزودن عوامل هزینه حمل بعد از دریافت داده واقعی',
  'container-storage - لینک بیشتر به صفحه تفاوت انبار و کانتینر',
  'ejare-container-20-foot - تقویت برای کوئری ظرفیت وسایل منزل',
  'contact - افزودن ساعات پاسخ گویی در صورت تأیید'
].map((item, index) => `${index + 1}. ${item}`).join('\n')}

## چک لیست بعد از انتشار در Google Search Console

- Inspect URL برای صفحه اصلی، Sitemap و چند صفحه محله ای مهم مثل تجریش، سعادت آباد، تهرانپارس، چیتگر و عظیمیه.
- Submit sitemap: https://deposazegar.com/sitemap.xml
- بررسی Coverage/Indexing برای خطاهای redirect، soft 404، duplicate without user-selected canonical و crawl anomaly.
- بررسی گزارش Page Experience و Core Web Vitals بعد از جمع شدن داده واقعی موبایل.
- بررسی Queries و Pages پس از ۲ تا ۴ هفته و تقویت صفحاتی که impression دارند ولی CTR پایین است.
- افزودن اطلاعات واقعی قابل انتشار مثل ساعات پاسخ گویی، محدوده دقیق شعب، شرایط بیمه و تعرفه در صورت تأیید مالک کسب وکار.

## اطلاعاتی که باید از مالک کسب‌وکار دریافت شود

- آدرس واقعی و قابل انتشار، فقط در صورت وجود دفتر یا محل مراجعه عمومی
- ساعات پاسخ‌گویی و روزهای کاری
- محدوده دقیق محل یا محل‌های انبار
- شرایط قطعی بیمه، نگهبانی، دوربین، دسترسی و حمل
- تعرفه یا بازه قیمت قابل انتشار
- لینک Google Business Profile، در صورت داشتن موقعیت واقعی و واجد شرایط

${errors.length ? `## خطاها\n\n${errors.map((error) => `- ${error}`).join('\n')}\n` : ''}
`;
  fs.writeFileSync(path.join(projectRoot, 'seo-audit-report.md'), report, 'utf8');

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
    return;
  }

  console.log(`Validated public_html_ready/: ${pages.length} pages, hosting structure, SEO, assets, links, sitemap and robots.txt.`);
}

validate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
