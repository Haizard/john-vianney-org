#!/bin/bash

# Try to start the main server
echo "Attempting to start the main server..."
node server.js

# If the main server fails, try the direct server
if [ $? -ne 0 ]; then
  echo "Main server failed to start. Trying direct server..."
  node server-direct.js

  # If the direct server fails, try the simple server
  if [ $? -ne 0 ]; then
    echo "Direct server failed to start. Trying simple server..."
    node server-simple.js
  fi
fi
