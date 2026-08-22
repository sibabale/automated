// [ COMPONENTS > MOLECULES > PAGINATION ] ###########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import React from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { PaginationContainer, PaginationControl } from './pagination.styles';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
interface IPagination {
    /** Currently active page number (1-indexed). */
    currentPage: number;
    /** Total number of pages. */
    totalPages: number;
    /** Callback invoked when the user selects a different page. */
    onPageChange: (page: number) => void;
    /** Optional accessible label for the nav element. */
    ariaLabel?: string;
    /** Optional test id for the container. */
    testId?: string;
}
// 1.3. END ..........................................................................................

// 1.4. COMPONENT ....................................................................................
/**
 * A shared pagination control used across all paginated views.
 *
 * Renders numbered page buttons, a next-page arrow, and a summary label.
 */
const Pagination: React.FC<IPagination> = ({
    currentPage,
    totalPages,
    onPageChange,
    ariaLabel = 'Pages',
    testId = 'pagination',
}) => {
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <PaginationContainer aria-label={ariaLabel} data-testid={testId}>
            <span>
                Page {currentPage} of {totalPages}
            </span>
            <div>
                {pages.map((page) => (
                    <PaginationControl
                        aria-current={currentPage === page ? 'page' : undefined}
                        aria-label={`Page ${page}`}
                        disabled={totalPages === 1}
                        key={page}
                        onClick={() => onPageChange(page)}
                        type="button"
                    >
                        {page}
                    </PaginationControl>
                ))}
                <PaginationControl
                    aria-label="Next page"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    type="button"
                >
                    ›
                </PaginationControl>
            </div>
        </PaginationContainer>
    );
};
// 1.4. END ..........................................................................................

export default Pagination;

// END FILE ##########################################################################################
