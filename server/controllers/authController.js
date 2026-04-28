const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function debugLog(hypothesisId, location, message, data = {}) {
  // #region agent log
  if (typeof fetch === 'function') fetch('http://127.0.0.1:7824/ingest/54a07c34-9f4d-4230-8698-9a6304c39192',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'928544'},body:JSON.stringify({sessionId:'928544',runId:'qa-audit-server',hypothesisId,location,message,data,timestamp:Date.now()})}).catch(()=>{});
  // #endregion
}

async function register(req, res) {
  const { name, email, password } = req.body;
  debugLog('H7', 'authController.js:register:entry', 'Register called', { hasName: !!name, hasEmail: !!email, passwordLength: password ? password.length : 0 });
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!isValidEmail(email)) {
    debugLog('H11', 'authController.js:register:invalid-email', 'Invalid email rejected');
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (password.length < 6) {
    debugLog('H11', 'authController.js:register:weak-password', 'Weak password rejected', { passwordLength: password.length });
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  try {
    const existing = await db.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length > 0) {
      debugLog('H7', 'authController.js:register:duplicate', 'Duplicate register attempt', { emailHashHint: email.slice(0, 2) });
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id, name, email',
      [name, email, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('register:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  debugLog('H8', 'authController.js:login:entry', 'Login called', { hasEmail: !!email, passwordProvided: !!password });
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (!isValidEmail(email)) {
    debugLog('H11', 'authController.js:login:invalid-email', 'Invalid email rejected');
    return res.status(400).json({ error: 'Invalid email format' });
  }
  try {
    const result = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user) {
      debugLog('H8', 'authController.js:login:missing-user', 'Login failed user not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      debugLog('H8', 'authController.js:login:bad-password', 'Login failed password mismatch', { userId: user.id });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('login:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

async function me(req, res) {
  try {
    const result = await db.query('SELECT id, name, email FROM users WHERE id=$1', [req.user.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { register, login, me };
