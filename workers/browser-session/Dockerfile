# ==============================================================================
# VisaHobe Isolated Live Browser Worker Container
# Headless Chromium + Virtual Display (Xvfb) + x11vnc + websockify/noVNC + CDP
# Security Invariant: Zero -nopw (Mandatory password/token authentication)
# ==============================================================================

FROM node:20-bookworm-slim AS base

ENV DEBIAN_FRONTEND=noninteractive
ENV DISPLAY=:99
ENV VNC_PORT=5900
ENV NOVNC_PORT=6080
ENV CDP_PORT=9222
ENV SCREEN_WIDTH=1280
ENV SCREEN_HEIGHT=800
ENV SCREEN_DEPTH=24

# Install Chromium, Xvfb, x11vnc, noVNC, websockify, and process supervision tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    chromium-sandbox \
    xvfb \
    x11vnc \
    novnc \
    websockify \
    procps \
    net-tools \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root application user
RUN groupadd -r browseruser && useradd -r -g browseruser -m -d /home/browseruser -s /bin/bash browseruser

WORKDIR /home/browseruser/app

# Copy scripts and set permissions
COPY start.sh /home/browseruser/start.sh
RUN chmod +x /home/browseruser/start.sh && chown -R browseruser:browseruser /home/browseruser

USER browseruser

EXPOSE 6080 9222

ENTRYPOINT ["/home/browseruser/start.sh"]
