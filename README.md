# VR Viewer Door - iPhone 18 Pro

Remix of the [Mobile VR Viewer for Modern Smartphones](https://makerworld.com/en/models/1192481) by [@arturmentado](https://makerworld.com/en/@arturmentado), adding an iPhone 18 Pro door.

Generated with the [CardboardXR door generator](https://brenpoly.github.io/CardboardXR/door-generator/) using Manifold CSG — proper boolean geometry, watertight mesh, no manual modeling artifacts.

## Variants

| Variant | Vents | Description |
|---|---|---|
| **Standard** | 342 diamond | Door with flat camera through-window, hinge knuckles, latch |
| **MagSafe** | 150 diamond | Standard door + ø58mm MagSafe cooler opening with a solid ring border |

Each variant ships as a door STL and a combined 3MF (door + 4 TPU locators). The four
TPU corner locators are shared between variants (one set of STLs).

## Vent Pattern

Diamond (square rotated 45°) holes instead of circles. For these vertical through-holes,
diamonds give straight toolpaths and uniform wall thickness between holes — circles pinch
to a thin web where they're closest.

Each diamond is **4mm point-to-point** on a 3.5 × 2.75mm checkerboard, giving ~1.5mm
minimum walls and ~41% open area. This is deliberately coarse: an earlier 2mm / ~900-hole
field caused heavy PETG stringing and filament pile-ups because the nozzle had to hop
between hundreds of tiny islands on every layer (and the small first-layer islands adhered
poorly). The coarser field cuts hole count to ~330 (standard) / ~140 (MagSafe) — far fewer
travel moves — while *increasing* airflow, and leaves more contiguous first-layer material
for bed adhesion.

## Camera Window

The iPhone 18 Pro's camera plateau protrudes **4.89 mm** off the back (Apple drawing:
2.78 mm back→plateau + 2.11 mm plateau→lens glass), far more than the 2 mm door is thick.
Rather than a raised housing (which would force the door onto its side to print, with
supports), the window is a **flat through-opening**: the plateau pokes straight through the
2 mm plate and sticks out ~2.9 mm past the back, while the phone's flat body seats on the
inner face. This keeps the door printable **flat, outer-face-down, with no supports**.

The window opening is **64.0 × 37.6 mm** — the plateau's caliper-measured base footprint
(**59.0 × 34.6 mm**, the widest point flush to the body) plus clearance of **2.5 mm per side
in width** and 1.5 mm top/bottom. The extra width beyond the nominal 1.5 mm compensates for
~2 mm of measured print undersize (shrinkage / perimeter inset) on the first print — the
printed opening came out too narrow to clear the plateau. Sizing to the *base* matters
because the plateau flares outward toward its base, so an opening matched to the narrower top
would catch the curved sides. A 1:1 paper test template for this opening is in `templates/`
(see `templates/PAPER-TEST.md`).

> Only the camera opening was widened; the door body width is unchanged for now. The overall
> headset width still needs a matching adjustment (follow-up).

## Printing

- **Material:** PETG for the door, TPU for locator pads
- **Orientation:** Flat, **outer face down** (files are pre-oriented). With no raised
  housing the door lies flat on its back, hinge knuckles and latch pointing up — so it prints
  **without supports**, and the teardrop hinge pin hole is self-supporting (point up).
- **Nozzle:** 0.4mm
- **Layer height:** 0.20mm

## iPhone 18 Pro Dimensions

From [Apple's dimensional drawing](https://developer.apple.com/accessories/) (2026-09-09):

| Parameter | Value |
|---|---|
| Width | 71.85 mm |
| Length | 150.01 mm |
| Thickness (body) | 8.75 mm |
| Corner radius | R12.00 (R11.0 used for locator fit) |
| Camera plateau (base) | 59.0 × 34.6 mm, R12.00 corners — caliper-measured (wide horizontal bar) |
| Camera protrusion | 4.89 mm (2.78 back→plateau + 2.11 plateau→lens glass) |
| Camera window opening | 64.0 × 37.6 mm (2.5 mm clearance sides / 1.5 mm top-bottom) |
| MagSafe ring | ø57.50 mm, centre 77.74 mm from top edge |

MagSafe variant: ø58mm through-opening (ring + 0.5mm clearance) centred on the magnet ring,
with a ~4mm solid unvented border.

> The iPhone 18 Pro uses the wide horizontal camera plateau (introduced on the 17 Pro), spanning ~81% of the back width — not the square corner camera of the 15/16 Pro.

## Files

```
stl/           Door STLs (standard + MagSafe) + 4 shared TPU locator STLs
3mf/           Combined 3MFs (door + locators), one per variant
blender/       Blender project (reference only)
```

## Generation

Generated programmatically from the CardboardXR door generator's `buildDoor()` with Manifold
WASM for CSG — the same engine as the [browser tool](https://brenpoly.github.io/CardboardXR/door-generator/).
The vent cutter was swapped from circle to diamond, a MagSafe opening + solid-border vent
keepout were added, and a flat camera through-window was cut over the plateau; all mating
interfaces (outline, hinge, latch, locator pockets) are unchanged, and the door still prints
flat with no supports.

## License

This is a remix. See the [original model](https://makerworld.com/en/models/1192481) for license terms.
