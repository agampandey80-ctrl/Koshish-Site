// notes.js

const classData = [
  { id: 6, title: "Class 6", subtitle: "Explore notes for Class 6", gradient: "gradient-6", icon: "🎒", subjects: ["Math", "Science", "English", "Hindi", "Social Science"] },
  { id: 7, title: "Class 7", subtitle: "Explore notes for Class 7", gradient: "gradient-7", icon: "✏️", subjects: ["Math", "Science", "English", "Hindi", "Social Science"] },
  { id: 8, title: "Class 8", subtitle: "Explore notes for Class 8", gradient: "gradient-8", icon: "📖", subjects: ["Math", "Science", "English", "Hindi", "Social Science"] },
  { id: 9, title: "Class 9", subtitle: "Explore notes for Class 9", gradient: "gradient-9", icon: "🔬", subjects: ["Math", "Science", "English", "Hindi", "Social Science", "IT"] },
  { id: 10, title: "Class 10", subtitle: "Explore notes for Class 10", gradient: "gradient-10", icon: "🌐", subjects: ["Math", "Science", "English", "Hindi", "Social Science", "IT"] },
  { id: 11, title: "Class 11", subtitle: "Explore notes for Class 11", gradient: "gradient-11", icon: "🎓", subjects: ["Physics", "Chemistry", "Math", "Biology", "English", "Computer Science"] },
  { id: 12, title: "Class 12", subtitle: "Explore notes for Class 12", gradient: "gradient-12", icon: "🏆", subjects: ["Physics", "Chemistry", "Math", "Biology", "English", "Computer Science"] }
];

let savedNotes = [];

document.addEventListener('DOMContentLoaded', async () => {
  await fetchNotes();
  renderClasses();
  setupPdfModal();
});

async function fetchNotes() {
  try {
    const res = await koshishAPI('/notes');
    if (res && res.success) {
      savedNotes = res.data;
    }
  } catch (err) {
    console.warn('Failed to fetch notes from backend', err);
  }
}

function getNoteUrl(className, subject) {
  const note = savedNotes.find(n => n.class_name === className && n.subject === subject);
  return note ? note.pdf_url : null;
}

function renderClasses() {
  const grid = document.getElementById('notes-grid');
  if (!grid) return;

  grid.innerHTML = '';

  classData.forEach(cls => {
    // Wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'class-card-wrapper';

    // Main Card
    const card = document.createElement('div');
    card.className = `class-card ${cls.gradient}`;
    card.innerHTML = `
      <div class="class-card__left">
        <div class="class-card__icon">${cls.icon}</div>
        <div class="class-card__info">
          <h2 class="class-card__title">${cls.title}</h2>
          <p class="class-card__subtitle">${cls.subtitle}</p>
        </div>
      </div>
      <div class="class-card__right">→</div>
    `;

    // Subjects Container (Accordion Content)
    const subjectsContainer = document.createElement('div');
    subjectsContainer.className = 'subjects-container';
    subjectsContainer.id = `subjects-${cls.id}`;

    // Render Subjects
    cls.subjects.forEach(subject => {
      const pdfUrl = getNoteUrl(cls.title, subject);

      const subjectCard = document.createElement('div');
      subjectCard.className = 'subject-card';
      subjectCard.innerHTML = `
        <div class="subject-header">
          <h3 class="subject-title">${subject}</h3>
          <div class="subject-actions">
            <button class="btn-sm btn-view" onclick="openPdf('${cls.title}', '${subject}')" ${!pdfUrl ? 'disabled style="opacity: 0.5;"' : ''}>View</button>
            <button class="btn-sm btn-download" onclick="downloadPdf('${cls.title}', '${subject}')" ${!pdfUrl ? 'disabled style="opacity: 0.5;"' : ''}>Download</button>
          </div>
        </div>
      `;
      subjectsContainer.appendChild(subjectCard);
    });

    // Accordion Toggle Logic
    card.addEventListener('click', () => {
      const isActive = subjectsContainer.classList.contains('active');
      
      // Close all others
      document.querySelectorAll('.subjects-container').forEach(c => c.classList.remove('active'));
      document.querySelectorAll('.class-card').forEach(c => c.classList.remove('active'));

      if (!isActive) {
        subjectsContainer.classList.add('active');
        card.classList.add('active');
      }
    });

    wrapper.appendChild(card);
    wrapper.appendChild(subjectsContainer);
    grid.appendChild(wrapper);
  });
}

function openPdf(className, subject) {
  let url = getNoteUrl(className, subject);
  if (!url) {
    alert('No PDF linked for this subject yet.');
    return;
  }
  
  // Basic translation of google drive links to preview mode if applicable
  if(url.includes('drive.google.com/file/d/')) {
      url = url.replace(/\/view.*$/, '/preview');
  }

  const modal = document.getElementById('pdf-modal');
  const iframe = document.getElementById('pdf-iframe');
  const modalTitle = document.getElementById('pdf-modal-title');

  if (modal && iframe && modalTitle) {
    modalTitle.textContent = `${className} - ${subject}`;
    iframe.src = url;
    modal.classList.add('active');
  }
}

function downloadPdf(className, subject) {
  const url = getNoteUrl(className, subject);
  if (!url) {
    alert('No PDF linked for this subject yet.');
    return;
  }
  window.open(url, '_blank');
}

function setupPdfModal() {
  // Inject modal HTML into body
  const modalHtml = `
    <div class="pdf-modal" id="pdf-modal">
      <div class="pdf-content">
        <div class="pdf-header">
          <h2 class="pdf-title" id="pdf-modal-title">Document</h2>
          <button class="pdf-close" id="pdf-close">&times;</button>
        </div>
        <iframe class="pdf-iframe" id="pdf-iframe" src=""></iframe>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Close logic
  const modal = document.getElementById('pdf-modal');
  const closeBtn = document.getElementById('pdf-close');
  const iframe = document.getElementById('pdf-iframe');

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    iframe.src = ''; // Stop loading
  });

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      iframe.src = '';
    }
  });
}
