/**
 * seed-storefront.js
 *
 * One-shot script to seed the minimum content the storefront needs to look
 * alive after deployment:
 *   - 9 CMS pages grouped into the 3 footer columns (Shopping / Legal / About)
 *   - Footer column config in Site Content (links to those CMS pages)
 *   - Homepage banners/sliders/quick link (uses existing /banner and /img assets)
 *   - 5 social-media link placeholders (enabled=false until configured in admin)
 *
 * Idempotent — re-running updates existing rows by slug instead of duplicating.
 *
 * Run:
 *   node --env-file=.env.local src/scripts/seed-storefront.js
 *
 * Add --reset to wipe and re-seed (use only when intentional):
 *   node --env-file=.env.local src/scripts/seed-storefront.js --reset
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { connectDB }   from '../lib/db.js';
import CmsPage         from '../models/CmsPage.js';
import SocialMedia     from '../models/SocialMedia.js';
import SiteContentSection from '../models/SiteContentSection.js';

const RESET = process.argv.includes('--reset');

// ---------------------------------------------------------------------------
// CMS PAGES — minimum legal & support set for a UK e-commerce site.
// `content` is HTML rendered on /cms/[slug]. `level` matches footer columns (1/2/3).
const CMS_PAGES = [
  // SHOPPING WITH US (level 1)
  {
    slug: 'contact',
    title: 'Contact Us',
    level: 1,
    content: '<p>Email: <a href="mailto:hello@avenuebookstore.com">hello@avenuebookstore.com</a><br>We respond to all enquiries within one working day.</p>',
  },
  {
    slug: 'delivery',
    title: 'Delivery',
    level: 1,
    content: '<p>UK orders are dispatched within 24 hours of receipt (orders placed after 4pm Mon–Fri ship the next working day). Standard delivery: 2–5 working days. Free on orders over £25; £2.99 below.</p>',
  },
  {
    slug: 'pricing-payments',
    title: 'Pricing & Payments',
    level: 1,
    content: '<p>All prices include VAT where applicable. We accept major credit and debit cards, PayPal, and other payment methods shown at checkout.</p>',
  },
  {
    slug: 'returns',
    title: 'Returns',
    level: 1,
    content: '<p>You may return any unread book in original condition within 30 days of delivery for a full refund. Email <a href="mailto:hello@avenuebookstore.com">hello@avenuebookstore.com</a> with your order number to start a return.</p>',
  },
  {
    slug: 'student-discount',
    title: 'Student Discount',
    level: 1,
    content: '<p>Student discount information will be published here. Contact <a href="mailto:hello@avenuebookstore.com">hello@avenuebookstore.com</a> for eligibility.</p>',
  },
  {
    slug: 'gift-cards',
    title: 'Gift Cards',
    level: 1,
    content: '<p>Gift card information will be published here.</p>',
  },
  {
    slug: 'help',
    title: 'Help & FAQ',
    level: 1,
    content: '<p>Find answers to common questions about ordering, delivery, ebooks, and accounts. Need more help? Email <a href="mailto:hello@avenuebookstore.com">hello@avenuebookstore.com</a>.</p>',
  },

  // LEGAL (level 2)
  {
    slug: 'cookies',
    title: 'Cookie Policy',
    level: 2,
    content: '<p>We use essential cookies for cart and login, and analytics cookies to improve the site. You can manage cookie preferences in your browser settings.</p>',
  },
  {
    slug: 'privacy',
    title: 'Privacy Notice',
    level: 2,
    content: '<p>We collect only the data needed to fulfil your order (name, address, email, payment details). We never sell your data. UK GDPR rights apply — contact <a href="mailto:privacy@avenuebookstore.com">privacy@avenuebookstore.com</a> for access, correction, or deletion requests.</p><p><em>Placeholder — replace with your finalised privacy policy.</em></p>',
  },
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    level: 2,
    content: '<p>These terms govern your use of avenuebookstore.com. By placing an order you agree to be bound by them. Avenue Bookstore reserves the right to amend these terms at any time. Last updated 2026.</p><p><em>Placeholder — replace with finalised legal text from your solicitor before launch.</em></p>',
  },
  {
    slug: 'complaints-process',
    title: 'Complaints Process',
    level: 2,
    content: '<p>If you are unhappy with our service, email <a href="mailto:hello@avenuebookstore.com">hello@avenuebookstore.com</a> with your order number and we will respond within five working days.</p>',
  },

  // ABOUT AVENUE (level 3)
  {
    slug: 'about',
    title: 'About us',
    level: 3,
    content: '<p>Avenue Bookstore is an independent UK bookseller offering a curated catalogue of physical and digital titles, sourced through our partnership with Gardners Books — the UK’s largest book wholesaler.</p>',
  },
  {
    slug: 'press',
    title: 'Press',
    level: 3,
    content: '<p>Press enquiries: <a href="mailto:press@avenuebookstore.com">press@avenuebookstore.com</a></p>',
  },
];

// ---------------------------------------------------------------------------
// FOOTER — column titles + links (stored in SiteContentSection key: footer)
// href values are bare CMS slugs (admin dropdown + storefront resolve to /cms/slug)
// ---------------------------------------------------------------------------
const FOOTER_COLUMNS = [
  {
    title: 'SHOPPING WITH US',
    links: [
      { label: 'Contact Us', href: 'contact' },
      { label: 'Delivery', href: 'delivery' },
      { label: 'Pricing & Payments', href: 'pricing-payments' },
      { label: 'Returns', href: 'returns' },
      { label: 'Student Discount', href: 'student-discount' },
      { label: 'Gift Cards', href: 'gift-cards' },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'Cookie Policy', href: 'cookies' },
      { label: 'Manage Cookies', href: 'manage-cookies' },
      { label: 'Privacy Notice', href: 'privacy' },
      { label: 'Terms & Conditions', href: 'terms' },
      { label: 'Complaints Process', href: 'complaints-process' },
    ],
  },
  {
    title: 'ABOUT AVENUE',
    links: [{ label: 'About us', href: 'about' }],
  },
];

// ---------------------------------------------------------------------------
// HOMEPAGE — SiteContentSection keys (images = paths under avenue/public on server)
// ---------------------------------------------------------------------------
const HOME_SECTION_KEYS = [
  'home-banner',
  'home-promo',
  'home-strip',
  'home-main-banner',
  'home-middle-banner',
  'home-bottom-banner',
  'home-quick-links',
];

const HOME_SECTIONS = {
  'home-banner': {
    slides: [
      {
        title: 'Winter Sale',
        subtitle: 'Up to 50% off selected titles',
        href: '/category/bestsellers',
        alt: 'Winter Sale - Up to 50% off',
        order: 0,
        image: { url: '/banner/1.png' },
      },
      {
        title: 'New Releases',
        subtitle: 'Discover the latest books',
        href: '/category/popular',
        alt: 'New Releases Available Now',
        order: 1,
        image: { url: '/banner/2.png' },
      },
      {
        title: 'Avenue Plus',
        subtitle: 'Exclusive member perks',
        href: '/category/bestsellers',
        alt: 'Join Avenue Plus for exclusive perks',
        order: 2,
        image: { url: '/banner/3.jpg' },
      },
    ],
  },
  'home-promo': {
    slides: [
      {
        title: 'PROTEIN in 15',
        subtitle: 'Protein packed meals from the Body Coach',
        href: '/category/bestsellers',
        alt: 'Promo banner',
        order: 0,
        image: { url: '/img/sprinkbanner/joewiocl.webp' },
      },
    ],
  },
  'home-strip': {
    title: 'Coming Soon',
    subtitle: 'The biggest books arriving in 2026',
    href: '/category/children_books',
    alt: 'Coming soon strip banner',
    image: { url: '/img/image_slider.webp' },
  },
  'home-main-banner': {
    title: 'Non-Fiction',
    subtitle: 'Explore our best non-fiction',
    href: '/category/non_fiction',
    alt: 'Non-fiction category banner',
    image: { url: '/img/main_bannerbottom.jpeg' },
  },
  'home-middle-banner': {
    title: "Children's Books",
    subtitle: 'Stories for every young reader',
    href: '/category/children_books',
    alt: "Children's books banner",
    image: { url: '/img/bottom-2banner.jpeg' },
  },
  'home-bottom-banner': {
    title: 'Discover More',
    subtitle: 'Browse the full Avenue catalogue',
    href: '/category/bestsellers',
    alt: 'Bottom homepage banner',
    image: { url: '/img/bottom-3banner.jpeg' },
  },
  'home-quick-links': {
    items: [
      {
        label: 'Must Read',
        href: '/category/highlights',
        alt: 'Must read pick',
        order: 0,
        isFeatured: true,
        image: { url: '/img/whenthecreanes.webp' },
      },
    ],
  },
};

function discoverSiteContentImages() {
  const dir = path.join(process.cwd(), 'public', 'uploads', 'site-content');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => /\.(jpe?g|png|webp|gif|svg)$/i.test(name))
    .sort()
    .map((name) => `/uploads/site-content/${name}`);
}

function applyDiscoveredImages(sections, uploads) {
  if (!uploads.length) return sections;

  const pick = (index) => uploads[index % uploads.length];
  const next = structuredClone(sections);

  next['home-banner'].slides.forEach((slide, i) => {
    slide.image = { url: pick(i) };
  });
  next['home-promo'].slides[0].image = { url: pick(0) };
  next['home-strip'].image = { url: pick(1) };
  next['home-main-banner'].image = { url: pick(2) };
  next['home-middle-banner'].image = { url: pick(3) };
  next['home-bottom-banner'].image = { url: pick(4) };
  next['home-quick-links'].items[0].image = { url: pick(5) };

  return next;
}

function sectionHasContent(key, data = {}) {
  if (!data || !Object.keys(data).length) return false;
  if (Array.isArray(data.slides) && data.slides.length) {
    return data.slides.some((slide) => slide?.image?.url || slide?.imageUrl);
  }
  if (Array.isArray(data.items) && data.items.length) {
    return data.items.some((item) => item?.image?.url || item?.imageUrl || item?.label);
  }
  if (data.image?.url || data.imageUrl) return true;
  if (Array.isArray(data.columns) && data.columns.length) return true;
  return false;
}

// ---------------------------------------------------------------------------
// SOCIAL LINKS — placeholders. Katie sets real URLs in admin; `enabled: false`
// hides each one until ready. Icons match the Footer's ICON_MAP.
// ---------------------------------------------------------------------------
const SOCIAL_LINKS = [
  { label: 'Instagram', url: 'https://instagram.com/avenuebookstore',  icon: 'faInstagram',      enabled: true, order: 1 },
  { label: 'Facebook',  url: 'https://facebook.com/avenuebookstore',   icon: 'faSquareFacebook', enabled: true, order: 2 },
  { label: 'X',         url: 'https://x.com/avenuebookstore',          icon: 'faXTwitter',       enabled: true, order: 3 },
  { label: 'TikTok',    url: 'https://tiktok.com/@avenuebookstore',    icon: 'faTiktok',         enabled: true, order: 4 },
  { label: 'YouTube',   url: 'https://youtube.com/@avenuebookstore',   icon: 'faYoutube',        enabled: true, order: 5 },
];

// ---------------------------------------------------------------------------
async function run() {
  console.log('[seed] Connecting to MongoDB...');
  await connectDB();
  console.log('[seed] Connected.\n');

  // ── CMS pages ────────────────────────────────────────────────────────────
  if (RESET) {
    const r = await CmsPage.deleteMany({});
    console.log(`[seed] --reset: deleted ${r.deletedCount} CMS pages.`);
  }

  let created = 0, updated = 0;
  for (const page of CMS_PAGES) {
    const existed = await CmsPage.findOne({ slug: page.slug }).lean();
    await CmsPage.updateOne(
      { slug: page.slug },
      { $set: page },
      { upsert: true }
    );
    if (existed) updated++; else created++;
  }
  console.log(`[seed] CMS pages — created ${created}, updated ${updated} (target: ${CMS_PAGES.length}).`);

  // ── Footer config ────────────────────────────────────────────────────────
  if (RESET) {
    await SiteContentSection.deleteMany({
      key: { $in: ['footer', ...HOME_SECTION_KEYS] },
    });
    console.log('[seed] --reset: cleared footer + homepage SiteContentSection docs.');
  }

  const footerDoc = await SiteContentSection.findOne({ key: 'footer' }).lean();
  const footerEmpty = !footerDoc?.data?.columns?.length;

  // Footer columns always sync from script (full link set)
  await SiteContentSection.findOneAndUpdate(
    { key: 'footer' },
    { $set: { data: { columns: FOOTER_COLUMNS } } },
    { upsert: true }
  );
  console.log(
    footerEmpty || RESET
      ? `[seed] Footer — seeded ${FOOTER_COLUMNS.length} columns with CMS links.`
      : `[seed] Footer — updated ${FOOTER_COLUMNS.length} columns with CMS links.`
  );

  // ── Homepage sections ────────────────────────────────────────────────────
  const uploads = discoverSiteContentImages();
  if (uploads.length) {
    console.log(`[seed] Found ${uploads.length} image(s) in public/uploads/site-content/`);
  } else {
    console.log('[seed] No images in public/uploads/site-content/ — using /banner and /img fallbacks.');
  }
  const homeSections = applyDiscoveredImages(HOME_SECTIONS, uploads);
  let homeSeeded = 0;
  let homeSkipped = 0;
  for (const key of HOME_SECTION_KEYS) {
    const existing = await SiteContentSection.findOne({ key }).lean();
    const empty = !sectionHasContent(key, existing?.data);
    const shouldSeed = RESET || empty || uploads.length > 0;

    if (shouldSeed) {
      await SiteContentSection.findOneAndUpdate(
        { key },
        { $set: { data: homeSections[key] } },
        { upsert: true }
      );
      homeSeeded++;
      console.log(`[seed] Homepage — seeded ${key}`);
    } else {
      homeSkipped++;
      console.log(`[seed] Homepage — ${key} already has content, leaving as-is`);
    }
  }
  console.log(`[seed] Homepage — seeded ${homeSeeded}, skipped ${homeSkipped} (target: ${HOME_SECTION_KEYS.length}).`);

  // ── Social links ─────────────────────────────────────────────────────────
  if (RESET) {
    await SocialMedia.deleteMany({});
    console.log('[seed] --reset: cleared SocialMedia.');
  }

  await SocialMedia.findOneAndUpdate(
    {},
    { $set: { links: SOCIAL_LINKS } },
    { upsert: true }
  );
  console.log(`[seed] Social links — synced ${SOCIAL_LINKS.length} links (enabled in footer).`);

  console.log('\n[seed] Done. Refresh avenue-admin Site Content + storefront homepage.');
  process.exit(0);
}

run().catch(err => {
  console.error('[seed] FATAL:', err.stack || err.message);
  process.exit(1);
});
