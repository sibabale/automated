// [ DATA > PORTFOLIO ] ###############################################################################

// 1.1. TYPES ..........................................................................................
export interface IPortfolioHolding {
    company: string;
    ticker: string;
    shares: string;
    averageBuy: string;
    current: string;
    value: string;
    gainLoss: string;
    score: string;
}

export interface IPortfolioSummary {
    totalValue: string;
    totalInvested: string;
    totalGainLoss: string;
    totalGainPercentage: string;
    averageScore: string;
}

export type TPortfolioTrend = 'up' | 'down';
export const MAX_PORTFOLIO_HOLDINGS_PER_PAGE = 10;

const portfolioCurrencyUnits = [
    { divisor: 1_000_000_000_000, suffix: 'T' },
    { divisor: 1_000_000_000, suffix: 'B' },
    { divisor: 1_000_000, suffix: 'M' },
    { divisor: 1_000, suffix: 'K' },
] as const;
// 1.1. END ............................................................................................

// 1.2. DATA ...........................................................................................
export const portfolioHoldings: IPortfolioHolding[] = [
    { company: 'Apple Inc.', ticker: 'AAPL', shares: '500', averageBuy: '$142.50', current: '$184.25', value: '$92,125.00', gainLoss: '+$20,875.00', score: '8.2' },
    { company: 'Berkshire Hathaway', ticker: 'BRK.B', shares: '200', averageBuy: '$298.00', current: '$362.40', value: '$72,480.00', gainLoss: '+$12,880.00', score: '9.1' },
    { company: 'Coca-Cola Co.', ticker: 'KO', shares: '1,000', averageBuy: '$52.30', current: '$58.75', value: '$58,750.00', gainLoss: '+$6,450.00', score: '8.5' },
    { company: 'Johnson & Johnson', ticker: 'JNJ', shares: '300', averageBuy: '$162.80', current: '$155.20', value: '$46,560.00', gainLoss: '−$2,280.00', score: '7.4' },
    { company: 'Procter & Gamble', ticker: 'PG', shares: '400', averageBuy: '$138.50', current: '$152.30', value: '$60,920.00', gainLoss: '+$5,520.00', score: '7.9' },
    { company: 'Visa Inc.', ticker: 'V', shares: '250', averageBuy: '$215.40', current: '$268.90', value: '$67,225.00', gainLoss: '+$13,375.00', score: '8.0' },
    { company: "Moody's Corp.", ticker: 'MCO', shares: '150', averageBuy: '$312.00', current: '$378.50', value: '$56,775.00', gainLoss: '+$9,975.00', score: '8.3' },
    { company: 'American Express', ticker: 'AXP', shares: '350', averageBuy: '$148.20', current: '$172.60', value: '$60,410.00', gainLoss: '+$8,540.00', score: '7.6' },
];
// 1.2. END ............................................................................................

// 1.3. FUNCTIONS ......................................................................................
const parsePortfolioCurrency = (value: string): number =>
    Number(value.replace(/[+$,−]/g, ''));

const parsePortfolioGainLoss = (value: string): number => {
    const amount = parsePortfolioCurrency(value);

    return value.startsWith('−') ? -amount : amount;
};

const roundPortfolioCurrency = (amount: number): number =>
    Math.round(amount * 100) / 100;

export const getPortfolioTrend = (gainLoss: string): TPortfolioTrend =>
    gainLoss.startsWith('−') ? 'down' : 'up';

export const formatPortfolioCurrency = (value: string): string => {
    const sign = value.startsWith('+') ? '+' : value.startsWith('−') ? '−' : '';
    const amount = Number(value.replace(/[+$,−]/g, ''));
    const unit = portfolioCurrencyUnits.find(({ divisor }) => amount >= divisor);

    if (!unit) {
        return `${sign}$${amount.toFixed(2)}`;
    }

    const abbreviatedAmount = amount / unit.divisor;
    const displayAmount = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
    }).format(abbreviatedAmount);

    return `${sign}$${displayAmount}${unit.suffix}`;
};

const totalValue = roundPortfolioCurrency(portfolioHoldings.reduce(
        (total, holding) => total + parsePortfolioCurrency(holding.value),
        0,
    ));

const totalInvested = roundPortfolioCurrency(portfolioHoldings.reduce(
        (total, holding) =>
            total + Number(holding.shares.replace(',', '')) * parsePortfolioCurrency(holding.averageBuy),
        0,
    ));

const totalGainLoss = roundPortfolioCurrency(portfolioHoldings.reduce(
        (total, holding) => total + parsePortfolioGainLoss(holding.gainLoss),
        0,
    ));

export const portfolioSummary: IPortfolioSummary = {
    totalValue: `$${totalValue}`,
    totalInvested: `$${totalInvested}`,
    totalGainLoss: `+$${totalGainLoss}`,
    totalGainPercentage: ((totalGainLoss / totalInvested) * 100).toFixed(1),
    averageScore: (
        portfolioHoldings.reduce((total, holding) => total + Number(holding.score), 0)
        / portfolioHoldings.length
    ).toFixed(1),
};
// 1.3. END ............................................................................................

// END FILE ########################################################################################
