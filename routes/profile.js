const express = require('express');
const router = express.Router();
const profile = require('../controllers/profile');
const { isLoggedIn, validateProfileUpdate } = require('../middleware');
const multer = require('multer');
const upload = profile.upload;

router.route('/')
  .get(isLoggedIn, profile.showProfile)
  .put(isLoggedIn, upload.single('dp'), validateProfileUpdate, profile.updateProfile)
  .delete(isLoggedIn, profile.deleteProfile);

router.get('/myfeedbacks', isLoggedIn, profile.showMyFeedbacks);

router.get('/myportfolios', isLoggedIn, profile.showMyPortfolios);

module.exports = router;