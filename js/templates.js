function drawImageFit(ctx, img, x, y, w, h, mode) {
  if (!img) return;
  const ia = img.naturalWidth / img.naturalHeight;
  const aa = w / h;
  let dw, dh;
  if (mode === 'cover') {
    if (ia > aa) { dh = h; dw = dh * ia; } else { dw = w; dh = dw / ia; }
  } else {
    if (ia > aa) { dw = w; dh = dw / ia; } else { dh = h; dw = dh * ia; }
  }
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

// Place l'image utilisateur dans la zone du cadre existant dans la photo.
// Aucun faux cadre dessiné — le cadre de la photo fait office de cadre.
function placeInFrame(ctx, userImg, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (userImg) {
    drawImageFit(ctx, userImg, x, y, w, h, 'contain');
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x, y, w, h);
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.80)';
    ctx.font = `bold ${Math.min(w, h) * 0.10}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Votre image', x + w / 2, y + h / 2);
  }
  ctx.restore();
}

function makeRender(bgUrl, defaultFrames, cW, cH) {
  return function render(canvas, userImg, frameOverrides) {
    const frames = frameOverrides || defaultFrames;
    const W = cW || 800, H = cH || 560;
    canvas.width = W * 2; canvas.height = H * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    if (this._bg) {
      drawImageFit(ctx, this._bg, 0, 0, W, H, 'cover');
    } else if (this._bgFailed) {
      ctx.fillStyle = '#C8C3BB'; ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = '#C8C3BB'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#888'; ctx.font = '13px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Chargement…', W / 2, H / 2);
      return;
    }

    for (const f of frames) {
      placeInFrame(ctx, userImg, W * f.xp, H * f.yp, W * f.wp, H * f.hp);
    }
  };
}

// ── Coordonnées = zone intérieure du cadre existant dans chaque photo ──
// Ces valeurs correspondent à l'espace interne du cadre réel (sans le bord).
// L'utilisateur peut glisser pour affiner le positionnement.
const TEMPLATES = [
  {
    id: 'salon-gris',
    name: 'Salon Gris Moderne',
    bgUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&w=1600&q=80',
    // Cadre noir sur le mur derrière le canapé vert
    frames: [{ xp: 0.335, yp: 0.035, wp: 0.260, hp: 0.440 }],
  },
  {
    id: 'salon-blanc',
    name: 'Salon Blanc Epure',
    bgUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&w=1600&q=80',
    // Cadre clair centré sur le mur blanc
    frames: [{ xp: 0.420, yp: 0.038, wp: 0.210, hp: 0.430 }],
  },
  {
    id: 'salon-chaud',
    name: 'Salon Chaud',
    bgUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&w=1600&q=80',
    frames: [{ xp: 0.310, yp: 0.038, wp: 0.280, hp: 0.430 }],
  },
  {
    id: 'salon-sombre',
    name: 'Salon Sombre',
    bgUrl: 'https://images.unsplash.com/photo-1567016376408-0226e4d0f1ea?auto=format&w=1600&q=80',
    frames: [{ xp: 0.340, yp: 0.038, wp: 0.240, hp: 0.440 }],
  },
  {
    id: 'scandinave',
    name: 'Interieur Scandinave',
    bgUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&w=1600&q=80',
    frames: [{ xp: 0.330, yp: 0.038, wp: 0.260, hp: 0.430 }],
  },
  {
    id: 'chambre',
    name: 'Chambre Cosy',
    bgUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&w=1600&q=80',
    frames: [{ xp: 0.360, yp: 0.038, wp: 0.230, hp: 0.400 }],
  },
  {
    id: 'loft',
    name: 'Loft Beton',
    bgUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&w=1600&q=80',
    frames: [{ xp: 0.310, yp: 0.035, wp: 0.300, hp: 0.440 }],
  },
  {
    id: 'diptique',
    name: 'Diptyque Salon',
    bgUrl: 'https://images.unsplash.com/photo-1513694203232-719a6ca5db58?auto=format&w=1600&q=80',
    frames: [
      { xp: 0.220, yp: 0.038, wp: 0.210, hp: 0.420 },
      { xp: 0.490, yp: 0.038, wp: 0.210, hp: 0.420 },
    ],
  },
  {
    id: 'salon-moderne',
    name: 'Salon Moderne',
    bgUrl: 'mockups/salon-moderne.jpg',
    local: true,
    canvasW: 700, canvasH: 700,
    // Image 2000x2000 — cadre noir portrait sur le mur
    frames: [{ xp: 0.280, yp: 0.025, wp: 0.390, hp: 0.680 }],
  },
].map(t => ({ ...t, render: makeRender(t.bgUrl, t.frames, t.canvasW, t.canvasH) }));
