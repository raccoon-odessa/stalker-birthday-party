// Hand-shaded 20x20 pixel sprites for the five party artefacts.
// Each returns a grid of [r,g,b] (or null) that artIcon draws with a dark outline.
const S = 20;
const L = (() => { const v = [-0.5, -0.62, 0.6], n = Math.hypot(...v); return v.map(x => x / n); })();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const steps = l => l < 0.42 ? 0.45 : l < 0.68 ? 0.72 : l < 0.92 ? 1 : 1.25; // 4 tones for a pixel-art look
const tone = (c, l) => c.map(v => clamp(Math.round(v * l), 0, 255));
const lit = (c, nx, ny, nz) => { const d = nx * L[0] + ny * L[1] + nz * L[2]; return tone(c, steps(0.35 + 0.75 * Math.max(0, d))); };
const spec = (nx, ny, nz) => { const h = [L[0], L[1], L[2] + 1], m = Math.hypot(...h); return (nx * h[0] + ny * h[1] + nz * h[2]) / m > 0.94; };
const blank = () => Array.from({length:S}, () => Array(S).fill(null));

function bubble(){
  // Fused, glassy green bubbles with liquid inside.
  const g = blank(), balls = [[8, 11.5, 6.2, 0], [13.6, 7, 4.4, 1], [14.2, 14.6, 3.5, 2], [4.6, 4.8, 2.6, 0.5]];
  const glass = [96, 168, 52], liquid = [60, 120, 36];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++){
    let best = null;
    for (const [cx, cy, r, dz] of balls){
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, q = r * r - dx * dx - dy * dy;
      if (q <= 0) continue;
      const z = Math.sqrt(q) + dz;
      if (!best || z > best.z) best = {z, nx:dx / r, ny:dy / r, nz:Math.sqrt(q) / r, cy, r, y:y + 0.5};
    }
    if (!best) continue;
    const inLiquid = best.y > best.cy + best.r * 0.15;
    let c = lit(inLiquid ? liquid : glass, best.nx, best.ny, best.nz);
    if (best.nz < 0.38) c = tone(glass, 0.55);            // glassy rim
    if (spec(best.nx, best.ny, best.nz)) c = [235, 255, 210];
    g[y][x] = c;
  }
  return g;
}

function meatChunk(){
  // A lumpy, marbled chunk of raw meat with fat and dark veins.
  const g = blank(), meat = [178, 52, 46], fat = [236, 214, 176], vein = [92, 18, 20];
  const R = (a) => 6.6 + 0.9 * Math.sin(3 * a + 1) + 0.6 * Math.sin(5 * a + 2) + 0.35 * Math.sin(9 * a);
  const h = (x, y) => { const dx = (x - 10) / 1.15, dy = (y - 10.5), d = Math.hypot(dx, dy), r = R(Math.atan2(dy, dx)); return d >= r ? -1 : Math.sqrt(1 - (d / r) ** 2); };
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++){
    const px = x + 0.5, py = y + 0.5, hz = h(px, py);
    if (hz < 0) continue;
    const gx = (Math.max(0, h(px + 0.6, py)) - Math.max(0, h(px - 0.6, py))) / 1.2;
    const gy = (Math.max(0, h(px, py + 0.6)) - Math.max(0, h(px, py - 0.6))) / 1.2;
    const n = [-gx * 3, -gy * 3, 1], m = Math.hypot(...n);
    const marble = Math.sin(px * 0.85 + py * 0.45 + 2.2 * Math.sin(py * 0.42));
    const veinLine = Math.abs(Math.sin(px * 0.55 - py * 0.95 + Math.sin(px * 0.8)));
    let base = meat;
    if (marble > 0.88) base = fat; else if (veinLine < 0.1 && hz > 0.25) base = vein;
    let c = lit(base, n[0] / m, n[1] / m, n[2] / m);
    if (hz < 0.22) c = tone(meat, 0.5);                    // darker, drier edge
    g[y][x] = c;
  }
  return g;
}

function battery(){
  // A dark, smooth stone split by glowing blue cracks, with sparks around it.
  const g = blank(), stone = [74, 84, 104], glow = [130, 225, 255], core = [235, 252, 255];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++){
    const dx = (x + 0.5 - 10) / 6.4, dy = (y + 0.5 - 10.5) / 7.6, q = 1 - dx * dx - dy * dy;
    if (q <= 0) continue;
    const nz = Math.sqrt(q);
    let c = lit(stone, dx, dy, nz);
    const crack = Math.min(Math.abs(Math.sin((x + 0.5) * 1.15 + 2.1 * Math.sin((y + 0.5) * 0.7))), Math.abs(Math.sin((y + 0.5) * 1.05 + 1.8 * Math.sin((x + 0.5) * 0.6) + 1)));
    if (crack < 0.16 && q > 0.12) c = crack < 0.06 ? core : glow;
    else if (spec(dx, dy, nz)) c = [190, 205, 225];
    g[y][x] = c;
  }
  [[2, 3], [1, 4], [17, 2], [18, 3], [17, 17], [2, 16], [1, 15], [18, 9]].forEach(([x, y]) => { g[y][x] = glow; });
  return g;
}

function wrenched(){
  // A thick strand of dark matter wrenched into a spiral, with deep diagonal grooves.
  const g = blank(), bark = [128, 84, 46], hot = [222, 140, 62];
  for (let y = 1; y < 19; y++){
    const yy = y + 0.5, cx = 10 + 2.6 * Math.sin(yy * 0.33 - 0.6), w = 4.1 - 1.3 * Math.abs(yy - 10) / 9;
    for (let x = 0; x < S; x++){
      const u = (x + 0.5 - cx) / w;
      if (Math.abs(u) >= 1) continue;
      const nz = Math.sqrt(1 - u * u), band = Math.sin(Math.asin(u) * 2.2 + yy * 0.95);
      let c = lit(bark, u, -0.15 + 0.5 * band * 0.4, nz);
      if (band > 0.55) c = tone(bark, 0.4);                 // groove of the twist
      else if (band < -0.75 && Math.abs(u) < 0.6) c = hot;  // lit ridge
      g[y][x] = c;
    }
  }
  return g;
}

function spring(){
  // A copper coil: three and a half open turns, back half in shadow.
  const g = blank(), depth = Array.from({length:S}, () => Array(S).fill(-9)), copper = [200, 116, 54];
  const turns = 3.5, N = 1200, rx = 6.6, ry = 2.4, top = 4.2, drop = 11.6, tube = 1.15;
  for (let i = 0; i <= N; i++){
    const t = i / N * turns * 2 * Math.PI, cx = 10 + rx * Math.cos(t), cy = top + (i / N) * drop + ry * Math.sin(t), z = Math.sin(t);
    for (let y = Math.floor(cy - 2); y <= Math.ceil(cy + 2); y++) for (let x = Math.floor(cx - 2); x <= Math.ceil(cx + 2); x++){
      if (x < 0 || y < 0 || x >= S || y >= S) continue;
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, q = tube * tube - dx * dx - dy * dy;
      if (q <= 0 || z < depth[y][x]) continue;
      depth[y][x] = z;
      const nz = Math.sqrt(q) / tube;
      let c = z < 0 ? tone(copper, 0.45) : lit(copper, dx / tube, dy / tube - 0.3, nz);
      if (z > 0.3 && dy < -0.2) c = [250, 200, 140];       // top highlight on the front turns
      g[y][x] = c;
    }
  }
  return g;
}

const MAKERS = {'Bubble':bubble, 'Meat Chunk':meatChunk, 'Battery':battery, 'Wrenched':wrenched, 'Spring':spring};
const CACHE = {};
export const SPRITE_SIZE = S;
export function sprite(name){
  if (!MAKERS[name]) return null;
  return CACHE[name] || (CACHE[name] = MAKERS[name]());
}
