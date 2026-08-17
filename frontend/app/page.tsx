'use client';

import { useEffect } from 'react';
import type { Variants } from 'motion/react';
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
  selectOverviewReportHeader,
  selectOverviewStatus,
  selectOverviewTicker,
} from '../redux/selectors/overview.selectors';
import { fetchOverview } from '../redux/slices/overview.slice';
import {
  AnalysisPanel,
  HeroLayout,
  MainContent,
  PageShell,
  ReportContext,
} from "./page.styles";

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
  const overviewTicker = useAppSelector(selectOverviewTicker);
  const overviewMetrics = useAppSelector(selectOverviewMetricCards);
  const overviewReportHeader = useAppSelector(selectOverviewReportHeader);
  const activeTicker = searchParams.get('ticker')?.trim().toUpperCase() || DEFAULT_TICKER;
  const isContentLoading = overviewStatus === 'idle' || overviewStatus === 'loading';
  const reportHeader = overviewTicker === activeTicker && overviewReportHeader
    ? overviewReportHeader
    : {
      companyName: '—',
      industry: '—',
      sector: '—',
      sharePrice: '—',
      ticker: activeTicker,
    };

  useEffect(() => {
    dispatch(fetchOverview(activeTicker));
  }, [activeTicker, dispatch]);

  const searchForTicker = (query: string) => {
    const normalizedTicker = query.trim().toUpperCase();

    if (!normalizedTicker || normalizedTicker === activeTicker) {
      return;
    }

    router.push(`/?ticker=${encodeURIComponent(normalizedTicker)}`);
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
                    companyName={reportHeader.companyName}
                    ticker={reportHeader.ticker}
                    sector={reportHeader.sector}
                    industry={reportHeader.industry}
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
      </PageShell>
    </MotionConfig>
  );
}
