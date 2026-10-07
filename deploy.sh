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
docker build -t "$IMAGE" .
if [ -f "$DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$DIR/.env"
  set +a
fi
docker stack deploy -c stack.yml --with-registry-auth "$STACK"
docker service ls | grep "$STACK" || true
echo "Listo. Abre https://bnbtradingacademy.com"
