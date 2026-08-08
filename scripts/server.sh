#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3015}"
PID_FILE=".server.pid"
LOG_FILE=".server.log"

cmd="${1:-start}"

if [ "$cmd" = "start" ]; then
  # Kill anything on the port
  PID=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo "  Killing stale PID $PID on port $PORT ..."
    kill -9 $PID 2>/dev/null || true
    sleep 1
  fi
  rm -f "$PID_FILE"
  # Start server
  nohup node server.js > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  # Health check (up to 10s)
  READY=0
  for i in $(seq 1 10); do
    if curl -sf "http://localhost:$PORT/api/images" > /dev/null 2>&1; then
      READY=1
      break
    fi
    sleep 1
  done
  if [ "$READY" = "1" ]; then
    echo "  Deo Gratias Catalog started  ->  http://localhost:$PORT"
    echo "  PID $(cat "$PID_FILE")"
  else
    echo "  ERROR: Server failed to start. Check $LOG_FILE:"
    cat "$LOG_FILE" 2>/dev/null
    rm -f "$PID_FILE"
    exit 1
  fi

elif [ "$cmd" = "stop" ]; then
  PID=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo "  Stopping PID $PID ..."
    kill -9 $PID 2>/dev/null || true
    sleep 1
  else
    echo "  Nothing running on port $PORT"
  fi
  rm -f "$PID_FILE"
  # Double-check
  PID2=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
  if [ -n "$PID2" ]; then
    kill -9 $PID2 2>/dev/null || true
    sleep 1
  fi
  echo "  Server stopped"

elif [ "$cmd" = "restart" ]; then
  bash "$0" stop
  bash "$0" start
fi
