#!/bin/sh
echo "Starting backend..."
echo "Port: ${X_ZOHO_CATALYST_LISTEN_PORT}"
uvicorn main:app --host 0.0.0.0 --port ${X_ZOHO_CATALYST_LISTEN_PORT:-9000}
