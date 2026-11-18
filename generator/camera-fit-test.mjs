#!/usr/bin/env node
// Camera-window fit-test coupon: three windows (A/B/C) bracketing the opening size, so you
// can drop the real iPhone 18 Pro camera plateau into each and see which clears best.
// Prints flat, outer-face-down, NO supports (same as the door). Labels are DEBOSSED (recessed)
// so they don't create bumps on the phone-facing face.
//
//   A: 64.0 x 37.60 mm   (current door design)
//   B: 64.5 x 37.85 mm   (+0.5 wide, +0.25 tall)
//   C: 65.0 x 38.10 mm   (+1.0 wide, +0.50 tall)
//
//   node camera-fit-test.mjs  ->  ../calibration/Camera window fit test A-B-C (PETG, flat).stl

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DOOR_GEN = process.env.DOOR_GEN || '/Users/ksapp/Development/CardboardXR/docs/door-generator';
const { default: Module } = await import(join(DOOR_GEN, 'vendor/manifold.js'));
const { toSTL } = await import(join(DOOR_GEN, 'stl.js'));
const M = await Module(); M.setup();
const CS = M.CrossSection;

const T = 3.0;                       // plate thickness
const WIN_R = 13.5;                  // window corner radius (plateau r12 + 1.5 clearance)
const SPACING = 48;                  // window centre-to-centre (vertical)
const VARIANTS = [                   // top -> bottom
  { id: 'A', w: 64.0, h: 37.60, y:  SPACING },
  { id: 'B', w: 64.5, h: 37.85, y:  0 },
  { id: 'C', w: 65.0, h: 38.10, y: -SPACING },
];
const PLATE_W = 90, PLATE_H = 150;
const LETTER_X = -39;                // label column, left of the windows

// --- 2D helpers ---
function rrect(w, h, r, cx = 0, cy = 0) {
  return CS.square([w - 2 * r, h - 2 * r], true).translate([cx, cy]).offset(r, 'Round', 2, 64);
}
// a straight stroke from p1 to p2 of width sw (as a quad polygon, ends extended by sw/2)
function seg(p1, p2, sw) {
  const [x1, y1] = p1, [x2, y2] = p2;
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1e-6;
  const ax = dx / L * sw / 2, ay = dy / L * sw / 2;   // axis half-extension
  const nx = -dy / L * sw / 2, ny = dx / L * sw / 2;  // perpendicular half-width
  return new CS([[              // wound CCW so Manifold treats it as solid, not a hole
    [x1 - ax + nx, y1 - ay + ny],
    [x1 - ax - nx, y1 - ay - ny],
    [x2 + ax - nx, y2 + ay - ny],
    [x2 + ax + nx, y2 + ay + ny],
  ]]);
}
function ring(ro, ri, cx, cy) { return CS.circle(ro, 64).subtract(CS.circle(ri, 64)).translate([cx, cy]); }

// --- letters A B C (centred on origin, ~8 mm tall), stroke 1.3 ---
function letter(id) {
  const sw = 1.3;
  if (id === 'A') {
    return CS.union([
      seg([-3, -4], [0, 4], sw), seg([0, 4], [3, -4], sw), seg([-1.6, -0.5], [1.6, -0.5], sw),
    ]);
  }
  if (id === 'B') {
    let b = seg([-2.5, -4], [-2.5, 4], sw);                 // spine
    const half = (cy) => ring(2.0, 2.0 - sw, -2.5, cy)      // right half of each bump
      .intersect(CS.square([6, 4.2], true).translate([-2.5 + 3, cy]));
    return b.add(half(2.0)).add(half(-2.0));
  }
  // C: ring open on the right
  return ring(3.6, 3.6 - sw, 0, 0)
    .subtract(CS.square([4, 4.0], true).translate([2.6, 0]));
}

// --- build plate ---
function prism(cs, za, zb) { return M.Manifold.extrude(cs, zb - za).translate([0, 0, za]); }
let plate = prism(rrect(PLATE_W, PLATE_H, 4), 0, T);

for (const v of VARIANTS) {
  plate = plate.subtract(prism(rrect(v.w, v.h, WIN_R, 0, v.y), -1, T + 1));          // window through-cut
  plate = plate.subtract(prism(letter(v.id).translate([LETTER_X, v.y]), T - 1.0, T + 0.2)); // debossed label
}

const pieces = plate.decompose().length;
const bb = plate.boundingBox();
console.log(`fit-test ${plate.volume().toFixed(0)} mm³ | pieces ${pieces} | ` +
  `bbox ${bb.min.map(v => v.toFixed(1))} .. ${bb.max.map(v => v.toFixed(1))} | ${pieces === 1 ? 'OK' : 'MULTI-PIECE!'}`);
for (const v of VARIANTS) console.log(`  ${v.id}: ${v.w.toFixed(2)} x ${v.h.toFixed(2)} mm`);

const OUT = join(HERE, '..', 'calibration');
mkdirSync(OUT, { recursive: true });
const file = join(OUT, 'Camera window fit test A-B-C (PETG, flat).stl');
writeFileSync(file, toSTL(plate));
console.log('wrote', file);
