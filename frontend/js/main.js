/**
 * KOSHISH — Shared Utilities
 * API helper, navbar, toasts, skeleton loaders, scroll animations.
 * Every other page JS file imports functions from here.
 */

/* ─── Configuration ─────────────────────────── */
const API_BASE = window.location.origin + '/api';
let USE_MOCK = false; // Auto-detected on first API call

/* ─── Mock Data Store ───────────────────────── */
const MOCK_DATA = {
  content: {
    hero_tagline: 'Shaping futures, one lesson at a time',
    mission: 'To provide free, quality education to underprivileged children from Kindergarten to Class 12, guided by passionate college student mentors and faculty, empowering every learner to achieve their full potential.',
    vision: 'A world where every child has access to quality education regardless of their socio-economic background — where knowledge flows freely and opportunity knows no barriers.',
  },
  notices: [
    {
      id: '1',
      title: 'Welcome to Koshish!',
      content: 'We are a community of college students dedicated to providing free education to underprivileged children. Join us in making a difference!',
      is_active: true,
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      title: 'Class Schedule Update',
      content: 'New class timings: Weekdays 4 PM – 6 PM, Weekends 10 AM – 1 PM. All mentors please update your availability.',
      is_active: true,
      created_at: '2025-02-01T10:00:00Z',
    },
    {
      id: '3',
      title: 'Udaan 2025 Announced!',
      content: 'Our annual technical fest "Udaan" is scheduled for March 2025. Registrations open soon. Stay tuned for exciting events and workshops!',
      is_active: true,
      created_at: '2025-02-20T10:00:00Z',
    },
  ],
  team: [
    { id: '1', name: 'Dr. Ananya Sharma', role: 'Faculty Advisor', year: 'faculty', photo_url: null, display_order: 1 },
    { id: '2', name: 'Dr. Rajesh Kumar', role: 'Faculty Coordinator', year: 'faculty', photo_url: null, display_order: 2 },
    { id: '3', name: 'Rahul Verma', role: 'President', year: '4th', photo_url: null, display_order: 1 },
    { id: '4', name: 'Meera Joshi', role: 'Vice President', year: '4th', photo_url: null, display_order: 2 },
    { id: '5', name: 'Aditya Kapoor', role: 'Technical Lead', year: '4th', photo_url: null, display_order: 3 },
    { id: '6', name: 'Priya Singh', role: 'Senior Mentor Lead', year: '3rd', photo_url: null, display_order: 1 },
    { id: '7', name: 'Vikram Reddy', role: 'Events Coordinator', year: '3rd', photo_url: null, display_order: 2 },
    { id: '8', name: 'Neha Agarwal', role: 'Outreach Lead', year: '3rd', photo_url: null, display_order: 3 },
    { id: '9', name: 'Arjun Patel', role: 'Mentor Lead', year: '2nd', photo_url: null, display_order: 1 },
    { id: '10', name: 'Kavya Nair', role: 'Content Head', year: '2nd', photo_url: null, display_order: 2 },
    { id: '11', name: 'Rohan Mehta', role: 'Mentor', year: '2nd', photo_url: null, display_order: 3 },
    { id: '12', name: 'Anisha Das', role: 'Mentor', year: '2nd', photo_url: null, display_order: 4 },
    { id: '13', name: 'Sneha Gupta', role: 'Junior Mentor', year: '1st', photo_url: null, display_order: 1 },
    { id: '14', name: 'Amit Sharma', role: 'Junior Mentor', year: '1st', photo_url: null, display_order: 2 },
    { id: '15', name: 'Pooja Yadav', role: 'Junior Mentor', year: '1st', photo_url: null, display_order: 3 },
    { id: '16', name: 'Karan Singh', role: 'Junior Mentor', year: '1st', photo_url: null, display_order: 4 },
  ],
  events_udaan: [],
  events_abhyuday: [],
};

/* ─── API Helper ────────────────────────────── */
/**
 * Centralized fetch wrapper.
 * Automatically attaches base URL and Bearer token if present.
 * Falls back to mock data when the backend is unreachable.
 */
async function koshishAPI(path, options = {}) {
  // If already in mock mode for GET requests, return mock data immediately
  if (USE_MOCK && (!options.method || options.method === 'GET')) {
    return getMockResponse(path);
  }

  const url = `${API_BASE}${path}`;
  const token = sessionStorage.getItem('koshish_token');

  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const res = await fetch(url, { ...options, headers, body, signal: controller.signal });
    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    // If it's a network error (backend offline), switch to mock mode
    if (err.name === 'AbortError' || err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
      if (!USE_MOCK) {
        USE_MOCK = true;
        console.info('📋 Backend not available — using demo data');
      }
      if (!options.method || options.method === 'GET') {
        return getMockResponse(path);
      }
    }
    throw err;
  }
}

/**
 * Return mock data matching the API path.
 */
function getMockResponse(path) {
  if (path === '/content') {
    return { success: true, data: MOCK_DATA.content };
  }
  if (path === '/notices') {
    return { success: true, data: [...MOCK_DATA.notices].reverse() };
  }
  if (path === '/team') {
    return { success: true, data: MOCK_DATA.team };
  }
  if (path.startsWith('/events')) {
    const params = new URLSearchParams(path.split('?')[1] || '');
    const event = params.get('event');
    if (event === 'abhyuday') {
      return { success: true, data: MOCK_DATA.events_abhyuday };
    }
    return { success: true, data: MOCK_DATA.events_udaan };
  }
  if (path === '/auth/verify') {
    throw new Error('Mock mode — no auth');
  }
  return { success: true, data: {} };
}

/* ─── Toast Notifications ───────────────────── */
function getToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'} type
 * @param {number} duration - ms before auto-dismiss (default 3000)
 */
function showToast(message, type = 'success', duration = 3000) {
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
  };

  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast--hide');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ─── Skeleton Loaders ──────────────────────── */
function createSkeletons(count, type = 'card') {
  let html = '';
  for (let i = 0; i < count; i++) {
    switch (type) {
      case 'card':
        html += `
          <div class="skeleton--card skeleton" style="padding: 24px;">
            <div class="skeleton skeleton--title"></div>
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text-sm"></div>
          </div>`;
        break;
      case 'text':
        html += `
          <div style="margin-bottom: 16px;">
            <div class="skeleton skeleton--title"></div>
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text-sm"></div>
          </div>`;
        break;
      case 'image':
        html += `<div class="skeleton skeleton--image"></div>`;
        break;
    }
  }
  return html;
}

/* ─── Navbar ────────────────────────────────── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.navbar__hamburger');
  const drawer = document.querySelector('.mobile-drawer');
  const closeBtn = document.querySelector('.mobile-drawer__close');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    });
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }

  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      drawer.classList.toggle('open');
      document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        hamburger.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    }

    drawer.querySelectorAll('.mobile-drawer__link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ─── Scroll Animations (IntersectionObserver) ── */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ─── Set Active Nav Link ───────────────────── */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link, .mobile-drawer__link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ─── Image Error Fallback ──────────────────── */
function handleImageError(img, name) {
  img.onerror = null;
  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const fallback = document.createElement('div');
  fallback.className = 'team-card__initials';
  fallback.textContent = initials;
  img.replaceWith(fallback);
}

/* ─── Format Date ───────────────────────────── */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/* ─── DOM Ready ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  setActiveNavLink();
  initScrollAnimations();
});
