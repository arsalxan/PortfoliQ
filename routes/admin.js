const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../middleware');
const adminController = require('../controllers/admin');

router.get('/', isLoggedIn, isAdmin, adminController.renderDashboard);

router.get('/users', isLoggedIn, isAdmin, adminController.getUsers);

router.delete('/users/:id', isLoggedIn, isAdmin, adminController.deleteUser);

router.get('/portfolios', isLoggedIn, isAdmin, adminController.getPortfolios);

router.delete('/portfolios/:id', isLoggedIn, isAdmin, adminController.deletePortfolio);

router.get('/feedbacks', isLoggedIn, isAdmin, adminController.getFeedbacks);

router.delete('/feedbacks/:id', isLoggedIn, isAdmin, adminController.deleteFeedback);

module.exports = router;
