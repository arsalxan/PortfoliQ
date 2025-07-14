
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash-plus');
const methodOverride = require('method-override');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cron = require('node-cron');
const User = require('./models/user');
const cleanupUnverifiedUsers = require('./cleanup_unverified_users');
require('dotenv').config();

const app = express();

// Schedule cleanup of unverified users (e.g., every 24 hours at midnight)
cron.schedule('*/30 * * * *', () => {
  console.log('Running scheduled cleanup of unverified users...');
  cleanupUnverifiedUsers();
});

const engine = require('ejs-mate');

// View engine setup
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global variables
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
const userRoutes = require('./routes/users');
const portfolioRoutes = require('./routes/portfolios');
const feedbackRoutes = require('./routes/feedbacks');
const profileRoutes = require('./routes/profile');
app.use('/', userRoutes);
app.use('/portfolios', portfolioRoutes);
app.use('/portfolios/:id/feedbacks', feedbackRoutes);
app.use('/profile', profileRoutes);



// Database connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Could not connect to MongoDB', err);
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).render('404');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
