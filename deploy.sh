#!/bin/bash

# Deployment script for voting app
# Usage: ./deploy.sh [backend|frontend|all]

set -e

SERVER_USER="deploy"
SERVER_HOST="YOUR_DROPLET_IP"  # Replace with your actual droplet IP
APP_DIR="/var/www/voting-app"

deploy_backend() {
    echo "🚀 Deploying backend..."
    
    # Build backend locally
    cd be
    npm run build
    
    # Upload built files
    rsync -avz --delete dist/ $SERVER_USER@$SERVER_HOST:$APP_DIR/be/dist/
    
    # Upload package.json and ecosystem config
    scp package.json $SERVER_USER@$SERVER_HOST:$APP_DIR/be/
    scp ecosystem.config.js $SERVER_USER@$SERVER_HOST:$APP_DIR/be/
    
    # Restart backend on server
    ssh $SERVER_USER@$SERVER_HOST "cd $APP_DIR/be && pm2 restart voting-backend"
    
    echo "✅ Backend deployed successfully!"
}

deploy_frontend() {
    echo "🚀 Deploying frontend..."
    
    # Build frontend locally
    cd fe
    npm run build
    
    # Upload built files
    rsync -avz --delete out/ $SERVER_USER@$SERVER_HOST:$APP_DIR/fe/out/
    
    echo "✅ Frontend deployed successfully!"
}

deploy_all() {
    echo "🚀 Deploying full application..."
    deploy_backend
    deploy_frontend
    echo "🎉 Full deployment completed!"
}

# Main script logic
case "${1:-all}" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_all
        ;;
    *)
        echo "Usage: $0 [backend|frontend|all]"
        exit 1
        ;;
esac
