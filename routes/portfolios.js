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
const { isLoggedIn } = require('../middleware');
const { body, validationResult } = require('express-validator');

// Index
router.get('/', async (req, res) => {
  const portfolios = await Portfolio.find({}).populate('user');
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

    const portfolio = new Portfolio(req.body.portfolio);
    portfolio.user = req.user._id;
    if (req.file) {
      portfolio.screenshot = '/uploads/' + req.file.filename;
    }
    if (req.body.portfolio.gitRepo) {
      portfolio.gitRepo = req.body.portfolio.gitRepo;
    }
    await portfolio.save();
    req.flash('success', 'Successfully added your portfolio!');
    res.redirect(`/portfolios/${portfolio._id}`);
  }
);

// Show
router.get('/:id', async (req, res) => {
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
  res.render('portfolios/show', { portfolio });
});

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
    const portfolio = await Portfolio.findByIdAndUpdate(id, { ...req.body.portfolio });
    if (req.file) {
      portfolio.screenshot = '/uploads/' + req.file.filename;
    }
    if (req.body.portfolio.gitRepo) {
      portfolio.gitRepo = req.body.portfolio.gitRepo;
    }
    await portfolio.save();
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