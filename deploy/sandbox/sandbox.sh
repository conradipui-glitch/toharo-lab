#!/usr/bin/env bash
#
# Управление песочницей для прогонов.
#
#   ./sandbox.sh build              собрать образ
#   ./sandbox.sh start <имя>        поднять чистый контейнер
#   ./sandbox.sh shell <имя>        войти внутрь
#   ./sandbox.sh collect <имя>      забрать артефакты в runs/<имя>/
#   ./sandbox.sh destroy <имя>      уничтожить контейнер целиком
#   ./sandbox.sh list               какие песочницы запущены
#
# Внутри рабочая папка /work. Всё, что нужно вынести наружу, кладите в /work/out.

set -euo pipefail

IMAGE="toharo-sandbox"
PREFIX="sandbox-"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNS_DIR="${RUNS_DIR:-$HOME/runs}"

# Лимиты: зависший прогон не должен уронить сервер, на котором живёт Ива
MEM_LIMIT="${MEM_LIMIT:-2g}"
CPU_LIMIT="${CPU_LIMIT:-2}"
PIDS_LIMIT="${PIDS_LIMIT:-512}"

log() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }
die() { printf '\033[31mОшибка: %s\033[0m\n' "$1" >&2; exit 1; }

need_name() {
  [ -n "${1:-}" ] || die "нужно имя прогона: ./sandbox.sh $CMD <имя>"
  case "$1" in
    *[!a-zA-Z0-9._-]*) die "имя может содержать только латиницу, цифры, точки, дефисы" ;;
  esac
}

command -v docker >/dev/null 2>&1 || die "docker не установлен. Запустите ./install.sh"

CMD="${1:-}"
NAME="${2:-}"

case "$CMD" in
  build)
    log "Собираю образ $IMAGE"
    docker build -t "$IMAGE" "$HERE"
    log "Готово"
    ;;

  start)
    need_name "$NAME"
    CONTAINER="${PREFIX}${NAME}"

    if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER"; then
      die "песочница «$NAME» уже существует. Уничтожьте её: ./sandbox.sh destroy $NAME"
    fi

    docker image inspect "$IMAGE" >/dev/null 2>&1 || die "образа нет, соберите: ./sandbox.sh build"

    log "Поднимаю песочницу «$NAME»"

    # --network bridge, а не host: контейнер не должен видеть сервисы на localhost VPS
    # --env-file не передаём: переменные окружения хоста с ключами Ивы внутрь не идут
    docker run -d \
      --name "$CONTAINER" \
      --hostname "sandbox" \
      --memory "$MEM_LIMIT" \
      --cpus "$CPU_LIMIT" \
      --pids-limit "$PIDS_LIMIT" \
      --network bridge \
      --security-opt no-new-privileges \
      --cap-drop ALL \
      "$IMAGE" >/dev/null

    log "Готово. Войти: ./sandbox.sh shell $NAME"
    echo "Внутри рабочая папка /work, артефакты кладите в /work/out"
    ;;

  shell)
    need_name "$NAME"
    docker exec -it "${PREFIX}${NAME}" bash
    ;;

  collect)
    need_name "$NAME"
    CONTAINER="${PREFIX}${NAME}"
    DEST="$RUNS_DIR/$NAME"

    docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER" || die "песочницы «$NAME» нет"

    mkdir -p "$DEST"
    log "Забираю /work/out из «$NAME» в $DEST"
    docker cp "$CONTAINER:/work/out/." "$DEST/" 2>/dev/null || die "в /work/out пусто"

    echo "Файлов забрано: $(find "$DEST" -type f | wc -l)"
    echo "Дальше: разложите их по baseline/ и with-tool/ по регламенту"
    ;;

  destroy)
    need_name "$NAME"
    CONTAINER="${PREFIX}${NAME}"

    docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER" || die "песочницы «$NAME» нет"

    log "Уничтожаю «$NAME» вместе со всем содержимым"
    docker rm -f "$CONTAINER" >/dev/null
    log "Готово"
    echo "Напоминание: если для прогона выпускались временные ключи — отзовите их"
    ;;

  list)
    log "Запущенные песочницы"
    docker ps -a --filter "name=^${PREFIX}" --format 'table {{.Names}}\t{{.Status}}\t{{.Size}}'
    ;;

  *)
    cat <<'EOF'
Управление песочницей для прогонов.

  ./sandbox.sh build           собрать образ
  ./sandbox.sh start <имя>     поднять чистый контейнер
  ./sandbox.sh shell <имя>     войти внутрь
  ./sandbox.sh collect <имя>   забрать артефакты в ~/runs/<имя>/
  ./sandbox.sh destroy <имя>   уничтожить контейнер целиком
  ./sandbox.sh list            какие песочницы есть

Внутри рабочая папка /work, артефакты кладите в /work/out.
Боевые ключи в песочницу не передаются — только временные, и отзываются после.
EOF
    [ -n "$CMD" ] && exit 1 || exit 0
    ;;
esac
