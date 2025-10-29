#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[DEV]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to cleanup processes on exit
cleanup() {
    print_status "Shutting down services..."
    if [ ! -z "$BE_PID" ]; then
        kill $BE_PID 2>/dev/null
    fi
    if [ ! -z "$FE_PID" ]; then
        kill $FE_PID 2>/dev/null
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

print_status "Starting development environment..."

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    print_error "Yarn is not installed. Please install yarn first."
    exit 1
fi

# Start backend
print_status "Starting backend (NestJS)..."
cd be
yarn start:dev > >(sed "s/^/${YELLOW}[BE]${NC} /") 2>&1 &
BE_PID=$!
cd ..

# Start frontend
print_status "Starting frontend (Next.js)..."
cd fe
yarn dev > >(sed "s/^/${CYAN}[FE]${NC} /") 2>&1 &
FE_PID=$!
cd ..

print_status "Both services are starting up..."
print_status "Backend PID: $BE_PID"
print_status "Frontend PID: $FE_PID"
print_status "Press Ctrl+C to stop all services"

# Wait for both processes
wait $BE_PID $FE_PID
