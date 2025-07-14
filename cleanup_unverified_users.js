const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

const cleanupUnverifiedUsers = async () => {
  try {
    // Connect to DB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Cleanup: Connected to MongoDB');
    }

    const now = new Date();
    const result = await User.deleteMany({
      isEmailVerified: false,
      emailVerificationTokenExpires: { $lt: now }
    });

    if (result.deletedCount > 0) {
      console.log(`Cleanup: Deleted ${result.deletedCount} unverified user(s) with expired tokens.`);
    } else {
      console.log('Cleanup: No unverified users with expired tokens found to delete.');
    }
  } catch (error) {
    console.error('Cleanup Error: Failed to delete unverified users:', error);
  }
};

module.exports = cleanupUnverifiedUsers;
