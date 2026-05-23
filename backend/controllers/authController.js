/**
 * Auth Controller
 * Handles admin login and token verification.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');

/**
 * POST /api/auth/login
 * Verify email + password, return signed JWT (8h expiry).
 */
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required.',
    });
  }

  // Authenticate using Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password,
  });

  let isAuthenticated = false;
  let adminId = 'local-admin-1';
  let adminEmail = email.toLowerCase().trim();

  if (data && data.user && !error) {
    isAuthenticated = true;
    adminId = data.user.id;
    adminEmail = data.user.email;
  }

  // Fallback to Env configs if Supabase Auth fails (e.g., user not created yet)
  if (!isAuthenticated) {
    const envEmail = process.env.ADMIN_EMAIL || 'admin@koshish.org';
    const envPassword = process.env.ADMIN_PASSWORD || 'koshish2024';
    if (adminEmail === envEmail && password === envPassword) {
      isAuthenticated = true;
    }
  }

  if (!isAuthenticated) {
    return res.status(401).json({
      success: false,
      error: error ? error.message : 'Invalid email or password.',
    });
  }

  const token = jwt.sign(
    { id: adminId, email: adminEmail },
    process.env.JWT_SECRET || 'koshish_default_jwt_secret_key_2025',
    { expiresIn: '8h' }
  );

  return res.json({
    success: true,
    data: { token, admin: { id: adminId, email: adminEmail } },
  });
}

/**
 * GET /api/auth/verify
 * Return the authenticated admin info from the JWT payload.
 */
async function verify(req, res) {
  return res.json({
    success: true,
    data: { admin: req.admin },
  });
}

module.exports = { login, verify };
