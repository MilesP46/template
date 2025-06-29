#!/bin/bash

# Build Verification Script
# Task: T210_phase2.5_cp1

echo "🔍 Turbo Build System Verification"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    fi
}

# 1. Check Node and npm versions
echo -e "\n📋 Environment Check:"
node --version
check_status "Node.js installed"
npm --version
check_status "npm installed"

# 2. Clean previous builds
echo -e "\n🧹 Cleaning previous builds..."
npm run clean 2>/dev/null || true
rm -rf packages/*/dist apps/*/.next apps/*/dist 2>/dev/null || true

# 3. Install dependencies
echo -e "\n📦 Installing dependencies..."
npm install
check_status "Dependencies installed"

# 4. Run the build
echo -e "\n🔨 Running build..."
npm run build
check_status "Build completed"

# 5. Verify build outputs
echo -e "\n📂 Verifying build outputs:"

# Check shared-types
if [ -d "packages/shared-types/dist" ]; then
    echo -e "${GREEN}✓ packages/shared-types/dist exists${NC}"
    if [ -f "packages/shared-types/dist/index.js" ]; then
        echo -e "${GREEN}  ✓ index.js generated${NC}"
    fi
    if [ -f "packages/shared-types/dist/index.d.ts" ]; then
        echo -e "${GREEN}  ✓ index.d.ts generated${NC}"
    fi
else
    echo -e "${RED}✗ packages/shared-types/dist missing${NC}"
fi

# Check rasket
if [ -d "apps/rasket/dist" ]; then
    echo -e "${GREEN}✓ apps/rasket/dist exists${NC}"
    if [ -f "apps/rasket/dist/index.html" ]; then
        echo -e "${GREEN}  ✓ index.html generated${NC}"
    fi
else
    echo -e "${RED}✗ apps/rasket/dist missing${NC}"
fi

# Check doctor-dok
if [ -d "apps/doctor-dok/.next" ]; then
    echo -e "${GREEN}✓ apps/doctor-dok/.next exists${NC}"
else
    echo -e "${RED}✗ apps/doctor-dok/.next missing${NC}"
fi

# 6. Test turbo caching
echo -e "\n⚡ Testing turbo cache..."
time npm run build > /dev/null 2>&1
CACHE_TIME=$?
if [ $CACHE_TIME -eq 0 ]; then
    echo -e "${GREEN}✓ Second build completed (should be faster due to cache)${NC}"
else
    echo -e "${RED}✗ Cache test failed${NC}"
fi

# 7. Check for workspace protocol issues
echo -e "\n🔍 Checking for workspace protocol issues..."
WORKSPACE_ISSUES=$(grep -r "workspace:\*" --include="package.json" . 2>/dev/null | grep -v node_modules | wc -l)
if [ $WORKSPACE_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ No workspace:* protocol found${NC}"
else
    echo -e "${RED}✗ Found $WORKSPACE_ISSUES workspace:* references${NC}"
fi

echo -e "\n✅ Build verification complete!"
echo "=================================="