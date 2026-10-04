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
  const serviceModal = document.querySelector('[data-service-modal]');
  const serviceModalContent = document.querySelector('[data-service-modal-content]');
  const serviceOpeners = document.querySelectorAll('[data-service-open]');
  const serviceCloseButtons = serviceModal ? serviceModal.querySelectorAll('[data-service-close]') : [];
  const videoModal = document.querySelector('[data-video-modal]');
  const videoModalContent = document.querySelector('[data-video-modal-content]');
  const videoOpeners = document.querySelectorAll('[data-video-open]');
  const videoCloseButtons = videoModal ? videoModal.querySelectorAll('[data-video-close]') : [];
  const videoCards = document.querySelectorAll('[data-video-card]');
  const heroMoreToggle = document.querySelector('[data-hero-more-toggle]');
  const heroMoreText = document.querySelector('[data-hero-more-text]');
  const heroTextDialog = document.querySelector('[data-hero-text-dialog]');
  const heroTextContent = document.querySelector('[data-hero-text-content]');
  const heroTextClose = document.querySelector('[data-hero-text-close]');

  let currentGalleryIndex = 0;
  let currentLightboxIndex = 0;
  let previousActiveElement = null;
  let previousServiceActiveElement = null;
  let previousVideoActiveElement = null;
  const getGalleryPageSize = () => (window.innerWidth <= 768 ? 1 : 5);

  const getGalleryMaxStartIndex = () => Math.max(0, galleryItems.length - getGalleryPageSize());

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

  if (heroMoreToggle && heroMoreText && heroTextDialog instanceof HTMLDialogElement && heroTextContent && heroTextClose) {
    const mobileHeroMedia = window.matchMedia('(max-width: 768px)');
    heroTextContent.textContent = heroMoreText.textContent;

    const syncHeroMoreState = () => {
      heroMoreText.hidden = mobileHeroMedia.matches;
      if (!mobileHeroMedia.matches && heroTextDialog.open) {
        heroTextDialog.close();
      }
    };

    syncHeroMoreState();

    heroMoreToggle.addEventListener('click', () => {
      heroTextDialog.showModal();
      body.classList.add('hero-text-open');
    });

    heroTextClose.addEventListener('click', () => heroTextDialog.close());
    heroTextDialog.addEventListener('click', (event) => {
      if (event.target !== heroTextDialog) return;
      const bounds = heroTextDialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        heroTextDialog.close();
      }
    });
    heroTextDialog.addEventListener('close', () => body.classList.remove('hero-text-open'));
    mobileHeroMedia.addEventListener('change', syncHeroMoreState);
  }

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

  const openServiceModal = (serviceId) => {
    if (!serviceModal || !serviceModalContent) return;

    const template = document.querySelector(`[data-service-template="${serviceId}"]`);
    if (!template) return;

    previousServiceActiveElement = document.activeElement;
    serviceModalContent.innerHTML = template.innerHTML;
    serviceModal.hidden = false;
    serviceModal.setAttribute('aria-hidden', 'false');
    body.classList.add('menu-open');
    serviceModal.querySelector('.service-modal__close')?.focus();
  };

  const closeServiceModal = () => {
    if (!serviceModal || !serviceModalContent) return;

    serviceModal.hidden = true;
    serviceModal.setAttribute('aria-hidden', 'true');
    serviceModalContent.innerHTML = '';
    body.classList.remove('menu-open');

    if (previousServiceActiveElement && typeof previousServiceActiveElement.focus === 'function') {
      previousServiceActiveElement.focus();
    }
  };

  serviceOpeners.forEach((button) => {
    button.addEventListener('click', () => {
      openServiceModal(button.dataset.serviceOpen || '');
    });
  });

  serviceCloseButtons.forEach((button) => {
    button.addEventListener('click', closeServiceModal);
  });

  if (serviceModal) {
    serviceModal.addEventListener('click', (event) => {
      if (event.target === serviceModal || event.target instanceof Element && event.target.hasAttribute('data-service-close')) {
        closeServiceModal();
      }
    });
  }

  const openVideoModal = (videoId) => {
    if (!videoModal || !videoModalContent) return;

    const template = document.querySelector(`[data-video-template="${videoId}"]`);
    if (!template) return;

    previousVideoActiveElement = document.activeElement;
    videoModalContent.innerHTML = template.innerHTML;
    videoModal.hidden = false;
    videoModal.setAttribute('aria-hidden', 'false');
    body.classList.add('menu-open');
    videoModal.querySelector('.video-modal__close')?.focus();
  };

  const closeVideoModal = () => {
    if (!videoModal || !videoModalContent) return;

    videoModal.hidden = true;
    videoModal.setAttribute('aria-hidden', 'true');
    videoModalContent.innerHTML = '';
    body.classList.remove('menu-open');

    if (previousVideoActiveElement && typeof previousVideoActiveElement.focus === 'function') {
      previousVideoActiveElement.focus();
    }
  };

  videoOpeners.forEach((button) => {
    button.addEventListener('click', () => {
      openVideoModal(button.dataset.videoOpen || '');
    });
  });

  videoCloseButtons.forEach((button) => {
    button.addEventListener('click', closeVideoModal);
  });

  if (videoModal) {
    videoModal.addEventListener('click', (event) => {
      if (event.target === videoModal || event.target instanceof Element && event.target.hasAttribute('data-video-close')) {
        closeVideoModal();
      }
    });
  }

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
    const trackPadding = galleryTrack ? parseFloat(getComputedStyle(galleryTrack).paddingLeft) || 0 : 0;
    return Math.max(0, targetItem.offsetLeft - trackPadding);
  };

  const getGalleryStartIndex = (index) => {
    const maxStartIndex = getGalleryMaxStartIndex();

    if (index < 0) {
      return maxStartIndex;
    }

    if (index > maxStartIndex) {
      return 0;
    }

    return index;
  };

  const setActiveGalleryItem = (index, immediate = false) => {
    const pageSize = getGalleryPageSize();
    const maxStartIndex = Math.max(0, galleryItems.length - pageSize);
    currentGalleryIndex = getGalleryStartIndex(index);
    updateGalleryCounter();

    if (galleryDots) {
      const dots = galleryDots.querySelectorAll('.gallery-dot');
      dots.forEach((dot, dotIndex) => {
        const active = dotIndex >= currentGalleryIndex && dotIndex < currentGalleryIndex + pageSize;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
    }

    if (galleryShell) {
      galleryShell.scrollTo({
        left: getGalleryTranslateX(currentGalleryIndex),
        behavior: immediate ? 'auto' : 'smooth',
      });
    }
  };

  const scrollGalleryTo = (index, immediate = false) => {
    if (!galleryTrack || !galleryItems.length) return;
    const targetIndex = getGalleryStartIndex(index);
    setActiveGalleryItem(targetIndex, immediate);
  };

  if (galleryTrack && galleryItems.length) {
    updateGalleryDots();
    scrollGalleryTo(0, true);

    const forceResetGallery = () => {
      currentGalleryIndex = 0;
      updateGalleryCounter();
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
      video.poster = card.dataset.videoPoster;
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
      if (heroTextDialog instanceof HTMLDialogElement && heroTextDialog.open) {
        event.preventDefault();
        heroTextDialog.close();
        return;
      }
      if (videoModal && !videoModal.hidden) {
        closeVideoModal();
        return;
      }
      if (serviceModal && !serviceModal.hidden) {
        closeServiceModal();
        return;
      }
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