
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

const Notification = require('./notification');

feedbackSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Notification.deleteMany({ feedback: doc._id });
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
