(function () {
  const root = document.documentElement;

  /* ===== Seasonal content swap (homepage only, guarded for subpages) ===== */
  const SEASONS = {
    winter: {
      heroHeadline: 'Ski-in/Ski-out Cabin Rentals on Hudson Bay Mountain',
      heroSubheading: 'Breathtaking views and unforgettable stays. Ski-in, ski-out access in Smithers, BC.',
      exploreHeadline: 'Explore Hudson Bay Mountain This Winter',
      exploreBody: 'From powder runs to snowshoeing and après-ski, adventure is right outside your door. Discover winter activities just minutes away.',
      urgencyText: 'Peak season fills fast. Lock in your winter escape now.'
    },
    summer: {
      heroHeadline: 'Ski-in/Ski-out Cabin Rentals on Hudson Bay Mountain',
      heroSubheading: 'Breathtaking views and unforgettable stays. Hike, bike and unwind in Smithers, BC.',
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
    root.setAttribute('data-season', season);
    if (toggle) toggle.setAttribute('aria-checked', season === 'summer' ? 'true' : 'false');
    const c = SEASONS[season];
    Object.keys(els).forEach((key) => {
      if (els[key]) els[key].textContent = c[key];
    });
  }

  function setSeason(season) {
    applySeason(season);
    try { sessionStorage.setItem('sas-season', season); } catch (e) {}
  }

  // The inline <head> script already set the season attribute on <html>
  // based on sessionStorage or today's month. Sync the toggle ARIA and
  // homepage text content to match.
  applySeason(root.getAttribute('data-season') || 'winter');

  if (toggle) {
    toggle.addEventListener('click', (e) => {
      const optionEl = e.target.closest('.season-toggle__option');
      if (optionEl) {
        setSeason(optionEl.dataset.season);
      } else {
        const current = root.getAttribute('data-season');
        setSeason(current === 'winter' ? 'summer' : 'winter');
      }
    });
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const current = root.getAttribute('data-season');
        setSeason(current === 'winter' ? 'summer' : 'winter');
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

  /* ===== Reviews, show all ===== */
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

  /* ===== Email signup popup (home page only) ===== */
  const popup = document.getElementById('emailPopup');
  if (popup) {
    const STORAGE_KEY = 'sas-email-popup-seen';
    // Force-show for design/testing: open index.html?popup=1 (or #popup)
    const forced = /[?&]popup=1\b/.test(location.search) || location.hash === '#popup';

    let alreadySeen = false;
    try { alreadySeen = localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) {}

    const markSeen = () => {
      if (forced) return; // don't burn the flag while previewing
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
    };

    const openPopup = () => {
      popup.classList.add('is-open');
      popup.setAttribute('aria-hidden', 'false');
      markSeen();
    };
    const closePopup = () => {
      popup.classList.remove('is-open');
      popup.setAttribute('aria-hidden', 'true');
    };

    if (forced || !alreadySeen) {
      // Show shortly after first load so it isn't jarring.
      setTimeout(openPopup, forced ? 0 : 1400);
    }

    popup.querySelectorAll('[data-popup-close]').forEach((el) => {
      el.addEventListener('click', closePopup);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popup.classList.contains('is-open')) closePopup();
    });

    const form = document.getElementById('emailPopupForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('.email-popup__input');
        const email = input ? input.value.trim() : '';
        if (!EMAIL_RE.test(email)) { if (input) input.focus(); return; }
        const btn = form.querySelector('.email-popup__btn');
        if (btn) { btn.textContent = 'Joining…'; btn.disabled = true; }
        subscribeToBrevo(email).finally(() => {
          popup.classList.add('is-done');
          setTimeout(closePopup, 3400);
        });
      });
    }
  }

  /* ===== Newsletter signup → Brevo =====
     One handler for every signup on the site: the footer row on each page,
     the newsletter sections on the sales pages, and the home-page popup.
     Posts the fields Brevo expects (EMAIL + honeypot + locale) straight to
     the hosted form URL, styled with the site's own inputs. */
  const BREVO_ACTION = 'https://9b2a4e9b.sibforms.com/serve/MUIFAFVt_lfFbbrC848bLCBgfedf77HQ5LAAaoe-8IWXs2aGgFzuhQeLl7iMip4y5kVOZ2wy3Mvbna8wpawIzeXdNHnQ8M8EbcsYEtnkX70EtcF2PNmNXLUHlcoNzikK9VCkUBcJu1hcB5uUlefcvr-mLtoIOBAaZQn4wsD3lPOp8xAgAMx6naX_i-oa-fYrLFBL05nUQ8Ze3hneiw==';
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function subscribeToBrevo(email) {
    const body = new URLSearchParams();
    body.set('EMAIL', email);
    body.set('email_address_check', ''); // Brevo honeypot, must stay empty
    body.set('locale', 'en');
    return fetch(BREVO_ACTION, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
  }

  document.querySelectorAll('.sas-subscribe-row').forEach((row) => {
    const input = row.querySelector('.sas-subscribe-input');
    const btn = row.querySelector('.sas-subscribe-btn');
    if (!input || !btn) return;
    const note = row.parentElement && row.parentElement.querySelector('.sas-subscribe-note');
    let busy = false;

    const setNote = (msg, state) => {
      if (!note) return;
      note.textContent = msg;
      note.setAttribute('data-state', state);
    };

    const submit = () => {
      if (busy) return;
      const email = input.value.trim();
      if (!EMAIL_RE.test(email)) {
        input.focus();
        setNote('Please enter a valid email address.', 'error');
        return;
      }
      busy = true;
      const label = btn.textContent;
      btn.textContent = 'Joining…';
      btn.disabled = true;
      subscribeToBrevo(email)
        .then(() => {
          input.value = '';
          btn.textContent = 'Subscribed ✓';
          setNote('Thanks! Check your inbox to confirm your subscription.', 'ok');
        })
        .catch(() => {
          btn.textContent = label;
          btn.disabled = false;
          busy = false;
          setNote('Something went wrong. Please try again.', 'error');
        });
    };

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });
  });

})();
