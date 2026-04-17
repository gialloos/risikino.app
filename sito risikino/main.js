/* ===========================
   RISIKINO — main.js
   =========================== */

/* ---- NAVBAR SCROLL ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

/* ---- HAMBURGER ---- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ---- CANVAS PARTICLE SYSTEM ---- */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let W, H, particles = [];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const PARTICLE_COUNT = 60;
const COLORS = ['192,57,43', '232,185,79', '231,76,60', '255,255,255'];

function randomParticle() {
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + 0.3,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    c: COLORS[Math.floor(Math.random() * COLORS.length)],
    a: Math.random() * 0.6 + 0.1
  };
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(randomParticle());

// Mouse parallax
let mx = W / 2, my = H / 2;
window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => {
    // Subtle mouse attraction
    const dx = mx - p.x, dy = my - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 200) {
      p.vx += dx * 0.00005;
      p.vy += dy * 0.00005;
    }
    p.vx *= 0.99;
    p.vy *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = W;
    if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H;
    if (p.y > H) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.c},${p.a})`;
    ctx.fill();
  });

  // Draw connecting lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const pi = particles[i], pj = particles[j];
      const dx = pi.x - pj.x, dy = pi.y - pj.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        ctx.beginPath();
        ctx.moveTo(pi.x, pi.y);
        ctx.lineTo(pj.x, pj.y);
        ctx.strokeStyle = `rgba(192,57,43,${0.08 * (1 - d / 100)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ---- REVEAL OBSERVER ---- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ---- COUNTER ANIMATION ---- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('it-IT');
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString('it-IT') + (el.dataset.suffix || '');
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

/* ---- TILT EFFECT ON FEATURE CARDS ---- */
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-6px) perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    const glow = card.querySelector('.feat-glow');
    if (glow) {
      glow.style.background = `radial-gradient(circle at ${(x+0.5)*100}% ${(y+0.5)*100}%, rgba(192,57,43,0.14), transparent 70%)`;
    }
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ---- SMOOTH SCROLL FOR ANCHOR LINKS ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---- PHONE SCREEN ANIMATED BARS ---- */
// Re-trigger bar animations when phone comes into view
const phoneObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bars = entry.target.querySelectorAll('.bar, .wr-fill');
      bars.forEach(bar => {
        bar.style.animation = 'none';
        bar.offsetHeight; // reflow
        bar.style.animation = '';
      });
    }
  });
}, { threshold: 0.3 });

const phoneContainer = document.querySelector('.phone-container');
if (phoneContainer) phoneObserver.observe(phoneContainer);
