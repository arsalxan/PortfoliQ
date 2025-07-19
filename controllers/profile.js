const User = require('../models/user');
const Feedback = require('../models/feedback');
const Portfolio = require('../models/portfolio');
const multer = require('multer');
const { storage } = require('../utils/cloudinaryConfig');
const upload = multer({ storage });

module.exports.upload = upload;

module.exports.showProfile = async (req, res) => {
  try {
    const userPortfolios = await Portfolio.find({ user: req.user._id }).limit(3);
    const userFeedbacks = await Feedback.find({ user: req.user._id }).populate('portfolio').limit(3);
    res.render('users/profile', { user: req.user, userPortfolios, userFeedbacks, isProfilePage: true });
  } catch (err) {
    console.error('Error fetching profile data:', err);
    req.flash('error', 'Error loading profile data.');
    res.redirect('/');
  }
};

module.exports.showMyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id }).populate('user').populate({ path: 'portfolio', populate: { path: 'user' } });
    res.render('users/my_feedbacks', { feedbacks });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error fetching your feedbacks.');
    res.redirect('/profile');
  }
};

module.exports.showMyPortfolios = async (req, res) => {
  try {
    let portfolios = await Portfolio.find({ user: req.user._id }).populate('user');
    portfolios = await Promise.all(portfolios.map(async (portfolio) => {
      const feedbackCount = await Feedback.countDocuments({ portfolio: portfolio._id });
      return { ...portfolio.toObject(), feedbackCount };
    }));
    res.render('users/my_portfolios', { portfolios });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error fetching your portfolios.');
    res.redirect('/profile');
  }
};

module.exports.updateProfile = async (req, res) => {
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
        return res.redirect('/profile');
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
        return res.redirect('/profile');
      }
      user.email = req.body.email;
    }

    // Update password if provided
    if (req.body.password) {
      await user.setPassword(req.body.password);
    }

    // Update DP if a new file is uploaded
    if (req.file) {
      user.dp = req.file.path;
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
    } else if (err.code === 11000) {
      req.flash('error', 'A user with that username or email already exists.');
    } else {
      req.flash('error', 'Error updating profile: ' + err.message);
    }
    res.redirect('/profile');
  }
};

module.exports.deleteProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/profile');
    }

    await User.findByIdAndDelete(user._id);

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
};
