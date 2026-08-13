// [ COMPONENTS > ORGANISMS > CONSOLIDATION SUMMARY ] ##############################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
    ConsolidationDenominator,
    ConsolidationDesktopCalculation,
    ConsolidationDesktopNote,
    ConsolidationFraction,
    ConsolidationMobileCalculation,
    ConsolidationMobileNote,
    ConsolidationNote,
    ConsolidationNoteLabel,
    ConsolidationNoteText,
    ConsolidationNumerator,
    ConsolidationResult,
    ConsolidationSummaryContainer,
    ConsolidationTitle,
} from './consolidation-summary.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IConsolidationSummary {
    title: string;
    values: string[];
    denominator: string;
    result: string;
    note: string;
    mobileResult?: string;
    mobileNote?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const ConsolidationSummary: React.FC<IConsolidationSummary> = ({
    title,
    values,
    denominator,
    result,
    note,
    mobileResult = result,
    mobileNote = note,
}) => {
    const calculation = `(${values.join(' + ')}) / ${denominator.split(' ')[0]} = ${mobileResult}`;

    return (
        <ConsolidationSummaryContainer data-testid="consolidation-summary">
            <ConsolidationTitle data-testid="consolidation-summary-title">
                {title}
            </ConsolidationTitle>
            <ConsolidationMobileCalculation data-testid="consolidation-summary-mobile-calculation">
                {calculation}
            </ConsolidationMobileCalculation>
            <ConsolidationDesktopCalculation data-testid="consolidation-summary-desktop-calculation">
                <ConsolidationFraction>
                    <ConsolidationNumerator>{values.join(' + ')}</ConsolidationNumerator>
                    <ConsolidationDenominator>{denominator}</ConsolidationDenominator>
                </ConsolidationFraction>
                <span>=</span>
                <ConsolidationResult>{result}</ConsolidationResult>
            </ConsolidationDesktopCalculation>
            <ConsolidationNote>
                <ConsolidationNoteLabel>Weight Bias Note</ConsolidationNoteLabel>
                <ConsolidationNoteText data-testid="consolidation-summary-note">
                    <ConsolidationDesktopNote>{note}</ConsolidationDesktopNote>
                    <ConsolidationMobileNote>{mobileNote}</ConsolidationMobileNote>
                </ConsolidationNoteText>
            </ConsolidationNote>
        </ConsolidationSummaryContainer>
    );
};

// 1.6. END ........................................................................................

export default ConsolidationSummary;

// END FILE ########################################################################################
