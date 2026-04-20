/* ================================================================
   RISIKINO — Site v2 interactions
   ================================================================ */

(function () {
  'use strict';

  // ---------- Theme ----------
  const THEME_KEY = 'risikino-theme';
  const root = document.documentElement;

  const applyTheme = (dark) => {
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#14110C' : '#F5F1EA');
  };

  // Follow system changes when the user has not set a manual preference
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)');
  sysDark.addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches);
  });

  // Manual toggle — saves preference and overrides system
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') !== 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    });
  }

  // ---------- Navbar scroll state ----------
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 8) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile menu ----------
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  // ---------- Animated counters ----------
  const counters = document.querySelectorAll('.stat-num');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.floor(target * eased);
      el.textContent = val.toLocaleString('it-IT') + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('it-IT') + suffix;
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const counterIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterIo.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterIo.observe(c));
  }

  // ---------- Carretto picker ----------
  const chips = document.querySelectorAll('.cart-chip');
  const bigCartUse = document.querySelector('#cs-big-cart use');
  const csName = document.getElementById('cs-name');
  const csDesc = document.getElementById('cs-desc');
  const csDescBox = document.querySelector('.cs-description');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');

      const color = chip.style.getPropertyValue('--cart-color');
      const name = chip.dataset.name;
      const desc = chip.dataset.desc;

      // animate carretto change
      if (bigCartUse) {
        const bigCart = document.getElementById('cs-big-cart');
        bigCart.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        bigCart.style.transform = 'scale(0.82) rotate(-4deg)';
        setTimeout(() => {
          bigCartUse.setAttribute('fill', color.trim());
          bigCart.style.transform = '';
        }, 180);
      }

      if (csName) {
        csName.style.opacity = '0';
        csName.style.transform = 'translateY(6px)';
        setTimeout(() => {
          csName.textContent = name;
          csName.style.transition = 'opacity 0.3s, transform 0.3s';
          csName.style.opacity = '1';
          csName.style.transform = '';
        }, 180);
      }
      if (csDesc) {
        csDesc.style.opacity = '0';
        setTimeout(() => {
          csDesc.textContent = desc;
          csDesc.style.transition = 'opacity 0.35s';
          csDesc.style.opacity = '1';
        }, 200);
      }
      if (csDescBox) {
        csDescBox.style.setProperty('--accent', color);
        const bar = csDescBox;
        bar.style.setProperty('transition', 'none');
      }
      // recolor the left bar of description
      const style = document.getElementById('dyn-style') || (() => {
        const s = document.createElement('style');
        s.id = 'dyn-style';
        document.head.appendChild(s);
        return s;
      })();
      style.textContent = `.cs-description::before { background: ${color.trim()} !important; }`;
    });
  });

  // ---------- Dice re-roll loop (rotates faces) ----------
  const dice = document.querySelectorAll('.die');
  const faces = {
    attack: [6, 5, 4, 6, 3, 6],
    defend: [3, 2, 1, 3, 4, 3]
  };
  let diceTick = 0;
  const rollDice = () => {
    diceTick++;
    dice.forEach(die => {
      const kind = die.classList.contains('die-attack') ? 'attack' : 'defend';
      const arr = faces[kind];
      const face = arr[diceTick % arr.length];
      die.setAttribute('data-face', face);
      // Simple pip layouts
      const layouts = {
        1: ['c'],
        2: ['tl','br'],
        3: ['tl','c','br'],
        4: ['tl','tr','bl','br'],
        5: ['tl','tr','c','bl','br'],
        6: ['tl','tr','ml','mr','bl','br']
      };
      const show = layouts[face] || ['c'];
      // Rebuild pips
      die.innerHTML = '';
      show.forEach(cls => {
        const p = document.createElement('span');
        p.className = 'pip ' + cls;
        die.appendChild(p);
      });
    });
  };
  if (dice.length) {
    setInterval(rollDice, 2600);
  }

  // ---------- Live timer tick ----------
  const timerEl = document.querySelector('.timer-value');
  if (timerEl) {
    let [m, s] = (timerEl.textContent || '02:47').split(':').map(n => parseInt(n, 10));
    setInterval(() => {
      if (s === 0) {
        if (m === 0) { m = 3; s = 0; } else { m--; s = 59; }
      } else {
        s--;
      }
      timerEl.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    }, 1000);
  }

  const liveTimerEl = document.querySelector('.ph-live-timer');
  if (liveTimerEl) {
    let [mm, ss] = (liveTimerEl.textContent || '47:22').split(':').map(n => parseInt(n, 10));
    setInterval(() => {
      ss++;
      if (ss >= 60) { ss = 0; mm++; }
      liveTimerEl.textContent = String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0');
    }, 1000);
  }

  // ---------- Subtle parallax on paper bg ----------
  const topo = document.querySelector('.topo-contours');
  if (topo && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      topo.style.transform = `translateY(${y * 0.15}px)`;
    }, { passive: true });
  }

  // ---------- Smooth anchor scroll offset ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const y = target.getBoundingClientRect().top + window.scrollY - 60;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    });
  });

})();
