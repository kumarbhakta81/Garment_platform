#!/bin/bash

# Start backend with nodemon for auto-reload
cd server
npm run dev &

# Start frontend (React already reloads automatically)
cd ../client
npm start