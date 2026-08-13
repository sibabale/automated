// [ COMPONENTS > ORGANISMS > FORMULA SECTION LOADING ] #############################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
    FormulaLoadingContent,
    FormulaLoadingIntro,
    FormulaSectionContainer,
} from './formula-section.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IFormulaSectionLoading {
    label?: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................

const FormulaSectionLoading: React.FC<IFormulaSectionLoading> = ({
    label = 'Loading calculation logic',
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    const theme = useTheme();
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <FormulaSectionContainer data-testid="formula-section-loading" role="status">
            <FormulaLoadingIntro>
                <ContentLoader
                    aria-label={label}
                    backgroundColor={theme.background.loader}
                    foregroundColor={theme.border.subtle}
                    height={148}
                    preserveAspectRatio="none"
                    title={label}
                    uniqueKey="formula-section-loading-intro"
                    viewBox="0 0 320 148"
                    width="100%"
                >
                    <rect height="14" rx="2" width="132" x="0" y="0" />
                    <rect height="34" rx="2" width="250" x="0" y="38" />
                    <rect height="48" rx="2" width="300" x="0" y="96" />
                </ContentLoader>
            </FormulaLoadingIntro>
            <FormulaLoadingContent>
                <ContentLoader
                    aria-hidden="true"
                    backgroundColor={theme.background.loader}
                    foregroundColor={theme.border.subtle}
                    height={152}
                    preserveAspectRatio="none"
                    title=""
                    uniqueKey="formula-section-loading-content"
                    viewBox="0 0 680 152"
                    width="100%"
                >
                    <rect height="14" rx="2" width="180" x="0" y="0" />
                    <rect height="22" rx="2" width="440" x="0" y="28" />
                    <rect height="1" rx="0" width="100%" x="0" y="74" />
                    <rect height="14" rx="2" width="200" x="0" y="98" />
                    <rect height="29" rx="2" width="500" x="0" y="123" />
                </ContentLoader>
            </FormulaLoadingContent>
        </FormulaSectionContainer>
    );
    // 1.6.3. END ..................................................................................
};

// 1.6. END ........................................................................................

export default FormulaSectionLoading;

// END FILE ########################################################################################
