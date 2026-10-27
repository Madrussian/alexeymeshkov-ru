# alexeymeshkov.ru

Личный сайт: AI PM-портфолио, Side, ecom-ai / mp-ai, лаборатория (evo-brain-sim).
Статика, собранная `build.py` (Jinja2). Хостинг — GitHub Pages (ветка `main`, корень).
Языки: RU (корень `/`), EN (`/en/`), AR (`/ar/`, справа налево), ZH (`/zh/`).

## Как править тексты
1. Тексты страниц — `src/content/<язык>/{home,evo,essay}.html` (в начале — мета-теги страницы).
   Ссылки на страницы сайта пишутся как `{{ p('/lab/evo-brain/') }}` — язык подставится сам; картинки — обычным путём.
2. Шапка, подвал, переключатель языка — `src/templates/base.html`, их тексты — `src/i18n.yaml`.
3. `pip install jinja2 pyyaml && python3 build.py` → коммит. `python3 build.py --check` — проверить, что сборка актуальна.
Не править сгенерированные `index.html` руками: следующая сборка их перезапишет.

## Структура
- `index.html`, `style.css`, `world.js` — главная; в шапке живая мини-версия симуляции
- `lab/evo-brain/` — разбор эксперимента из репо `Madrussian/evo-brain-sim` (картинки в `img/`)
- `CNAME` — домен для Pages; `.nojekyll` — отдавать файлы как есть

## Деплой (один раз)
1. Settings → Pages → Source: Deploy from a branch → `main` / `(root)`.
2. DNS в Timeweb для `alexeymeshkov.ru`:
   - A `@` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - CNAME `www` → `madrussian.github.io`
3. Settings → Pages → Custom domain `alexeymeshkov.ru` → дождаться проверки → Enforce HTTPS.

## Обновить лабораторию
Картинки берутся из `evo-brain-sim/results/` (png → webp, gif → mp4 через ffmpeg).
