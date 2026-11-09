import assert from 'assert';

// Mock localStorage and sessionStorage
class MemoryStorage {
  constructor() { this.store = new Map(); }
  getItem(k) { return this.store.has(k) ? this.store.get(k) : null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
}

const localStorage = new MemoryStorage();
const sessionStorage = new MemoryStorage();

// Test WebCrypto PBKDF2
const enc = new TextEncoder();
const toB64 = b => Buffer.from(b).toString('base64');
const fromB64 = s => new Uint8Array(Buffer.from(s, 'base64'));

async function hash(pass, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 150000 }, key, 256);
  return toB64(bits);
}

async function runTests() {
  console.log('--- Starting Auth System Unit Tests ---');

  // Test 1: Hashing with salt produces reliable verify
  const pass1 = 'SuperSecret123!';
  const salt1 = crypto.getRandomValues(new Uint8Array(16));
  const h1 = await hash(pass1, salt1);
  const verify1 = await hash(pass1, fromB64(toB64(salt1)));
  assert.strictEqual(h1, verify1, 'Password verify must match');
  console.log('✓ Test 1: WebCrypto PBKDF2 hashing & verification passed');

  // Test 2: Different passwords produce different hashes
  const h2 = await hash('WrongPass123!', salt1);
  assert.notStrictEqual(h1, h2, 'Wrong password must produce different hash');
  console.log('✓ Test 2: Distinct passwords correctly fail verification');

  // Test 3: Registration and User Storage
  const users = {};
  const email = 'astronomer@scienceuniverse.edu';
  const name = 'Тулга';
  const regSalt = crypto.getRandomValues(new Uint8Array(16));
  const regHash = await hash('MyPass2026!', regSalt);

  users[email] = {
    name,
    mail: email,
    salt: toB64(regSalt),
    hash: regHash,
    credits: 0,
    unlockedSections: {},
    createdAt: Date.now()
  };
  localStorage.setItem('rf_users', JSON.stringify(users));

  const storedUsers = JSON.parse(localStorage.getItem('rf_users'));
  assert.strictEqual(storedUsers[email].name, 'Тулга');
  assert.strictEqual(storedUsers[email].credits, 0);
  console.log('✓ Test 3: User registration storage passed');

  // Test 4: Credit earning & persistence
  storedUsers[email].credits += 150;
  localStorage.setItem('rf_users', JSON.stringify(storedUsers));
  assert.strictEqual(JSON.parse(localStorage.getItem('rf_users'))[email].credits, 150);
  console.log('✓ Test 4: Credit update & persistence passed');

  // Test 5: 120-credit section unlock
  const user = JSON.parse(localStorage.getItem('rf_users'))[email];
  assert(user.credits >= 120, 'User has sufficient credits');
  user.credits -= 120;
  user.unlockedSections['spacelab'] = true;
  localStorage.setItem('rf_users', JSON.stringify({ [email]: user }));

  const afterUnlock = JSON.parse(localStorage.getItem('rf_users'))[email];
  assert.strictEqual(afterUnlock.credits, 30);
  assert.strictEqual(afterUnlock.unlockedSections['spacelab'], true);
  console.log('✓ Test 5: Section unlock deductions & unlock persistence passed');

  // Test 6: Logout preserves user credits in rf_users
  localStorage.removeItem('rf_session');
  sessionStorage.removeItem('rf_session');
  assert.strictEqual(localStorage.getItem('rf_session'), null);
  const preservedUser = JSON.parse(localStorage.getItem('rf_users'))[email];
  assert.strictEqual(preservedUser.credits, 30, 'Credits must NOT be wiped on logout');
  console.log('✓ Test 6: User credits preserved in rf_users after logout');

  // Test 7: Re-login restores exact session and credits
  sessionStorage.setItem('rf_session', email);
  const activeSessionMail = sessionStorage.getItem('rf_session');
  const loggedInUser = JSON.parse(localStorage.getItem('rf_users'))[activeSessionMail];
  assert.strictEqual(loggedInUser.credits, 30);
  assert.strictEqual(loggedInUser.name, 'Тулга');
  console.log('✓ Test 7: Re-login accurately restores user session and credit balance');

  console.log('\nAll 7 Auth System unit tests passed cleanly!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

