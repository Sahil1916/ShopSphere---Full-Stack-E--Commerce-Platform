export function showToast(msg, isError = false) {
  const toast = document.getElementById('toastShop');
  const msgEl = document.getElementById('toastMessage');
  if (!toast || !msgEl) return;
  msgEl.textContent = msg;
  const ico = toast.querySelector('.ico');
  if (ico) ico.style.background = isError ? 'var(--coral-dark)' : 'var(--success)';
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2600);
}

export function hideLoader() {
  const loader = document.getElementById('globalLoader');
  if (loader) setTimeout(() => loader.classList.add('hide'), 350);
}

export function initReveal() {
  setTimeout(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 0.08 + 's'; obs.observe(el); });
  }, 100);
}

export function normalizeProduct(p) {
  return {
    id: p.id, name: p.name, description: p.description || '',
    category: p.category, price: Number(p.price),
    mrp: p.mrp ? Number(p.mrp) : null, qty: p.quantity,
    img: p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'
  };
}

export function deriveCategories(products) {
  const counts = {};
  products.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
  const icons = { Electronics: 'bi-cpu', Fashion: 'bi-bag-heart', Home: 'bi-house-heart' };
  return Object.keys(counts).map(name => ({ name, count: counts[name], icon: icons[name] || 'bi-grid' }));
}

export function statusBadgeClass(status) {
  return ({ DELIVERED:'badge-delivered', SHIPPED:'badge-shipped', CONFIRMED:'badge-shipped', PENDING:'badge-processing', CANCELLED:'badge-pending' })[status] || 'badge-processing';
}
