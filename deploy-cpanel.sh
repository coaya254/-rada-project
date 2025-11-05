#!/bin/bash
# PoliHub cPanel Deployment Script
# Run this if you have SSH access to your cPanel server
# Usage: bash deploy-cpanel.sh

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     PoliHub cPanel Deployment Script                     ║"
echo "║     www.radamtaani.co.ke                                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Configuration
APP_ROOT="/home/username/radamtaani"  # UPDATE THIS PATH
PUBLIC_HTML="/home/username/public_html"  # UPDATE THIS PATH
NODE_ENV_PATH="/path/to/nodevenv/radamtaani/10.24.1/bin/activate"  # UPDATE FROM CPANEL

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  BEFORE RUNNING THIS SCRIPT:${NC}"
echo "1. Update APP_ROOT, PUBLIC_HTML, and NODE_ENV_PATH in this script"
echo "2. Ensure .env file has your database password"
echo "3. Upload all files to server first"
echo ""
read -p "Have you completed these steps? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${RED}❌ Please complete prerequisites first${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 Starting deployment...${NC}"
echo ""

# Step 1: Verify directories exist
echo "📁 Step 1: Verifying directories..."
if [ ! -d "$APP_ROOT" ]; then
    echo -e "${RED}❌ App root directory not found: $APP_ROOT${NC}"
    exit 1
fi

if [ ! -d "$PUBLIC_HTML" ]; then
    echo -e "${RED}❌ Public HTML directory not found: $PUBLIC_HTML${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Directories verified${NC}"
echo ""

# Step 2: Check .env file
echo "🔐 Step 2: Checking .env file..."
if [ ! -f "$APP_ROOT/.env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Looking for .env.cpanel..."
    if [ -f "$APP_ROOT/.env.cpanel" ]; then
        echo "Found .env.cpanel. Please add your DB password and rename to .env"
        exit 1
    else
        echo -e "${RED}❌ No .env file found${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ .env file found${NC}"
echo ""

# Step 3: Activate Node.js environment
echo "🔧 Step 3: Activating Node.js environment..."
if [ -f "$NODE_ENV_PATH" ]; then
    source "$NODE_ENV_PATH"
    echo -e "${GREEN}✅ Node.js environment activated${NC}"
else
    echo -e "${YELLOW}⚠️  Could not find Node environment at: $NODE_ENV_PATH${NC}"
    echo "Continuing without activation (may fail)..."
fi
echo ""

# Step 4: Change to app directory
echo "📂 Step 4: Changing to app directory..."
cd "$APP_ROOT"
echo -e "${GREEN}✅ Changed to: $(pwd)${NC}"
echo ""

# Step 5: Install dependencies
echo "📦 Step 5: Installing dependencies..."
echo "This may take a few minutes..."
npm install --production
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ npm install failed${NC}"
    echo "Try running manually: cd $APP_ROOT && npm install"
    exit 1
fi
echo ""

# Step 6: Install PoliHub dependencies
echo "📦 Step 6: Installing PoliHub dependencies..."
if [ -d "$APP_ROOT/polihub" ]; then
    cd "$APP_ROOT/polihub"
    npm install --production
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PoliHub dependencies installed${NC}"
    else
        echo -e "${YELLOW}⚠️  PoliHub npm install had warnings (may be OK)${NC}"
    fi
    cd "$APP_ROOT"
else
    echo -e "${YELLOW}⚠️  PoliHub directory not found${NC}"
fi
echo ""

# Step 7: Set file permissions
echo "🔒 Step 7: Setting file permissions..."
chmod 600 "$APP_ROOT/.env"
chmod 755 "$APP_ROOT"
chmod 644 "$APP_ROOT/server.js"
chmod 644 "$APP_ROOT/package.json"
echo -e "${GREEN}✅ Permissions set${NC}"
echo ""

# Step 8: Verify build files
echo "🏗️  Step 8: Verifying build files..."
if [ -f "$PUBLIC_HTML/index.html" ]; then
    echo -e "${GREEN}✅ index.html found in public_html${NC}"
else
    echo -e "${YELLOW}⚠️  index.html not found in public_html${NC}"
    echo "Make sure to copy polihub/build/* to public_html/"
fi

if [ -d "$PUBLIC_HTML/static" ]; then
    echo -e "${GREEN}✅ static/ directory found${NC}"
else
    echo -e "${YELLOW}⚠️  static/ directory not found${NC}"
fi

if [ -f "$PUBLIC_HTML/.htaccess" ]; then
    echo -e "${GREEN}✅ .htaccess found${NC}"
else
    echo -e "${YELLOW}⚠️  .htaccess not found${NC}"
fi
echo ""

# Step 9: Test database connection (optional)
echo "💾 Step 9: Testing database connection..."
echo "Checking if MySQL is accessible..."
mysql --version > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ MySQL client available${NC}"
    echo "To test connection, run: mysql -u coayaorg_rada -p -h localhost coayaorg_rada"
else
    echo -e "${YELLOW}⚠️  MySQL client not found in PATH${NC}"
fi
echo ""

# Step 10: Instructions for starting app
echo "▶️  Step 10: Starting the application..."
echo ""
echo "To start your Node.js app, go to cPanel:"
echo "1. Navigate to 'Setup Node.js App'"
echo "2. Find your application"
echo "3. Click 'Start App'"
echo ""
echo "Or if you have pm2 installed, run:"
echo "  pm2 start $APP_ROOT/server.js --name polihub"
echo "  pm2 save"
echo ""

echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment preparation complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Start your Node.js app in cPanel or via pm2"
echo "2. Visit: https://www.radamtaani.co.ke"
echo "3. Test API endpoints:"
echo "   - https://www.radamtaani.co.ke/api/polihub/politicians"
echo "   - https://www.radamtaani.co.ke/api/polihub/civic-topics"
echo "   - https://www.radamtaani.co.ke/api/polihub/blog-posts"
echo ""
echo "Check logs in cPanel Node.js App Manager if issues occur."
echo ""
echo -e "${GREEN}🎉 Good luck with your deployment!${NC}"
