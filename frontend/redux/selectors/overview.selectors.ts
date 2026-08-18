// [ REDUX > SELECTORS > OVERVIEW ] ##################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import { createSelector } from '@reduxjs/toolkit';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import type { RootState } from '../store';
import { financialMetrics } from '../../data/financial-metrics';
import type {
    OverviewErrorKind,
    OverviewMetricValue,
    OverviewReportHeader,
    OverviewStatus,
} from '../slices/overview.slice';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
export interface OverviewErrorView {
    kind: OverviewErrorKind;
    message: string;
}
// 1.3. END ..........................................................................................

// 1.4. SELECTORS ....................................................................................
const selectOverview = (state: RootState) => state.overview;

function parsePercent(value: string): number | null {
    const normalized = value.replace('%', '').trim();
    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : null;
}

function parseRatio(value: string): number | null {
    const parsed = Number(value.trim());

    return Number.isFinite(parsed) ? parsed : null;
}

function parseCurrencyMagnitude(value: string): number | null {
    const normalized = value.trim().replace('$', '').replace(/,/g, '');
    const match = normalized.match(/^(-?\d+(?:\.\d+)?)([BM])?$/i);

    if (!match) {
        return null;
    }

    const amount = Number(match[1]);

    if (!Number.isFinite(amount)) {
        return null;
    }

    const suffix = match[2]?.toUpperCase();

    if (suffix === 'B') {
        return amount * 1_000_000_000;
    }

    if (suffix === 'M') {
        return amount * 1_000_000;
    }

    return amount;
}

function describeMetric(slug: OverviewMetricValue['slug'], value: string, fallback: string): string {
    if (slug === 'return-on-equity') {
        return fallback;
    }

    if (value === '—') {
        return fallback;
    }

    if (slug === 'free-cash-flow') {
        const amount = parseCurrencyMagnitude(value);

        if (amount === null) {
            return fallback;
        }

        if (amount > 10_000_000_000) {
            return 'Funds growth and expansion';
        }

        if (amount > 0) {
            return 'Supports ongoing investment';
        }

        return 'Limited capacity to self-fund growth';
    }

    if (slug === 'debt-to-equity') {
        const ratio = parseRatio(value);

        if (ratio === null) {
            return fallback;
        }

        if (ratio <= 0.5) {
            return 'Conservative leverage';
        }

        if (ratio <= 1.5) {
            return 'Manageable leverage';
        }

        return 'Leverage risk';
    }

    if (slug === 'profit-margin') {
        const margin = parsePercent(value);

        if (margin === null) {
            return fallback;
        }

        if (margin >= 20) {
            return 'High pricing power';
        }

        if (margin >= 10) {
            return 'Acceptable pricing power';
        }

        return 'Low pricing power';
    }

    const marginOfSafety = parsePercent(value);

    if (marginOfSafety === null) {
        return fallback;
    }

    if (marginOfSafety >= 20) {
        return 'Attractive discount';
    }

    if (marginOfSafety >= 0) {
        return 'Fairly valued';
    }

    return 'Overvalued';
}

export const selectOverviewStatus = createSelector(
    selectOverview,
    (slice): OverviewStatus => slice.status,
);

export const selectOverviewTicker = createSelector(
    selectOverview,
    (slice): string | null => slice.reportHeader?.ticker ?? slice.ticker,
);

export const selectOverviewReportHeader = createSelector(
    selectOverview,
    (slice): OverviewReportHeader | null => slice.reportHeader,
);

/**
 * Reattaches the fetched metric values to the static registry metadata so the
 * home page can render one memoized card model instead of merging on every render.
 */
export const selectOverviewMetricCards = createSelector(
    selectOverview,
    (slice): Array<{
        slug: OverviewMetricValue['slug'];
        label: string;
        value: string;
        description: string;
    }> => {
        const valuesBySlug = new Map(slice.metrics.map((metric) => [metric.slug, metric.value]));

        return financialMetrics.map((metric) => ({
            slug: metric.slug as OverviewMetricValue['slug'],
            label: metric.label,
            value: valuesBySlug.get(metric.slug as OverviewMetricValue['slug']) ?? '—',
            description: describeMetric(
                metric.slug as OverviewMetricValue['slug'],
                valuesBySlug.get(metric.slug as OverviewMetricValue['slug']) ?? '—',
                metric.description,
            ),
        }));
    },
);

export const selectOverviewError = createSelector(
    selectOverview,
    (slice): OverviewErrorView | null => {
        if (slice.status !== 'failed' || !slice.errorKind) {
            return null;
        }

        return {
            kind: slice.errorKind,
            message: slice.errorMessage ?? 'The overview could not be loaded.',
        };
    },
);
// 1.4. END ..........................................................................................

// END FILE ##########################################################################################
