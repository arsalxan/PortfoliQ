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
    const searchQuery = search ? search.trim() : "";
    let users;
    if (searchQuery) {
        users = await User.find({
            username: { $regex: searchQuery, $options: 'i' },
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
    const searchQuery = search ? search.trim() : "";
    let portfolios;
    if (searchQuery) {
        const users = await User.find({ username: { $regex: searchQuery, $options: 'i' } });
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
    const givenByQuery = givenBy ? givenBy.trim() : "";
    const contentQuery = content ? content.trim() : "";
    let query = {};

    if (givenByQuery) {
        const users = await User.find({ username: { $regex: givenByQuery, $options: 'i' } });
        const userIds = users.map(user => user._id);
        query.user = { $in: userIds };
    }

    if (contentQuery) {
        query.$or = [
            { design: { $regex: contentQuery, $options: 'i' } },
            { responsiveness: { $regex: contentQuery, $options: 'i' } },
            { content: { $regex: contentQuery, $options: 'i' } },
            { ux_flow: { $regex: contentQuery, $options: 'i' } },
            { accessibility: { $regex: contentQuery, $options: 'i' } },
            { technical_performance: { $regex: contentQuery, $options: 'i' } },
            { additional: { $regex: contentQuery, $options: 'i' } }
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
