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
    res.render('users/profile', { user: req.user, userPortfolios, userFeedbacks });
  } catch (err) {
    console.error('Error fetching profile data:', err);
    req.flash('error', 'Error loading profile data.');
    res.redirect('/'); // Redirect to home or dashboard on error
  }
});

// Edit user profile (GET)
router.get('/edit', isLoggedIn, async (req, res) => {
  res.render('users/edit_profile', { user: req.user });
});

// Show feedbacks given by the user
router.get('/myfeedbacks', isLoggedIn, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id }).populate('user').populate('portfolio');
    res.render('users/my_feedbacks', { feedbacks });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error fetching your feedbacks.');
    res.redirect('/profile');
  }
});

// Update user profile (PUT)
router.put('/', isLoggedIn, upload.single('dp'),
  [
    body('username').trim().notEmpty().withMessage('Username cannot be empty.'),
    body('fullName').trim().escape(),
  ],
  async (req, res) => {
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      for (let error of errors.array()) {
        req.flash('error', error.msg);
      }
      return res.redirect('/profile/edit');
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
          return res.redirect('/profile/edit');
        }
        user.username = req.body.username;
      }

      // Update full name
    if ('fullName' in req.body) {
      user.fullName = req.body.fullName;
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
      res.redirect('/profile/edit');
    }
  }
);

module.exports = router;