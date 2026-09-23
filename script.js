// Nav scroll state
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');

function onScroll(){
  if(window.scrollY > 40){
    nav.classList.add('is-scrolled');
  } else {
    nav.classList.remove('is-scrolled');
  }
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// Mobile menu toggle
burger.addEventListener('click', () => {
  nav.classList.toggle('is-open');
});
document.querySelectorAll('.nav__mobile a').forEach(a => {
  a.addEventListener('click', () => nav.classList.remove('is-open'));
});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, {threshold:0.12, rootMargin:'0px 0px -60px 0px'});
revealEls.forEach(el => io.observe(el));

// Cookie banner
const cookie = document.getElementById('cookie');
const cookieOk = document.getElementById('cookieOk');
try {
  if(!localStorage.getItem('fosberg_cookie_ok')){
    setTimeout(() => cookie.classList.add('is-visible'), 900);
  }
} catch(e){
  setTimeout(() => cookie.classList.add('is-visible'), 900);
}
cookieOk.addEventListener('click', () => {
  cookie.classList.remove('is-visible');
  try { localStorage.setItem('fosberg_cookie_ok', '1'); } catch(e){}
});

// ---------- Cart ----------
const WHATSAPP_NUMBER = '79640310106';
const CART_KEY = 'fosberg_cart';
const PRICE_BY_SIZE = {
  '3 кг': 1690,
  '10 кг': 4590,
  '15 кг': 6290
};
const DEFAULT_PRICE = 1690;

function priceForSize(size){
  return PRICE_BY_SIZE[size] || DEFAULT_PRICE;
}

function formatPrice(n){
  return n.toLocaleString('ru-RU') + ' ₽';
}

const cartToggle = document.getElementById('cartToggle');
const cartOverlay = document.getElementById('cartOverlay');
const cartDrawer = document.getElementById('cartDrawer');
const cartClose = document.getElementById('cartClose');
const cartBadge = document.getElementById('cartBadge');
const cartItemsEl = document.getElementById('cartItems');
const cartEmptyEl = document.getElementById('cartEmpty');
const cartFootEl = document.getElementById('cartFoot');
const cartCountEl = document.getElementById('cartCount');
const cartSumEl = document.getElementById('cartSum');
const cartClearBtn = document.getElementById('cartClear');
const orderWhatsappLink = document.getElementById('orderWhatsapp');
const orderTelegramLink = document.getElementById('orderTelegram');
const toastEl = document.getElementById('toast');

function loadCart(){
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){ return []; }
}
function saveCart(){
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch(e){}
}

let cart = loadCart();

function totalCount(){
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function totalSum(){
  return cart.reduce((sum, item) => sum + item.qty * (item.price || DEFAULT_PRICE), 0);
}

function renderCart(){
  cartItemsEl.innerHTML = '';
  if(cart.length === 0){
    cartEmptyEl.hidden = false;
    cartFootEl.hidden = true;
  } else {
    cartEmptyEl.hidden = true;
    cartFootEl.hidden = false;
    cart.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__size">${item.size}</div>
          <div class="cart-item__price">${formatPrice((item.price || DEFAULT_PRICE) * item.qty)}</div>
          <div class="cart-item__qty">
            <button type="button" data-action="dec" aria-label="Уменьшить">&minus;</button>
            <span>${item.qty}</span>
            <button type="button" data-action="inc" aria-label="Увеличить">+</button>
          </div>
        </div>
        <button class="cart-item__remove" type="button" data-action="remove" aria-label="Удалить">&times;</button>
      `;
      row.querySelector('[data-action="dec"]').addEventListener('click', () => changeQty(index, -1));
      row.querySelector('[data-action="inc"]').addEventListener('click', () => changeQty(index, 1));
      row.querySelector('[data-action="remove"]').addEventListener('click', () => removeItem(index));
      cartItemsEl.appendChild(row);
    });
  }
  const count = totalCount();
  cartCountEl.textContent = count;
  cartSumEl.textContent = formatPrice(totalSum());
  if(count > 0){
    cartBadge.hidden = false;
    cartBadge.textContent = count;
  } else {
    cartBadge.hidden = true;
  }
  updateOrderLinks();
}

function changeQty(index, delta){
  cart[index].qty += delta;
  if(cart[index].qty <= 0){
    cart.splice(index, 1);
  }
  saveCart();
  renderCart();
}

function removeItem(index){
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function addToCart(name, size, price){
  const existing = cart.find(item => item.name === name && item.size === size);
  if(existing){
    existing.qty += 1;
  } else {
    cart.push({name, size, price, qty: 1});
  }
  saveCart();
  renderCart();
  showToast(`Добавлено в корзину: ${name}, ${size}`);
}

function buildOrderText(){
  const lines = cart.map((item, i) => `${i + 1}. ${item.name} — ${item.size} — ${item.qty} шт. — ${formatPrice((item.price || DEFAULT_PRICE) * item.qty)}`);
  return `Здравствуйте! Хочу заказать:\n${lines.join('\n')}\n\nИтого товаров: ${totalCount()}\nИтого к оплате: ${formatPrice(totalSum())}`;
}

function updateOrderLinks(){
  const text = encodeURIComponent(buildOrderText());
  orderWhatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  orderTelegramLink.href = `https://t.me/share/url?url=&text=${text}`;
}

function openCart(){
  cartDrawer.classList.add('is-open');
  cartOverlay.classList.add('is-open');
  cartDrawer.setAttribute('aria-hidden', 'false');
}
function closeCart(){
  cartDrawer.classList.remove('is-open');
  cartOverlay.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden', 'true');
}

cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
cartClearBtn.addEventListener('click', () => {
  cart = [];
  saveCart();
  renderCart();
});

function updateCardPrice(select){
  const card = select.closest('.pcard');
  const amountEl = card.querySelector('.pcard__price-amount');
  if(amountEl){
    amountEl.textContent = formatPrice(priceForSize(select.value));
  }
}

document.querySelectorAll('.pcard__size').forEach(select => {
  updateCardPrice(select);
  select.addEventListener('change', () => updateCardPrice(select));
});

document.querySelectorAll('.pcard__order').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.pcard');
    const name = card.querySelector('h3').textContent.trim();
    const sizeSelect = card.querySelector('.pcard__size');
    const size = sizeSelect ? sizeSelect.value : '';
    addToCart(name, size, priceForSize(size));
  });
});

let toastTimer;
function showToast(message){
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
}

renderCart();
