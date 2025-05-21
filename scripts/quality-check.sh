#!/bin/bash

# Air Gourmet Hellas Quality Check Script
# Run with: bash scripts/quality-check.sh
# Add --fix flag to automatically fix issues: bash scripts/quality-check.sh --fix

FIX_MODE=false
if [ "$1" == "--fix" ]; then
  FIX_MODE=true
fi

echo "🚀 Starting Air Gourmet Hellas Quality Check..."
echo "================================================"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Total number of steps
TOTAL_STEPS=4
CURRENT_STEP=1

# Function to display step header
display_step() {
  echo ""
  echo -e "${BLUE}Step $CURRENT_STEP/$TOTAL_STEPS: $1${NC}"
  CURRENT_STEP=$((CURRENT_STEP+1))
}

# Initialize result variables
ESLINT_RESULT=0
TS_RESULT=0
BUILD_RESULT=0
PRICING_RESULT=0

# Step 1: ESLint Check
display_step "Running ESLint code quality checks..."

# Check if we have the new ESLint config format or the old one
if [ -f "eslint.config.js" ]; then
  CONFIG_FLAG="--config eslint.config.js"
else
  CONFIG_FLAG=""
fi

if [ "$FIX_MODE" = true ]; then
  npx eslint $CONFIG_FLAG . --ext .js,.jsx,.ts,.tsx --fix || true
  ESLINT_RESULT=$?
  echo -e "${YELLOW}⚠️ Auto-fixed linting issues where possible${NC}"
else
  npx eslint $CONFIG_FLAG . --ext .js,.jsx,.ts,.tsx || true
  ESLINT_RESULT=$?
fi

if [ $ESLINT_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ ESLint check passed${NC}"
else
  echo -e "${RED}✗ ESLint check found issues${NC}"
  if [ "$FIX_MODE" = false ]; then
    echo -e "${YELLOW}Tip: Run with --fix flag to auto-fix some issues${NC}"
  fi
fi

# Step 2: TypeScript type checking
display_step "Running TypeScript type checking..."
npx tsc --noEmit
TS_RESULT=$?

if [ $TS_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ TypeScript check passed${NC}"
else
  echo -e "${RED}✗ TypeScript check failed${NC}"
fi

# Step 3: Check for common issues
display_step "Checking for common code issues..."

# Check for console.log statements that may have been left in
CONSOLE_LOGS=$(grep -r "console.log" --include="*.ts" --include="*.tsx" client/src/)
if [ -n "$CONSOLE_LOGS" ]; then
  echo -e "${YELLOW}⚠️ Found console.log statements that might need to be removed:${NC}"
  echo "$CONSOLE_LOGS" | head -10
  if [ $(echo "$CONSOLE_LOGS" | wc -l) -gt 10 ]; then
    echo -e "${YELLOW}...and more${NC}"
  fi
else
  echo -e "${GREEN}✓ No unnecessary console.log statements found${NC}"
fi

# Check for TODO comments
TODO_COMMENTS=$(grep -r "TODO" --include="*.ts" --include="*.tsx" client/src/ server/)
if [ -n "$TODO_COMMENTS" ]; then
  echo -e "${YELLOW}⚠️ Found TODO comments that might need attention:${NC}"
  echo "$TODO_COMMENTS" | head -10
  if [ $(echo "$TODO_COMMENTS" | wc -l) -gt 10 ]; then
    echo -e "${YELLOW}...and more${NC}"
  fi
else
  echo -e "${GREEN}✓ No TODO comments found${NC}"
fi

# Special focus on price-related issues
echo -e "\n${YELLOW}Checking for price-related issues (high priority)...${NC}"

# Check for common price formatting issues
echo -e "\n${BLUE}Looking for unsafe price formatting patterns:${NC}"

# Check for hardcoded prices
HARDCODED_PRICES=$(grep -r -E '([0-9]+\.[0-9]{2})€|€([0-9]+\.[0-9]{2})|([0-9]+\.[0-9]{2}) €|€ ([0-9]+\.[0-9]{2})' --include="*.ts" --include="*.tsx" client/src/)
if [ -n "$HARDCODED_PRICES" ]; then
  echo -e "${YELLOW}⚠️ Found potential hardcoded price values:${NC}"
  echo "$HARDCODED_PRICES" | head -10
  if [ $(echo "$HARDCODED_PRICES" | wc -l) -gt 10 ]; then
    echo -e "${YELLOW}...and more${NC}"
  fi
  PRICING_RESULT=1
fi

# Check for direct division or multiplication by 100 (cents/euros conversion)
DIRECT_PRICE_CALC=$(grep -r -E '/ 100|/100|\* 100|\*100' --include="*.ts" --include="*.tsx" client/src/)
if [ -n "$DIRECT_PRICE_CALC" ]; then
  echo -e "${YELLOW}⚠️ Found direct price calculations that might need review:${NC}"
  echo "$DIRECT_PRICE_CALC" | head -10
  if [ $(echo "$DIRECT_PRICE_CALC" | wc -l) -gt 10 ]; then
    echo -e "${YELLOW}...and more${NC}"
  fi
  PRICING_RESULT=1
fi

# Check for toFixed(2) which is often used for price formatting but can cause issues
TOFIXED_USAGE=$(grep -r "toFixed(2)" --include="*.ts" --include="*.tsx" client/src/)
if [ -n "$TOFIXED_USAGE" ]; then
  echo -e "${YELLOW}⚠️ Found toFixed(2) usage (potentially unsafe for price formatting):${NC}"
  echo "$TOFIXED_USAGE" | head -10
  if [ $(echo "$TOFIXED_USAGE" | wc -l) -gt 10 ]; then
    echo -e "${YELLOW}...and more${NC}"
  fi
  PRICING_RESULT=1
fi

# Check for problematic currency display formatting
TEMPLATE_PRICE_FORMAT=$(grep -r -E '\`€.*\`|\`.*€\`' --include="*.ts" --include="*.tsx" client/src/)
if [ -n "$TEMPLATE_PRICE_FORMAT" ]; then
  echo -e "${YELLOW}⚠️ Found template literal price formatting (potentially error-prone):${NC}"
  echo "$TEMPLATE_PRICE_FORMAT" | head -10
  if [ $(echo "$TEMPLATE_PRICE_FORMAT" | wc -l) -gt 10 ]; then
    echo -e "${YELLOW}...and more${NC}"
  fi
  PRICING_RESULT=1
fi

# Verify price formatter utility is being used
PRICE_FORMATTER_USAGE=$(grep -r "formatPrice" --include="*.ts" --include="*.tsx" client/src/)
if [ -z "$PRICE_FORMATTER_USAGE" ]; then
  echo -e "${RED}⚠️ Price formatter utility may not be used consistently${NC}"
  PRICING_RESULT=1
else
  echo -e "${GREEN}✓ Price formatter utility is being used in the application${NC}"
  
  # Check where the price formatter is defined
  PRICE_FORMATTER_FILE=$(grep -r --include="*.ts" --include="*.tsx" "export.*formatPrice" client/src/)
  if [ -n "$PRICE_FORMATTER_FILE" ]; then
    echo -e "${GREEN}✓ Price formatter is defined in:${NC}"
    echo "$PRICE_FORMATTER_FILE"
  else
    echo -e "${YELLOW}⚠️ Could not locate price formatter definition, may need review${NC}"
  fi
fi

# Step 4: Building application (optional)
display_step "Building application (optional)..."

# Check if we want to run the build (can be slow)
if [ "$1" == "--full" ] || [ "$2" == "--full" ]; then
  echo -e "Running full build (this may take a while)..."
  npx vite build
  BUILD_RESULT=$?
  
  if [ $BUILD_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ Build check passed${NC}"
  else
    echo -e "${RED}✗ Build check failed${NC}"
  fi
else
  echo -e "${YELLOW}Skipping full build. Add --full flag if you want to build the app.${NC}"
  BUILD_RESULT=0
fi

echo ""
echo "================================================"
# Check overall results
CRITICAL_FAILS=0
if [ $TS_RESULT -ne 0 ] || [ $BUILD_RESULT -ne 0 ]; then
  CRITICAL_FAILS=1
fi

if [ $CRITICAL_FAILS -eq 0 ]; then
  echo -e "${GREEN}✅ All critical quality checks passed!${NC}"
  
  if [ $ESLINT_RESULT -ne 0 ] || [ $PRICING_RESULT -ne 0 ]; then
    echo -e "${YELLOW}⚠️ Some non-critical issues were found. Consider addressing them.${NC}"
  fi
  
  echo ""
  echo -e "Next steps:"
  echo -e "1. Review any warnings about console.log statements"
  echo -e "2. Address any TODO comments"
  echo -e "3. Make sure all prices use the formatPrice utility"
  echo -e "4. Run this script with --fix flag to auto-fix linting issues"
  exit 0
else
  echo -e "${RED}❌ Some critical quality checks failed. Please fix the issues above.${NC}"
  exit 1
fi