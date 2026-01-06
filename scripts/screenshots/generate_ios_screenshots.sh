#!/bin/bash

# iOS Simulator Screenshot Generator
# Captures screenshots from iOS simulators for App Store submission
#
# Prerequisites:
# - Xcode installed with iOS simulators
# - App built and installed on simulators
#
# Usage: ./scripts/screenshots/generate_ios_screenshots.sh

set -e

# Output directory
OUTPUT_DIR="store_assets/ios"
mkdir -p "$OUTPUT_DIR"

# Device configurations
# Format: "Simulator Name|Output Folder|Required Size"
DEVICES=(
    "iPhone 15 Pro Max|6.7inch|1290x2796"
    "iPhone 11 Pro Max|6.5inch|1242x2688"
    "iPhone 8 Plus|5.5inch|1242x2208"
    "iPad Pro (12.9-inch) (6th generation)|13inch|2064x2752"
)

# App bundle identifier
BUNDLE_ID="com.billstracker.app"

# Function to take screenshot from simulator
take_screenshot() {
    local device_name=$1
    local output_folder=$2
    local filename=$3

    mkdir -p "$OUTPUT_DIR/$output_folder"

    # Get the UDID of the booted device
    local udid=$(xcrun simctl list devices | grep "$device_name" | grep "Booted" | grep -o '[0-9A-F\-]\{36\}')

    if [ -z "$udid" ]; then
        echo "Warning: $device_name not booted, skipping..."
        return 1
    fi

    # Take screenshot
    xcrun simctl io "$udid" screenshot "$OUTPUT_DIR/$output_folder/$filename"
    echo "  Saved: $OUTPUT_DIR/$output_folder/$filename"
}

# Function to boot simulator
boot_simulator() {
    local device_name=$1

    # Get UDID
    local udid=$(xcrun simctl list devices | grep "$device_name" | head -1 | grep -o '[0-9A-F\-]\{36\}')

    if [ -z "$udid" ]; then
        echo "Error: Device '$device_name' not found"
        return 1
    fi

    # Check if already booted
    local status=$(xcrun simctl list devices | grep "$udid" | grep -o "Booted" || true)

    if [ "$status" != "Booted" ]; then
        echo "Booting $device_name..."
        xcrun simctl boot "$udid"
        sleep 5
    else
        echo "$device_name is already booted"
    fi
}

# Function to open app in simulator
open_app() {
    local device_name=$1

    local udid=$(xcrun simctl list devices | grep "$device_name" | grep "Booted" | grep -o '[0-9A-F\-]\{36\}')

    if [ -n "$udid" ]; then
        xcrun simctl launch "$udid" "$BUNDLE_ID" 2>/dev/null || true
    fi
}

echo "================================================"
echo "Bills Tracker - iOS Simulator Screenshot Capture"
echo "================================================"
echo ""

# List available devices
echo "Available iOS Simulators:"
xcrun simctl list devices available | grep -E "iPhone|iPad" | head -20
echo ""

echo "Note: This script captures from running simulators."
echo "For best results:"
echo "  1. Build and run the app on each simulator first"
echo "  2. Add sample data to populate the screens"
echo "  3. Navigate to each screen manually and run this script"
echo ""

# Check if any device is booted
BOOTED=$(xcrun simctl list devices | grep "Booted" | wc -l)
if [ "$BOOTED" -eq 0 ]; then
    echo "No simulators are currently running."
    echo "Please boot a simulator and run the app first:"
    echo "  xcrun simctl boot 'iPhone 15 Pro Max'"
    echo "  npx expo run:ios --simulator 'iPhone 15 Pro Max'"
    exit 1
fi

echo "Taking screenshots from booted simulators..."
echo ""

for device_config in "${DEVICES[@]}"; do
    IFS='|' read -r device_name output_folder required_size <<< "$device_config"

    echo "=== $device_name ($required_size) ==="

    # Check if this device is booted
    if xcrun simctl list devices | grep "$device_name" | grep -q "Booted"; then
        # Take screenshot
        timestamp=$(date +%Y%m%d_%H%M%S)
        take_screenshot "$device_name" "$output_folder" "screenshot_${timestamp}.png"
    else
        echo "  Not booted, skipping..."
    fi

    echo ""
done

echo "================================================"
echo "Screenshot capture complete!"
echo "================================================"
echo ""
echo "Screenshots saved to: $OUTPUT_DIR/"
echo ""
echo "For complete App Store submission, capture:"
echo "  - Dashboard (with sample subscriptions)"
echo "  - My Bills list"
echo "  - History view"
echo "  - Add Bill modal"
echo "  - Both light and dark themes"
echo ""
echo "App Store Requirements:"
echo "  iPhone 6.7\":  1290 x 2796 pixels"
echo "  iPhone 6.5\":  1242 x 2688 pixels"
echo "  iPhone 5.5\":  1242 x 2208 pixels"
echo "  iPad 13\":     2064 x 2752 pixels"
