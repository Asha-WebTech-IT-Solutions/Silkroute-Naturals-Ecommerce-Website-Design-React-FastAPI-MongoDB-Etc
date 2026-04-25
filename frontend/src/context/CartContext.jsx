import { createContext, useContext, useEffect, useState } from "react";

const CartCtx = createContext(null);
const KEY = "silkroute_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1, custom = null) => {
    setItems((prev) => {
      const key = custom ? `custom-${Date.now()}` : product.id;
      if (custom) {
        return [...prev, {
          product_id: key,
          quantity: qty,
          custom,
          name: product.name,
          price: product.price,
          image: product.image || "",
        }];
      }
      const existing = prev.find((i) => i.product_id === product.id && !i.custom);
      if (existing) {
        return prev.map((i) => i.product_id === product.id && !i.custom ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, {
        product_id: product.id,
        quantity: qty,
        name: product.name,
        price: product.price,
        image: (product.images && product.images[0]) || product.image || "",
        custom: null,
      }];
    });
    setOpen(true);
  };

  const updateQty = (idx, qty) => {
    setItems((prev) => prev.map((i, k) => k === idx ? { ...i, quantity: Math.max(1, qty) } : i));
  };
  const remove = (idx) => setItems((prev) => prev.filter((_, k) => k !== idx));
  const clear = () => setItems([]);
  const subtotal = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartCtx.Provider value={{ items, addItem, updateQty, remove, clear, subtotal, count, open, setOpen }}>
      {children}
    </CartCtx.Provider>
  );
}
export const useCart = () => useContext(CartCtx);
