
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Portfolio = require('./portfolio'); // Import Portfolio model
const Feedback = require('./feedback'); // Import Feedback model here to avoid circular dependency
const Notification = require('./notification');
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    match: /^[a-z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  dp: String,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationTokenExpires: Date
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'username' });

userSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    //Delete the portfolio's uploaded by this user
    await Portfolio.deleteMany({ user: doc._id });
    // Also delete all feedback given by this user
    await Feedback.deleteMany({ user: doc._id });
    await Notification.deleteMany({ $or: [{ sender: doc._id }, { recipient: doc._id }] });
  }
});

module.exports = mongoose.model('User', userSchema);
