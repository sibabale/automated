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
    it('maps fetched metric values onto the static card metadata', () => {
        const state = stateWith({
            status: 'succeeded',
            ticker: 'MSFT',
            metrics: [
                { slug: 'return-on-equity', value: '35.0%' },
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
            }),
            expect.objectContaining({
                slug: 'margin-of-safety',
                value: '12.0%',
            }),
            expect.objectContaining({
                slug: 'free-cash-flow',
                value: '—',
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
