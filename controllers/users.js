const User = require('../models/user');
const Portfolio = require('../models/portfolio');
const Feedback = require('../models/feedback');
const passport = require('passport');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.renderLanding = (req, res) => {
    res.render('landing');
};

module.exports.renderRegister = (req, res) => {
  res.render('users/register');
};

module.exports.register = async (req, res, next) => {
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

      req.flash('success', 'Welcome to PortfolioQue! A verification email has been sent to your email address. Please check your inbox (and spam folder) to verify your account.');
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
};

module.exports.renderLogin = (req, res) => {
  res.render('users/login');
};

module.exports.login = (req, res, next) => {
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
};

module.exports.logout = (req, res, next) => {
    req.flash('success', 'Goodbye!');
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy(function (err) {
            if (err) { return next(err); }
            res.redirect('/portfolios');
        });
    });
};

module.exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error', 'Email verification token is invalid or has expired.');
      return res.redirect('/register');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    req.login(user, err => {
      if (err) return next(err);
      req.flash('success', 'Your email has been successfully verified and you are now logged in!');
      res.redirect('/portfolios');
    });

  } catch (e) {
    console.error(e);
    req.flash('error', 'An error occurred during email verification.');
    res.redirect('/register');
  }
};

module.exports.renderDashboard = async (req, res) => {
  const portfolios = await Portfolio.find({ user: req.user._id }).populate('user').sort({ createdAt: -1 }).limit(3);
  const feedbacks = await Feedback.find({ user: req.user._id }).populate({ path: 'portfolio', populate: { path: 'user' } }).sort({ createdAt: -1 }).limit(3);
  res.render('dashboard', { portfolios, feedbacks });
};