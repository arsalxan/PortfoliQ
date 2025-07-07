const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Portfolio = require('../models/portfolio');
const Feedback = require('../models/feedback');
const { isLoggedIn } = require('../middleware');
const { body, validationResult } = require('express-validator');

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
    body('username').trim().notEmpty().withMessage('Username cannot be empty.'),
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('fullName').trim().notEmpty().withMessage('Full Name cannot be empty.'),
    body('password').notEmpty().withMessage('Password cannot be empty.'),
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
      const user = new User({ username, email, fullName });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, err => {
        if (err) return next(err);
        req.flash('success', 'Welcome to the Portfolio Feedback Platform!');
        res.redirect('/portfolios');
      });
    } catch (e) {
      req.flash('error', e.message);
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
}), (req, res) => {
  req.flash('success', 'Welcome back!');
  res.redirect('/portfolios');
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

// Dashboard
router.get('/dashboard', isLoggedIn, async (req, res) => {
  const portfolios = await Portfolio.find({ user: req.user._id }).populate('user').sort({ createdAt: -1 }).limit(3);
  const feedbacks = await Feedback.find({ user: req.user._id }).populate({ path: 'portfolio', populate: { path: 'user' } }).populate('user').sort({ createdAt: -1 }).limit(3);
  res.render('dashboard', { portfolios, feedbacks });
});

module.exports = router;