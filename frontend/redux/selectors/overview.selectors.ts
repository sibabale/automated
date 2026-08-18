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
        strength: OverviewMetricValue['strength'];
        description: string;
    }> => {
        const metricsBySlug = new Map(slice.metrics.map((metric) => [metric.slug, metric]));

        return financialMetrics.map((metric) => ({
            slug: metric.slug as OverviewMetricValue['slug'],
            label: metric.label,
            value: metricsBySlug.get(metric.slug as OverviewMetricValue['slug'])?.value ?? '—',
            strength: metricsBySlug.get(metric.slug as OverviewMetricValue['slug'])?.strength ?? 'weak',
            description: metricsBySlug.get(metric.slug as OverviewMetricValue['slug'])?.description ?? metric.description,
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
