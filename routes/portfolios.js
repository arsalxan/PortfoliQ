const express = require('express');
const router = express.Router();
const portfolios = require('../controllers/portfolios');
const { isLoggedIn, validatePortfolio } = require('../middleware');
const multer = require('multer');
const upload = portfolios.upload;

router.route('/')
  .get(portfolios.index)
  .post(isLoggedIn, upload.single('screenshot'), validatePortfolio, portfolios.createPortfolio);

router.get('/new', isLoggedIn, portfolios.renderNewForm);

router.route('/:id')
  .put(isLoggedIn, upload.single('screenshot'), validatePortfolio, portfolios.updatePortfolio)
  .delete(isLoggedIn, portfolios.deletePortfolio);

router.get('/:id/edit', isLoggedIn, portfolios.renderEditForm);

module.exports = router;