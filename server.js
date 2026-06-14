const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./'));

// In-memory storage for verification tokens (for demo - use database in production)
const verificationTokens = new Map();
const registeredUsers = new Map();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Generate verification token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Signup route
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Check if user already exists
    if (registeredUsers.has(email)) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Generate verification token
    const token = generateToken();
    const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Store token and user data
    verificationTokens.set(token, { email, password, expiryTime });

    // Create verification link
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?token=${token}`;

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Email Verification - Football Skills Guide',
      html: `
        <h2>Welcome to Football Skills Guide!</h2>
        <p>Thank you for signing up. Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}" style="background-color: #d72a0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>Or paste this link in your browser:</p>
        <p>${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't sign up for this account, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Error during signup. Please try again.' });
  }
});

// Verify email route
app.post('/api/verify', (req, res) => {
  try {
    const { token } = req.body;

    if (!token || !verificationTokens.has(token)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    const { email, password, expiryTime } = verificationTokens.get(token);

    // Check if token expired
    if (Date.now() > expiryTime) {
      verificationTokens.delete(token);
      return res.status(400).json({ success: false, message: 'Token has expired.' });
    }

    // Register user
    registeredUsers.set(email, { email, password, verifiedAt: new Date() });
    verificationTokens.delete(token);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: 'Error verifying email.' });
  }
});

// Login route
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    if (!registeredUsers.has(email)) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = registeredUsers.get(email);
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: { email: user.email, verifiedAt: user.verifiedAt }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error during login.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Football Skills Guide backend running on http://localhost:${PORT}`);
});
