import { Press_Start_2P } from "next/font/google";

// The pixel display font is loaded for the landing page only.
const pressStart = Press_Start_2P({
  variable: "--font-press",
  weight: "400",
  subsets: ["latin"],
});

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return <div className={`${pressStart.variable} flex flex-1 flex-col`}>{children}</div>;
}
