const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pages = require('../data/pages.json');

const projectRoot = path.resolve(__dirname, '..');
const rootDir = path.join(projectRoot, 'public_html_ready');
const requiredSchemaTypes = ['Organization', 'LocalBusiness', 'WebSite', 'Service', 'FAQPage', 'BreadcrumbList'];
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

  const builtHtmlFiles = fs.readdirSync(rootDir).filter((file) => file.endsWith('.html'));
  if (builtHtmlFiles.length !== pages.length) {
    fail('public_html_ready', `expected ${pages.length} HTML files, found ${builtHtmlFiles.length}`);
  }

  for (const page of pages) {
    const file = page.slug === 'index' ? 'index.html' : `${page.slug}.html`;
    const fullPath = path.join(rootDir, file);
    if (!fs.existsSync(fullPath)) {
      fail(file, 'missing generated page');
      continue;
    }

    const html = fs.readFileSync(fullPath, 'utf8');
    const main = html.match(/<main id="main-content">([\s\S]*?)<\/main>/)?.[1] || '';
    const wordCount = countPersianWords(main);
    const minimumWords = ['about', 'contact'].includes(page.slug) ? 700 : 900;
    if (page.slug !== 'index' && (wordCount < minimumWords || wordCount > 1200)) {
      fail(file, `Persian main-content word count is ${wordCount}; expected ${minimumWords}–1200`);
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
        .filter((reference) => reference.endsWith('.html'))
    );
    auditRows.push({ file, wordCount, title, descriptionLength: [...metaDescription].length, h1Count, h2Count, faqCount, internalLinks: internalLinks.size });

    if (!title) fail(file, 'missing title');
    if (!metaDescription) fail(file, 'missing meta description');
    if (metaDescription && ([...metaDescription].length < 140 || [...metaDescription].length > 160)) {
      fail(file, `meta description length is ${[...metaDescription].length}; expected 140–160 characters`);
    }
    if (!canonical) fail(file, 'missing canonical');
    if (!/<link rel="stylesheet" href="assets\/css\/style\.css\?v=[a-f0-9]{10}">/.test(html)) fail(file, 'missing versioned production CSS reference');
    if (!/<script src="assets\/js\/main\.js\?v=[a-f0-9]{10}" defer><\/script>/.test(html)) fail(file, 'missing versioned production JavaScript reference');
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
    if (/wa\.me|whatsapp|واتساپ/i.test(html)) fail(file, 'WhatsApp must be removed from the site');
    if (!/href="https:\/\/github\.com\/amirwopi"[^>]*>Amirwopi<\/a>/.test(html)) fail(file, 'Amirwopi copyright link is missing');

    for (const phone of phoneNumbers) {
      const appearances = (html.match(new RegExp(phone, 'g')) || []).length;
      if (appearances < 4) fail(file, `phone ${phone} is not present in schema, CTA and footer`);
    }

    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    if (!jsonLd) {
      fail(file, 'missing JSON-LD');
    } else {
      try {
        const graph = JSON.parse(jsonLd)['@graph'] || [];
        const graphTypes = graph.map((item) => item['@type']);
        for (const type of requiredSchemaTypes) {
          if (!graphTypes.includes(type)) fail(file, `missing ${type} schema`);
        }
        const faqSchema = graph.find((item) => item['@type'] === 'FAQPage');
        if (!faqSchema || faqSchema.mainEntity?.length !== faqCount) fail(file, 'FAQPage schema does not match visible page FAQs');
        const localBusiness = graph.find((item) => item['@type'] === 'LocalBusiness');
        if (localBusiness?.address) fail(file, 'LocalBusiness contains an unverified postal address');
        if (!Array.isArray(localBusiness?.department) || localBusiness.department.length !== requiredBranchNames.length) {
          fail(file, 'LocalBusiness schema does not contain every confirmed branch');
        }
        if (!Array.isArray(localBusiness?.areaServed)
          || !localBusiness.areaServed.some((area) => area.name === 'استان تهران')
          || !localBusiness.areaServed.some((area) => area.name === 'استان البرز')
          || !localBusiness.areaServed.some((area) => area.name === 'کرج')) {
          fail(file, 'LocalBusiness schema does not include Tehran Province, Alborz Province and Karaj');
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
      if (!fs.existsSync(localPath)) fail(file, `broken local reference ${reference}`);
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

  const sitemap = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8');
  for (const page of pages) {
    const url = `https://deposazegar.com/${page.slug === 'index' ? '' : `${page.slug}.html`}`;
    if (!sitemap.includes(`<loc>${url}</loc>`)) fail('sitemap.xml', `missing ${url}`);
    const expectedPriority = page.slug === 'index' ? '1.0'
      : ['ejare-anbar-tehran', 'ejare-anbar-containeri-tehran', 'depo-lavazem-khaneh'].includes(page.slug) ? '0.9'
      : ['about', 'contact'].includes(page.slug) ? '0.6'
      : '0.8';
    const urlBlock = sitemap.match(new RegExp(`<url>\\s*<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/loc>[\\s\\S]*?<\\/url>`))?.[0] || '';
    if (!urlBlock.includes(`<priority>${expectedPriority}</priority>`)) fail('sitemap.xml', `incorrect priority for ${url}`);
    if (!/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(urlBlock)) fail('sitemap.xml', `missing valid lastmod for ${url}`);
  }
  if ((sitemap.match(/<url>/g) || []).length !== pages.length) fail('sitemap.xml', 'URL count does not match page count');

  const robots = fs.readFileSync(path.join(rootDir, 'robots.txt'), 'utf8');
  if (!/User-agent:\s*\*/.test(robots) || !/Allow:\s*\//.test(robots) || !/Sitemap:\s*https:\/\/deposazegar\.com\/sitemap\.xml/.test(robots)) {
    fail('robots.txt', 'required allow and sitemap directives are missing');
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
- صفحات موجود در Sitemap: ${(sitemap.match(/<url>/g) || []).length}
- Schemaهای الزامی: ${requiredSchemaTypes.join('، ')}
- تصاویر: WebP با JPG fallback و ابعاد ذاتی کنترل‌شده
- شماره‌های تماس: ۹ شماره در Schema، CTA، صفحه تماس و فوتر
- تماس: پنل کشویی شامل هر ۹ شماره و بدون لینک واتساپ
- نظر کاربران: فرم PHP، Toast داخل صفحه و بازگشت امن بدون نمایش API
- مدیریت نظرها: ورود امن، CSRF، محدودسازی تلاش ورود، تأیید، رد، حذف و تغییر رمز

## شاخص‌های هر صفحه

| صفحه | واژه فارسی | طول توضیح متا | H1 | H2 | FAQ | لینک داخلی یکتا |
|---|---:|---:|---:|---:|---:|---:|
${auditRows.map((row) => `| ${row.file} | ${row.wordCount} | ${row.descriptionLength} | ${row.h1Count} | ${row.h2Count} | ${row.faqCount} | ${row.internalLinks} |`).join('\n')}

## کنترل‌های انجام‌شده

- Title، meta description، canonical و meta robots
- یک H1 و حداقل چهار H2 در محتوای اصلی
- حداقل ۹۰۰ واژه برای صفحات محتوایی و حداقل ۷۰۰ واژه برای درباره/تماس
- حداقل ۵ FAQ نمایشی و تطبیق کامل با FAQPage Schema
- حداقل ۵ لینک داخلی یکتا در محتوای اصلی
- Organization، LocalBusiness، WebSite، Service، FAQPage و BreadcrumbList
- نبود آدرس پستی تأییدنشده در LocalBusiness
- نبود لینک داخلی شکسته یا ارجاع به تصویر واترمارک‌دار
- WebP/JPG، ابعاد واقعی، OG image و Apple Touch Icon
- ${pages.length} URL canonical، lastmod و priority منطقی در Sitemap
- شعب غرب، جنوب و شرق استان تهران و پوشش استان البرز در محتوا و Schema

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
