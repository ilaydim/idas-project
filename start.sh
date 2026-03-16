#!/bin/bash

echo "Starting IDAS Full Stack Application..."

# Clean up any leftover processes from previous runs
echo "Cleaning up old processes..."
pkill -f "uvicorn backend.main:app" 2>/dev/null
pkill -f "vite.*frontend" 2>/dev/null
sleep 1

echo "======================================"
echo "Starting Backend (Port 8001)..."
echo "======================================"
# 1. Start Backend in background
(cd /Users/yarensaklavci/Desktop/idas-project/idas-project && \
 source backend/venv/bin/activate && \
 python3 -m uvicorn backend.main:app --reload --port 8001) &
BACKEND_PID=$!

sleep 3

echo "======================================"
echo "Starting Frontend..."
echo "======================================"
# 2. Start Frontend in foreground
cd /Users/yarensaklavci/Desktop/idas-project/idas-project/frontend && npm run dev

# If frontend is closed (CTRL+C), kill backend too
kill $BACKEND_PID
