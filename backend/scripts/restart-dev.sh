#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${BACKEND_DIR}"

LOG_FILE="${BACKEND_DIR}/.dev-server.log"

printf "\n🔁 Restarting WittyDoctor demo server on %s:%s...\n" "${HOST}" "${PORT}"

# Stop any existing demo server (best-effort)
pkill -f "node server.js" >/dev/null 2>&1 || true

# Install deps only if missing
if [ ! -d "${BACKEND_DIR}/node_modules" ]; then
  echo "📦 node_modules not found. Running npm install..."
  npm install
fi

# Start server in background and capture logs
nohup npm start >"${LOG_FILE}" 2>&1 &

# Wait until health endpoint is ready
max_attempts=30
attempt=1
until curl -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; do
  if [ "${attempt}" -ge "${max_attempts}" ]; then
    echo "❌ Server did not become healthy in time."
    echo "📄 Last logs:"
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
