// ========================================
// KIMS HOME DEVELOP - MAIN APPLICATION
// Single Page Application Router
// ========================================

import { pages } from './pages.js?v=29';

// Configuration
const CRM_URL = 'https://script.google.com/macros/s/AKfycbwLLAme5ipRmnylP-Gk0depMKMJlLFG2U1LSbNAAsJWbKTNBpzDqmStw5BJmjZKmmMWZA/exec';

// Router
class Router {
  constructor() {
    this.routes = pages;
    this.init();
  }

  init() {
    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-link]')) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        this.navigateTo(href);
      }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.loadPage(window.location.pathname);
    });

    // Load initial page
    this.loadPage(window.location.pathname);

    // Mobile menu toggle
    this.initMobileMenu();

    // Sticky header on scroll
    this.initStickyHeader();
  }

  navigateTo(url) {
    history.pushState(null, null, url);
    this.loadPage(url);
    window.scrollTo(0, 0);

    // Close mobile menu if open
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.remove('active');
  }

  loadPage(path) {
    const app = document.getElementById('app');
    const page = this.routes[path] || this.routes['/404'];

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === path) {
        link.classList.add('active');
      }
    });

    // Update page title and meta
    if (page.title) {
      document.title = page.title;
    }
    if (page.description) {
      document.querySelector('meta[name="description"]').setAttribute('content', page.description);
    }

    // Render page content
    app.innerHTML = page.content;

    // Initialize page-specific functionality
    this.initPageFeatures();
  }

  initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const menu = document.getElementById('navMenu');

    toggle.addEventListener('click', () => {
      menu.classList.toggle('active');
    });
  }

  initStickyHeader() {
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.style.boxShadow = 'var(--shadow-md)';
      } else {
        header.style.boxShadow = 'var(--shadow-sm)';
      }

      lastScroll = currentScroll;
    });
  }

  initPageFeatures() {
    try {
      this.initTabs();
      this.initAccordion();
      this.initLightbox();
      this.initMultiStepForm();
      this.initFilterChips();
      this.initUniversalFormHandler();
    } catch (err) {
      console.error('Error during feature initialization:', err);
    }
  }

  initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabGroup = button.closest('.tabs');
        const targetId = button.getAttribute('data-tab');

        // Remove active from all buttons and contents in this group
        tabGroup.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        tabGroup.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active to clicked button and target content
        button.classList.add('active');
        tabGroup.querySelector(`#${targetId}`).classList.add('active');
      });
    });
  }

  initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const item = header.parentElement;
        const content = item.querySelector('.accordion-content');
        const isActive = header.classList.contains('active');

        // Close all accordions
        document.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('active'));
        document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('active'));

        // Open clicked accordion if it wasn't active
        if (!isActive) {
          header.classList.add('active');
          content.classList.add('active');
        }
      });
    });
  }

  initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length === 0) return;

    galleryItems.forEach(item => {
      const img = item.querySelector('img');
      const skeleton = item.querySelector('.skeleton');

      if (img) {
        const hideSkeleton = () => {
          if (skeleton) {
            skeleton.classList.add('hidden');
            // Remove skeleton from DOM after fade out to be double sure
            setTimeout(() => { if (skeleton.parentNode) skeleton.remove(); }, 600);
          }
        };

        // If image is already complete (cached)
        if (img.complete && img.naturalHeight !== 0) {
          hideSkeleton();
        } else {
          img.addEventListener('load', hideSkeleton);
          // Fallback: hide skeleton after 3 seconds even if load event fails
          setTimeout(hideSkeleton, 3000);
        }

        img.addEventListener('error', hideSkeleton);
      } else {
        // No image in this item (maybe a placeholder)
        const skeleton = item.querySelector('.skeleton');
        if (skeleton) skeleton.remove();
      }

      // Open Lightbox on click (only if it's not a placeholder)
      item.addEventListener('click', () => {
        if (!item.querySelector('.placeholder-coming-soon')) {
          this.openLightbox(item);
        }
      });
    });
  }

  openLightbox(activeItem) {
    // Only target items that have images and are visible
    const items = Array.from(document.querySelectorAll('.gallery-item'))
      .filter(item => item.style.display !== 'none' && !item.querySelector('.placeholder-coming-soon'));

    let currentIndex = items.indexOf(activeItem);

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    document.body.appendChild(lightbox);

    // Add brief delay for fade-in
    setTimeout(() => lightbox.classList.add('active'), 10);

    const updateLightbox = () => {
      const item = items[currentIndex];
      const img = item.querySelector('img');
      const title = img.getAttribute('data-gallery-title') || 'Project View';
      const category = img.getAttribute('data-gallery-category') || '';

      lightbox.innerHTML = `
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close">&times;</button>
          <img src="${img.src}" alt="${title}" class="lightbox-image">
          <div class="lightbox-info">
            <div class="lightbox-title">${title}</div>
            <div class="lightbox-counter">${currentIndex + 1} / ${items.length} &mdash; ${category}</div>
          </div>
          <div class="lightbox-nav">
            <button class="lightbox-btn prev-btn" aria-label="Previous">❮</button>
            <button class="lightbox-btn next-btn" aria-label="Next">❯</button>
          </div>
        </div>
      `;

      // Event Listeners for Nav
      lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
        lightbox.classList.remove('active');
        setTimeout(() => lightbox.remove(), 400);
      });

      lightbox.querySelector('.prev-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateLightbox();
      });

      lightbox.querySelector('.next-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % items.length;
        updateLightbox();
      });

      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          lightbox.querySelector('.lightbox-close').click();
        }
      });
    };

    updateLightbox();

    // Keyboard support
    const handleKeydown = (e) => {
      if (e.key === 'Escape') lightbox.querySelector('.lightbox-close').click();
      if (e.key === 'ArrowLeft') lightbox.querySelector('.prev-btn').click();
      if (e.key === 'ArrowRight') lightbox.querySelector('.next-btn').click();
    };

    document.addEventListener('keydown', handleKeydown);

    // Clean up key listener when modal is removed
    const observer = new MutationObserver((mutations) => {
      if (!document.body.contains(lightbox)) {
        document.removeEventListener('keydown', handleKeydown);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true });
  }

  initMultiStepForm() {
    const form = document.querySelector('.multi-step-form');
    if (!form) {
      console.log('Multi-step form not found on this page');
      return;
    }

    console.log('Initializing Multi-step Form features...');
    const steps = form.querySelectorAll('.form-step');
    const nextBtns = form.querySelectorAll('.btn-next');
    const prevBtns = form.querySelectorAll('.btn-prev');
    const progress = form.querySelector('.form-progress-bar');
    let currentStep = 0;

    const showStep = (n) => {
      steps.forEach((step, index) => {
        step.style.display = index === n ? 'block' : 'none';
      });
      if (progress) {
        progress.style.width = `${((n + 1) / steps.length) * 100}%`;
      }
    };

    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep < steps.length - 1) {
          currentStep++;
          showStep(currentStep);
        }
      });
    });

    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep > 0) {
          currentStep--;
          showStep(currentStep);
        }
      });
    });
    showStep(currentStep);
  }

  initUniversalFormHandler() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e, 'Multi-step Contact Form'));
    }

    const quickForm = document.getElementById('quickContactForm');
    if (quickForm) {
      quickForm.addEventListener('submit', (e) => this.handleFormSubmit(e, 'Quick Contact Form'));
    }
  }

  async handleFormSubmit(e, source) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    const originalBtnText = submitBtn.innerText;

    if (!CRM_URL) {
      alert('CRM_URL is not configured.');
      return;
    }

    const formData = new FormData(form);
    const data = { source: source };
    formData.forEach((value, key) => { data[key] = value; });

    try {
      submitBtn.innerText = 'Sending...';
      submitBtn.disabled = true;

      await fetch(CRM_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      });

      form.innerHTML = `
        <div class="text-center" style="padding: 2rem 0;">
          <div style="font-size: 3rem; color: var(--accent-gold); margin-bottom: 1rem;">✓</div>
          <h3>Thank You!</h3>
          <p>Your message has been sent successfully. We will contact you shortly.</p>
          <button type="button" class="btn btn-outline mt-lg" onclick="location.reload()">Send Another Message</button>
        </div>
      `;
    } catch (error) {
      alert('Error sending message. Please try again.');
      submitBtn.innerText = originalBtnText;
      submitBtn.disabled = false;
    }
  }

  initFilterChips() {
    const filterChips = document.querySelectorAll('.filter-chip');
    const filterItems = document.querySelectorAll('.filter-item');

    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const filter = chip.getAttribute('data-filter');

        // Toggle active state
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        // Filter items
        filterItems.forEach(item => {
          const categories = (item.getAttribute('data-category') || '').split(' ');
          if (filter === 'all' || categories.includes(filter)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }
}

// Global error logging to help debug in local environment
window.onerror = function (msg, url, line, col, error) {
  const errorMsg = `Error: ${msg}\nLine: ${line}\nColumn: ${col}\nURL: ${url}`;
  console.log('%c [SYSTEM ERROR] ', 'background: #ff0000; color: #fff', errorMsg);
  return false;
};

// Initialize app
const app = new Router();
