#!/bin/bash

# Price Issues Check Script
# Run with: bash scripts/check-prices.sh

echo "🔍 Running Price Formatting Check for Air Gourmet Hellas..."
echo "=========================================================="

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check where the price formatter is defined
echo -e "${BLUE}Looking for price formatter utility:${NC}"
PRICE_FORMATTER_FILE=$(grep -r --include="*.ts" --include="*.tsx" "export.*formatPrice" client/src/)
if [ -n "$PRICE_FORMATTER_FILE" ]; then
  echo -e "${GREEN}✓ Price formatter is defined in:${NC}"
  echo "$PRICE_FORMATTER_FILE"
else
  echo -e "${RED}✗ Could not find price formatter definition!${NC}"
  echo -e "This could mean prices are being formatted inconsistently."
fi

echo ""
echo -e "${BLUE}Checking price formatter usage:${NC}"
PRICE_FORMATTER_USAGE=$(grep -r "formatPrice" --include="*.ts" --include="*.tsx" client/src/)
if [ -n "$PRICE_FORMATTER_USAGE" ]; then
  echo -e "${GREEN}✓ formatPrice is being used in:${NC}"
  echo "$PRICE_FORMATTER_USAGE" | grep -v "export.*formatPrice" | head -5
  if [ $(echo "$PRICE_FORMATTER_USAGE" | wc -l) -gt 5 ]; then
    echo -e "${YELLOW}...and more locations${NC}"
  fi
else
  echo -e "${RED}✗ formatPrice is not being used in the codebase${NC}"
fi

echo ""
echo -e "${BLUE}Checking for risky price formatting:${NC}"

# Check for toFixed(2) which is often used for price formatting but can cause issues
TOFIXED_USAGE=$(grep -r "toFixed(2)" --include="*.ts" --include="*.tsx" client/src/)
if [ -n "$TOFIXED_USAGE" ]; then
  echo -e "${YELLOW}⚠️ Found toFixed(2) usage (potentially unsafe for price formatting):${NC}"
  echo "$TOFIXED_USAGE" | head -5
  if [ $(echo "$TOFIXED_USAGE" | wc -l) -gt 5 ]; then
    echo -e "${YELLOW}...and more${NC}"
  fi
fi

# Check for direct price calculations 
DIRECT_PRICE_CALC=$(grep -r -E '/ 100|/100|\* 100|\*100' --include="*.ts" --include="*.tsx" client/src/)
if [ -n "$DIRECT_PRICE_CALC" ]; then
  echo -e "${YELLOW}⚠️ Found direct price calculations (possible cents/euros conversion):${NC}"
  echo "$DIRECT_PRICE_CALC" | head -5
  if [ $(echo "$DIRECT_PRICE_CALC" | wc -l) -gt 5 ]; then
    echo -e "${YELLOW}...and more${NC}"
  fi
fi

# Check files that work with prices in payment page
echo ""
echo -e "${BLUE}Checking payment pages:${NC}"
grep -r --include="*payment*.tsx" "amount" client/src/pages/

echo ""
echo "=========================================================="
echo -e "${YELLOW}Recommendation: Always use a consistent price formatter like formatPrice() that:${NC}"
echo "1. Handles the cents-to-euros conversion correctly"
echo "2. Formats the price with the proper currency symbol"
echo "3. Uses correct decimal notation for your region"
echo -e "\nExample: formatPrice(300) => €3.00 (not €300.00)"