export interface RequestRecord {
    method: string;
    pathname: string;
    searchParams: URLSearchParams;
}
export interface MockFmpServer {
    url: string;
    /** The most recently received request — null before any request arrives. */
    lastRequest: RequestRecord | null;
    /** All requests received in order, oldest first. */
    requests: RequestRecord[];
    close: () => Promise<void>;
}
export declare function startMockFmpServer(routes: Record<string, {
    status?: number;
    body?: unknown;
}>): Promise<MockFmpServer>;
//# sourceMappingURL=mock-fmp-server.d.ts.map