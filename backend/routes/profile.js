import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
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

/**
 * GET /profile
 * Protected route - requires valid access token
 * Returns user profile information
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    // req.user is set by authenticateToken middleware
    const user = usersData.users.find(u => u.id === req.user.userId);

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User account no longer exists'
      });
    }

    // Return user profile (exclude password hash)
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenInfo: {
        userId: req.user.userId,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
});

export default router;
