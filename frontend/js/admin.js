/**
 * KOSHISH — Admin Dashboard Logic
 * Login, JWT session, dashboard CRUD, file upload with progress.
 */

let currentSection = 'notices';

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

/* ═══════════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════════ */

function checkAuth() {
  const token = sessionStorage.getItem('koshish_token');
  const loginScreen = document.getElementById('login-screen');
  const dashboard = document.getElementById('dashboard');

  if (token) {
    // Verify token is still valid
    koshishAPI('/auth/verify')
      .then(() => {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'flex';
        loadDashboard();
      })
      .catch(() => {
        sessionStorage.removeItem('koshish_token');
        loginScreen.style.display = 'flex';
        dashboard.style.display = 'none';
      });
  } else {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
  }
}

function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = form.querySelector('button[type="submit"]');

    if (!email || !password) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Logging in...';

    try {
      const res = await koshishAPI('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      sessionStorage.setItem('koshish_token', res.data.token);
      showToast('Welcome back!', 'success');
      checkAuth();
    } catch (err) {
      showToast(err.message || 'Login failed.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Login';
    }
  });
}

// Initialize login form
document.addEventListener('DOMContentLoaded', initLoginForm);

function logout() {
  sessionStorage.removeItem('koshish_token');
  showToast('Logged out successfully.', 'success');
  checkAuth();
}

/* ═══════════════════════════════════════════════
   DASHBOARD NAVIGATION
   ═══════════════════════════════════════════════ */

function loadDashboard() {
  initSidebarNav();
  initSidebarToggle();
  switchSection('notices');
}

function initSidebarNav() {
  document.querySelectorAll('.admin-sidebar__link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      switchSection(section);

      // Close mobile sidebar
      document.querySelector('.admin-sidebar')?.classList.remove('open');
    });
  });
}

function initSidebarToggle() {
  const toggle = document.querySelector('.admin-sidebar-toggle');
  const sidebar = document.querySelector('.admin-sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

function switchSection(section) {
  currentSection = section;

  // Update sidebar active state
  document.querySelectorAll('.admin-sidebar__link').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('data-section') === section);
  });

  // Show/hide sections
  document.querySelectorAll('.admin-section').forEach((sec) => {
    sec.classList.toggle('active', sec.id === `section-${section}`);
  });

  // Load section data
  switch (section) {
    case 'notes':
      loadAdminNotes();
      break;
    case 'notices':
      loadAdminNotices();
      break;
    case 'events':
      loadAdminEvents();
      break;
    case 'team':
      loadAdminTeam();
      break;
    case 'content':
      loadAdminContent();
      break;
  }
}

/* ═══════════════════════════════════════════════
   NOTES CRUD
   ═══════════════════════════════════════════════ */

async function loadAdminNotes() {
  const list = document.getElementById('admin-notes-list');
  if (!list) return;

  list.innerHTML = createSkeletons(3, 'text');

  try {
    const res = await koshishAPI('/notes');
    const notes = res.data || [];

    if (notes.length === 0) {
      list.innerHTML = '<p style="color: var(--text-muted); padding: 16px;">No notes uploaded yet.</p>';
      return;
    }

    list.innerHTML = notes
      .map(
        (n) => `
        <div class="admin-list-item" data-id="${n.id}">
          <div class="admin-list-item__info">
            <h4>${escapeHTML(n.class_name)} - ${escapeHTML(n.subject)}</h4>
            <p><a href="${escapeAttr(n.pdf_url)}" target="_blank">${escapeHTML(n.pdf_url)}</a></p>
          </div>
          <div class="admin-list-item__actions">
            <button class="btn btn--danger btn--small" onclick="deleteAdminNote('${n.id}')">Delete</button>
          </div>
        </div>`
      )
      .join('');
  } catch (err) {
    list.innerHTML = '<p style="color: var(--error);">Failed to load notes.</p>';
  }
}

async function saveAdminNote(e) {
  e.preventDefault();
  const className = document.getElementById('note-class').value;
  const subject = document.getElementById('note-subject').value.trim();
  const pdfUrl = document.getElementById('note-url').value.trim();

  if (!className || !subject || !pdfUrl) {
    showToast('Class, subject, and URL are required.', 'error');
    return;
  }

  try {
    await koshishAPI('/notes', {
      method: 'POST',
      body: { class_name: className, subject: subject, pdf_url: pdfUrl },
    });

    showToast('Note added/updated successfully!', 'success');
    document.getElementById('note-subject').value = '';
    document.getElementById('note-url').value = '';
    loadAdminNotes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteAdminNote(id) {
  if (!confirm('Delete this note link?')) return;

  try {
    await koshishAPI(`/notes/${id}`, { method: 'DELETE' });
    showToast('Note deleted.', 'success');
    loadAdminNotes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ═══════════════════════════════════════════════
   NOTICES CRUD
   ═══════════════════════════════════════════════ */

async function loadAdminNotices() {
  const list = document.getElementById('admin-notices-list');
  if (!list) return;

  list.innerHTML = createSkeletons(3, 'text');

  try {
    const res = await koshishAPI('/notices');
    const notices = res.data || [];

    if (notices.length === 0) {
      list.innerHTML = '<p style="color: var(--text-muted); padding: 16px;">No notices yet. Add one below!</p>';
      return;
    }

    list.innerHTML = notices
      .map(
        (n) => `
        <div class="admin-list-item" data-id="${n.id}">
          <div class="admin-list-item__info">
            <h4>${escapeHTML(n.title)}</h4>
            <p>${escapeHTML(n.content).substring(0, 100)}${n.content.length > 100 ? '...' : ''}</p>
          </div>
          <div class="admin-list-item__actions">
            <button class="btn btn--danger btn--small" onclick="deleteNotice('${n.id}')">Delete</button>
          </div>
        </div>`
      )
      .join('');
  } catch (err) {
    list.innerHTML = '<p style="color: var(--error);">Failed to load notices.</p>';
  }
}

async function addNotice(e) {
  e.preventDefault();
  const title = document.getElementById('notice-title').value.trim();
  const content = document.getElementById('notice-content').value.trim();

  if (!title || !content) {
    showToast('Title and content are required.', 'error');
    return;
  }

  try {
    await koshishAPI('/notices', {
      method: 'POST',
      body: { title, content },
    });

    showToast('Notice added!', 'success');
    document.getElementById('notice-title').value = '';
    document.getElementById('notice-content').value = '';
    loadAdminNotices();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteNotice(id) {
  if (!confirm('Delete this notice?')) return;

  try {
    await koshishAPI(`/notices/${id}`, { method: 'DELETE' });
    showToast('Notice deleted.', 'success');
    loadAdminNotices();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ═══════════════════════════════════════════════
   EVENTS CRUD (with file upload progress)
   ═══════════════════════════════════════════════ */

let currentAdminEvent = 'udaan';

async function loadAdminEvents() {
  const gallery = document.getElementById('admin-events-gallery');
  if (!gallery) return;

  gallery.innerHTML = createSkeletons(4, 'image');

  try {
    const res = await koshishAPI(`/events?event=${currentAdminEvent}`);
    const photos = res.data || [];

    if (photos.length === 0) {
      gallery.innerHTML = '<p style="color: var(--text-muted); padding: 16px;">No photos uploaded for this event yet.</p>';
      return;
    }

    gallery.innerHTML = photos
      .map(
        (p) => `
        <div class="admin-gallery-item">
          <img src="${p.photo_url}" alt="${escapeAttr(p.caption || 'Event photo')}"
               onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22225%22%3E%3Crect fill=%22%23E5E7EB%22 width=%22300%22 height=%22225%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%236B7280%22 font-size=%2214%22 font-family=%22sans-serif%22%3ENo image%3C/text%3E%3C/svg%3E'">
          <div class="admin-gallery-item__overlay">
            <button class="btn btn--danger btn--small" onclick="deleteEventPhoto('${p.id}')">Delete</button>
          </div>
        </div>`
      )
      .join('');
  } catch (err) {
    gallery.innerHTML = '<p style="color: var(--error);">Failed to load photos.</p>';
  }
}

function onEventDropdownChange(value) {
  currentAdminEvent = value;
  loadAdminEvents();
}

async function uploadEventPhoto(e) {
  e.preventDefault();

  const fileInput = document.getElementById('event-file');
  const captionInput = document.getElementById('event-caption');
  const progressBar = document.getElementById('event-progress');
  const progressFill = document.getElementById('event-progress-fill');
  const btn = document.getElementById('event-upload-btn');

  const files = Array.from(fileInput.files);
  if (files.length === 0) {
    showToast('Please select at least one image file.', 'error');
    return;
  }

  // File size check (5 MB each)
  if (files.some(f => f.size > 5 * 1024 * 1024)) {
    showToast('Each file size must be under 5 MB.', 'error');
    return;
  }

  const token = sessionStorage.getItem('koshish_token');

  // Setup Progress bar
  progressBar.classList.add('visible');
  btn.disabled = true;
  btn.textContent = `Uploading 0 / ${files.length}...`;
  progressFill.style.width = '0%';

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    btn.textContent = `Uploading ${i + 1} / ${files.length}...`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('event_name', currentAdminEvent);
    formData.append('caption', captionInput.value.trim());

    try {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/events/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const baseProgress = (i / files.length) * 100;
            const fileProgress = (e.loaded / e.total) * (100 / files.length);
            progressFill.style.width = `${baseProgress + fileProgress}%`;
          }
        };

        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText);
            if (xhr.status === 201 && json.success) {
              resolve();
            } else {
              reject(json.error || 'Upload failed');
            }
          } catch {
            reject('Upload failed');
          }
        };

        xhr.onerror = () => reject('Network error');
        xhr.send(formData);
      });
      successCount++;
    } catch (err) {
      failCount++;
      console.error('File upload error:', err);
    }
  }

  btn.disabled = false;
  btn.textContent = 'Upload Photo';
  progressBar.classList.remove('visible');
  progressFill.style.width = '0%';

  if (successCount > 0) {
    showToast(`Successfully uploaded ${successCount} photo(s)!`, 'success');
    fileInput.value = '';
    captionInput.value = '';
    loadAdminEvents();
  }
  if (failCount > 0) {
    showToast(`Failed to upload ${failCount} photo(s).`, 'error');
  }
}

async function deleteEventPhoto(id) {
  if (!confirm('Delete this photo?')) return;

  try {
    await koshishAPI(`/events/${id}`, { method: 'DELETE' });
    showToast('Photo deleted.', 'success');
    loadAdminEvents();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ═══════════════════════════════════════════════
   TEAM CRUD
   ═══════════════════════════════════════════════ */

async function loadAdminTeam() {
  const container = document.getElementById('admin-team-list');
  if (!container) return;

  container.innerHTML = createSkeletons(3, 'text');

  try {
    const res = await koshishAPI('/team');
    const members = res.data || [];

    if (members.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); padding: 16px;">No team members yet.</p>';
      return;
    }

    // Group by year
    const yearLabels = {
      faculty: 'Faculty & Advisors',
      '4th': '4th Year — Core Committee',
      '3rd': '3rd Year — Senior Mentors',
      '2nd': '2nd Year — Mentors',
      '1st': '1st Year — Junior Mentors',
    };

    const grouped = {};
    members.forEach((m) => {
      if (!grouped[m.year]) grouped[m.year] = [];
      grouped[m.year].push(m);
    });

    const yearOrder = ['faculty', '4th', '3rd', '2nd', '1st'];
    container.innerHTML = yearOrder
      .filter((y) => grouped[y])
      .map(
        (year) => `
        <div class="admin-team-group">
          <h4 class="admin-team-group__title">${yearLabels[year]}</h4>
          ${grouped[year]
            .map(
              (m) => `
            <div class="admin-list-item">
              <div class="admin-list-item__info">
                <h4>${escapeHTML(m.name)}</h4>
                <p>${escapeHTML(m.role)}</p>
              </div>
              <div class="admin-list-item__actions">
                <button class="btn btn--danger btn--small" onclick="deleteTeamMember('${m.id}')">Delete</button>
              </div>
            </div>`
            )
            .join('')}
        </div>`
      )
      .join('');
  } catch (err) {
    container.innerHTML = '<p style="color: var(--error);">Failed to load team data.</p>';
  }
}

function addTeamMember(e) {
  e.preventDefault();

  const name = document.getElementById('team-name').value.trim();
  const role = document.getElementById('team-role').value.trim();
  const year = document.getElementById('team-year').value;
  const photoInput = document.getElementById('team-photo');

  if (!name || !role || !year) {
    showToast('Name, role, and year are required.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('role', role);
  formData.append('year', year);

  if (photoInput.files[0]) {
    if (photoInput.files[0].size > 5 * 1024 * 1024) {
      showToast('Photo must be under 5 MB.', 'error');
      return;
    }
    formData.append('photo', photoInput.files[0]);
  }

  const token = sessionStorage.getItem('koshish_token');
  const btn = document.getElementById('team-add-btn');
  btn.disabled = true;
  btn.textContent = 'Adding...';

  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${API_BASE}/team`);
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);

  xhr.onload = () => {
    btn.disabled = false;
    btn.textContent = 'Add Member';

    try {
      const res = JSON.parse(xhr.responseText);
      if (xhr.status === 201 && res.success) {
        showToast('Team member added!', 'success');
        document.getElementById('team-name').value = '';
        document.getElementById('team-role').value = '';
        document.getElementById('team-year').value = '';
        photoInput.value = '';
        loadAdminTeam();
      } else {
        showToast(res.error || 'Failed to add member.', 'error');
      }
    } catch {
      showToast('Failed to add member.', 'error');
    }
  };

  xhr.onerror = () => {
    btn.disabled = false;
    btn.textContent = 'Add Member';
    showToast('Failed. Check your connection.', 'error');
  };

  xhr.send(formData);
}

async function deleteTeamMember(id) {
  if (!confirm('Delete this team member?')) return;

  try {
    await koshishAPI(`/team/${id}`, { method: 'DELETE' });
    showToast('Member deleted.', 'success');
    loadAdminTeam();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ═══════════════════════════════════════════════
   SITE CONTENT
   ═══════════════════════════════════════════════ */

async function loadAdminContent() {
  const heroInput = document.getElementById('content-hero');
  const missionInput = document.getElementById('content-mission');
  const visionInput = document.getElementById('content-vision');

  if (!heroInput) return;

  try {
    const res = await koshishAPI('/content');
    const content = res.data;

    heroInput.value = content.hero_tagline || '';
    missionInput.value = content.mission || '';
    visionInput.value = content.vision || '';

    // Update previews
    updatePreview('hero');
    updatePreview('mission');
    updatePreview('vision');
  } catch (err) {
    showToast('Could not load content.', 'error');
  }
}

function updatePreview(key) {
  const input = document.getElementById(`content-${key}`);
  const preview = document.getElementById(`preview-${key}`);
  if (input && preview) {
    preview.textContent = input.value || 'Start typing to see preview...';
  }
}

async function saveContent(key) {
  const inputMap = {
    hero: 'content-hero',
    mission: 'content-mission',
    vision: 'content-vision',
  };

  const keyMap = {
    hero: 'hero_tagline',
    mission: 'mission',
    vision: 'vision',
  };

  const input = document.getElementById(inputMap[key]);
  const value = input.value.trim();

  if (!value) {
    showToast('Content cannot be empty.', 'error');
    return;
  }

  try {
    await koshishAPI(`/content/${keyMap[key]}`, {
      method: 'PUT',
      body: { value },
    });
    showToast(`${key.charAt(0).toUpperCase() + key.slice(1)} content saved!`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ═══════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════ */

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
