import http from 'http';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// 1. Load .env.local
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const [key, ...valueParts] = trimmed.split('=');
        process.env[key.trim()] = valueParts.join('=').trim();
    });
    console.log('Loaded .env.local');
}

// 2. Mock Vercel Response
function createVercelResponse(res) {
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
    };
    return res;
}

// 3. Mock Vercel Request (add body parsing)
async function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                req.body = body ? JSON.parse(body) : {};
            } catch (e) {
                req.body = {};
            }
            resolve();
        });
    });
}

// 4. Start Server
const server = http.createServer(async (req, res) => {
    const vReq = req;
    const vRes = createVercelResponse(res);
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    vReq.query = Object.fromEntries(parsedUrl.searchParams);

    console.log(`${req.method} ${req.url}`);

    try {
        if (parsedUrl.pathname === '/api/share' || parsedUrl.pathname === '/api/share/') {
            const apiPath = pathToFileURL(path.resolve('api/share.ts')).href;
            const handler = (await import(apiPath)).default;
            await parseBody(vReq);
            await handler(vReq, vRes);
        } else if (parsedUrl.pathname.startsWith('/api/share/')) {
            const id = parsedUrl.pathname.split('/').pop();
            vReq.query.id = id;
            const apiPath = pathToFileURL(path.resolve('api/share/[id].ts')).href;
            const handler = (await import(apiPath)).default;
            await parseBody(vReq);
            await handler(vReq, vRes);
        } else {
            vRes.status(404).json({ error: 'Not found' });
        }
    } catch (err) {
        console.error('Server Error:', err);
        vRes.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Dev server running at http://localhost:${PORT}`);
});
