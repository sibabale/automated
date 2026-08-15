// [ COMPONENTS > ORGANISMS > REPORT HEADER ] ########################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { motion } from 'motion/react';
import styled from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { media } from '../../../theme';
import type { ITheme } from '../../../theme';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. FUNCTIONS ..................................................................................
// 1.5. END ........................................................................................

// 1.6. STYLES .....................................................................................
export const ReportHeaderContainer = styled.header`
    display: flex;
    position: relative;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    border-bottom: 1px solid ${({ theme }) => theme.border.default};
    background-color: ${({ theme }) => theme.background.primary};

    ${media.up('md')`
        min-height: ${({ theme }: { theme: ITheme }) => theme.size[26]};
        flex-direction: row;
    `}
`;

export const ReportIdentity = styled(motion.div)`
    box-sizing: border-box;
    display: flex;
    min-width: 0;
    flex: 1;
    flex-wrap: wrap;
    align-content: center;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.m};

    ${media.up('md')`
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.m} 0;
    `}

    ${media.down('md')`
        padding: 0 ${({ theme }: { theme: ITheme }) => `calc(${theme.size[12]} + ${theme.spacing.m})`} 0 0;
    `}
`;

export const ReportTitle = styled.h1`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1.1;

    ${media.up('md')`
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.xxxl};
    `}
`;

export const ReportTicker = styled.span`
    max-width: 100%;
    padding: 3px ${({ theme }) => theme.spacing.xs};
    border: 1px solid ${({ theme }) => theme.border.subtle};
    background-color: ${({ theme }) => theme.background.surface};
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    overflow-wrap: anywhere;
`;

export const ReportMeta = styled.p`
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.ss};
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.4;

    ${media.down('md')`
        width: auto;
    `}
`;

export const ReportMetaItem = styled.span`
    overflow-wrap: anywhere;

    &:last-child {
        ${media.down('md')`
            display: none;
        `}
    }
`;

export const ReportMetaSeparator = styled.span`
    color: ${({ theme }) => theme.text.tertiary};
`;

export const ReportValuation = styled.p`
    width: 100%;
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    line-height: 1.4;
    overflow-wrap: anywhere;

    ${media.down('md')`
        width: auto;
    `}
`;

export const ReportScore = styled(motion.div)`
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.s};
    padding: 0 ${({ theme }) => theme.spacing.m} ${({ theme }) => theme.spacing.m};

    ${media.up('md')`
        width: auto;
        padding: 0;
    `}

    ${media.down('md')`
        position: absolute;
        top: 0;
        right: 0;
        width: auto;
        padding: 0;
    `}
`;

export const ReportScoreSummary = styled.div`
    display: grid;
    min-width: 0;
    gap: ${({ theme }) => theme.spacing.ss};
    text-align: left;

    ${media.up('md')`
        text-align: right;
    `}

    ${media.down('md')`
        display: none;
    `}
`;

export const ReportScoreLabel = styled.span`
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.semiBold};
    text-transform: uppercase;
`;

export const ReportScoreDescription = styled.span`
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    line-height: 1.35;
    overflow-wrap: anywhere;
`;

export const ReportScoreValue = styled.strong`
    display: grid;
    width: ${({ theme }) => theme.size[20]};
    min-width: ${({ theme }) => theme.size[20]};
    min-height: ${({ theme }) => theme.size[20]};
    align-content: center;
    padding: ${({ theme }) => theme.spacing.xs};
    background-color: ${({ theme }) => theme.background.inverse};
    color: ${({ theme }) => theme.text.inverse};
    font-size: ${({ theme }) => theme.fontSizes.xxxl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    line-height: 1;
    text-align: center;

    ${media.down('md')`
        width: ${({ theme }: { theme: ITheme }) => theme.size[12]};
        min-width: ${({ theme }: { theme: ITheme }) => theme.size[12]};
        min-height: ${({ theme }: { theme: ITheme }) => theme.size[12]};
        font-size: ${({ theme }: { theme: ITheme }) => theme.fontSizes.xxl};
    `}
`;

export const ReportHeaderLoadingIdentity = styled.div`
    box-sizing: border-box;
    padding: 0 ${({ theme }) => `calc(${theme.size[12]} + ${theme.spacing.m})`} 0 0;

    ${media.up('md')`
        flex: 0 1 80%;
        padding: ${({ theme }: { theme: ITheme }) => theme.spacing.m} 0;
    `}
`;

export const ReportHeaderLoadingScore = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    width: ${({ theme }) => theme.size[12]};
    min-width: ${({ theme }) => theme.size[12]};
    min-height: ${({ theme }) => theme.size[12]};

    ${media.up('md')`
        position: static;
        width: 20%;
        min-width: 0;
        min-height: ${({ theme }: { theme: ITheme }) => theme.size[20]};
    `}
`;
// 1.6. END ........................................................................................

// END FILE ########################################################################################
