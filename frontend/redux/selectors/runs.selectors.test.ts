// [ REDUX > SELECTORS > RUNS > TESTS ] ###############################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { describe, expect, it } from 'vitest';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import {
    selectRunsError,
    selectRunsIsEmpty,
    selectRunsItems,
    selectRunsPage,
    selectRunsStatus,
    selectRunsTotalPages,
} from './runs.selectors';
// 1.2. END ..........................................................................................

const stateWith = (slice: RootState['runs']): RootState => ({ runs: slice }) as unknown as RootState;

describe('runs selectors', () => {
    it('exposes the current runs page and pagination', () => {
        const state = stateWith({
            status: 'succeeded',
            page: 2,
            pageSize: 10,
            totalItems: 21,
            totalPages: 3,
            items: [
                {
                    apiVersion: 'v1',
                    ticker: 'AAPL',
                    companyName: 'Apple Inc.',
                    batchId: 'batch-1',
                    sourceFile: 'ticker.json',
                    processedAt: '2026-08-19T10:00:00.000Z',
                    status: 'reject',
                    scoreAtPurchase: 72,
                    analysisModel: 'automated-investment-v1',
                    constitutionVersion: 'all-five-metrics-must-be-strong',
                },
            ],
            errorKind: null,
            errorMessage: null,
        });

        expect(selectRunsStatus(state)).toBe('succeeded');
        expect(selectRunsPage(state)).toBe(2);
        expect(selectRunsTotalPages(state)).toBe(3);
        expect(selectRunsItems(state)).toHaveLength(1);
        expect(selectRunsIsEmpty(state)).toBe(false);
        expect(selectRunsError(state)).toBeNull();
    });
});
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
