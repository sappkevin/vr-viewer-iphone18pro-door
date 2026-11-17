# VR Viewer Door - iPhone 18 Pro

Remix of the [Mobile VR Viewer for Modern Smartphones](https://makerworld.com/en/models/1192481) by [@arturmentado](https://makerworld.com/en/@arturmentado), adding an iPhone 18 Pro door.

Generated with the [CardboardXR door generator](https://brenpoly.github.io/CardboardXR/door-generator/) using Manifold CSG — proper boolean geometry, watertight mesh, no manual modeling artifacts.

## Variants

| Variant | Vents | Description |
|---|---|---|
| **Standard** | 915 diamond | Door with camera opening, hinge knuckles, latch |
| **MagSafe** | 454 diamond | Standard door + ø58mm MagSafe cooler opening with a solid ring border |

Each variant ships as a door STL and a combined 3MF (door + 4 TPU locators). The four
TPU corner locators are shared between variants (one set of STLs).

## Vent Pattern

Diamond (square rotated 45°) holes instead of circles. For these vertical through-holes
printed outer-face-down, diamonds give straight toolpaths (faster, less stringing across
~900 holes) and uniform wall thickness between holes — circles pinch to a thin web where
they're closest. Each diamond is 2mm point-to-point with ~1.5mm walls between.

## Printing

- **Material:** PETG for the door, TPU for locator pads
- **Orientation:** Outer face down (files are pre-oriented)
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
| Camera plateau | 58.01 × 38.5 mm, R12.00 corners (wide horizontal bar) |
| Camera clearance | 1.5 mm |
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
The vent cutter was swapped from circle to diamond and a MagSafe opening + solid-border vent
keepout were added; all mating interfaces (outline, hinge, latch, locator pockets) are unchanged.

## License

This is a remix. See the [original model](https://makerworld.com/en/models/1192481) for license terms.
