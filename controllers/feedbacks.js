const { GoogleGenAI } = require("@google/genai");
const Portfolio = require('../models/portfolio');
const Feedback = require('../models/feedback');
const Notification = require('../models/notification');

const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

module.exports.renderNewForm = async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id).populate('user');
  if (!portfolio) {
    req.flash('error', 'Cannot find that portfolio!');
    return res.redirect('/portfolios');
  }
  if (portfolio.user.equals(req.user._id)) {
    req.flash('error', 'You cannot give feedback to your own portfolio!');
    return res.redirect(`/portfolios/${req.params.id}`);
  }
  res.render('feedbacks/new', { portfolio });
};


module.exports.index = async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id).populate('user');
  if (!portfolio) {
    req.flash('error', 'Cannot find that portfolio!');
    return res.redirect('/portfolios');
  }
  const feedbacks = await Feedback.find({ portfolio: req.params.id }).populate('user').sort({ createdAt: -1 });
  res.render('feedbacks/index', { portfolio, feedbacks });
};

module.exports.createFeedback = async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id).populate('user');
  if (portfolio.user.equals(req.user._id)) {
    req.flash('error', 'You cannot give feedback to your own portfolio!');
    return res.redirect(`/portfolios/${req.params.id}`);
  }
  const feedback = new Feedback(req.body.feedback);
  feedback.user = req.user._id;
  feedback.portfolio = portfolio._id;
  await feedback.save();

  // Create notification
  const notification = new Notification({
    recipient: portfolio.user,
    sender: req.user._id,
    portfolio: portfolio._id,
    type: 'new_comment'
  });
  await notification.save();

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
  const feedback = await Feedback.findById(feedbackId);
  const portfolio = await Portfolio.findById(id);

  if (!feedback || !portfolio) {
    req.flash('error', 'Cannot find the requested content!');
    return res.redirect('/portfolios');
  }

  const isFeedbackAuthor = feedback.user.equals(req.user._id);
  const isPortfolioOwner = portfolio.user.equals(req.user._id);

  if (!isFeedbackAuthor && !isPortfolioOwner) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/portfolios/${id}/feedbacks`);
  }

  await Feedback.findByIdAndDelete(feedbackId);
  req.flash('success', 'Successfully deleted the feedback!');
  res.redirect(`/portfolios/${id}/feedbacks`);
};

module.exports.summarizeFeedback = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const feedback = await Feedback.findById(feedbackId);
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        const prompt = `Summarize the following feedback in 3 lines:

${feedback.design}
${feedback.responsiveness}
${feedback.content}
${feedback.ux_flow}
${feedback.accessibility}
${feedback.technical_performance}
${feedback.additional}`;

        const result = await genAI.models.generateContent({
            model:'gemini-2.0-flash-001',
            contents: prompt,
        });
        
        const summary = result.text;

        res.json({ summary });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to summarize feedback' });
    }
};