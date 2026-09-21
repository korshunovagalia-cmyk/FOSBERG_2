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
