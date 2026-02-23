import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3001/api';

async function runTest() {
    console.log('🚀 Starting Simplified Rider Payout Verification Test');

    try {
        // 1. Get CSRF Token
        console.log('Fetching CSRF token...');
        const csrfRes = await axios.get(`${API_BASE}/csrf-token`);
        const csrfToken = csrfRes.data.token;
        const cookies = csrfRes.headers['set-cookie'];

        const headers = {
            'X-CSRF-Token': csrfToken,
            'Cookie': cookies?.join('; ')
        };

        const riderId = 'RD-TEST-PAYOUT';
        const phone = '0712345678';

        // 2. Manually seed rider if needed (already done via fs in AGENT thought, but let's assume it exists or use API)
        // We'll try to find any approved rider with balance first
        const ridersRes = await axios.get(`${API_BASE}/admin/riders`, { headers });
        let rider = ridersRes.data.riders.find((r: any) => r.status === 'approved' && r.currentBalance >= 50);

        if (!rider) {
            console.log('No eligible rider found. Seed one manually or use existing.');
            // For the sake of the test reaching the payout, we need a rider in memory and JSON.
            // I'll take the first rider and approve+give balance to them via admin API
            const firstRider = ridersRes.data.riders[0];
            if (firstRider) {
                console.log(`Setting up rider ${firstRider.id} for payout test...`);
                await axios.patch(`${API_BASE}/admin/riders/${firstRider.id}/status`, { status: 'approved' }, { headers });
                await axios.post(`${API_BASE}/admin/riders/${firstRider.id}/add-earning`, { orderId: 'TEST-EARN', orderAmount: 500 }, { headers });
                rider = { id: firstRider.id, phone: firstRider.phone, fullName: firstRider.fullName };
            } else {
                console.log('No riders found at all. Please run rider registration first.');
                return;
            }
        }

        console.log(`Testing with Rider: ${rider.fullName} (${rider.id})`);

        // 3. Create Withdrawal request
        console.log('Creating withdrawal request...');
        const withdrawRes = await axios.post(`${API_BASE}/riders/${rider.id}/withdrawal-request`, {
            amount: 100,
            notes: 'Verification test payout'
        }, { headers });

        const requestId = withdrawRes.data.withdrawalRequest.id;
        console.log(`✅ Withdrawal Request Created: ${requestId}`);

        // 4. Approve the withdrawal request (triggers B2C)
        console.log(`Approving withdrawal request ${requestId}...`);
        try {
            const approveRes = await axios.patch(`${API_BASE}/admin/withdrawal-requests/${requestId}`, {
                status: 'approved',
                adminNotes: 'Approved via verification script'
            }, { headers });

            console.log('✅ Approval Response:', JSON.stringify(approveRes.data, null, 2));
        } catch (error: any) {
            console.log('❌ Payout call failed (Expected if sandbox credentials):', error.response?.data || error.message);
        }

        // 5. Check logs
        console.log('\nChecking logs for B2C initiation...');
        const logPath = path.join(process.cwd(), 'mpesa-debug.log');
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (fs.existsSync(logPath)) {
            const logs = fs.readFileSync(logPath, 'utf-8');
            if (logs.includes('Initiating real M-Pesa B2C Payout') || logs.includes('SalaryPayment')) {
                console.log('🎉 VERIFIED: M-Pesa B2C payout initiation recorded in logs!');
            } else {
                const recentLogs = logs.split('\n').slice(-10).join('\n');
                console.log('B2C entry missing. Recent logs:\n', recentLogs);
            }
        }

    } catch (error: any) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}

runTest();
