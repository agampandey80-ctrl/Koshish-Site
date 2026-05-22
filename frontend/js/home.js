/**
 * KOSHISH — Home Page Logic
 * Fetches notices, animates counters, loads event teasers & site content.
 */

document.addEventListener('DOMContentLoaded', () => {
  loadHeroContent();
  loadAboutContent();
  loadNotices();
  initCounterAnimation();
});

/* ─── Hero Content ──────────────────────────── */
async function loadHeroContent() {
  try {
    const res = await koshishAPI('/content');
    const content = res.data;

    const subtextEl = document.getElementById('hero-subtext');
    if (subtextEl && content.hero_tagline) {
      subtextEl.textContent = content.hero_tagline;
    }
  } catch (err) {
    console.warn('Could not load hero content:', err.message);
  }
}

/* ─── About Content (Mission / Vision) ──────── */
async function loadAboutContent() {
  try {
    const res = await koshishAPI('/content');
    const content = res.data;

    const missionEl = document.getElementById('mission-text');
    const visionEl = document.getElementById('vision-text');

    if (missionEl && content.mission) {
      missionEl.textContent = content.mission;
    }
    if (visionEl && content.vision) {
      visionEl.textContent = content.vision;
    }
  } catch (err) {
    console.warn('Could not load about content:', err.message);
  }
}

/* ─── Notices ───────────────────────────────── */
async function loadNotices() {
  const container = document.getElementById('notices-container');
  if (!container) return;

  // Show skeleton loaders
  container.innerHTML = createSkeletons(3, 'text');

  try {
    const res = await koshishAPI('/notices');
    const notices = res.data;

    if (!notices || notices.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📋</div>
          <p class="empty-state__text">No notices yet. Check back soon!</p>
        </div>`;
      return;
    }

    container.innerHTML = notices
      .map(
        (notice) => `
        <div class="notice-card animate-on-scroll">
          <h4 class="notice-card__title">${escapeHTML(notice.title)}</h4>
          <p class="notice-card__content">${escapeHTML(notice.content)}</p>
          <span class="notice-card__date">${formatDate(notice.created_at)}</span>
        </div>`
      )
      .join('');

    // Re-init scroll animation for dynamically added elements
    initScrollAnimations();
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <p class="empty-state__text">Could not load notices. Please try again later.</p>
      </div>`;
    console.error('Failed to load notices:', err.message);
  }
}

/* ─── Counter Animation ─────────────────────── */
function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  let animated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          animateCounters();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  const statsSection = document.getElementById('stats-section');
  if (statsSection) {
    observer.observe(statsSection);
  }
}

function animateCounters() {
  const counters = document.querySelectorAll('[data-target]');
  const duration = 2000; // ms

  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute('data-target'), 10);
    const suffix = counter.getAttribute('data-suffix') || '';
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      counter.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = target + suffix;
      }
    }

    requestAnimationFrame(update);
  });
}

/* ─── HTML Escaping ─────────────────────────── */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
