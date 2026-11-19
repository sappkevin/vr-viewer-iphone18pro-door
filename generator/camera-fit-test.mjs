#!/usr/bin/env node
// Camera-window HEIGHT test coupon: three SEPARATE small tiles (A/B/C), same width (64.0 mm)
// and corner radius (r8, the case-maker value that fixed the too-round shape), bracketing the
// window HEIGHT to find the one that seats the plateau. Each tile has mouse-ear tabs for bed
// adhesion. Prints flat, no supports. Labels DEBOSSED. Ears are a thin 0.6 mm pad — snap/trim.
//
//   A: 40.1 mm   B: 41.1 mm   C: 42.1 mm   tall      (all 64.0 mm wide, corner r8)
//
//   node camera-fit-test.mjs  ->  ../calibration/Camera window height test A-B-C (PETG, tiles).stl

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DOOR_GEN = process.env.DOOR_GEN || '/Users/ksapp/Development/CardboardXR/docs/door-generator';
const { default: Module } = await import(join(DOOR_GEN, 'vendor/manifold.js'));
const { toSTL } = await import(join(DOOR_GEN, 'stl.js'));
const M = await Module(); M.setup();
const CS = M.CrossSection;

const T = 3.0;                       // tile thickness
const LM = 14, RM = 6, VM = 6;       // tile margins: left (label), right, vertical
const EAR_R = 6, EAR_H = 0.6;        // mouse-ear radius / thickness
const SPACING = 74;                  // tile centre-to-centre (vertical), clears the ears
const VARIANTS = [                   // top -> bottom; same width + radius, different height
  { id: 'A', w: 64.0, h: 40.10, r: 8, y:  SPACING },
  { id: 'B', w: 64.0, h: 41.10, r: 8, y:  0 },
  { id: 'C', w: 64.0, h: 42.10, r: 8, y: -SPACING },
];

// --- 2D helpers ---
function rrect(w, h, r, cx = 0, cy = 0) {
  return CS.square([w - 2 * r, h - 2 * r], true).translate([cx, cy]).offset(r, 'Round', 2, 64);
}
function seg(p1, p2, sw) {            // straight stroke p1->p2, width sw, wound CCW (solid)
  const [x1, y1] = p1, [x2, y2] = p2;
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1e-6;
  const ax = dx / L * sw / 2, ay = dy / L * sw / 2, nx = -dy / L * sw / 2, ny = dx / L * sw / 2;
  return new CS([[
    [x1 - ax + nx, y1 - ay + ny], [x1 - ax - nx, y1 - ay - ny],
    [x2 + ax - nx, y2 + ay - ny], [x2 + ax + nx, y2 + ay + ny],
  ]]);
}
function ring(ro, ri, cx, cy) { return CS.circle(ro, 64).subtract(CS.circle(ri, 64)).translate([cx, cy]); }
function letter(id) {
  const sw = 1.3;
  if (id === 'A') return CS.union([seg([-3, -4], [0, 4], sw), seg([0, 4], [3, -4], sw), seg([-1.6, -0.5], [1.6, -0.5], sw)]);
  if (id === 'B') {
    const half = (cy) => ring(2.0, 2.0 - sw, -2.5, cy).intersect(CS.square([6, 4.2], true).translate([0.5, cy]));
    return seg([-2.5, -4], [-2.5, 4], sw).add(half(2.0)).add(half(-2.0));
  }
  return ring(3.6, 3.6 - sw, 0, 0).subtract(CS.square([4, 4.0], true).translate([2.6, 0]));   // C
}

// --- 3D helpers ---
function prism(cs, za, zb) { return M.Manifold.extrude(cs, zb - za).translate([0, 0, za]); }
function disc(r, h, cx, cy) { return M.Manifold.cylinder(h, r, r, 48).translate([cx, cy, 0]); }

// --- one tile (centred at origin) ---
function tile(v) {
  const W = v.w + LM + RM, H = v.h + 2 * VM;
  const winCx = (LM - RM) / 2;                 // window shifted right to leave a label margin
  const labelX = winCx - v.w / 2 - 7;
  let t = prism(rrect(W, H, 4), 0, T);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) t = t.add(disc(EAR_R, EAR_H, sx * W / 2, sy * H / 2));  // ears
  t = t.subtract(prism(rrect(v.w, v.h, v.r, winCx, 0), -1, T + 1));                     // window (per-variant radius)
  t = t.subtract(prism(letter(v.id).translate([labelX, 0]), T - 1.0, T + 0.2));        // debossed label
  return t;
}

let part = null;
for (const v of VARIANTS) {
  const tl = tile(v).translate([0, v.y, 0]);
  part = part ? part.add(tl) : tl;
}

const pieces = part.decompose().length;
const bb = part.boundingBox();
console.log(`fit-test ${part.volume().toFixed(0)} mm³ | pieces ${pieces} (want 3) | ` +
  `bbox ${bb.min.map(v => v.toFixed(1))} .. ${bb.max.map(v => v.toFixed(1))} | ${pieces === 3 ? 'OK' : 'CHECK PIECES'}`);
for (const v of VARIANTS) console.log(`  ${v.id}: ${v.w.toFixed(2)} x ${v.h.toFixed(2)} mm, corner r${v.r}`);

const OUT = join(HERE, '..', 'calibration');
mkdirSync(OUT, { recursive: true });
const file = join(OUT, 'Camera window height test A-B-C (PETG, tiles).stl');
writeFileSync(file, toSTL(part));
console.log('wrote', file);
