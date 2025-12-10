const User = require('../models/user');
const Portfolio = require('../models/portfolio');
const Feedback = require('../models/feedback');
const { GoogleGenAI } = require('@google/genai');
const multer = require('multer');
const { marked } = require('marked');
const { portfolioStorage } = require('../utils/cloudinaryConfig');
const { analyzePortfolio } = require('../utils/portfolioAnalyzer.js');
const upload = multer({ storage: portfolioStorage });

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
  const { id } = req.params;
  const portfolio = await Portfolio.findById(id);
  if (!portfolio) {
    req.flash('error', 'Cannot find that portfolio!');
    return res.redirect('/portfolios');
  }
  if (!portfolio.user.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect('/portfolios');
  }
  res.render('portfolios/edit', { portfolio });
};

module.exports.updatePortfolio = async (req, res) => {
  const { id } = req.params;
  const portfolio = await Portfolio.findById(id);
  if (!portfolio) {
    req.flash('error', 'Cannot find that portfolio!');
    return res.redirect('/portfolios');
  }
  if (!portfolio.user.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/portfolios/${id}`);
  }
  const updateData = { ...req.body.portfolio };
  if (req.file) {
    updateData.screenshot = req.file.path;
  }
  const updatedPortfolio = await Portfolio.findByIdAndUpdate(id, updateData, { new: true });
  req.flash('success', 'Successfully updated your portfolio!');
  res.redirect(`/portfolios/${updatedPortfolio._id}/edit`);
};

module.exports.deletePortfolio = async (req, res) => {
  const { id } = req.params;
  const portfolio = await Portfolio.findById(id);
  if (!portfolio) {
    req.flash('error', 'Cannot find that portfolio!');
    return res.redirect('/portfolios');
  }
  if (!portfolio.user.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect('/portfolios');
  }
  await Portfolio.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted your portfolio!');
  res.redirect('/portfolios');
};

module.exports.getAiReview = async (req, res) => {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
        req.flash('error', 'Cannot find that portfolio!');
        return res.redirect('/portfolios');
    }

    const analysis = await analyzePortfolio(portfolio.url);

    if (analysis.error) {
        req.flash('error', analysis.error);
        return res.redirect('/portfolios');
    }

    const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

    const prompt = `
        You are an expert web developer and designer, tasked with providing a professional review of a portfolio website.
        Analyze the following data extracted from the user's portfolio URL:

        **Page Title:** ${analysis.title}
        **Links:** ${JSON.stringify(analysis.links, null, 2)}
        **Images:** ${JSON.stringify(analysis.images, null, 2)}

        Based on this information, please provide a comprehensive review of the portfolio. Your review should be broken down into the following sections:

        **1. Overall Impression:** Provide a brief, overall impression of the portfolio.
        **2. Page Title Analysis:** Analyze the page title for clarity, conciseness, and SEO-friendliness.
        **3. Link Analysis:** Analyze the links for any broken links, unclear link text, or other issues.
        **4. Image Analysis:** Analyze the images for any missing alt text, large file sizes, or other issues.
        **5. Suggestions for Improvement:** Provide a list of actionable suggestions for how the user can improve their portfolio.

        Your review should be professional, constructive, and easy to understand. Use markdown for formatting.
    `;

    let aiReview = 'No AI review available.';
    try {
        const result = await genAI.models.generateContent({
          model: 'gemini-2.5-flash-lite',
         contents: prompt,
        });
        aiReview = result.text;
    } catch (error) {
        console.error('Error generating AI review:', error);
        req.flash('error', 'There was an error generating the AI review. Please try again later.');
        return res.redirect('/portfolios');
    }

    res.render('portfolios/ai_review', { analysis, aiReview, marked });
};

module.exports.searchPortfolios = async (req, res) => {
  const { q } = req.query;
  const searchQuery = q ? q.trim() : "";

  if (!searchQuery) {
    return res.render('portfolios/search_results', { portfolios: [], q });
  }

  const users = await User.find({ username: { $regex: searchQuery, $options: 'i' } });
  const userIds = users.map(user => user._id);

  let portfolios = await Portfolio.find({
    $or: [
      { description: { $regex: searchQuery, $options: 'i' } },
      { user: { $in: userIds } }
    ]
  }).populate('user');

  portfolios = await Promise.all(portfolios.map(async (portfolio) => {
    const feedbackCount = await Feedback.countDocuments({ portfolio: portfolio._id });
    return { ...portfolio.toObject(), feedbackCount };
  }));

  portfolios.sort((a, b) => a.feedbackCount - b.feedbackCount);

  res.render('portfolios/search_results', { portfolios, q });
};
