import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@workspace/api-client-react';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  storeId: number | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,

      addItem: (product, quantity = 1) => {
        set((state) => {
          // Prevent adding items from different stores
          if (state.storeId !== null && state.storeId !== product.storeId) {
            if (!window.confirm('Adding this item will clear your current cart from another store. Continue?')) {
              return state;
            }
            return {
              items: [{ ...product, quantity }],
              storeId: product.storeId,
            };
          }

          const existingItem = state.items.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              ...state,
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              storeId: product.storeId,
            };
          }

          return {
            ...state,
            items: [...state.items, { ...product, quantity }],
            storeId: product.storeId,
          };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== productId);
          return {
            items: newItems,
            storeId: newItems.length === 0 ? null : state.storeId,
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [], storeId: null }),

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'marketplace-cart',
    }
  )
);

interface LojistaState {
  selectedStoreId: number | null;
  setStoreId: (id: number | null) => void;
}

export const useLojista = create<LojistaState>()(
  persist(
    (set) => ({
      selectedStoreId: null,
      setStoreId: (id) => set({ selectedStoreId: id }),
    }),
    {
      name: 'marketplace-lojista-session',
    }
  )
);
