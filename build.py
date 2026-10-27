"""Сборка статики: src/templates + src/content/<lang>/*.html + src/i18n.yaml → HTML в корне репо.

python3 build.py          # собрать все языки
python3 build.py --check  # собрать во временную папку и сравнить с тем, что в репо (для CI/проверки)

ru — в корне (/), остальные — /en/, /ar/, /zh/. Ссылки на страницы в контенте пишутся
как {{ p('/lab/evo-brain/') }} — p() добавит префикс языка. Ассеты (/lab/evo-brain/img/…) — без p().
"""
from __future__ import annotations

import sys
from pathlib import Path

import yaml
from jinja2 import Environment, FileSystemLoader, StrictUndefined

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
PAGES = {"home": "/", "evo": "/lab/evo-brain/", "essay": "/lab/brain-and-ai/"}


def load_content(path: Path) -> tuple[dict, str]:
    raw = path.read_text(encoding="utf-8")
    _, fm, body = raw.split("---\n", 2)
    return yaml.safe_load(fm), body.rstrip("\n")


def build(out: Path) -> list[Path]:
    cfg = yaml.safe_load((SRC / "i18n.yaml").read_text(encoding="utf-8"))
    env = Environment(loader=FileSystemLoader(SRC / "templates"), undefined=StrictUndefined,
                      autoescape=False, keep_trailing_newline=True)
    base = env.get_template("base.html")
    written: list[Path] = []
    for lang in cfg["langs"]:
        prefix = lambda l: "" if l == "ru" else f"/{l}"  # noqa: E731
        p = lambda path, _l=lang: (prefix(_l) + path) if path.startswith("/") else path  # noqa: E731
        for page, path in PAGES.items():
            src = SRC / "content" / lang / f"{page}.html"
            if not src.exists():
                continue
            meta, body_tpl = load_content(src)
            nav_href = (lambda a, _p=page: a if _p == "home" else p("/" + a))
            body = env.from_string(body_tpl).render(p=p)
            html = base.render(lang=lang, t=cfg[lang], langs=[l for l in cfg["langs"]
                               if (SRC / "content" / l / f"{page}.html").exists()],
                               lang_names=cfg["lang_names"], site=cfg["site"], page=page, path=path,
                               meta=meta, body=body, p=p, prefix=prefix, nav_href=nav_href)
            dst = out / (prefix(lang).lstrip("/")) / path.lstrip("/") / "index.html"
            dst.parent.mkdir(parents=True, exist_ok=True)
            dst.write_text(html, encoding="utf-8")
            written.append(dst)
    return written


if __name__ == "__main__":
    if "--check" in sys.argv:
        import filecmp
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            files = build(Path(tmp))
            stale = [f.relative_to(tmp) for f in files
                     if not (ROOT / f.relative_to(tmp)).exists()
                     or not filecmp.cmp(f, ROOT / f.relative_to(tmp), shallow=False)]
        print("устарели:", *stale, sep="\n  ") if stale else print("сборка актуальна")
        sys.exit(1 if stale else 0)
    for f in build(ROOT):
        print(f.relative_to(ROOT))
