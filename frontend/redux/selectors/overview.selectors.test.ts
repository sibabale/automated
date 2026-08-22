// [ REDUX > SELECTORS > OVERVIEW > TESTS ] ##########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import {
    selectOverviewError,
    selectOverviewMetricCards,
    selectOverviewQualitativeAnalysis,
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
    it('maps backend-supplied metric values and descriptions onto overview cards', () => {
        const state = stateWith({
            status: 'succeeded',
            ticker: 'MSFT',
            metrics: [
                { slug: 'return-on-equity', value: '35.0%', strength: 'strong', description: 'Strong shareholder returns' },
                { slug: 'free-cash-flow', value: '3.2x', strength: 'strong', description: 'Funds 3 or more years of operations' },
                { slug: 'debt-to-equity', value: '0.80', strength: 'medium', description: 'Manageable leverage' },
                { slug: 'profit-margin', value: '18.0%', strength: 'medium', description: 'Acceptable pricing power' },
                { slug: 'margin-of-safety', value: '12.0%', strength: 'medium', description: 'Fairly valued' },
            ],
            reportHeader: {
                companyName: 'Microsoft Corporation',
                industry: 'Software',
                sector: 'Technology',
                sharePrice: '$512.34 USD',
                ticker: 'MSFT',
            },
            qualitativeAnalysis: {
                summary: 'Microsoft shows a constructive profile.',
                pillars: [
                    {
                        label: 'Capital Efficiency',
                        title: 'Returns and margins look healthy',
                        description: 'ROE and margins both screen well.',
                    },
                ],
            },
            errorKind: null,
            errorMessage: null,
        });

        expect(selectOverviewMetricCards(state)).toEqual(expect.arrayContaining([
            expect.objectContaining({
                slug: 'return-on-equity',
                label: 'Return on Equity',
                value: '35.0%',
                strength: 'strong',
                description: 'Strong shareholder returns',
            }),
            expect.objectContaining({
                slug: 'free-cash-flow',
                value: '3.2x',
                strength: 'strong',
                description: 'Funds 3 or more years of operations',
            }),
            expect.objectContaining({
                slug: 'debt-to-equity',
                value: '0.80',
                strength: 'medium',
                description: 'Manageable leverage',
            }),
            expect.objectContaining({
                slug: 'profit-margin',
                value: '18.0%',
                strength: 'medium',
                description: 'Acceptable pricing power',
            }),
            expect.objectContaining({
                slug: 'margin-of-safety',
                value: '12.0%',
                strength: 'medium',
                description: 'Fairly valued',
            }),
        ]));
    });

    it('keeps the static metric copy only for cards the backend did not return', () => {
        const state = stateWith({
            status: 'succeeded',
            ticker: 'NVDA',
            metrics: [
                { slug: 'free-cash-flow', value: '—', strength: 'weak', description: 'Funds less than 2 years of operations' },
            ],
            reportHeader: {
                companyName: 'NVIDIA Corporation',
                industry: 'Semiconductors',
                sector: 'Technology',
                sharePrice: '$172.42 USD',
                ticker: 'NVDA',
            },
            qualitativeAnalysis: null,
            errorKind: null,
            errorMessage: null,
        });

        expect(selectOverviewMetricCards(state)).toEqual(expect.arrayContaining([
            expect.objectContaining({
                slug: 'free-cash-flow',
                strength: 'weak',
                description: 'Funds less than 2 years of operations',
            }),
            expect.objectContaining({
                slug: 'debt-to-equity',
                strength: 'weak',
                description: 'Highly serviceable',
            }),
        ]));
    });

    it('passes through backend weak descriptions', () => {
        const state = stateWith({
            status: 'succeeded',
            ticker: 'TSLA',
            metrics: [
                { slug: 'free-cash-flow', value: '1.2x', strength: 'weak', description: 'Funds less than 2 years of operations' },
                { slug: 'debt-to-equity', value: '2.10', strength: 'weak', description: 'Leverage risk' },
                { slug: 'profit-margin', value: '8.0%', strength: 'weak', description: 'Low pricing power' },
                { slug: 'margin-of-safety', value: '-12.0%', strength: 'weak', description: 'Overvalued' },
            ],
            reportHeader: {
                companyName: 'Tesla, Inc.',
                industry: 'Auto Manufacturers',
                sector: 'Consumer Cyclical',
                sharePrice: '$289.12 USD',
                ticker: 'TSLA',
            },
            qualitativeAnalysis: null,
            errorKind: null,
            errorMessage: null,
        });

        expect(selectOverviewMetricCards(state)).toEqual(expect.arrayContaining([
            expect.objectContaining({
                slug: 'free-cash-flow',
                strength: 'weak',
                description: 'Funds less than 2 years of operations',
            }),
            expect.objectContaining({
                slug: 'debt-to-equity',
                strength: 'weak',
                description: 'Leverage risk',
            }),
            expect.objectContaining({
                slug: 'profit-margin',
                strength: 'weak',
                description: 'Low pricing power',
            }),
            expect.objectContaining({
                slug: 'margin-of-safety',
                strength: 'weak',
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
            qualitativeAnalysis: {
                summary: 'Microsoft shows a constructive profile.',
                pillars: [
                    {
                        label: 'Capital Efficiency',
                        title: 'Returns and margins look healthy',
                        description: 'ROE and margins both screen well.',
                    },
                ],
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
        expect(selectOverviewQualitativeAnalysis(state)).toEqual({
            summary: 'Microsoft shows a constructive profile.',
            pillars: [
                {
                    label: 'Capital Efficiency',
                    title: 'Returns and margins look healthy',
                    description: 'ROE and margins both screen well.',
                },
            ],
        });
    });

    it('exposes an error view only when the overview request failed', () => {
        const failed = stateWith({
            status: 'failed',
            ticker: 'MISS',
            metrics: [],
            reportHeader: null,
            qualitativeAnalysis: null,
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
            qualitativeAnalysis: null,
            errorKind: null,
            errorMessage: null,
        });

        expect(selectOverviewError(failed)).toEqual({ kind: 'not-found', message: 'Company not found' });
        expect(selectOverviewError(succeeded)).toBeNull();
    });
});
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
