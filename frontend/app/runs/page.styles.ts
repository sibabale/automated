// [ APP > RUNS PAGE ] ###############################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import styled from 'styled-components';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { media } from '../../theme';
import type { ITheme } from '../../theme';
// 1.2. END ..........................................................................................

// 1.3. STYLES .......................................................................................
export const RunsContainer = styled.div`
    min-height: 100vh;
    background-color: ${({ theme }) => theme.background.primary};
`;

export const RunsContent = styled.main`
    display: grid;
    gap: ${({ theme }) => theme.spacing.xl};
    width: 100%;
    max-width: ${({ theme }) => `calc(${theme.size[160]} + ${theme.size[160]})`};
    margin: 0 auto;
    padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.m}`};

    ${media.up('md')`
        gap: ${({ theme }: { theme: ITheme }) => theme.spacing.xxl};
        padding: ${({ theme }: { theme: ITheme }) => `${theme.spacing.xxl} ${theme.spacing.xl}`};
    `}
`;

export const RunsHeader = styled.header`
    border-bottom: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};
`;

export const RunsHeaderContent = styled.div`
    display: grid;
    width: 100%;
    max-width: ${({ theme }) => `calc(${theme.size[160]} + ${theme.size[160]})`};
    gap: ${({ theme }) => theme.spacing.xs};
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing.l} ${({ theme }) => theme.spacing.m};

    ${media.up('md')`
        padding: ${({ theme }: { theme: ITheme }) => `${theme.spacing.xl} ${theme.spacing.xl}`};
    `}
`;

export const RunsHeading = styled.h1`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.1;

    ${media.up('md')`
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.hero};
    `}
`;

export const RunsSubtitle = styled.span`
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export const RunsSummaryRow = styled.section`
    display: grid;
    gap: ${({ theme }) => theme.spacing.m};

    ${media.up('md')`
        grid-template-columns: repeat(2, minmax(0, 1fr));
    `}
`;

export const RunsSection = styled.section`
    display: grid;
    gap: ${({ theme }) => theme.spacing.m};
`;

export const RunsSectionTitle = styled.h2`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    text-transform: uppercase;
`;

export const RunsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    border: 1px solid ${({ theme }) => theme.border.default};
`;

export const RunsTableHead = styled.thead``;

export const RunsTableBody = styled.tbody``;

export const RunsTableRow = styled.tr`
    border-top: 1px solid ${({ theme }) => theme.border.default};
`;

export const RunsTableHeaderCell = styled.th`
    padding: ${({ theme }) => `${theme.spacing.s} ${theme.spacing.m}`};
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    text-align: left;
    text-transform: uppercase;
`;

export const RunsTableCell = styled.td`
    padding: ${({ theme }) => `${theme.spacing.s} ${theme.spacing.m}`};
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export const RunsStatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: ${({ theme }) => `${theme.spacing.xxxs} ${theme.spacing.xs}`};
    border: 1px solid ${({ theme }) => theme.border.default};
    border-radius: ${({ theme }) => theme.spacing.ss};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    text-transform: uppercase;
`;

export const RunsFilterBar = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.s};
    align-items: center;
`;

export const RunsFilterLabel = styled.span`
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export const RunsFilterButton = styled.button<{ $active?: boolean }>`
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.s}`};
    border: 1px solid ${({ theme, $active }) => ($active ? theme.text.primary : theme.border.default)};
    border-radius: ${({ theme }) => theme.spacing.ss};
    background-color: ${({ theme, $active }) => ($active ? theme.text.primary : theme.background.primary)};
    color: ${({ theme, $active }) => ($active ? theme.text.inverse : theme.text.secondary)};
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    text-transform: uppercase;
    transition: border-color 0.15s, background-color 0.15s, color 0.15s;

    &:hover {
        border-color: ${({ theme }) => theme.text.primary};
    }
`;
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
