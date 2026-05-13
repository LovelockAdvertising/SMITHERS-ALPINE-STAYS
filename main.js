(function () {
  const body = document.body;

  /* ===== Seasonal content swap (homepage only — guarded for subpages) ===== */
  const SEASONS = {
    winter: {
      heroHeadline: 'Breathtaking Views. Unforgettable Stays.',
      heroSubheading: 'Ski-in, ski-out access. Unmatched comfort. All winter long.',
      exploreHeadline: 'Explore Hudson Bay Mountain This Winter',
      exploreBody: 'From powder runs to snowshoeing and après-ski, adventure is right outside your door. Discover winter activities just minutes away.',
      urgencyText: 'Peak season fills fast. Lock in your winter escape now.'
    },
    summer: {
      heroHeadline: 'Breathtaking Views. Unforgettable Stays.',
      heroSubheading: 'Hike, bike, and unwind. Your summer mountain escape awaits.',
      exploreHeadline: 'Explore Smithers This Summer',
      exploreBody: 'From alpine hiking and mountain biking to kayaking on glacial lakes and wildlife spotting, endless summer adventure awaits.',
      urgencyText: 'Summer dates book quickly. Reserve your cabin today.'
    }
  };

  const toggle = document.getElementById('seasonToggle');
  const els = {
    heroHeadline: document.getElementById('heroHeadline'),
    heroSubheading: document.getElementById('heroSubheading'),
    exploreHeadline: document.getElementById('exploreHeadline'),
    exploreBody: document.getElementById('exploreBody'),
    urgencyText: document.getElementById('urgencyText')
  };

  function applySeason(season) {
    body.setAttribute('data-season', season);
    if (toggle) toggle.setAttribute('aria-checked', season === 'summer' ? 'true' : 'false');
    const c = SEASONS[season];
    Object.keys(els).forEach((key) => {
      if (els[key]) els[key].textContent = c[key];
    });
  }

  if (toggle) {
    toggle.addEventListener('click', (e) => {
      const optionEl = e.target.closest('.season-toggle__option');
      if (optionEl) {
        applySeason(optionEl.dataset.season);
      } else {
        const current = body.getAttribute('data-season');
        applySeason(current === 'winter' ? 'summer' : 'winter');
      }
    });
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const current = body.getAttribute('data-season');
        applySeason(current === 'winter' ? 'summer' : 'winter');
      }
    });
  }

  /* ===== Sticky nav scroll ===== */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ===== Mobile nav ===== */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const active = navLinks.classList.toggle('active');
      hamburger.classList.toggle('active', active);
      hamburger.setAttribute('aria-expanded', active ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ===== Scroll reveal ===== */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = (i % 3) * 0.08 + 's';
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ===== Gallery lightbox (gallery page only) ===== */
  const galleryItems = document.querySelectorAll('[data-lightbox]');
  if (galleryItems.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<button class="lightbox__close" aria-label="Close">×</button><img alt="" />';
    document.body.appendChild(lightbox);
    const lbImg = lightbox.querySelector('img');
    const close = () => lightbox.classList.remove('active');
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox__close')) close();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (!img) return;
        lbImg.src = img.src;
        lbImg.alt = img.alt || '';
        lightbox.classList.add('active');
      });
    });
  }

  /* ===== Reviews — show all ===== */
  const reviewsGrid = document.querySelector('.reviews-grid--three');
  const loadMoreBtn = document.getElementById('loadMoreReviews');
  const loadMoreCount = document.getElementById('loadMoreCount');
  if (reviewsGrid && loadMoreBtn) {
    const INITIAL = 12;
    const cards = Array.from(reviewsGrid.querySelectorAll('.review-card'));
    const remaining = Math.max(0, cards.length - INITIAL);

    if (remaining === 0) {
      loadMoreBtn.parentElement.style.display = 'none';
    } else {
      cards.forEach((card, i) => {
        if (i >= INITIAL) card.classList.add('is-hidden');
      });
      if (loadMoreCount) loadMoreCount.textContent = '(' + remaining + ' more)';

      loadMoreBtn.addEventListener('click', () => {
        cards.forEach(card => {
          card.classList.remove('is-hidden');
          // Newly revealed cards also need .visible so they aren't stuck at
          // opacity 0 (the scroll-reveal observer fires only at first paint).
          card.classList.add('visible');
        });
        loadMoreBtn.parentElement.style.display = 'none';
      });
    }
  }

})();
