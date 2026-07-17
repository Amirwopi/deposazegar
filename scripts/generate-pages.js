const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const basePages = require('../data/pages.json');
const {
  locationProfiles,
  sizeProfiles,
  serviceProfiles: baseServiceProfiles,
  pageProfiles
} = require('../data/page-content');
const {
  districtProfiles,
  districtPages,
  localProfiles,
  localPages,
  localSlugByShortSlug,
  toPersianDigits
} = require('../data/local-seo');
const {
  phaseTwoServicePages,
  phaseTwoServiceProfiles
} = require('../data/phase-two-services');

const pages = [...basePages, ...phaseTwoServicePages, ...districtPages, ...localPages];
const serviceProfiles = { ...baseServiceProfiles, ...phaseTwoServiceProfiles };

const cleanUrlMap = {
  'ejare-anbar-containeri-tehran': 'container-storage',
  'depo-lavazem-khaneh': 'home-appliances-storage',
  'ejare-anbar-vasayel-sherkat': 'commercial-storage',
  'gheymat-ejare-anbar-tehran': 'pricing',
  'ejare-anbar-gharb-tehran': 'location/west-tehran',
  'ejare-anbar-shargh-tehran': 'location/east-tehran',
  'ejare-anbar-jonoub-tehran': 'location/south-tehran'
};
const cleanUrlPath = (slug) => cleanUrlMap[slug] || null;

const projectRoot = path.join(__dirname, '..');
const outputDir = path.join(projectRoot, 'public_html_ready');
const baseSiteUrl = 'https://deposazegar.com';
const ga4MeasurementId = 'G-S1LTRCP1GH';
const criticalCss = `:root{--ink:#0f172a;--forest:#0f2742;--green:#1d6fa5;--paper:#f8fafc;--line:#d7e1ea;--white:#fff}*,:before,:after{box-sizing:border-box}html{background:var(--paper)}body{margin:0;overflow-x:hidden;background:var(--paper);color:var(--ink);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Tahoma,sans-serif;font-size:16px;line-height:1.85;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;padding-bottom:calc(4.4rem + env(safe-area-inset-bottom))}img{display:block;max-width:100%;height:auto}a{color:inherit;text-decoration:none}.container{width:min(100% - 2rem,1180px);margin-inline:auto}.site-header{position:sticky;top:0;z-index:40;border-bottom:1px solid rgb(215 225 234 / 82%);background:rgb(248 250 252 / 92%);backdrop-filter:blur(16px)}.header-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;min-height:4.75rem}.brand{display:flex;align-items:center;gap:.75rem;font-weight:900}.brand img{width:2.65rem;height:2.65rem}.brand-copy{display:grid;line-height:1.35}.brand-copy small{color:#475569;font-size:.78rem}.desktop-nav{display:none}.header-phone,.menu-button{border:1px solid var(--line);background:#fff;border-radius:.85rem;padding:.65rem .9rem;font:inherit}.home-hero{position:relative;display:grid;min-height:min(760px,calc(100svh - 4.75rem));overflow:hidden;place-items:center;background:var(--forest)}.home-hero-media,.home-hero-media picture{position:absolute;inset:0}.home-hero-media:after{position:absolute;inset:0;background:linear-gradient(90deg,rgb(8 27 48 / 96%),rgb(8 27 48 / 78%) 62%,rgb(8 27 48 / 48%)),linear-gradient(0deg,rgb(8 27 48 / 74%),transparent 40%);content:""}.home-hero-image{width:100%;height:100%;object-fit:cover}.home-hero-content{position:relative;z-index:1;padding-block:5rem;color:#fff}.eyebrow{color:#f59e0b;font-size:.78rem;font-weight:900}.home-hero h1{max-width:52rem;margin:.75rem 0 0;color:#fff;font-size:clamp(2.4rem,8vw,5.8rem);font-weight:900;line-height:1.35;letter-spacing:0}.home-hero-content>p{max-width:42rem;margin:1.25rem 0 0;color:rgb(255 255 255 / 84%)}.hero-actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1.75rem}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:2.9rem;border:1px solid transparent;border-radius:.85rem;padding:.65rem 1rem;font-weight:900}.btn-primary{background:#f59e0b;color:#0f2742}.btn-secondary{border-color:var(--line);background:#fff;color:var(--forest)}@media (min-width:1024px){.desktop-nav{display:flex;align-items:center;gap:.2rem}.desktop-nav a{padding:.65rem .7rem;color:#334155;font-weight:800}.menu-button{display:none}}`;
const assetVersion = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(outputDir, 'assets', 'css', 'style.css')))
  .update(fs.readFileSync(path.join(projectRoot, 'assets', 'js', 'main.js')))
  .digest('hex')
  .slice(0, 10);
const phones = [
  ['02188988459', '۰۲۱۸۸۹۸۸۴۵۹'],
  ['02188913383', '۰۲۱۸۸۹۱۳۳۸۳'],
  ['02188913307', '۰۲۱۸۸۹۱۳۳۰۷'],
  ['02188913308', '۰۲۱۸۸۹۱۳۳۰۸'],
  ['09034386673', '۰۹۰۳۴۳۸۶۶۷۳'],
  ['09102567906', '۰۹۱۰۲۵۶۷۹۰۶'],
  ['09102369064', '۰۹۱۰۲۳۶۹۰۶۴'],
  ['09192147106', '۰۹۱۹۲۱۴۷۱۰۶'],
  ['09192147105', '۰۹۱۹۲۱۴۷۱۰۵']
];
const managementPhone = ['09192147105', '۰۹۱۹۲۱۴۷۱۰۵'];
const whatsappNumber = ['989102567906', '۰۹۱۰۲۵۶۷۹۰۶'];
const branchGroups = [
  {
    key: 'west',
    title: 'شعب غرب تهران',
    description: 'پوشش مسیرهای غرب استان تهران و ورودی‌های ارتباطی استان البرز',
    branches: ['تهرانسر', 'چیتگر', 'چهارراه ایران‌خودرو', 'اتوبان لشگری', 'احمدآباد مستوفی'],
    more: 'و دیگر شعب غرب تهران…'
  },
  {
    key: 'south',
    title: 'شعب جنوب تهران',
    description: 'دسترسی مناسب برای مسیرهای جنوبی و محور آزادگان و ساوه',
    branches: ['اتوبان آزادگان', 'پایین تهرانسر', 'محدوده اتوبان ساوه', 'محدوده احمدآباد', 'کنارگذر اتوبان آزادگان'],
    more: 'و دیگر شعب جنوب تهران…'
  },
  {
    key: 'east',
    title: 'شعب شرق تهران',
    description: 'پوشش متقاضیان شرق تهران و مسیرهای منتهی به حکیمیه',
    branches: ['محدوده حکیمیه']
  }
];
const branchLocations = branchGroups.flatMap((group) =>
  group.branches.map((name, index) => ({
    name,
    code: `${group.key}-${index + 1}`,
    group: group.title
  }))
);
const servedAreas = [
  { '@type': 'AdministrativeArea', name: 'استان تهران' },
  { '@type': 'AdministrativeArea', name: 'استان البرز' },
  { '@type': 'City', name: 'تهران' },
  { '@type': 'City', name: 'کرج' }
];
const imageMeta = {
  hero: ['home-storage-intro', 739, 415],
  containerService: ['warehouse-intro', 960, 1280],
  containerExterior: ['container-storage-unit-tehran', 500, 500],
  openContainer: ['container-open-storage', 600, 450],
  shelving: ['warehouse-shelving-storage', 640, 480],
  homeGoods: ['depo-lavazem-khaneh', 640, 480],
  warehouse: ['warehouse-storage-tehran', 300, 300],
  officeContainer: ['container-office-storage', 739, 415],
  indoorWarehouse: ['indoor-warehouse-tehran', 320, 260],
  commercialWarehouse: ['commercial-warehouse-storage', 644, 476],
  loadingArea: ['storage-loading-area', 150, 150],
  container10: ['container-10-foot-storage', 1217, 1280],
  container15: ['container-15-foot-storage', 1122, 1402],
  container20: ['container-20-foot-storage', 1216, 1280],
  container40: ['container-40-foot-storage', 1216, 1280],
  support: ['support-team', 1280, 1235],
  packing: ['packing-service', 1280, 853],
  packingCard: ['packing-service-card', 720, 480],
  packingDetail: ['packing-service-detail', 1280, 853],
  packingBoxes: ['packing-service-boxes', 1024, 1024],
  packingMaterials: ['packing-service-materials', 1280, 853],
  transport: ['transport-service', 960, 1280],
  transportCard: ['transport-service-card', 720, 960],
  transportDetail: ['transport-service-detail', 1280, 958],
  transportLoading: ['transport-service-loading', 960, 1280],
  arrangement: ['arrangement-service', 1280, 719],
  arrangementCard: ['arrangement-service-card', 720, 405],
  arrangementDetail: ['arrangement-service-detail', 1280, 960],
  arrangementWarehouse: ['arrangement-service-warehouse', 1280, 1040],
  warehouseIntro: ['warehouse-intro', 960, 1280],
  warehouseIntroDetail: ['warehouse-intro-detail', 1280, 960],
  warehouseIntroWest: ['warehouse-intro-west', 960, 1280],
  warehouseIntroSouth: ['warehouse-intro-south', 960, 1280]
};

const escapeHtml = (value = '') => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const canonicalUrl = (page) => {
  if (page.slug === 'index') return baseSiteUrl;
  const clean = cleanUrlMap[page.slug];
  return clean ? `${baseSiteUrl}/${clean}` : `${baseSiteUrl}/${page.slug}.html`;
};

const picture = (key, alt, classes, options = {}) => {
  const [filename, width, height] = imageMeta[key];
  const loading = options.eager ? 'eager' : 'lazy';
  const priority = options.eager ? ' fetchpriority="high"' : '';
  return `<picture>
    <source srcset="assets/images/${filename}.webp" type="image/webp">
    <img src="assets/images/${filename}.jpg" width="${width}" height="${height}" alt="${escapeHtml(alt)}" class="${classes}" loading="${loading}" decoding="async"${priority}>
  </picture>`;
};

const figurePicture = (key, alt, classes, caption, options = {}) => `<figure class="${options.figureClass || 'media-figure'}">
  ${picture(key, alt, classes, options)}
  <figcaption>${escapeHtml(caption)}</figcaption>
</figure>`;

const phoneLinks = (className = '') => phones.map(([raw, display]) =>
  `<a href="tel:${raw}" class="phone-link dir-ltr ${className}">${display}</a>`
).join('');

const phoneSheetButton = (label, className = 'btn btn-primary', ariaLabel = label) =>
  `<button class="${className}" type="button" data-sheet-open="phone-sheet" aria-haspopup="dialog" aria-controls="phone-sheet" aria-expanded="false" aria-label="${escapeHtml(ariaLabel)}">${escapeHtml(label)}</button>`;

const whatsappButton = (label = 'مشاوره واتساپ', className = 'btn btn-secondary') =>
  `<a class="${className}" href="https://wa.me/${whatsappNumber[0]}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)}">${escapeHtml(label)}</a>`;

const serviceImageKey = (slug) => ({
  'ejare-anbar-tehran': 'warehouse',
  'ejare-anbar-containeri-tehran': 'containerExterior',
  'depo-lavazem-khaneh': 'homeGoods',
  'bastebandi-lavazem-anbar': 'packing',
  'haml-o-naghl-anbar': 'transport',
  'chideman-anbar': 'arrangement'
}[slug] || 'containerService');

const sizeImageKey = (slug) => ({
  'ejare-container-10-foot': 'container10',
  'ejare-container-15-foot': 'container15',
  'ejare-container-20-foot': 'container20',
  'ejare-container-30-foot': 'warehouseIntroSouth',
  'ejare-container-40-foot': 'container40',
  'ejare-anbar-6-metri': 'packingBoxes',
  'ejare-anbar-10-metri': 'packingMaterials',
  'ejare-anbar-12-metri': 'arrangementWarehouse',
  'ejare-anbar-20-metri': 'indoorWarehouse'
}[slug] || 'containerExterior');

const locationImageKey = (slug) => ({
  'ejare-anbar-gharb-tehran': 'warehouseIntroWest',
  'ejare-anbar-shargh-tehran': 'warehouseIntro',
  'ejare-anbar-shomal-tehran': 'warehouseIntroDetail',
  'ejare-anbar-markaz-tehran': 'shelving',
  'ejare-anbar-jonoub-tehran': 'commercialWarehouse',
  'ejare-anbar-karaj': 'openContainer'
}[slug] || 'warehouse');

const infoImageKey = (slug) => ({
  about: 'officeContainer',
  contact: 'support'
}[slug] || 'indoorWarehouse');

const branchCards = (className = '') => `<div class="branch-groups ${className}">
  ${branchGroups.map((group) => `<article class="branch-group branch-group-${group.key}">
    <div class="branch-group-heading">
      <span aria-hidden="true">${group.key === 'west' ? 'W' : group.key === 'south' ? 'S' : 'E'}</span>
      <div><h3>${group.title}</h3><p>${group.description}</p></div>
    </div>
    <ul>
      ${group.branches.map((branch) => `<li><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></svg><span>شعبه ${branch}</span></li>`).join('')}
      ${group.more ? `<li class="branch-more">${group.more}</li>` : ''}
    </ul>
  </article>`).join('')}
</div>`;

const bottomSheets = () => `
<div class="sheet-backdrop" data-sheet-backdrop hidden></div>
<section id="phone-sheet" class="bottom-sheet phone-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="phone-sheet-title" hidden>
  <div class="sheet-handle" aria-hidden="true"></div>
  <div class="sheet-support-card">
    ${picture('support', 'پشتیبانی تلفنی دپو سازگار برای انتخاب انبار', 'sheet-support-image')}
    <div>
      <span class="eyebrow">پاسخ‌گویی و راهنمایی</span>
      <strong>برای انتخاب متراژ، مسیر شعبه و زمان بازدید تماس بگیرید.</strong>
    </div>
  </div>
  <div class="sheet-header">
    <div><span class="eyebrow">همه خطوط پاسخ‌گویی</span><h2 id="phone-sheet-title">تماس فوری با دپو سازگار</h2></div>
    <button class="sheet-close" type="button" data-sheet-close aria-label="بستن پنل تماس">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
    </button>
  </div>
  <p class="sheet-intro">برای انتخاب متراژ، استعلام شرایط شعب و هماهنگی بازدید با یکی از شماره‌های زیر تماس بگیرید.</p>
  <div class="sheet-phone-grid">${phoneLinks('sheet-phone-link')}</div>
  <a class="management-phone-card" href="tel:${managementPhone[0]}" aria-label="تماس با مدیریت دپو سازگار">
    <span>ارتباط مستقیم با مدیریت</span>
    <strong class="dir-ltr">${managementPhone[1]}</strong>
  </a>
</section>
<section id="locations-sheet" class="bottom-sheet locations-sheet" role="dialog" aria-modal="true" aria-labelledby="locations-sheet-title" hidden>
  <div class="sheet-handle" aria-hidden="true"></div>
  <div class="sheet-header">
    <div><span class="eyebrow">استان تهران و استان البرز</span><h2 id="locations-sheet-title">شعب و محدوده‌های دپو سازگار</h2></div>
    <button class="sheet-close" type="button" data-sheet-close aria-label="بستن پنل لوکیشن‌ها">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
    </button>
  </div>
  <div class="sheet-scroll">
    ${branchCards('branch-groups-sheet')}
    <a class="karaj-sheet-link" href="ejare-anbar-karaj.html"><strong>اجاره انبار در کرج</strong><span>مشاهده راهنمای مسیر، متراژ و هماهنگی شعبه ←</span></a>
  </div>
</section>`;

const getFaqs = (page) => {
  if (page.slug === 'index') {
    return [
      ['برای انتخاب اندازه انبار از کجا شروع کنیم؟', 'تعداد اتاق‌ها، وسایل بزرگ و تعداد تقریبی کارتن‌ها را اعلام کنید. پس از برآورد اولیه، اندازه‌های نزدیک با هم مقایسه می‌شوند تا فضای اضافه اجاره نکنید.'],
      ['آیا پیش از رزرو امکان بازدید وجود دارد؟', 'هماهنگی بازدید بخشی از فرایند پیشنهادی است. زمان، محل دقیق و گزینه موجود را تلفنی قطعی کنید و ویژگی‌های مهم را هنگام بازدید بررسی کنید.'],
      ['چه وسایلی را نباید بدون هماهنگی به انبار برد؟', 'مواد خطرناک، قابل اشتعال، فاسدشدنی، غیرقانونی یا اقلام دارای شرایط نگهداری تخصصی نباید بدون تأیید کتبی وارد شوند. فهرست محدودیت‌ها را پیش از حمل بگیرید.'],
      ['هزینه اجاره چگونه مشخص می‌شود؟', 'اندازه فضا، مدت قرارداد، محل و شرایط گزینه موجود بر قیمت اثر می‌گذارد. برای عدد معتبر باید حجم بار و تاریخ شروع مشخص باشد.'],
      ['اجاره کوتاه‌مدت و بلندمدت چه تفاوتی دارد؟', 'در اجاره کوتاه‌مدت سرعت تحویل مهم‌تر است؛ برای دوره طولانی باید بسته‌بندی، شرایط تمدید، دسترسی و هزینه کل قرارداد دقیق‌تر بررسی شود.']
    ];
  }

  const location = locationProfiles[page.slug];
  if (location) {
    return [
      [`برای اجاره انبار ویژه کاربران ${location.label} چه اطلاعاتی لازم است؟`, `محله مبدأ، نوع وسایل، حجم تقریبی، زمان شروع و دفعات دسترسی را بگویید. با این اطلاعات می‌توان اندازه و مسیر حمل را واقع‌بینانه‌تر مقایسه کرد.`],
      [`آیا انبار حتماً داخل ${location.label} قرار دارد؟`, 'محدوده دقیق هر گزینه به ظرفیت موجود در زمان تماس وابسته است. پیش از رزرو، نشانی، زمان مسیر و هزینه حمل را دریافت و با گزینه‌های دیگر مقایسه کنید.'],
      ['برای کاهش هزینه حمل چه کاری مؤثرتر است؟', `${location.localTip}. همچنین بار را فهرست کنید تا خودروی نامتناسب یا سفر اضافه انتخاب نشود.`],
      ['شرایط امنیت و دسترسی چگونه تأیید می‌شود؟', 'نوع حفاظت، قفل، دوربین، نگهبانی، ساعات مراجعه و مسئولیت طرفین را برای همان فضای پیشنهادی در بازدید و متن قرارداد کنترل کنید.'],
      ['قرارداد کوتاه‌مدت برای متقاضیان این منطقه مناسب است؟', 'اگر زمان اسباب‌کشی یا بازسازی مشخص است، دوره کوتاه می‌تواند منطقی باشد. حداقل مدت، شیوه تمدید و هزینه تخلیه را برای گزینه موجود بپرسید.']
    ];
  }

  const district = districtProfiles[page.slug];
  if (district) {
    return [
      [`برای اجاره انبار در ${district.label} از کجا شروع کنیم؟`, `محله مبدأ، نوع وسایل، مدت نگهداری و نیاز به حمل را اعلام کنید. با این اطلاعات می توان اندازه مناسب و مسیر دسترسی از ${district.label} را بهتر مقایسه کرد.`],
      [`آیا همه محله های ${district.label} پوشش داده می شوند؟`, 'پوشش نهایی به ظرفیت موجود، نشانی دقیق انبار و زمان تماس وابسته است. پیش از رزرو، مسیر واقعی، هزینه حمل و شرایط ورود خودرو را برای گزینه مشخص بررسی کنید.'],
      ['قیمت اجاره انبار در این منطقه چگونه محاسبه می شود؟', 'قیمت به متراژ، مدت اجاره، نوع فضای نگهداری، حجم و جنس وسایل، نیاز به بسته بندی، هزینه حمل و فاصله تا محل تحویل وابسته است.'],
      ['برای وسایل منزل چه متراژی مناسب است؟', 'برای وسایل محدود، ۶ یا ۱۰ متر می تواند کافی باشد؛ برای اثاثیه بیشتر معمولاً ۱۲ یا ۲۰ متر و در بعضی موارد کانتینر ۲۰ فوت بررسی می شود.'],
      ['آیا اجاره کانتینر یا کانکس هم قابل بررسی است؟', 'برای بار حجیم، فضای مستقل یا نگهداری طولانی تر می توان گزینه کانتینری را بررسی کرد. کانکس بیشتر برای کاربری موقت و پروژه ای مطرح می شود و باید شرایط واقعی موجود تأیید شود.']
    ];
  }

  const local = localProfiles[page.slug];
  if (local) {
    return [
      [`آیا امکان اجاره انبار کوتاه مدت در ${local.name} وجود دارد؟`, 'بسته به ظرفیت موجود و زمان شروع، دوره کوتاه مدت قابل بررسی است. تاریخ تقریبی ورود و خروج را اعلام کنید تا حداقل مدت و شرایط تمدید روشن شود.'],
      [`برای وسایل منزل در ${local.name} چه متراژی مناسب است؟`, 'اگر وسایل محدود و کارتنی باشد ۶ تا ۱۰ متر می تواند نقطه شروع باشد؛ برای اثاثیه کامل تر، ۱۲ یا ۲۰ متر و گاهی کانتینر ۲۰ فوت بررسی می شود.'],
      [`آیا امکان حمل وسایل از ${local.name} تا انبار وجود دارد؟`, `هماهنگی حمل با توجه به ${local.access}، طبقه، آسانسور، محل توقف و حجم بار بررسی می شود. نشانی دقیق را پیش از اعزام خودرو تأیید کنید.`],
      [`قیمت اجاره انبار در ${local.name} چگونه محاسبه می شود؟`, 'قیمت قطعی بدون مشخص شدن حجم، مدت، نوع فضا، نیاز به حمل، بسته بندی و فاصله تا محل تحویل قابل اعلام دقیق نیست.'],
      [`آیا اجاره کانتینر یا کانکس برای ${local.name} امکان پذیر است؟`, 'در صورت تناسب با نوع بار و ظرفیت موجود، انبار کانتینری قابل بررسی است. عبارت اشتباه «اجازه کانتینر» هم معمولاً همان اجاره کانتینر را منظور می کند.'],
      [`برای اسباب کشی از ${local.name} می توان انبار موقت گرفت؟`, 'بله، وقتی تاریخ تخلیه و تحویل هم زمان نیست، انبار موقت می تواند وسایل را تا آماده شدن مقصد بعدی منظم و قابل پیگیری نگه دارد.']
    ];
  }

  const size = sizeProfiles[page.slug];
  if (size) {
    return [
      [`چه وسایلی برای ${size.label} مناسب‌اند؟`, `${size.suitable}. اندازه نهایی به ابعاد واقعی، قابلیت باز شدن قطعات و شیوه چیدمان وابسته است.`],
      [`چطور بفهمیم ${size.label} کوچک نیست؟`, `پیش از تصمیم، ${size.measure} را ثبت کنید. یک طرح ساده از کف، خطای برآورد را از حدس چشمی کمتر می‌کند.`],
      ['آیا می‌توان وسایل را تا سقف روی هم چید؟', 'تنها کارتن‌های سالم و هم‌اندازه را با رعایت وزن روی هم بگذارید. وسایل شکننده، مبلمان و لوازم برقی نباید زیر فشار ستون‌های بلند قرار بگیرند.'],
      ['پیش از امضای قرارداد چه چیزهایی بررسی شود؟', 'ابعاد مفید، وضعیت کف و سقف، نحوه قفل، ساعات دسترسی، محدودیت کالا، هزینه‌ها و مسئولیت خسارت را برای فضای مشخص بررسی و ثبت کنید.'],
      [`آیا ${size.label} را می‌توان کوتاه‌مدت اجاره کرد؟`, 'مدت‌های قابل ارائه به ظرفیت و شرایط روز وابسته‌اند. تاریخ شروع و پایان تقریبی را اعلام کنید و حداقل مدت و شیوه تمدید را پیش از رزرو بپرسید.']
    ];
  }

  const service = serviceProfiles[page.slug];
  if (service) {
    return [
      [`فرایند ${service.label} چگونه آغاز می‌شود؟`, `${service.process}. تا پیش از مشخص شدن حجم و گزینه نهایی، قیمت تلفنی را برآورد اولیه در نظر بگیرید.`],
      ['آیا بسته‌بندی و حمل نیز هماهنگ می‌شود؟', 'نیاز خود به حمل یا بسته‌بندی را هنگام تماس مطرح کنید. دامنه خدمت، هزینه و مسئولیت مجری باید جداگانه و شفاف برای همان سفارش تأیید شود.'],
      ['چه مواردی را در بازدید کنترل کنیم؟', `${service.cautions}. از موارد مهم عکس بگیرید و توافق شفاهی را در قرارداد وارد کنید.`],
      ['چگونه متراژ اضافه اجاره نکنیم؟', 'وسایل بزرگ را اندازه بگیرید، قطعات قابل باز شدن را مشخص کنید و تعداد کارتن‌ها را بنویسید. سپس دو اندازه نزدیک را با نقشه چیدمان مقایسه کنید.'],
      ['هزینه نهایی این خدمت به چه عواملی بستگی دارد؟', 'اندازه و نوع فضا، مدت قرارداد، محل، ظرفیت موجود و خدمات جانبی روی هزینه اثر دارند. مبلغ نهایی را پس از تعیین گزینه مشخص مکتوب کنید.']
    ];
  }

  if (page.slug === 'contact') {
    return [
      ['برای مشاوره اولیه چه اطلاعاتی آماده کنیم؟', 'نوع وسایل، تعداد اتاق یا کارتن، اقلام بزرگ، محله مبدأ، تاریخ شروع و مدت تقریبی را یادداشت کنید تا تماس کوتاه‌تر و نتیجه دقیق‌تر باشد.'],
      ['از کدام شماره می‌توان تماس گرفت؟', 'تمام شماره‌های ثابت و همراه معتبر در همین صفحه، بخش تماس نهایی و فوتر درج شده‌اند؛ می‌توانید از هرکدام که پاسخ‌گو است استفاده کنید.'],
      ['آیا قیمت تلفنی قطعی است؟', 'تا زمانی که حجم، فضای مشخص و شرایط قرارداد روشن نشده باشد، عدد تلفنی برآورد است. قیمت نهایی را همراه با مدت و خدمات جانبی مکتوب کنید.'],
      ['چطور برای بازدید هماهنگ کنیم؟', 'پس از گفت‌وگوی اولیه، گزینه موجود و زمان مناسب را با کارشناس قطعی کنید. محل دقیق، نام پاسخ‌گو و مواردی را که می‌خواهید بررسی کنید همراه داشته باشید.'],
      ['چطور فهرست وسایل را برای مشاوره آماده کنیم؟', 'نام اقلام بزرگ، تعداد تقریبی کارتن‌ها، محله مبدأ و مدت نگهداری را یادداشت کنید و هنگام تماس برای کارشناس بخوانید. از اعلام اطلاعات هویتی غیرضروری خودداری کنید.']
    ];
  }

  return [
    ['دپو سازگار چه مسئله‌ای را حل می‌کند؟', 'هدف، ساده کردن انتخاب فضای مناسب برای وسایل خانه، دفتر یا کالای مجاز است؛ از برآورد حجم تا مقایسه اندازه و هماهنگی بازدید.'],
    ['چرا بازدید پیش از قرارداد مهم است؟', 'عنوان کلی انبار درباره همه جزئیات چیزی نمی‌گوید. وضعیت واقعی بدنه، کف، قفل، دسترسی و شرایط محیطی را باید برای گزینه مشخص دید.'],
    ['چه اطلاعاتی باید در قرارداد باشد؟', 'نشانی و مشخصات فضا، مدت، مبلغ، شیوه پرداخت، ساعات دسترسی، فهرست محدودیت‌ها، مسئولیت‌ها و شرایط تحویل باید روشن و قابل استناد باشند.'],
    ['برای شروع مشاوره چه کنیم؟', 'یک فهرست کوتاه از وسایل و اقلام بزرگ آماده کنید، محله مبدأ و زمان مورد نیاز را بگویید و سپس گزینه‌های پیشنهادی را مقایسه کنید.'],
    ['چه زمانی باید اندازه بزرگ‌تر را انتخاب کرد؟', 'وقتی اقلام غیرقابل‌چیدن زیادند یا دسترسی دوره‌ای لازم است، فضای راهرو ارزش دارد. تصمیم را با ابعاد واقعی و هزینه کل مقایسه کنید.']
  ];
};

const faqSection = (faqs) => `<section class="section section-muted" aria-labelledby="faq-title">
  <div class="container content-narrow">
    <div class="section-heading">
      <span class="eyebrow">پاسخ روشن پیش از تصمیم</span>
      <h2 id="faq-title">سوالات متداول</h2>
    </div>
    <div class="faq-list">
      ${faqs.map(([question, answer]) => `<details class="faq-item">
        <summary>${escapeHtml(question)}</summary>
        <p>${escapeHtml(answer)}</p>
      </details>`).join('')}
    </div>
  </div>
</section>`;

const getCtaCopy = (page) => {
  const profile = localProfiles[page.slug] || districtProfiles[page.slug] || locationProfiles[page.slug] || sizeProfiles[page.slug] || serviceProfiles[page.slug] || pageProfiles[page.slug];
  if (profile?.cta) return profile.cta;
  return 'نوع وسایل، حجم تقریبی و مدت مورد نیاز را اعلام کنید تا انتخاب فضای مناسب از یک برآورد روشن شروع شود.';
};

const midCta = (page, title) => `<aside class="mid-cta" aria-label="مشاوره ${escapeHtml(page.h1)}">
  <div>
    <span class="eyebrow">پیش از حمل، ظرفیت را بررسی کنید</span>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(getCtaCopy(page))}</p>
  </div>
  <div class="mid-cta-actions">
    ${phoneSheetButton('دریافت همه شماره‌ها', 'btn btn-primary', `نمایش همه شماره‌ها برای ${page.h1}`)}
    ${whatsappButton('مشاوره واتساپ')}
    <a class="btn btn-secondary" href="contact.html">راهنمای پیش از تماس</a>
  </div>
</aside>`;

const finalCta = (page) => `<section class="final-cta" aria-labelledby="final-cta-title">
  <div class="container final-cta-grid">
    <div>
      <span class="eyebrow eyebrow-light">یک تماس تا برآورد اولیه</span>
      <h2 id="final-cta-title">برای ${escapeHtml(page.h1)} راهنمایی می‌خواهید؟</h2>
      <p>${escapeHtml(getCtaCopy(page))} ۹ خط ثابت و همراه برای مشاوره و هماهنگی در دسترس است.</p>
      <div class="final-cta-actions">
        ${phoneSheetButton('نمایش همه شماره‌های تماس', 'btn btn-primary', 'باز کردن فهرست ۹ شماره تماس دپو سازگار')}
        ${whatsappButton('مشاوره واتساپ', 'btn btn-on-dark')}
        <a class="btn btn-on-dark" href="contact.html">مشاهده صفحه تماس</a>
      </div>
    </div>
    <div class="final-cta-signal" aria-label="مزیت تماس با دپو سازگار">
      <strong>۹</strong>
      <span>خط پاسخ‌گویی ثابت و همراه</span>
      <small>اگر یک خط مشغول بود، از پنل تماس شماره بعدی را انتخاب کنید.</small>
    </div>
  </div>
</section>`;

const detailsList = (items) => `<ul class="check-list">${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;

const relatedLinks = (links) => `<aside class="related-box" aria-labelledby="related-title">
  <h2 id="related-title">راهنماهای مرتبط</h2>
  <div class="related-links">${links.map(([href, label]) => `<a href="${href}">${escapeHtml(label)}<span aria-hidden="true">←</span></a>`).join('')}</div>
</aside>`;

const pageHref = (slug) => {
  if (slug === 'index') return 'index.html';
  const clean = cleanUrlMap[slug];
  return clean || `${slug}.html`;
};

const districtLocalLinks = (districtSlug) => Object.entries(localProfiles)
  .filter(([, profile]) => profile.regionSlug === districtSlug)
  .map(([slug, profile]) => [pageHref(slug), `اجاره انبار در ${profile.name}`]);

const localPageLinkByShortSlug = (shortSlug) => {
  const pageSlug = localSlugByShortSlug[shortSlug];
  if (!pageSlug) return null;
  return [pageHref(pageSlug), localProfiles[pageSlug].name];
};

const localSizesLinks = () => [
  ['ejare-anbar-6-metri.html', 'اجاره انبار ۶ متری'],
  ['ejare-anbar-10-metri.html', 'اجاره انبار ۱۰ متری'],
  ['ejare-anbar-12-metri.html', 'اجاره انبار ۱۲ متری'],
  ['ejare-anbar-20-metri.html', 'اجاره انبار ۲۰ متری'],
  ['ejare-container-10-foot.html', 'اجاره کانتینر ۱۰ فوت'],
  ['ejare-container-20-foot.html', 'اجاره کانتینر ۲۰ فوت'],
  ['ejare-container-40-foot.html', 'اجاره کانتینر ۴۰ فوت']
];

const localDirectory = (cityKey) => Object.entries(localProfiles)
  .filter(([, profile]) => profile.cityKey === cityKey)
  .map(([slug, profile]) => [pageHref(slug), profile.name]);

const districtDirectory = (city) => Object.entries(districtProfiles)
  .filter(([, profile]) => profile.city === city)
  .map(([slug, profile]) => [pageHref(slug), profile.label]);

const directoryLinkList = (links, className = 'related-links') => `<div class="${className}">
  ${links.map(([href, label]) => `<a href="${href}">${escapeHtml(label)}<span aria-hidden="true">←</span></a>`).join('')}
</div>`;

const directoryDisclosure = (title, description, links) => `<details class="directory-disclosure">
  <summary>
    <span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(description)}</small></span>
    <b aria-hidden="true">+</b>
  </summary>
  ${directoryLinkList(links, 'related-links directory-links')}
</details>`;

const serviceRelatedLinks = (links) => {
  const priorityLocalLinks = ['ejare-anbar-tajrish', 'ejare-anbar-saadat-abad', 'ejare-anbar-tehranpars', 'ejare-anbar-chitgar', 'ejare-anbar-karaj-azimiyeh']
    .filter((slug) => localProfiles[slug])
    .map((slug) => [pageHref(slug), `صفحه محلی ${localProfiles[slug].name}`]);
  const seen = new Set();
  return [...links, ...priorityLocalLinks].filter(([href]) => {
    if (seen.has(href)) return false;
    seen.add(href);
    return true;
  }).slice(0, 10);
};

const districtContent = (page, profile) => {
  const localLinks = districtLocalLinks(page.slug);
  const cityDirectory = profile.city === 'کرج' ? districtDirectory('کرج') : districtDirectory('تهران');
  const fallbackLinks = profile.city === 'کرج'
    ? [['ejare-anbar-karaj.html', 'راهنمای اجاره انبار کرج'], ...localDirectory('karaj').slice(0, 5)]
    : [['ejare-anbar-tehran.html', 'راهنمای اجاره انبار تهران'], ['ejare-anbar-shomal-tehran.html', 'شمال تهران'], ['location/west-tehran', 'غرب تهران'], ['location/east-tehran', 'شرق تهران'], ['ejare-anbar-markaz-tehran.html', 'مرکز تهران']];
  const publishedLocalLinks = localLinks.length ? localLinks : fallbackLinks;
  return `<section class="page-hero">
  <div class="container page-hero-grid">
    <div>
      <span class="eyebrow">صفحه مادر محله های ${profile.label}</span>
      <h1>${escapeHtml(page.h1)}</h1>
      <p class="lead">${escapeHtml(page.description)}</p>
      <div class="hero-actions">
        ${phoneSheetButton('مشاوره منطقه ای', 'btn btn-primary', `نمایش همه شماره ها برای ${page.h1}`)}
        <a class="btn btn-secondary" href="#district-guide">مشاهده محله ها</a>
      </div>
    </div>
    ${figurePicture(profile.city === 'کرج' ? 'openContainer' : locationImageKey('ejare-anbar-shomal-tehran'), `راهنمای اجاره انبار برای ${profile.label}`, 'page-hero-image', `نمونه فضای نگهداری؛ گزینه مناسب ${profile.label} پس از بررسی مسیر و حجم وسایل انتخاب می شود.`, { figureClass: 'page-hero-figure' })}
  </div>
</section>
<article id="district-guide" class="section article-shell">
  <div class="container content-reading">
    <p class="article-intro">${profile.label} به دلیل ${profile.character} فقط با یک پیشنهاد عمومی پوشش داده نمی شود. متقاضی اجاره انبار در این محدوده باید هم حجم وسایل را بسنجد و هم مسیر حمل از محله مبدأ تا فضای پیشنهادی را بررسی کند. اگر هنوز در مرحله مقایسه شهری هستید، صفحه <a href="${profile.parentHref}">${profile.parentLabel}</a> نقطه شروع خوبی است.</p>
    <p>محله های شاخص این محدوده شامل ${profile.neighborhoods} هستند. هرکدام بافت، عرض کوچه، امکان توقف و نوع بار رایج متفاوتی دارند. برای همین بهتر است پیش از تماس، وسایل را به سه گروه اثاثیه حجیم، کارتن و اقلام حساس تقسیم کنید. این کار کمک می کند بین انبار متراژی، انبار کانتینری و فضای دارای راهرو انتخاب دقیق تری داشته باشید.</p>

    <h2>چه کسانی در ${profile.label} به اجاره انبار نیاز دارند؟</h2>
    <p>خانواده هایی که در حال اسباب کشی هستند، کسانی که خانه را بازسازی می کنند، دانشجویان یا مستأجرانی که فاصله میان دو قرارداد دارند، فروشگاه ها و کسب وکارهایی که موجودی سبک نگه می دارند و افرادی که جهیزیه، اسناد، تجهیزات یا وسایل فصلی دارند، بیشترین نیاز را در این محدوده ایجاد می کنند. در همه این حالت ها هدف، پیدا کردن فضایی است که به اندازه واقعی وسایل نزدیک باشد و هزینه حمل آن از خود اجاره بیشتر نشود.</p>
    ${detailsList([
      'برای اثاثیه منزل، اقلام غیرقابل چیدن مانند یخچال، مبل و کمد را جدا اندازه بگیرید.',
      'برای دفتر یا فروشگاه، بایگانی و کالا را با کد و تاریخ ورود برچسب بزنید.',
      'برای جهیزیه یا وسایل حساس، بسته بندی قابل تنفس و عکس وضعیت ظاهری را فراموش نکنید.',
      'برای نگهداری کوتاه مدت، تاریخ تخلیه و تحویل مقصد را واقع بینانه اعلام کنید.',
      'برای مراجعه دوره ای، راهروی دسترسی را از ابتدا در متراژ لحاظ کنید.'
    ])}

    <h2>دسترسی و برنامه حمل در ${profile.label}</h2>
    <p>مسیرهای مهم این محدوده عبارت اند از ${profile.access}. با این حال مسیر کوتاه همیشه ارزان ترین مسیر نیست. ساعت حرکت، امکان توقف خودرو، طبقه مبدأ، آسانسور، محدودیت مجتمع و تعداد نیروی حمل روی هزینه نهایی اثر دارد. نشانی دقیق فضای پیشنهادی، زمان قابل مراجعه و شرایط ورود خودرو را پیش از رزرو نهایی بپرسید.</p>
    <p>اگر چند محله از یک منطقه درگیر بارگیری هستند، ترتیب توقف ها را از قبل مشخص کنید. اقلام شکننده و حساس بهتر است دیرتر بارگیری و زودتر تخلیه شوند. برای بار اداری، فهرست تحویل را جدا از فاکتورهای مالی نگه دارید تا در زمان تخلیه، اختلافی درباره تعداد بسته ها یا وضعیت ظاهری به وجود نیاید.</p>
    ${midCta(page, `بررسی گزینه مناسب برای ${profile.label}`)}

    <h2>محله های مهم ${profile.label}</h2>
    <p>محله های مهم این محدوده را در فهرست زیر می بینید. اگر محله شما در همین حوالی است، هنگام تماس نام دقیق مبدأ، حجم وسایل و مدت نگهداری را اعلام کنید تا مسیر حمل، متراژ مناسب و گزینه های نزدیک تر بررسی شوند.</p>
    ${directoryLinkList(publishedLocalLinks)}

    <h2>انتخاب متراژ و خدمات جانبی</h2>
    <p>برای بار محدود، انبار ۶ متری یا ۱۰ متری می تواند گزینه اقتصادی باشد. برای جهیزیه، وسایل یک واحد کوچک یا بار اداری متوسط، ۱۲ متر و ۲۰ متر را با هم مقایسه کنید. اگر بار حجیم، طولانی مدت یا نیازمند فضای مستقل است، <a href="container-storage">انبار کانتینری</a> و اندازه های ۱۰، ۲۰ یا ۴۰ فوت هم قابل بررسی است. بسته بندی، حمل و چیدمان باید جداگانه قیمت گذاری و در توافق نهایی روشن شود.</p>
    ${directoryLinkList(localSizesLinks())}

    <h2>قیمت اجاره انبار در ${profile.label} چقدر است؟</h2>
    <p>قیمت قطعی بدون اطلاعات دقیق اعلام نمی شود. متراژ، مدت زمان اجاره، نوع فضای نگهداری، نیاز به حمل ونقل، نوع وسایل، خدمات بسته بندی و فاصله تا محل تحویل روی هزینه اثر دارند. برای دریافت عدد معتبر، تعداد اتاق ها، اقلام بزرگ، تعداد تقریبی کارتن ها، تاریخ شروع و محله مبدأ را آماده کنید.</p>
    <p class="article-callout">${profile.cta} تصمیم درست زمانی گرفته می شود که اجاره ماهانه، هزینه حمل، امکان مراجعه و ریسک آسیب وسایل هم زمان بررسی شوند.</p>
    ${relatedLinks([
      [profile.parentHref, profile.parentLabel],
      ['container-storage', 'اجاره انبار کانتینری'],
      ['home-appliances-storage', 'دپو لوازم خانه'],
      ['bastebandi-lavazem-anbar.html', 'بسته بندی وسایل'],
      ['haml-o-naghl-anbar.html', 'حمل ونقل تا انبار'],
      ['contact.html', 'مشاوره و تماس']
    ])}
    <aside class="related-box" aria-labelledby="all-districts-title">
      <h2 id="all-districts-title">صفحات مادر ${profile.city === 'کرج' ? 'کرج' : 'تهران'}</h2>
      ${directoryLinkList(cityDirectory)}
    </aside>
  </div>
</article>`;
};

const localContent = (page, profile) => {
  const nearbyLinks = profile.nearby
    .map(localPageLinkByShortSlug)
    .filter(Boolean)
    .map(([href, label]) => [href, `اگر در ${label} هستید، صفحه اجاره انبار در ${label} را ببینید.`]);
  const parentHref = pageHref(profile.regionSlug);
  return `<section class="page-hero">
  <div class="container page-hero-grid">
    <div>
      <span class="eyebrow">${profile.regionLabel}، ${profile.city}</span>
      <h1>${escapeHtml(page.h1)}</h1>
      <p class="lead">${escapeHtml(page.description)}</p>
      <div class="hero-actions">
        ${phoneSheetButton('تماس فوری برای قیمت', 'btn btn-primary', `نمایش شماره ها برای ${page.h1}`)}
        <a class="btn btn-secondary" href="#local-guide">راهنمای محله</a>
      </div>
    </div>
    ${figurePicture(profile.cityKey === 'karaj' ? 'openContainer' : locationImageKey('ejare-anbar-shomal-tehran'), `فضای نگهداری وسایل برای ${profile.name}`, 'page-hero-image', `نمونه فضای دپو؛ گزینه مناسب کاربران ${profile.name} بعد از بررسی حجم و مسیر تأیید می شود.`, { figureClass: 'page-hero-figure' })}
  </div>
</section>
<article id="local-guide" class="section article-shell">
  <div class="container content-reading">
    <p class="article-intro">اجاره انبار در ${profile.name} برای ${profile.audience} زمانی مفید است که فضای خانه، دفتر یا فروشگاه موقتاً پاسخگوی حجم وسایل نیست. این صفحه کمک می کند مسیر حمل، متراژ، نوع وسایل و گزینه های متراژی یا کانتینری را واقع بینانه تر بسنجید. برای جایگاه منطقه ای، صفحه <a href="${parentHref}">${profile.regionLabel}</a> را هم ببینید.</p>
    <p>${profile.example} پیش از تماس، وسایل را به گروه های اثاثیه حجیم، کارتن های قابل چیدن، اقلام حساس و وسایل مورد نیاز در طول قرارداد تقسیم کنید تا مشاوره متراژ از حدس دور شود.</p>

    <h2>چه کسانی در ${profile.name} به اجاره انبار نیاز دارند؟</h2>
    <p>خانواده هایی که در حال اسباب کشی هستند، کسانی که خانه را بازسازی می کنند، دانشجویان یا مستأجرها، فروشگاه ها و کسب وکارها و افرادی که جهیزیه، لوازم اضافه، اسناد، تجهیزات یا کالا دارند، معمولاً مخاطب اصلی انبار موقت در ${profile.name} هستند. هر گروه چیدمان متفاوتی می خواهد: خانه برای اثاثیه، دفتر برای بایگانی و فروشگاه برای نظم کالا.</p>
    ${detailsList([
      'برای اسباب کشی، تاریخ تخلیه و تحویل مقصد را جداگانه اعلام کنید.',
      'برای بازسازی، وسایل حساس به گردوخاک و ضربه را زودتر خارج کنید.',
      'برای دانشجو یا مستأجر، کارتن کوچک و برچسب دار حمل را ساده تر می کند.',
      'برای فروشگاه، کالاهای پرفروش باید نزدیک مسیر دسترسی باقی بمانند.',
      'برای جهیزیه، عکس، فهرست و بسته بندی تمیز ارزش بیشتری از فشرده چیدن دارد.'
    ])}

    <h2>خدمات قابل ارائه برای ${profile.name}</h2>
    <p>خدمات قابل بررسی شامل اجاره انبار وسایل منزل، اجاره کوتاه مدت و بلندمدت، انبار کانتینری، بررسی نیاز به کانکس، بسته بندی وسایل، هماهنگی حمل ونقل تا انبار و مشاوره انتخاب متراژ مناسب است. حمل، بسته بندی یا چیدمان را پیش فرض قرارداد انبار ندانید و هزینه و مسئولیت آن را جداگانه مکتوب کنید.</p>
    <p>اگر حجم بار کم است، <a href="ejare-anbar-6-metri.html">انبار ۶ متری</a> یا <a href="ejare-anbar-10-metri.html">انبار ۱۰ متری</a> می تواند کافی باشد. برای بار بیشتر، <a href="ejare-anbar-12-metri.html">۱۲ متر</a>، <a href="ejare-anbar-20-metri.html">۲۰ متر</a> یا صفحه <a href="container-storage">اجاره انبار کانتینری</a> را مقایسه کنید.</p>

    <h2>اجاره کانتینر و کانکس در ${profile.name}</h2>
    <p>اگر وسایل حجیم، کالای خشک یا بار یکپارچه دارید، اجاره کانتینر در ${profile.name} می تواند جایگزین مناسبی برای انبار متراژی باشد؛ به ویژه وقتی فضای مستقل، چیدمان یکجا یا قرارداد طولانی تر لازم است. کانکس بیشتر برای نیازهای پروژه ای و موقت مطرح می شود و باید از نظر کاربری، مسیر حمل، محل استقرار و شرایط واقعی موجود جداگانه بررسی شود.</p>

    <h2>مزایای اجاره انبار برای ساکنان ${profile.name}</h2>
    <p>مزیت اصلی، آزاد شدن فضای خانه یا محل کار بدون تصمیم عجولانه درباره فروش یا دور ریختن وسایل است. فضای امن، انتخاب متراژ مختلف، دسترسی از مسیرهای اصلی و مشاوره قبل از رزرو برای اسباب کشی، بازسازی، مهاجرت یا کمبود فضا مهم است. ${profile.tip}</p>
    <p>برای مسیر حمل می توان ${profile.access} را در نظر گرفت، اما طبقه مبدأ، آسانسور، محل توقف، ساعت مجاز ورود خودرو و فاصله واقعی تا فضای پیشنهادی هم روی هزینه اثر می گذارند.</p>
    ${midCta(page, `مشاوره رایگان اجاره انبار در ${profile.name}`)}

    <h2>قیمت اجاره انبار در ${profile.name} چقدر است؟</h2>
    <p>قیمت قطعی بدون اطلاعات دقیق قابل اعلام نیست. هزینه به متراژ انبار، مدت زمان اجاره، نوع فضای نگهداری، نیاز به حمل ونقل، نوع وسایل، خدمات بسته بندی و فاصله تا محل تحویل بستگی دارد. گاهی فضای کمی بزرگ تر، به دلیل حذف سفر دوم یا کاهش آسیب وسایل، از گزینه فشرده و ظاهراً ارزان منطقی تر است.</p>
    <p>برای دریافت قیمت دقیق اجاره انبار در ${profile.name} تماس بگیرید و تعداد اتاق ها، اقلام بزرگ، تعداد کارتن ها، مدت نگهداری و تاریخ شروع را اعلام کنید.</p>

    <h2>چه متراژی برای وسایل شما مناسب است؟</h2>
    <p>متراژ مناسب از نام محله مشخص نمی شود؛ از شکل وسایل و برنامه مراجعه مشخص می شود. برای چند کارتن و وسایل فصلی، فضای کوچک تر کافی است. برای جهیزیه یا واحد کوچک، ۱۰ یا ۱۲ متر را بررسی کنید. برای اثاثیه کامل تر، ۲۰ متر یا کانتینر ۲۰ فوت را مقایسه کنید.</p>
    ${directoryLinkList(localSizesLinks())}

    <h2>محله های نزدیک به ${profile.name}</h2>
    <p>کاربران معمولاً فقط نام یک محله را جست وجو می کنند، اما مسیر واقعی حمل ممکن است از محله های اطراف هم تأثیر بگیرد. اگر در محدوده نزدیک هستید، صفحات زیر می توانند برای مقایسه مسیر، نیاز و متراژ مفید باشند.</p>
    ${directoryLinkList(nearbyLinks.length ? nearbyLinks : [[parentHref, `مشاهده صفحه ${profile.regionLabel}`]])}
    <p class="article-callout">برای مشاوره رایگان اجاره انبار در ${profile.name} همین حالا تماس بگیرید. محله مبدأ، حجم تقریبی، زمان شروع و نیاز به بسته بندی یا حمل را دقیق اعلام کنید.</p>
    ${relatedLinks([
      [parentHref, `صفحه مادر ${profile.regionLabel}`],
      [profile.cityKey === 'karaj' ? 'ejare-anbar-karaj.html' : 'ejare-anbar-tehran.html', `اجاره انبار در ${profile.city}`],
      ['pricing', 'قیمت اجاره انبار'],
      ['rahnamay-entekhab-metraje-anbar.html', 'راهنمای انتخاب متراژ'],
      ['home-appliances-storage', 'دپو لوازم خانه'],
      ['bastebandi-lavazem-anbar.html', 'بسته بندی وسایل'],
      ['haml-o-naghl-anbar.html', 'حمل ونقل تا انبار'],
      ['contact.html', 'تماس و مشاوره']
    ])}
  </div>
</article>`;
};

const locationContent = (page, profile) => `<section class="page-hero">
  <div class="container page-hero-grid">
    <div>
      <span class="eyebrow">راهنمای انتخاب برای ${profile.label}</span>
      <h1>${escapeHtml(page.h1)}</h1>
      <p class="lead">${escapeHtml(page.description)}</p>
      <div class="hero-actions">
        ${phoneSheetButton('مشاوره انتخاب انبار', 'btn btn-primary', 'نمایش همه شماره‌ها برای مشاوره انتخاب انبار')}
        <a class="btn btn-secondary" href="#guide">مطالعه راهنمای منطقه</a>
      </div>
    </div>
    ${figurePicture(locationImageKey(page.slug), `فضای انبار برای دپو لوازم متقاضیان ${profile.label}`, 'page-hero-image', `نمونه فضای دپو؛ شرایط گزینه مناسب کاربران ${profile.label} هنگام بازدید تأیید می‌شود.`, { figureClass: 'page-hero-figure' })}
  </div>
</section>
<article id="guide" class="section article-shell">
  <div class="container content-reading">
    <p class="article-intro">جست‌وجوی انبار برای ${profile.audience} معمولاً فقط به پیدا کردن یک فضای خالی محدود نیست. زمان حرکت خودروی باربری، امکان توقف در مبدأ، تعداد دفعات مراجعه و اندازه واقعی وسایل روی هزینه نهایی اثر می‌گذارند. یک گزینه ارزان اما دور یا دشوار برای دسترسی می‌تواند با چند سفر اضافه، گران‌تر از انتخابی شود که از ابتدا بر اساس مسیر و حجم بار سنجیده شده است. برای دید کلی‌تر، <a href="ejare-anbar-tehran.html">راهنمای اجاره انبار در تهران</a> را نیز بخوانید.</p>
    <p>نیاز رایج در این محدوده شامل ${profile.needs} است. به همین دلیل بهتر است پیش از تماس، بار را به سه گروه «بزرگ و غیرقابل‌چیدن»، «کارتنی و قابل‌چیدن» و «حساس یا نیازمند بررسی بیشتر» تقسیم کنید. این دسته‌بندی به کارشناس کمک می‌کند میان انبار متراژی و <a href="container-storage">انبار کانتینری</a>، و میان فضای فشرده یا دارای راهرو، پیشنهاد دقیق‌تری ارائه کند.</p>

    <h2>نیاز کاربران ${profile.label} با یک نسخه ثابت حل نمی‌شود</h2>
    <p>${profile.uses} از کاربردهای متداول برای متقاضیان این منطقه‌اند، اما هرکدام چیدمان متفاوتی می‌خواهند. برای اثاثیه، <a href="home-appliances-storage">راهنمای دپو لوازم خانه</a> جزئیات آماده‌سازی بیشتری دارد. اثاثیه منزل معمولاً قطعات حجیم و فضای مرده بیشتری دارد؛ در مقابل، کارتن یا بایگانی را می‌توان منظم‌تر و عمودی چید. برای کالای تجاری نیز ترتیب ورود و خروج مهم است.</p>
    <h2>دسترسی و برنامه حمل از ${profile.label}</h2>
    <p>برای برنامه مسیر می‌توان ${profile.access} را بررسی کرد، اما ساعت حرکت و محدودیت محلی گاهی از کوتاهی مسیر مهم‌تر است. ${profile.logistics}. نشانی دقیق انبار و شرایط ورود خودرو را در تماس نهایی بگیرید؛ عبارت «پوشش منطقه» به‌تنهایی تضمین نمی‌کند که هر فضای موجود دقیقاً داخل همان محله باشد.</p>

    <h2>مزیت انتخاب انبار متناسب با محدوده</h2>
    <p>${profile.advantage}. معیار درست فقط فاصله کیلومتری نیست؛ زمان واقعی مسیر، هزینه خودرو، تعداد کارگر، امکان تخلیه ایمن و دفعات مراجعه باید کنار اجاره ماهانه دیده شوند. اگر قرار است تا پایان قرارداد به وسایل دست نزنید، چیدمان فشرده منطقی است. اگر مراجعه دوره‌ای دارید، هزینه کمی فضای بیشتر برای راهرو می‌تواند از بازچینی مکرر جلوگیری کند.</p>
    ${midCta(page, `مشاوره سریع برای متقاضیان ${profile.label}`)}

    <h2>انتخاب اندازه، بسته‌بندی و تحویل</h2>
    <p>برای برآورد اولیه، ابعاد کمد، یخچال، مبل، میز و هر وسیله‌ای را که روی آن نمی‌توان بار گذاشت ثبت کنید. سپس تعداد کارتن‌ها و قابلیت باز شدن پایه‌ها یا قطعات را مشخص کنید. متراژ کف به‌تنهایی گنجایش را نشان نمی‌دهد؛ ارتفاع قابل استفاده و شکل وسایل نیز تعیین‌کننده است. حاشیه‌ای برای جریان هوا و باز شدن ایمن در باقی بگذارید.</p>
    ${detailsList([
      'کارتن‌ها را با نام اتاق، محتوا و شماره ترتیبی برچسب بزنید.',
      'وسایل سنگین را پایین و اقلام شکننده را جدا و بدون فشار بچینید.',
      'لوازم برقی را تمیز و کاملاً خشک کنید و کابل‌ها را کنار همان وسیله بگذارید.',
      'از وضعیت ظاهری اقلام مهم و چیدمان نهایی عکس تاریخ‌دار نگه دارید.',
      'فهرست تحویل و شرایط مراجعه را همراه قرارداد ذخیره کنید.'
    ])}
    <p>پیش از امضا، فضای مشخص را ببینید و وضعیت کف، سقف، در، قفل، آثار رطوبت یا خوردگی و نحوه حفاظت مجموعه را بررسی کنید. درباره ساعات دسترسی، شیوه اعلام مراجعه، مسئولیت خسارت، بیمه، اقلام ممنوعه و روش تسویه پرسش روشن بپرسید. هر ویژگی مهم باید برای همان گزینه و به شکل قابل استناد تأیید شود، نه بر اساس یک توضیح کلی تبلیغاتی.</p>
    <p class="article-callout">${profile.cta} با این اطلاعات، مقایسه اندازه و مسیر از یک گفت‌وگوی کلی به تصمیمی قابل سنجش تبدیل می‌شود.</p>
    ${relatedLinks([
      ['ejare-anbar-tehran.html', 'راهنمای جامع اجاره انبار در تهران'],
      ['container-storage', 'شناخت انبار کانتینری'],
      ['home-appliances-storage', 'دپو لوازم خانه و اثاثیه'],
      ['ejare-anbar-12-metri.html', 'بررسی انبار ۱۲ متری'],
      ['contact.html', 'شماره‌ها و راهنمای تماس']
    ])}
  </div>
</article>`;

const sizeContent = (page, profile) => `<section class="page-hero">
  <div class="container page-hero-grid">
    <div>
      <span class="eyebrow">راهنمای ظرفیت و چیدمان</span>
      <h1>${escapeHtml(page.h1)}</h1>
      <p class="lead">${escapeHtml(page.description)}</p>
      <div class="hero-actions">
        ${phoneSheetButton('بررسی ظرفیت وسایل', 'btn btn-primary', 'نمایش همه شماره‌ها برای بررسی ظرفیت وسایل')}
        <a class="btn btn-secondary" href="#guide">راهنمای انتخاب اندازه</a>
      </div>
    </div>
    ${figurePicture(sizeImageKey(page.slug), `${profile.label} برای نگهداری وسایل و کالا`, 'page-hero-image size-hero-image', `نمونه چیدمان کانتینری؛ ظرفیت واقعی ${profile.label} به ابعاد مفید و نوع وسایل وابسته است.`, { figureClass: 'page-hero-figure size-hero-figure' })}
  </div>
</section>
<article id="guide" class="section article-shell">
  <div class="container content-reading">
    <p class="article-intro">${profile.label} را می‌توان ${profile.scale} دانست، اما نام متراژ یا فوت به‌تنهایی ظرفیت قطعی را نشان نمی‌دهد. ابعاد داخلی واقعی، شکل در، ارتفاع مفید و وجود اجزای سازه‌ای ممکن است فضای قابل استفاده را تغییر دهند. به همین دلیل اندازه دقیق گزینه موجود را پیش از رزرو بگیرید و آن را با معیارهای <a href="ejare-anbar-tehran.html">راهنمای انتخاب انبار در تهران</a> بسنجید.</p>
    <p>این اندازه معمولاً برای ${profile.suitable} بررسی می‌شود. بااین‌حال دو خانواده با تعداد اتاق برابر می‌توانند حجم کاملاً متفاوتی داشته باشند. مبلمان یک‌تکه، کمدی که باز نمی‌شود یا تعداد زیاد وسایل برقی فضای بیشتری از کارتن‌های منظم می‌گیرند. برای اثاثیه، نکات <a href="home-appliances-storage">دپو لوازم خانه</a> را نیز در برآورد لحاظ کنید.</p>

    <h2>${profile.label} در عمل مناسب چه وسایلی است؟</h2>
    <p>کاربرد مناسب زمانی شکل می‌گیرد که وسایل قابلیت چیدمان پایدار داشته باشند و وزن به‌درستی توزیع شود. ${profile.layout}. اقلام پرکاربرد باید نزدیک ورودی بمانند؛ وسایلی که تا پایان قرارداد نیاز نمی‌شوند می‌توانند در بخش عمیق‌تر قرار گیرند. برای جلوگیری از گم شدن، هر ردیف یا ستون را با کد روی فهرست ثبت کنید.</p>
    <p>این فضا برای ${profile.avoid} انتخاب مطلوبی نیست. اگر با فشردن بیش از اندازه فقط بتوان در را بست، دسترسی، گردش هوا و ایمنی وسایل قربانی شده است. از سوی دیگر، خالی گذاشتن بخش بزرگی از کف نیز یعنی هزینه ظرفیتی را می‌پردازید که استفاده نمی‌شود. هدف، بیشترین تراکم ممکن نیست؛ چیدمان پایدار و متناسب با برنامه مراجعه است.</p>

    <h2>مقایسه با اندازه‌های نزدیک</h2>
    <p>${profile.comparison}. برای تصمیم، مبلغ ماهانه را به‌تنهایی مقایسه نکنید. ممکن است فضای کوچک‌تر به سفر حمل دوم یا بازچینی نیاز پیدا کند؛ فضای بزرگ‌تر نیز ممکن است ماه‌ها خالی بماند. در گزینه‌های فوتی، <a href="container-storage">راهنمای انبار کانتینری تهران</a> مقایسه کامل‌تری ارائه می‌دهد.</p>
    <h2>چطور پیش از رزرو حجم را اندازه بگیریم؟</h2>
    <p>مهم‌ترین داده‌ها عبارت‌اند از ${profile.measure}. یک نقشه ساده روی کاغذ بکشید و مستطیل اقلام بزرگ را روی آن قرار دهید. سپس فضایی برای باز شدن در و مسیر دسترسی اضافه کنید. کارتن‌ها را بر اساس اندازه و وزن گروه‌بندی کنید؛ ستون‌های هم‌اندازه پایدارتر از توده‌ای با شکل‌های نامنظم‌اند.</p>
    ${detailsList([
      'قطعات قابل باز شدن تخت، میز و کمد را مشخص و یراق‌آلات را بسته‌بندی کنید.',
      'کارتن کتاب و ظروف را کوچک انتخاب کنید تا وزن هر بسته قابل کنترل بماند.',
      'روی لوازم پارچه‌ای پوشش قابل تنفس بگذارید و پلاستیک را طولانی‌مدت محکم نپیچید.',
      'یخچال و لباسشویی را خشک، درزها را تمیز و درها را کمی باز نگه دارید.',
      'برای اقلام حساس، شرایط محیطی مورد نیاز را پیش از حمل با گزینه واقعی تطبیق دهید.'
    ])}
    ${midCta(page, `ظرفیت ${profile.label} را پیش از رزرو بسنجید`)}

    <h2>بازدید و قرارداد مخصوص این اندازه</h2>
    <p>در بازدید، عدد اسمی را با ابعاد مفید داخل مقایسه کنید. کف باید برای نوع و وزن بار مناسب باشد؛ در و قفل باید درست عمل کنند و آثار نفوذ آب یا خوردگی بررسی شوند. درباره تهویه، نظافت، دفع آفات، نحوه حفاظت و محدودیت دسترسی سؤال کنید. وجود هر امکان را برای همان فضا و همان تاریخ تأیید کنید.</p>
    <p>قرارداد باید مشخصات فضا، تاریخ شروع و پایان، مبلغ و ودیعه احتمالی، شیوه تمدید، ساعات مراجعه، اقلام ممنوعه و مسئولیت طرفین را روشن کند. اگر حمل یا بسته‌بندی جداگانه انجام می‌شود، قیمت و مسئولیت آن را مستقل بنویسید. فهرست وسایل و عکس تحویل، اختلاف احتمالی را کمتر می‌کند.</p>
    <p class="article-callout">${profile.cta} تصمیم خوب زمانی گرفته می‌شود که ظرفیت، شیوه استفاده و هزینه کل هم‌زمان دیده شوند.</p>
    ${relatedLinks([
      ['ejare-anbar-tehran.html', 'راهنمای اجاره انبار در تهران'],
      ['container-storage', 'مقایسه انبارهای کانتینری'],
      ['home-appliances-storage', 'راهنمای دپو لوازم خانه'],
      ['ejare-container-20-foot.html', 'ظرفیت کانتینر ۲۰ فوت'],
      ['contact.html', 'مشاوره و هماهنگی بازدید']
    ])}
  </div>
</article>`;

const serviceContent = (page, profile) => `<section class="page-hero">
  <div class="container page-hero-grid">
    <div>
      <span class="eyebrow">خدمت تخصصی دپو سازگار</span>
      <h1>${escapeHtml(page.h1)}</h1>
      <p class="lead">${escapeHtml(page.description)}</p>
      <div class="hero-actions">
        ${phoneSheetButton('دریافت مشاوره', 'btn btn-primary', 'نمایش همه شماره‌ها برای دریافت مشاوره')}
        <a class="btn btn-secondary" href="#guide">جزئیات خدمت</a>
      </div>
    </div>
    ${figurePicture(serviceImageKey(page.slug), page.h1, 'page-hero-image', `تصویر مرتبط با ${page.h1}؛ مشخصات فضای نهایی پیش از رزرو بررسی می‌شود.`, { figureClass: 'page-hero-figure' })}
  </div>
</section>
<article id="guide" class="section article-shell">
  <div class="container content-reading">
    <p class="article-intro">${profile.label} برای ${profile.audience} کاربرد دارد. محور این خدمت ${profile.promise} است. انتخاب عجولانه فقط بر اساس قیمت ماهانه ممکن است به کمبود فضا، سفر حمل اضافه یا پرداخت هزینه برای ظرفیت خالی منجر شود؛ بنابراین فرایند باید از شناخت بار آغاز شود. برای مقایسه بیشتر، ${profile.links.slice(0, 3).map(([href, label]) => `<a href="${href}">${label}</a>`).join('، ')} را ببینید.</p>
    <p>در تماس اولیه، تعداد اتاق‌ها یا گروه‌های کالا، اقلام بزرگ، تعداد تقریبی کارتن، محله مبدأ، تاریخ شروع و مدت نگهداری مطرح می‌شود. این اطلاعات برای برآورد اولیه کافی است، اما تصمیم نهایی پس از مقایسه ابعاد مفید و مشاهده شرایط گزینه موجود قابل اتکاتر خواهد بود.</p>

    <h2>${profile.label} دقیقاً شامل چه مراحلی است؟</h2>
    <p>${profile.process}. هر مرحله یک تصمیم مشخص دارد: آیا فضا کافی است، آیا مسیر حمل عملی است، آیا ویژگی‌های محیط با جنس بار سازگارند و آیا مفاد قرارداد روشن‌اند. تا زمانی که این پرسش‌ها پاسخ نگرفته‌اند، رزرو یا اعزام بار ریسک دوباره‌کاری دارد.</p>
    <p>اگر بسته‌بندی یا حمل نیز لازم است، دامنه آن را جداگانه بپرسید. تعداد نیروی حمل، نوع خودرو، طبقه مبدأ، آسانسور و امکان توقف روی قیمت اثر می‌گذارد. خدمات جانبی را پیش‌فرض ندانید؛ هزینه، زمان و مسئولیت مجری باید برای سفارش شما تأیید و ثبت شود.</p>

    <h2>مزایای یک انتخاب حساب‌شده</h2>
    <p>${profile.benefits}. فضای درست باید با شیوه استفاده هماهنگ باشد. برای تحویل یک‌باره می‌توان چیدمان متراکم‌تری داشت، ولی برای دسترسی دوره‌ای به اسناد یا کالا باید راهرو و کدگذاری در نظر گرفت. این تفاوت ساده می‌تواند اندازه مناسب را یک پله تغییر دهد.</p>
    <p>برآورد خوب همچنین از حمل اقلام نامناسب جلوگیری می‌کند. مواد قابل اشتعال، فاسدشدنی، غیرقانونی، موجودات زنده و کالاهای دارای نیاز تخصصی نباید بدون تأیید وارد شوند. پول نقد، مدارک هویتی و اشیای بسیار ارزشمند نیز بهتر است در محل تخصصی خود نگهداری شوند.</p>
    <p>برای مقایسه واقعی، دو سناریو بنویسید: فضای کوچک‌تر با چیدمان فشرده و فضای کمی بزرگ‌تر با مسیر دسترسی. سپس اجاره کل دوره، احتمال سفر دوم باربری و زمانی را که برای پیدا کردن یا تحویل گرفتن وسایل صرف می‌شود کنار هم بگذارید. این محاسبه ساده معمولاً از تصمیم صرفاً قیمت‌محور نتیجه بهتری می‌دهد.</p>
    ${midCta(page, `استعلام شرایط ${profile.label}`)}

    <h2>بسته‌بندی و چیدمان حرفه‌ای</h2>
    <p>لوازم برقی را تمیز و خشک کنید، آب دستگاه‌ها را تخلیه کنید و کابل هر وسیله را برچسب بزنید. قطعات مبلمان را در صورت امکان باز کنید و پیچ‌ها را در کیسه‌ای متصل به همان قطعه قرار دهید. کارتن‌ها باید سالم، هم‌اندازه و دارای برچسب اتاق، محتوا و شماره باشند.</p>
    ${detailsList([
      'فهرست موجودی و عکس وضعیت ظاهری اقلام مهم را پیش از خروج ثبت کنید.',
      'کارتن سنگین را پایین و جعبه شکننده را بدون فشار در طبقات بالا بگذارید.',
      'وسایل را مستقیم به دیواره نچسبانید و فاصله مناسب برای بررسی باقی بگذارید.',
      'اقلام مورد نیاز در طول قرارداد را نزدیک مسیر دسترسی قرار دهید.',
      'نسخه قرارداد، رسید پرداخت و صورت‌جلسه تحویل را خارج از انبار نگه دارید.'
    ])}

    <h2>بازدید، شفافیت و مفاد قرارداد</h2>
    <p>${profile.cautions}. عنوان‌هایی مانند «امن» یا «عایق» باید به ویژگی قابل مشاهده و شرط مکتوب تبدیل شوند. درباره نحوه قفل، کنترل ورود، ساعات مراجعه، اعلام حادثه و رویه تحویل پرسش کنید و پاسخ‌های اثرگذار را در متن قرارداد بیاورید.</p>
    <p>قیمت نهایی باید اندازه و مشخصات فضا، مدت، شیوه تمدید، هزینه‌های جانبی و شرایط تسویه را پوشش دهد. اگر تخفیف بلندمدت مطرح است، سناریوی تخلیه زودتر یا تمدید را نیز بخوانید. قرارداد خوب فقط مبلغ را ثبت نمی‌کند؛ انتظار هر دو طرف را در طول نگهداری روشن می‌سازد.</p>
    <p class="article-callout">${profile.cta} این چند داده، مشاوره را کوتاه‌تر و پیشنهاد را به نیاز واقعی نزدیک‌تر می‌کند.</p>
    ${relatedLinks(serviceRelatedLinks(profile.links))}
  </div>
</article>`;

const infoPageContent = (page, profile) => `<section class="page-hero">
  <div class="container page-hero-grid">
    <div>
      <span class="eyebrow">${page.slug === 'contact' ? 'راه‌های ارتباط و رزرو' : 'رویکرد و معیارهای کار'}</span>
      <h1>${escapeHtml(page.h1)}</h1>
      <p class="lead">${escapeHtml(page.description)}</p>
    </div>
    ${figurePicture(infoImageKey(page.slug), page.h1, 'page-hero-image', page.slug === 'contact' ? 'پشتیبانی دپو سازگار؛ برای دریافت نشانی گزینه موجود و هماهنگی بازدید تماس بگیرید.' : 'نمونه کانتینر اداری و دپو؛ ویژگی‌های هر فضا در مشاوره بررسی می‌شود.', { figureClass: 'page-hero-figure' })}
  </div>
</section>
<article class="section article-shell">
  <div class="container content-reading">
    <p class="article-intro">دپو سازگار با تمرکز بر ${profile.focus} فعالیت می‌کند. مسئله اصلی فقط پیدا کردن چند متر فضای خالی نیست؛ اندازه، نوع وسایل، مسیر حمل، مدت نگهداری، نحوه مراجعه و شرایط واقعی فضای پیشنهادی باید کنار هم قرار گیرند. نقطه شروع می‌تواند <a href="ejare-anbar-tehran.html">راهنمای اجاره انبار تهران</a>، <a href="container-storage">معرفی انبار کانتینری</a> یا <a href="home-appliances-storage">راهنمای دپو وسایل خانه</a> باشد.</p>
    <p>${profile.approach}. این رویکرد کمک می‌کند تفاوت میان یک برآورد اولیه و پیشنهاد نهایی روشن بماند. موجودی و قیمت می‌تواند با زمان تغییر کند، بنابراین اطلاعات مربوط به محل، امکانات و هزینه برای همان گزینه و تاریخ تماس تأیید می‌شود.</p>

    <h2>${page.slug === 'contact' ? 'پیش از تماس چه چیزهایی آماده کنید؟' : 'از نیازسنجی تا انتخاب فضای مناسب'}</h2>
    <p>فهرست وسایل را به اقلام بزرگ، کارتن‌ها و موارد حساس تقسیم کنید. ابعاد کمد، تخت، یخچال، مبل یا تجهیزات تجاری را بنویسید و مشخص کنید کدام قطعات باز می‌شوند. محله مبدأ، طبقه، وجود آسانسور و محدودیت توقف خودروی باری نیز برای برآورد حمل اهمیت دارند.</p>
    <p>زمان شروع و مدت تقریبی را واقع‌بینانه اعلام کنید. قرارداد کوتاه‌مدت با دسترسی مکرر به چیدمان متفاوتی از دپوی بلندمدت و بدون مراجعه نیاز دارد. اگر تاریخ پایان نامعلوم است، شرایط تمدید و افزایش احتمالی هزینه را پیش از امضا بخوانید.</p>

    <h2>یک مشاوره مفید چه خروجی‌ای دارد؟</h2>
    <p>در پایان گفت‌وگوی اولیه باید بدانید چه اندازه‌هایی ارزش بازدید دارند، کدام اطلاعات هنوز ناقص است و هزینه‌های جانبی احتمالی چیست. پاسخ خوب لزوماً یک عدد فوری نیست؛ گاهی عکس وسایل، اندازه‌گیری یک قطعه یا بررسی مسیر لازم است تا از اجاره فضای نامتناسب جلوگیری شود.</p>
    <p>${profile.trust}. اگر ویژگی خاصی برای شما حیاتی است، آن را از ابتدا مطرح کنید. برای مثال دسترسی دوره‌ای، نگهداری اسناد، حساسیت وسایل به رطوبت یا وزن بالای کالا می‌تواند نوع فضای مناسب و شیوه چیدمان را تغییر دهد.</p>
    ${midCta(page, page.slug === 'contact' ? 'برای مشاوره، اطلاعات بار را آماده کنید' : 'انتخاب آگاهانه را از یک گفت‌وگوی روشن شروع کنید')}

    <h2>بازدید و قرارداد را جدی بگیرید</h2>
    <p>در بازدید، ابعاد مفید، وضعیت کف و سقف، در و قفل، آثار رطوبت یا خوردگی، نظافت و دسترسی خودرو را ببینید. درباره روش حفاظت، ساعات مراجعه، اقلام ممنوعه، بیمه و مسئولیت خسارت سؤال کنید. ادعای کلی را به مشاهده و بند روشن قرارداد تبدیل کنید.</p>
    <p>مشخصات فضا، مدت، مبلغ، شیوه پرداخت، شرایط تمدید و تخلیه، خدمات جانبی و فهرست تحویل باید مکتوب باشند. از وضعیت ظاهری اقلام مهم عکس بگیرید و رسیدها را خارج از انبار نگه دارید. این مستندات برای هر دو طرف مرجع شفاف‌تری می‌سازند.</p>

    <h2>${page.slug === 'contact' ? 'تمام راه‌های تماس' : 'تعهد به ارتباط شفاف'}</h2>
    <p>${profile.cta} شماره‌های ثابت برای گفت‌وگوی اداری و خطوط همراه برای دسترسی بیشتر درج شده‌اند. اگر یک خط پاسخ نداد، از شماره دیگر استفاده کنید؛ اطلاعاتی که آماده کرده‌اید باعث می‌شود ادامه گفت‌وگو منسجم بماند.</p>
    <a class="management-contact-card" href="tel:${managementPhone[0]}">
      <span>شماره مدیریت</span>
      <strong class="dir-ltr">${managementPhone[1]}</strong>
      <small>برای پیگیری مدیریتی، هماهنگی ویژه یا درخواست‌های حساس‌تر از این خط استفاده کنید.</small>
    </a>
    <div class="contact-directory" aria-label="فهرست کامل شماره‌های تماس">
      ${phones.map(([raw, display], index) => `<div><span>${raw === managementPhone[0] ? 'همراه مدیریت' : index < 4 ? 'تلفن ثابت' : 'تلفن همراه'}</span><a href="tel:${raw}" class="dir-ltr">${display}</a></div>`).join('')}
    </div>
    ${page.slug === 'contact' ? `
    <h2>شعب استان تهران، پوشش استان البرز و اطلاعات لازم هنگام تماس</h2>
    <p>دپو سازگار در غرب، جنوب و شرق استان تهران شعب فعال دارد و درخواست‌های <a href="ejare-anbar-karaj.html">اجاره انبار در کرج و استان البرز</a> را نیز پوشش می‌دهد. برای مقایسه منطقه‌ای می‌توانید راهنمای <a href="location/west-tehran">غرب تهران</a>، <a href="location/east-tehran">شرق تهران</a> و <a href="location/south-tehran">جنوب تهران</a> را بخوانید. ظرفیت و نشانی دقیق ورودی هر شعبه هنگام تماس تأیید می‌شود.</p>
    ${branchCards('branch-groups-contact')}
    ${detailsList([
      'نوع وسایل یا کالایی که قصد دپوی آن را دارید.',
      'حجم تقریبی، تعداد کارتن و ابعاد اقلام بزرگ.',
      'مدت زمان مورد نیاز و تاریخ احتمالی شروع.',
      'محدوده سکونت، محل بارگیری یا مسیر دسترسی.',
      'نیاز به مشاوره بیشتر یا هماهنگی بازدید.'
    ])}
    <div class="contact-callout">
      <strong>برای تماس آماده‌اید؟</strong>
      <p>فهرست اولیه وسایل را کنار دستتان بگذارید و از پنل تماس، یکی از ۹ خط پاسخ‌گویی را انتخاب کنید.</p>
      ${phoneSheetButton('نمایش همه شماره‌ها', 'btn btn-primary', 'نمایش ۹ شماره تماس دپو سازگار')}
    </div>
    ` : ''}
    <p>برای حفظ دقت، قیمت و ویژگی‌ها را در پیام یا قرارداد نهایی مرور کنید. اطلاعات شفاهی در تماس نخست ممکن است بر اساس برآورد حجم باشد. پیش از اعزام خودرو، نشانی دقیق، زمان تحویل، نام هماهنگ‌کننده و مبلغ‌های توافق‌شده را یک‌جا ثبت کنید.</p>
    ${relatedLinks([
      ['ejare-anbar-tehran.html', 'راهنمای اجاره انبار'],
      ['container-storage', 'اجاره انبار کانتینری'],
      ['home-appliances-storage', 'آماده‌سازی لوازم خانه'],
      ['bastebandi-lavazem-anbar.html', 'بسته‌بندی لوازم'],
      ['haml-o-naghl-anbar.html', 'حمل‌ونقل تا انبار'],
      ['chideman-anbar.html', 'چیدمان در انبار']
    ])}
  </div>
</article>`;

const homeContent = (page) => `<section class="home-hero">
  <div class="home-hero-media" aria-hidden="true">${picture('hero', '', 'home-hero-image', { eager: true })}</div>
  <div class="container home-hero-content">
    <span class="eyebrow eyebrow-light">فضای اضافه، بدون اجاره ملک اضافه</span>
    <h1>${escapeHtml(page.h1)}</h1>
    <p>دپو سازگار راهکاری ساده، اقتصادی و قابل اعتماد برای اجاره انبار، اجاره کانتینر و نگهداری وسایل منزل، جهیزیه، لوازم اداری و کالاهای کم‌حجم در استان تهران و استان البرز است.</p>
    <div class="hero-actions">
      ${phoneSheetButton('تماس برای مشاوره رایگان', 'btn btn-primary', 'نمایش همه شماره‌ها برای مشاوره رایگان')}
      <a class="btn btn-on-dark" href="#sizes">مشاهده اندازه انبارها</a>
    </div>
    <div class="hero-trust" aria-label="اصول انتخاب">
      <span>اجاره کوتاه‌مدت و بلندمدت</span><span>مناسب وسایل منزل و اداری</span><span>مشاوره انتخاب متراژ</span><span>پوشش استان تهران و استان البرز</span>
    </div>
  </div>
</section>

<section class="quick-benefits" aria-label="مزیت‌های سریع دپو سازگار">
  <div class="container quick-benefits-grid">
    <div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8l8-4 8 4v12M8 20v-7h8v7"/></svg><strong>تنوع اندازه</strong><span>از انبار کوچک تا کانتینر بزرگ</span></div>
    <div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M7 7h7.5a3 3 0 0 1 0 6H9.5a3 3 0 0 0 0 6H17"/></svg><strong>انتخاب اقتصادی</strong><span>پرداخت برای فضای نزدیک به نیاز</span></div>
    <div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12 10 17 20 7"/></svg><strong>مشاوره روشن</strong><span>مقایسه ظرفیت پیش از رزرو</span></div>
    <div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2"/></svg><strong>هماهنگی بازدید</strong><span>بررسی گزینه موجود پیش از حمل</span></div>
    <a class="quick-benefit-accent" href="bastebandi-lavazem-anbar.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 8 8-4 8 4-8 4Zm0 0v9l8 4 8-4V8M8 10v3m8-3v3"/></svg><strong>بسته‌بندی</strong><span>تفکیک، محافظت و برچسب‌گذاری اصولی وسایل پیش از جابه‌جایی</span></a>
    <a class="quick-benefit-accent" href="haml-o-naghl-anbar.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h12v10H3zM15 10h3l3 3v4h-6M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg><strong>حمل‌ونقل</strong><span>هماهنگی وسیله نقلیه متناسب با حجم بار و مسیر مبدأ تا انبار</span></a>
    <a class="quick-benefit-accent" href="chideman-anbar.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg><strong>چیدمان</strong><span>جانمایی وسایل سنگین، کارتن‌ها و مسیر دسترسی برای استفاده بهتر از فضا</span></a>
  </div>
</section>

<section class="section" aria-labelledby="services-title">
  <div class="container">
    <div class="section-heading">
      <span class="eyebrow">خدمت متناسب با نوع بار</span>
      <h2 id="services-title">راهکارهای دپو سازگار</h2>
      <p>از اسباب‌کشی موقت تا فضای جانبی کسب‌وکار، هر سناریو به اندازه و چیدمان متفاوت نیاز دارد.</p>
    </div>
    <div class="card-grid card-grid-three">
      <a class="service-card" href="ejare-anbar-tehran.html"><span>۰۱</span><h3>اجاره انبار در تهران</h3><p>راهنمای انتخاب فضای متراژی برای وسایل خانه، دفتر و کالای مجاز.</p><b>مشاهده راهنما ←</b></a>
      <a class="service-card featured" href="container-storage"><span>۰۲</span><h3>انبار کانتینری</h3><p>مقایسه ظرفیت‌های کانتینری و نکات بررسی بدنه، کف و چیدمان.</p><b>مقایسه کانتینرها ←</b></a>
      <a class="service-card" href="home-appliances-storage"><span>۰۳</span><h3>دپو لوازم خانه</h3><p>آماده‌سازی اثاثیه برای بازسازی، سفر یا فاصله میان دو جابه‌جایی.</p><b>راهنمای اثاثیه ←</b></a>
    </div>
  </div>
</section>

<section class="section prep-services" aria-labelledby="prep-services-title">
  <div class="container">
    <div class="section-heading">
      <span class="eyebrow">قبل از ورود وسایل به انبار</span>
      <h2 id="prep-services-title">بسته‌بندی، حمل‌ونقل و چیدمان اصولی</h2>
      <p>کیفیت دپو فقط به خود انبار وابسته نیست؛ آماده‌سازی درست وسایل، مسیر حمل و نقشه چیدمان روی هزینه، سلامت بار و دسترسی آینده اثر مستقیم دارد.</p>
    </div>
    <div class="prep-service-grid">
      <a class="prep-service-card" href="bastebandi-lavazem-anbar.html">
        ${picture('packingCard', 'بسته‌بندی اصولی وسایل پیش از دپو', 'prep-service-image')}
        <div><span>۰۱</span><h3>بسته‌بندی</h3><p>انتخاب کارتن مناسب، ضربه‌گیر، پوشش قابل تنفس و برچسب‌گذاری باعث می‌شود بار هنگام حمل و نگهداری قابل کنترل‌تر بماند.</p><b>راهنمای بسته‌بندی ←</b></div>
      </a>
      <a class="prep-service-card" href="haml-o-naghl-anbar.html">
        ${picture('transportCard', 'حمل‌ونقل وسایل تا انبار دپو سازگار', 'prep-service-image')}
        <div><span>۰۲</span><h3>حمل‌ونقل</h3><p>نوع خودرو، طبقه مبدأ، آسانسور، زمان توقف و مسیر شعبه باید پیش از حرکت مشخص شود تا سفر اضافه و آسیب کمتر شود.</p><b>هماهنگی حمل ←</b></div>
      </a>
      <a class="prep-service-card" href="chideman-anbar.html">
        ${picture('arrangementCard', 'چیدمان وسایل در انبار و کانتینر', 'prep-service-image')}
        <div><span>۰۳</span><h3>چیدمان</h3><p>وسایل سنگین پایین، اقلام حساس جدا، کارتن‌های هم‌اندازه در ستون و مسیر دسترسی نزدیک در، فضا را کاربردی‌تر می‌کند.</p><b>راهنمای چیدمان ←</b></div>
      </a>
    </div>
  </div>
</section>

<section class="section section-dark" id="sizes" aria-labelledby="sizes-title">
  <div class="container">
    <div class="section-heading section-heading-light">
      <span class="eyebrow eyebrow-light">نه کوچک، نه پرهزینه</span>
      <h2 id="sizes-title">اندازه‌ای نزدیک به حجم واقعی</h2>
      <p>چهار نقطه شروع رایج را ببینید؛ اندازه نهایی پس از بررسی فهرست وسایل و ابعاد مفید انتخاب می‌شود.</p>
    </div>
    <div class="size-grid">
      <a href="ejare-container-10-foot.html"><strong>۱۰ فوت <small>(۶ متر)</small></strong><span>کارتن و وسایل محدود</span></a>
      <a href="ejare-container-15-foot.html"><strong>۱۵ فوت <small>(۱۲ متر)</small></strong><span>واحد کوچک تا متوسط</span></a>
      <a href="ejare-container-20-foot.html"><strong>۲۰ فوت <small>(۱۸ متر)</small></strong><span>گزینه استاندارد و منعطف</span></a>
      <a href="ejare-container-40-foot.html"><strong>۴۰ فوت <small>(۲۷ متر)</small></strong><span>بار حجیم و زون‌بندی‌شده</span></a>
    </div>
  </div>
</section>

<section class="section why-section" aria-labelledby="why-title">
  <div class="container why-grid">
    <div>
      <span class="eyebrow">چرا دپو سازگار؟</span>
      <h2 id="why-title">انتخاب انبار با عدد، نه حدس</h2>
      <p>پیشنهاد متراژ از روی تعداد اتاق به‌تنهایی دقیق نیست. ابعاد وسایل بزرگ، تعداد کارتن، مدت نگهداری و نیاز به دسترسی دوره‌ای کنار هم بررسی می‌شوند تا هزینه فضای خالی یا سفر دوباره باربری کمتر شود.</p>
      <a class="text-link" href="ejare-anbar-tehran.html">مطالعه راهنمای جامع اجاره انبار ←</a>
    </div>
    <div class="why-points">
      <div><strong>۰۱</strong><p>تفکیک بار خانگی، اداری و تجاری مجاز پیش از پیشنهاد فضا</p></div>
      <div><strong>۰۲</strong><p>توضیح تفاوت انبار متراژی و کانتینری بدون ادعای تأییدنشده</p></div>
      <div><strong>۰۳</strong><p>تأکید بر بازدید، ثبت شرایط و مطالعه قرارداد پیش از حمل</p></div>
    </div>
  </div>
</section>

<section class="home-mid-cta">
  <div class="container">${midCta(page, 'برای انتخاب متراژ مناسب، فهرست وسایل را با ما مرور کنید')}</div>
</section>

<section class="section coverage-section" aria-labelledby="coverage-title">
  <div class="container coverage-grid">
    <div class="coverage-copy">
      <span class="eyebrow">مناطق تحت پوشش</span>
      <h2 id="coverage-title">پوشش انبار در استان تهران و استان البرز</h2>
      <p>ترافیک، محدودیت توقف، بافت مسکونی یا تجاری و الگوی بار در هر منطقه متفاوت است. راهنمای هر محدوده کمک می‌کند هزینه حمل و دفعات مراجعه را کنار اجاره ماهانه ببینید.</p>
      <p class="note">نشانی دقیق، ظرفیت فعال و زمان بازدید هر شعبه هنگام تماس نهایی تأیید می‌شود.</p>
    </div>
    <div class="coverage-links">
      <a href="ejare-anbar-shomal-tehran.html"><span>شمال</span><small>شیب مسیر و بار حساس</small></a>
      <a href="location/east-tehran"><span>شرق</span><small>مجتمع‌های مسکونی و دفاتر</small></a>
      <a href="ejare-anbar-markaz-tehran.html"><span>مرکز</span><small>طرح ترافیک و بایگانی</small></a>
      <a href="location/west-tehran"><span>غرب</span><small>اسباب‌کشی و موجودی فروشگاه</small></a>
      <a href="location/south-tehran"><span>جنوب</span><small>بار تجاری و انتخاب اقتصادی</small></a>
      <a href="ejare-anbar-karaj.html"><span>کرج</span><small>مسیر تهران–کرج و استان البرز</small></a>
    </div>
  </div>
</section>

<section class="section section-muted" aria-labelledby="local-seo-directory-title">
  <div class="container">
    <div class="section-heading">
      <span class="eyebrow">محدوده های خدمات</span>
      <h2 id="local-seo-directory-title">اجاره انبار در تهران و کرج</h2>
      <p>برای انتخاب سریع تر، محدوده موردنظر خود را از بین مناطق تهران، مناطق کرج یا محله های پرتقاضا انتخاب کنید.</p>
    </div>
    <div class="directory-disclosure-grid">
      ${directoryDisclosure('مناطق تهران', '۲۲ صفحه منطقه‌ای برای انتخاب محدوده دقیق‌تر', districtDirectory('تهران'))}
      ${directoryDisclosure('مناطق کرج', '۱۲ صفحه منطقه‌ای برای مسیرهای استان البرز', districtDirectory('کرج'))}
      ${directoryDisclosure('محله‌های پرتقاضا', 'دسترسی سریع به محله‌های پرتکرار تهران و کرج', [...localDirectory('tehran'), ...localDirectory('karaj')].slice(0, 60))}
      ${directoryDisclosure('راهنماهای کاربردی', 'قیمت، متراژ، اسباب‌کشی، جهیزیه و تفاوت انبار با کانتینر', phaseTwoServicePages.map((servicePage) => [pageHref(servicePage.slug), servicePage.h1]))}
    </div>
  </div>
</section>

<section class="section branches-section" id="branches" aria-labelledby="branches-title">
  <div class="container">
    <div class="section-heading">
      <span class="eyebrow">شعب دپو سازگار</span>
      <h2 id="branches-title">لوکیشن‌های غرب، جنوب و شرق تهران</h2>
      <p>برای اطلاع از ظرفیت، نشانی دقیق ورودی و هماهنگی بازدید شعبه موردنظر، پیش از حرکت با واحد تماس هماهنگ کنید.</p>
    </div>
    ${branchCards('branch-groups-home')}
    <div class="karaj-coverage-card">
      <div><span class="eyebrow">پوشش استان البرز</span><h3>اجاره انبار در کرج</h3><p>برای مسیرهای کرج، فردیس، مهرشهر، گوهردشت و ارتباط با غرب تهران، راهنمای اختصاصی کرج را بررسی کنید.</p></div>
      <a class="btn btn-secondary" href="ejare-anbar-karaj.html">مشاهده صفحه کرج</a>
    </div>
  </div>
</section>

<section class="section selection-guide" aria-labelledby="selection-title">
  <div class="container">
    <div class="section-heading">
      <span class="eyebrow">راهنمای انتخاب متراژ مناسب</span>
      <h2 id="selection-title">از روی وسایل شروع کنید، نه نام اندازه</h2>
      <p>این کارت‌ها نقطه شروع‌اند؛ ابعاد مفید فضای موجود و شکل واقعی وسایل باید پیش از رزرو بررسی شوند.</p>
    </div>
    <div class="selection-grid">
      <article><div class="selection-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 8 8-4 8 4-8 4Zm0 0v9l8 4 8-4V8M12 12v9"/></svg></div><h3>چند کارتن و وسایل کم‌حجم</h3><p>لوازم شخصی، چمدان، زونکن و وسایل موقت مستأجران.</p><a href="ejare-anbar-6-metri.html">بررسی انبار ۶ متری</a></article>
      <article><div class="selection-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9h16v10M7 9V5h10v4M8 14h8"/></svg></div><h3>بخشی از وسایل یک واحد کوچک</h3><p>جهیزیه محدود، وسایل یک اتاق و چند قطعه مبلمان.</p><a href="ejare-anbar-10-metri.html">مقایسه ۱۰ و ۱۲ متر</a></article>
      <article><div class="selection-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18M5 20V6h14v14M9 10h2m2 0h2m-6 4h2m2 0h2"/></svg></div><h3>اثاثیه بیشتر یا لوازم اداری</h3><p>حجم بالاتر خانه، تجهیزات دفتر یا کالای فروشگاهی سبک.</p><a href="ejare-anbar-20-metri.html">بررسی انبار ۲۰ متری</a></article>
      <article><div class="selection-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18v12H3zM7 7V5h10v2M8 11v4m4-4v4m4-4v4"/></svg></div><h3>حجم بالا یا دپوی طولانی‌تر</h3><p>اثاثیه زیاد یا بار تجاری که به زون‌بندی منظم نیاز دارد.</p><a href="ejare-container-20-foot.html">مقایسه ۲۰ و ۴۰ فوت</a></article>
    </div>
  </div>
</section>

<section class="section section-muted" id="rental-process" aria-labelledby="process-title">
  <div class="container">
    <div class="section-heading">
      <span class="eyebrow">از تماس تا دپو</span>
      <h2 id="process-title">فرایند اجاره انبار در ۵ مرحله</h2>
      <p>هر مرحله یک ابهام را کم می‌کند تا خودرو زمانی حرکت کند که فضا و شرایط روشن شده‌اند.</p>
    </div>
    <ol class="process-list">
      <li><span>۱</span><div><h3>تماس و مشاوره</h3><p>نیاز، زمان و محله مبدأ را توضیح دهید.</p></div></li>
      <li><span>۲</span><div><h3>اعلام حجم وسایل</h3><p>اقلام بزرگ، تعداد کارتن و موارد حساس را بگویید.</p></div></li>
      <li><span>۳</span><div><h3>پیشنهاد متراژ</h3><p>دو اندازه نزدیک و شیوه چیدمان مقایسه می‌شوند.</p></div></li>
      <li><span>۴</span><div><h3>هماهنگی بازدید</h3><p>فضای مشخص، دسترسی و مفاد مهم را بررسی کنید.</p></div></li>
      <li><span>۵</span><div><h3>رزرو و دپو</h3><p>پس از ثبت توافق‌ها، تحویل و چیدمان انجام می‌شود.</p></div></li>
    </ol>
  </div>
</section>

<section class="section comments-section" id="comments" aria-labelledby="comments-title">
  <div class="container comments-layout">
    <div class="comments-copy">
      <span class="eyebrow">تجربه شما برای ما مهم است</span>
      <h2 id="comments-title">نظر خود را درباره دپو سازگار ثبت کنید</h2>
      <p>اگر از سایت، مشاوره یا خدمات دپو سازگار استفاده کرده‌اید، تجربه واقعی خود را بنویسید. نظرها پس از بررسی مدیر و بدون نمایش شماره تماس یا اطلاعات خصوصی منتشر می‌شوند.</p>
      <div class="comments-principles" aria-label="اصول انتشار نظر">
        <span>نظر واقعی و محترمانه</span>
        <span>بدون اطلاعات شخصی</span>
        <span>انتشار پس از بررسی</span>
      </div>
      <div class="comment-stream" data-comment-list aria-live="polite"></div>
      <p class="comment-empty" data-comment-empty>هنوز نظری منتشر نشده است؛ شما می‌توانید اولین تجربه را ثبت کنید.</p>
    </div>
    <form class="comment-form" action="api/comments.php" method="post" data-comment-form>
      <div class="comment-form-heading">
        <span aria-hidden="true">“</span>
        <div><strong>ثبت یک نظر تازه</strong><small>فیلدهای ستاره‌دار الزامی هستند.</small></div>
      </div>
      <div class="comment-fields">
        <label>
          <span>نام یا نام نمایشی *</span>
          <input type="text" name="name" minlength="2" maxlength="60" autocomplete="name" required placeholder="مثلاً امیر">
        </label>
        <label>
          <span>شهر یا محله</span>
          <input type="text" name="city" minlength="2" maxlength="50" autocomplete="address-level2" placeholder="مثلاً تهرانسر">
        </label>
        <label class="comment-message-field">
          <span>متن نظر *</span>
          <textarea name="message" minlength="12" maxlength="600" rows="5" required placeholder="تجربه خود را شفاف و کوتاه بنویسید…"></textarea>
          <small data-comment-counter>۰ / ۶۰۰</small>
        </label>
      </div>
      <label class="comment-consent">
        <input type="checkbox" name="consent" value="true" required>
        <span>با انتشار عمومی این متن پس از بررسی مدیر موافقم.</span>
      </label>
      <label class="comment-honeypot" aria-hidden="true">
        <span>وب‌سایت</span>
        <input type="text" name="website" tabindex="-1" autocomplete="off">
      </label>
      <input type="hidden" name="startedAt" value="">
      <button class="btn btn-primary comment-submit" type="submit">ارسال نظر برای بررسی</button>
      <p class="comment-status" data-comment-status role="status" aria-live="polite"></p>
    </form>
    <div class="comment-toast" data-comment-toast role="status" aria-live="polite" hidden>
      <span class="comment-toast-icon" aria-hidden="true">✓</span>
      <span><strong data-comment-toast-title>نظر شما ثبت شد</strong><small data-comment-toast-message>پس از بررسی مدیر در سایت منتشر می‌شود.</small></span>
      <button type="button" data-comment-toast-close aria-label="بستن پیام">×</button>
    </div>
  </div>
</section>

<section class="section gallery-section" aria-labelledby="gallery-title">
  <div class="container">
    <div class="section-heading">
      <span class="eyebrow">نگاه نزدیک‌تر</span>
      <h2 id="gallery-title">نمونه فضاهای انبار و کانتینر</h2>
      <p>تصاویر برای آشنایی بصری‌اند؛ شرایط و ظرفیت گزینه نهایی را هنگام بازدید تأیید کنید.</p>
    </div>
    <div class="gallery-grid">
      ${figurePicture('containerExterior', 'انبار کانتینری دپو سازگار در تهران', 'gallery-image', 'نمای کانتینر مناسب دپوی وسایل و کالای مجاز')}
      ${figurePicture('packingDetail', 'بسته‌بندی وسایل پیش از ورود به انبار', 'gallery-image', 'آماده‌سازی کارتن‌ها و اقلام حساس برای دپو')}
      ${figurePicture('transportDetail', 'حمل‌ونقل وسایل تا شعبه انبار', 'gallery-image', 'هماهنگی حمل برای انتقال وسایل تا انبار')}
      ${figurePicture('arrangementDetail', 'چیدمان وسایل در فضای انبار', 'gallery-image', 'چیدمان مرحله‌ای برای استفاده بهتر از فضای دپو')}
    </div>
  </div>
</section>`;

const breadcrumb = (page) => page.slug === 'index' ? '' : `<div class="breadcrumb-bar">
  <div class="container">
    <nav aria-label="مسیر صفحه">
      <ol>${breadcrumbTrail(page).map((item, index, list) => index === list.length - 1
        ? `<li aria-current="page">${escapeHtml(item.name)}</li>`
        : `<li><a href="${item.href}">${escapeHtml(item.name)}</a></li>`).join('')}</ol>
    </nav>
  </div>
</div>`;

const breadcrumbTrail = (page) => {
  if (page.slug === 'index') return [{ name: 'خانه', href: 'index.html', item: baseSiteUrl }];
  const local = localProfiles[page.slug];
  if (local) {
    return [
      { name: 'خانه', href: 'index.html', item: baseSiteUrl },
      { name: local.cityKey === 'karaj' ? 'اجاره انبار کرج' : 'اجاره انبار تهران', href: local.cityKey === 'karaj' ? 'ejare-anbar-karaj.html' : 'ejare-anbar-tehran.html', item: `${baseSiteUrl}/${local.cityKey === 'karaj' ? 'ejare-anbar-karaj' : 'ejare-anbar-tehran'}.html` },
      { name: local.regionLabel, href: pageHref(local.regionSlug), item: `${baseSiteUrl}/${local.regionSlug}.html` },
      { name: page.h1, href: pageHref(page.slug), item: canonicalUrl(page) }
    ];
  }
  const district = districtProfiles[page.slug];
  if (district) {
    return [
      { name: 'خانه', href: 'index.html', item: baseSiteUrl },
      { name: district.parentLabel, href: district.parentHref, item: `${baseSiteUrl}/${district.parentHref}` },
      { name: page.h1, href: pageHref(page.slug), item: canonicalUrl(page) }
    ];
  }
  return [
    { name: 'خانه', href: 'index.html', item: baseSiteUrl },
    { name: page.h1, href: pageHref(page.slug), item: canonicalUrl(page) }
  ];
};

const schemaGraph = (page, faqs) => {
  const url = canonicalUrl(page);
  const breadcrumbItems = breadcrumbTrail(page).map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.item || `${baseSiteUrl}/${item.href === 'index.html' ? '' : item.href}`
  }));
  const local = localProfiles[page.slug];
  const district = districtProfiles[page.slug];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseSiteUrl}/#organization`,
        name: 'دپو سازگار',
        url: baseSiteUrl,
        logo: { '@type': 'ImageObject', url: `${baseSiteUrl}/assets/images/brand-mark.svg`, width: 512, height: 512 },
        telephone: phones.map(([raw]) => raw),
        areaServed: servedAreas,
        keywords: 'اجاره انبار استان تهران، اجاره انبار استان البرز، اجاره انبار تهران، اجاره انبار کرج، انبار کانتینری، دپو لوازم خانه',
        contactPoint: phones.map(([raw], index) => ({
          '@type': 'ContactPoint',
          telephone: raw,
          contactType: raw === managementPhone[0] ? 'management' : index < 4 ? 'customer service' : 'sales',
          areaServed: ['استان تهران', 'استان البرز', 'تهران', 'کرج'],
          availableLanguage: 'Persian'
        }))
      },
      ...(['index', 'contact'].includes(page.slug) ? [{
        '@type': 'LocalBusiness',
        '@id': `${baseSiteUrl}/#localbusiness`,
        name: 'دپو سازگار',
        url: baseSiteUrl,
        image: `${baseSiteUrl}/assets/images/og-cover.jpg`,
        logo: `${baseSiteUrl}/assets/images/brand-mark.svg`,
        additionalType: 'https://schema.org/SelfStorage',
        telephone: phones.map(([raw]) => raw),
        description: 'خدمات مشاوره و هماهنگی اجاره انبار، انبار کانتینری و دپوی لوازم در استان تهران و استان البرز',
        areaServed: servedAreas,
        keywords: 'اجاره انبار استان تهران، اجاره انبار استان البرز، اجاره انبار تهران، اجاره انبار کرج، دپو لوازم خانه',
        priceRange: 'از ۵۰۰٬۰۰۰ تومان ماهانه',
        department: branchLocations.map((branch) => ({
          '@type': 'SelfStorage',
          '@id': `${baseSiteUrl}/#branch-${branch.code}`,
          name: `دپو سازگار؛ شعبه ${branch.name}`,
          branchCode: branch.code,
          telephone: managementPhone[0],
          areaServed: { '@type': 'Place', name: branch.name },
          parentOrganization: { '@id': `${baseSiteUrl}/#localbusiness` }
        })),
        parentOrganization: { '@id': `${baseSiteUrl}/#organization` }
      }] : []),
      {
        '@type': 'WebSite',
        '@id': `${baseSiteUrl}/#website`,
        url: baseSiteUrl,
        name: 'دپو سازگار',
        inLanguage: 'fa-IR',
        publisher: { '@id': `${baseSiteUrl}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseSiteUrl}/?s={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: page.h1,
        description: page.description,
        url,
        areaServed: local ? { '@type': 'Place', name: `${local.name}، ${local.city}` } : district ? { '@type': 'AdministrativeArea', name: district.label } : servedAreas,
        keywords: `${page.h1}، اجاره انبار وسایل منزل، دپو لوازم خانه، اجاره کانتینر، اجاره انبار کانتینری`,
        serviceType: page.type === 'local' ? 'اجاره انبار محلی' : page.type === 'district' || page.type === 'location' ? 'اجاره انبار برای منطقه شهری' : 'اجاره انبار و دپوی لوازم',
        provider: { '@id': `${baseSiteUrl}/#localbusiness` },
        ...(page.type === 'service' ? { priceRange: 'از ۵۰۰٬۰۰۰ تومان ماهانه' } : {})
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: faqs.map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer }
        }))
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: breadcrumbItems
      },
      ...(district ? [{
        '@type': 'ItemList',
        '@id': `${url}#neighborhoods`,
        name: `محله های تحت پوشش ${district.label}`,
        itemListElement: districtLocalLinks(page.slug).map(([href, label], index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: label,
          url: `${baseSiteUrl}/${href}`
        }))
      }] : []),
      ...(page.type === 'guide' || serviceProfiles[page.slug]?.article ? [{
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: page.h1,
        description: page.description,
        inLanguage: 'fa-IR',
        mainEntityOfPage: url,
        author: { '@id': `${baseSiteUrl}/#organization` },
        publisher: { '@id': `${baseSiteUrl}/#organization` }
      }] : [])
    ]
  };
};

const header = (page, faqs) => {
  const url = canonicalUrl(page);
  const structuredData = JSON.stringify(schemaGraph(page, faqs)).replaceAll('<', '\\u003c');
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${url}">
  <meta name="theme-color" content="#0F2742">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fa_IR">
  <meta property="og:site_name" content="دپو سازگار">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${baseSiteUrl}/assets/images/og-cover.jpg">
  <meta property="og:image:secure_url" content="${baseSiteUrl}/assets/images/og-cover.jpg">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="کانتینرهای دپو سازگار برای اجاره انبار در استان تهران و استان البرز">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="${baseSiteUrl}/assets/images/og-cover.jpg">
  <meta name="twitter:image:alt" content="کانتینرهای دپو سازگار برای اجاره انبار در استان تهران و استان البرز">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon-96.png" type="image/png" sizes="96x96">
  <link rel="icon" href="/assets/images/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
  <style>${criticalCss}</style>
  <link rel="preload" href="assets/css/style.css?v=${assetVersion}" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="assets/css/style.css?v=${assetVersion}"></noscript>
  ${page.slug === 'index' ? '<link rel="preload" href="assets/images/home-storage-intro.webp" as="image" type="image/webp" fetchpriority="high">' : ''}
  <script type="application/ld+json">${structuredData}</script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4MeasurementId}');</script>
</head>
<body>
  <a class="skip-link" href="#main-content">رفتن به محتوای اصلی</a>
  <header class="site-header">
    <div class="container header-row">
      <a class="brand" href="index.html" aria-label="دپو سازگار؛ صفحه اصلی">
        <img src="assets/images/brand-mark.svg" width="512" height="512" alt="">
        <span class="brand-copy"><strong>دپو سازگار</strong><small>فضای امن، انتخاب دقیق</small></span>
      </a>
      <nav class="desktop-nav" aria-label="ناوبری اصلی">
        <a href="index.html">خانه</a>
        <a href="ejare-anbar-tehran.html">اجاره انبار</a>
        <a href="container-storage">انبار کانتینری</a>
        <a href="pricing">قیمت</a>
        <a href="home-appliances-storage">دپو لوازم خانه</a>
        <a href="bastebandi-lavazem-anbar.html">بسته‌بندی</a>
        <a href="ejare-anbar-karaj.html">استان البرز</a>
        <a href="about.html">درباره ما</a>
        <a href="contact.html">تماس</a>
      </nav>
      <button class="header-phone" type="button" data-sheet-open="phone-sheet" aria-haspopup="dialog" aria-controls="phone-sheet" aria-expanded="false">تماس فوری</button>
      <button id="mobile-menu-btn" class="menu-button" type="button" aria-label="باز کردن منوی اصلی" aria-controls="mobile-menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
    <nav id="mobile-menu" class="mobile-nav" aria-label="ناوبری موبایل" hidden>
      <a href="index.html">خانه</a><a href="ejare-anbar-tehran.html">اجاره انبار</a><a href="container-storage">انبار کانتینری</a><a href="pricing">قیمت اجاره انبار</a><a href="home-appliances-storage">دپو لوازم خانه</a><a href="bastebandi-lavazem-anbar.html">بسته‌بندی</a><a href="haml-o-naghl-anbar.html">حمل‌ونقل</a><a href="chideman-anbar.html">چیدمان</a><a href="ejare-anbar-karaj.html">استان البرز</a><a href="about.html">درباره ما</a><a href="contact.html">تماس با ما</a>
    </nav>
  </header>
  ${breadcrumb(page)}
  <main id="main-content">`;
};

const footer = () => `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-about">
      <a class="footer-brand" href="index.html" aria-label="دپو سازگار؛ صفحه اصلی"><img src="assets/images/brand-mark.svg" width="512" height="512" alt=""><span><strong>دپو سازگار</strong><small>فضای امن، انتخاب دقیق</small></span></a>
      <p>راهنمای انتخاب و هماهنگی اجاره انبار و کانتینر برای لوازم خانه، دفتر و کالای مجاز در استان تهران و استان البرز.</p>
    </div>
    <div><h2>دسترسی سریع</h2><a href="ejare-anbar-tehran.html">اجاره انبار تهران</a><a href="ejare-anbar-karaj.html">اجاره انبار کرج</a><a href="pricing">قیمت اجاره انبار</a><a href="home-appliances-storage">دپو لوازم خانه</a><a href="bastebandi-lavazem-anbar.html">بسته‌بندی</a><a href="haml-o-naghl-anbar.html">حمل‌ونقل</a><a href="tafavot-anbar-container-kanex.html">انبار، کانتینر و کانکس</a><a href="contact.html">تماس با ما</a></div>
    <div><h2>مناطق</h2><a href="ejare-anbar-shomal-tehran.html">شمال تهران</a><a href="location/east-tehran">شرق تهران</a><a href="ejare-anbar-markaz-tehran.html">مرکز تهران</a><a href="location/west-tehran">غرب تهران</a><a href="location/south-tehran">جنوب تهران</a><a href="ejare-anbar-karaj.html">کرج و استان البرز</a></div>
    <div class="footer-phones"><h2>همه شماره‌های تماس</h2>${phoneLinks()}</div>
  </div>
  <div class="container footer-bottom">
    <p>© ۱۴۰۵ دپو سازگار؛ همه حقوق محفوظ است.</p>
    <p class="site-credit">طراحی و توسعه: <a href="https://github.com/amirwopi" target="_blank" rel="noopener noreferrer" translate="no">Amirwopi</a></p>
    <a href="sitemap.xml">نقشه سایت</a>
  </div>
</footer>
<div class="mobile-contact-bar" aria-label="تماس سریع">
  <button type="button" data-sheet-open="phone-sheet" aria-haspopup="dialog" aria-controls="phone-sheet" aria-expanded="false" aria-label="نمایش همه شماره‌های تماس دپو سازگار">
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7.2 3h3l1.5 4.2-2 1.5a14 14 0 0 0 5.6 5.6l1.5-2L21 13.8v3A4.2 4.2 0 0 1 16.8 21C9.2 21 3 14.8 3 7.2A4.2 4.2 0 0 1 7.2 3Z"/></svg>
    <span>تماس فوری</span>
  </button>
  <button class="mobile-locations" type="button" data-sheet-open="locations-sheet" aria-haspopup="dialog" aria-controls="locations-sheet" aria-expanded="false" aria-label="نمایش شعب و لوکیشن‌های دپو سازگار">
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></svg>
    <span>لوکیشن‌ها</span>
  </button>
</div>
${bottomSheets()}
<script src="assets/js/main.js?v=${assetVersion}" defer></script>
</body>
</html>`;

const renderPageContent = (page) => {
  if (page.slug === 'index') return homeContent(page);
  if (localProfiles[page.slug]) return localContent(page, localProfiles[page.slug]);
  if (districtProfiles[page.slug]) return districtContent(page, districtProfiles[page.slug]);
  if (locationProfiles[page.slug]) return locationContent(page, locationProfiles[page.slug]);
  if (sizeProfiles[page.slug]) return sizeContent(page, sizeProfiles[page.slug]);
  if (serviceProfiles[page.slug]) return serviceContent(page, serviceProfiles[page.slug]);
  return infoPageContent(page, pageProfiles[page.slug]);
};

const countPersianWords = (html) => (html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .match(/[\u0600-\u06FF]+(?:‌[\u0600-\u06FF]+)*/g) || []).length;

fs.mkdirSync(outputDir, { recursive: true });

const wordCounts = [];
for (const page of pages) {
  const faqs = getFaqs(page);
  const mainContent = `${renderPageContent(page)}${faqSection(faqs)}${finalCta(page)}`;
  const wordCount = countPersianWords(mainContent);
  const minimumWords = ['about', 'contact'].includes(page.slug) ? 700 : 900;
  if (page.slug !== 'index' && (wordCount < minimumWords || wordCount > 1400)) {
    throw new Error(`${page.slug}: ${wordCount} Persian words; expected ${minimumWords}–1400.`);
  }

  const html = `${header(page, faqs)}${mainContent}</main>${footer()}`;
  const clean = cleanUrlMap[page.slug];
  const filename = page.slug === 'index' ? 'index.html' : (clean ? `${clean}.html` : `${page.slug}.html`);
  const filePath = path.join(outputDir, filename);
  const fileDir = path.dirname(filePath);
  if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
  fs.writeFileSync(filePath, html, 'utf8');
  wordCounts.push(`${filename}: ${wordCount}`);
}

const now = new Date();
const tehran = new Date(now.getTime() + 3.5 * 60 * 60 * 1000);
const pad = (n) => String(n).padStart(2, '0');
const buildDate = `${tehran.getUTCFullYear()}-${pad(tehran.getUTCMonth() + 1)}-${pad(tehran.getUTCDate())}T${pad(tehran.getUTCHours())}:${pad(tehran.getUTCMinutes())}:${pad(tehran.getUTCSeconds())}+03:30`;

const sitemapPagesList = pages.filter(p => p.type === 'home' || p.type === 'page' || p.type === 'size');
const sitemapServicesList = pages.filter(p => p.type === 'service');
const sitemapLocationsList = pages.filter(p => p.type === 'location' || p.type === 'district' || p.type === 'local');
const sitemapPostsList = pages.filter(p => p.type === 'guide');

const generateSitemap = (pageList) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageList.map(page => `  <url>
    <loc>${canonicalUrl(page)}</loc>
    <lastmod>${buildDate}</lastmod>
  </url>`).join('\n')}
</urlset>
`;

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseSiteUrl}/sitemap-pages.xml</loc>
    <lastmod>${buildDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseSiteUrl}/sitemap-services.xml</loc>
    <lastmod>${buildDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseSiteUrl}/sitemap-locations.xml</loc>
    <lastmod>${buildDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseSiteUrl}/sitemap-posts.xml</loc>
    <lastmod>${buildDate}</lastmod>
  </sitemap>
</sitemapindex>
`;

fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapIndex, 'utf8');
fs.writeFileSync(path.join(outputDir, 'sitemap-pages.xml'), generateSitemap(sitemapPagesList), 'utf8');
fs.writeFileSync(path.join(outputDir, 'sitemap-services.xml'), generateSitemap(sitemapServicesList), 'utf8');
fs.writeFileSync(path.join(outputDir, 'sitemap-locations.xml'), generateSitemap(sitemapLocationsList), 'utf8');
fs.writeFileSync(path.join(outputDir, 'sitemap-posts.xml'), generateSitemap(sitemapPostsList), 'utf8');

console.log(`Generated ${pages.length} HTML pages and 5 sitemap files in public_html_ready/.`);
console.log(`Sitemap split: ${sitemapPagesList.length} pages, ${sitemapServicesList.length} services, ${sitemapLocationsList.length} locations, ${sitemapPostsList.length} posts.`);
console.log(wordCounts.join('\n'));
