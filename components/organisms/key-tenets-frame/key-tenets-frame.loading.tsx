// [ COMPONENTS > ORGANISMS > KEY TENETS FRAME LOADING ] ############################################

'use client';

import React from 'react';
import ContentLoader from 'react-content-loader';
import { useTheme } from 'styled-components';
import {
    KeyTenetsFrameContainer,
    KeyTenetsLoadingCard,
    KeyTenetsLoadingTitle,
    KeyTenetsMetrics,
} from './key-tenets-frame.styles';

interface IKeyTenetsFrameLoading {
    label?: string;
}

const KeyTenetsFrameLoading: React.FC<IKeyTenetsFrameLoading> = ({
    label = 'Loading key tenets and ratios',
}) => {
    const theme = useTheme();

    return (
        <KeyTenetsFrameContainer data-testid="key-tenets-frame-loading" role="status">
            <KeyTenetsLoadingTitle aria-label={label} />
            <KeyTenetsMetrics>
                {Array.from({ length: 5 }, (_, index) => (
                    <KeyTenetsLoadingCard key={index}>
                        <ContentLoader
                            aria-hidden="true"
                            backgroundColor={theme.background.loader}
                            foregroundColor={theme.border.subtle}
                            height={76}
                            preserveAspectRatio="none"
                            title=""
                            uniqueKey={`key-tenets-frame-loading-card-${index}`}
                            viewBox="0 0 160 76"
                            width="100%"
                        >
                            <rect height="12" rx="2" width="72%" x="0" y="0" />
                            <rect height="28" rx="2" width="50%" x="0" y="24" />
                            <rect height="12" rx="2" width="88%" x="0" y="64" />
                        </ContentLoader>
                    </KeyTenetsLoadingCard>
                ))}
            </KeyTenetsMetrics>
        </KeyTenetsFrameContainer>
    );
};

export default KeyTenetsFrameLoading;
