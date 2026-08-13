// [ COMPONENTS > ORGANISMS > FORMULA SECTION ] #####################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
    FormulaContent,
    FormulaDenominator,
    FormulaExpression,
    FormulaFootnote,
    FormulaFraction,
    FormulaIntro,
    FormulaIntroLabel,
    FormulaNumerator,
    FormulaPanel,
    FormulaPanelLabel,
    FormulaPanels,
    FormulaResult,
    FormulaSectionContainer,
    FormulaSectionTitle,
} from './formula-section.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IFormulaSection {
    title: string;
    standardFormulaLabel: string;
    actualsLabel: string;
    numeratorLabel: string;
    denominatorLabel: string;
    numeratorValue: string;
    denominatorValue: string;
    factor: string;
    calculationOperator?: 'divide' | 'subtract';
    result: string;
    footnote: string;
    metricAbbreviation?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const FormulaSection: React.FC<IFormulaSection> = ({
    title,
    standardFormulaLabel,
    actualsLabel,
    numeratorLabel,
    denominatorLabel,
    numeratorValue,
    denominatorValue,
    factor,
    calculationOperator = 'divide',
    result,
    footnote,
    metricAbbreviation = 'ROE',
}) => {
    const isSubtraction = calculationOperator === 'subtract';

    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ........................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ........................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <FormulaSectionContainer data-testid="formula-section">
            <FormulaIntro>
                <FormulaIntroLabel>Calculation logic</FormulaIntroLabel>
                <FormulaSectionTitle data-testid="formula-section-title">
                    {title}
                </FormulaSectionTitle>
                <FormulaFootnote data-testid="formula-section-footnote">
                    {footnote}
                </FormulaFootnote>
            </FormulaIntro>
            <FormulaContent>
                <FormulaPanels>
                    <FormulaPanel>
                        <FormulaPanelLabel data-testid="formula-section-standard-label">
                            {standardFormulaLabel}
                        </FormulaPanelLabel>
                        <FormulaExpression data-testid="formula-section-standard-formula">
                            <span>{metricAbbreviation}</span>
                            <span>=</span>
                            {isSubtraction ? (
                                <span>{numeratorLabel} − {denominatorLabel}</span>
                            ) : (
                                <>
                                    <FormulaFraction>
                                        <FormulaNumerator>{numeratorLabel}</FormulaNumerator>
                                        <FormulaDenominator>{denominatorLabel}</FormulaDenominator>
                                    </FormulaFraction>
                                    <span>{factor}</span>
                                </>
                            )}
                        </FormulaExpression>
                    </FormulaPanel>
                    <FormulaPanel>
                        <FormulaPanelLabel data-testid="formula-section-actuals-label">
                            {actualsLabel}
                        </FormulaPanelLabel>
                        <FormulaExpression data-testid="formula-section-actuals-formula">
                            <span>{metricAbbreviation}</span>
                            <span>=</span>
                            {isSubtraction ? (
                                <span>{numeratorValue} − {denominatorValue}</span>
                            ) : (
                                <>
                                    <FormulaFraction>
                                        <FormulaNumerator>{numeratorValue}</FormulaNumerator>
                                        <FormulaDenominator>{denominatorValue}</FormulaDenominator>
                                    </FormulaFraction>
                                    <span>{factor}</span>
                                </>
                            )}
                            <span>=</span>
                            <FormulaResult data-testid="formula-section-result">
                                {result}
                            </FormulaResult>
                        </FormulaExpression>
                    </FormulaPanel>
                </FormulaPanels>
            </FormulaContent>
        </FormulaSectionContainer>
    );
    // 1.6.3. END ........................................................................................
};

// 1.6. END ........................................................................................

export default FormulaSection;

// END FILE ########################################################################################
