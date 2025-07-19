const Portfolio = require('../models/portfolio');
const Feedback = require('../models/feedback');

module.exports.renderNewForm = async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id);
  if (!portfolio) {
    req.flash('error', 'Cannot find that portfolio!');
    return res.redirect('/portfolios');
  }
  res.render('feedbacks/new', { portfolio });
};

module.exports.index = async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id).populate('user');
  if (!portfolio) {
    req.flash('error', 'Cannot find that portfolio!');
    return res.redirect('/portfolios');
  }
  const feedbacks = await Feedback.find({ portfolio: req.params.id }).populate('user');
  res.render('feedbacks/index', { portfolio, feedbacks });
};

module.exports.createFeedback = async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id);
  if (portfolio.user.equals(req.user._id)) {
    req.flash('error', 'You cannot give feedback to your own portfolio!');
    return res.redirect(`/portfolios/${req.params.id}`);
  }
  const feedback = new Feedback(req.body.feedback);
  feedback.user = req.user._id;
  feedback.portfolio = portfolio._id;
  await feedback.save();
  req.flash('success', 'Successfully added your feedback!');
  res.redirect(`/portfolios/${portfolio._id}/feedbacks`);
};

module.exports.showFeedback = async (req, res) => {
  const { id, feedbackId } = req.params;
  const feedback = await Feedback.findById(feedbackId).populate('user').populate({ path: 'portfolio', populate: { path: 'user' } });
  if (!feedback) {
    req.flash('error', 'Cannot find that feedback!');
    return res.redirect(`/portfolios/${id}/feedbacks`);
  }
  res.render('feedbacks/show', { feedback });
};

module.exports.deleteFeedback = async (req, res) => {
  const { id, feedbackId } = req.params;
  await Feedback.findByIdAndDelete(feedbackId);
  req.flash('success', 'Successfully deleted your feedback!');
  res.redirect(`/portfolios/${id}/feedbacks`);
};
