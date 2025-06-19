import { ChatSheetProvider } from "@/context/ChatSheetContext";
import TerminalHero from "@/components/TerminalHero";
import HowItWorks from "@/components/HowItWorks";
import WhatBuildersSay from "@/components/WhatBuildersSay";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <ChatSheetProvider>
      <TerminalHero />
      <HowItWorks />
      <WhatBuildersSay />
      <Footer />
    </ChatSheetProvider>
  );
}
