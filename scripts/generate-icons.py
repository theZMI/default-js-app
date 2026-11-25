#!/usr/bin/env python3
"""
Все иконки приложения из одной картинки: resources/icon.png (квадрат, лучше 1024×1024).

    make icons                 # = python3 scripts/generate-icons.py
    python3 scripts/generate-icons.py --placeholder   # нарисовать иконку-заглушку в resources/icon.png

Что создаётся:
  public/favicon.ico, public/img/icons/*          — веб/PWA (manifest.webmanifest, index.html)
  public/img/cordova-icon/android/*               — legacy-иконки Android (config.xml cordova-проекта)
  public/img/cordova-screen/android/logo.png      — иконка на сплэш-экране Android 12+
  src/assets/images/logo.png                      — логотип на странице «О приложении»
  ../<проект>-cordova/res/android/adaptive/ic_launcher_foreground.png — адаптивная иконка Android 8+
  ../<проект>-cordova/res/ios/icon-1024.png       — иконка iOS (без прозрачности — требование App Store)

Цвет фона адаптивной иконки и iOS — BACKGROUND ниже; его же держите в
res/android/adaptive/ic_launcher_background.xml cordova-проекта.
Нужен Pillow: pip3 install pillow
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CORDOVA = ROOT + '-cordova'
SOURCE = os.path.join(ROOT, 'resources', 'icon.png')
BACKGROUND = (0, 0, 0, 255)


def out(path, img):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)
    print('  ' + os.path.relpath(path, os.path.dirname(ROOT)))


def resized(img, size):
    return img.resize((size, size), Image.LANCZOS)


def on_background(img, size, scale=1.0, bg=BACKGROUND):
    """Иконка по центру квадрата size×size, занимает долю scale, фон — bg."""
    canvas = Image.new('RGBA', (size, size), bg)
    inner = resized(img, int(size * scale))
    off = (size - inner.width) // 2
    canvas.alpha_composite(inner, (off, off))
    return canvas


def placeholder():
    size = 1024
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    grad = Image.new('RGBA', (size, size))
    gd = ImageDraw.Draw(grad)
    for y in range(size):
        t = y / size
        gd.line([(0, y), (size, y)], fill=(int(0 + 40 * t), int(102 - 40 * t), int(255 - 60 * t), 255))
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=220, fill=255)
    img.paste(grad, (0, 0), mask)
    draw = ImageDraw.Draw(img)
    font = None
    for f in ['/System/Library/Fonts/Supplemental/Arial Bold.ttf', '/System/Library/Fonts/Helvetica.ttc',
              '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(f):
            font = ImageFont.truetype(f, 420)
            break
    font = font or ImageFont.load_default()
    draw.text((size / 2, size / 2), 'JS', fill=(255, 255, 255, 255), font=font, anchor='mm')
    out(SOURCE, img)


def main():
    if '--placeholder' in sys.argv:
        placeholder()
    if not os.path.exists(SOURCE):
        sys.exit(f'Нет {SOURCE} — положите туда квадратную иконку (1024×1024) или запустите с --placeholder')

    src = Image.open(SOURCE).convert('RGBA')
    pub = os.path.join(ROOT, 'public')

    print('Веб / PWA:')
    resized(src, 48).save(os.path.join(pub, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
    print('  public/favicon.ico')
    for size in (192, 512):
        out(os.path.join(pub, f'img/icons/android-chrome-{size}x{size}.png'), resized(src, size))
        # maskable: Android обрезает до круга/«сквиркла» — содержимое в безопасной зоне 80%
        out(os.path.join(pub, f'img/icons/android-chrome-maskable-{size}x{size}.png'), on_background(src, size, 0.8))
    # apple-touch-icon: iOS не любит прозрачность (заливает чёрным) — сразу на фоне
    out(os.path.join(pub, 'img/icons/apple-touch-icon.png'), on_background(src, 180))
    for size in (120, 152, 180):
        out(os.path.join(pub, f'img/icons/apple-touch-icon-{size}x{size}.png'), on_background(src, size))

    print('Cordova (из www/ приложения):')
    for name, size in (('ldpi', 36), ('mdpi', 48), ('hdpi', 72), ('xhdpi', 96), ('xxhdpi', 144), ('xxxhdpi', 192)):
        out(os.path.join(pub, f'img/cordova-icon/android/drawable-{name}-icon.png'), resized(src, size))
    # Сплэш Android 12+: система обрезает иконку кругом диаметром 2/3 картинки. Квадрат иконки
    # должен целиком влезть в этот круг (диагональ ≤ диаметра) — иначе срезаются углы: 0.45
    out(os.path.join(pub, 'img/cordova-screen/android/logo.png'), on_background(src, 432, 0.45, (0, 0, 0, 0)))
    out(os.path.join(ROOT, 'src/assets/images/logo.png'), resized(src, 256))

    if os.path.isdir(CORDOVA):
        print(f'Cordova-проект ({os.path.basename(CORDOVA)}):')
        # Адаптивная иконка: 108dp, видимая часть — центральные 72dp (66%)
        out(os.path.join(CORDOVA, 'res/android/adaptive/ic_launcher_foreground.png'),
            on_background(src, 432, 0.62, (0, 0, 0, 0)))
        out(os.path.join(CORDOVA, 'res/ios/icon-1024.png'), on_background(src, 1024).convert('RGB'))
    else:
        print(f'Cordova-проект {CORDOVA} не найден — его иконки пропущены')


if __name__ == '__main__':
    main()
