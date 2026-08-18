// [ COMPONENTS > MOLECULES > PORTFOLIO HOLDINGS TABLE HEADER ] ######################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import React from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import HeaderPopover from '../header-popover/header-popover';
import { PortfolioHoldingsHeaderRow } from './portfolio-holdings-table-header.styles';
// 1.2. END ..........................................................................................

// 1.3. IMAGES .......................................................................................
// 1.3. END ..........................................................................................

// 1.4. DATA .........................................................................................
const explanatoryColumns = [
    {
        description: 'The number of shares currently held in the portfolio.',
        label: 'Shares',
    },
    {
        description: 'The average price paid per share across the current holding.',
        label: 'Avg. buy',
    },
    {
        description: 'The latest market price per share from the broker feed.',
        label: 'Current',
    },
    {
        description: 'The total market value of this position at the current price.',
        label: 'Value',
    },
    {
        description: 'The unrealized profit or loss compared with the average buy price.',
        label: 'Gain / loss',
    },
    {
        description: 'The Buffett-style score captured when the position was opened.',
        label: 'Buffett score',
    },
] as const;
// 1.4. END ..........................................................................................

// 1.5. TYPES ........................................................................................
type IPortfolioHoldingsTableHeader = Record<never, never>;
// 1.5. END ..........................................................................................

// 1.6. COMPONENT ....................................................................................
const PortfolioHoldingsTableHeader: React.FC<IPortfolioHoldingsTableHeader> = () => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ....................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    // 1.6.2. END ....................................................................................

    // 1.6.3. RENDER .................................................................................
    return (
        <PortfolioHoldingsHeaderRow data-testid="portfolio-holdings-table-header">
            <th>Company</th>
            <th>Ticker</th>
            {explanatoryColumns.map((column) => (
                <th key={column.label}>
                    <HeaderPopover
                        description={column.description}
                        label={column.label}
                    />
                </th>
            ))}
        </PortfolioHoldingsHeaderRow>
    );
    // 1.6.3. END ....................................................................................
};
// 1.6. END ..........................................................................................

export default PortfolioHoldingsTableHeader;

// END FILE ##########################################################################################
