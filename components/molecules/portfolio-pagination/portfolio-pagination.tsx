// [ COMPONENTS > MOLECULES > PORTFOLIO PAGINATION ] ##################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import React from 'react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import {
    PortfolioPaginationContainer,
    PortfolioPaginationControl,
} from './portfolio-pagination.styles';
// 1.2. END ........................................................................................

// 1.3. IMAGES .....................................................................................
// 1.3. END ........................................................................................

// 1.4. DATA .......................................................................................
// 1.4. END ........................................................................................

// 1.5. TYPES ......................................................................................
interface IPortfolioPagination {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}
// 1.5. END ........................................................................................

// 1.6. COMPONENT ..................................................................................
const PortfolioPagination: React.FC<IPortfolioPagination> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    // 1.6.1. HOOKS & API CALLS ....................................................................
    // 1.6.1. END ..................................................................................

    // 1.6.2. FUNCTIONS & LOCAL VARIABLES ..........................................................
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    // 1.6.2. END ..................................................................................

    // 1.6.3. RENDER ...............................................................................
    return (
        <PortfolioPaginationContainer aria-label="Portfolio pages" data-testid="portfolio-pagination">
            <span>Page {currentPage} of {totalPages}</span>
            <div>
                {pages.map((page) => (
                    <PortfolioPaginationControl
                        aria-current={currentPage === page ? 'page' : undefined}
                        aria-label={`Page ${page}`}
                        disabled={totalPages === 1}
                        key={page}
                        onClick={() => onPageChange(page)}
                        type="button"
                    >
                        {page}
                    </PortfolioPaginationControl>
                ))}
                <PortfolioPaginationControl
                    aria-label="Next page"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    type="button"
                >
                    ›
                </PortfolioPaginationControl>
            </div>
        </PortfolioPaginationContainer>
    );
    // 1.6.3. END ..................................................................................
};
// 1.6. END ........................................................................................

export default PortfolioPagination;

// END FILE ########################################################################################
