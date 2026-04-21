/* Atlantic Links B&B — main.js */

function initNavScroll() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('nav-menu');
  const nav  = document.getElementById('nav');

  function close() {
    menu.classList.remove('nav-open');
    btn.classList.remove('is-active');
    btn.setAttribute('aria-expanded', 'false');
  }

  function toggle() {
    const isOpen = menu.classList.toggle('nav-open');
    btn.classList.toggle('is-active', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  }

  btn.addEventListener('click', toggle);

  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) close();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', close);
  });
}

function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__menu a[href^="#"]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav__menu a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
}

function initContactForm() {
  const form     = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  function clearErrors() {
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    form.querySelectorAll('.error-message').forEach(el => el.classList.remove('visible'));
    feedback.className = 'form-feedback';
    feedback.textContent = '';
  }

  function showError(fieldId, errorId) {
    document.getElementById(fieldId).classList.add('input-error');
    document.getElementById(errorId).classList.add('visible');
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();

    let valid = true;

    if (!form.name.value.trim()) {
      showError('name', 'name-error');
      valid = false;
    }

    if (!isValidEmail(form.email.value)) {
      showError('email', 'email-error');
      valid = false;
    }

    if (!valid) return;

    feedback.textContent = '✓ Thanks! We\'ll be in touch within 24 hours to discuss your golf package.';
    feedback.className = 'form-feedback form-feedback--success';
    form.reset();
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function initScrollAnimations() {
  const targets = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach((el, i) => {
    el.style.transitionDelay = (i % 3 * 0.12) + 's';
    observer.observe(el);
  });
}

initNavScroll();
initHamburger();
initActiveNav();
initContactForm();
initScrollAnimations();
