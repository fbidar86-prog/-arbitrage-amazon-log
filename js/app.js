(function () {
  'use strict';

  let userImage = null;
  let activeTemplate = null;
  let activeCategory = 'all';

  const uploadZone = document.getElementById('uploadZone');
  const uploadBtn = document.getElementById('uploadBtn');
  const fileInput = document.getElementById('fileInput');
  const imageStrip = document.getElementById('imageStrip');
  const currentThumb = document.getElementById('currentThumb');
  const changeImageBtn = document.getElementById('changeImageBtn');
  const templatesGrid = document.getElementById('templatesGrid');
  const categoryTabs = document.getElementById('categoryTabs');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalTemplateName = document.getElementById('modalTemplateName');
  const previewCanvas = document.getElementById('previewCanvas');
  const downloadBtn = document.getElementById('downloadBtn');

  // ---- Upload handling ----

  uploadZone.addEventListener('click', () => fileInput.click());
  uploadBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
  changeImageBtn.addEventListener('click', () => fileInput.click());

  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImage(file);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) loadImage(fileInput.files[0]);
  });

  function loadImage(file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      userImage = img;
      currentThumb.src = url;
      imageStrip.style.display = '';
      renderAllThumbnails();
    };
    img.src = url;
  }

  // ---- Category tabs ----

  categoryTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeCategory = tab.dataset.category;
    renderTemplateCards();
  });

  // ---- Template cards ----

  function renderTemplateCards() {
    const filtered = activeCategory === 'all'
      ? TEMPLATES
      : TEMPLATES.filter(t => t.category === activeCategory);

    templatesGrid.innerHTML = '';
    filtered.forEach(tpl => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.dataset.id = tpl.id;

      const canvasWrap = document.createElement('div');
      canvasWrap.className = 'template-canvas-wrap';

      if (userImage) {
        const c = document.createElement('canvas');
        canvasWrap.appendChild(c);
        renderTemplate(tpl, c, userImage);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'template-no-image';
        placeholder.textContent = 'Importez une image pour voir le rendu';
        canvasWrap.appendChild(placeholder);
      }

      const info = document.createElement('div');
      info.className = 'template-card-info';
      info.innerHTML = `
        <div class="template-card-name">${tpl.name}</div>
        <div class="template-card-cat">${tpl.category}</div>
      `;

      card.appendChild(canvasWrap);
      card.appendChild(info);
      card.addEventListener('click', () => openPreview(tpl));
      templatesGrid.appendChild(card);
    });
  }

  function renderTemplate(tpl, canvas, img) {
    tpl.render(canvas, img);
  }

  function renderAllThumbnails() {
    renderTemplateCards();
  }

  // ---- Preview modal ----

  function openPreview(tpl) {
    activeTemplate = tpl;
    modalTemplateName.textContent = tpl.name;
    renderTemplate(tpl, previewCanvas, userImage);
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // ---- Download ----

  downloadBtn.addEventListener('click', () => {
    if (!previewCanvas || !activeTemplate) return;
    const a = document.createElement('a');
    a.download = `mockup-${activeTemplate.id}.png`;
    a.href = previewCanvas.toDataURL('image/png');
    a.click();
  });

  // ---- Init ----

  renderTemplateCards();

})();
