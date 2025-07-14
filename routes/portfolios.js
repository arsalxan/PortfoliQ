const express = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
const router = express.Router();
const Portfolio = require('../models/portfolio');
const Feedback = require('../models/feedback'); // Import Feedback model
const { isLoggedIn } = require('../middleware');
const { body, validationResult } = require('express-validator');

// Index
router.get('/', async (req, res) => {
  let portfolios = await Portfolio.find({}).populate('user');

  portfolios = await Promise.all(portfolios.map(async (portfolio) => {
    const feedbackCount = await Feedback.countDocuments({ portfolio: portfolio._id });
    return { ...portfolio.toObject(), feedbackCount };
  }));

  portfolios.sort((a, b) => a.feedbackCount - b.feedbackCount);

  res.render('portfolios/index', { portfolios });
});

// New
router.get('/new', isLoggedIn, (req, res) => {
  res.render('portfolios/new');
});

// Create
router.post('/', isLoggedIn, upload.single('screenshot'),
  [ // Validation middleware
    body('portfolio.url').isURL().withMessage('Please enter a valid URL.'),
    body('portfolio.description').trim().escape(),
    body('portfolio.gitRepo').optional({ checkFalsy: true }).isURL().withMessage('Please enter a valid Git repository URL.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      for (let error of errors.array()) {
        req.flash('error', error.msg);
      }
      return res.redirect('/portfolios/new');
    }

    const newPortfolioData = { ...req.body.portfolio };
    newPortfolioData.user = req.user._id;
    if (req.file) {
      newPortfolioData.screenshot = '/uploads/' + req.file.filename;
    }
    const portfolio = new Portfolio(newPortfolioData);
    await portfolio.save();
    req.flash('success', 'Successfully added your portfolio!');
    res.redirect('/dashboard');
  }
);



// Edit
router.get('/:id/edit', isLoggedIn, async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id);
  if (!portfolio) {
    req.flash('error', 'Cannot find that portfolio!');
    return res.redirect('/portfolios');
  }
  res.render('portfolios/edit', { portfolio });
});

// Update
router.put('/:id', isLoggedIn, upload.single('screenshot'),
  [ // Validation middleware
    body('portfolio.url').isURL().withMessage('Please enter a valid URL.'),
    body('portfolio.description').trim().escape(),
    body('portfolio.gitRepo').optional({ checkFalsy: true }).isURL().withMessage('Please enter a valid Git repository URL.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      for (let error of errors.array()) {
        req.flash('error', error.msg);
      }
      return res.redirect(`/portfolios/${req.params.id}/edit`);
    }

    const { id } = req.params;
    const updateData = { ...req.body.portfolio };
    if (req.file) {
      updateData.screenshot = '/uploads/' + req.file.filename;
    }
    const portfolio = await Portfolio.findByIdAndUpdate(id, updateData, { new: true });
    req.flash('success', 'Successfully updated your portfolio!');
    res.redirect(`/portfolios/${portfolio._id}`);
  }
);

// Delete
router.delete('/:id', isLoggedIn, async (req, res) => {
  await Portfolio.findByIdAndDelete(req.params.id);
  req.flash('success', 'Successfully deleted your portfolio!');
  res.redirect('/portfolios');
});

module.exports = router;