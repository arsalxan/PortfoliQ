require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

const dbUrl = process.env.MONGO_URI;
mongoose.connect(dbUrl)
    .then(() => {
        console.log('MONGO CONNECTION OPEN!!!');
    })
    .catch(err => {
        console.log('OH NO MONGO CONNECTION ERROR!!!!');
        console.log(err);
    });

const seedAdmin = async () => {
    await User.deleteMany({ role: 'admin' }); // Clear out old admin users
    const admin = new User({
        username: 'admin',
        email: 'admin@gmail.com',
        fullName: 'Admin User',
        isEmailVerified: true,
        role: 'admin'
    });
    await User.register(admin, 'password');
    console.log('Admin user created!');
};

seedAdmin().then(() => {
    mongoose.connection.close();
});
