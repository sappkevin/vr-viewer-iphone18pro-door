#!/usr/bin/env node
// Generate iPhone 18 Pro door variants with DIAMOND vents:
//   1. Standard door
//   2. MagSafe variant (ø58 cooler opening + solid ring border)
// Uses the modified door module (diamond cutter + MagSafe) with Manifold CSG.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
// Clone https://github.com/brenpoly/CardboardXR and point this at docs/door-generator —
// it provides the Manifold WASM, fflate and STL writer. Override with env DOOR_GEN.
const DOOR_GEN = process.env.DOOR_GEN || '/Users/ksapp/Development/CardboardXR/docs/door-generator';
const DOOR_MOD = join(HERE, 'door-diamond-magsafe.js');   // the modified door module (diamond vents + MagSafe)

const { default: Module } = await import(join(DOOR_GEN, 'vendor/manifold.js'));
const { buildDoor, check } = await import(DOOR_MOD);
const { toSTL } = await import(join(DOOR_GEN, 'stl.js'));
const { zipSync, strToU8 } = await import(join(DOOR_GEN, 'vendor/fflate.js'));

// iPhone 18 Pro — from Apple's dimensional drawing (2026-09-09) + caliper measurement
const base18 = {
  length: 150.01, width: 71.85, thickness: 8.75, cornerRadius: 11.0,
  // Camera plateau measured on the actual phone (calipers): 59.0 x 34.6 mm at the BASE
  // (widest point, flush to the body). The window is sized to this base so the curved/
  // tapered camera bump drops straight in. Centered: left = (71.85 - 59.0) / 2 = 6.425.
  camera: { top: 3.0, left: 6.425, width: 59.0, height: 34.6, radius: 12.0 },
  // Window = plateau 59.0 x 34.6 + 1.5 mm clearance all round -> 62.0 x 37.6 mm opening.
  cameraClearance: 1.5,
  // Raised housing on the outer face so the camera stack clears and the phone seats flush.
  // Protrusion 4.89 mm (Apple drawing: 2.78 back->plateau + 2.11 plateau->lens glass);
  // height 4.0 -> ~5.9 mm cavity from the phone back (~1 mm over the lens tips).
  cameraBump: { height: 4.0, wall: 2.0 },
};

// MagSafe ring: ø57.50mm, centre 77.74mm from the top edge (drawing page 4).
// Door coords: y = length/2 - 77.74 = -2.735; centred on x.
const MAGSAFE = {
  x: 0,
  y: base18.length / 2 - 77.74,
  openR: 29.0,    // ø58 opening (57.5mm ring + 0.5mm clearance)
  keepout: 33.0,  // vents keep out to 33mm → ~4mm solid ring border
};

const VARIANTS = [
  { name: 'iPhone 18 Pro', file: 'Door - iPhone 18 Pro', spec: { ...base18 } },
  { name: 'iPhone 18 Pro MagSafe', file: 'Door - iPhone 18 Pro with MagSafe cooler opening', spec: { ...base18, magsafe: MAGSAFE } },
];

const STL_OUT = join(HERE, '..', 'stl');
const MF_OUT = join(HERE, '..', '3mf');
mkdirSync(STL_OUT, { recursive: true });
mkdirSync(MF_OUT, { recursive: true });

// --- 3MF helpers (match worker.js) ---
function meshArrays(manifold) {
  const mesh = manifold.getMesh();
  const np = mesh.numProp, P = mesh.vertProperties;
  const pos = new Float32Array(mesh.numVert * 3);
  for (let i = 0; i < mesh.numVert; i++) { pos[3*i] = P[i*np]; pos[3*i+1] = P[i*np+1]; pos[3*i+2] = P[i*np+2]; }
  return { pos, idx: new Uint32Array(mesh.triVerts) };
}
function xmlEsc(s) { return String(s).replace(/[<>&"]/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;' }[c])); }
function to3MF(title, parts) {
  const objs = [], comps = [];
  parts.forEach(({ name, arrays }, i) => {
    const id = i + 1, { pos, idx } = arrays;
    const v = []; for (let k = 0; k < pos.length; k += 3) v.push(`<vertex x="${pos[k].toFixed(4)}" y="${pos[k+1].toFixed(4)}" z="${pos[k+2].toFixed(4)}"/>`);
    const t = []; for (let k = 0; k < idx.length; k += 3) t.push(`<triangle v1="${idx[k]}" v2="${idx[k+1]}" v3="${idx[k+2]}"/>`);
    objs.push(`<object id="${id}" name="${xmlEsc(name)}" type="model"><mesh><vertices>${v.join('')}</vertices><triangles>${t.join('')}</triangles></mesh></object>`);
    comps.push(`<component objectid="${id}"/>`);
  });
  const oid = parts.length + 1;
  const model = `<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">` +
    `<metadata name="Title">${xmlEsc(title)}</metadata><metadata name="Application">CardboardXR door generator</metadata>` +
    `<resources>${objs.join('')}<object id="${oid}" name="${xmlEsc(title)}" type="model"><components>${comps.join('')}</components></object></resources>` +
    `<build><item objectid="${oid}" transform="1 0 0 0 1 0 0 0 1 128 128 0"/></build></model>`;
  const ct = '<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>';
  const rels = '<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>';
  return zipSync({ '[Content_Types].xml': strToU8(ct), '_rels/.rels': strToU8(rels), '3D/3dmodel.model': strToU8(model) });
}

for (const variant of VARIANTS) {
  const { errors, warnings } = check(variant.spec);
  if (errors.length) { console.error(`[${variant.name}] errors:`, errors); process.exit(1); }
  if (warnings.length) console.log(`[${variant.name}] warnings:`, warnings.join('; '));

  const M = await Module(); M.setup();
  const r = buildDoor(M, variant.spec);

  const doorPieces = r.door.decompose().length;
  const locPieces = r.locators.map(l => l.mesh.decompose().length);
  const ok = doorPieces === 1 && locPieces.every(n => n === 1);
  console.log(`[${variant.name}] ${r.holes} vents | door ${r.door.volume().toFixed(0)} mm³ | pieces ${doorPieces} | locators [${locPieces}] | ${ok ? 'OK' : 'MULTI-PIECE!'}`);

  // Door STL (prints camera-side up — hinge/latch need supports)
  writeFileSync(join(STL_OUT, `${variant.file} (PETG, camera side up).stl`), toSTL(r.door));

  // Locator STLs (shared geometry, but write per-variant names only for the standard door to avoid dupes)
  if (variant.name === 'iPhone 18 Pro') {
    for (const l of r.locators) writeFileSync(join(STL_OUT, `Door - iPhone 18 Pro - ${l.name}.stl`), toSTL(l.mesh));
  }

  // 3MF (door + 4 locators)
  const parts = [
    { name: `Door (PETG) - ${variant.name}`, arrays: meshArrays(r.door) },
    ...r.locators.map(l => ({ name: l.name, arrays: meshArrays(l.mesh) })),
  ];
  writeFileSync(join(MF_OUT, `${variant.file} (PETG + TPU locators).3mf`), to3MF(variant.file, parts));
}

console.log('\nDone.');
