const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Portfolio = require('../models/portfolio');
const Feedback = require('../models/feedback');
const { isLoggedIn } = require('../middleware');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Landing Page
router.get('/', (req, res) => {
    res.render('landing');
});

// Register
router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.')
      .matches(/^[a-z0-9_]+$/).withMessage('Username can only contain lowercase letters, numbers, and underscores.'),
    body('email').isEmail().withMessage('Please enter a valid email address.')
      .custom(value => {
        const allowedEmailDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'aol.com', 'protonmail.com', 'icloud.com', 'mail.com', 'zoho.com', 'yandex.com', 'gmx.com', 'live.com'];
        const emailDomain = value.split('@')[1];
        if (!allowedEmailDomains.includes(emailDomain)) {
          throw new Error('Only popular email providers are allowed for registration.');
        }
        return true;
      }),
    body('fullName').trim().notEmpty().withMessage('Full Name cannot be empty.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/)
      .withMessage('Password must contain at least one uppercase letter, one number, and one special character.'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      for (let error of errors.array()) {
        req.flash('error', error.msg);
      }
      return res.redirect('/register');
    }

    try {
      const { username, email, fullName, password } = req.body;

      // Generate verification token
      const token = crypto.randomBytes(20).toString('hex');
      const tokenExpires = Date.now() + 3600000; // 1 hour from now

      const user = new User({
        username,
        email,
        fullName,
        emailVerificationToken: token,
        emailVerificationTokenExpires: tokenExpires
      });

      const registeredUser = await User.register(user, password);

      // Send verification email
      const verificationUrl = `http://${req.headers.host}/verify-email/${token}`;
      const msg = {
        to: email,
        from: process.env.SENDGRID_VERIFIED_SENDER_EMAIL,
        subject: 'Verify Your Email for PortfolioQue',
        text: `You are receiving this because you (or someone else) have registered an account on PortfoliQue. Please click on the following link, or paste this into your browser to complete the process:\n\n${verificationUrl}\n\nIf you did not request this, please ignore this email.\n`,
        html: `<p>You are receiving this because you (or someone else) have registered an account on PortfoliQue.</p><p>Please click on the following link, or paste this into your browser to complete the process:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>If you did not request this, please ignore this email.</p>`,
      };

      await sgMail.send(msg);

      req.flash('success', 'Welcome to PortfolioQue!<br> <strong>A verification email has been sent to your email address. Please check your inbox (and spam folder) to verify your account.</strong>');
      res.redirect('/login'); // Redirect to login after registration for email verification
    } catch (e) {
      if (e.name === 'UserExistsError') {
        req.flash('error', 'Username already taken, try a new one');
      } else if (e.code === 11000 && e.message.includes('email')) {
        req.flash('error', 'Email already registered, please use a different email or login.');
      } else {
        req.flash('error', e.message);
      }
      res.redirect('register');
    }
  }
);

// Login
router.get('/login', (req, res) => {
  res.render('users/login');
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), (req, res, next) => {
  if (!req.user.isEmailVerified) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('error', 'Please verify your email address before logging in. Check your inbox for a verification link.');
      return res.redirect('/login');
    });
  } else {
    req.flash('success', 'Welcome back!');
    res.redirect('/portfolios');
  }
});

// Logout
router.post('/logout', (req, res, next) => {
    req.flash('success', 'Goodbye!');
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy(function (err) {
            if (err) { return next(err); }
            res.redirect('/portfolios');
        });
    });
});

// Email Verification Route
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error', 'Email verification token is invalid or has expired.');
      return res.redirect('/register'); // Or wherever you want them to go
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    req.flash('success', 'Your email has been successfully verified! You can now log in.');
    res.redirect('/login');

  } catch (e) {
    console.error(e);
    req.flash('error', 'An error occurred during email verification.');
    res.redirect('/register'); // Or wherever you want them to go
  }
});

// Dashboard
router.get('/dashboard', isLoggedIn, async (req, res) => {
  const portfolios = await Portfolio.find({ user: req.user._id }).populate('user').sort({ createdAt: -1 }).limit(3);
  const feedbacks = await Feedback.find({ user: req.user._id }).populate({ path: 'portfolio', populate: { path: 'user' } }).sort({ createdAt: -1 }).limit(3);
  res.render('dashboard', { portfolios, feedbacks });
});

module.exports = router;