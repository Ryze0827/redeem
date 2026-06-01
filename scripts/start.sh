#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$ROOT_DIR/run/backend.pid"
LOG_FILE="$ROOT_DIR/logs/backend.log"
PORT="${PORT:-8090}"
HOST="${HOST:-127.0.0.1}"

mkdir -p "$ROOT_DIR/run" "$ROOT_DIR/logs"

if [[ -f "$PID_FILE" ]]; then
  PID="$(cat "$PID_FILE")"
  if curl -s "http://$HOST:$PORT/health" >/dev/null 2>&1; then
    echo "服务已在后台运行: http://$HOST:$PORT (pid $PID)"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

cd "$ROOT_DIR/frontend"
if [[ ! -d node_modules ]]; then
  npm install --no-fund --no-audit
fi
npm run build

cd "$ROOT_DIR"
HOST="$HOST" PORT="$PORT" PID_FILE="$PID_FILE" LOG_FILE="$LOG_FILE" python3 backend/server.py --daemon

for _ in {1..20}; do
  PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if curl -s "http://$HOST:$PORT/health" >/dev/null 2>&1; then
    echo "服务已启动: http://$HOST:$PORT (pid $PID)"
    echo "日志文件: $LOG_FILE"
    exit 0
  fi
  sleep .2
done

if curl -s "http://$HOST:$PORT/health" >/dev/null 2>&1; then
  echo "服务已启动: http://$HOST:$PORT (pid $PID)"
  echo "日志文件: $LOG_FILE"
else
  echo "服务启动状态未知，请查看日志: $LOG_FILE"
  exit 1
fi
