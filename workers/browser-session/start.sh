#!/usr/bin/env bash
# ==============================================================================
# VisaHobe Browser Session Worker Entrypoint
# Strict Security Invariant: Zero -nopw (Token/Password required under all circumstances)
# ==============================================================================

set -euo pipefail

echo "[VisaHobe Browser Worker] Initializing isolated browser runtime..."

# 1. Enforce Non-Negotiable Password / Token Authentication (Zero -nopw invariant)
if [[ -z "${VNC_PASSWORD:-}" && -z "${VNC_TOKEN:-}" ]]; then
  echo "[FATAL SECURITY ERROR] VNC_PASSWORD or VNC_TOKEN is required. Running x11vnc with -nopw is strictly forbidden." >&2
  exit 1
fi

AUTH_PASSWORD="${VNC_PASSWORD:-${VNC_TOKEN}}"
mkdir -p /home/browseruser/.vnc
x11vnc -storepasswd "${AUTH_PASSWORD}" /home/browseruser/.vnc/passwd
chmod 600 /home/browseruser/.vnc/passwd

# 2. Cleanup stale X locks if container restarted
rm -f /tmp/.X99-lock /tmp/.X11-unix/X99 2>/dev/null || true

# 3. Start virtual display (Xvfb)
echo "[VisaHobe Browser Worker] Starting Xvfb on display ${DISPLAY:-:99} (${SCREEN_WIDTH:-1280}x${SCREEN_HEIGHT:-800}x${SCREEN_DEPTH:-24})..."
Xvfb "${DISPLAY:-:99}" -screen 0 "${SCREEN_WIDTH:-1280}x${SCREEN_HEIGHT:-800}x${SCREEN_DEPTH:-24}" -ac +extension GLX +render -noreset &
XVFB_PID=$!

# Wait for Xvfb socket
for i in {1..10}; do
  if [[ -e "/tmp/.X11-unix/X99" ]]; then
    break
  fi
  sleep 0.2
done

# 4. Start authenticated VNC server (Strictly using -rfbauth; NEVER -nopw)
echo "[VisaHobe Browser Worker] Starting x11vnc with authenticated rfbauth..."
x11vnc -display "${DISPLAY:-:99}" \
  -forever \
  -shared \
  -rfbauth /home/browseruser/.vnc/passwd \
  -rfbport "${VNC_PORT:-5900}" \
  -bg \
  -o /tmp/x11vnc.log

# 5. Start websockify / noVNC WebSocket bridge
echo "[VisaHobe Browser Worker] Starting websockify / noVNC on port ${NOVNC_PORT:-6080}..."
websockify --web /usr/share/novnc "${NOVNC_PORT:-6080}" "127.0.0.1:${VNC_PORT:-5900}" &
WEBSOCKIFY_PID=$!

# 6. Launch Chromium with remote debugging port for CDP screencast and automation
echo "[VisaHobe Browser Worker] Launching isolated Chromium with CDP port ${CDP_PORT:-9222}..."
chromium \
  --no-first-run \
  --disable-default-apps \
  --disable-background-networking \
  --disable-sync \
  --disable-translate \
  --hide-scrollbars \
  --metrics-recording-only \
  --mute-audio \
  --no-default-browser-check \
  --start-maximized \
  --window-size="${SCREEN_WIDTH:-1280},${SCREEN_HEIGHT:-800}" \
  --remote-debugging-port="${CDP_PORT:-9222}" \
  --remote-debugging-address=0.0.0.0 \
  --display="${DISPLAY:-:99}" \
  "${TARGET_URL:-about:blank}" &
CHROMIUM_PID=$!

echo "[VisaHobe Browser Worker] Ready. Stream available on port ${NOVNC_PORT:-6080}, CDP on port ${CDP_PORT:-9222}."

# Handle graceful shutdown
trap 'echo "Shutting down..."; kill -TERM "$CHROMIUM_PID" "$WEBSOCKIFY_PID" "$XVFB_PID" 2>/dev/null || true; exit 0' SIGTERM SIGINT

wait -n "$CHROMIUM_PID" "$WEBSOCKIFY_PID" "$XVFB_PID"
