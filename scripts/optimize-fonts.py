#!/usr/bin/env python3
import os
import subprocess
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FONTS_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "fonts")
FONTS_DIR = os.path.abspath(FONTS_DIR)

def optimize_newsreader():
    normal_var_path = os.path.join(FONTS_DIR, "newsreader-latin-wght-normal.woff2")
    italic_var_path = os.path.join(FONTS_DIR, "newsreader-latin-wght-italic.woff2")

    print("[Fonts] Instantiating Newsreader 400 normal...")
    tt400 = TTFont(normal_var_path)
    static_400 = instantiateVariableFont(tt400, {"wght": 400, "opsz": 18})
    static_400.flavor = "woff2"
    out_400 = os.path.join(FONTS_DIR, "newsreader-latin-400-normal.woff2")
    static_400.save(out_400)
    print(f"  -> Generated {out_400} ({os.path.getsize(out_400):,} bytes)")

    print("[Fonts] Instantiating Newsreader 700 bold...")
    tt700 = TTFont(normal_var_path)
    static_700 = instantiateVariableFont(tt700, {"wght": 700, "opsz": 18})
    static_700.flavor = "woff2"
    out_700 = os.path.join(FONTS_DIR, "newsreader-latin-700-normal.woff2")
    static_700.save(out_700)
    print(f"  -> Generated {out_700} ({os.path.getsize(out_700):,} bytes)")

    print("[Fonts] Instantiating Newsreader 400 italic...")
    tt_it = TTFont(italic_var_path)
    static_it = instantiateVariableFont(tt_it, {"wght": 400, "opsz": 18})
    static_it.flavor = "woff2"
    out_it = os.path.join(FONTS_DIR, "newsreader-latin-400-italic.woff2")
    static_it.save(out_it)
    print(f"  -> Generated {out_it} ({os.path.getsize(out_it):,} bytes)")

def optimize_unifraktur():
    gothic_path = os.path.join(FONTS_DIR, "unifrakturmaguntia-latin-400-normal.woff2")
    out_gothic = os.path.join(FONTS_DIR, "unifrakturmaguntia-latin-subset.woff2")
    
    # Characters needed for "Firman Lestari", 404, and Latin basic alphabet
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 -./"
    
    print("[Fonts] Subsetting UnifrakturMaguntia to Latin subset...")
    subprocess.run([
        "pyftsubset", gothic_path,
        f"--text={chars}",
        "--flavor=woff2",
        f"--output-file={out_gothic}"
    ], check=True)
    print(f"  -> Generated {out_gothic} ({os.path.getsize(out_gothic):,} bytes)")

if __name__ == "__main__":
    optimize_newsreader()
    optimize_unifraktur()
    print("[Fonts] Font optimization complete!")
