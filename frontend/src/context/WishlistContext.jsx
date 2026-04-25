import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);
const KEY = "silkroute_wishlist_v1";

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const has = (id) => items.some((i) => i.id === id);
  const toggle = (product) => {
    setItems((prev) => prev.some((i) => i.id === product.id)
      ? prev.filter((i) => i.id !== product.id)
      : [...prev, { id: product.id, slug: product.slug, name: product.name, origin: product.origin, price: product.price, image: (product.images && product.images[0]) || "" }]);
  };
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  return <Ctx.Provider value={{ items, has, toggle, remove, clear, count: items.length }}>{children}</Ctx.Provider>;
}
export const useWishlist = () => useContext(Ctx);
