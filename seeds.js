const mongoose = require('mongoose');
const User = require('./models/user');
const Portfolio = require('./models/portfolio');
const Feedback = require('./models/feedback');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!");
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!");
        console.log(err);
    });

const usersData = [
    { username: 'john_doe', email: 'john.doe@example.com', fullName: 'John Doe' },
    { username: 'jane_smith', email: 'jane.smith@example.com', fullName: 'Jane Smith' },
    { username: 'alex_wong', email: 'alex.wong@example.com', fullName: 'Alex Wong' },
    { username: 'emily_clark', email: 'emily.clark@example.com', fullName: 'Emily Clark' },
    { username: 'david_lee', email: 'david.lee@example.com', fullName: 'David Lee' },
    { username: 'sarah_jones', email: 'sarah.jones@example.com', fullName: 'Sarah Jones' },
    { username: 'michael_brown', email: 'michael.brown@example.com', fullName: 'Michael Brown' },
    { username: 'olivia_davis', email: 'olivia.davis@example.com', fullName: 'Olivia Davis' },
    { username: 'william_miller', email: 'william.miller@example.com', fullName: 'William Miller' },
    { username: 'sophia_wilson', email: 'sophia.wilson@example.com', fullName: 'Sophia Wilson' }
];

const portfoliosData = [
    {
        url: 'https://www.example.com/portfolio1',
        description: 'A modern web design portfolio showcasing responsive layouts and interactive elements.',
        screenshot: 'https://via.placeholder.com/1280x720/FF5733/FFFFFF?text=Portfolio+1',
        gitRepo: 'https://github.com/john_doe/portfolio1'
    },
    {
        url: 'https://www.example.com/portfolio2',
        description: 'My latest UI/UX design project focusing on user-centric design principles.',
        screenshot: 'https://via.placeholder.com/1280x720/33FF57/FFFFFF?text=Portfolio+2',
        gitRepo: 'https://github.com/jane_smith/portfolio2'
    },
    {
        url: 'https://www.example.com/portfolio3',
        description: 'A collection of data visualization projects built with D3.js.',
        screenshot: 'https://via.placeholder.com/1280x720/3357FF/FFFFFF?text=Portfolio+3',
        gitRepo: null // No Git repo for this one
    },
    {
        url: 'https://www.example.com/portfolio4',
        description: 'E-commerce website development using MERN stack.',
        screenshot: 'https://via.placeholder.com/1280x720/FF33A1/FFFFFF?text=Portfolio+4',
        gitRepo: 'https://github.com/alex_wong/ecommerce-site'
    },
    {
        url: 'https://www.example.com/portfolio5',
        description: 'Mobile app design for a fitness tracking application.',
        screenshot: null, // No screenshot for this one
        gitRepo: 'https://github.com/emily_clark/fitness-app'
    },
    {
        url: 'https://www.example.com/portfolio6',
        description: 'Personal blog built with Next.js and Markdown.',
        screenshot: 'https://via.placeholder.com/1280x720/A1FF33/FFFFFF?text=Portfolio+6',
        gitRepo: 'https://github.com/david_lee/personal-blog'
    },
    {
        url: 'https://www.example.com/portfolio7',
        description: 'Game development portfolio with Unity 3D projects.',
        screenshot: 'https://via.placeholder.com/1280x720/33A1FF/FFFFFF?text=Portfolio+7',
        gitRepo: 'https://github.com/sarah_jones/game-dev'
    },
    {
        url: 'https://www.example.com/portfolio8',
        description: 'Machine learning models and data science projects.',
        screenshot: null,
        gitRepo: 'https://github.com/michael_brown/ml-projects'
    },
    {
        url: 'https://www.example.com/portfolio9',
        description: 'Illustrations and graphic design works.',
        screenshot: 'https://via.placeholder.com/1280x720/FF3333/FFFFFF?text=Portfolio+9',
        gitRepo: null
    },
    {
        url: 'https://www.example.com/portfolio10',
        description: 'Full-stack web application for task management.',
        screenshot: 'https://via.placeholder.com/1280x720/33FF33/FFFFFF?text=Portfolio+10',
        gitRepo: 'https://github.com/olivia_davis/task-manager'
    }
];

const seedDB = async () => {
    // Clear existing data
    await User.deleteMany({});
    await Portfolio.deleteMany({});
    await Feedback.deleteMany({});
    console.log('Cleared existing data.');

    const createdUsers = [];
    for (let i = 0; i < usersData.length; i++) {
        const user = new User(usersData[i]);
        const registeredUser = await User.register(user, 'password'); // All users have 'password' as password
        createdUsers.push(registeredUser);
        console.log(`Created user: ${registeredUser.username}`);
    }

    for (let i = 0; i < portfoliosData.length; i++) {
        const portfolio = new Portfolio(portfoliosData[i]);
        // Assign portfolio to a random user
        portfolio.user = createdUsers[Math.floor(Math.random() * createdUsers.length)]._id;
        await portfolio.save();
        console.log(`Created portfolio: ${portfolio.url}`);

        // Add some feedback to a few portfolios
        if (i % 2 === 0) { // Add feedback to every other portfolio
            const feedback = new Feedback({
                design: `Design feedback for ${portfolio.url}: The layout is clean, but typography could be improved.`, 
                responsiveness: `Responsiveness feedback for ${portfolio.url}: Works well on mobile, but some elements overlap on tablet.`, 
                content: `Content feedback for ${portfolio.url}: Descriptions are concise and informative.`, 
                user: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id // Random user for feedback
            });
            await feedback.save();
            portfolio.feedbacks.push(feedback);
            await portfolio.save();
            console.log(`Added feedback to ${portfolio.url}`);
        }
    }

    console.log('Database seeded successfully!');
};

seedDB().then(() => {
    mongoose.connection.close();
});