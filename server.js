import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

const IMAGE_TYPES = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
};

function contentTypeFor(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return IMAGE_TYPES[ext] || 'application/octet-stream';
}

/** Book covers may live in covers_storage/ and/or public/covers/ on Plesk. */
function resolveCoverPath(pathname) {
    if (!pathname?.startsWith('/covers/')) return null;

    const filename = pathname.slice('/covers/'.length);
    if (!filename || filename.includes('..')) return null;

    const candidates = [
        path.join(process.cwd(), 'covers_storage', filename),
        path.join(process.cwd(), 'public', 'covers', filename),
    ];

    for (const filePath of candidates) {
        try {
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                return filePath;
            }
        } catch (_) {
            // ignore stat errors, try next candidate
        }
    }

    return null;
}

function serveFile(res, filePath, cacheControl) {
    res.setHeader('Content-Type', contentTypeFor(filePath));
    res.setHeader('Cache-Control', cacheControl);
    fs.createReadStream(filePath).pipe(res);
}

console.log("> Initializing Next.js app...");
app.prepare().then(() => {
    console.log("> App prepared, starting server...");
    createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            const pathname = parsedUrl.pathname;

            const coverPath = resolveCoverPath(pathname);
            if (coverPath) {
                serveFile(res, coverPath, 'public, max-age=31536000, immutable');
                return;
            }

            // Site-content CMS uploads (public/uploads/site-content)
            if (pathname && pathname.startsWith('/uploads/')) {
                const filePath = path.join(process.cwd(), 'public', pathname);
                if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                    serveFile(res, filePath, 'public, max-age=86400');
                    return;
                }
            }

            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    }).listen(port, () => {
        console.log(`> Ready on port ${port}`);
    });
}).catch(err => {
    console.error("> Failed to prepare app:");
    console.error(err.stack);
    process.exit(1);
});
