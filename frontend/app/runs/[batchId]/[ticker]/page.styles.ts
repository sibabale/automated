// [ APP > RUNS > DETAIL ] ###########################################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import styled from 'styled-components';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { media } from '../../../../theme';
// 1.2. END ..........................................................................................

// 1.3. STYLES .......................................................................................
export const DetailContainer = styled.div`
    min-height: 100vh;
    background-color: ${({ theme }) => theme.background.primary};
`;

export const DetailContent = styled.main`
    display: grid;
    gap: ${({ theme }) => theme.spacing.xl};
    max-width: 1200px;
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing.m};

    ${media.tablet} {
        padding: ${({ theme }) => theme.spacing.xl};
    }
`;

export const DetailHeader = styled.header`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.s};
`;

export const DetailBackLink = styled.a`
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    text-decoration: none;

    &:hover {
        color: ${({ theme }) => theme.text.primary};
        text-decoration: underline;
    }
`;

export const DetailHeading = styled.h1`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

export const DetailSubtitle = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.md};
`;

export const DetailSection = styled.section`
    display: grid;
    gap: ${({ theme }) => theme.spacing.m};
`;

export const DetailSectionTitle = styled.h2`
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

export const DetailGrid = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing.s};
    grid-template-columns: 1fr;

    ${media.tablet} {
        grid-template-columns: repeat(2, 1fr);
    }

    ${media.desktop} {
        grid-template-columns: repeat(3, 1fr);
    }
`;

export const DetailCard = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.m};
    border: 1px solid ${({ theme }) => theme.border.default};
    border-radius: ${({ theme }) => theme.spacing.s};
    background-color: ${({ theme }) => theme.background.secondary};
`;

export const DetailCardLabel = styled.span`
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    text-transform: uppercase;
    letter-spacing: 0.04em;
`;

export const DetailCardValue = styled.span`
    color: ${({ theme }) => theme.text.primary};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

export const DetailCardDescription = styled.span`
    color: ${({ theme }) => theme.text.tertiary};
    font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export const DetailStatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: ${({ theme }) => `${theme.spacing.xxxs} ${theme.spacing.xs}`};
    border: 1px solid ${({ theme }) => theme.border.default};
    border-radius: ${({ theme }) => theme.spacing.ss};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    text-transform: uppercase;
`;

export const DetailStrengthBadge = styled.span<{ $strength: 'strong' | 'medium' | 'weak' }>`
    display: inline-flex;
    align-items: center;
    padding: ${({ theme }) => `${theme.spacing.xxxs} ${theme.spacing.xs}`};
    border-radius: ${({ theme }) => theme.spacing.ss};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    text-transform: uppercase;
    background-color: ${({ theme, $strength }) => {
        switch ($strength) {
            case 'strong':
                return theme.status.positive.background;
            case 'medium':
                return theme.background.surface;
            case 'weak':
                return theme.status.negative.background;
            default:
                return theme.background.secondary;
        }
    }};
    color: ${({ theme, $strength }) => {
        switch ($strength) {
            case 'strong':
                return theme.status.positive.icon;
            case 'medium':
                return theme.text.secondary;
            case 'weak':
                return theme.status.negative.icon;
            default:
                return theme.text.primary;
        }
    }};
`;

export const DetailErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.m};
    padding: ${({ theme }) => theme.spacing.xxl};
    text-align: center;
`;

export const DetailErrorMessage = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: ${({ theme }) => theme.fontSizes.md};
`;
// 1.3. END ..........................................................................................

// END FILE ##########################################################################################
