#!/usr/bin/env bash
#
# Деплой toharo.lab на VPS.
#
#   ./deploy/deploy.sh
#
# Тянет изменения, собирает статику и атомарно подменяет её в вебруте.
# Если сборка падает — старый сайт продолжает работать нетронутым.

set -euo pipefail

REPO_DIR="${REPO_DIR:-/srv/toharo-lab}"
WEB_ROOT="${WEB_ROOT:-/var/www/toharo-lab}"
BRANCH="${BRANCH:-main}"

log() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }

cd "$REPO_DIR"

log "Обновляю код"
git fetch --quiet origin "$BRANCH"

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL" = "$REMOTE" ] && [ "${FORCE:-0}" != "1" ]; then
  echo "Изменений нет ($LOCAL). Нечего собирать."
  echo "Пересобрать принудительно: FORCE=1 $0"
  exit 0
fi

git reset --hard "origin/$BRANCH"

log "Ставлю зависимости"
npm ci --no-audit --no-fund

log "Собираю статику"
# prebuild сам прогонит проверку постов и уронит сборку на кривом frontmatter
npm run build

if [ ! -f out/index.html ]; then
  echo "Ошибка: out/index.html не создан, сборка неполная. Сайт не трогаю." >&2
  exit 1
fi

log "Публикую"
RELEASE="${WEB_ROOT}.new"
rm -rf "$RELEASE"
cp -r out "$RELEASE"

# Атомарная подмена: посетитель видит либо старую версию, либо новую, но не полусобранную
if [ -d "$WEB_ROOT" ]; then
  rm -rf "${WEB_ROOT}.old"
  mv "$WEB_ROOT" "${WEB_ROOT}.old"
fi
mv "$RELEASE" "$WEB_ROOT"
rm -rf "${WEB_ROOT}.old"

log "Готово: $(git rev-parse --short HEAD)"
