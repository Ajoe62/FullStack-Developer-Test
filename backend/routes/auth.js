import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load user data
const usersPath = path.join(__dirname, '../data/users.json');
const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

// In-memory refresh token storage (use Redis in production)
const refreshTokens = new Set();

/**
 * POST /auth/login
 * Validates credentials and returns access + refresh tokens
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = usersData.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Create JWT payload
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    // Generate tokens
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    // Store refresh token
    refreshTokens.add(refreshToken);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: error.message
    });
  }
});

/**
 * POST /auth/refresh
 * Accepts refresh token and issues new access token
 */
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token required',
        message: 'No refresh token provided'
      });
    }

    // Check if refresh token exists in storage
    if (!refreshTokens.has(refreshToken)) {
      return res.status(403).json({ 
        error: 'Invalid refresh token',
        message: 'Refresh token not found or has been revoked'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    res.json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Refresh token expired',
        message: 'Please login again'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Invalid refresh token',
        message: 'The provided refresh token is invalid'
      });
    }

    console.error('Refresh error:', error);
    res.status(500).json({ 
      error: 'Token refresh failed',
      message: error.message
    });
  }
});

/**
 * POST /auth/logout
 * Revokes refresh token
 */
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }

  res.json({ message: 'Logout successful' });
});

export default router;
