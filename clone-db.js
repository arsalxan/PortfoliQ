
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const Portfolio = require('./models/portfolio');
const Feedback = require('./models/feedback');
const Notification = require('./models/notification');

const localDbUri = process.env.MONGO_URI_LOCAL;
const productionDbUri = process.env.MONGO_URI;

const cloneDatabase = async () => {
  let localDb, productionDb;
  try {
    // Connect to local and production databases
    localDb = await mongoose.createConnection(localDbUri).asPromise();
    console.log('Connected to local MongoDB');
    productionDb = await mongoose.createConnection(productionDbUri).asPromise();
    console.log('Connected to production MongoDB');

    // Models for production database
    const ProductionUser = productionDb.model('User', User.schema);
    const ProductionPortfolio = productionDb.model('Portfolio', Portfolio.schema);
    const ProductionFeedback = productionDb.model('Feedback', Feedback.schema);
    const ProductionNotification = productionDb.model('Notification', Notification.schema);

    // Clear existing data in production database
    await ProductionUser.deleteMany({});
    await ProductionPortfolio.deleteMany({});
    await ProductionFeedback.deleteMany({});
    await ProductionNotification.deleteMany({});
    console.log('Cleared existing data in production database.');

    // ID mapping
    const idMap = {
      User: {},
      Portfolio: {},
      Feedback: {},
      Notification: {}
    };

    // Clone Users
    const users = await localDb.model('User', User.schema).find();
    for (const user of users) {
      const newUser = new ProductionUser({
        ...user.toObject(),
        _id: new mongoose.Types.ObjectId()
      });
      await ProductionUser.register(newUser, 'password');
      idMap.User[user._id.toString()] = newUser._id;
    }
    console.log('Users cloned successfully.');

    // Clone Portfolios
    const portfolios = await localDb.model('Portfolio', Portfolio.schema).find();
    for (const portfolio of portfolios) {
      const newPortfolio = new ProductionPortfolio({
        ...portfolio.toObject(),
        _id: new mongoose.Types.ObjectId(),
        user: idMap.User[portfolio.user.toString()]
      });
      await newPortfolio.save();
      idMap.Portfolio[portfolio._id.toString()] = newPortfolio._id;
    }
    console.log('Portfolios cloned successfully.');

    // Clone Feedbacks
    const feedbacks = await localDb.model('Feedback', Feedback.schema).find();
    for (const feedback of feedbacks) {
      const newFeedback = new ProductionFeedback({
        ...feedback.toObject(),
        _id: new mongoose.Types.ObjectId(),
        user: idMap.User[feedback.user.toString()],
        portfolio: idMap.Portfolio[feedback.portfolio.toString()]
      });
      await newFeedback.save();
      idMap.Feedback[feedback._id.toString()] = newFeedback._id;
    }
    console.log('Feedbacks cloned successfully.');

    // Clone Notifications
    const notifications = await localDb.model('Notification', Notification.schema).find();
    for (const notification of notifications) {
      const newNotification = new ProductionNotification({
        ...notification.toObject(),
        _id: new mongoose.Types.ObjectId(),
        recipient: idMap.User[notification.recipient.toString()],
        sender: idMap.User[notification.sender.toString()],
        portfolio: idMap.Portfolio[notification.portfolio.toString()]
      });
      await newNotification.save();
      idMap.Notification[notification._id.toString()] = newNotification._id;
    }
    console.log('Notifications cloned successfully.');

    console.log('Database cloning completed successfully!');

  } catch (error) {
    console.error('Error cloning database:', error);
  } finally {
    // Close connections
    if (localDb) await localDb.close();
    if (productionDb) await productionDb.close();
  }
};

cloneDatabase();
