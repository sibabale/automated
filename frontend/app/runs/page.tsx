// [ APP > RUNS PAGE ] ###############################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
'use client';

import React, { useEffect, useState } from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { fetchRuns } from '../../redux/slices/runs.slice';
import Header from '../../components/molecules/header/header';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import Pagination from '../../components/molecules/pagination/pagination';
import RunsSummaryCard from '../../components/molecules/runs-summary-card/runs-summary-card';
import {
    selectRunsError,
    selectRunsIsEmpty,
    selectRunsItems,
    selectRunsPage,
    selectRunsStatus,
    selectRunsTotalItems,
    selectRunsTotalPages,
} from '../../redux/selectors/runs.selectors';
import {
    RunsContainer,
    RunsContent,
    RunsFilterBar,
    RunsFilterButton,
    RunsFilterLabel,
    RunsHeader,
    RunsHeaderContent,
    RunsHeading,
    RunsSection,
    RunsSectionTitle,
    RunsStatusBadge,
    RunsSubtitle,
    RunsSummaryRow,
    RunsTable,
    RunsTableBody,
    RunsTableCell,
    RunsTableHead,
    RunsTableHeaderCell,
    RunsTableRowLink,
} from './page.styles';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
type IRunsPage = Record<never, never>;
type StatusFilter = '' | 'buy' | 'watch' | 'reject';
// 1.3. END ..........................................................................................

// 1.4. CONSTANTS ....................................................................................
const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'buy', label: 'Buy' },
    { value: 'watch', label: 'Watch' },
    { value: 'reject', label: 'Reject' },
];
// 1.4. END ..........................................................................................

// 1.5. COMPONENT ....................................................................................
const RunsPage: React.FC<IRunsPage> = () => {
    const dispatch = useAppDispatch();
    const runsStatus = useAppSelector(selectRunsStatus);
    const runsItems = useAppSelector(selectRunsItems);
    const runsError = useAppSelector(selectRunsError);
    const runsPage = useAppSelector(selectRunsPage);
    const runsTotalPages = useAppSelector(selectRunsTotalPages);
    const runsTotalItems = useAppSelector(selectRunsTotalItems);
    const isRunsEmpty = useAppSelector(selectRunsIsEmpty);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
    const isLoading = runsStatus === 'idle' || runsStatus === 'loading';
    const latestProcessed = runsItems[0]?.processedAt?.slice(0, 10) ?? '—';

    useEffect(() => {
        dispatch(fetchRuns({ page, status: statusFilter || undefined }));
    }, [dispatch, page, statusFilter]);

    const handleStatusChange = (value: StatusFilter) => {
        setStatusFilter(value);
        setPage(1);
    };

    return (
        <RunsContainer>
            <Header />
            <RunsHeader>
                <RunsHeaderContent>
                    <RunsHeading>Runs</RunsHeading>
                    <RunsSubtitle>Automated background decisions · newest first</RunsSubtitle>
                </RunsHeaderContent>
            </RunsHeader>
            <RunsContent data-testid="runs-page">
                <RunsSummaryRow>
                    <RunsSummaryCard label="Total runs" value={String(runsTotalItems)} description={`Latest processed ${latestProcessed}`} />
                    <RunsSummaryCard label="Current page" value={`${runsPage} / ${runsTotalPages}`} description="Newest runs first" />
                </RunsSummaryRow>
                <RunsSection>
                    <RunsSectionTitle>Decision runs</RunsSectionTitle>
                    <RunsFilterBar>
                        <RunsFilterLabel>Status:</RunsFilterLabel>
                        {STATUS_FILTERS.map((filter) => (
                            <RunsFilterButton
                                key={filter.value}
                                type="button"
                                $active={statusFilter === filter.value}
                                onClick={() => handleStatusChange(filter.value)}
                                aria-pressed={statusFilter === filter.value}
                            >
                                {filter.label}
                            </RunsFilterButton>
                        ))}
                    </RunsFilterBar>
                    {isLoading ? (
                        <RunsTable data-testid="runs-table-loading" role="status">
                            <RunsTableHead>
                                <tr>
                                    <RunsTableHeaderCell>Time</RunsTableHeaderCell>
                                    <RunsTableHeaderCell>Ticker</RunsTableHeaderCell>
                                    <RunsTableHeaderCell>Status</RunsTableHeaderCell>
                                    <RunsTableHeaderCell>Batch</RunsTableHeaderCell>
                                </tr>
                            </RunsTableHead>
                            <RunsTableBody />
                        </RunsTable>
                    ) : runsError ? (
                        <RunsSummaryCard label="Unable to load runs" value={runsError.message} description="Try again to reload the decision list." />
                    ) : isRunsEmpty ? (
                        <RunsSummaryCard label="No runs yet" value="—" description="The background automation has not produced decisions yet." />
                    ) : (
                        <RunsTable data-testid="runs-table">
                            <RunsTableHead>
                                <tr>
                                    <RunsTableHeaderCell>Time</RunsTableHeaderCell>
                                    <RunsTableHeaderCell>Ticker</RunsTableHeaderCell>
                                    <RunsTableHeaderCell>Status</RunsTableHeaderCell>
                                    <RunsTableHeaderCell>Batch</RunsTableHeaderCell>
                                </tr>
                            </RunsTableHead>
                            <RunsTableBody>
                                {runsItems.map((run) => (
                                    <RunsTableRowLink
                                        key={`${run.batchId}-${run.ticker}-${run.processedAt}`}
                                        href={`/runs/${encodeURIComponent(run.batchId)}/${encodeURIComponent(run.ticker)}`}
                                    >
                                        <RunsTableCell>{run.processedAt.replace('T', ' ').slice(0, 16)}</RunsTableCell>
                                        <RunsTableCell>{run.ticker}</RunsTableCell>
                                        <RunsTableCell><RunsStatusBadge>{run.status}</RunsStatusBadge></RunsTableCell>
                                        <RunsTableCell>{run.batchId}</RunsTableCell>
                                    </RunsTableRowLink>
                                ))}
                            </RunsTableBody>
                        </RunsTable>
                    )}
                </RunsSection>
                {!isLoading && !runsError && !isRunsEmpty && (
                    <Pagination
                        ariaLabel="Decision runs pages"
                        currentPage={runsPage}
                        onPageChange={setPage}
                        testId="runs-pagination"
                        totalPages={runsTotalPages}
                    />
                )}
            </RunsContent>
        </RunsContainer>
    );
};
// 1.5. END ..........................................................................................

export default RunsPage;

// END FILE ##########################################################################################
