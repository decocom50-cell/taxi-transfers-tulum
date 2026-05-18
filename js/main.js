/* ============================================================
   TAXI TRANSFER EN TULUM — JavaScript Principal
   ============================================================ */

(function () {
  'use strict';

  /* ===== MENÚ MÓVIL ===== */
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Cerrar al hacer clic en un enlace
    menu.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', e => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }


  /* ===== HEADER STICKY + ENLACE ACTIVO ===== */
  const header   = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    // Sombra al hacer scroll
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }

    // Resaltar el enlace de la sección visible
    const scrollMid = window.scrollY + window.innerHeight / 2;
    sections.forEach(sec => {
      const top    = sec.offsetTop - 90;
      const bottom = top + sec.offsetHeight;
      const id     = sec.getAttribute('id');
      const link   = document.querySelector(`.nav__link[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', scrollMid >= top && scrollMid < bottom);
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });


  /* ===== ANIMACIONES FADE-UP AL HACER SCROLL ===== */
  const fadeTargets = document.querySelectorAll(
    '.service-card, .why-card, .review-card, .gallery__item, ' +
    '.section__header, .vehicles__layout, .booking__layout, ' +
    '.trust-bar__list, .cta-final'
  );

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), idx * 70);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeTargets.forEach(el => {
      el.classList.add('fade-up');
      io.observe(el);
    });
  } else {
    // Fallback para navegadores sin soporte
    fadeTargets.forEach(el => el.classList.add('visible'));
  }


  /* ===== FECHA MÍNIMA EN FORMULARIO ===== */
  const dateInput = document.getElementById('date');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  /* ===== PICKER ABRE AL HACER CLIC EN CUALQUIER PARTE ===== */
  document.querySelectorAll('input[type="date"], input[type="time"]').forEach(input => {
    input.addEventListener('click', function () {
      try { this.showPicker(); } catch (_) { /* fallback nativo */ }
    });
    input.addEventListener('focus', function () {
      try { this.showPicker(); } catch (_) { /* fallback nativo */ }
    });
    /* Cursor de puntero para indicar que es clicable */
    input.style.cursor = 'pointer';
  });


  /* ===== FORMULARIO DE RESERVA ===== */
  const form       = document.getElementById('bookingForm');
  const submitBtn  = document.getElementById('submitBtn');

  const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzvhFOLdoQD-uMk0rMXjwPR2-XsNBXqQt_-EHAl8HHdtHMtOCToQCkADH7bKIS7m2UM/exec';

  if (form && submitBtn) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validación
      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          valid = false;
        }
      });
      if (!valid) {
        const firstInvalid = form.querySelector('[style*="ef4444"]');
        if (firstInvalid) firstInvalid.focus();
        showNotification('Por favor completa todos los campos obligatorios.', 'error');
        return;
      }

      // Recopilar datos del formulario
      const data = {
        nombre:    form.querySelector('[name="Nombre"]').value,
        email:     form.querySelector('[name="Correo"]').value,
        telefono:  form.querySelector('[name="Telefono"]').value,
        pasajeros: form.querySelector('[name="Pasajeros"]').value,
        origen:    form.querySelector('[name="Origen"]').value,
        destino:   form.querySelector('[name="Destino"]').value,
        fecha:     form.querySelector('[name="Fecha"]').value,
        hora:      form.querySelector('[name="Hora"]').value,
        mensaje:   form.querySelector('[name="Notas"]').value,
      };

      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled    = true;

      fetch(SHEET_URL, {
        method: 'POST',
        mode:   'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify(data),
      })
      .then(() => {
        submitBtn.textContent = 'Solicitar Cotización →';
        submitBtn.disabled    = false;
        form.reset();
        showModal();
      })
      .catch(() => {
        submitBtn.textContent = 'Solicitar Cotización →';
        submitBtn.disabled    = false;
        showNotification('Error al enviar. Por favor contáctanos por WhatsApp.', 'error');
      });
    });

    // Limpiar error al escribir
    form.querySelectorAll('[required]').forEach(field => {
      field.addEventListener('input', () => { field.style.borderColor = ''; });
    });
  }


  /* ===== MODAL DE CONFIRMACIÓN ===== */
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose   = document.getElementById('modalClose');

  function showModal() {
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });


  /* ===== NOTIFICACIONES TOAST ===== */
  function showNotification(msg, type) {
    const existing = document.querySelector('.toast-notify');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notify';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    const bg    = type === 'success' ? '#25d366' : '#ef4444';
    const icon  = type === 'success' ? '✅' : '⚠️';

    Object.assign(toast.style, {
      position:     'fixed',
      bottom:       '6rem',
      right:        '2rem',
      background:   bg,
      color:        '#fff',
      padding:      '1rem 1.5rem',
      borderRadius: '1rem',
      fontFamily:   "'Poppins', sans-serif",
      fontSize:     '.875rem',
      fontWeight:   '600',
      boxShadow:    '0 8px 30px rgba(0,0,0,.2)',
      zIndex:       '9999',
      maxWidth:     '340px',
      lineHeight:   '1.5',
      opacity:      '0',
      transform:    'translateY(10px)',
      transition:   'opacity .3s ease, transform .3s ease',
    });

    toast.textContent = `${icon} ${msg}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 350);
    }, 5000);
  }


  /* ===== CARRUSEL DE RESEÑAS ===== */
  const carousel   = document.getElementById('reviewsCarousel');
  const cTrack     = document.getElementById('carouselTrack');
  const cDots      = document.querySelectorAll('.carousel__dot');
  const cPrev      = document.getElementById('carouselPrev');
  const cNext      = document.getElementById('carouselNext');

  if (carousel && cTrack) {
    const slides = cTrack.querySelectorAll('.carousel__slide');
    let current  = 0;
    let timer;

    function goTo(idx) {
      current = (idx + slides.length) % slides.length;
      cTrack.style.transform = `translateX(-${current * 100}%)`;
      cDots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function startAuto() {
      timer = setInterval(() => goTo(current + 1), 5000);
    }
    function stopAuto() { clearInterval(timer); }

    cPrev.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
    cNext.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
    cDots.forEach(dot => dot.addEventListener('click', () => {
      stopAuto(); goTo(+dot.dataset.index); startAuto();
    }));

    // Swipe táctil
    let touchX = 0;
    cTrack.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    cTrack.addEventListener('touchend',   e => {
      const diff = touchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { stopAuto(); goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
    });

    startAuto();
  }


  /* ===== AVATAR TRIPADVISOR en reseñas ===== */
  document.querySelectorAll('.review-avatar').forEach(el => {
    el.innerHTML = '<img src="TripAdvisor.webp" alt="TripAdvisor" width="42" height="42" style="border-radius:50%;object-fit:cover;">';
  });


  /* ===== SMOOTH SCROLL para navegadores antiguos ===== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY
                  - parseInt(getComputedStyle(document.documentElement)
                    .getPropertyValue('--header-h') || '80');
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();
