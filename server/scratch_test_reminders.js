const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function testMultiUserReminders() {
  console.log('=== Step 1: Register User 1 (alex@example.com) ===');
  const u1Res = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { name: 'Alex User', email: 'alex@example.com', password: 'password123', timeZone: 'UTC' });
  
  let t1 = u1Res.body.token;
  if (!t1) {
    // If already registered, login
    const l1 = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'alex@example.com', password: 'password123' });
    t1 = l1.body.token;
  }
  console.log('User 1 Logged in as:', 'alex@example.com');

  console.log('\n=== Step 2: Register User 2 (bhavisha@example.com) ===');
  const u2Res = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { name: 'Bhavisha User', email: 'bhavisha@example.com', password: 'password123', timeZone: 'UTC' });
  
  let t2 = u2Res.body.token;
  if (!t2) {
    // If already registered, login
    const l2 = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'bhavisha@example.com', password: 'password123' });
    t2 = l2.body.token;
  }
  console.log('User 2 Logged in as:', 'bhavisha@example.com');

  console.log('\n=== Step 3: Triggering Reminder for User 1 (alex@example.com) ===');
  const rem1 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/tasks/test-reminder',
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + t1 }
  });
  console.log('User 1 Reminder Response:', rem1.body);

  console.log('\n=== Step 4: Triggering Reminder for User 2 (bhavisha@example.com) ===');
  const rem2 = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/tasks/test-reminder',
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + t2 }
  });
  console.log('User 2 Reminder Response:', rem2.body);

  process.exit(0);
}

testMultiUserReminders().catch(err => {
  console.error(err);
  process.exit(1);
});
