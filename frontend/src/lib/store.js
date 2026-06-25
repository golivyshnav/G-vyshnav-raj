import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,
      setDrawerOpen: (open) => set({ drawerOpen: open }),
      addItem: (item) => {
        const items = get().items;
        const idx = items.findIndex(
          (i) => i.product_id === item.product_id && i.size === item.size && i.color === item.color
        );
        if (idx >= 0) {
          const next = [...items];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
          set({ items: next, drawerOpen: true });
        } else {
          set({ items: [...items, item], drawerOpen: true });
        }
      },
      updateQty: (id, size, color, quantity) => {
        set({
          items: get().items.map((i) =>
            i.product_id === id && i.size === size && i.color === color
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        });
      },
      removeItem: (id, size, color) => {
        set({
          items: get().items.filter(
            (i) => !(i.product_id === id && i.size === size && i.color === color)
          ),
        });
      },
      clear: () => set({ items: [] }),
    }),
    { name: "sophie-cart" }
  )
);

export const useAuth = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => {
        localStorage.setItem("sophie_token", token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem("sophie_token");
        set({ user: null, token: null });
      },
    }),
    { name: "sophie-auth" }
  )
);

export const useWishlist = create(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const ids = get().ids;
        set({ ids: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] });
      },
      has: (id) => get().ids.includes(id),
    }),
    { name: "sophie-wishlist" }
  )
);

export const useRecentlyViewed = create(
  persist(
    (set, get) => ({
      ids: [],
      push: (id) => {
        const ids = get().ids.filter((x) => x !== id);
        set({ ids: [id, ...ids].slice(0, 8) });
      },
    }),
    { name: "sophie-recent" }
  )
);
