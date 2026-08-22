// [ COMPONENTS > MOLECULES > RUNS PAGINATION ] ######################################################

// 1.1. EXTERNAL DEPENDENCIES ........................................................................
import React from 'react';
// 1.1. END ..........................................................................................

// 1.2. INTERNAL DEPENDENCIES ........................................................................
import {
    RunsPaginationContainer,
    RunsPaginationControl,
    RunsPaginationControls,
} from './runs-pagination.styles';
// 1.2. END ..........................................................................................

// 1.3. TYPES ........................................................................................
interface IRunsPagination {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}
// 1.3. END ..........................................................................................

// 1.4. COMPONENT ....................................................................................
const RunsPagination: React.FC<IRunsPagination> = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <RunsPaginationContainer aria-label="Runs pages" data-testid="runs-pagination">
            <span>Page {currentPage} of {totalPages}</span>
            <RunsPaginationControls>
                {pages.map((page) => (
                    <RunsPaginationControl
                        aria-current={currentPage === page ? 'page' : undefined}
                        aria-label={`Page ${page}`}
                        disabled={totalPages === 1}
                        key={page}
                        onClick={() => onPageChange(page)}
                        type="button"
                    >
                        {page}
                    </RunsPaginationControl>
                ))}
                <RunsPaginationControl
                    aria-label="Next page"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    type="button"
                >
                    ›
                </RunsPaginationControl>
            </RunsPaginationControls>
        </RunsPaginationContainer>
    );
};
// 1.4. END ..........................................................................................

export default RunsPagination;

// END FILE ##########################################################################################
