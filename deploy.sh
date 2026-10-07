#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-https://github.com/ExpertosTI/bnbtradingacademy.git}"
DIR="${DIR:-/opt/bnbtradingacademy}"
IMAGE="${IMAGE:-bnbtradingacademy:latest}"
STACK="${STACK:-bnbacademy}"

mkdir -p "$DIR"
if [ -d "$DIR/.git" ]; then
  git -C "$DIR" fetch origin
  git -C "$DIR" reset --hard origin/main
else
  git clone "$REPO" "$DIR"
fi

cd "$DIR"
rm -f .env .env.local

# Libera caché de build. No borra imágenes de servicios en marcha ni volúmenes.
docker builder prune -af >/dev/null
docker image prune -f >/dev/null

docker build -t "$IMAGE" .
docker stack deploy -c stack.yml "$STACK"
docker service update --force --detach=true --image "$IMAGE" "${STACK}_web"
docker service ls --filter "name=${STACK}_"
echo "Listo. Abre https://bnbtradingacademy.com"
