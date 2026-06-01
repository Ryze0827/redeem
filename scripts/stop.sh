#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$ROOT_DIR/run/backend.pid"

if [[ ! -f "$PID_FILE" ]]; then
  echo "未找到后台服务 PID 文件。"
  exit 0
fi

PID="$(cat "$PID_FILE")"
if [[ -z "$PID" ]]; then
  rm -f "$PID_FILE"
  echo "服务未运行。"
  exit 0
fi

kill "$PID" 2>/dev/null || true
for _ in {1..20}; do
  if ! curl -s "http://127.0.0.1:8090/health" >/dev/null 2>&1; then
    rm -f "$PID_FILE"
    echo "服务已停止。"
    exit 0
  fi
  sleep .2
done

kill -9 "$PID" 2>/dev/null || true
rm -f "$PID_FILE"
echo "服务已强制停止。"
