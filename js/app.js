(function () {
  'use strict';

  let userImage = null;
  let activeTemplate = null;
  let currentFramePos = null;
  let showGuide = true;

  const drag = { active: false, startX: 0, startY: 0, origXp: 0, origYp: 0 };

  const uploadZone       = document.getElementById('uploadZone');
  const uploadBtn        = document.getElementById('uploadBtn');
  const fileInput        = document.getElementById('fileInput');
  const imageStrip       = document.getElementById('imageStrip');
  const currentThumb     = document.getElementById('currentThumb');
  const changeImageBtn   = document.getElementById('changeImageBtn');
  const templatesGrid    = document.getElementById('templatesGrid');
  const modalOverlay     = document.getElementById('modalOverlay');
  const modalClose       = document.getElementById('modalClose');
  const modalTemplateName = document.getElementById('modalTemplateName');
  const previewCanvas    = document.getElementById('previewCanvas');
  const downloadBtn      = document.getElementById('downloadBtn');
  const resetBtn         = document.getElementById('resetBtn');
  const sizeUpBtn        = document.getElementById('sizeUpBtn');
  const sizeDownBtn      = document.getElementById('sizeDownBtn');
  const guideToggle      = document.getElementById('guideToggle');

  // ---- Frame guide overlay ----
  function drawGuideOverlay() {
    if (!activeTemplate || !showGuide) return;
    const W = previewCanvas.width / 2;
    const H = previewCanvas.height / 2;
    const ctx = previewCanvas.getContext('2d');
    const frames = currentFramePos ? [currentFramePos] : activeTemplate.frames;

    for (const f of frames) {
      const x = W * f.xp, y = H * f.yp, w = W * f.wp, h = H * f.hp;
      ctx.save();
      ctx.fillStyle = 'rgba(232,130,74,0.07)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(232,130,74,0.85)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(232,130,74,1)';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      const cs = 10;
      ctx.beginPath(); ctx.moveTo(x + cs, y); ctx.lineTo(x, y); ctx.lineTo(x, y + cs); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + w - cs, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cs); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + h - cs); ctx.lineTo(x, y + h); ctx.lineTo(x + cs, y + h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + w - cs, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cs); ctx.stroke();
      ctx.restore();
    }
  }

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
      if (tpl.canvasW && tpl.canvasH) {
        wrap.style.aspectRatio = `${tpl.canvasW} / ${tpl.canvasH}`;
      }
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
  function getActiveFrame() {
    if (!activeTemplate) return null;
    return currentFramePos || activeTemplate.frames[0];
  }

  function rerender(overrides) {
    if (!activeTemplate) return;
    activeTemplate.render(previewCanvas, userImage, overrides ? [overrides] : null);
    drawGuideOverlay();
  }

  function openPreview(tpl) {
    activeTemplate = tpl;
    currentFramePos = null;
    modalTemplateName.textContent = tpl.name;
    rerender(null);
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
    drag.active = false;
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  resetBtn.addEventListener('click', () => {
    currentFramePos = null;
    rerender(null);
  });

  // ---- Resize ----
  function resize(factor) {
    const f = getActiveFrame();
    if (!f) return;
    const newW = Math.min(1, Math.max(0.05, f.wp * factor));
    const newH = Math.min(1, Math.max(0.05, f.hp * factor));
    const dw = newW - f.wp, dh = newH - f.hp;
    currentFramePos = {
      ...f,
      wp: newW,
      hp: newH,
      xp: Math.max(0, Math.min(1 - newW, f.xp - dw / 2)),
      yp: Math.max(0, Math.min(1 - newH, f.yp - dh / 2)),
    };
    rerender(currentFramePos);
  }

  sizeUpBtn.addEventListener('click', () => resize(1.08));
  sizeDownBtn.addEventListener('click', () => resize(1 / 1.08));

  // ---- Drag ----
  function posOnCanvas(e) {
    const rect = previewCanvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) / rect.width,
      y: (src.clientY - rect.top) / rect.height,
    };
  }

  function hitFrame(pos) {
    const f = getActiveFrame();
    return f && pos.x >= f.xp && pos.x <= f.xp + f.wp && pos.y >= f.yp && pos.y <= f.yp + f.hp;
  }

  function startDrag(e) {
    const pos = posOnCanvas(e);
    if (!hitFrame(pos)) return;
    e.preventDefault();
    const f = getActiveFrame();
    drag.active = true;
    drag.startX = pos.x; drag.startY = pos.y;
    drag.origXp = f.xp; drag.origYp = f.yp;
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
    currentFramePos = {
      ...f,
      xp: Math.max(0, Math.min(1 - f.wp, drag.origXp + pos.x - drag.startX)),
      yp: Math.max(0, Math.min(1 - f.hp, drag.origYp + pos.y - drag.startY)),
    };
    rerender(currentFramePos);
  }

  function endDrag() { drag.active = false; previewCanvas.style.cursor = ''; }

  previewCanvas.addEventListener('mousedown', startDrag);
  previewCanvas.addEventListener('touchstart', startDrag, { passive: false });
  previewCanvas.addEventListener('mousemove', onDrag);
  previewCanvas.addEventListener('touchmove', onDrag, { passive: false });
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  // ---- Guide toggle ----
  guideToggle.addEventListener('click', () => {
    showGuide = !showGuide;
    guideToggle.textContent = showGuide ? 'Masquer les guides' : 'Afficher les guides';
    rerender(currentFramePos);
  });

  // ---- Download ----
  downloadBtn.addEventListener('click', () => {
    if (!activeTemplate) return;
    try {
      const wasGuideOn = showGuide;
      if (wasGuideOn) {
        showGuide = false;
        rerender(currentFramePos);
      }
      const a = document.createElement('a');
      a.download = `mockup-${activeTemplate.id}.png`;
      a.href = previewCanvas.toDataURL('image/png');
      a.click();
      if (wasGuideOn) {
        showGuide = true;
        rerender(currentFramePos);
      }
    } catch (e) {
      alert('Importez votre image avant de télécharger.');
    }
  });

  // ---- Init ----
  buildCards();
  preloadBgs();
})();
