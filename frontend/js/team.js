/**
 * KOSHISH — Team Page Logic
 * Tiered team member rendering with scroll animations.
 */

const TIER_CONFIG = {
  faculty: { label: 'Faculty & Advisors', gridClass: 'team-grid--featured', featured: true },
  '4th': { label: 'Core Committee — 4th Year', gridClass: 'team-grid--3col', featured: false },
  '3rd': { label: 'Senior Mentors — 3rd Year', gridClass: 'team-grid--4col', featured: false },
  '2nd': { label: 'Mentors — 2nd Year', gridClass: 'team-grid--4col', featured: false },
  '1st': { label: 'Junior Mentors — 1st Year', gridClass: 'team-grid--4col', featured: false },
};

const YEAR_ORDER = ['faculty', '4th', '3rd', '2nd', '1st'];

document.addEventListener('DOMContentLoaded', () => {
  loadTeam();
});

/* ─── Load Team ─────────────────────────────── */
async function loadTeam() {
  const container = document.getElementById('team-container');
  if (!container) return;

  // Skeleton loader
  container.innerHTML = `
    <div style="padding: 40px 0;">
      ${createSkeletons(4, 'card')}
    </div>`;

  try {
    const res = await koshishAPI('/team');
    const members = res.data || [];

    if (members.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 80px 24px;">
          <div class="empty-state__icon">👥</div>
          <p class="empty-state__text">No team members yet.</p>
        </div>`;
      return;
    }

    // Group by year
    const grouped = {};
    members.forEach((m) => {
      if (!grouped[m.year]) grouped[m.year] = [];
      grouped[m.year].push(m);
    });

    let html = '';
    const LIMIT = 12;

    YEAR_ORDER.forEach((year) => {
      if (!grouped[year] || grouped[year].length === 0) return;

      const config = TIER_CONFIG[year];
      const allMembers = grouped[year];

      let membersHTML = '';
      let collapsedHTML = '';
      let toggleButtonHTML = '';

      if (allMembers.length > LIMIT) {
        // Show first LIMIT members
        membersHTML = allMembers
          .slice(0, LIMIT)
          .map((member, index) => renderMemberCard(member, config.featured, index))
          .join('');

        // Put the rest in a collapsed grid container
        const collapsedMembersHTML = allMembers
          .slice(LIMIT)
          .map((member, index) => renderMemberCard(member, config.featured, index + LIMIT))
          .join('');

        collapsedHTML = `
          <div class="${config.gridClass} team-grid--collapsed" style="margin-top: 24px;">
            ${collapsedMembersHTML}
          </div>
        `;

        toggleButtonHTML = `
          <div class="team-tier__toggle-container" style="text-align: center; margin-top: 32px;">
            <button class="btn btn--secondary team-tier__toggle-btn" data-year="${year}">
              Show All (${allMembers.length} Members)
            </button>
          </div>
        `;
      } else {
        membersHTML = allMembers
          .map((member, index) => renderMemberCard(member, config.featured, index))
          .join('');
      }

      html += `
        <div class="team-tier animate-on-scroll" id="tier-${year}">
          <h3 class="team-tier__heading">
            <span>${config.label}</span>
          </h3>
          <div class="team-tier__divider"></div>
          <div class="${config.gridClass}">
            ${membersHTML}
          </div>
          ${collapsedHTML}
          ${toggleButtonHTML}
        </div>`;
    });

    container.innerHTML = html;
    initScrollAnimations();

    // Bind click events to the toggle buttons
    container.querySelectorAll('.team-tier__toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const year = btn.getAttribute('data-year');
        const tierEl = document.getElementById(`tier-${year}`);
        if (!tierEl) return;

        const collapsedGrid = tierEl.querySelector('.team-grid--collapsed');
        if (!collapsedGrid) return;

        const isOpen = collapsedGrid.classList.toggle('open');
        const count = grouped[year].length;

        if (isOpen) {
          btn.textContent = 'Show Less';
          // Mark all elements inside the collapsed grid as visible immediately
          collapsedGrid.querySelectorAll('.animate-on-scroll').forEach((el) => {
            el.classList.add('visible');
          });
        } else {
          btn.textContent = `Show All (${count} Members)`;
          // Scroll back to the top of this tier
          tierEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 80px 24px;">
        <div class="empty-state__icon">⚠️</div>
        <p class="empty-state__text">Could not load team data. Please try again later.</p>
      </div>`;
    console.error('Failed to load team:', err.message);
  }
}

/* ─── Render Member Card ────────────────────── */
function renderMemberCard(member, featured, index) {
  const initials = member.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const staggerClass = `stagger-${(index % 5) + 1}`;

  const avatarHTML = member.photo_url
    ? `<img class="team-card__avatar" src="${member.photo_url}" alt="${escapeAttr(member.name)}" loading="lazy" onerror="handleImageError(this, '${escapeAttr(member.name)}')">`
    : `<div class="team-card__initials">${initials}</div>`;

  const yearLabels = {
    faculty: 'Faculty',
    '4th': '4th Year',
    '3rd': '3rd Year',
    '2nd': '2nd Year',
    '1st': '1st Year',
  };

  if (featured) {
    return `
      <div class="team-card team-card--featured animate-on-scroll ${staggerClass}">
        ${avatarHTML}
        <div>
          <h4 class="team-card__name">${escapeHTML(member.name)}</h4>
          <p class="team-card__role">${escapeHTML(member.role)}</p>
          <span class="team-card__year-badge">${yearLabels[member.year]}</span>
          <p class="team-card__bio">Guiding the Koshish community with expertise and dedication.</p>
        </div>
      </div>`;
  }

  return `
    <div class="team-card animate-on-scroll ${staggerClass}">
      ${avatarHTML}
      <h4 class="team-card__name">${escapeHTML(member.name)}</h4>
      <p class="team-card__role">${escapeHTML(member.role)}</p>
      <span class="team-card__year-badge">${yearLabels[member.year]}</span>
    </div>`;
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
