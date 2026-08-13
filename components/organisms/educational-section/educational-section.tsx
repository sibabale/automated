// [ COMPONENTS > ORGANISMS > EDUCATIONAL SECTION ] #################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
'use client';

import React from 'react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
    EducationalContentGroup,
    EducationalCopy,
    EducationalDesktopOnly,
    EducationalMobileOnly,
    EducationalQuote,
    EducationalSectionContainer,
    EducationalText,
    EducationalTitle,
    QuoteAuthor,
    QuoteAuthorTitle,
    QuoteMark,
    QuoteMobileText,
    QuoteText,
} from './educational-section.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IEducationalSection {
    definitionTitle: string;
    definition: string;
    importanceTitle: string;
    importance: string[];
    quote: string;
    quoteAuthor: string;
    quoteAuthorTitle: string;
    mobileImportance: string;
    mobileQuote: string;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................
const EducationalSection: React.FC<IEducationalSection> = ({
    definitionTitle,
    definition,
    importanceTitle,
    importance,
    quote,
    quoteAuthor,
    quoteAuthorTitle,
    mobileImportance,
    mobileQuote,
}) => (
    <EducationalSectionContainer data-testid="educational-section">
        <EducationalCopy>
            <EducationalContentGroup>
                <EducationalTitle>{definitionTitle}</EducationalTitle>
                <EducationalText>{definition}</EducationalText>
            </EducationalContentGroup>
            <EducationalContentGroup>
                <EducationalTitle>{importanceTitle}</EducationalTitle>
                <EducationalDesktopOnly>
                    {importance.map((paragraph) => <EducationalText key={paragraph}>{paragraph}</EducationalText>)}
                </EducationalDesktopOnly>
                <EducationalMobileOnly>{mobileImportance}</EducationalMobileOnly>
            </EducationalContentGroup>
        </EducationalCopy>
        <EducationalQuote>
            <QuoteMark aria-hidden="true">”</QuoteMark>
            <QuoteText>{quote}</QuoteText>
            <QuoteMobileText>{mobileQuote}</QuoteMobileText>
            <QuoteAuthor>
                <span>— {quoteAuthor}</span>
                <QuoteAuthorTitle>{quoteAuthorTitle}</QuoteAuthorTitle>
            </QuoteAuthor>
        </EducationalQuote>
    </EducationalSectionContainer>
);
// 1.6. END ........................................................................................

export default EducationalSection;

// END FILE ########################################################################################
