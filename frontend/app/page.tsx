'use client';

import type { Variants } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import Header from "../components/molecules/header/header";
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { MotionConfig, motion, useReducedMotion } from 'motion/react';
import HeroSection from "../components/organisms/hero-section/hero-section";
import ReportHeader from "../components/organisms/report-header/report-header";
import VerdictSection from "../components/organisms/verdict-section/verdict-section";
import KeyTenetsFrame from "../components/organisms/key-tenets-frame/key-tenets-frame";
import ReportHeaderLoading from "../components/organisms/report-header/report-header.loading";
import QualitativePillars from "../components/organisms/qualitative-pillars/qualitative-pillars";
import VerdictSectionLoading from "../components/organisms/verdict-section/verdict-section.loading";
import KeyTenetsFrameLoading from "../components/organisms/key-tenets-frame/key-tenets-frame.loading";
import QualitativePillarsLoading from "../components/organisms/qualitative-pillars/qualitative-pillars.loading";
import {
  selectOverviewMetricCards,
  selectOverviewError,
  selectOverviewReportHeader,
  selectOverviewStatus,
  selectOverviewTicker,
} from '../redux/selectors/overview.selectors';
import HomePageError from './page.error';
import { fetchOverview } from '../redux/slices/overview.slice';
import { submitBuyTrade } from '../redux/slices/buy-trade.slice';
import {
  AnalysisPanel,
  BuyTradeActionButton,
  BuyTradeActions,
  BuyTradeEstimateLabel,
  BuyTradeEstimateMeta,
  BuyTradeEstimatePanel,
  BuyTradeEstimateValue,
  BuyTradeFieldGroup,
  BuyTradeFieldInput,
  BuyTradeFieldLabel,
  BuyTradeForm,
  BuyTradeModalBackdrop,
  BuyTradeModalCard,
  BuyTradeModalDescription,
  BuyTradeModalHeader,
  BuyTradeModalTitle,
  BuyTradeSuccessBanner,
  BuyTradeSuccessDescription,
  BuyTradeSuccessTitle,
  HeroLayout,
  MainContent,
  PageShell,
  ReportContext,
} from "./page.styles";
import type { RootState } from '../redux/store';

const pageLoadVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.16,
    },
  },
};

const heroLoadVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const analysisLoadVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    clipPath: 'inset(0 0 8% 0)',
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

const DEFAULT_TICKER = 'AAPL';

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const overviewStatus = useAppSelector(selectOverviewStatus);
  const overviewError = useAppSelector(selectOverviewError);
  const overviewTicker = useAppSelector(selectOverviewTicker);
  const overviewMetrics = useAppSelector(selectOverviewMetricCards);
  const overviewReportHeader = useAppSelector(selectOverviewReportHeader);
  const buyTradeStatus = useAppSelector((state: RootState) => state.buyTrade.status);
  const buyTradeError = useAppSelector((state: RootState) => state.buyTrade.errorMessage);
  const lastBuyTrade = useAppSelector((state: RootState) => state.buyTrade.lastOrder);
  const activeTicker = searchParams.get('ticker')?.trim().toUpperCase() || DEFAULT_TICKER;
  const isContentLoading = overviewStatus === 'idle' || overviewStatus === 'loading';
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const reportHeader = overviewTicker === activeTicker && overviewReportHeader
    ? overviewReportHeader
    : {
      companyName: '—',
      industry: '—',
      sector: '—',
      sharePrice: '—',
      ticker: activeTicker,
    };
  const estimatedCost = useMemo(() => {
    const normalizedPrice = reportHeader.sharePrice.replace('USD', '').replace(/\s+/g, '').replace('$', '');
    const parsedPrice = Number(normalizedPrice);
    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedPrice) || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return '—';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parsedPrice * parsedQuantity);
  }, [quantity, reportHeader.sharePrice]);

  useEffect(() => {
    dispatch(fetchOverview(activeTicker));
  }, [activeTicker, dispatch]);

  useEffect(() => {
    if (buyTradeStatus === 'succeeded') {
      setQuantity('1');
    }
  }, [buyTradeStatus]);

  const searchForTicker = (query: string) => {
    const normalizedTicker = query.trim().toUpperCase();

    if (!normalizedTicker || normalizedTicker === activeTicker) {
      return;
    }

    router.push(`/?ticker=${encodeURIComponent(normalizedTicker)}`);
  };

  const submitPaperTrade = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return;
    }

    await dispatch(submitBuyTrade({
      quantity: parsedQuantity,
      ticker: activeTicker,
    }));
  };

  const closeBuyModal = () => {
    setIsBuyModalOpen(false);
    setQuantity('1');
  };

  const openBuyModal = () => {
    setIsBuyModalOpen(true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <PageShell>
        <Header />
        <MainContent>
          <motion.div
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
            variants={pageLoadVariants}
          >
            <motion.div variants={heroLoadVariants}>
              <HeroLayout>
                <HeroSection onSearch={searchForTicker} searchValue={activeTicker} />
              </HeroLayout>
            </motion.div>
            <motion.div variants={analysisLoadVariants}>
              <AnalysisPanel>
                <ReportContext>
                  {isContentLoading ? <ReportHeaderLoading /> : <ReportHeader
                    actionLabel="Buy paper position"
                    companyName={reportHeader.companyName}
                    ticker={reportHeader.ticker}
                    sector={reportHeader.sector}
                    industry={reportHeader.industry}
                    onAction={openBuyModal}
                    valuation={reportHeader.sharePrice}
                  />}
                  {isContentLoading ? <KeyTenetsFrameLoading /> : <KeyTenetsFrame activeTicker={activeTicker} metrics={overviewMetrics} />}
                  {isContentLoading ? <VerdictSectionLoading /> : <VerdictSection />}
                </ReportContext>
                {isContentLoading ? <QualitativePillarsLoading /> : <QualitativePillars />}
              </AnalysisPanel>
            </motion.div>
          </motion.div>
        </MainContent>
        {isBuyModalOpen && (
          <BuyTradeModalBackdrop
            aria-modal="true"
            data-testid="home-page-buy-modal"
            role="dialog"
          >
            <BuyTradeModalCard>
              <BuyTradeModalHeader>
                <BuyTradeModalTitle data-testid="home-page-buy-modal-title">
                  Buy {activeTicker} in paper mode
                </BuyTradeModalTitle>
                <BuyTradeModalDescription data-testid="home-page-buy-modal-description">
                  Enter how many shares to buy. We will estimate the total cost from the current share price before submitting a paper market order.
                </BuyTradeModalDescription>
              </BuyTradeModalHeader>
              <BuyTradeForm onSubmit={submitPaperTrade}>
                <BuyTradeFieldGroup>
                  <BuyTradeFieldLabel htmlFor="home-page-buy-quantity">
                    Shares to buy
                  </BuyTradeFieldLabel>
                  <BuyTradeFieldInput
                    data-testid="home-page-buy-quantity"
                    id="home-page-buy-quantity"
                    inputMode="decimal"
                    min="0.01"
                    name="quantity"
                    onChange={(event) => setQuantity(event.target.value)}
                    step="0.01"
                    type="number"
                    value={quantity}
                  />
                </BuyTradeFieldGroup>
                <BuyTradeEstimatePanel data-testid="home-page-buy-estimate">
                  <BuyTradeEstimateLabel>Estimated total cost</BuyTradeEstimateLabel>
                  <BuyTradeEstimateValue>{estimatedCost}</BuyTradeEstimateValue>
                  <BuyTradeEstimateMeta>
                    Based on the displayed share price of {reportHeader.sharePrice === '—' ? 'the current company' : reportHeader.sharePrice}.
                  </BuyTradeEstimateMeta>
                </BuyTradeEstimatePanel>
                {buyTradeStatus === 'failed' && (
                  <HomePageError
                    message={buyTradeError ?? 'The paper trade could not be submitted.'}
                    onRetry={() => dispatch(submitBuyTrade({
                      quantity: Number(quantity),
                      ticker: activeTicker,
                    }))}
                  />
                )}
                {buyTradeStatus === 'succeeded' && lastBuyTrade?.ticker === activeTicker && (
                  <BuyTradeSuccessBanner data-testid="home-page-buy-success">
                    <BuyTradeSuccessTitle>
                      Paper order submitted
                    </BuyTradeSuccessTitle>
                    <BuyTradeSuccessDescription>
                      Submitted {lastBuyTrade.quantity} share{lastBuyTrade.quantity === 1 ? '' : 's'} of {lastBuyTrade.ticker} as a paper market order.
                    </BuyTradeSuccessDescription>
                  </BuyTradeSuccessBanner>
                )}
                <BuyTradeActions>
                  <BuyTradeActionButton
                    data-testid="home-page-buy-cancel"
                    onClick={closeBuyModal}
                    type="button"
                  >
                    Cancel
                  </BuyTradeActionButton>
                  <BuyTradeActionButton
                    $variant="primary"
                    data-testid="home-page-buy-submit"
                    disabled={
                      buyTradeStatus === 'submitting'
                      || !Number.isFinite(Number(quantity))
                      || Number(quantity) <= 0
                      || reportHeader.sharePrice === '—'
                      || Boolean(overviewError)
                    }
                    type="submit"
                  >
                    {buyTradeStatus === 'submitting' ? 'Submitting paper order…' : 'Submit paper order'}
                  </BuyTradeActionButton>
                </BuyTradeActions>
              </BuyTradeForm>
            </BuyTradeModalCard>
          </BuyTradeModalBackdrop>
        )}
      </PageShell>
    </MotionConfig>
  );
}
