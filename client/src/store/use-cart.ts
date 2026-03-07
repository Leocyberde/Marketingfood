import { create } from "zustand";
import { type Product } from "@shared/schema";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  storeId: number | null;
  items: CartItem[];
  addItem: (product: Product, storeId: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  storeId: null,
  items: [],
  
  addItem: (product, storeId) => {
    set((state) => {
      // If adding from a different store, clear current cart
      if (state.storeId !== null && state.storeId !== storeId) {
        return {
          storeId,
          items: [{ product, quantity: 1 }],
        };
      }

      const existingItem = state.items.find((item) => item.product.id === product.id);
      if (existingItem) {
        return {
          storeId,
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        storeId,
        items: [...state.items, { product, quantity: 1 }],
      };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const newItems = state.items.filter((item) => item.product.id !== productId);
      return {
        items: newItems,
        storeId: newItems.length === 0 ? null : state.storeId,
      };
    });
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter((item) => item.product.id !== productId);
        return { items: newItems, storeId: newItems.length === 0 ? null : state.storeId };
      }
      return {
        items: state.items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      };
    });
  },

  clearCart: () => set({ items: [], storeId: null }),

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },
}));
