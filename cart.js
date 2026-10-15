(() => {
  const storageKey = "omak-resources-cart";

  function readCart() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  let items = readCart();

  function getItems() {
    return items.map(item => ({ ...item }));
  }

  function getCount() {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  function getTotal() {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  function updateBadges() {
    const count = getCount();
    document.querySelectorAll(".cart-count").forEach(badge => {
      badge.textContent = count;
      badge.hidden = count === 0;
    });
    document.querySelectorAll("#cart-link").forEach(link => {
      link.setAttribute("aria-label", `Cart, ${count} ${count === 1 ? "item" : "items"}`);
    });
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // Keep the in-page cart working when browser storage is unavailable.
    }
    updateBadges();
    window.dispatchEvent(new CustomEvent("omak-cart-updated", { detail: getItems() }));
  }

  function add(product) {
    if (!product || !product.id || !product.name || !Number.isFinite(product.price)) return getCount();
    const existing = items.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
      existing.image = product.image || existing.image;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "",
        quantity: 1
      });
    }
    save();
    return getCount();
  }

  function setQuantity(id, quantity) {
    const item = items.find(entry => entry.id === id);
    if (!item) return;
    if (quantity < 1) {
      remove(id);
      return;
    }
    item.quantity = quantity;
    save();
  }

  function remove(id) {
    items = items.filter(item => item.id !== id);
    save();
  }

  function clear() {
    items = [];
    save();
  }

  window.addEventListener("storage", event => {
    if (event.key === storageKey) {
      items = readCart();
      updateBadges();
    }
  });

  window.OmakCart = { add, clear, getCount, getItems, getTotal, remove, setQuantity, updateBadges };
  updateBadges();
})();