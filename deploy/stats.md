# Статистика сайта

Сайт статический, поэтому счётчик не нужен: **всё уже пишется в логи nginx**. Каждый запрос страницы, каждый переход по партнёрской ссылке `/go/<id>/` — строка в `access.log`. Остаётся только красиво её показать.

Такой подход даёт три вещи бесплатно: ноль JavaScript на сайте, ноль сторонних сервисов, которым уходят данные читателей, и ноль новых точек входа для атаки. Блокировщики рекламы его тоже не режут, поэтому цифры честнее, чем у обычных счётчиков.

## Установка GoAccess

```bash
sudo apt update && sudo apt install -y goaccess
```

## Конфигурация

```bash
sudo tee /etc/goaccess/toharo.conf >/dev/null <<'EOF'
log-format COMBINED
log-file /var/log/nginx/access.log
output /var/www/stats/index.html

# Игнорируем свои же заходы — подставьте свой IP
# exclude-ip 203.0.113.5

# Боты отдельно, чтобы не путали картину
ignore-crawlers false
real-os true
persist true
restore true
db-path /var/lib/goaccess
EOF

sudo mkdir -p /var/lib/goaccess /var/www/stats
```

Флаги `persist` и `restore` копят историю в базе: без них после ротации логов старые данные пропадут.

## Обновление отчёта по расписанию

```bash
sudo tee /etc/systemd/system/toharo-stats.service >/dev/null <<'EOF'
[Unit]
Description=Rebuild GoAccess report for toharo.space

[Service]
Type=oneshot
ExecStart=/usr/bin/goaccess --config-file=/etc/goaccess/toharo.conf
EOF

sudo tee /etc/systemd/system/toharo-stats.timer >/dev/null <<'EOF'
[Unit]
Description=Refresh toharo stats every 15 minutes

[Timer]
OnBootSec=5min
OnUnitActiveSec=15min

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now toharo-stats.timer
```

## Доступ к отчёту

Отчёт содержит IP-адреса читателей — наружу его отдавать нельзя. Закройте паролем:

```bash
sudo apt install -y apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd-stats toharo
```

Добавьте в конфиг nginx (в тот же `server`-блок):

```nginx
location /stats/ {
    alias /var/www/stats/;
    index index.html;
    auth_basic "Статистика";
    auth_basic_user_file /etc/nginx/.htpasswd-stats;
}
```

Затем `sudo nginx -t && sudo systemctl reload nginx`. Отчёт — на `https://toharo.space/stats/`.

Пароль от статистики в репозиторий не попадает: он живёт в `/etc/nginx/.htpasswd-stats` на сервере.

## Что смотреть

| Метрика в GoAccess | Что означает |
| --- | --- |
| Requested Files | Самые читаемые статьи. Ищите `/blog/<slug>/` |
| `/go/<id>/` в Requested Files | Клики по партнёрским ссылкам — конверсия каждой |
| Referring Sites | Откуда приходят: Telegram, поиск, чужие сайты |
| Unique Visitors | Читатели за период, а не просмотры |
| Not Found URLs | Битые ссылки. Если сюда попал `/blog/<slug>/` — вы удалили пост, на который ссылались |
| Operating Systems / Browsers | Мобильный трафик: если больше половины, верстку проверяйте с телефона |

Отдельно полезно: строки от `GPTBot`, `ClaudeBot`, `PerplexityBot` в разделе User Agents показывают, что AI-поисковики читают сайт. Это ранний сигнал, что материалы попадают в их выдачу.

## Если понадобится больше

GoAccess не покажет глубину прокрутки и время на странице — для этого нужен JS-счётчик. Если дорастёте до такой потребности, ставьте **Umami** на тот же VPS: он self-hosted, без cookies и не передаёт данные наружу. Но это отдельный сервис с базой, то есть плюс одна вещь, которую надо обновлять и охранять. Пока хватает логов — не усложняйте.
