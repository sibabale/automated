import http from 'node:http';
import { URL } from 'node:url';
export function startMockFmpServer(routes) {
    const requests = [];
    const server = http.createServer((req, res) => {
        if (!req.url) {
            res.statusCode = 400;
            res.end();
            return;
        }
        const url = new URL(req.url, `http://${req.headers.host}`);
        // Record every inbound request so tests can assert on URL and params.
        requests.push({
            method: req.method ?? 'GET',
            pathname: url.pathname.replace(/^\/+/, ''),
            searchParams: url.searchParams,
        });
        const path = url.pathname.replace(/^\/+/, '');
        const route = routes[path];
        if (!route) {
            res.statusCode = 404;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ message: 'not found' }));
            return;
        }
        res.statusCode = route.status ?? 200;
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify(route.body ?? null));
    });
    return new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            const port = typeof address === 'object' && address ? address.port : null;
            const mockServer = {
                url: `http://127.0.0.1:${port}`,
                get lastRequest() { return requests[requests.length - 1] ?? null; },
                requests,
                close: () => new Promise((r) => server.close(() => r())),
            };
            resolve(mockServer);
        });
    });
}
//# sourceMappingURL=mock-fmp-server.js.map