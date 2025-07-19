const Portfolio = require('../models/portfolio');
const Feedback = require('../models/feedback');
const multer = require('multer');
const { storage } = require('../utils/cloudinaryConfig');
const upload = multer({ storage });

module.exports.upload = upload;

module.exports.index = async (req, res) => {
  let portfolios = await Portfolio.find({}).populate('user');

  portfolios = await Promise.all(portfolios.map(async (portfolio) => {
    const feedbackCount = await Feedback.countDocuments({ portfolio: portfolio._id });
    return { ...portfolio.toObject(), feedbackCount };
  }));

  portfolios.sort((a, b) => a.feedbackCount - b.feedbackCount);

  res.render('portfolios/index', { portfolios });
};

module.exports.renderNewForm = (req, res) => {
  res.render('portfolios/new');
};

module.exports.createPortfolio = async (req, res) => {
  const newPortfolioData = { ...req.body.portfolio };
  newPortfolioData.user = req.user._id;
  if (req.file) {
    newPortfolioData.screenshot = req.file.path;
  }
  const portfolio = new Portfolio(newPortfolioData);
  await portfolio.save();
  req.flash('success', 'Successfully added your portfolio!');
  res.redirect('/dashboard');
};

module.exports.renderEditForm = async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id);
  if (!portfolio) {
    req.flash('error', 'Cannot find that portfolio!');
    return res.redirect('/portfolios');
  }
  res.render('portfolios/edit', { portfolio });
};

module.exports.updatePortfolio = async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body.portfolio };
  if (req.file) {
    updateData.screenshot = req.file.path;
  }
  const portfolio = await Portfolio.findByIdAndUpdate(id, updateData, { new: true });
  req.flash('success', 'Successfully updated your portfolio!');
  res.redirect(`/portfolios/${portfolio._id}`);
};

module.exports.deletePortfolio = async (req, res) => {
  await Portfolio.findByIdAndDelete(req.params.id);
  req.flash('success', 'Successfully deleted your portfolio!');
  res.redirect('/portfolios');
};
