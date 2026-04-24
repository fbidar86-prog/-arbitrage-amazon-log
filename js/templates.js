/**
 * Mockup template definitions.
 * Each template has a render(canvas, userImg) function that draws the full mockup.
 * thumbnailSize: short side size used when drawing thumbnails.
 */

function drawImageFit(ctx, img, x, y, w, h, mode = 'contain') {
  const ia = img.naturalWidth / img.naturalHeight;
  const aa = w / h;
  let dw, dh, dx, dy;

  if (mode === 'cover') {
    if (ia > aa) { dh = h; dw = dh * ia; } else { dw = w; dh = dw / ia; }
  } else {
    if (ia > aa) { dw = w; dh = dw / ia; } else { dh = h; dw = dh * ia; }
  }
  dx = x + (w - dw) / 2;
  dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function wallBg(ctx, w, h, color = '#E8E4DC') {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

function dropShadow(ctx, fn) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 10;
  fn();
  ctx.restore();
}

function drawFramedPrint(canvas, userImg, opts) {
  const { cw, ch, frameColor, frameW, matColor, matW, bgColor } = opts;
  canvas.width = cw * 2;
  canvas.height = ch * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  wallBg(ctx, cw, ch, bgColor);

  const fx = 40, fy = 40, fw = cw - 80, fh = ch - 80;

  dropShadow(ctx, () => {
    ctx.fillStyle = frameColor;
    ctx.fillRect(fx, fy, fw, fh);
  });

  // Frame gradient (light edge)
  const fg = ctx.createLinearGradient(fx, fy, fx + fw, fy + fh);
  fg.addColorStop(0, 'rgba(255,255,255,0.18)');
  fg.addColorStop(0.5, 'rgba(0,0,0,0)');
  fg.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = fg;
  ctx.fillRect(fx, fy, fw, fh);

  // Mat
  ctx.fillStyle = matColor;
  ctx.fillRect(fx + frameW, fy + frameW, fw - frameW * 2, fh - frameW * 2);

  // Mat shadow (inner)
  const mx = fx + frameW, my = fy + frameW, mw = fw - frameW * 2, mh = fh - frameW * 2;
  const mg = ctx.createLinearGradient(mx, my, mx, my + matW * 2);
  mg.addColorStop(0, 'rgba(0,0,0,0.08)');
  mg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = mg;
  ctx.fillRect(mx, my, mw, mh);

  if (userImg) {
    const ix = mx + matW, iy = my + matW, iw = mw - matW * 2, ih = mh - matW * 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(ix, iy, iw, ih);
    ctx.clip();
    drawImageFit(ctx, userImg, ix, iy, iw, ih, 'contain');
    ctx.restore();

    // Glass glare
    const glare = ctx.createLinearGradient(ix, iy, ix + iw * 0.5, iy + ih * 0.5);
    glare.addColorStop(0, 'rgba(255,255,255,0.07)');
    glare.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glare;
    ctx.fillRect(ix, iy, iw, ih);
  }
}

function drawTshirt(ctx, W, H, shirtColor, isLight) {
  ctx.beginPath();
  ctx.moveTo(W * 0.37, H * 0.09);
  ctx.bezierCurveTo(W * 0.39, H * 0.145, W * 0.61, H * 0.145, W * 0.63, H * 0.09);
  ctx.lineTo(W * 0.84, H * 0.055);
  ctx.lineTo(W * 0.96, H * 0.24);
  ctx.bezierCurveTo(W * 0.88, H * 0.27, W * 0.79, H * 0.29, W * 0.72, H * 0.29);
  ctx.lineTo(W * 0.71, H * 0.91);
  ctx.lineTo(W * 0.29, H * 0.91);
  ctx.lineTo(W * 0.28, H * 0.29);
  ctx.bezierCurveTo(W * 0.21, H * 0.29, W * 0.12, H * 0.27, W * 0.04, H * 0.24);
  ctx.lineTo(W * 0.16, H * 0.055);
  ctx.closePath();
  ctx.fillStyle = shirtColor;
  ctx.fill();
  // Highlight
  const g = ctx.createLinearGradient(0, 0, W, H * 0.6);
  g.addColorStop(0, 'rgba(255,255,255,0.14)');
  g.addColorStop(1, 'rgba(0,0,0,0.10)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = isLight ? '#C8C0B8' : 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawMug(ctx, W, H, mugColor, isLight) {
  const bx = W * 0.12, by = H * 0.18, bw = W * 0.60, bh = H * 0.62;
  // Body
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + bw, by);
  ctx.lineTo(bx + bw - 8, by + bh);
  ctx.lineTo(bx + 8, by + bh);
  ctx.closePath();
  ctx.fillStyle = mugColor;
  ctx.fill();
  // Side gradient
  const sg = ctx.createLinearGradient(bx, by, bx + bw, by);
  sg.addColorStop(0, 'rgba(0,0,0,0.12)');
  sg.addColorStop(0.3, 'rgba(255,255,255,0.10)');
  sg.addColorStop(0.85, 'rgba(255,255,255,0.06)');
  sg.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = sg;
  ctx.fill();
  // Outline body
  ctx.strokeStyle = isLight ? '#CCCCCC' : 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Handle
  const hx = bx + bw + 5, hy = by + bh * 0.18, hr = bh * 0.24;
  ctx.beginPath();
  ctx.arc(hx + hr * 0.55, hy + hr, hr, -Math.PI * 0.55, Math.PI * 0.55);
  ctx.strokeStyle = mugColor;
  ctx.lineWidth = bw * 0.13;
  ctx.stroke();
  ctx.strokeStyle = isLight ? '#CCCCCC' : 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Top ellipse
  ctx.beginPath();
  ctx.ellipse(bx + bw / 2, by, bw / 2, bh * 0.065, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#BFBBBB';
  ctx.fill();
  ctx.strokeStyle = isLight ? '#CCCCCC' : 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Bottom ellipse
  ctx.beginPath();
  ctx.ellipse(bx + bw / 2 - 4, by + bh, (bw - 16) / 2, bh * 0.05, 0, 0, Math.PI * 2);
  ctx.fillStyle = mugColor;
  ctx.fill();
  ctx.strokeStyle = isLight ? '#CCCCCC' : 'rgba(0,0,0,0.2)';
  ctx.stroke();

  return { bx, by, bw, bh };
}

const TEMPLATES = [
  // -------- IMPRESSIONS --------
  {
    id: 'frame-portrait-dark',
    name: 'Cadre Bois Sombre',
    category: 'impressions',
    aspect: 4 / 5,
    render(canvas, userImg) {
      drawFramedPrint(canvas, userImg, {
        cw: 480, ch: 580,
        frameColor: '#3B2517',
        frameW: 28,
        matColor: '#F8F5EF',
        matW: 32,
        bgColor: '#D9D4CC'
      });
    }
  },
  {
    id: 'frame-landscape-dark',
    name: 'Cadre Bois Paysage',
    category: 'impressions',
    aspect: 5 / 4,
    render(canvas, userImg) {
      drawFramedPrint(canvas, userImg, {
        cw: 580, ch: 480,
        frameColor: '#3B2517',
        frameW: 26,
        matColor: '#F8F5EF',
        matW: 28,
        bgColor: '#D9D4CC'
      });
    }
  },
  {
    id: 'frame-portrait-white',
    name: 'Cadre Blanc Portrait',
    category: 'impressions',
    aspect: 4 / 5,
    render(canvas, userImg) {
      drawFramedPrint(canvas, userImg, {
        cw: 480, ch: 580,
        frameColor: '#EBEBEB',
        frameW: 26,
        matColor: '#FFFFFF',
        matW: 28,
        bgColor: '#C8C5BF'
      });
    }
  },
  {
    id: 'frame-square-gold',
    name: 'Cadre Or Carre',
    category: 'impressions',
    aspect: 1,
    render(canvas, userImg) {
      drawFramedPrint(canvas, userImg, {
        cw: 520, ch: 520,
        frameColor: '#B8962E',
        frameW: 24,
        matColor: '#FAF8F3',
        matW: 24,
        bgColor: '#E2DDD6'
      });
    }
  },
  {
    id: 'canvas-art',
    name: 'Toile Tendue',
    category: 'impressions',
    aspect: 1,
    render(canvas, userImg) {
      const CW = 520, CH = 520;
      canvas.width = CW * 2;
      canvas.height = CH * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      wallBg(ctx, CW, CH, '#D5D0C8');

      const px = 50, py = 50, pw = CW - 100, ph = CH - 100;
      const depth = 14;

      dropShadow(ctx, () => {
        ctx.fillStyle = '#F2EDE6';
        ctx.fillRect(px, py, pw, ph);
      });

      // Side panels (3D canvas depth)
      // Right side
      ctx.beginPath();
      ctx.moveTo(px + pw, py);
      ctx.lineTo(px + pw + depth, py + depth);
      ctx.lineTo(px + pw + depth, py + ph + depth);
      ctx.lineTo(px + pw, py + ph);
      ctx.closePath();
      ctx.fillStyle = '#B5AFA6';
      ctx.fill();
      // Bottom side
      ctx.beginPath();
      ctx.moveTo(px, py + ph);
      ctx.lineTo(px + depth, py + ph + depth);
      ctx.lineTo(px + pw + depth, py + ph + depth);
      ctx.lineTo(px + pw, py + ph);
      ctx.closePath();
      ctx.fillStyle = '#9E9890';
      ctx.fill();

      if (userImg) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(px, py, pw, ph);
        ctx.clip();
        drawImageFit(ctx, userImg, px, py, pw, ph, 'cover');
        ctx.restore();
      }

      // Canvas texture overlay
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1;
      for (let i = py; i < py + ph; i += 4) {
        ctx.beginPath();
        ctx.moveTo(px, i);
        ctx.lineTo(px + pw, i);
        ctx.stroke();
      }

      // Wooden stretcher bars visible on edges
      const edgeG = ctx.createLinearGradient(px, py, px + 10, py);
      edgeG.addColorStop(0, 'rgba(0,0,0,0.15)');
      edgeG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = edgeG;
      ctx.fillRect(px, py, pw, ph);
    }
  },

  // -------- VETEMENTS --------
  {
    id: 'tshirt-white',
    name: 'T-Shirt Blanc',
    category: 'vetements',
    aspect: 5 / 6,
    render(canvas, userImg) {
      const W = 500, H = 580;
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      wallBg(ctx, W, H, '#E8E4DC');

      dropShadow(ctx, () => { drawTshirt(ctx, W, H, '#FFFFFF', true); });
      drawTshirt(ctx, W, H, '#FFFFFF', true);

      if (userImg) {
        const ix = W * 0.33, iy = H * 0.28, iw = W * 0.34, ih = H * 0.34;
        ctx.save();
        ctx.beginPath();
        ctx.rect(ix, iy, iw, ih);
        ctx.clip();
        drawImageFit(ctx, userImg, ix, iy, iw, ih, 'contain');
        ctx.restore();
      }
    }
  },
  {
    id: 'tshirt-black',
    name: 'T-Shirt Noir',
    category: 'vetements',
    aspect: 5 / 6,
    render(canvas, userImg) {
      const W = 500, H = 580;
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      wallBg(ctx, W, H, '#E8E4DC');

      dropShadow(ctx, () => { drawTshirt(ctx, W, H, '#1C1C1C', false); });
      drawTshirt(ctx, W, H, '#1C1C1C', false);

      if (userImg) {
        const ix = W * 0.33, iy = H * 0.28, iw = W * 0.34, ih = H * 0.34;
        ctx.save();
        ctx.beginPath();
        ctx.rect(ix, iy, iw, ih);
        ctx.clip();
        drawImageFit(ctx, userImg, ix, iy, iw, ih, 'contain');
        ctx.restore();
      }
    }
  },
  {
    id: 'tshirt-beige',
    name: 'T-Shirt Beige',
    category: 'vetements',
    aspect: 5 / 6,
    render(canvas, userImg) {
      const W = 500, H = 580;
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      wallBg(ctx, W, H, '#E8E4DC');

      dropShadow(ctx, () => { drawTshirt(ctx, W, H, '#D4C5A9', true); });
      drawTshirt(ctx, W, H, '#D4C5A9', true);

      if (userImg) {
        const ix = W * 0.33, iy = H * 0.28, iw = W * 0.34, ih = H * 0.34;
        ctx.save();
        ctx.beginPath();
        ctx.rect(ix, iy, iw, ih);
        ctx.clip();
        drawImageFit(ctx, userImg, ix, iy, iw, ih, 'contain');
        ctx.restore();
      }
    }
  },

  // -------- ACCESSOIRES --------
  {
    id: 'mug-white',
    name: 'Mug Blanc',
    category: 'accessoires',
    aspect: 6 / 5,
    render(canvas, userImg) {
      const W = 580, H = 480;
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      wallBg(ctx, W, H, '#D9D4CC');

      dropShadow(ctx, () => {
        const { bx, by, bw, bh } = drawMug(ctx, W, H, '#F8F8F8', true);
      });
      const { bx, by, bw, bh } = drawMug(ctx, W, H, '#F8F8F8', true);

      if (userImg) {
        const ix = bx + bw * 0.15, iy = by + bh * 0.12;
        const iw = bw * 0.65, ih = bh * 0.65;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + bw, by);
        ctx.lineTo(bx + bw - 8, by + bh);
        ctx.lineTo(bx + 8, by + bh);
        ctx.closePath();
        ctx.clip();
        drawImageFit(ctx, userImg, ix, iy, iw, ih, 'contain');
        ctx.restore();
      }
    }
  },
  {
    id: 'mug-black',
    name: 'Mug Noir',
    category: 'accessoires',
    aspect: 6 / 5,
    render(canvas, userImg) {
      const W = 580, H = 480;
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      wallBg(ctx, W, H, '#D9D4CC');

      dropShadow(ctx, () => { drawMug(ctx, W, H, '#1A1A1A', false); });
      const { bx, by, bw, bh } = drawMug(ctx, W, H, '#1A1A1A', false);

      if (userImg) {
        const ix = bx + bw * 0.15, iy = by + bh * 0.12;
        const iw = bw * 0.65, ih = bh * 0.65;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + bw, by);
        ctx.lineTo(bx + bw - 8, by + bh);
        ctx.lineTo(bx + 8, by + bh);
        ctx.closePath();
        ctx.clip();
        drawImageFit(ctx, userImg, ix, iy, iw, ih, 'contain');
        ctx.restore();
      }
    }
  },
  {
    id: 'tote-bag',
    name: 'Tote Bag',
    category: 'accessoires',
    aspect: 5 / 6,
    render(canvas, userImg) {
      const W = 480, H = 560;
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      wallBg(ctx, W, H, '#E8E4DC');

      const bx = W * 0.14, by = H * 0.20, bw = W * 0.72, bh = H * 0.72;
      const bagColor = '#C8B99A';

      dropShadow(ctx, () => {
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 8);
        ctx.fillStyle = bagColor;
        ctx.fill();
      });

      // Bag body
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 8);
      ctx.fillStyle = bagColor;
      ctx.fill();
      // Gradient
      const g = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
      g.addColorStop(0, 'rgba(255,255,255,0.15)');
      g.addColorStop(1, 'rgba(0,0,0,0.08)');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = '#9E8E78';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Stitching border
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx + 10, by + 10, bw - 20, bh - 20, 4);
      ctx.stroke();
      ctx.setLineDash([]);

      // Straps (two arcs)
      const s1x = bx + bw * 0.28, s2x = bx + bw * 0.55;
      const sy = by;
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#7A6850';
      ctx.lineCap = 'round';
      for (const sx of [s1x, s2x]) {
        ctx.beginPath();
        ctx.moveTo(sx, sy + 4);
        ctx.bezierCurveTo(sx - 8, sy - 60, sx + bw * 0.17 - 8, sy - 60, sx + bw * 0.17, sy + 4);
        ctx.stroke();
      }

      if (userImg) {
        const ix = bx + bw * 0.15, iy = by + bh * 0.15;
        const iw = bw * 0.70, ih = bh * 0.60;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(bx + 10, by + 10, bw - 20, bh - 20, 4);
        ctx.clip();
        drawImageFit(ctx, userImg, ix, iy, iw, ih, 'contain');
        ctx.restore();
      }
    }
  },
  {
    id: 'pillow-white',
    name: 'Coussin Blanc',
    category: 'accessoires',
    aspect: 1,
    render(canvas, userImg) {
      const W = 520, H = 520;
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      wallBg(ctx, W, H, '#D9D4CC');

      const px = 50, py = 50, pw = W - 100, ph = H - 100;

      dropShadow(ctx, () => {
        ctx.beginPath();
        ctx.roundRect(px, py, pw, ph, 28);
        ctx.fillStyle = '#F5F3EF';
        ctx.fill();
      });

      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 28);
      ctx.fillStyle = '#F5F3EF';
      ctx.fill();
      // Highlight gradient
      const g = ctx.createRadialGradient(W * 0.4, H * 0.35, 0, W * 0.5, H * 0.5, pw * 0.7);
      g.addColorStop(0, 'rgba(255,255,255,0.4)');
      g.addColorStop(1, 'rgba(0,0,0,0.04)');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = '#DEDAD4';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Seam border
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px + 16, py + 16, pw - 32, ph - 32, 18);
      ctx.stroke();
      ctx.setLineDash([]);

      if (userImg) {
        const m = 36;
        const ix = px + m, iy = py + m, iw = pw - m * 2, ih = ph - m * 2;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(px + 16, py + 16, pw - 32, ph - 32, 18);
        ctx.clip();
        drawImageFit(ctx, userImg, ix, iy, iw, ih, 'contain');
        ctx.restore();
      }
    }
  },
  {
    id: 'phone-case',
    name: 'Coque Telephone',
    category: 'accessoires',
    aspect: 9 / 19,
    render(canvas, userImg) {
      const W = 340, H = 680;
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      wallBg(ctx, W, H, '#D9D4CC');

      const px = 40, py = 30, pw = W - 80, ph = H - 60;
      const r = 40;

      dropShadow(ctx, () => {
        ctx.beginPath();
        ctx.roundRect(px, py, pw, ph, r);
        ctx.fillStyle = '#2A2A2A';
        ctx.fill();
      });

      // Case body
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, r);
      ctx.fillStyle = '#2A2A2A';
      ctx.fill();
      // Side highlight
      const sg = ctx.createLinearGradient(px, py, px + pw, py);
      sg.addColorStop(0, 'rgba(255,255,255,0.12)');
      sg.addColorStop(0.5, 'rgba(255,255,255,0)');
      sg.addColorStop(1, 'rgba(0,0,0,0.2)');
      ctx.fillStyle = sg;
      ctx.fill();

      // Screen cutout area (slightly inset)
      const sx = px + 10, sy = py + 10, sw = pw - 20, sh = ph - 20;
      ctx.beginPath();
      ctx.roundRect(sx, sy, sw, sh, r - 6);
      ctx.fillStyle = '#1A1A1A';
      ctx.fill();

      // Camera bump
      ctx.beginPath();
      ctx.roundRect(px + pw * 0.55, py + 16, pw * 0.32, pw * 0.32, 10);
      ctx.fillStyle = '#111111';
      ctx.fill();
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Camera lens circles
      for (const [lx, ly] of [[0.62, 0.065], [0.72, 0.065], [0.62, 0.135], [0.72, 0.135]]) {
        ctx.beginPath();
        ctx.arc(px + pw * lx, py + pw * ly, pw * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = '#222222';
        ctx.fill();
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      if (userImg) {
        const ix = sx + 20, iy = sy + pw * 0.45;
        const iw = sw - 40, ih = sh - pw * 0.45 - 20;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(sx, sy, sw, sh, r - 6);
        ctx.clip();
        drawImageFit(ctx, userImg, ix, iy, iw, ih, 'contain');
        ctx.restore();
      }
    }
  }
];
