// Wishlist stored in localStorage — same as original project
const KEY = 'shopwithsahil_wishlist';

export const WishlistStore = {
  get: () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  },
  add: (product) => {
    const items = WishlistStore.get();
    if (!items.find(i => i.id === product.id)) {
      items.push(product);
      localStorage.setItem(KEY, JSON.stringify(items));
    }
  },
  remove: (id) => {
    const items = WishlistStore.get().filter(i => i.id !== id);
    localStorage.setItem(KEY, JSON.stringify(items));
  },
  has: (id) => WishlistStore.get().some(i => i.id === id),
  clear: () => localStorage.removeItem(KEY),
  count: () => WishlistStore.get().length,
};
