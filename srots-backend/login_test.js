const http = require('http');

function post(url, data) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const postData = JSON.stringify(data);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: body });
            });
        });

        req.on('error', (e) => reject(e));
        req.write(postData);
        req.end();
    });
}

async function test(username, password) {
    console.log(`\n>>> Testing: ${username} | ${password}`);
    try {
        const result = await post('http://localhost:8081/api/v1/auth/login', { username, password });
        console.log(`Status: ${result.status}`);
        console.log(`Body: ${result.body}`);
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

async function run() {
    await test('SRM_21701A0501', 'SRM_21701A0501_9012');
    await test('SRM_21701A0501', 'SRM_21701A0501@9012');
    await test('srots_admin', 'Srots_admin@8847');
    await test('srots_admin', 'SROTS_ADMIN@8847');
}

run();
