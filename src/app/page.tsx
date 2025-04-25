import { ChatSheetProvider } from "@/context/ChatSheetContext";
import TerminalHero from "@/components/TerminalHero";

export default function Home() {
  return (
    <ChatSheetProvider>
      <TerminalHero />
    </ChatSheetProvider>
  );
}
