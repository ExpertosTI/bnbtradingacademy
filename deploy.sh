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
docker build -t "$IMAGE" .
docker stack deploy -c stack.yml "$STACK"
docker service ls --filter "name=${STACK}_"
echo "Listo. Abre https://bnbtradingacademy.com"
