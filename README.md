# VR Viewer Door - iPhone 18 Pro

Remix of the [Mobile VR Viewer for Modern Smartphones](https://makerworld.com/en/models/1192481) by [@arturmentado](https://makerworld.com/en/@arturmentado), adding an iPhone 18 Pro door.

Generated with the [CardboardXR door generator](https://brenpoly.github.io/CardboardXR/door-generator/) using Manifold CSG — proper boolean geometry, watertight mesh, no manual modeling artifacts.

## What's Included

| File | Material | Description |
|---|---|---|
| Door (PETG, outer face down) | PETG | Door with 1,011 circular vent holes, camera opening, hinge knuckles, latch |
| TPU locator × 4 | TPU | Corner grip pads with dovetail pockets |
| 3MF (PETG + TPU locators) | Both | Combined project with all 5 parts |

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
| MagSafe ring | ø57.50 mm |

> The iPhone 18 Pro uses the wide horizontal camera plateau (introduced on the 17 Pro), spanning ~81% of the back width — not the square corner camera of the 15/16 Pro.

## Files

```
stl/           Door STL + 4 TPU locator STLs
3mf/           Combined 3MF (door + locators)
blender/       Blender project (reference only)
```

## Generation

The door was generated programmatically using the CardboardXR door generator's `buildDoor()` with Manifold WASM for CSG operations — the same engine used by the [browser tool](https://brenpoly.github.io/CardboardXR/door-generator/).

## License

This is a remix. See the [original model](https://makerworld.com/en/models/1192481) for license terms.
