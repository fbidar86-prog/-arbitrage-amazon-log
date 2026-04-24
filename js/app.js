(function () {
  'use strict';

  let userImage = null;
  let activeTemplate = null;
  let currentFramePos = null; // overrides template default when user drags

  const drag = { active: false, startX: 0, startY: 0, origXp: 0, origYp: 0 };

  const uploadZone      = document.getElementById('uploadZone');
  const uploadBtn       = document.getElementById('uploadBtn');
  const fileInput       = document.getElementById('fileInput');
  const imageStrip      = document.getElementById('imageStrip');
  const currentThumb    = document.getElementById('currentThumb');
  const changeImageBtn  = document.getElementById('changeImageBtn');
  const templatesGrid   = document.getElementById('templatesGrid');
  const modalOverlay    = document.getElementById('modalOverlay');
  const modalClose      = document.getElementById('modalClose');
  const modalTemplateName = document.getElementById('modalTemplateName');
  const previewCanvas   = document.getElementById('previewCanvas');
  const downloadBtn     = document.getElementById('downloadBtn');
  const resetBtn        = document.getElementById('resetBtn');

  // ---- Preload background photos ----

  function preloadBgs() {
    TEMPLATES.forEach(tpl => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        tpl._bg = img;
        const c = document.querySelector(`[data-id="${tpl.id}"] canvas`);
        if (c) tpl.render(c, userImage);
      };
      img.onerror = () => {
        tpl._bgFailed = true;
        const c = document.querySelector(`[data-id="${tpl.id}"] canvas`);
        if (c) tpl.render(c, userImage);
      };
      img.src = tpl.bgUrl;
    });
  }

  // ---- Upload ----

  uploadZone.addEventListener('click', () => fileInput.click());
  uploadBtn.addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
  changeImageBtn.addEventListener('click', () => fileInput.click());

  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImage(file);
  });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) loadImage(fileInput.files[0]); });

  function loadImage(file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      userImage = img;
      currentThumb.src = url;
      imageStrip.style.display = '';
      document.querySelectorAll('.template-card').forEach(card => {
        const tpl = TEMPLATES.find(t => t.id === card.dataset.id);
        const c = card.querySelector('canvas');
        if (tpl && c) tpl.render(c, userImage);
      });
    };
    img.src = url;
  }

  // ---- Template cards ----

  function buildCards() {
    templatesGrid.innerHTML = '';
    TEMPLATES.forEach(tpl => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.dataset.id = tpl.id;

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

  // ---- Modal ----

  function openPreview(tpl) {
    activeTemplate = tpl;
    currentFramePos = null;
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
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  resetBtn.addEventListener('click', () => {
    currentFramePos = null;
    if (activeTemplate) activeTemplate.render(previewCanvas, userImage);
  });

  // ---- Drag to reposition frame ----

  function getActiveFrame() {
    if (!activeTemplate) return null;
    return currentFramePos || activeTemplate.frames[0];
  }

  function posOnCanvas(e) {
    const rect = previewCanvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) / rect.width,
      y: (src.clientY - rect.top) / rect.height
    };
  }

  function hitFrame(pos) {
    const f = getActiveFrame();
    if (!f) return false;
    return pos.x >= f.xp && pos.x <= f.xp + f.wp &&
           pos.y >= f.yp && pos.y <= f.yp + f.hp;
  }

  function startDrag(e) {
    const pos = posOnCanvas(e);
    if (!hitFrame(pos)) return;
    e.preventDefault();
    const f = getActiveFrame();
    drag.active = true;
    drag.startX = pos.x;
    drag.startY = pos.y;
    drag.origXp = f.xp;
    drag.origYp = f.yp;
    previewCanvas.style.cursor = 'grabbing';
  }

  function onDrag(e) {
    if (!drag.active) {
      if (!e.touches) previewCanvas.style.cursor = hitFrame(posOnCanvas(e)) ? 'grab' : 'default';
      return;
    }
    e.preventDefault();
    const pos = posOnCanvas(e);
    const f = getActiveFrame();
    if (!f) return;
    const newXp = Math.max(0, Math.min(1 - f.wp, drag.origXp + pos.x - drag.startX));
    const newYp = Math.max(0, Math.min(1 - f.hp, drag.origYp + pos.y - drag.startY));
    currentFramePos = { ...f, xp: newXp, yp: newYp };
    activeTemplate.render(previewCanvas, userImage, [currentFramePos]);
  }

  function endDrag() {
    drag.active = false;
    previewCanvas.style.cursor = '';
  }

  previewCanvas.addEventListener('mousedown', startDrag);
  previewCanvas.addEventListener('touchstart', startDrag, { passive: false });
  previewCanvas.addEventListener('mousemove', onDrag);
  previewCanvas.addEventListener('touchmove', onDrag, { passive: false });
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  // ---- Download ----

  downloadBtn.addEventListener('click', () => {
    if (!previewCanvas || !activeTemplate) return;
    try {
      const a = document.createElement('a');
      a.download = `mockup-${activeTemplate.id}.png`;
      a.href = previewCanvas.toDataURL('image/png');
      a.click();
    } catch (err) {
      alert('Importez votre image avant de télécharger.');
    }
  });

  // ---- Init ----

  buildCards();
  preloadBgs();

})();
