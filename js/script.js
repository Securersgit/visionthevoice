/* Mobile menu toggle */
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn?.addEventListener('click', () => {
  const showing = navLinks.style.display === 'flex';
  navLinks.style.display = showing ? 'none' : 'flex';
});

/* Smooth anchor scroll (nice touch) */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}) }
  });
});