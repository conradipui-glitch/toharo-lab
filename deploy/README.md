# Установка на VPS

Разовая настройка на том же сервере, где живёт Ива.

## 1. Клонировать репозиторий

```bash
sudo mkdir -p /srv && sudo chown "$USER" /srv
git clone git@github.com:conradipui-glitch/toharo-lab.git /srv/toharo-lab
cd /srv/toharo-lab
```

Репозиторий приватный, поэтому нужен доступ по SSH-ключу. Если на сервере ключа ещё нет:

```bash
ssh-keygen -t ed25519 -C "vps-toharo-lab"
cat ~/.ssh/id_ed25519.pub
```

Публичный ключ добавить в GitHub → Settings → SSH and GPG keys. Проверить: `ssh -T git@github.com`.

## 2. Node

Нужен Node 20+:

```bash
node -v
```

Если старый или отсутствует — поставить через nvm или nodesource.

## 3. Первая сборка

```bash
sudo mkdir -p /var/www && sudo chown "$USER" /var/www
chmod +x deploy/deploy.sh
FORCE=1 ./deploy/deploy.sh
```

## 4. nginx

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/toharo-lab
sudo ln -s /etc/nginx/sites-available/toharo-lab /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 5. HTTPS

Сначала направьте A-запись домена на IP сервера, потом:

```bash
sudo certbot --nginx -d toharo.space -d www.toharo.space
```

Certbot сам добавит TLS в конфиг и настроит автопродление.

---

# Как обновляется сайт

Ива коммитит пост и пушит. Дальше два варианта — выберите один.

## Вариант А: Ива деплоит сама (проще)

После пуша Ива запускает на сервере:

```bash
/srv/toharo-lab/deploy/deploy.sh
```

Ничего настраивать не нужно. Минус — сайт обновляется только когда Ива про это вспомнит.

## Вариант Б: проверка по таймеру (надёжнее)

Сервер сам раз в 5 минут смотрит, появились ли новые коммиты, и пересобирает только если появились.

```bash
sudo tee /etc/systemd/system/toharo-deploy.service >/dev/null <<'EOF'
[Unit]
Description=Rebuild toharo-lab from git
After=network-online.target

[Service]
Type=oneshot
User=YOUR_USER
WorkingDirectory=/srv/toharo-lab
ExecStart=/srv/toharo-lab/deploy/deploy.sh
EOF

sudo tee /etc/systemd/system/toharo-deploy.timer >/dev/null <<'EOF'
[Unit]
Description=Check toharo-lab for new posts

[Timer]
OnBootSec=2min
OnUnitActiveSec=5min

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now toharo-deploy.timer
```

Замените `YOUR_USER` на пользователя, от которого клонировали репозиторий.

Посмотреть, как отработало:

```bash
systemctl status toharo-deploy.timer
journalctl -u toharo-deploy.service -n 50
```

---

# Безопасность

На проде лежат **только статические файлы**. Нет ни Node-процесса, ни API, ни базы, ни форм, ни авторизации — стучаться некуда. nginx отдаёт HTML и всё.

Сборка происходит из git, а не из внешних запросов: единственный способ изменить сайт — коммит в приватный репозиторий.

Если сборка падает (например, Ива сломала frontmatter), скрипт останавливается **до** подмены файлов, и на сайте продолжает работать предыдущая версия.
