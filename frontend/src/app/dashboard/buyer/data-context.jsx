'use client';

import { createContext, useContext } from 'react';

export const BuyerDataContext = createContext(null);

export function useBuyerData() {
  const ctx = useContext(BuyerDataContext);
  if (!ctx) {
    throw new Error('useBuyerData must be used inside a BuyerDataContext.Provider');
  }
  return ctx;
}
