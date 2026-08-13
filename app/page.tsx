'use client';

import { useEffect, useState } from 'react';
import { MotionConfig, motion, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';
import Header from "../components/molecules/header/header";
import HeroSection from "../components/organisms/hero-section/hero-section";
import KeyTenetsFrame from "../components/organisms/key-tenets-frame/key-tenets-frame";
import KeyTenetsFrameLoading from "../components/organisms/key-tenets-frame/key-tenets-frame.loading";
import QualitativePillars from "../components/organisms/qualitative-pillars/qualitative-pillars";
import QualitativePillarsLoading from "../components/organisms/qualitative-pillars/qualitative-pillars.loading";
import ReportHeader from "../components/organisms/report-header/report-header";
import ReportHeaderLoading from "../components/organisms/report-header/report-header.loading";
import VerdictSection from "../components/organisms/verdict-section/verdict-section";
import VerdictSectionLoading from "../components/organisms/verdict-section/verdict-section.loading";
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

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const [isContentLoading, setIsContentLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsContentLoading(false);
    }, 5_000);

    return () => window.clearTimeout(timeout);
  }, []);

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
                <HeroSection />
              </HeroLayout>
            </motion.div>
            <motion.div variants={analysisLoadVariants}>
              <AnalysisPanel>
                <ReportContext>
                  {isContentLoading ? <ReportHeaderLoading /> : <ReportHeader />}
                  {isContentLoading ? <KeyTenetsFrameLoading /> : <KeyTenetsFrame />}
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
