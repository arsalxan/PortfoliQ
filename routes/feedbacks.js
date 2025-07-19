const express = require('express');
const router = express.Router({ mergeParams: true });
const feedbacks = require('../controllers/feedbacks');
const { isLoggedIn, validateFeedback } = require('../middleware');

router.route('/')
  .get(feedbacks.index)
  .post(isLoggedIn, validateFeedback, feedbacks.createFeedback);

router.get('/new', isLoggedIn, feedbacks.renderNewForm);

router.route('/:feedbackId')
  .get(feedbacks.showFeedback)
  .delete(isLoggedIn, feedbacks.deleteFeedback);

module.exports = router;