import Header from "../components/molecules/header/header";
import HeroSection from "../components/organisms/hero-section/hero-section";
import KeyTenetsFrame from "../components/organisms/key-tenets-frame/key-tenets-frame";
import ReportHeader from "../components/organisms/report-header/report-header";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans ">
      <Header />
      <main className="w-full p-3 bg-white ">
        <HeroSection />
        <ReportHeader />
        <KeyTenetsFrame />
      </main>
    </div>
  );
}
