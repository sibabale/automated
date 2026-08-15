// [ DATA > PORTFOLIO ] ###############################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import { describe, expect, it } from 'vitest';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { formatPortfolioCurrency, portfolioSummary } from './portfolio';
// 1.2. END ........................................................................................

// 1.3. TEST CASES ................................................................................
describe('formatPortfolioCurrency', () => {
    it('uses K, M, B, and T units for monetary values', () => {
        expect(formatPortfolioCurrency('$92,125.00')).toBe('$92.13K');
        expect(formatPortfolioCurrency('$1,247,832.50')).toBe('$1.25M');
        expect(formatPortfolioCurrency('$1,247,832,500.00')).toBe('$1.25B');
        expect(formatPortfolioCurrency('$1,247,832,500,000.00')).toBe('$1.25T');
    });

    it('preserves gain and loss signs', () => {
        expect(formatPortfolioCurrency('+$20,875.00')).toBe('+$20.88K');
        expect(formatPortfolioCurrency('−$2,280.00')).toBe('−$2.28K');
    });

    it('derives summary totals from the rendered holdings', () => {
        expect(formatPortfolioCurrency(portfolioSummary.totalValue)).toBe('$515.25K');
        expect(formatPortfolioCurrency(portfolioSummary.totalInvested)).toBe('$439.91K');
        expect(formatPortfolioCurrency(portfolioSummary.totalGainLoss)).toBe('+$75.34K');
        expect(portfolioSummary.totalGainPercentage).toBe('17.1');
        expect(portfolioSummary.averageScore).toBe('8.1');
    });
});
// 1.3. END ........................................................................................

// END FILE ########################################################################################
