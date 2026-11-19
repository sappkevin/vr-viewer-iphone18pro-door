#!/usr/bin/env python3
# Generate a 1:1 paper fit-test template (SVG -> PDF) for the iPhone 18 Pro camera window.
# Prints on US Letter at 100% / Actual Size. Tests the XY fit of the camera window against
# the real phone's camera plateau (the depth/housing is 3D-only and not testable on paper).
#
#   python3 paper-test.py        # writes templates/*.svg and, if rsvg-convert exists, *.pdf
import os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT  = os.path.join(HERE, "..", "templates")
os.makedirs(OUT, exist_ok=True)

# --- page + geometry (mm) ---
PW, PH = 215.9, 279.4          # US Letter
cx     = PW / 2                # page centre x
top    = 20.0                  # phone top edge, y from page top

PHONE  = dict(w=71.85, h=150.01, r=12.0, t=0.0)  # real phone back (align to this)
PLATE  = dict(w=59.0,  h=34.6,   r=7.0,  t=3.0)  # camera plateau (measured base, ~r7) — must fit inside
#                                                 # t = distance from phone top edge to plateau top
CLX, CLY = 2.5, 2.75                             # window clearance per side (test-print-confirmed, variant A)
DROP = 3.0                                       # window nudged down 3.0 mm (slight; incl. shrinkage allowance)
# window (CUT line) = plateau + clearance -> 64.0 x 40.1 mm opening, r8 corners (the r8 is the
# critical fit value: a too-round window pinches the corners narrower than the plateau). The window
# is shifted DOWN by DROP, so it is asymmetric over the plateau: ~0.25 mm cover at the top edge,
# ~5.25 mm clearance at the bottom.
WINDOW = dict(w=PLATE["w"]+2*CLX, h=PLATE["h"]+2*CLY, r=8.0, t=PLATE["t"]-CLY+DROP)
MAG    = dict(d=57.5,  t=77.74)                  # MagSafe ring (MagSafe variant)

def rrect(d, **style):
    x = cx - d["w"] / 2
    y = top + d["t"]
    s = ";".join(f"{k.replace('_','-')}:{v}" for k, v in style.items())
    return (f'<rect x="{x:.3f}" y="{y:.3f}" width="{d["w"]:.3f}" height="{d["h"]:.3f}" '
            f'rx="{d["r"]:.3f}" ry="{d["r"]:.3f}" fill="none" style="{s}"/>')

def text(x, y, s, size=3.2, anchor="start", weight="normal"):
    return (f'<text x="{x:.2f}" y="{y:.2f}" font-family="Helvetica,Arial,sans-serif" '
            f'font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" '
            f'fill="#000">{s}</text>')

def line(x1, y1, x2, y2, w=0.3, dash=None):
    da = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="#000" stroke-width="{w}"{da}/>'

el = []
# title
el.append(text(12, 11, "iPhone 18 Pro — Camera Window Fit Test", 4.4, weight="bold"))
el.append(text(12, 16, "Print on US Letter at 100% / Actual Size (not &#8216;fit to page&#8217;). Check the rulers before trusting the fit.", 2.9))

# reference shapes
el.append(rrect(PHONE,  stroke="#000", stroke_width=0.3))                                   # phone outline
el.append(rrect(PLATE,  stroke="#000", stroke_width=0.4,  stroke_dasharray="2.2,1.3"))      # plateau (dashed)
el.append(rrect(WINDOW, stroke="#000", stroke_width=1.0))                                    # CUT window (bold)

# MagSafe ring
mcy = top + MAG["t"]
el.append(f'<circle cx="{cx:.3f}" cy="{mcy:.3f}" r="{MAG["d"]/2:.3f}" fill="none" stroke="#000" stroke-width="0.3" stroke-dasharray="2,1.5"/>')
el.append(f'<line x1="{cx-3:.2f}" y1="{mcy:.2f}" x2="{cx+3:.2f}" y2="{mcy:.2f}" stroke="#000" stroke-width="0.25"/>')
el.append(f'<line x1="{cx:.2f}" y1="{mcy-3:.2f}" x2="{cx:.2f}" y2="{mcy+3:.2f}" stroke="#000" stroke-width="0.25"/>')

# window centre crosshair
wcy = top + WINDOW["t"] + WINDOW["h"]/2
el.append(line(cx-4, wcy, cx+4, wcy, 0.25))
el.append(line(cx, wcy-4, cx, wcy+4, 0.25))

# dimension: window width (below window)
wy = top + WINDOW["t"] + WINDOW["h"] + 4
wl, wr = cx - WINDOW["w"]/2, cx + WINDOW["w"]/2
el.append(line(wl, wy, wr, wy, 0.25))
el.append(line(wl, wy-1.5, wl, wy+1.5, 0.25)); el.append(line(wr, wy-1.5, wr, wy+1.5, 0.25))
el.append(text(cx, wy+3.5, f'{WINDOW["w"]:.1f} mm window', 2.8, anchor="middle"))

# dimension: window height (left of window)
hx = cx - WINDOW["w"]/2 - 4
ht, hb = top + WINDOW["t"], top + WINDOW["t"] + WINDOW["h"]
el.append(line(hx, ht, hx, hb, 0.25))
el.append(line(hx-1.5, ht, hx+1.5, ht, 0.25)); el.append(line(hx-1.5, hb, hx+1.5, hb, 0.25))
el.append(text(hx-1.5, (ht+hb)/2, f'{WINDOW["h"]:.1f} mm', 2.8, anchor="end"))

# distance from top edge to plateau
el.append(line(cx + WINDOW["w"]/2 + 3, top, cx + WINDOW["w"]/2 + 3, top + PLATE["t"], 0.25))
el.append(text(cx + WINDOW["w"]/2 + 4.5, top + 2.5, "Plateau top: 3.0 mm below phone top", 2.6))

# right-side callouts (leader text)
rx = cx + PHONE["w"]/2 + 3
el.append(text(rx, top + 8,  "— CUT this window (bold line)", 3.0, weight="bold"))
el.append(text(rx, top + 13, "— Plateau (dashed): must sit inside", 2.9))
el.append(text(rx, top + 18, "   the window with a gap all round", 2.9))
el.append(text(rx, top + 23, "— Flat through-window (no housing)", 2.7))
el.append(text(cx + PHONE["w"]/2 + 3, mcy, "— MagSafe ring ø57.5 (MagSafe variant)", 2.7))

# --- calibration rulers ---
# horizontal 100 mm
rhx, rhy = cx - 50, 265
el.append(line(rhx, rhy, rhx + 100, rhy, 0.3))
for i in range(0, 101, 10):
    big = i in (0, 50, 100)
    el.append(line(rhx + i, rhy, rhx + i, rhy - (4 if big else 2), 0.3))
el.append(text(cx, rhy + 4.5, "100 mm — must measure exactly 100 mm at 100% / Actual Size", 2.9, anchor="middle"))
# vertical 50 mm
rvx, rvy = 18, 211
el.append(line(rvx, rvy, rvx, rvy + 50, 0.3))
for i in range(0, 51, 10):
    big = i in (0, 50)
    el.append(line(rvx, rvy + i, rvx + (4 if big else 2), rvy + i, 0.3))
el.append(text(rvx + 5, rvy + 27, "50 mm — must measure exactly 50 mm at 100% / Actual Size", 2.7))

# --- instructions ---
iy = 180
steps = [
    "How to test:",
    "1.  Print at 100% / Actual Size. Confirm the rulers read 100 mm and 50 mm — if not, fix scale and reprint.",
    "2.  Lay this sheet on the BACK of the phone; line the phone outline up with the real edges and top.",
    "3.  The camera plateau should sit inside the bold CUT window: ~2.5 mm gap at the sides, and (window dropped 3.0 mm for shrinkage) the window top edge is ~0.25 mm INSIDE the plateau top; bottom gap ~5.75 mm.",
    "4.  Optional: cut out the bold window and check the plateau pokes through cleanly.",
]
for i, s in enumerate(steps):
    el.append(text(12, iy + i*5, s, 3.0, weight=("bold" if i == 0 else "normal")))
el.append(text(12, PH - 4, "iPhone 18 Pro VR viewer door — 1:1 camera fit template", 2.5))

svg = (f'<?xml version="1.0" encoding="UTF-8"?>\n'
       f'<svg xmlns="http://www.w3.org/2000/svg" width="{PW}mm" height="{PH}mm" '
       f'viewBox="0 0 {PW} {PH}">\n'
       f'<rect x="0" y="0" width="{PW}" height="{PH}" fill="#fff"/>\n'
       + "\n".join(el) + "\n</svg>\n")

svg_path = os.path.join(OUT, "iPhone 18 Pro - camera fit test (1-to-1, Letter).svg")
with open(svg_path, "w") as f:
    f.write(svg)
print("wrote", svg_path)

pdf_path = svg_path[:-4] + ".pdf"
try:
    subprocess.run(["rsvg-convert", "-f", "pdf", "-o", pdf_path, svg_path], check=True)
    print("wrote", pdf_path)
except (FileNotFoundError, subprocess.CalledProcessError) as e:
    print("PDF conversion skipped (rsvg-convert not available):", e, file=sys.stderr)
