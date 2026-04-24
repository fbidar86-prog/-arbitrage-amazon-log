(function () {
  'use strict';

  let userImage = null;
  let activeTemplate = null;

  const uploadZone    = document.getElementById('uploadZone');
  const uploadBtn     = document.getElementById('uploadBtn');
  const fileInput     = document.getElementById('fileInput');
  const imageStrip    = document.getElementById('imageStrip');
  const currentThumb  = document.getElementById('currentThumb');
  const changeImageBtn = document.getElementById('changeImageBtn');
  const templatesGrid = document.getElementById('templatesGrid');
  const modalOverlay  = document.getElementById('modalOverlay');
  const modalClose    = document.getElementById('modalClose');
  const modalTemplateName = document.getElementById('modalTemplateName');
  const previewCanvas = document.getElementById('previewCanvas');
  const downloadBtn   = document.getElementById('downloadBtn');

  // ---- Upload ----

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
      renderAllCards();
    };
    img.src = url;
  }

  // ---- Template cards ----

  function renderAllCards() {
    templatesGrid.innerHTML = '';
    TEMPLATES.forEach(tpl => {
      const card = document.createElement('div');
      card.className = 'template-card';

      const wrap = document.createElement('div');
      wrap.className = 'template-canvas-wrap';

      const c = document.createElement('canvas');
      wrap.appendChild(c);
      tpl.render(c, userImage);

      const info = document.createElement('div');
      info.className = 'template-card-info';
      info.innerHTML = `<div class="template-card-name">${tpl.name}</div>`;

      card.appendChild(wrap);
      card.appendChild(info);
      card.addEventListener('click', () => openPreview(tpl));
      templatesGrid.appendChild(card);
    });
  }

  // ---- Modal preview ----

  function openPreview(tpl) {
    activeTemplate = tpl;
    modalTemplateName.textContent = tpl.name;
    tpl.render(previewCanvas, userImage);
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

  renderAllCards();

})();
