// [ COMPONENTS > ORGANISMS > HERO SECTION ] #########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
'use client';

import React from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import SearchInput from '../../molecules/search-input/search-input';
import {
    HeroDescription,
    HeroHeading,
    HeroDesktopHeading,
    HeroMobileHeading,
    HeroSearchContainer,
    HeroSectionContainer,
} from './hero-section.styles';
// 1.2. END ..........................................................................................

// 1.3. IMAGES .......................................................................................
// 1.3. END ..........................................................................................

// 1.4. DATA .........................................................................................
// 1.4. END ..........................................................................................

// 1.5. TYPES ........................................................................................
interface IHeroSection {
    onSearch?: (query: string) => void;
    searchValue?: string;
}
// 1.5. END ..........................................................................................

// 1.6. COMPONENT ....................................................................................

const HeroSection: React.FC<IHeroSection> = ({ onSearch, searchValue }) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ....................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ....................................................................................

    // 1.6.3. RENDER .................................................................................
    return (
        <HeroSectionContainer data-testid="hero-section">
            <HeroHeading data-testid="hero-section-heading">
                <HeroMobileHeading>Filing Analysis</HeroMobileHeading>
                <HeroDesktopHeading>
                    Analyze filing value instantly.
                </HeroDesktopHeading>
            </HeroHeading>
            <HeroDescription data-testid="hero-section-description">
                Qualitative financial appraisal mapping securities to Berkshire Hathaway criteria.
            </HeroDescription>
            <HeroSearchContainer data-testid="hero-section-search">
                <SearchInput
                    key={searchValue ?? 'search-input'}
                    initialQuery={searchValue}
                    onSearch={onSearch}
                />
            </HeroSearchContainer>
        </HeroSectionContainer>
    );
    // 1.6.3. END ....................................................................................
};

// 1.6. END ..........................................................................................

export default HeroSection;

// END FILE ##########################################################################################
