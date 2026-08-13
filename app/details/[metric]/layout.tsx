// [ APP > DETAILS > METRIC LAYOUT ] ##################################################################

// 1.1. EXTERNAL DEPENDENCIES ......................................................................
import type { Metadata } from 'next';
import React from 'react';
// 1.1. END ........................................................................................

// 1.2. INTERNAL DEPENDENCIES ......................................................................
import { getFinancialMetric } from '../../../data/financial-metrics';
// 1.2. END ........................................................................................

// 1.3. TYPES ......................................................................................
interface IMetricLayout {
    children: React.ReactNode;
}

interface IMetricLayoutMetadata {
    params: Promise<{ metric: string }>;
}
// 1.3. END ........................................................................................

// 1.4. METADATA ...................................................................................
export const generateMetadata = async ({
    params,
}: IMetricLayoutMetadata): Promise<Metadata> => {
    const { metric } = await params;

    return {
        title: getFinancialMetric(metric)?.label ?? 'Metric details',
    };
};
// 1.4. END ........................................................................................

// 1.5. COMPONENT ..................................................................................
const MetricLayout: React.FC<IMetricLayout> = ({ children }) => children;
// 1.5. END ........................................................................................

export default MetricLayout;

// END FILE ########################################################################################
