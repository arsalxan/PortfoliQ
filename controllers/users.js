const User = require('../models/user');
const Portfolio = require('../models/portfolio');
const Feedback = require('../models/feedback');
const Notification = require('../models/notification');
const passport = require('passport');
const crypto = require('crypto');
const SibApiV3Sdk = require('@getbrevo/brevo');

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
      
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

      sendSmtpEmail.subject = "Verify Your Email for PortfolioQue";
      sendSmtpEmail.htmlContent = `<p>You are receiving this because you (or someone else) have registered an account on PortfoliQue.</p><p>Please click on the following link, or paste this into your browser to complete the process:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>If you did not request this, please ignore this email.</p>`;
      sendSmtpEmail.sender = { name: 'PortfoliQ', email: process.env.BREVO_SENDER_EMAIL };
      sendSmtpEmail.to = [{ email: email }];

      try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
      } catch (error) {
        console.error(error);
        req.flash('error', 'There was an error sending the verification email. Please try again later.');
        return res.redirect('register');
      }

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

module.exports.renderNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .populate('sender', 'username')
            .populate('portfolio', 'title');

        // Mark all as read
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });

        res.render('users/notifications', { notifications });
    } catch (err) {
        console.error('Error fetching notifications page:', err);
        req.flash('error', 'Something went wrong while fetching your notifications.');
        res.redirect('/dashboard');
    }
};

module.exports.redirectToNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.notification_id);
        if (!notification || !notification.recipient.equals(req.user._id)) {
            req.flash('error', 'Notification not found.');
            return res.redirect('/notifications');
        }

        notification.isRead = true;
        await notification.save();

        res.redirect(`/portfolios/${notification.portfolio}/feedbacks`);
    } catch (err) {
        console.error('Error handling notification redirect:', err);
        req.flash('error', 'Something went wrong.');
        res.redirect('/dashboard');
    }
};