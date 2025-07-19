const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');
const { isLoggedIn, validateUserRegistration } = require('../middleware');

router.get('/', users.renderLanding);

router.route('/register')
  .get(users.renderRegister)
  .post(validateUserRegistration, users.register);

router.route('/login')
  .get(users.renderLogin)
  .post(passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }), users.login);

router.post('/logout', users.logout);

router.get('/verify-email/:token', users.verifyEmail);

router.get('/dashboard', isLoggedIn, users.renderDashboard);

module.exports = router;