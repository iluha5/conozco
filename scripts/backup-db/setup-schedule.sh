#!/bin/bash

# Setup Automated Database Backups
# This script configures launchd on macOS to run database backups twice daily

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLIST_FILE="com.flashcards.db-backup.plist"
PLIST_PATH="$SCRIPT_DIR/$PLIST_FILE"
LAUNCHD_PATH="$HOME/Library/LaunchAgents/$PLIST_FILE"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This script is for macOS only (launchd)${NC}"
    exit 1
fi

# Function to display help
show_help() {
    echo "Database Backup Schedule Manager"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  install   - Install automated backup schedule"
    echo "  uninstall - Remove automated backup schedule"
    echo "  status    - Check if backup schedule is active"
    echo "  logs      - Show recent backup logs"
    echo "  help      - Show this help message"
    echo ""
    echo "The backup will run twice daily:"
    echo "  - Morning: 9:00 AM"
    echo "  - Evening: 9:00 PM (21:00)"
    echo ""
}

# Function to install schedule
install_schedule() {
    echo -e "${YELLOW}📦 Installing automated backup schedule...${NC}"
    
    # Check if plist file exists
    if [ ! -f "$PLIST_PATH" ]; then
        echo -e "${RED}❌ Plist file not found: $PLIST_PATH${NC}"
        exit 1
    fi
    
    # Create logs directory
    mkdir -p "$SCRIPT_DIR/logs"
    echo -e "${GREEN}✓ Created logs directory${NC}"
    
    # Copy plist to LaunchAgents
    cp "$PLIST_PATH" "$LAUNCHD_PATH"
    echo -e "${GREEN}✓ Copied plist to LaunchAgents${NC}"
    
    # Unload if already loaded (ignore errors)
    launchctl unload "$LAUNCHD_PATH" 2>/dev/null || true
    
    # Load the job
    launchctl load "$LAUNCHD_PATH"
    echo -e "${GREEN}✓ Loaded backup schedule${NC}"
    
    echo ""
    echo -e "${GREEN}✅ Automated backup schedule installed successfully!${NC}"
    echo ""
    echo "Backups will run:"
    echo "  - Every day at 9:00 AM"
    echo "  - Every day at 9:00 PM (21:00)"
    echo ""
    echo "View logs with: $0 logs"
}

# Function to uninstall schedule
uninstall_schedule() {
    echo -e "${YELLOW}🗑️  Uninstalling automated backup schedule...${NC}"
    
    if [ ! -f "$LAUNCHD_PATH" ]; then
        echo -e "${RED}❌ Backup schedule is not installed${NC}"
        exit 1
    fi
    
    # Unload the job
    launchctl unload "$LAUNCHD_PATH"
    echo -e "${GREEN}✓ Unloaded backup schedule${NC}"
    
    # Remove plist file
    rm "$LAUNCHD_PATH"
    echo -e "${GREEN}✓ Removed plist file${NC}"
    
    echo ""
    echo -e "${GREEN}✅ Automated backup schedule uninstalled${NC}"
}

# Function to check status
check_status() {
    echo -e "${YELLOW}📊 Checking backup schedule status...${NC}"
    echo ""
    
    if [ ! -f "$LAUNCHD_PATH" ]; then
        echo -e "${RED}❌ Backup schedule is NOT installed${NC}"
        echo ""
        echo "To install: $0 install"
        return
    fi
    
    # Check if job is loaded
    if launchctl list | grep -q "com.flashcards.db-backup"; then
        echo -e "${GREEN}✅ Backup schedule is ACTIVE${NC}"
        echo ""
        echo "Schedule:"
        echo "  - Morning: 9:00 AM"
        echo "  - Evening: 9:00 PM (21:00)"
        echo ""
        echo "Recent backups:"
        ls -lth "$SCRIPT_DIR/../../backups" 2>/dev/null | head -6 || echo "No backups found"
    else
        echo -e "${RED}❌ Backup schedule is installed but NOT loaded${NC}"
        echo ""
        echo "To reload: $0 install"
    fi
}

# Function to show logs
show_logs() {
    echo -e "${YELLOW}📄 Recent backup logs:${NC}"
    echo ""
    
    OUT_LOG="$SCRIPT_DIR/logs/backup.out"
    ERR_LOG="$SCRIPT_DIR/logs/backup.err"
    
    if [ -f "$OUT_LOG" ]; then
        echo -e "${GREEN}=== Standard Output (last 20 lines) ===${NC}"
        tail -20 "$OUT_LOG"
        echo ""
    else
        echo "No output log found yet"
        echo ""
    fi
    
    if [ -f "$ERR_LOG" ] && [ -s "$ERR_LOG" ]; then
        echo -e "${RED}=== Errors (last 20 lines) ===${NC}"
        tail -20 "$ERR_LOG"
        echo ""
    fi
    
    echo "Full logs located at:"
    echo "  Output: $OUT_LOG"
    echo "  Errors: $ERR_LOG"
}

# Main script logic
case "${1:-help}" in
    install)
        install_schedule
        ;;
    uninstall)
        uninstall_schedule
        ;;
    status)
        check_status
        ;;
    logs)
        show_logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

