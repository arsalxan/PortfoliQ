
const mongoose = require('mongoose');

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
  },
  
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
