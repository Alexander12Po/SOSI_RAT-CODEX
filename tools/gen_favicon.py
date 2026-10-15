#!/usr/bin/env python3
"""Genera el favicon de SOSI CODEX: gato programador minimalista (azul electrico
sobre fondo negro) -> assets/img/favicon.png + favicon.ico.
Reemplazar este script si se dispone del archivo original del logo."""
from PIL import Image, ImageDraw

S = 512  # lienzo maestro (se reduce a 32/64 para nitidez en pestana)
BLUE = (37, 99, 235)      # azul principal
ELEC = (59, 130, 246)     # azul electrico
LIGHT = (147, 197, 253)   # resaltos
DARK = (17, 28, 53)       # azul muy oscuro
BG = (5, 9, 20)           # fondo negro azulado

img = Image.new("RGBA", (S, S), BG + (255,))
d = ImageDraw.Draw(img)

# --- disco de fondo sutil con borde azul ---
d.ellipse([16, 16, S - 16, S - 16], fill=DARK, outline=ELEC, width=6)

# --- laptop (base trapezoidal, mirando a la derecha) ---
d.rounded_rectangle([120, 330, 430, 356], radius=12, fill=ELEC)          # base
d.polygon([(150, 330), (400, 330), (380, 250), (170, 250)], fill=BLUE)   # pantalla inclinada
d.polygon([(178, 318), (372, 318), (356, 262), (194, 262)], fill=BG)     # interior pantalla
# lineas de codigo en pantalla
for i, y in enumerate((272, 284, 296)):
    w = [120, 90, 105][i]
    d.line([(206, y), (206 + w, y)], fill=LIGHT, width=6)

# --- cabeza del gato detras/sobre la laptop, mirando a la derecha ---
head = [190, 90, 380, 260]
d.ellipse(head, fill=BLUE)
# orejas triangulares
d.polygon([(215, 130), (240, 55), (285, 110)], fill=BLUE)
d.polygon([(300, 105), (345, 50), (365, 125)], fill=BLUE)
d.polygon([(232, 118), (246, 78), (272, 112)], fill=DARK)
d.polygon([(312, 108), (338, 72), (350, 118)], fill=DARK)
# hocico hacia la derecha
d.ellipse([330, 160, 400, 225], fill=BLUE)
# ojos (mirada a la derecha)
d.ellipse([295, 145, 320, 172], fill=BG); d.ellipse([302, 152, 314, 166], fill=LIGHT)
d.ellipse([345, 148, 368, 174], fill=BG); d.ellipse([354, 155, 365, 168], fill=LIGHT)
# nariz
d.polygon([(388, 185), (402, 196), (388, 206)], fill=LIGHT)
# bigotes
for dy in (-8, 6, 20):
    d.line([(398, 198 + dy // 2), (448, 190 + dy)], fill=LIGHT, width=4)

# --- audifonos sobre la cabeza ---
d.arc([180, 60, 390, 240], start=200, end=340, fill=LIGHT, width=14)   # diadema
d.rounded_rectangle([168, 140, 212, 210], radius=18, fill=ELEC)        # copa izq
d.rounded_rectangle([352, 130, 396, 200], radius=18, fill=ELEC)        # copa der

# --- exportar ---
img.save("assets/img/favicon.png")
for sz in (32, 64):
    r = img.resize((sz, sz), Image.LANCZOS)
    r.save(f"assets/img/favicon-{sz}.png")
img.resize((48, 48), Image.LANCZOS).save(
    "assets/img/favicon.ico", sizes=[(32, 32), (48, 48)])
print("favicon generado OK")
