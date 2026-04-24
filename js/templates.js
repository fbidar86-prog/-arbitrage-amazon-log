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

function drawFloor(ctx, W, H, hy, color, lineColor) {
  ctx.fillStyle = color;
  ctx.fillRect(0, hy, W, H - hy);
  const fg = ctx.createLinearGradient(0, hy, 0, H);
  fg.addColorStop(0, 'rgba(255,255,255,0.18)');
  fg.addColorStop(0.4, 'rgba(255,255,255,0.04)');
  fg.addColorStop(1, 'rgba(0,0,0,0.06)');
  ctx.fillStyle = fg;
  ctx.fillRect(0, hy, W, H - hy);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, hy, W, H - hy);
  ctx.clip();
  const vx = W / 2;
  ctx.strokeStyle = lineColor || 'rgba(0,0,0,0.065)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i <= 14; i++) {
    ctx.beginPath();
    ctx.moveTo(vx, hy);
    ctx.lineTo((i / 14) * W, H * 1.6);
    ctx.stroke();
  }
  for (let i = 1; i <= 6; i++) {
    const t = Math.pow(i / 6, 0.6);
    ctx.beginPath();
    ctx.moveTo(0, hy + (H - hy) * t);
    ctx.lineTo(W, hy + (H - hy) * t);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWall(ctx, W, hy, topColor, bottomColor) {
  const g = ctx.createLinearGradient(0, 0, 0, hy);
  g.addColorStop(0, topColor);
  g.addColorStop(1, bottomColor || topColor);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, hy + 2);
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  ctx.fillRect(0, hy - 4, W, 4);
}

function drawBricks(ctx, W, hy, baseColor) {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, W, hy);
  const bH = 13, bW = 30, gap = 3;
  for (let row = 0; row * (bH + gap) < hy + bH; row++) {
    const off = (row % 2) * 16;
    for (let col = -1; col * (bW + gap) - off < W; col++) {
      const bx = col * (bW + gap) - off;
      const by = row * (bH + gap);
      const v = Math.sin(row * 5 + col * 11) * 12;
      ctx.fillStyle = `rgba(${140 + v},${80 + v},${60 + v},1)`;
      ctx.fillRect(bx, by, bW, bH);
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.fillRect(bx, by, bW, 2);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, hy - 4, W, 4);
}

function drawFrame(ctx, userImg, x, y, w, h, opts) {
  const { frameColor, ft, matColor, mt, glass = true } = opts;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = frameColor;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  ctx.fillStyle = frameColor;
  ctx.fillRect(x, y, w, h);

  // Bevel top+left highlight
  ctx.fillStyle = 'rgba(255,255,255,0.20)';
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+w,y); ctx.lineTo(x+w-ft,y+ft); ctx.lineTo(x+ft,y+ft); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+ft,y+ft); ctx.lineTo(x+ft,y+h-ft); ctx.lineTo(x,y+h); ctx.closePath(); ctx.fill();
  // Bevel bottom+right shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath(); ctx.moveTo(x,y+h); ctx.lineTo(x+w,y+h); ctx.lineTo(x+w-ft,y+h-ft); ctx.lineTo(x+ft,y+h-ft); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x+w,y); ctx.lineTo(x+w,y+h); ctx.lineTo(x+w-ft,y+h-ft); ctx.lineTo(x+w-ft,y+ft); ctx.closePath(); ctx.fill();

  // Mat
  const mx = x + ft, my = y + ft, mw = w - ft * 2, mh = h - ft * 2;
  if (matColor) {
    ctx.fillStyle = matColor;
    ctx.fillRect(mx, my, mw, mh);
    const msg = ctx.createLinearGradient(mx, my, mx, my + mt * 3);
    msg.addColorStop(0, 'rgba(0,0,0,0.10)'); msg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = msg; ctx.fillRect(mx, my, mw, mh);
    const msg2 = ctx.createLinearGradient(mx, my, mx + mt * 3, my);
    msg2.addColorStop(0, 'rgba(0,0,0,0.06)'); msg2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = msg2; ctx.fillRect(mx, my, mw, mh);
  }

  const imgX = mx + mt, imgY = my + mt, imgW = mw - mt * 2, imgH = mh - mt * 2;

  if (userImg) {
    ctx.save();
    ctx.beginPath(); ctx.rect(imgX, imgY, imgW, imgH); ctx.clip();
    drawImageFit(ctx, userImg, imgX, imgY, imgW, imgH, 'contain');
    ctx.restore();
    if (glass) {
      const gg = ctx.createLinearGradient(imgX, imgY, imgX + imgW * 0.65, imgY + imgH * 0.65);
      gg.addColorStop(0, 'rgba(255,255,255,0.10)');
      gg.addColorStop(0.5, 'rgba(255,255,255,0.03)');
      gg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gg; ctx.fillRect(imgX, imgY, imgW, imgH);
    }
  } else {
    ctx.fillStyle = '#D5D0C8';
    ctx.fillRect(imgX, imgY, imgW, imgH);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#AAAAAA'; ctx.lineWidth = 1.5;
    ctx.strokeRect(imgX + 12, imgY + 12, imgW - 24, imgH - 24);
    ctx.setLineDash([]);
    ctx.fillStyle = '#999990';
    ctx.font = `${Math.min(imgW, imgH) * 0.09}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Votre image', imgX + imgW / 2, imgY + imgH / 2);
  }
}

function drawSofaSilhouette(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  // Back
  ctx.fillRect(x, y, w, h * 0.50);
  // Seat
  ctx.fillRect(x + w * 0.06, y + h * 0.46, w * 0.88, h * 0.42);
  // Arms
  ctx.fillRect(x, y + h * 0.10, w * 0.10, h * 0.80);
  ctx.fillRect(x + w * 0.90, y + h * 0.10, w * 0.10, h * 0.80);
  // Legs
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x + w * 0.12, y + h * 0.88, w * 0.06, h * 0.12);
  ctx.fillRect(x + w * 0.82, y + h * 0.88, w * 0.06, h * 0.12);
  // Highlight
  const sg = ctx.createLinearGradient(x, y, x, y + h * 0.5);
  sg.addColorStop(0, 'rgba(255,255,255,0.12)'); sg.addColorStop(1, 'rgba(0,0,0,0.10)');
  ctx.fillStyle = sg;
  ctx.fillRect(x, y, w, h);
}

function drawPlantSilhouette(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  // Pot
  ctx.fillRect(x - size * 0.35, y + size * 0.55, size * 0.70, size * 0.45);
  // Leaves
  const leaves = [
    [-0.6, -0.5, 0.4, 0.55, -0.6],
    [0.5, -0.6, 0.38, 0.55, 0.5],
    [-0.3, -0.9, 0.28, 0.60, -0.3],
    [0.2, -0.95, 0.26, 0.65, 0.2],
    [0.0, -1.1, 0.22, 0.65, 0],
  ];
  for (const [lx, ly, rx, ry, ang] of leaves) {
    ctx.save();
    ctx.translate(x + lx * size * 0.5, y + ly * size * 0.5);
    ctx.rotate(ang * 0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * size, ry * size * 0.4, ang, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.03;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.55);
    ctx.lineTo(x + lx * size * 0.5, y + ly * size * 0.5);
    ctx.stroke();
  }
}

// ---- Template definitions ----

const TEMPLATES = [
  {
    id: 'salon-blanc',
    name: 'Salon Moderne',
    render(canvas, img) {
      const W = 800, H = 560;
      canvas.width = W * 2; canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      const hy = H * 0.60;

      drawWall(ctx, W, hy, '#EAE7E1', '#E0DCD4');
      drawFloor(ctx, W, H, hy, '#C8B89A', 'rgba(0,0,0,0.06)');

      // Sofa (partially visible at bottom)
      drawSofaSilhouette(ctx, W * 0.15, H * 0.72, W * 0.70, H * 0.36, '#B8A898');

      // Main portrait frame center
      const fw = 210, fh = 270;
      const fx = (W - fw) / 2, fy = hy * 0.12;
      drawFrame(ctx, img, fx, fy, fw, fh, {
        frameColor: '#F2EEE8', ft: 18, matColor: '#FAF9F6', mt: 22
      });
    }
  },
  {
    id: 'salon-sombre',
    name: 'Salon Sombre',
    render(canvas, img) {
      const W = 800, H = 560;
      canvas.width = W * 2; canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      const hy = H * 0.62;

      drawWall(ctx, W, hy, '#2A2D30', '#1E2124');
      drawFloor(ctx, W, H, hy, '#3A3028', 'rgba(0,0,0,0.12)');

      // Ambient spot light on frame
      const spotX = W / 2, spotY = -60;
      const spot = ctx.createRadialGradient(spotX, spotY, 20, spotX, spotY, 420);
      spot.addColorStop(0, 'rgba(255,240,200,0.18)');
      spot.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, W, hy);

      const fw = 210, fh = 270;
      const fx = (W - fw) / 2, fy = hy * 0.10;
      drawFrame(ctx, img, fx, fy, fw, fh, {
        frameColor: '#1A1714', ft: 20, matColor: '#F5F3EE', mt: 24
      });

      drawSofaSilhouette(ctx, W * 0.10, H * 0.74, W * 0.80, H * 0.32, '#2E2924');
    }
  },
  {
    id: 'scandinave',
    name: 'Interieur Scandinave',
    render(canvas, img) {
      const W = 800, H = 560;
      canvas.width = W * 2; canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      const hy = H * 0.62;

      drawWall(ctx, W, hy, '#F8F6F3', '#F2EFE9');
      drawFloor(ctx, W, H, hy, '#D4C4A8', 'rgba(0,0,0,0.05)');

      // Plant on left
      drawPlantSilhouette(ctx, W * 0.12, hy * 0.65, 70, '#6B8C5A');

      // Portrait frame slightly left of center
      const fw = 190, fh = 240;
      const fx = W * 0.44, fy = hy * 0.13;
      drawFrame(ctx, img, fx, fy, fw, fh, {
        frameColor: '#C4A882', ft: 14, matColor: '#FAFAF8', mt: 18
      });

      // Small square frame right
      const fw2 = 110, fh2 = 110;
      drawFrame(ctx, img, W * 0.72, hy * 0.30, fw2, fh2, {
        frameColor: '#C4A882', ft: 10, matColor: null, mt: 0
      });

      drawSofaSilhouette(ctx, W * 0.18, H * 0.73, W * 0.64, H * 0.33, '#D8CEC0');
    }
  },
  {
    id: 'industriel',
    name: 'Style Industriel',
    render(canvas, img) {
      const W = 800, H = 560;
      canvas.width = W * 2; canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      const hy = H * 0.63;

      drawBricks(ctx, W, hy, '#8B6755');
      drawFloor(ctx, W, H, hy, '#3A3630', 'rgba(0,0,0,0.12)');

      // Black iron frame
      const fw = 200, fh = 265;
      const fx = (W - fw) / 2, fy = hy * 0.09;
      drawFrame(ctx, img, fx, fy, fw, fh, {
        frameColor: '#18181A', ft: 10, matColor: null, mt: 0
      });

      drawSofaSilhouette(ctx, W * 0.08, H * 0.72, W * 0.84, H * 0.35, '#2A2624');
    }
  },
  {
    id: 'galerie-art',
    name: 'Galerie d\'Art',
    render(canvas, img) {
      const W = 800, H = 560;
      canvas.width = W * 2; canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      const hy = H * 0.64;

      drawWall(ctx, W, hy, '#F0EDEA', '#E8E4DF');
      drawFloor(ctx, W, H, hy, '#C8C0B4', 'rgba(0,0,0,0.05)');

      // Gallery spotlight from ceiling
      const spot = ctx.createRadialGradient(W / 2, 0, 30, W / 2, hy * 0.4, 300);
      spot.addColorStop(0, 'rgba(255,248,230,0.22)');
      spot.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, W, hy);

      // Large landscape frame
      const fw = 340, fh = 230;
      const fx = (W - fw) / 2, fy = hy * 0.12;
      drawFrame(ctx, img, fx, fy, fw, fh, {
        frameColor: '#2C2820', ft: 14, matColor: '#FAFAFA', mt: 26
      });

      // Slim floor line
      ctx.fillStyle = '#E0DAD2';
      ctx.fillRect(W * 0.05, hy, W * 0.90, 2);
    }
  },
  {
    id: 'mur-galerie',
    name: 'Mur Galerie',
    render(canvas, img) {
      const W = 800, H = 560;
      canvas.width = W * 2; canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      const hy = H * 0.64;

      drawWall(ctx, W, hy, '#F4F0EB', '#EDE8E2');
      drawFloor(ctx, W, H, hy, '#CFC5B0', 'rgba(0,0,0,0.05)');

      // Gallery wall arrangement — 5 frames
      // Row 1: large left + 2 small right stacked
      const cx = W * 0.50;
      const topY = hy * 0.06;

      // Large portrait left
      drawFrame(ctx, img, cx - 280, topY, 170, 218, {
        frameColor: '#1E1C1A', ft: 12, matColor: '#F8F7F4', mt: 16
      });
      // Medium landscape center-top
      drawFrame(ctx, img, cx - 80, topY, 200, 130, {
        frameColor: '#F0EBE3', ft: 14, matColor: '#FAFAF8', mt: 14
      });
      // Small square center-bottom
      drawFrame(ctx, img, cx - 80, topY + 152, 200, 60, {
        frameColor: '#1E1C1A', ft: 8, matColor: null, mt: 0
      });
      // Medium portrait right
      drawFrame(ctx, img, cx + 140, topY, 130, 210, {
        frameColor: '#C4A882', ft: 12, matColor: '#FAFAF8', mt: 14
      });
      // Small landscape bottom-left
      drawFrame(ctx, img, cx - 280, topY + 240, 170, 80, {
        frameColor: '#F0EBE3', ft: 10, matColor: null, mt: 0
      });

      drawSofaSilhouette(ctx, W * 0.18, H * 0.74, W * 0.64, H * 0.32, '#D0C8BC');
    }
  },
  {
    id: 'couloir',
    name: 'Couloir Elegant',
    render(canvas, img) {
      const W = 800, H = 560;
      canvas.width = W * 2; canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      const hy = H * 0.63;

      drawWall(ctx, W, hy, '#EDE8E0', '#E4DED6');

      // Wainscoting / wall panel effect
      ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1;
      ctx.strokeRect(W * 0.05, H * 0.05, W * 0.90, hy * 0.80);
      ctx.strokeRect(W * 0.07, H * 0.07, W * 0.86, hy * 0.76);

      drawFloor(ctx, W, H, hy, '#C0AE94', 'rgba(0,0,0,0.06)');

      // Three portrait frames in a row
      const fh = 200, fw = 130, gap = 28;
      const totalW = fw * 3 + gap * 2;
      const startX = (W - totalW) / 2;
      const fy = hy * 0.10;
      for (let i = 0; i < 3; i++) {
        drawFrame(ctx, img, startX + i * (fw + gap), fy, fw, fh, {
          frameColor: '#3A2E22', ft: 14, matColor: '#F8F6F2', mt: 16
        });
      }
    }
  },
  {
    id: 'chambre',
    name: 'Chambre Cosy',
    render(canvas, img) {
      const W = 800, H = 560;
      canvas.width = W * 2; canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      const hy = H * 0.60;

      drawWall(ctx, W, hy, '#EDE0D8', '#E5D7CE');
      drawFloor(ctx, W, H, hy, '#D4C0A8', 'rgba(0,0,0,0.05)');

      // Headboard hint (bed top)
      ctx.fillStyle = '#8C7060';
      ctx.beginPath();
      ctx.roundRect(W * 0.20, hy * 0.85, W * 0.60, hy * 0.35, [8, 8, 0, 0]);
      ctx.fill();
      const hg = ctx.createLinearGradient(0, hy * 0.85, 0, hy * 1.2);
      hg.addColorStop(0, 'rgba(255,255,255,0.10)'); hg.addColorStop(1, 'rgba(0,0,0,0.08)');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.roundRect(W * 0.20, hy * 0.85, W * 0.60, hy * 0.35, [8, 8, 0, 0]);
      ctx.fill();

      // Portrait frame above headboard
      const fw = 180, fh = 230;
      drawFrame(ctx, img, (W - fw) / 2, hy * 0.08, fw, fh, {
        frameColor: '#FAF8F4', ft: 14, matColor: '#FEFEFE', mt: 18
      });
    }
  }
];
