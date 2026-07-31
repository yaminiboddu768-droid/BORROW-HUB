// BE-7: Backend API Test Script
// Run: node test-backend.js
// Requires: dev server running on localhost:3001

const BASE = 'http://localhost:3000';

let passCount = 0;
let failCount = 0;

async function test(name, fn) {
  try {
    const result = await fn();
    if (result.pass) {
      console.log(`  ✅ PASS: ${name}`);
      if (result.note) console.log(`       → ${result.note}`);
      passCount++;
    } else {
      console.log(`  ❌ FAIL: ${name}`);
      console.log(`       → Expected: ${result.expected}`);
      console.log(`       → Got: ${result.got}`);
      failCount++;
    }
  } catch (e) {
    console.log(`  ❌ ERROR: ${name} — ${e.message}`);
    failCount++;
  }
}

async function post(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Cookie'] = `next-auth.session-token=${token}`;
  const res = await fetch(BASE + url, { method: 'POST', headers, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json() };
}

async function get(url, token) {
  const headers = token ? { 'Cookie': `next-auth.session-token=${token}` } : {};
  const res = await fetch(BASE + url, { headers });
  return { status: res.status, data: await res.json() };
}

async function patch(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Cookie'] = `next-auth.session-token=${token}`;
  const res = await fetch(BASE + url, { method: 'PATCH', headers, body: JSON.stringify(body) });
  return { status: res.status, data: await res.json() };
}

// Get a NextAuth JWT via credentials
async function getSession(email, password) {
  // Use NextAuth's signIn - call /api/auth/callback/credentials
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&csrfToken=test&callbackUrl=/`,
    redirect: 'manual'
  });
  const cookies = res.headers.get('set-cookie') || '';
  // Extract JWT session cookie
  const match = cookies.match(/next-auth\.session-token=([^;]+)/);
  return match ? match[1] : null;
}

async function run() {
  console.log('\n🔬 Borrow Hub — BE-7 Backend Test Pass\n');
  console.log('━'.repeat(50));

  // ─── AUTH TESTS ───────────────────────────────────────
  console.log('\n📋 Authentication Tests');

  const ts = Date.now();
  const testEmail = `user_${ts}@loop.test`;

  let signupData;
  await test('Signup with valid credentials', async () => {
    const r = await post('/api/auth/signup', { name: 'Test User', email: testEmail, password: 'secure123' });
    signupData = r.data;
    return { pass: r.status === 201 && r.data.email === testEmail, note: `User created: ${r.data.id}` };
  });

  await test('Signup with duplicate email should return 409', async () => {
    const r = await post('/api/auth/signup', { name: 'Dup', email: testEmail, password: 'secure123' });
    return { pass: r.status === 409 && r.data.error?.code === 'CONFLICT', note: r.data.error?.message };
  });

  await test('Signup with invalid email should return 400', async () => {
    const r = await post('/api/auth/signup', { name: 'Bad', email: 'notanemail', password: 'secure123' });
    return { pass: r.status === 400, note: r.data.error?.message };
  });

  await test('Signup with weak password should return 400', async () => {
    const r = await post('/api/auth/signup', { name: 'Weak', email: 'weak@test.com', password: '123' });
    return { pass: r.status === 400, note: r.data.error?.message };
  });

  // ─── ITEMS API TESTS ──────────────────────────────────
  console.log('\n📋 Items API Tests');

  await test('GET /api/items returns seeded items', async () => {
    const r = await get('/api/items');
    return { pass: r.status === 200 && Array.isArray(r.data) && r.data.length > 0, note: `${r.data.length} items returned` };
  });

  await test('GET /api/items?source=NEIGHBOUR returns only NEIGHBOUR items', async () => {
    const r = await get('/api/items?source=NEIGHBOUR');
    const allNeighbour = r.data.every(item => item.source === 'NEIGHBOUR');
    return { pass: r.status === 200 && allNeighbour, note: `${r.data.length} NEIGHBOUR items, all correct source: ${allNeighbour}` };
  });

  await test('GET /api/items?source=ONLINE returns only ONLINE items', async () => {
    const r = await get('/api/items?source=ONLINE');
    const allOnline = r.data.every(item => item.source === 'ONLINE');
    return { pass: r.status === 200 && allOnline, note: `${r.data.length} ONLINE items` };
  });

  await test('GET /api/items?category=TOOLS filters by category', async () => {
    const r = await get('/api/items?category=TOOLS');
    const allTools = r.data.every(item => item.category === 'TOOLS');
    return { pass: r.status === 200 && allTools, note: `${r.data.length} TOOLS items` };
  });

  await test('POST /api/items without auth returns 401', async () => {
    const r = await post('/api/items', { name: 'Test', category: 'TOOLS', pricePerDay: 5, source: 'NEIGHBOUR' });
    return { pass: r.status === 401, note: r.data.error?.message };
  });

  // ─── BORROW REQUEST TESTS ─────────────────────────────
  console.log('\n📋 BorrowRequest API Tests');

  await test('POST /api/requests without auth returns 401', async () => {
    const r = await post('/api/requests', { itemId: 'fake-id' });
    return { pass: r.status === 401, note: r.data.error?.message };
  });

  await test('POST /api/requests with non-existent item returns 404', async () => {
    // Log in as test user first via credentials endpoint
    const session = await getSession(testEmail, 'secure123');
    if (!session) return { pass: false, expected: 'valid session token', got: 'null - login failed' };
    const r = await post('/api/requests', { itemId: 'non-existent-item-id' }, session);
    return { pass: r.status === 404, note: r.data.error?.message };
  });

  // ─── ONLINE ITEMS ISOLATION CHECK ─────────────────────
  console.log('\n📋 Online/Neighbour Isolation Tests (BE-5)');

  await test('NEIGHBOUR items query has zero ONLINE items', async () => {
    const r = await get('/api/items?source=NEIGHBOUR');
    const hasOnline = r.data.some(item => item.source === 'ONLINE');
    return { pass: !hasOnline, note: hasOnline ? 'LEAK DETECTED!' : 'Clean isolation confirmed' };
  });

  await test('ONLINE items query has zero NEIGHBOUR items', async () => {
    const r = await get('/api/items?source=ONLINE');
    const hasNeighbour = r.data.some(item => item.source === 'NEIGHBOUR');
    return { pass: !hasNeighbour, note: hasNeighbour ? 'LEAK DETECTED!' : 'Clean isolation confirmed' };
  });

  // ─── SUMMARY ──────────────────────────────────────────
  console.log('\n' + '━'.repeat(50));
  console.log(`\n🏁 Test Summary: ${passCount} passed, ${failCount} failed\n`);
  if (failCount > 0) process.exit(1);
}

run().catch(console.error);
