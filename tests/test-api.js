const BASE_URL = 'http://localhost:3000';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const NC = '\x1b[0m';

async function runTests() {
    console.log('============================================');
    console.log('API Test Suite for Link-Sharing Feature (Node.js)');
    console.log('============================================\n');

    let shareId = null;

    // Test 1: Create share with valid payload
    console.log(`${YELLOW}Test 1: POST /api/share with valid payload${NC}`);
    try {
        const response = await fetch(`${BASE_URL}/api/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                version: 1,
                canvas: { width: 2000, height: 2000 },
                entities: [
                    { id: 'e1', type: 'player', team: 'attack', x: 100, y: 100 },
                    { id: 'e2', type: 'ball', team: 'attack', x: 200, y: 200 }
                ],
                frames: [
                    { t: 0, updates: [{ id: 'e1', x: 100, y: 100 }] },
                    { t: 1, updates: [{ id: 'e1', x: 150, y: 150 }] }
                ]
            })
        });

        const data = await response.json();
        if (response.status === 201 && data.id) {
            shareId = data.id;
            console.log(`${GREEN}✓ PASS: Share created with ID: ${shareId}${NC}`);
        } else {
            console.log(`${RED}✗ FAIL: Expected 201 status and valid UUID${NC}`);
            console.log('Response:', data);
        }
    } catch (err) {
        console.log(`${RED}✗ ERROR: ${err.message}${NC}`);
    }
    console.log('');

    // Test 2: Invalid version
    console.log(`${YELLOW}Test 2: POST /api/share with invalid version${NC}`);
    try {
        const response = await fetch(`${BASE_URL}/api/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ version: 2, canvas: { width: 2000, height: 2000 }, entities: [], frames: [] })
        });
        if (response.status === 400) {
            console.log(`${GREEN}✓ PASS: Rejected invalid version with 400${NC}`);
        } else {
            console.log(`${RED}✗ FAIL: Expected 400 status, got ${response.status}${NC}`);
        }
    } catch (err) {
        console.log(`${RED}✗ ERROR: ${err.message}${NC}`);
    }
    console.log('');

    // Test 3: Missing required fields
    console.log(`${YELLOW}Test 3: POST /api/share with missing entities field${NC}`);
    try {
        const response = await fetch(`${BASE_URL}/api/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ version: 1, canvas: { width: 2000, height: 2000 }, frames: [] })
        });
        if (response.status === 400) {
            console.log(`${GREEN}✓ PASS: Rejected missing entities with 400${NC}`);
        } else {
            console.log(`${RED}✗ FAIL: Expected 400 status, got ${response.status}${NC}`);
        }
    } catch (err) {
        console.log(`${RED}✗ ERROR: ${err.message}${NC}`);
    }
    console.log('');

    // Test 4: Retrieve valid share
    console.log(`${YELLOW}Test 4: GET /api/share/:id with valid UUID${NC}`);
    if (shareId) {
        try {
            const response = await fetch(`${BASE_URL}/api/share/${shareId}`);
            const data = await response.json();
            if (response.status === 200 && data.version === 1) {
                console.log(`${GREEN}✓ PASS: Retrieved share successfully${NC}`);
                console.log('Payload preview:', JSON.stringify(data.canvas));
            } else {
                console.log(`${RED}✗ FAIL: Expected 200 status and version 1${NC}`);
                console.log('Response:', data);
            }
        } catch (err) {
            console.log(`${RED}✗ ERROR: ${err.message}${NC}`);
        }
    } else {
        console.log(`${RED}✗ SKIP: No valid share ID from Test 1${NC}`);
    }
    console.log('');

    // Test 5: Non-existent share
    console.log(`${YELLOW}Test 5: GET /api/share/:id with non-existent UUID${NC}`);
    try {
        const response = await fetch(`${BASE_URL}/api/share/00000000-0000-4000-8000-000000000000`);
        if (response.status === 404) {
            console.log(`${GREEN}✓ PASS: Returned 404 for non-existent share${NC}`);
        } else {
            console.log(`${RED}✗ FAIL: Expected 404 status, got ${response.status}${NC}`);
        }
    } catch (err) {
        console.log(`${RED}✗ ERROR: ${err.message}${NC}`);
    }
    console.log('');

    // Test 6: Invalid UUID format
    console.log(`${YELLOW}Test 6: GET /api/share/:id with invalid UUID format${NC}`);
    try {
        const response = await fetch(`${BASE_URL}/api/share/invalid-uuid-format`);
        if (response.status === 400) {
            console.log(`${GREEN}✓ PASS: Rejected invalid UUID format with 400${NC}`);
        } else {
            console.log(`${RED}✗ FAIL: Expected 400 status, got ${response.status}${NC}`);
        }
    } catch (err) {
        console.log(`${RED}✗ ERROR: ${err.message}${NC}`);
    }
    console.log('');

    // Test 7: CORS preflight for POST
    console.log(`${YELLOW}Test 7: OPTIONS /api/share (CORS preflight)${NC}`);
    try {
        const response = await fetch(`${BASE_URL}/api/share`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:5173',
                'Access-Control-Request-Method': 'POST'
            }
        });
        if (response.status === 200) {
            console.log(`${GREEN}✓ PASS: CORS preflight successful${NC}`);
        } else {
            console.log(`${RED}✗ FAIL: Expected 200 status, got ${response.status}${NC}`);
        }
    } catch (err) {
        console.log(`${RED}✗ ERROR: ${err.message}${NC}`);
    }
    console.log('');

    // Test 8: CORS preflight for GET
    console.log(`${YELLOW}Test 8: OPTIONS /api/share/:id (CORS preflight)${NC}`);
    try {
        const response = await fetch(`${BASE_URL}/api/share/test-id`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:5173',
                'Access-Control-Request-Method': 'GET'
            }
        });
        if (response.status === 200) {
            console.log(`${GREEN}✓ PASS: CORS preflight successful${NC}`);
        } else {
            console.log(`${RED}✗ FAIL: Expected 200 status, got ${response.status}${NC}`);
        }
    } catch (err) {
        console.log(`${RED}✗ ERROR: ${err.message}${NC}`);
    }
    console.log('');

    // Test 9: Method not allowed (POST to GET endpoint)
    console.log(`${YELLOW}Test 9: POST /api/share/:id (method not allowed)${NC}`);
    try {
        const response = await fetch(`${BASE_URL}/api/share/test-id`, {
            method: 'POST'
        });
        if (response.status === 405) {
            console.log(`${GREEN}✓ PASS: Rejected POST to GET endpoint with 405${NC}`);
        } else {
            console.log(`${RED}✗ FAIL: Expected 405 status, got ${response.status}${NC}`);
        }
    } catch (err) {
        console.log(`${RED}✗ ERROR: ${err.message}${NC}`);
    }
    console.log('');

    // Test 10: Method not allowed (GET to POST endpoint)
    console.log(`${YELLOW}Test 10: GET /api/share (method not allowed)${NC}`);
    try {
        const response = await fetch(`${BASE_URL}/api/share`, {
            method: 'GET'
        });
        if (response.status === 405) {
            console.log(`${GREEN}✓ PASS: Rejected GET to POST endpoint with 405${NC}`);
        } else {
            console.log(`${RED}✗ FAIL: Expected 405 status, got ${response.status}${NC}`);
        }
    } catch (err) {
        console.log(`${RED}✗ ERROR: ${err.message}${NC}`);
    }
    console.log('');

    console.log('============================================');
    console.log('Test Suite Complete');
    console.log('============================================\n');
}

runTests();
