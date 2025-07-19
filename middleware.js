const { body, validationResult } = require('express-validator');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be signed in first!');
    return res.redirect('/login');
  }
  next();
}

module.exports.validatePortfolio = [
  body('portfolio.url').isURL().withMessage('Please enter a valid URL.'),
  body('portfolio.description').trim().escape(),
  body('portfolio.gitRepo').optional({ checkFalsy: true }).isURL().withMessage('Please enter a valid Git repository URL.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      for (let error of errors.array()) {
        req.flash('error', error.msg);
      }
      // Determine the redirect path based on the original URL
      const redirectPath = req.originalUrl.includes('/new') ? '/portfolios/new' : `/portfolios/${req.params.id}/edit`;
      return res.redirect(redirectPath);
    }
    next();
  }
];

module.exports.validateFeedback = [
  body('feedback.design').trim().escape(),
  body('feedback.responsiveness').trim().escape(),
  body('feedback.content').trim().escape(),
  body('feedback.ux_flow').trim().escape(),
  body('feedback.accessibility').trim().escape(),
  body('feedback.technical_performance').trim().escape(),
  body('feedback.additional').trim().escape(),
  body().custom((value, { req }) => {
    const feedbackFields = [
      req.body.feedback.design,
      req.body.feedback.responsiveness,
      req.body.feedback.content,
      req.body.feedback.ux_flow,
      req.body.feedback.accessibility,
      req.body.feedback.technical_performance,
      req.body.feedback.additional,
    ];
    const hasValidFeedback = feedbackFields.some(field => field && field.trim().length >= 20);
    if (!hasValidFeedback) {
      throw new Error('At least one feedback field must be provided and be at least 20 characters long.');
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      for (let error of errors.array()) {
        req.flash('error', error.msg);
      }
      return res.redirect(`/portfolios/${req.params.id}/feedbacks/new`);
    }
    next();
  }
];

module.exports.validateUserRegistration = [
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
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      for (let error of errors.array()) {
        req.flash('error', error.msg);
      }
      return res.redirect('/register');
    }
    next();
  }
];

module.exports.validateProfileUpdate = [
  body('username').trim().notEmpty().withMessage('Username cannot be empty.'),
  body('fullName').trim().escape(),
  body('email').isEmail().withMessage('Please enter a valid email address.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      for (let error of errors.array()) {
        req.flash('error', error.msg);
      }
      return res.redirect('/profile');
    }
    next();
  }
];
