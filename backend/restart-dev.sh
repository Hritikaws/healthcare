#!/usr/bin/env bash
set -euo pipefail

if [ -x "./scripts/restart-dev.sh" ]; then
  exec ./scripts/restart-dev.sh
fi

PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"
LOG_FILE="./.dev-server.log"

printf "\n🔁 Restarting WittyDoctor demo server on %s:%s...\n" "${HOST}" "${PORT}"
pkill -f "node server.js" >/dev/null 2>&1 || true

if [ ! -d "./node_modules" ]; then
  echo "📦 node_modules not found. Running npm install..."
  npm install
fi

nohup npm start >"${LOG_FILE}" 2>&1 &

max_attempts=30
attempt=1
until curl -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; do
  if [ "${attempt}" -ge "${max_attempts}" ]; then
    echo "❌ Server did not become healthy in time."
    tail -n 80 "${LOG_FILE}" || true
    exit 1
  fi
  sleep 1
  attempt=$((attempt + 1))
done

echo "✅ Health check passed:"
curl -fsS "http://127.0.0.1:${PORT}/api/health"

echo

echo "✅ Hero stats content check:"
curl -fsS "http://127.0.0.1:${PORT}" | grep -nE "2,500\+|20\+|24/7|Patients Served|Verified Doctors|Support"

echo
cat <<MSG
🎉 Done. Server is running in background.

Useful commands:
- View logs: tail -f ${LOG_FILE}
- Stop server: pkill -f "node server.js"
- Open app:   http://localhost:${PORT}
MSG
