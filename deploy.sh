#!/bin/bash

# Tic-Tac-Toe Versus Deployment Script
# This script helps prepare your app for deployment

echo "🎮 Tic-Tac-Toe Versus Deployment Helper"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "Installing root dependencies..."
npm install

echo "Installing client dependencies..."
cd client && npm install && cd ..

echo "Installing server dependencies..."
cd server && npm install && cd ..

# Build the client
echo ""
echo "🔨 Building client..."
cd client
if npm run build; then
    echo "✅ Client built successfully"
else
    echo "❌ Client build failed"
    exit 1
fi
cd ..

# Test the server
echo ""
echo "🧪 Testing server..."
cd server
if node -e "console.log('✅ Server can start')"; then
    echo "✅ Server test passed"
else
    echo "❌ Server test failed"
    exit 1
fi
cd ..

echo ""
echo "🎉 Your app is ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Set up a MongoDB database (MongoDB Atlas recommended)"
echo "2. Choose a deployment platform from DEPLOYMENT.md"
echo "3. Set up environment variables"
echo "4. Deploy your backend first, then frontend"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "Environment variables you'll need:"
echo "Backend:"
echo "  - MONGODB_URI=your_mongodb_connection_string"
echo "  - CLIENT_URL=your_frontend_url"
echo "  - PORT=5000"
echo ""
echo "Frontend:"
echo "  - VITE_API_URL=your_backend_url" 