"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatSheetContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  trigger: string;
  setTrigger: (trigger: string) => void;
}

const ChatSheetContext = createContext<ChatSheetContextType>({
  isOpen: false,
  setIsOpen: () => {},
  trigger: '',
  setTrigger: () => {},
});

export function ChatSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState('');

  return (
    <ChatSheetContext.Provider value={{ isOpen, setIsOpen, trigger, setTrigger }}>
      {children}
    </ChatSheetContext.Provider>
  );
}

export const useChatSheet = () => useContext(ChatSheetContext); 