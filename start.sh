#!/bin/sh
# Single Railway service: runs the web app and the WhatsApp worker together.
APP_PORT="${PORT:-3000}"
WORKER_PORT="${WORKER_PORT:-8088}"
export WHATSAPP_WORKER_URL="${WHATSAPP_WORKER_URL:-http://127.0.0.1:$WORKER_PORT}"
if [ -z "$WHATSAPP_WORKER_TOKEN" ]; then echo "WHATSAPP_WORKER_TOKEN is required"; exit 1; fi

(cd /app/whatsapp-worker && PORT="$WORKER_PORT" WORKER_TOKEN="$WHATSAPP_WORKER_TOKEN" \
  APP_URL="http://127.0.0.1:$APP_PORT" SESSIONS_DIR="${SESSIONS_DIR:-/data/sessions}" \
  node server.js) &
WORKER_PID=$!

PORT="$APP_PORT" node /app/.output/server/index.mjs &
APP_PID=$!

trap 'kill $WORKER_PID $APP_PID 2>/dev/null' TERM INT
# Exit if either process dies so Railway restarts the container.
while kill -0 $WORKER_PID 2>/dev/null && kill -0 $APP_PID 2>/dev/null; do sleep 5; done
kill $WORKER_PID $APP_PID 2>/dev/null
exit 1
