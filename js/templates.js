// ---- Helpers ----

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

function drawFrameOverlay(ctx, userImg, x, y, w, h, opts) {
  const { ft = 18, color = '#1A1714', matColor = null, mt = 0 } = opts;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+w,y); ctx.lineTo(x+w-ft,y+ft); ctx.lineTo(x+ft,y+ft); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+ft,y+ft); ctx.lineTo(x+ft,y+h-ft); ctx.lineTo(x,y+h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath(); ctx.moveTo(x,y+h); ctx.lineTo(x+w,y+h); ctx.lineTo(x+w-ft,y+h-ft); ctx.lineTo(x+ft,y+h-ft); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x+w,y); ctx.lineTo(x+w,y+h); ctx.lineTo(x+w-ft,y+h-ft); ctx.lineTo(x+w-ft,y+ft); ctx.closePath(); ctx.fill();

  const mx = x+ft, my = y+ft, mw = w-ft*2, mh = h-ft*2;
  if (matColor) {
    ctx.fillStyle = matColor;
    ctx.fillRect(mx, my, mw, mh);
    const mg = ctx.createLinearGradient(mx, my, mx, my+mt*3);
    mg.addColorStop(0, 'rgba(0,0,0,0.10)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mg; ctx.fillRect(mx, my, mw, mh);
  }

  const ix = mx+mt, iy = my+mt, iw = mw-mt*2, ih = mh-mt*2;
  if (userImg) {
    ctx.save();
    ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
    drawImageFit(ctx, userImg, ix, iy, iw, ih, 'contain');
    ctx.restore();
    const gg = ctx.createLinearGradient(ix, iy, ix+iw*0.7, iy+ih*0.7);
    gg.addColorStop(0, 'rgba(255,255,255,0.12)');
    gg.addColorStop(0.5, 'rgba(255,255,255,0.04)');
    gg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gg; ctx.fillRect(ix, iy, iw, ih);
  } else {
    ctx.fillStyle = 'rgba(200,195,188,0.55)';
    ctx.fillRect(ix, iy, iw, ih);
    ctx.setLineDash([5,5]);
    ctx.strokeStyle = 'rgba(150,140,130,0.8)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(ix+10, iy+10, iw-20, ih-20);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(110,105,98,0.9)';
    ctx.font = `${Math.min(iw,ih)*0.09}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Votre image', ix+iw/2, iy+ih/2);
  }
}

// Accept optional frameOverrides array so app.js can pass dragged position
function makeRender(bgUrl, defaultFrames) {
  return function render(canvas, userImg, frameOverrides) {
    const frames = frameOverrides || defaultFrames;
    const W = 800, H = 560;
    canvas.width = W * 2; canvas.height = H * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    if (this._bg) {
      drawImageFit(ctx, this._bg, 0, 0, W, H, 'cover');
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, W, H);
    } else if (this._bgFailed) {
      ctx.fillStyle = '#D5D0C8'; ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = '#C8C3BB'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#9E9890'; ctx.font = '13px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Chargement...', W/2, H/2);
      return;
    }

    for (const f of frames) {
      drawFrameOverlay(ctx, userImg, W*f.xp, H*f.yp, W*f.wp, H*f.hp,
        { ft: f.ft, color: f.color, matColor: f.matColor || null, mt: f.mt || 0 });
    }
  };
}

// Default frame position - upper third of image (above typical furniture line)
// User can drag to correct in the modal
const DEFAULT_FRAME = { xp:0.32, yp:0.05, wp:0.33, hp:0.43 };

const TEMPLATES = [
  {
    id: 'salon-gris',
    name: 'Salon Gris Moderne',
    bgUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&w=1600&q=80',
    frames: [{ ...DEFAULT_FRAME, ft:20, color:'#1A1714', matColor:'#F8F6F2', mt:22 }],
  },
  {
    id: 'salon-blanc',
    name: 'Salon Blanc Epure',
    bgUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&w=1600&q=80',
    frames: [{ xp:0.34, yp:0.05, wp:0.30, hp:0.42, ft:16, color:'#EEEAE4', matColor:'#FAFAF8', mt:20 }],
  },
  {
    id: 'salon-beige',
    name: 'Salon Beige Chaud',
    bgUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&w=1600&q=80',
    frames: [{ xp:0.31, yp:0.04, wp:0.35, hp:0.43, ft:18, color:'#2C2416', matColor:'#F6F2EC', mt:20 }],
  },
  {
    id: 'salon-sombre',
    name: 'Salon Sombre Luxe',
    bgUrl: 'https://images.unsplash.com/photo-1567016376408-0226e4d0f1ea?auto=format&w=1600&q=80',
    frames: [{ xp:0.33, yp:0.04, wp:0.30, hp:0.43, ft:16, color:'#E8E0D0', matColor:'#FAF8F4', mt:18 }],
  },
  {
    id: 'scandinave',
    name: 'Interieur Scandinave',
    bgUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&w=1600&q=80',
    frames: [{ xp:0.33, yp:0.04, wp:0.30, hp:0.42, ft:14, color:'#C8B898', matColor:'#FAFAFA', mt:16 }],
  },
  {
    id: 'nordique',
    name: 'Chambre Nordique',
    bgUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&w=1600&q=80',
    frames: [{ xp:0.35, yp:0.04, wp:0.27, hp:0.41, ft:12, color:'#F2EDE6', matColor:'#FFFFFF', mt:14 }],
  },
  {
    id: 'beton',
    name: 'Loft Beton',
    bgUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&w=1600&q=80',
    frames: [{ xp:0.30, yp:0.04, wp:0.36, hp:0.44, ft:10, color:'#111111', matColor:null, mt:0 }],
  },
  {
    id: 'diptique',
    name: 'Diptyque Salon',
    bgUrl: 'https://images.unsplash.com/photo-1513694203232-719a6ca5db58?auto=format&w=1600&q=80',
    frames: [
      { xp:0.22, yp:0.04, wp:0.23, hp:0.42, ft:16, color:'#1A1714', matColor:'#F8F6F2', mt:16 },
      { xp:0.51, yp:0.04, wp:0.23, hp:0.42, ft:16, color:'#1A1714', matColor:'#F8F6F2', mt:16 },
    ],
  },
].map(t => ({ ...t, render: makeRender(t.bgUrl, t.frames) }));
