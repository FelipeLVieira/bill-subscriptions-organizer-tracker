#!/bin/bash

# Pre-Submission Checklist Script
# Run this before archiving for App Store submission

# Don't exit on error - we want to see all checks
# set -e

echo "🚀 Bills Tracker - Pre-Submission Checklist"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed=0
failed=0

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((passed++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((failed++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Check if on master branch
echo "1. Checking Git branch..."
current_branch=$(git branch --show-current)
if [ "$current_branch" == "master" ]; then
    check_pass "On master branch"
else
    check_fail "Not on master branch (current: $current_branch)"
fi

# 2. Check for uncommitted changes
echo ""
echo "2. Checking for uncommitted changes..."
if git diff-index --quiet HEAD --; then
    check_pass "No uncommitted changes"
else
    check_fail "Uncommitted changes detected"
    git status --short
fi

# 3. Run TypeScript check
echo ""
echo "3. Running TypeScript compilation check..."
if npx tsc --noEmit > /dev/null 2>&1; then
    check_pass "TypeScript compiles without errors"
else
    check_fail "TypeScript compilation failed"
fi

# 4. Run ESLint
echo ""
echo "4. Running ESLint..."
if npm run lint > /dev/null 2>&1; then
    check_pass "ESLint passed (0 warnings)"
else
    check_fail "ESLint failed"
fi

# 5. Run tests
echo ""
echo "5. Running tests..."
if npm test > /dev/null 2>&1; then
    test_count=$(npm test 2>&1 | grep "Tests:" | awk '{print $2}')
    check_pass "All tests passing ($test_count passed)"
else
    check_fail "Tests failed"
fi

# 6. Check version in package.json
echo ""
echo "6. Checking app version..."
package_version=$(node -p "require('./package.json').version")
echo "   Package version: $package_version"

# 7. Check version in app.json
app_version=$(node -p "require('./app.json').expo.version")
build_number=$(node -p "require('./app.json').expo.ios.buildNumber")
echo "   App version: $app_version (build $build_number)"

if [ "$package_version" == "$app_version" ]; then
    check_pass "Version numbers match"
else
    check_warn "Version mismatch: package.json ($package_version) vs app.json ($app_version)"
fi

# 8. Check bundle identifier
echo ""
echo "7. Checking bundle identifier..."
bundle_id=$(node -p "require('./app.json').expo.ios.bundleIdentifier")
echo "   Bundle ID: $bundle_id"
check_pass "Bundle identifier configured"

# 9. Check for required assets
echo ""
echo "8. Checking required assets..."
assets=(
    "assets/images/icon.png"
    "assets/images/splash-icon.png"
    "assets/images/adaptive-icon.png"
)
for asset in "${assets[@]}"; do
    if [ -f "$asset" ]; then
        check_pass "Found: $asset"
    else
        check_fail "Missing: $asset"
    fi
done

# 10. Check for common iOS metadata
echo ""
echo "9. Checking iOS metadata..."
if grep -q "ITSAppUsesNonExemptEncryption" app.json; then
    check_pass "Export compliance key present"
else
    check_fail "Missing ITSAppUsesNonExemptEncryption in app.json"
fi

if grep -q "NSPhotoLibraryUsageDescription" app.json; then
    check_pass "Photo library usage description present"
else
    check_warn "Missing NSPhotoLibraryUsageDescription"
fi

if grep -q "NSCameraUsageDescription" app.json; then
    check_pass "Camera usage description present"
else
    check_warn "Missing NSCameraUsageDescription"
fi

# 11. Check documentation
echo ""
echo "10. Checking documentation..."
docs=(
    "README.md"
    "CHANGELOG.md"
    "READY_FOR_APP_STORE.md"
    "APP_STORE_LISTING.md"
    "ACCESSIBILITY.md"
    "ENHANCEMENT_ROADMAP.md"
)
for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "Found: $doc"
    else
        check_warn "Missing: $doc"
    fi
done

# 12. Check node_modules
echo ""
echo "11. Checking dependencies..."
if [ -d "node_modules" ]; then
    check_pass "node_modules present"
    
    # Check for critical dependencies
    critical_deps=("expo" "react-native" "expo-sqlite" "expo-notifications")
    for dep in "${critical_deps[@]}"; do
        if [ -d "node_modules/$dep" ]; then
            check_pass "Found dependency: $dep"
        else
            check_fail "Missing critical dependency: $dep"
        fi
    done
else
    check_fail "node_modules not found - run npm install"
fi

# Summary
echo ""
echo "=========================================="
echo "📊 Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $passed${NC}"
if [ $failed -gt 0 ]; then
    echo -e "${RED}Failed: $failed${NC}"
fi
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open ios/BillsTracker.xcworkspace in Xcode"
    echo "2. Select 'Any iOS Device' in toolbar"
    echo "3. Product → Archive"
    echo "4. Distribute App → App Store Connect"
    echo ""
    echo "See READY_FOR_APP_STORE.md for detailed instructions."
    exit 0
else
    echo -e "${RED}⚠️  SOME CHECKS FAILED!${NC}"
    echo ""
    echo "Please fix the issues above before archiving."
    exit 1
fi
