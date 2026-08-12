'use client';

import Header from "../components/molecules/header/header";
import HeroSection from "../components/organisms/hero-section/hero-section";
import KeyTenetsFrame from "../components/organisms/key-tenets-frame/key-tenets-frame";
import QualitativePillars from "../components/organisms/qualitative-pillars/qualitative-pillars";
import ReportHeader from "../components/organisms/report-header/report-header";
import VerdictSection from "../components/organisms/verdict-section/verdict-section";
import {
  AnalysisPanel,
  HeroLayout,
  MainContent,
  PageShell,
  ReportContext,
} from "./page.styles";

export default function Home() {
  return (
    <PageShell>
      <Header />
      <MainContent>
        <HeroLayout>
          <HeroSection />
        </HeroLayout>
        <AnalysisPanel>
          <ReportContext>
            <ReportHeader />
            <KeyTenetsFrame />
            <VerdictSection />
          </ReportContext>
        <QualitativePillars />
        </AnalysisPanel>
      </MainContent>
    </PageShell>
  );
}
