#!/bin/bash

# Test Quality Validation Script
# Validates test files against quality standards

# Colors
RED='\033[0;31m' GREEN='\033[0;32m' YELLOW='\033[1;33m' BLUE='\033[0;34m' NC='\033[0m'

# Counters
total_files=0 passed_files=0 failed_files=0 warnings=0

echo "🐯 Tigercat Test Quality Validation"
echo "===================================="
echo ""

# Check if file has required describe blocks
check_test_categories() {
    local file=$1
    local missing=()
    local categories=("Rendering" "Props" "Events" "States" "Accessibility" "Snapshots")
    
    for cat in "${categories[@]}"; do
        grep -q "describe.*['\"]${cat}" "$file" || missing+=("$cat")
    done
    
    [ ${#missing[@]} -gt 0 ] && echo -e "${YELLOW}  ⚠ Missing: ${missing[*]}${NC}" && ((warnings++)) && return 1
    return 0
}

# Check test naming conventions
check_test_naming() {
    local file=$1
    local bad=$(grep -E "^\s*it\(.*['\"]" "$file" | grep -v "should\|snapshot" || true)
    [ -n "$bad" ] && echo -e "${YELLOW}  ⚠ Some tests don't use 'should' naming${NC}" && ((warnings++)) && return 1
    return 0
}

# Check for edge case tests
check_edge_cases() {
    local file=$1
    grep -q "describe.*\(Edge Cases\|Boundary\)" "$file" && return 0
    echo -e "${YELLOW}  ⚠ No Edge Cases or Boundary tests${NC}" && ((warnings++)) && return 1
}

# Check accessibility tests
check_accessibility() {
    local file=$1
    grep -q "expectNoA11yViolations" "$file" && return 0
    echo -e "${YELLOW}  ⚠ No accessibility checks${NC}" && ((warnings++)) && return 1
}

# Check type safety
check_type_safety() {
    local file=$1
    local any_usage=$(grep -v "^[[:space:]]*\(\/\/\|\/\*\|\*\)" "$file" | grep -E ": any[ ,>)]" || true)
    [ -n "$any_usage" ] && echo -e "${YELLOW}  ⚠ Found 'any' type usage${NC}" && ((warnings++)) && return 1
    return 0
}

# Count tests
count_tests() {
    grep -c "^\s*it(" "$1" || echo "0"
}

# Validate a single test file
validate_test_file() {
    local file=$1 filename=$(basename "$file") issues=0
    
    echo -e "${BLUE}Checking: ${filename}${NC}"
    
    # Count and check minimum
    local test_count=$(count_tests "$file")
    local min_tests=30
    [[ $filename == *"Upload"* || $filename == *"DatePicker"* || $filename == *"TimePicker"* ]] && min_tests=50
    
    echo "  📊 Test count: $test_count"
    [ "$test_count" -lt "$min_tests" ] && echo -e "${YELLOW}  ⚠ Below minimum ($min_tests)${NC}" && ((warnings++))
    
    # Run all checks
    check_test_categories "$file" || ((issues++))
    check_test_naming "$file" || ((issues++))
    check_edge_cases "$file" || ((issues++))
    check_accessibility "$file" || ((issues++))
    check_type_safety "$file" || ((issues++))
    
    if [ $issues -eq 0 ]; then
        echo -e "${GREEN}  ✓ All checks passed${NC}"
        ((passed_files++))
    else
        echo -e "${RED}  ✗ ${issues} issue(s)${NC}"
        ((failed_files++))
    fi
    echo ""
}

# Main
echo "Scanning test files..."
echo ""

TEST_DIRS="${TEST_DIRS:-tests/vue tests/react}"
test_files=$(find $TEST_DIRS -type f \( -name "*.spec.ts" -o -name "*.spec.tsx" \) 2>/dev/null)

if [ -z "$test_files" ]; then
    echo -e "${RED}No test files found in: $TEST_DIRS${NC}"
    echo "Set TEST_DIRS to customize directories."
    exit 1
fi

while IFS= read -r file; do
    [ -f "$file" ] && ((total_files++)) && validate_test_file "$file"
done <<< "$test_files"

# Summary
echo "===================================="
echo "📈 Summary"
echo "===================================="
echo "Total: $total_files | ${GREEN}Passed: $passed_files${NC} | ${RED}Failed: $failed_files${NC} | ${YELLOW}Warnings: $warnings${NC}"
echo ""

if [ $failed_files -gt 0 ]; then
    echo -e "${RED}❌ Validation failed${NC}"
    echo "See tests/TEST_QUALITY_GUIDELINES.md for standards."
    exit 1
else
    echo -e "${GREEN}✅ All tests meet quality standards${NC}"
    [ $warnings -gt 0 ] && echo -e "${YELLOW}Note: $warnings warning(s) - consider addressing for better quality${NC}"
    exit 0
fi
