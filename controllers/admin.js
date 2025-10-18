const User = require('../models/user');
const Portfolio = require('../models/portfolio');
const Feedback = require('../models/feedback');

module.exports.renderDashboard = async (req, res) => {
    const users = await User.find({});
    const portfolios = await Portfolio.find({}).populate('user');
    const feedbacks = await Feedback.find({}).populate('user').populate('portfolio');
    const filteredFeedbacks = feedbacks.filter(feedback => feedback.portfolio);
    res.render('admin/dashboard', { users, portfolios, feedbacks: filteredFeedbacks });
};

module.exports.getUsers = async (req, res) => {
    const { search } = req.query;
    let users;
    if (search) {
        users = await User.find({
            username: { $regex: search, $options: 'i' },
            _id: { $ne: req.user._id }
        });
    } else {
        users = await User.find({ _id: { $ne: req.user._id } });
    }
    res.render('admin/users', { users, search });
};

module.exports.deleteUser = async (req, res) => {
    if (req.params.id === req.user.id) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/admin/users');
    }
    await User.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted user');
    res.redirect('/admin/users');
};

module.exports.getPortfolios = async (req, res) => {
    const { search } = req.query;
    let portfolios;
    if (search) {
        const users = await User.find({ username: { $regex: search, $options: 'i' } });
        const userIds = users.map(user => user._id);
        portfolios = await Portfolio.find({ user: { $in: userIds } }).populate('user');
    } else {
        portfolios = await Portfolio.find({}).populate('user');
    }
    res.render('admin/portfolios', { portfolios, search });
};

module.exports.deletePortfolio = async (req, res) => {
    await Portfolio.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted portfolio');
    res.redirect('/admin/portfolios');
};

module.exports.getFeedbacks = async (req, res) => {
    const { givenBy, content } = req.query;
    let query = {};

    if (givenBy) {
        const users = await User.find({ username: { $regex: givenBy, $options: 'i' } });
        const userIds = users.map(user => user._id);
        query.user = { $in: userIds };
    }

    if (content) {
        query.$or = [
            { design: { $regex: content, $options: 'i' } },
            { responsiveness: { $regex: content, $options: 'i' } },
            { content: { $regex: content, $options: 'i' } },
            { ux_flow: { $regex: content, $options: 'i' } },
            { accessibility: { $regex: content, $options: 'i' } },
            { technical_performance: { $regex: content, $options: 'i' } },
            { additional: { $regex: content, $options: 'i' } }
        ];
    }

    const feedbacks = await Feedback.find(query).populate('user').populate({
        path: 'portfolio',
        populate: {
            path: 'user'
        }
    });
    const filteredFeedbacks = feedbacks.filter(feedback => feedback.portfolio);
    res.render('admin/feedbacks', { feedbacks: filteredFeedbacks, givenBy, content });
};

module.exports.deleteFeedback = async (req, res) => {
    await Feedback.findOneAndDelete({ _id: req.params.id });
    req.flash('success', 'Successfully deleted feedback');
    res.redirect('/admin/feedbacks');
};
