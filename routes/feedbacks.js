const express = require('express');
const router = express.Router({ mergeParams: true });
const Portfolio = require('../models/portfolio');
const Feedback = require('../models/feedback');
const User = require('../models/user'); // Import User model
const { isLoggedIn } = require('../middleware');
const { body, validationResult } = require('express-validator');

// New Feedback Form
router.get('/new', isLoggedIn, async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id);
  if (!portfolio) {
    req.flash('error', 'Cannot find that portfolio!');
    return res.redirect('/portfolios');
  }
  res.render('feedbacks/new', { portfolio });
});

// Show all feedbacks for a portfolio
router.get('/', async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id).populate('user');
  if (!portfolio) {
    req.flash('error', 'Cannot find that portfolio!');
    return res.redirect('/portfolios');
  }
  const feedbacks = await Feedback.find({ portfolio: req.params.id }).populate('user');
  res.render('feedbacks/index', { portfolio, feedbacks });
});

// Create Feedback
router.post('/', isLoggedIn,
  [ // Validation middleware
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
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      for (let error of errors.array()) {
        req.flash('error', error.msg);
      }
      return res.redirect(`/portfolios/${req.params.id}/feedbacks/new`); // Redirect back to the new feedback form
    }

    const portfolio = await Portfolio.findById(req.params.id);
    if (portfolio.user.equals(req.user._id)) {
      req.flash('error', 'You cannot give feedback to your own portfolio!');
      return res.redirect(`/portfolios/${req.params.id}`);
    }
    const feedback = new Feedback(req.body.feedback);
    feedback.user = req.user._id;
    feedback.portfolio = portfolio._id;
    await feedback.save();
    await portfolio.save();
    req.flash('success', 'Successfully added your feedback!');
    res.redirect(`/portfolios/${portfolio._id}/feedbacks`); // Redirect to the feedbacks index page
  }
);

// Show single Feedback
router.get('/:feedbackId', async (req, res) => {
  const { id, feedbackId } = req.params;
  const feedback = await Feedback.findById(feedbackId).populate('user').populate({ path: 'portfolio', populate: { path: 'user' } });
  if (!feedback) {
    req.flash('error', 'Cannot find that feedback!');
    return res.redirect(`/portfolios/${id}/feedbacks`);
  }
  res.render('feedbacks/show', { feedback });
});

// Delete Feedback
router.delete('/:feedbackId', isLoggedIn, async (req, res) => {
  const { id, feedbackId } = req.params;
  await Feedback.findByIdAndDelete(feedbackId);
  req.flash('success', 'Successfully deleted your feedback!');
  res.redirect(`/portfolios/${id}/feedbacks`);
});

module.exports = router;