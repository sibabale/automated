// [ COMPONENTS > MOLECULES > SEARCH INPUT ] #########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
'use client';

import React, { useState } from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    SearchForm,
    SearchIcon,
    SearchInputField,
    SearchSubmitIcon,
    SearchSubmitLabel,
    SearchSubmitButton,
} from './search-input.styles';
// 1.2. END ..........................................................................................

// 1.3. IMAGES .......................................................................................
// 1.3. END ..........................................................................................

// 1.5. TYPES ........................................................................................
interface ISearchInput {
    initialQuery?: string;
    onSearch?: (query: string) => void;
}
// 1.5. END ..........................................................................................

// 1.6. COMPONENT ....................................................................................

const SearchInput: React.FC<ISearchInput> = ({ initialQuery = '', onSearch }) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    const [query, setQuery] = useState(initialQuery);
    // 1.6.1. END ....................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const searchQuery = query.trim();

        if (searchQuery) {
            onSearch?.(searchQuery);
        }
    };
    // 1.6.2. END ....................................................................................

    // 1.6.3. RENDER .................................................................................
    return (
        <SearchForm data-testid="search-input" onSubmit={submitSearch}>
            <SearchIcon data-testid="search-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="10.5" cy="10.5" r="5.5" />
                    <path d="m15 15 4 4" />
                </svg>
            </SearchIcon>
            <SearchInputField
                data-testid="search-input-field"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Enter ticker symbol (e.g. AAPL)"
                aria-label="Ticker symbol"
            />
            <SearchSubmitButton data-testid="search-input-submit" type="submit">
                <SearchSubmitLabel>Analyze</SearchSubmitLabel>
                <SearchSubmitIcon aria-hidden="true">→</SearchSubmitIcon>
            </SearchSubmitButton>
        </SearchForm>
    );
    // 1.6.3. END ....................................................................................
};

// 1.6. END ..........................................................................................

export default SearchInput;

// END FILE ##########################################################################################
