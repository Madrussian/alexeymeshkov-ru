# alexeymeshkov.ru

Личный сайт: AI PM-портфолио, Side, ecom-ai / mp-ai, лаборатория (evo-brain-sim).
Статика без сборки. Хостинг — GitHub Pages (ветка `main`, корень).

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
