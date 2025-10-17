
const mongoose = require('mongoose');
const Feedback = require('./feedback'); // Import Feedback model

const portfolioSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  screenshot: String,
  gitRepo: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

portfolioSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Feedback.deleteMany({ portfolio: doc._id });
  }
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
