#!/bin/bash

echo "🧹 Cleaning up Docker resources..."
echo ""

# Show current usage
echo "📊 Current Docker disk usage:"
docker system df
echo ""

# Remove unused images, containers, networks, and build cache
echo "🗑️  Removing unused resources..."
docker system prune -a --volumes -f

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Disk usage after cleanup:"
docker system df
