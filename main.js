import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON;
const PRODUCTS_TABLE = import.meta.env.VITE_PRODUCTS_TABLE || 'products';

let sbClient = null;
let products = [];
let cart = [];
let currentProduct = null;

function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.error('Supabase credentials missing!');
    return;
  }
  sbClient = createClient(SUPABASE_URL, SUPABASE_ANON);
}

async function loadProducts() {
  if (!sbClient) {
    useDemoData();
    return;
  }
  const { data, error } = await sbClient.from(PRODUCTS_TABLE).select('*').order('id');
  if (error || !data.length) {
    useDemoData();
  } else {
    products = data;
  }
  renderProducts();
}

function useDemoData() {
  products = [
    { id:1, name:"Classic Tee", cat:"t-shirt", price:15000, description:"Coton bio.", sizes:["M","L","XL"], imgs:[] },
    { id:2, name:"Premium Set", cat:"ensemble", price:45000, description:"Édition limitée.", sizes:["L","XL"], imgs:[] },
    { id:3, name:"Street Jacket", cat:"veste", price:55000, description:"Veste premium.", sizes:["S","M","L"], imgs:[] }
  ];
}

function renderProducts(filter='all') {
  const loading = document.getElementById('loadingGrid');
  if (loading) loading.style.display='none';
  
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  grid.style.display='grid';
  const filtered = filter === 'all' ? products : products.filter(p => p.cat === filter);
  
  grid.innerHTML = filtered.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img-wrap">
        ${p.imgs[0] ? `<img src="${p.imgs[0]}">` : `<div style='height:100%;background:#eee'></div>`}
        <button class="product-quick-view">Aperçu</button>
      </div>
      <div class="product-info">
        <div class="product-cat">${p.cat.toUpperCase()}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">${fmt(p.price)}</div>
        <button class="btn-add-cart" data-add-id="${p.id}">+ Ajouter</button>
      </div>
    </div>
  `).join('');

  // Add event listeners
  grid.querySelectorAll('.product-card').forEach(card => {
    card.onclick = () => openProduct(parseInt(card.dataset.id));
  });
  grid.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      addToCart(parseInt(btn.dataset.addId));
    };
  });
}

window.openProduct = (id) => {
  currentProduct = products.find(p => p.id === id);
  if (!currentProduct) return;
  
  document.getElementById('modalNameTop').textContent = currentProduct.name;
  document.getElementById('modalName').textContent = currentProduct.name;
  document.getElementById('modalCat').textContent = currentProduct.cat.toUpperCase();
  document.getElementById('modalPrice').textContent = fmt(currentProduct.price);
  document.getElementById('modalDesc').textContent = currentProduct.description;
  document.getElementById('mainImgWrap').innerHTML = currentProduct.imgs[0] ? `<img src="${currentProduct.imgs[0]}">` : '👕';
  document.getElementById('sizeBtns').innerHTML = currentProduct.sizes.map(s => `<button class="size-btn">${s}</button>`).join('');
  
  // Size select listener
  document.getElementById('sizeBtns').querySelectorAll('.size-btn').forEach(btn => {
    btn.onclick = () => selectSize(btn);
  });
  
  document.getElementById('productOverlay').classList.add('open');
  document.body.style.overflow='hidden';
};

window.closeProduct = () => {
  document.getElementById('productOverlay').classList.remove('open');
  document.body.style.overflow='';
};

const fmt = (n) => n.toLocaleString('fr-FR') + ' FCFA';

window.toggleCart = () => document.getElementById('cartPanel').classList.toggle('open');
window.toggleChat = () => document.getElementById('chatChannels').classList.toggle('open');

function selectSize(btn) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

window.changeQty = (d) => {
  const i = document.getElementById('qtyInput');
  i.value = Math.max(1, parseInt(i.value) + d);
};

function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  cart.push({ ...p, qty: 1, key: Date.now() });
  updateCart();
  showToast('Ajouté');
}

window.addToCartFromModal = () => {
  const qty = parseInt(document.getElementById('qtyInput').value);
  const size = document.querySelector('.size-btn.selected')?.textContent || 'U';
  cart.push({ ...currentProduct, qty, size, key: Date.now() });
  updateCart();
  window.toggleCart();
  window.closeProduct();
};

function updateCart() {
  const count = document.getElementById('cartCount');
  if (count) count.textContent = cart.length;
  
  const items = document.getElementById('cartItems');
  if (!items) return;
  
  items.innerHTML = cart.length ? cart.map(c => `
    <div style='padding:1rem; border-bottom:1px solid #eee'>
      <div>${c.name} (x${c.qty})</div>
      <div style='font-weight:700;color:var(--primary)'>${fmt(c.price * c.qty)}</div>
    </div>
  `).join('') : '<div style="padding:2rem;text-align:center;color:#888">Vide</div>';
  
  document.getElementById('cartTotal').textContent = fmt(cart.reduce((s, c) => s + c.price * c.qty, 0));
}

window.filterProducts = (cat, btn) => {
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(cat);
};

function showToast(m) {
  const t = document.getElementById('toast');
  const msg = document.getElementById('toastMsg');
  if (!t || !msg) return;
  msg.textContent = m;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

window.handleNewsletter = (e) => {
  e.preventDefault();
  showToast('Inscrit !');
  e.target.reset();
};

window.openCheckout = () => {
  if (!cart.length) return;
  document.getElementById('checkoutOverlay').classList.add('open');
};

window.closeCheckout = () => document.getElementById('checkoutOverlay').classList.remove('open');

window.submitOrder = async (e) => {
  e.preventDefault();
  const f = e.target;
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const fd = new FormData();
  fd.append('Nom', f.name.value);
  fd.append('Commande', cart.map(c => `${c.name} x${c.qty}`).join(', '));
  fd.append('Total', fmt(total));
  
  try {
    await fetch('https://formsubmit.co/ajax/ovrg.apparel@gmail.com', { method: 'POST', body: fd });
    showToast('Commande envoyée !');
    cart = [];
    updateCart();
    window.closeCheckout();
  } catch (err) {
    showToast('Erreur lors de l\'envoi');
  }
};

window.payWithPayPal = () => {
  const pf = document.getElementById('paypalCartForm');
  pf.querySelectorAll('.dyn').forEach(e => e.remove());
  cart.forEach((c, i) => {
    const n = document.createElement('input'); n.type = 'hidden'; n.name = `item_name_${i + 1}`; n.value = c.name; n.className = 'dyn';
    const a = document.createElement('input'); a.type = 'hidden'; a.name = `amount_${i + 1}`; a.value = (c.price / 655).toFixed(2); a.className = 'dyn';
    const q = document.createElement('input'); q.type = 'hidden'; q.name = `quantity_${i + 1}`; q.value = c.qty; q.className = 'dyn';
    pf.appendChild(n); pf.appendChild(a); pf.appendChild(q);
  });
  pf.submit();
};

window.payWithWave = () => window.open('https://pay.wave.com/m/ovrg', '_blank');
window.buyViaYango = () => window.open('https://yango.com', '_blank');
window.buyViaWhatsApp = () => window.open(`https://wa.me/2250799108108?text=Commande: ${cart.map(c => c.name).join(', ')}`, '_blank');

document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  loadProducts();
});
