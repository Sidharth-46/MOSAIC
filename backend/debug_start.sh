#!/bin/sh
echo "Starting debug server with vendored dependencies..." > debug.log
echo "Environment variables:" >> debug.log
env >> debug.log
echo "Starting main.py..." >> debug.log
python3 -u main.py >> debug.log 2>&1
echo "Server crashed with exit code $?" >> debug.log
python3 -m http.server $X_ZOHO_CATALYST_LISTEN_PORT --bind 0.0.0.0
