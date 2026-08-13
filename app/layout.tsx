import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ReduxProvider from "../redux/provider";
import StyledThemeProvider from "../theme/provider";
import Footer from "../components/organisms/footer/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "oto | Home",
    template: "oto | %s",
  },
  description: "Financial analysis dashboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          <StyledThemeProvider>
            {children}
            <Footer />
          </StyledThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
