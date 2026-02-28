#!/bin/bash

# Navigate to project directory
cd /home/deployer/projects/holy-guide

# Kill existing serve process on port 8082
pkill -f "serve -p 8082" || true

# Wait a moment for process to die
sleep 2

# Start SPA server on port 8082
echo "Starting SPA server on port 8082..."
cd dist
npx http-server-spa . index.html 8082 --cors &

echo "SPA server started for HolySpots!"