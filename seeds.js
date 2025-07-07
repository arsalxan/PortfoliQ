const mongoose = require('mongoose');
const User = require('./models/user');
const Portfolio = require('./models/portfolio');
const Feedback = require('./models/feedback');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error", err));

const usersData = [
    { username: 'john_doe', email: 'john@example.com', fullName: 'John Doe', dp: '/images/default-dp.svg' },
    { username: 'jane_smith', email: 'jane@example.com', fullName: 'Jane Smith', dp: '/images/default-dp.svg' },
    { username: 'alex_wong', email: 'alex@example.com', fullName: 'Alex Wong', dp: '/images/default-dp.svg' },
    { username: 'emily_clark', email: 'emily@example.com', fullName: 'Emily Clark', dp: '/images/default-dp.svg' },
    { username: 'david_lee', email: 'david@example.com', fullName: 'David Lee', dp: '/images/default-dp.svg' }
];

const portfoliosData = [
    {
        url: 'https://alex-wong.dev/',
        description: 'Frontend development and design portfolio.',
        screenshot: '/images/defaultscreenshot.svg',
        gitRepo: 'https://github.com/30-seconds/30-seconds-of-code'
    },
    {
        url: 'https://emilyclark.me/',
        description: 'UI/UX designer portfolio.',
        screenshot: '/images/defaultscreenshot.svg',
        gitRepo: 'https://github.com/mui/material-ui'
    },
    {
        url: 'https://davidlee.tech/',
        description: 'Cloud-native projects and DevOps work.',
        screenshot: '/images/defaultscreenshot.svg',
        gitRepo: 'https://github.com/kubernetes/kubernetes'
    },
    {
        url: 'https://janesmith.web.app/',
        description: 'Product designer with a focus on user research.',
        screenshot: '/images/defaultscreenshot.svg',
        gitRepo: 'https://github.com/ionic-team/ionic-framework'
    },
    {
        url: 'https://john-doe.dev/',
        description: 'Full-stack web developer projects.',
        screenshot: '/images/defaultscreenshot.svg',
        gitRepo: 'https://github.com/vercel/next.js'
    }
];

const feedbackComments = [
    "Great attention to detail!",
    "Responsive design is solid.",
    "Excellent performance scores.",
    "Good use of accessible components.",
    "Nice UX flow and clean layout.",
    "Could improve typography on mobile.",
    "Impressive portfolio, keep it up!"
];

const seedDB = async () => {
    await User.deleteMany({});
    await Portfolio.deleteMany({});
    await Feedback.deleteMany({});
    console.log("✅ Cleared old data");

    const createdUsers = [];
    for (let user of usersData) {
        const newUser = new User(user);
        const registeredUser = await User.register(newUser, 'password');
        createdUsers.push(registeredUser);
        console.log(`👤 Created user: ${registeredUser.username}`);
    }

    const createdPortfolios = [];
    for (let portfolio of portfoliosData) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const newPortfolio = new Portfolio({ ...portfolio, user: randomUser._id });
        await newPortfolio.save();
        createdPortfolios.push(newPortfolio);
        console.log(`🖼️ Created portfolio: ${newPortfolio.url}`);
    }

    for (let portfolio of createdPortfolios) {
        const numFeedbacks = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numFeedbacks; i++) {
            const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            const randomComment = feedbackComments[Math.floor(Math.random() * feedbackComments.length)];

            const feedback = new Feedback({
                content: randomComment,
                design: `Design feedback ${i + 1}`,
                responsiveness: `Responsiveness feedback ${i + 1}`,
                content: randomComment,
                ux_flow: `UX flow feedback ${i + 1}`,
                accessibility: `Accessibility feedback ${i + 1}`,
                technical_performance: `Performance feedback ${i + 1}`,
                additional: `Additional note ${i + 1}`,
                user: randomUser._id,
                portfolio: portfolio._id
            });

            await feedback.save();
            portfolio.feedbacks.push(feedback._id);
        }
        await portfolio.save();
        console.log(`💬 Added feedbacks to portfolio: ${portfolio.url}`);
    }

    console.log("🌱 Database seeded successfully!");
    mongoose.connection.close();
};

seedDB();
