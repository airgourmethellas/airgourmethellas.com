import { useState, useCallback } from 'react';

export function useChatDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | undefined>(undefined);

  const openChat = useCallback((orderNumber?: string) => {
    setOrderNumber(orderNumber);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    orderNumber,
    openChat,
    closeChat,
    onOpenChange: setIsOpen,
  };
}