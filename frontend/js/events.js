/**
 * KOSHISH — Events Page Logic
 * Tab switching, gallery fetch, lightbox viewer.
 */

let currentTab = 'udaan';
let galleryPhotos = [];
let currentLightboxIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadGallery('udaan');
  initLightbox();
});

/* ─── Tab Switching ─────────────────────────── */
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const event = tab.getAttribute('data-event');
      if (event === currentTab) return;

      currentTab = event;
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      loadGallery(event);
    });
  });
}

/* ─── Gallery Fetch ─────────────────────────── */
async function loadGallery(eventName) {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  // Show skeleton loaders
  grid.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    grid.innerHTML += `<div class="skeleton skeleton--image"></div>`;
  }

  try {
    const res = await koshishAPI(`/events?event=${eventName}`);
    galleryPhotos = res.data || [];

    if (galleryPhotos.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1;">
          <div class="empty-state">
            <div class="empty-state__icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
            </div>
            <p class="empty-state__text">No photos uploaded yet for this event.</p>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 8px;">Photos will appear here once the admin uploads them.</p>
          </div>
        </div>`;
      return;
    }

    grid.innerHTML = galleryPhotos
      .map(
        (photo, index) => `
        <div class="gallery-card animate-on-scroll" onclick="openLightbox(${index})">
          <img src="${photo.photo_url}" alt="${escapeAttr(photo.caption || 'Event photo')}" 
               onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23E5E7EB%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%236B7280%22 font-family=%22sans-serif%22%3EImage unavailable%3C/text%3E%3C/svg%3E'">
          ${photo.caption ? `<div class="gallery-card__caption">${escapeHTML(photo.caption)}</div>` : ''}
        </div>`
      )
      .join('');

    initScrollAnimations();
  } catch (err) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1;">
        <div class="empty-state">
          <div class="empty-state__icon">⚠️</div>
          <p class="empty-state__text">Could not load photos. Please try again later.</p>
        </div>
      </div>`;
    console.error('Failed to load gallery:', err.message);
  }
}

/* ─── Lightbox ──────────────────────────────── */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  // Close button
  lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);

  // Nav buttons
  lightbox.querySelector('.lightbox__prev').addEventListener('click', () => navigateLightbox(-1));
  lightbox.querySelector('.lightbox__next').addEventListener('click', () => navigateLightbox(1));

  // Close on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

function openLightbox(index) {
  if (!galleryPhotos.length) return;

  currentLightboxIndex = index;
  const lightbox = document.getElementById('lightbox');
  const img = lightbox.querySelector('.lightbox__image');
  const caption = lightbox.querySelector('.lightbox__caption');

  const photo = galleryPhotos[index];
  img.src = photo.photo_url;
  img.alt = photo.caption || 'Event photo';
  caption.textContent = photo.caption || '';
  caption.style.display = photo.caption ? 'block' : 'none';

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function navigateLightbox(direction) {
  currentLightboxIndex =
    (currentLightboxIndex + direction + galleryPhotos.length) % galleryPhotos.length;
  const lightbox = document.getElementById('lightbox');
  const img = lightbox.querySelector('.lightbox__image');
  const caption = lightbox.querySelector('.lightbox__caption');

  const photo = galleryPhotos[currentLightboxIndex];
  img.src = photo.photo_url;
  img.alt = photo.caption || 'Event photo';
  caption.textContent = photo.caption || '';
  caption.style.display = photo.caption ? 'block' : 'none';
}

/* ─── Helpers ───────────────────────────────── */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
