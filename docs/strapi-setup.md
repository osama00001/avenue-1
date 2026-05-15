# Strapi setup notes

## Local integration (this repo)

1. Start the Strapi backend:
   - `cd strapi-backend`
   - `npm install`
   - `npm run develop`
2. Create the first admin user at `http://localhost:1337/admin`.
3. Ensure `avenue/.env.local` points to local Strapi:
   - `STRAPI_URL=http://localhost:1337`
   - `STRAPI_TOKEN` is optional and only needed for protected endpoints.
4. In Strapi Admin, enable public `find`/`findOne` for the types below.
5. Start the Next.js app:
   - `cd avenue`
   - `npm install`
   - `npm run dev`

Use Strapi Cloud and create the content types below. The Next.js integration
expects these names and fields.

## Single types

### navigation
- `mainMenu` (repeatable component `navItem`)
- `utilityMenu` (repeatable component `navItem`)

`navItem` fields:
- `label` (text)
- `href` (text)
- `icon` (text, optional; e.g. `faLocationDot`)
- `enableMegaMenu` (boolean, optional)

### footer
- `columns` (repeatable component `footerColumn`)

`footerColumn` fields:
- `title` (text)
- `links` (repeatable component `footerLink`)

`footerLink` fields:
- `label` (text)
- `href` (text)

### site-settings
- `logo` (media, single image)
- `saleBarText` (text)
- `saleBarLink` (text)
- `deliveryText` (text)

## Collection types

### page
- `title` (text)
- `slug` (UID based on title)
- `level` (number; used for footer columns)
- `content` (rich text / HTML)

### social-link
- `label` (text)
- `url` (text)
- `icon` (text; e.g. `faSquareFacebook`, `faInstagram`)
- `order` (number)
- `enabled` (boolean)

## Seed data (initial pages)
- `terms-and-conditions` (level 2, title "Terms & Conditions")
- `privacy-policy` (level 2, title "Privacy Policy")
- `cookie-policy` (level 2, title "Cookie Policy")

After creating these entries, publish them so the Next.js site can load them.
