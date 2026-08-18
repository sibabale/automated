// [ REDUX > SELECTORS > OVERVIEW > TESTS ] ##########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import {
    selectOverviewError,
    selectOverviewMetricCards,
    selectOverviewReportHeader,
    selectOverviewStatus,
    selectOverviewTicker,
} from './overview.selectors';
// 1.2. END ..........................................................................................

// 1.3. HELPERS ......................................................................................
const stateWith = (slice: RootState['overview']): RootState =>
    ({ overview: slice } as RootState);
// 1.3. END ..........................................................................................

// 1.4. TEST CASES ...................................................................................
describe('overview selectors', () => {
    it('maps fetched metric values onto overview cards and applies Buffett-style labels', () => {
        const state = stateWith({
            status: 'succeeded',
            ticker: 'MSFT',
            metrics: [
                { slug: 'return-on-equity', value: '35.0%' },
                { slug: 'free-cash-flow', value: '$12.5B' },
                { slug: 'debt-to-equity', value: '0.80' },
                { slug: 'profit-margin', value: '18.0%' },
                { slug: 'margin-of-safety', value: '12.0%' },
            ],
            reportHeader: {
                companyName: 'Microsoft Corporation',
                industry: 'Software',
                sector: 'Technology',
                sharePrice: '$512.34 USD',
                ticker: 'MSFT',
            },
            errorKind: null,
            errorMessage: null,
        });

        expect(selectOverviewMetricCards(state)).toEqual(expect.arrayContaining([
            expect.objectContaining({
                slug: 'return-on-equity',
                label: 'Return on Equity',
                value: '35.0%',
                description: 'Buffett Target: > 15%',
            }),
            expect.objectContaining({
                slug: 'free-cash-flow',
                value: '$12.5B',
                description: 'Funds growth and expansion',
            }),
            expect.objectContaining({
                slug: 'debt-to-equity',
                value: '0.80',
                description: 'Manageable leverage',
            }),
            expect.objectContaining({
                slug: 'profit-margin',
                value: '18.0%',
                description: 'Acceptable pricing power',
            }),
            expect.objectContaining({
                slug: 'margin-of-safety',
                value: '12.0%',
                description: 'Fairly valued',
            }),
        ]));
    });

    it('keeps the fallback copy when a live value is missing or cannot be parsed', () => {
        const state = stateWith({
            status: 'succeeded',
            ticker: 'NVDA',
            metrics: [
                { slug: 'free-cash-flow', value: '—' },
                { slug: 'debt-to-equity', value: 'not-a-number' },
            ],
            reportHeader: {
                companyName: 'NVIDIA Corporation',
                industry: 'Semiconductors',
                sector: 'Technology',
                sharePrice: '$172.42 USD',
                ticker: 'NVDA',
            },
            errorKind: null,
            errorMessage: null,
        });

        expect(selectOverviewMetricCards(state)).toEqual(expect.arrayContaining([
            expect.objectContaining({
                slug: 'free-cash-flow',
                description: 'Consistent expansion',
            }),
            expect.objectContaining({
                slug: 'debt-to-equity',
                description: 'Highly serviceable',
            }),
        ]));
    });

    it('classifies weak threshold values with the lowest-signal labels', () => {
        const state = stateWith({
            status: 'succeeded',
            ticker: 'TSLA',
            metrics: [
                { slug: 'free-cash-flow', value: '-$0.5B' },
                { slug: 'debt-to-equity', value: '2.10' },
                { slug: 'profit-margin', value: '8.0%' },
                { slug: 'margin-of-safety', value: '-12.0%' },
            ],
            reportHeader: {
                companyName: 'Tesla, Inc.',
                industry: 'Auto Manufacturers',
                sector: 'Consumer Cyclical',
                sharePrice: '$289.12 USD',
                ticker: 'TSLA',
            },
            errorKind: null,
            errorMessage: null,
        });

        expect(selectOverviewMetricCards(state)).toEqual(expect.arrayContaining([
            expect.objectContaining({
                slug: 'free-cash-flow',
                description: 'Limited capacity to self-fund growth',
            }),
            expect.objectContaining({
                slug: 'debt-to-equity',
                description: 'Leverage risk',
            }),
            expect.objectContaining({
                slug: 'profit-margin',
                description: 'Low pricing power',
            }),
            expect.objectContaining({
                slug: 'margin-of-safety',
                description: 'Overvalued',
            }),
        ]));
    });

    it('passes through the current ticker, status, and report header', () => {
        const state = stateWith({
            status: 'succeeded',
            ticker: 'MSFT',
            metrics: [],
            reportHeader: {
                companyName: 'Microsoft Corporation',
                industry: 'Software',
                sector: 'Technology',
                sharePrice: '$512.34 USD',
                ticker: 'MSFT',
            },
            errorKind: null,
            errorMessage: null,
        });

        expect(selectOverviewStatus(state)).toBe('succeeded');
        expect(selectOverviewTicker(state)).toBe('MSFT');
        expect(selectOverviewReportHeader(state)).toEqual({
            companyName: 'Microsoft Corporation',
            industry: 'Software',
            sector: 'Technology',
            sharePrice: '$512.34 USD',
            ticker: 'MSFT',
        });
    });

    it('exposes an error view only when the overview request failed', () => {
        const failed = stateWith({
            status: 'failed',
            ticker: 'MISS',
            metrics: [],
            reportHeader: null,
            errorKind: 'not-found',
            errorMessage: 'Company not found',
        });
        const succeeded = stateWith({
            status: 'succeeded',
            ticker: 'AAPL',
            metrics: [],
            reportHeader: {
                companyName: 'Apple Inc.',
                industry: 'Consumer Electronics',
                sector: 'Technology',
                sharePrice: '$184.25 USD',
                ticker: 'AAPL',
            },
            errorKind: null,
            errorMessage: null,
        });

        expect(selectOverviewError(failed)).toEqual({ kind: 'not-found', message: 'Company not found' });
        expect(selectOverviewError(succeeded)).toBeNull();
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
