#!/usr/bin/env python3
"""
Desenha os caracteres acentuados (Latin-1: ã, ç, é, õ, ü, ñ...) nas fontes Star4000.

As fontes originais do WeatherStar trazem esses glifos mapeados, porém VAZIOS, então
"Condições" aparecia como "Condi es". Este script compõe cada glifo acentuado a partir
da letra base + um acento desenhado à mão (polígonos simples, no estilo da fonte).

Uso (a partir da raiz do projeto):
    pip install fonttools brotli
    python3 tools/add-font-accents.py server/fonts

É idempotente: só preenche glifos que ainda estão vazios.
Depois de rodar, execute `npm run build` para copiar as fontes para docs/ (GitHub Pages).
"""
import glob
import os
import sys
import unicodedata

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

# Formas dos acentos. Coordenadas em unidades da fonte Star4000 (cap height = 1423),
# origem = centro horizontal / base do acento. Serão escaladas para cada fonte.
ACCENTS = {
    0x0301: ('above', [[(-70, 0), (40, 0), (150, 240), (30, 240)]]),  # agudo
    0x0300: ('above', [[(70, 0), (-40, 0), (-150, 240), (-30, 240)]]),  # grave
    0x0302: ('above', [[(-170, 0), (-60, 0), (0, 95), (60, 0), (170, 0), (55, 240), (-55, 240)]]),  # circunflexo
    0x0308: ('above', [[(-175, 0), (-75, 0), (-75, 110), (-175, 110)], [(75, 0), (175, 0), (175, 110), (75, 110)]]),  # trema
    0x030A: ('above', [[(-85, 0), (85, 0), (85, 170), (-85, 170)]]),  # anel (tratado à parte: vazado)
    0x0327: ('below', [[(-25, 0), (65, 0), (65, -100), (125, -170), (75, -240), (-45, -215), (10, -170), (-25, -100)]]),  # cedilha
}


def tilde_polygon():
    center = [(-165, 40), (-105, 125), (-40, 160), (25, 110), (95, 80), (150, 120), (175, 185)]
    top = [(x, y + 40) for x, y in center]
    bottom = [(x, y - 40) for x, y in reversed(center)]
    return top + bottom


ACCENTS[0x0303] = ('above', [tilde_polygon()])


def signed_area(poly):
    return sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(poly, poly[1:] + poly[:1])) / 2


def draw_polygon(pen, poly, clockwise=True):
    area = signed_area(poly)
    # TrueType: contornos externos no sentido horário (área negativa com y para cima)
    if (area > 0) == clockwise:
        poly = list(reversed(poly))
    pen.moveTo(poly[0])
    for pt in poly[1:]:
        pen.lineTo(pt)
    pen.closePath()


def glyph_bounds(glyph_set, name):
    pen = BoundsPen(glyph_set)
    glyph_set[name].draw(pen)
    return pen.bounds


def split_contours(glyph_set, name):
    rec = RecordingPen()
    glyph_set[name].draw(rec)
    contours, cur = [], []
    for op, args in rec.value:
        cur.append((op, args))
        if op == 'closePath':
            contours.append(cur)
            cur = []
    return contours


def replay(pen, contour):
    for op, args in contour:
        getattr(pen, op)(*args)


def contour_bounds(contour):
    pts = [pt for _, args in contour for pt in args]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)


# Fontes cujos glifos acentuados existem mas estão errados (apontam para outros desenhos):
# nelas os glifos são sempre redesenhados, mesmo não estando vazios.
FORCE_REDRAW = {'Star4000 Large.ttf'}


def patch_font(path):
    font = TTFont(path)
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    glyf, hmtx = font['glyf'], font['hmtx']

    xh_name, cap_name = cmap.get(ord('x')), cmap.get(ord('H'))
    if not xh_name or not cap_name:
        print(f'  pulando {path}: sem x/H')
        return
    x_bounds, cap_bounds = glyph_bounds(gs, xh_name), glyph_bounds(gs, cap_name)
    if not x_bounds or not cap_bounds:  # fontes só de números (ex.: Large Compressed Numbers)
        print(f'  pulando {os.path.basename(path)}: sem letras')
        return
    x_height, cap_height = x_bounds[3], cap_bounds[3]
    scale = cap_height / 1423.0

    done = 0
    for cp in range(0xC0, 0x100):
        decomposed = unicodedata.normalize('NFD', chr(cp))
        if len(decomposed) != 2 or ord(decomposed[1]) not in ACCENTS:
            continue
        base_cp, mark = ord(decomposed[0]), ord(decomposed[1])
        name, base_name = cmap.get(cp), cmap.get(base_cp)
        if not name or not base_name:
            continue
        if glyf[name].numberOfContours != 0 and os.path.basename(path) not in FORCE_REDRAW:  # já tem desenho
            continue

        is_upper = chr(base_cp).isupper()
        base_contours = split_contours(gs, base_name)
        base_adv = hmtx[base_name][0]
        if base_cp == ord('i'):  # sem o pingo: o acento ocupa o lugar dele
            base_contours = [c for c in base_contours if contour_bounds(c)[1] < 700]
        kept_bounds = [contour_bounds(c) for c in base_contours]
        x_min = min(b[0] for b in kept_bounds)
        x_max = max(b[2] for b in kept_bounds)
        y_max = max(b[3] for b in kept_bounds)
        center_x = (x_min + x_max) / 2

        placement, shapes = ACCENTS[mark]
        if placement == 'above':
            top_ref = max(y_max, cap_height) if is_upper else max(x_height, y_max)
            origin_y = top_ref + (85 if is_upper else 105) * scale
        else:
            origin_y = 0

        pen = TTGlyphPen(gs)
        for contour in base_contours:
            replay(pen, contour)
        for shape in shapes:
            poly = [(center_x + x * scale, origin_y + y * scale) for x, y in shape]
            if mark == 0x030A:  # anel vazado
                draw_polygon(pen, poly)
                inner = [(center_x + x * scale * 0.45, origin_y + (y * 0.55 + 40) * scale) for x, y in shape]
                draw_polygon(pen, inner, clockwise=False)
            else:
                draw_polygon(pen, poly)
        glyph = pen.glyph()
        glyph.recalcBounds(glyf)
        glyf[name] = glyph
        hmtx[name] = (base_adv, int(glyph.xMin))
        done += 1

    for table in ('hdmx', 'LTSH', 'VDMX'):  # tabelas de cache que ficam desatualizadas
        if table in font:
            del font[table]
    font.save(path)
    print(f'  {os.path.basename(path)}: {done} glifos desenhados')


if __name__ == '__main__':
    folder = sys.argv[1] if len(sys.argv) > 1 else 'server/fonts'
    for ext in ('woff', 'ttf'):
        for path in sorted(glob.glob(os.path.join(folder, f'*.{ext}'))):
            patch_font(path)
