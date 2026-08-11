# Образ песочницы для прогонов.
#
# Намеренно небогатый: чем меньше внутри, тем меньше поверхность и тем
# честнее прогон — если инструменту чего-то не хватает, это часть результата,
# а не то, что мы молча доставили заранее.

FROM node:22-bookworm-slim

# Базовое, без чего не поставится почти ничего
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      git \
      python3 \
      python3-pip \
      python3-venv \
      build-essential \
    && rm -rf /var/lib/apt/lists/*

# Работаем не от root: даже внутри контейнера код не должен быть всесилен
RUN useradd --create-home --shell /bin/bash runner \
    && mkdir -p /work/out \
    && chown -R runner:runner /work

USER runner
WORKDIR /work

# Артефакты прогона складываются сюда, отсюда их забирает sandbox.sh collect
VOLUME ["/work/out"]

CMD ["sleep", "infinity"]
