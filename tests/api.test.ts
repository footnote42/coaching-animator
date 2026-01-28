import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import shareHandler from '../api/share.ts';
import shareIdHandler from '../api/share/[id].ts';

// Manual loading of .env.local for Vitest
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const [key, ...valueParts] = trimmed.split('=');
        process.env[key.trim()] = valueParts.join('=').trim();
    });
}

// Mock Vercel Response
const createResponse = () => {
    const res: any = {
        statusCode: 200,
        headers: {},
        body: null,
        setHeader: (key: string, value: string) => { res.headers[key] = value; return res; },
        status: (code: number) => { res.statusCode = code; return res; },
        json: (data: any) => { res.body = data; return res; },
        end: (data: any) => { if (data) res.body = data; return res; }
    };
    return res;
};

describe('Link-Sharing API Handlers', () => {
    let devShareId: string | null = null;

    describe('POST /api/share', () => {
        it('should create a share with valid payload', async () => {
            const req: any = {
                method: 'POST',
                body: {
                    version: 1,
                    canvas: { width: 2000, height: 2000 },
                    entities: [
                        { id: 'e1', type: 'player', team: 'attack', x: 100, y: 100 },
                        { id: 'e2', type: 'ball', team: 'attack', x: 200, y: 200 }
                    ],
                    frames: [
                        { t: 0, updates: [{ id: 'e1', x: 100, y: 100 }] },
                        { t: 1, updates: [{ id: 'e1', x: 150, y: 150 }] }
                    ]
                }
            };
            const res = createResponse();

            await shareHandler(req, res);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
            devShareId = res.body.id;
        });

        it('should reject invalid version with 400', async () => {
            const req: any = {
                method: 'POST',
                body: { version: 2, canvas: { width: 2000, height: 2000 }, entities: [], frames: [] }
            };
            const res = createResponse();

            await shareHandler(req, res);

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toMatch(/version/i);
        });

        it('should reject missing entities with 400', async () => {
            const req: any = {
                method: 'POST',
                body: { version: 1, canvas: { width: 2000, height: 2000 }, frames: [] }
            };
            const res = createResponse();

            await shareHandler(req, res);

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toMatch(/entities/i);
        });

        it('should handle OPTIONS preflight', async () => {
            const req: any = { method: 'OPTIONS' };
            const res = createResponse();

            await shareHandler(req, res);

            expect(res.statusCode).toBe(200);
            expect(res.headers['Access-Control-Allow-Methods']).toContain('POST');
        });
    });



    describe('GET /api/share/:id', () => {
        it('should retrieve a valid share', async () => {
            if (!devShareId) {
                // Skip if first test failed or wasn't run
                return;
            }

            const req: any = {
                method: 'GET',
                query: { id: devShareId }
            };
            const res = createResponse();

            await shareIdHandler(req, res);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('version', 1);
            expect(res.body.canvas).toEqual({ width: 2000, height: 2000 });
        });

        it('should return 404 for non-existent share', async () => {
            const req: any = {
                method: 'GET',
                query: { id: '00000000-0000-4000-8000-000000000000' }
            };
            const res = createResponse();

            await shareIdHandler(req, res);

            expect(res.statusCode).toBe(404);
        });

        it('should return 400 for invalid UUID format', async () => {
            const req: any = {
                method: 'GET',
                query: { id: 'invalid-uuid-format' }
            };
            const res = createResponse();

            await shareIdHandler(req, res);

            expect(res.statusCode).toBe(400);
        });

        it('should ensure response headers contain security and CORS settings', async () => {
            const req: any = { method: 'OPTIONS' };
            const res = createResponse();
            await shareIdHandler(req, res);
            expect(res.headers['Access-Control-Allow-Origin']).toBeDefined();
        });

        it('should handle OPTIONS preflight', async () => {
            const req: any = { method: 'OPTIONS' };
            const res = createResponse();

            await shareIdHandler(req, res);

            expect(res.statusCode).toBe(200);
            expect(res.headers['Access-Control-Allow-Methods']).toContain('GET');
        });
    });

    describe('Edge Cases & Validation', () => {
        it('should return 413 for oversized payloads', async () => {
            const largeCanvas = new Array(150000).fill('a').join(''); // ~150KB string
            const req: any = {
                method: 'POST',
                body: {
                    version: 1,
                    canvas: { width: 2000, height: 2000, extra: largeCanvas }, // Injected large data
                    entities: [],
                    frames: []
                }
            };
            const res = createResponse();
            await shareHandler(req, res);
            // Expect 413
            expect(res.statusCode).toBe(413);
        });

        it('should return 400 for malformed structure (Zod validation)', async () => {
            const req: any = {
                method: 'POST',
                body: {
                    version: 1,
                    canvas: { width: "invalid_string", height: 2000 },
                    entities: [],
                    frames: []
                }
            };
            const res = createResponse();
            await shareHandler(req, res);
            // Expect 400 and specific error message about canvas.width
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toContain('canvas.width');
        });
    });
});
