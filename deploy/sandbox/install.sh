#!/usr/bin/env bash
#
# Ставит Docker на VPS. Разово.
#
#   ./install.sh
#
# Ставится из официального репозитория Docker, а не из пакетов дистрибутива:
# в Debian и Ubuntu лежат заметно устаревшие версии.

set -euo pipefail

log() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }
die() { printf '\033[31mОшибка: %s\033[0m\n' "$1" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "запускать от root или через sudo"

if command -v docker >/dev/null 2>&1; then
  log "Docker уже установлен: $(docker --version)"
else
  log "Ставлю зависимости"
  apt-get update
  apt-get install -y --no-install-recommends ca-certificates curl gnupg

  log "Добавляю ключ и репозиторий Docker"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/debian/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/${ID} ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list

  log "Ставлю Docker"
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin
fi

log "Проверяю, что демон отвечает"
systemctl enable --now docker
docker info >/dev/null 2>&1 || die "докер установлен, но демон не отвечает"

log "Готово"
docker --version
echo
echo "Дальше:"
echo "  ./sandbox.sh build            собрать образ песочницы"
echo "  ./sandbox.sh start <имя>      поднять контейнер под прогон"
