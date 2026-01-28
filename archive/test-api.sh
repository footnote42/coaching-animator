#!/bin/bash
# API Testing Script for Link-Sharing Feature
# Run with: bash test-api.sh
# Requires: vercel dev running on http://localhost:3000

set -e  # Exit on error

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================"
echo "API Test Suite for Link-Sharing Feature"
echo "============================================"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed. Install with: npm install -g jq (or apt-get install jq)${NC}"
    exit 1
fi

# Test 1: Create share with valid payload
echo -e "${YELLOW}Test 1: POST /api/share with valid payload${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/share" \
  -H "Content-Type: application/json" \
  -d '{
    "version": 1,
    "canvas": {"width": 2000, "height": 2000},
    "entities": [
      {"id": "e1", "type": "player", "team": "attack", "x": 100, "y": 100},
      {"id": "e2", "type": "ball", "team": "attack", "x": 200, "y": 200}
    ],
    "frames": [
      {"t": 0, "updates": [{"id": "e1", "x": 100, "y": 100}]},
      {"t": 1, "updates": [{"id": "e1", "x": 150, "y": 150}]}
    ]
  }')

SHARE_ID=$(echo "$RESPONSE" | jq -r '.id')
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/share" \
  -H "Content-Type: application/json" \
  -d '{
    "version": 1,
    "canvas": {"width": 2000, "height": 2000},
    "entities": [{"id": "e1", "type": "player", "team": "attack", "x": 100, "y": 100}],
    "frames": [{"t": 0, "updates": [{"id": "e1", "x": 100, "y": 100}]}]
  }')

if [ "$HTTP_STATUS" -eq 201 ] && [ "$SHARE_ID" != "null" ]; then
    echo -e "${GREEN}✓ PASS: Share created with ID: $SHARE_ID${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 201 status and valid UUID${NC}"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 2: Invalid version
echo -e "${YELLOW}Test 2: POST /api/share with invalid version${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/share" \
  -H "Content-Type: application/json" \
  -d '{"version": 2, "canvas": {"width": 2000, "height": 2000}, "entities": [], "frames": []}')

if [ "$HTTP_STATUS" -eq 400 ]; then
    echo -e "${GREEN}✓ PASS: Rejected invalid version with 400${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 400 status, got $HTTP_STATUS${NC}"
fi
echo ""

# Test 3: Missing required fields
echo -e "${YELLOW}Test 3: POST /api/share with missing entities field${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/share" \
  -H "Content-Type: application/json" \
  -d '{"version": 1, "canvas": {"width": 2000, "height": 2000}, "frames": []}')

if [ "$HTTP_STATUS" -eq 400 ]; then
    echo -e "${GREEN}✓ PASS: Rejected missing entities with 400${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 400 status, got $HTTP_STATUS${NC}"
fi
echo ""

# Test 4: Retrieve valid share
echo -e "${YELLOW}Test 4: GET /api/share/:id with valid UUID${NC}"
if [ "$SHARE_ID" != "null" ] && [ -n "$SHARE_ID" ]; then
    RESPONSE=$(curl -s "$BASE_URL/api/share/$SHARE_ID")
    VERSION=$(echo "$RESPONSE" | jq -r '.version')
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/share/$SHARE_ID")

    if [ "$HTTP_STATUS" -eq 200 ] && [ "$VERSION" -eq 1 ]; then
        echo -e "${GREEN}✓ PASS: Retrieved share successfully${NC}"
        echo "Payload preview: $(echo "$RESPONSE" | jq -c '.canvas')"
    else
        echo -e "${RED}✗ FAIL: Expected 200 status and version 1${NC}"
        echo "Response: $RESPONSE"
    fi
else
    echo -e "${RED}✗ SKIP: No valid share ID from Test 1${NC}"
fi
echo ""

# Test 5: Non-existent share
echo -e "${YELLOW}Test 5: GET /api/share/:id with non-existent UUID${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/share/00000000-0000-4000-8000-000000000000")

if [ "$HTTP_STATUS" -eq 404 ]; then
    echo -e "${GREEN}✓ PASS: Returned 404 for non-existent share${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 404 status, got $HTTP_STATUS${NC}"
fi
echo ""

# Test 6: Invalid UUID format
echo -e "${YELLOW}Test 6: GET /api/share/:id with invalid UUID format${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/share/invalid-uuid-format")

if [ "$HTTP_STATUS" -eq 400 ]; then
    echo -e "${GREEN}✓ PASS: Rejected invalid UUID format with 400${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 400 status, got $HTTP_STATUS${NC}"
fi
echo ""

# Test 7: CORS preflight for POST
echo -e "${YELLOW}Test 7: OPTIONS /api/share (CORS preflight)${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$BASE_URL/api/share" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS: CORS preflight successful${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 200 status, got $HTTP_STATUS${NC}"
fi
echo ""

# Test 8: CORS preflight for GET
echo -e "${YELLOW}Test 8: OPTIONS /api/share/:id (CORS preflight)${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$BASE_URL/api/share/test-id" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS: CORS preflight successful${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 200 status, got $HTTP_STATUS${NC}"
fi
echo ""

# Test 9: Method not allowed (POST to GET endpoint)
echo -e "${YELLOW}Test 9: POST /api/share/:id (method not allowed)${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/share/test-id")

if [ "$HTTP_STATUS" -eq 405 ]; then
    echo -e "${GREEN}✓ PASS: Rejected POST to GET endpoint with 405${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 405 status, got $HTTP_STATUS${NC}"
fi
echo ""

# Test 10: Method not allowed (GET to POST endpoint)
echo -e "${YELLOW}Test 10: GET /api/share (method not allowed)${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/api/share")

if [ "$HTTP_STATUS" -eq 405 ]; then
    echo -e "${GREEN}✓ PASS: Rejected GET to POST endpoint with 405${NC}"
else
    echo -e "${RED}✗ FAIL: Expected 405 status, got $HTTP_STATUS${NC}"
fi
echo ""

echo "============================================"
echo "Test Suite Complete"
echo "============================================"
echo ""
echo "Manual verification steps:"
echo "1. Check Supabase dashboard for created shares"
echo "2. Verify last_accessed_at timestamp updates"
echo "3. Test oversized payload (>100KB) manually if needed"
echo ""
echo "Database verification (run in Supabase SQL Editor):"
echo "  SELECT id, last_accessed_at, created_at, size_bytes"
echo "  FROM shares"
echo "  ORDER BY created_at DESC"
echo "  LIMIT 5;"
