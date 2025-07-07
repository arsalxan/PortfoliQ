
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  design: {
    type: String
  },
  responsiveness: {
    type: String
  },
  content: {
    type: String
  },
  ux_flow: {
    type: String
  },
  accessibility: {
    type: String
  },
  technical_performance: {
    type: String
  },
  additional: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  portfolio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio'
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
