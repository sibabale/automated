// [ APP > API > HEALTH > TESTS ] #####################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { GET } from './route';
// 1.2. END ..........................................................................................

// 1.3. TEST CASES ....................................................................................
describe('health route', () => {
    it('returns a healthy response with the correlation id header', async () => {
        const response = await GET(new NextRequest('http://localhost/api/health', {
            headers: { 'x-correlation-id': 'cid-health-001' },
        }));

        expect(response.status).toBe(200);
        expect(response.headers.get('x-correlation-id')).toBe('cid-health-001');
        await expect(response.json()).resolves.toMatchObject({
            status: 'ok',
            correlationId: 'cid-health-001',
            service: 'frontend',
        });
    });

    it('creates a correlation id when the request does not provide one', async () => {
        const response = await GET(new NextRequest('http://localhost/api/health'));
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get('x-correlation-id')).toBeTypeOf('string');
        expect(response.headers.get('x-correlation-id')).not.toHaveLength(0);
        expect(payload.status).toBe('ok');
        expect(payload.correlationId).toBe(response.headers.get('x-correlation-id'));
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
