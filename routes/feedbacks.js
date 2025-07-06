const express = require('express');
const router = express.Router({ mergeParams: true });
const Portfolio = require('../models/portfolio');
const Feedback = require('../models/feedback');
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
  const portfolio = await Portfolio.findById(req.params.id).populate({
    path: 'feedbacks',
    populate: {
      path: 'user'
    }
  }).populate('user');
  if (!portfolio) {
    req.flash('error', 'Cannot find that portfolio!');
    return res.redirect('/portfolios');
  }
  res.render('feedbacks/index', { portfolio });
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
    const feedback = new Feedback(req.body.feedback);
    feedback.user = req.user._id;
    feedback.portfolio = portfolio._id;
    portfolio.feedbacks.push(feedback);
    await feedback.save();
    await portfolio.save();
    req.flash('success', 'Successfully added your feedback!');
    res.redirect(`/portfolios/${portfolio._id}/feedbacks`); // Redirect to the feedbacks index page
  }
);

// Delete Feedback
router.delete('/:feedbackId', isLoggedIn, async (req, res) => {
  const { id, feedbackId } = req.params;
  await Portfolio.findByIdAndUpdate(id, { $pull: { feedbacks: feedbackId } });
  await Feedback.findByIdAndDelete(feedbackId);
  req.flash('success', 'Successfully deleted your feedback!');
  res.redirect(`/portfolios/${id}`);
});

module.exports = router;