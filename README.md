# QPortfolio - Portfolio Feedback Platform

QPortfolio is a web application built with Node.js, Express, and MongoDB that allows users to create, share, and receive feedback on their portfolios. It also features an AI-powered review system to provide automated analysis and suggestions.

## Live Demo

[Link to Live Demo](https://qportfolio.herokuapp.com/)

## Features

-   **User Authentication:** Secure user registration and login with email verification.
-   **Portfolio Management:** Create, edit, and delete portfolios with details, screenshots, and git repository links.
-   **Feedback System:** Users can leave detailed feedback on each other's portfolios, focusing on design, responsiveness, content, UX flow, accessibility, and technical performance.
-   **AI-Powered Reviews:** Integrated with Google's Generative AI to provide automated portfolio analysis and suggestions for improvement.
-   **Notifications:** Users receive real-time notifications for new feedback on their portfolios.
-   **User Profiles:** Users can view and edit their profiles, including their display picture, username, full name, and email.
-   **Dashboard:** A personalized dashboard for each user to view their submitted portfolios and the feedback they have given.
-   **Image Uploads:** Handles image uploads for portfolio screenshots and user display pictures using Cloudinary.
-   **Responsive Design:** User-friendly and responsive interface built with EJS and Bootstrap.

## Tech Stack

-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB with Mongoose
-   **Templating:** EJS (Embedded JavaScript)
-   **Authentication:** Passport.js (local strategy) with email verification using SendGrid.
-   **File Uploads:** Multer and Cloudinary
-   **AI Integration:** Google Generative AI
-   **Other Libraries:** connect-flash-plus, method-override, node-cron, express-validator, cheerio, axios.

## File Structure

```
.
├── app.js
├── cleanup_unverified_users.js
├── controllers
│   ├── feedbacks.js
│   ├── portfolios.js
│   ├── profile.js
│   └── users.js
├── middleware.js
├── models
│   ├── feedback.js
│   ├── notification.js
│   ├── portfolio.js
│   └── user.js
├── public
│   ├── css
│   ├── images
│   └── js
├── routes
│   ├── feedbacks.js
│   ├── portfolios.js
│   ├── profile.js
│   └── users.js
├── utils
│   ├── cloudinaryConfig.js
│   └── portfolioAnalyzer.js
└── views
    ├── feedbacks
    ├── layouts
    ├── partials
    ├── portfolios
    └── users
```

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

-   Node.js
-   npm
-   MongoDB

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username_/QPortfolio.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Create a `.env` file in the root directory and add the following environment variables. You can use the `.env.example` file as a template.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file:

`MONGO_URI`
`SESSION_SECRET`
`CLOUDINARY_CLOUD_NAME`
`CLOUDINARY_KEY`
`CLOUDINARY_SECRET`
`GOOGLE_API_KEY`
`SENDGRID_API_KEY`
`SENDGRID_VERIFIED_SENDER_EMAIL`

## Available Scripts

In the project directory, you can run:

-   `npm start`: Starts the main application.
-   `npm run seed`: Seeds the database with initial data (if `seeds.js` is configured).
-   `npm test`: (Not yet implemented) Will run the test suite.


## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## Author

-   **Md Arsalan Siddiqui** - _Full Stack Developer_ - [LinkedIn](https://www.linkedin.com/in/md-arsalan-siddiqui/)