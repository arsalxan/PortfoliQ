const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Feedback = require('../models/feedback');
const Portfolio = require('../models/portfolio');
const { isLoggedIn } = require('../middleware');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Multer setup for DP uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/dps/');
  },
  filename: function (req, file, cb) {
    cb(null, 'dp-' + req.user._id + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create directory for DPs if it doesn't exist
const fs = require('fs');
const dpUploadsDir = 'public/uploads/dps/';
if (!fs.existsSync(dpUploadsDir)) {
    fs.mkdirSync(dpUploadsDir, { recursive: true });
}

// Show user profile
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const userPortfolios = await Portfolio.find({ user: req.user._id }).limit(4);
    const userFeedbacks = await Feedback.find({ user: req.user._id }).populate('portfolio').limit(3);
    res.render('users/profile', { user: req.user, userPortfolios, userFeedbacks, isProfilePage: true });
  } catch (err) {
    console.error('Error fetching profile data:', err);
    req.flash('error', 'Error loading profile data.');
    res.redirect('/'); // Redirect to home or dashboard on error
  }
});

// Show feedbacks given by the user
router.get('/myfeedbacks', isLoggedIn, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id }).populate('user').populate({ path: 'portfolio', populate: { path: 'user' } });
    res.render('users/my_feedbacks', { feedbacks });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error fetching your feedbacks.');
    res.redirect('/profile');
  }
});

// Show all portfolios given by the user
router.get('/myportfolios', isLoggedIn, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id }).populate('user');
    res.render('users/my_portfolios', { portfolios });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error fetching your portfolios.');
    res.redirect('/profile');
  }
});

// Update user profile (PUT)
router.put('/', isLoggedIn, upload.single('dp'),
  [
    body('username').trim().notEmpty().withMessage('Username cannot be empty.'),
    body('fullName').trim().escape(),
    body('email').isEmail().withMessage('Please enter a valid email address.'),
  ],
  async (req, res) => {
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      for (let error of errors.array()) {
        req.flash('error', error.msg);
      }
      return res.redirect('/profile'); // Redirect to main profile page on error
    }

    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        req.flash('error', 'User not found.');
        return res.redirect('/profile');
      }

      // Update username if provided and unique
      if (req.body.username && req.body.username !== user.username) {
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
          req.flash('error', 'Username already taken.');
          return res.redirect('/profile'); // Redirect to main profile page on error
        }
        user.username = req.body.username;
      }

      // Update full name
      if ('fullName' in req.body) {
        user.fullName = req.body.fullName;
      }

      // Update email if provided and unique
      if (req.body.email && req.body.email !== user.email) {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
          req.flash('error', 'Email already taken.');
          return res.redirect('/profile'); // Redirect to main profile page on error
        }
        user.email = req.body.email;
      }

      // Update password if provided
      if (req.body.password) {
        await user.setPassword(req.body.password); // Passport-local-mongoose method
      }

      // Update DP if a new file is uploaded
      if (req.file) {
        user.dp = '/uploads/dps/' + req.file.filename;
      }

      await user.save();
      req.flash('success', 'Profile updated successfully!');
      res.redirect('/profile');
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.name === 'ValidationError') {
        for (let field in err.errors) {
          req.flash('error', err.errors[field].message);
        }
      } else if (err.code === 11000) { // Duplicate key error for unique fields
        req.flash('error', 'A user with that username or email already exists.');
      } else {
        req.flash('error', 'Error updating profile: ' + err.message);
      }
      res.redirect('/profile'); // Redirect to main profile page on error
    }
  }
);

// Delete user profile
router.delete('/', isLoggedIn, async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.user._id);
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/profile');
    }

    // Delete all portfolios created by the user
    await Portfolio.deleteMany({ user: user._id });

    // Delete all feedbacks given by the user
    await Feedback.deleteMany({ user: user._id });

    // Delete all feedbacks on portfolios owned by the user
    // This requires iterating through portfolios and pulling feedbacks
    const usersPortfolios = await Portfolio.find({ user: user._id });
    for (let portfolio of usersPortfolios) {
      await Feedback.deleteMany({ portfolio: portfolio._id });
    }

    // Delete the user account
    await User.findByIdAndDelete(user._id);

    // Log out the user
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', 'Your account has been deleted.');
      res.redirect('/');
    });

  } catch (err) {
    console.error('Account deletion error:', err);
    req.flash('error', 'Error deleting account: ' + err.message);
    res.redirect('/profile');
  }
});

module.exports = router;