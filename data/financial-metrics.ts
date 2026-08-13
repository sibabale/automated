export interface IFinancialMetricFormula {
    title: string;
    standardFormulaLabel: string;
    actualsLabel: string;
    numeratorLabel: string;
    denominatorLabel: string;
    numeratorValue: string;
    denominatorValue: string;
    factor: string;
    calculationOperator?: 'divide' | 'subtract';
    result: string;
    footnote: string;
    metricAbbreviation?: string;
}

export interface IFinancialMetricHorizon {
    label: string;
    range: string;
    value: string;
    breakdown: Array<{
        period: string;
        value: string;
    }>;
    insight: string;
    trend: 'up' | 'down';
}

export interface IFinancialMetricConsolidation {
    title: string;
    values: string[];
    denominator: string;
    result: string;
    note: string;
    mobileResult?: string;
    mobileNote?: string;
}

export interface IFinancialMetricEducation {
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

export interface IFinancialMetric {
    slug: string;
    label: string;
    value: string;
    description: string;
    formula?: IFinancialMetricFormula;
    horizons?: IFinancialMetricHorizon[];
    consolidation?: IFinancialMetricConsolidation;
    education?: IFinancialMetricEducation;
}

export const financialMetrics: IFinancialMetric[] = [
    {
        slug: 'return-on-equity',
        label: 'Return on Equity',
        value: '21.3%',
        description: 'Buffett Target: > 15%',
        formula: {
            title: 'How ROE Is Calculated',
            standardFormulaLabel: 'Standard Formula',
            actualsLabel: 'AAPL TTM Actuals',
            numeratorLabel: 'Net Income',
            denominatorLabel: "Shareholders' Equity",
            numeratorValue: '$96.99B',
            denominatorValue: '$62.15B',
            factor: '× 100',
            result: '21.3%',
            footnote: 'Based on TTM (trailing twelve months) figures from SEC filings',
        },
        horizons: [
            {
                label: 'Short Term',
                range: '1–3 Years',
                value: '26.1%',
                breakdown: [
                    { period: '2024', value: '28.3%' },
                    { period: '2023', value: '25.8%' },
                    { period: '2022', value: '24.2%' },
                ],
                insight: 'Strong short-term returns driven by services growth',
                trend: 'up',
            },
            {
                label: 'Medium Term',
                range: '3–6 Years',
                value: '23.7%',
                breakdown: [
                    { period: '2021', value: '22.1%' },
                    { period: '2020', value: '21.5%' },
                    { period: '2019', value: '27.2%' },
                ],
                insight: 'Consistent performance through market cycles',
                trend: 'down',
            },
            {
                label: 'Long Term',
                range: '6–9 Years',
                value: '18.4%',
                breakdown: [
                    { period: '2018', value: '18.4%' },
                    { period: '2017', value: '17.2%' },
                    { period: '2016', value: '19.6%' },
                ],
                insight: 'Steady improvement as ecosystem matured',
                trend: 'down',
            },
            {
                label: 'Very Long Term',
                range: '9–12 Years',
                value: '36.7%',
                breakdown: [
                    { period: '2015', value: '44.7%' },
                    { period: '2014', value: '35.4%' },
                    { period: '2013', value: '30.0%' },
                ],
                insight: 'Growth era — transition from niche to dominant player',
                trend: 'up',
            },
        ],
        consolidation: {
            title: 'Consolidation Summary',
            values: ['26.1%', '23.7%', '18.4%', '36.7%'],
            denominator: '4 (Adjusted for Weight)',
            result: '21.3%',
            note: 'Weighted average with recency bias — recent years carry higher weight. This ensures the consolidated ROE accurately reflects current operational efficiency while retaining historical performance memory.',
        },
        education: {
            definitionTitle: 'What Is Return on Equity?',
            definition: "Return on Equity (ROE) measures the net income returned as a percentage of shareholders' equity. It reveals how efficiently a company uses investor capital to generate profits.",
            importanceTitle: 'Why ROE Matters in Value Investing',
            importance: [
                'Warren Buffett considers ROE one of the most important indicators of a quality business. A consistently high ROE (above 15%) suggests a company has a durable competitive advantage — or economic moat.',
                'Companies that can sustain high ROE over decades demonstrate that their business model generates superior returns without requiring excessive leverage. This is a hallmark of what Buffett calls "wonderful businesses at fair prices."',
            ],
            quote: '"We prefer businesses that can be characterized as wonderful businesses at fair prices rather than fair businesses at wonderful prices. One of the keys is consistently high return on equity without excess debt."',
            quoteAuthor: 'Warren Buffett',
            quoteAuthorTitle: 'Chairman & CEO, Berkshire Hathaway',
            mobileImportance: 'A consistently high ROE (above 15%) suggests a company has a durable competitive advantage — or economic moat. Companies that sustain high ROE over decades demonstrate business model superiority without requiring excessive leverage.',
            mobileQuote: '"We prefer businesses that can be characterized as wonderful businesses at fair prices..."',
        },
    },
    {
        slug: 'free-cash-flow',
        label: 'Free Cash Flow',
        value: '$110.5B',
        description: 'Consistent expansion',
        formula: {
            title: 'How Free Cash Flow Is Calculated',
            standardFormulaLabel: 'Standard Formula',
            actualsLabel: 'AAPL TTM Actuals',
            numeratorLabel: 'Operating Cash Flow',
            denominatorLabel: 'Capital Expenditures',
            numeratorValue: '$118.3B',
            denominatorValue: '$7.8B',
            factor: '−',
            calculationOperator: 'subtract',
            result: '$110.5B',
            footnote: 'Representative trailing twelve months figures based on company cash flow reporting',
            metricAbbreviation: 'FCF',
        },
        horizons: [
            {
                label: 'Short Term',
                range: '1–3 Years',
                value: '$110.5B',
                breakdown: [{ period: '2024', value: '$110.5B' }, { period: '2023', value: '$99.6B' }, { period: '2022', value: '$111.4B' }],
                insight: 'Services growth and disciplined investment sustain strong cash generation',
                trend: 'up',
            },
            {
                label: 'Medium Term',
                range: '3–6 Years',
                value: '$91.0B',
                breakdown: [{ period: '2021', value: '$92.5B' }, { period: '2020', value: '$73.4B' }, { period: '2019', value: '$107.4B' }],
                insight: 'Resilient cash conversion through changing device cycles',
                trend: 'down',
            },
            {
                label: 'Long Term',
                range: '6–9 Years',
                value: '$55.3B',
                breakdown: [{ period: '2018', value: '$64.1B' }, { period: '2017', value: '$51.1B' }, { period: '2016', value: '$50.8B' }],
                insight: 'Ecosystem scale translated recurring customer demand into cash',
                trend: 'down',
            },
            {
                label: 'Very Long Term',
                range: '9–12 Years',
                value: '$55.2B',
                breakdown: [{ period: '2015', value: '$70.0B' }, { period: '2014', value: '$50.1B' }, { period: '2013', value: '$45.5B' }],
                insight: 'Early platform expansion established the base for compounding cash flows',
                trend: 'up',
            },
        ],
        consolidation: {
            title: 'Consolidation Summary',
            values: ['$110.5B', '$91.0B', '$55.3B', '$55.2B'],
            denominator: '4 (Adjusted for Weight)',
            result: '$110.5B',
            note: 'Weighted average with recency bias — recent cash generation carries greater weight while preserving longer-term operating context.',
            mobileNote: 'Recent cash generation carries greater weight while preserving longer-term operating context.',
        },
        education: {
            definitionTitle: 'What Is Free Cash Flow?',
            definition: 'Free Cash Flow is the cash a company generates after funding the investments required to maintain and grow its operations. It is available for reinvestment, debt reduction, dividends, and share repurchases.',
            importanceTitle: 'Why FCF Matters in Value Investing',
            importance: [
                'Free cash flow reveals how efficiently reported earnings convert into cash. Businesses that consistently produce surplus cash can fund growth internally while maintaining flexibility through changing economic conditions.',
                'For long-term investors, durable free cash flow supports shareholder returns without relying on excessive debt or repeated equity issuance.',
            ],
            quote: '"The ability to generate cash is the single most important financial characteristic of a business."',
            quoteAuthor: 'Warren Buffett',
            quoteAuthorTitle: 'Chairman & CEO, Berkshire Hathaway',
            mobileImportance: 'Consistent free cash flow shows that a business can fund growth, reward shareholders, and withstand uncertainty without relying on outside capital.',
            mobileQuote: '"The ability to generate cash is the single most important financial characteristic of a business."',
        },
    },
    {
        slug: 'debt-to-equity',
        label: 'Debt-to-Equity',
        value: '1.87',
        description: 'Highly serviceable',
        formula: {
            title: 'How D/E Is Calculated',
            standardFormulaLabel: 'Standard Formula',
            actualsLabel: 'AAPL TTM Actuals',
            numeratorLabel: 'Total Liabilities',
            denominatorLabel: "Shareholders' Equity",
            numeratorValue: '$290.40B',
            denominatorValue: '$62.15B',
            factor: '',
            result: '1.87',
            footnote: 'Based on TTM (trailing twelve months) figures from consolidated balance sheet filings',
            metricAbbreviation: 'D/E',
        },
        horizons: [
            {
                label: 'Short Term',
                range: '1–3 Years',
                value: '1.72',
                breakdown: [{ period: '2024', value: '1.72' }, { period: '2023', value: '1.85' }, { period: '2022', value: '1.98' }],
                insight: 'Moderating debt levels as short-term notes mature and are retired',
                trend: 'up',
            },
            {
                label: 'Medium Term',
                range: '3–6 Years',
                value: '1.95',
                breakdown: [{ period: '2021', value: '1.95' }, { period: '2020', value: '2.10' }, { period: '2019', value: '1.80' }],
                insight: 'Peak leverage period driven by massive share buyback programs',
                trend: 'up',
            },
            {
                label: 'Long Term',
                range: '6–9 Years',
                value: '1.35',
                breakdown: [{ period: '2018', value: '1.43' }, { period: '2017', value: '1.35' }, { period: '2016', value: '1.28' }],
                insight: 'Gradual ramp-up of low-interest long-term debt issuance',
                trend: 'up',
            },
            {
                label: 'Very Long Term',
                range: '9–12 Years',
                value: '1.06',
                breakdown: [{ period: '2015', value: '1.43' }, { period: '2014', value: '1.08' }, { period: '2013', value: '0.68' }],
                insight: 'Historically conservative capital structure with minimal reliance on debt',
                trend: 'down',
            },
        ],
        consolidation: {
            title: 'Consolidation Summary',
            values: ['1.72', '1.95', '1.35', '1.06'],
            denominator: '4 (Adjusted for Weight)',
            result: '1.87',
            note: 'Weighted average with recency bias — recent years carry higher weight. This ensures the consolidated D/E ratio accurately reflects current operational efficiency while retaining historical performance memory.',
            mobileResult: '1.48',
            mobileNote: 'Reflects intentional leverage escalation over the past decades rather than capital distress.',
        },
        education: {
            definitionTitle: 'What Is Debt-to-Equity Ratio?',
            definition: "The Debt-to-Equity (D/E) ratio is a crucial metric that evaluates a company's financial leverage. It compares a company's total liabilities against its total shareholders' equity, determining the proportion of debt used to fund assets relative to equity.",
            importanceTitle: 'Why D/E Matters in Value Investing',
            importance: [
                "Warren Buffett heavily favors businesses that maintain low debt levels while achieving superior returns on capital. A rising D/E ratio can indicate high default risk, but context is critical: Apple's debt strategy is highly structured, utilizing cheap debt to execute massive share buybacks and optimize taxes, rather than covering core operational shortfalls.",
                "Buffett's baseline emphasizes that a truly exceptional business model generates so much native cash flow that it rarely requires excessive debt to expand its operations or reward its shareholders.",
            ],
            quote: '"I look for businesses that can earn high returns on equity while employing little or no debt."',
            quoteAuthor: 'Warren Buffett',
            quoteAuthorTitle: 'Chairman & CEO, Berkshire Hathaway',
            mobileImportance: 'A high ratio generally implies higher risk, but for exceptionally strong cash generators, cheap debt is frequently utilized to arbitrage capital returns without threatening insolvency.',
            mobileQuote: '"When you combine ignorance and leverage, you get some pretty interesting results."',
        },
    },
    {
        slug: 'profit-margin',
        label: 'Profit Margin',
        value: '25.3%',
        description: 'Industry leading',
        formula: {
            title: 'How Profit Margin Is Calculated',
            standardFormulaLabel: 'Standard Formula',
            actualsLabel: 'AAPL TTM Actuals',
            numeratorLabel: 'Net Income',
            denominatorLabel: 'Revenue',
            numeratorValue: '$96.99B',
            denominatorValue: '$383.30B',
            factor: '× 100',
            result: '25.3%',
            footnote: 'Based on TTM (trailing twelve months) figures from SEC filings',
            metricAbbreviation: 'NPM',
        },
        horizons: [
            {
                label: 'Short Term',
                range: '1–3 Years',
                value: '25.9%',
                breakdown: [{ period: '2024', value: '26.3%' }, { period: '2023', value: '25.8%' }, { period: '2022', value: '25.6%' }],
                insight: 'Premium product margins sustained despite macro headwinds',
                trend: 'up',
            },
            {
                label: 'Medium Term',
                range: '3–6 Years',
                value: '24.1%',
                breakdown: [{ period: '2021', value: '25.8%' }, { period: '2020', value: '21.0%' }, { period: '2019', value: '25.5%' }],
                insight: 'Stable monetization models across high-margin app store ecosystem',
                trend: 'up',
            },
            {
                label: 'Long Term',
                range: '6–9 Years',
                value: '21.6%',
                breakdown: [{ period: '2018', value: '22.4%' }, { period: '2017', value: '21.1%' }, { period: '2016', value: '21.2%' }],
                insight: 'Steady operating scale improvements through vertical hardware integration',
                trend: 'down',
            },
            {
                label: 'Very Long Term',
                range: '9–12 Years',
                value: '22.0%',
                breakdown: [{ period: '2015', value: '22.8%' }, { period: '2014', value: '21.6%' }, { period: '2013', value: '21.7%' }],
                insight: 'Foundation period marked by explosive scale and transition to premium segments',
                trend: 'up',
            },
        ],
        consolidation: {
            title: 'Consolidation Summary',
            values: ['25.9%', '24.1%', '21.6%', '22.0%'],
            denominator: '4 (Adjusted for Weight)',
            result: '25.3%',
            note: 'Weighted average with recency bias — recent years carry higher weight. This ensures the consolidated Profit Margin accurately reflects current operational efficiency while retaining historical performance memory.',
            mobileResult: '23.0%',
            mobileNote: 'Weighted average with recency bias — recent years carry higher weight to reflect premium services transition.',
        },
        education: {
            definitionTitle: 'What Is Profit Margin?',
            definition: 'Net Profit Margin measures how much out of every dollar of sales a company actually keeps in earnings. It reflects pricing power, operating efficiency, and cost controls.',
            importanceTitle: 'Why Margin Matters in Value Investing',
            importance: [
                "Sustained high margins indicate strong competitive moats and pricing power. Companies that don't need to compete on price can absorb supply shocks and continue generating high returns on capital.",
                'High profit margins allow wonderful businesses to internally finance their growth without relying on continuous equity dilution or burdensome debt structures.',
            ],
            quote: '"The best business is a royalty on the growth of others, requiring little capital itself."',
            quoteAuthor: 'Warren Buffett',
            quoteAuthorTitle: 'Chairman & CEO, Berkshire Hathaway',
            mobileImportance: 'High net profit margins suggest that a business is capable of keeping costs low relative to its sales, or keeping prices high relative to its product cost—the ultimate hallmark of structural competitive advantage.',
            mobileQuote: '"The single most important decision in evaluating a business is pricing power. If you’ve got the power to raise prices without losing business... you’ve got a very good business."',
        },
    },
    {
        slug: 'margin-of-safety',
        label: 'Margin of Safety',
        value: '18%',
        description: 'Undervalued buffer',
    },
];

export const getFinancialMetric = (slug: string) =>
    financialMetrics.find((metric) => metric.slug === slug);
