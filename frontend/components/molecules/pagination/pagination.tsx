// [ COMPONENTS > MOLECULES > PAGINATION ] ###########################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import React from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import { PaginationContainer, PaginationControl, PaginationEllipsis } from './pagination.styles';
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

// 1.4. HELPERS ......................................................................................
/**
 * Build a windowed list of page numbers to display.
 * Returns an array of page numbers and `null` for ellipsis placeholders.
 *
 * Strategy:
 * - Always show page 1 and the last page.
 * - Show up to 2 pages on either side of the current page (window).
 * - Insert ellipsis (`null`) when pages are skipped.
 */
function buildPageWindow(current: number, total: number): (number | null)[] {
    // For small page counts, show all pages.
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | null)[] = [];
    const windowSize = 2; // pages on each side of current

    // Always include first page.
    pages.push(1);

    const windowStart = Math.max(2, current - windowSize);
    const windowEnd = Math.min(total - 1, current + windowSize);

    // Ellipsis after page 1 if window doesn't start at 2.
    if (windowStart > 2) {
        pages.push(null);
    }

    // Window pages.
    for (let p = windowStart; p <= windowEnd; p++) {
        pages.push(p);
    }

    // Ellipsis before last page if window doesn't reach it.
    if (windowEnd < total - 1) {
        pages.push(null);
    }

    // Always include last page.
    pages.push(total);

    return pages;
}
// 1.4. END ..........................................................................................

// 1.5. COMPONENT ....................................................................................
/**
 * A shared pagination control used across all paginated views.
 *
 * Renders numbered page buttons with ellipsis for large page counts,
 * prev/next arrows, and a summary label.
 */
const Pagination: React.FC<IPagination> = ({
    currentPage,
    totalPages,
    onPageChange,
    ariaLabel = 'Pages',
    testId = 'pagination',
}) => {
    const pages = buildPageWindow(currentPage, totalPages);

    return (
        <PaginationContainer aria-label={ariaLabel} data-testid={testId}>
            <span>
                Page {currentPage} of {totalPages}
            </span>
            <div>
                <PaginationControl
                    aria-label="Previous page"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    type="button"
                >
                    ‹
                </PaginationControl>
                {pages.map((page, index) =>
                    page === null ? (
                        <PaginationEllipsis key={`ellipsis-${index}`} aria-hidden="true">
                            …
                        </PaginationEllipsis>
                    ) : (
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
                    ),
                )}
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
// 1.5. END ..........................................................................................

export default Pagination;

// END FILE ##########################################################################################
