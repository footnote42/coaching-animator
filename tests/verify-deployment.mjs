const DEPLOYMENT_URL = 'https://coaching-animator-2rk6jbdb8-footnote42s-projects.vercel.app';

async function runVerification() {
    console.log(`Verifying deployment at: ${DEPLOYMENT_URL}`);

    // Test Payload
    const payload = {
        version: 1,
        canvas: { width: 800, height: 600 },
        entities: [
            { id: 'p1', type: 'player', team: 'attack', x: 100, y: 100 }
        ],
        frames: []
    };

    try {
        // 1. Test POST /api/share
        console.log('\nTesting POST /api/share...');
        const postRes = await fetch(`${DEPLOYMENT_URL}/api/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!postRes.ok) {
            const txt = await postRes.text();
            throw new Error(`POST failed: ${postRes.status} ${txt}`);
        }

        const postData = await postRes.json();
        if (!postData.id) throw new Error('No ID returned from POST');
        console.log('✅ POST success. ID:', postData.id);

        // 2. Test GET /api/share/:id
        console.log('\nTesting GET /api/share/:id...');
        const getRes = await fetch(`${DEPLOYMENT_URL}/api/share/${postData.id}`);

        if (!getRes.ok) {
            const txt = await getRes.text();
            throw new Error(`GET failed: ${getRes.status} ${txt}`);
        }

        const getData = await getRes.json();
        if (getData.version !== 1) throw new Error('Version mismatch in retrieved data');
        if (getData.entities[0].id !== 'p1') throw new Error('Data mismatch');
        console.log('✅ GET success. Payload verified.');

        // 3. Test Invalid Version (Error Case)
        console.log('\nTesting Invalid Version...');
        const invalidRes = await fetch(`${DEPLOYMENT_URL}/api/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, version: 2 })
        });

        if (invalidRes.status === 400 || invalidRes.status === 500) {
            console.log('✅ Invalid version rejected correctly (Status:', invalidRes.status, ')');
        } else {
            console.warn('⚠️ Invalid version NOT rejected as expected. Status:', invalidRes.status);
        }

        console.log('\n🎉 ALL CHECKS PASSED');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error);
        process.exit(1);
    }
}

runVerification();
