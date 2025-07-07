const mongoose = require('mongoose');
const Portfolio = require('./models/portfolio');

const mongoURI = 'mongodb://localhost:27017/portfolio_feedback'; // <<< REPLACE THIS WITH YOUR ACTUAL MONGODB CONNECTION STRING

async function cleanupPortfolios() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for cleanup.');

    const result = await Portfolio.updateMany(
      { feedbacks: { $exists: true } }, // Find documents that still have the 'feedbacks' array
      { $unset: { feedbacks: 1 } }      // Remove the 'feedbacks' array field
    );

    console.log(`Cleanup complete. Modified ${result.nModified} portfolios.`);

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

cleanupPortfolios();