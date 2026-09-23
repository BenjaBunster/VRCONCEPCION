document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const body = document.body;
  const header = document.querySelector('[data-header]');
  const heroSection = document.querySelector('#inicio');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const mobileMenuLinks = mobileMenu ? mobileMenu.querySelectorAll('a[href^="#"]') : [];
  const revealItems = document.querySelectorAll('.reveal');
  const galleryTrack = document.querySelector('[data-gallery-track]');
  const galleryShell = document.querySelector('.gallery-shell');
  const galleryItems = Array.from(document.querySelectorAll('[data-gallery-item]'));
  const galleryCounter = document.querySelector('[data-gallery-counter]');
  const galleryDots = document.querySelector('[data-gallery-dots]');
  const galleryPrev = document.querySelector('[data-gallery-prev]');
  const galleryNext = document.querySelector('[data-gallery-next]');
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = document.querySelector('[data-lightbox-image]');
  const lightboxCaption = document.querySelector('[data-lightbox-caption]');
  const lightboxOpeners = document.querySelectorAll('[data-lightbox-open]');
  const lightboxClose = document.querySelector('[data-lightbox-close]');
  const lightboxPrev = document.querySelector('[data-lightbox-prev]');
  const lightboxNext = document.querySelector('[data-lightbox-next]');
  const videoCards = document.querySelectorAll('[data-video-card]');

  let currentGalleryIndex = 0;
  let currentLightboxIndex = 0;
  let previousActiveElement = null;

  const getGalleryPageSize = () => (window.innerWidth <= 768 ? 1 : 5);

  const setHeaderTheme = () => {
    if (!header || !heroSection) return;
    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    const isDark = window.scrollY < heroBottom - window.innerHeight * 0.55;
    header.classList.toggle('is-dark', isDark);
    header.classList.toggle('is-light', !isDark);
  };

  const closeMobileMenu = () => {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.hidden = true;
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  };

  const openMobileMenu = () => {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.hidden = false;
    menuToggle.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    body.classList.add('menu-open');
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    mobileMenu.addEventListener('click', (event) => {
      if (event.target === mobileMenu) {
        closeMobileMenu();
      }
    });

    mobileMenuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealItems.forEach((item) => revealObserver.observe(item));

  const updateGalleryCounter = () => {
    if (galleryCounter) {
      galleryCounter.textContent = `${Math.min(currentGalleryIndex + 1, galleryItems.length)} / ${galleryItems.length}`;
    }
  };

  const updateGalleryDots = () => {
    if (!galleryDots) return;
    galleryDots.innerHTML = '';

    galleryItems.forEach((item, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-dot';
      dot.setAttribute('aria-label', `Ir a la fotografía ${index + 1}`);
      dot.addEventListener('click', () => scrollGalleryTo(index));
      galleryDots.appendChild(dot);
    });
  };

  const getGalleryTranslateX = (index) => {
    if (!galleryItems.length) return 0;

    const targetItem = galleryItems[Math.max(0, Math.min(index, galleryItems.length - 1))];
    return -(targetItem.offsetLeft);
  };

  const setActiveGalleryItem = (index, immediate = false) => {
    const pageSize = getGalleryPageSize();
    const maxStartIndex = Math.max(0, galleryItems.length - pageSize);
    currentGalleryIndex = Math.max(0, Math.min(index, maxStartIndex));
    updateGalleryCounter();

    if (galleryDots) {
      const dots = galleryDots.querySelectorAll('.gallery-dot');
      dots.forEach((dot, dotIndex) => {
        const active = dotIndex >= currentGalleryIndex && dotIndex < currentGalleryIndex + pageSize;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
    }

    if (galleryTrack) {
      galleryTrack.style.transition = immediate ? 'none' : 'transform 320ms ease';
      galleryTrack.style.transform = `translateX(${getGalleryTranslateX(currentGalleryIndex)}px)`;
    }
  };

  const scrollGalleryTo = (index, immediate = false) => {
    if (!galleryTrack || !galleryItems.length) return;
    const pageSize = getGalleryPageSize();
    const maxStartIndex = Math.max(0, galleryItems.length - pageSize);
    const targetIndex = Math.max(0, Math.min(index, maxStartIndex));
    setActiveGalleryItem(targetIndex, immediate);
  };

  if (galleryTrack && galleryItems.length) {
    updateGalleryDots();
    scrollGalleryTo(0, true);

    const forceResetGallery = () => {
      galleryTrack.style.transition = 'none';
      galleryTrack.style.transform = 'translateX(0px)';
      setActiveGalleryItem(0, true);
    };

    if (galleryPrev) {
      galleryPrev.addEventListener('click', () => scrollGalleryTo(currentGalleryIndex - getGalleryPageSize()));
    }

    if (galleryNext) {
      galleryNext.addEventListener('click', () => scrollGalleryTo(currentGalleryIndex + getGalleryPageSize()));
    }

    window.requestAnimationFrame(() => {
      forceResetGallery();
      window.requestAnimationFrame(forceResetGallery);
    });

    window.setTimeout(forceResetGallery, 0);
    window.addEventListener('pageshow', forceResetGallery);

    window.addEventListener('resize', () => {
      scrollGalleryTo(currentGalleryIndex, true);
    });

    window.addEventListener('load', forceResetGallery, { once: true });
  }

  const openLightbox = (index) => {
    if (!lightbox || !lightboxImage || !lightboxCaption || !galleryItems.length) return;

    previousActiveElement = document.activeElement;
    currentLightboxIndex = (index + galleryItems.length) % galleryItems.length;

    const opener = lightboxOpeners[currentLightboxIndex];
    const src = opener ? opener.dataset.fullSrc : '';
    const caption = opener ? opener.dataset.caption || '' : '';

    lightboxImage.src = src;
    lightboxImage.alt = caption || 'Fotografía ampliada de VR Concepción';
    lightboxCaption.textContent = caption;
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    body.classList.add('menu-open');
    lightboxClose?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxImage) return;
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.removeAttribute('src');
    body.classList.remove('menu-open');
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  };

  const moveLightbox = (direction) => {
    if (!galleryItems.length) return;
    openLightbox(currentLightboxIndex + direction);
  };

  lightboxOpeners.forEach((button, index) => {
    button.addEventListener('click', () => openLightbox(index));
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => moveLightbox(-1));
  lightboxNext?.addEventListener('click', () => moveLightbox(1));

  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  const loadOptionalVideo = async (card) => {
    const source = card.dataset.videoSrc;
    const label = card.dataset.videoLabel || 'video';

    if (window.location.protocol === 'file:') {
      return;
    }

    try {
      const response = await fetch(source, { method: 'HEAD', cache: 'no-store' });
      if (!response.ok) {
        return;
      }

      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-label', label);
      video.src = source;

      card.replaceChildren(video);
    } catch {
      return;
    }
  };

  videoCards.forEach((card) => {
    loadOptionalVideo(card);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (lightbox && !lightbox.hidden) {
        closeLightbox();
      }
      if (menuToggle && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMobileMenu();
      }
    }

    if (lightbox && !lightbox.hidden) {
      if (event.key === 'ArrowLeft') {
        moveLightbox(-1);
      }
      if (event.key === 'ArrowRight') {
        moveLightbox(1);
      }
    }
  });

  window.addEventListener('scroll', setHeaderTheme, { passive: true });
  window.addEventListener('resize', setHeaderTheme);
  setHeaderTheme();
});