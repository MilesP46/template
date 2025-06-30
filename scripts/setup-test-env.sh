#!/bin/bash

# Setup Test Environment Script
# This script prepares the test environment for running authentication tests

echo "🔧 Setting up test environment..."

# Create test database directory
mkdir -p test-databases
echo "✅ Test database directory created"

# Clean any existing test databases
rm -f test-databases/*.db
echo "✅ Cleaned existing test databases"

# Create empty SQLite databases
touch test-databases/single-tenant-test.db
touch test-databases/multi-tenant-test.db
echo "✅ Created test database files"

# Copy test environment file if it doesn't exist
if [ ! -f .env.test.local ]; then
  cp .env.test .env.test.local
  echo "✅ Created local test environment file"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Build packages if needed
if [ ! -d "packages/shared-types/dist" ]; then
  echo "🏗️  Building packages..."
  npm run build:packages 2>/dev/null || echo "⚠️  Build packages failed - continuing anyway"
fi

echo "✅ Test environment setup complete!"
echo ""
echo "You can now run tests with:"
echo "  npm run test:jest       # Run tests with Jest"
echo "  npm run test:unit       # Run tests with Vitest"
echo "  npm run test:coverage   # Run tests with coverage"