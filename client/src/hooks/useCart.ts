import { useState, useEffect } from "react";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

const CART_KEY = "marketplace_cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const addItem = (item: Omit<CartItem, "qty">) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) => i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) { removeItem(productId); return; }
    setCart((prev) => prev.map((i) => i.productId === productId ? { ...i, qty } : i));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  return { cart, addItem, removeItem, updateQty, clearCart, total, count };
}
