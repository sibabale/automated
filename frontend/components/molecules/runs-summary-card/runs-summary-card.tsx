// [ COMPONENTS > MOLECULES > RUNS SUMMARY CARD ] #####################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import React from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
    RunsSummaryCardContainer,
    RunsSummaryDescription,
    RunsSummaryLabel,
    RunsSummaryValue,
} from './runs-summary-card.styles';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
interface IRunsSummaryCard {
    label: string;
    value: string;
    description?: string;
}
// 1.3. END ..........................................................................................

// 1.4. COMPONENT ....................................................................................
const RunsSummaryCard: React.FC<IRunsSummaryCard> = ({ label, value, description }) => {
    return (
        <RunsSummaryCardContainer data-testid="runs-summary-card">
            <RunsSummaryLabel>{label}</RunsSummaryLabel>
            <RunsSummaryValue>{value}</RunsSummaryValue>
            {description && <RunsSummaryDescription>{description}</RunsSummaryDescription>}
        </RunsSummaryCardContainer>
    );
};
// 1.4. END ..........................................................................................

export default RunsSummaryCard;

// END FILE ##########################################################################################
