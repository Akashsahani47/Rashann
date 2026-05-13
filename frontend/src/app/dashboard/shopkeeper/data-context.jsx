'use client';

import { createContext, useContext } from 'react';

export const ShopkeeperDataContext = createContext(null);

export function useShopkeeperData() {
  const ctx = useContext(ShopkeeperDataContext);
  if (!ctx) {
    throw new Error(
      'useShopkeeperData must be used inside a ShopkeeperDataContext.Provider'
    );
  }
  return ctx;
}
