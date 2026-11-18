#!/usr/bin/env node
// X-Y hole-compensation calibration coupon for the iPhone 18 Pro door print.
//
// A flat 3 mm plate (printed outer-face-down, flat, NO supports — same as the door) with:
//   - three round holes of known diameter (10, 15, 20 mm) for the numeric comp value
//   - the actual camera window (64.0 x 37.6 mm rounded rect) to check it clears the plateau
//
// Print with the SAME process profile (nozzle, layer height, wall count, flow) and the SAME
// filament you'll use for the door — the hole error comes mostly from the inner wall, so the
// settings must match. Measure each hole with calipers, then:
//     X-Y hole compensation = (nominal - measured) / 2        [RADIUS offset, hence / 2]
// Positive makes holes bigger. Typical honest value is 0.1-0.2 mm, not 1 mm.
//
//   node calibration-coupon.mjs   ->  ../calibration/XY hole comp coupon (PETG, flat).stl

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DOOR_GEN = process.env.DOOR_GEN || '/Users/ksapp/Development/CardboardXR/docs/door-generator';
const { default: Module } = await import(join(DOOR_GEN, 'vendor/manifold.js'));
const { toSTL } = await import(join(DOOR_GEN, 'stl.js'));

const M = await Module(); M.setup();

const T = 3.0;                 // plate thickness
const W = 78.0, H = 72.0;      // plate footprint
const HOLES = [20, 15, 10];    // nominal diameters, left -> right
const HOLE_X = [-23, 0, 22];   // centres across the top
const HOLE_Y = 24;
const WIN = { w: 64.0, h: 37.6, r: 13.5, y: -8 };   // the real camera window opening

// rounded rect (w x h, corner r), centred at (cx, cy): shrink by r then round-offset by r
function rrect(w, h, r, cx = 0, cy = 0) {
  const inner = M.CrossSection.square([w - 2 * r, h - 2 * r], true).translate([cx, cy]);
  return inner.offset(r, 'Round', 2, 64);
}
function prism(cs, za, zb) { return M.Manifold.extrude(cs, zb - za).translate([0, 0, za]); }

let plate = prism(rrect(W, H, 4), 0, T);

// round holes (go a bit past both faces so the cut is clean)
for (let i = 0; i < HOLES.length; i++) {
  const cyl = M.Manifold.cylinder(T + 2, HOLES[i] / 2, HOLES[i] / 2, 96, true)
    .translate([HOLE_X[i], HOLE_Y, T / 2]);
  plate = plate.subtract(cyl);
}

// the actual camera window
plate = plate.subtract(prism(rrect(WIN.w, WIN.h, WIN.r, 0, WIN.y), -1, T + 1));

const pieces = plate.decompose().length;
const bb = plate.boundingBox();
console.log(`coupon ${plate.volume().toFixed(0)} mm³ | pieces ${pieces} | ` +
  `bbox ${bb.min.map(v => v.toFixed(1))} .. ${bb.max.map(v => v.toFixed(1))} | ${pieces === 1 ? 'OK' : 'MULTI-PIECE!'}`);
console.log(`holes (L->R): ${HOLES.map(d => d + 'mm').join(', ')} | window ${WIN.w} x ${WIN.h} mm`);

const OUT = join(HERE, '..', 'calibration');
mkdirSync(OUT, { recursive: true });
const file = join(OUT, 'XY hole comp coupon (PETG, flat).stl');
writeFileSync(file, toSTL(plate));
console.log('wrote', file);
