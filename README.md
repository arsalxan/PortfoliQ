# PortfoliQue - A Portfolio Feedback Platform

PortfoliQue is a web application built with Node.js, Express, and MongoDB that allows users to create, share, and receive feedback on their portfolios. It also features an AI-powered review system to provide automated analysis and suggestions.

## Live Demo

A live version of the application is deployed on Render.

[**Visit PortfoliQue Live**](https://portfolique.onrender.com/)

## ✨ Features

-   **User Authentication:** Secure user registration and login with email verification.
-   **Portfolio Management:** Create, edit, and delete portfolios with details, screenshots, and repository links.
-   **Feedback System:** Users can leave detailed feedback on each other's portfolios, focusing on design, responsiveness, content, UX, accessibility, and performance.
-   **AI-Powered Reviews:** Integrates Google's Generative AI to provide automated portfolio analysis and suggestions for improvement.
-   **Real-time Notifications:** Users receive notifications for new feedback on their portfolios.
-   **User Profiles:** Customizable user profiles with display pictures, names, and contact information.
-   **Personal Dashboard:** A personalized space for users to manage their portfolios and track feedback they've given.
-   **Cloud Image Uploads:** Uses Cloudinary for hosting portfolio screenshots and user profile pictures.
-   **Responsive Design:** A user-friendly and responsive interface built with EJS and Bootstrap.

## 🛠️ Tech Stack

-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB with Mongoose
-   **View Engine:** EJS (Embedded JavaScript) & EJS-Mate
-   **Authentication:** Passport.js (local strategy), Passport-Local-Mongoose
-   **File Uploads:** Multer, Cloudinary
-   **AI Integration:** Google Generative AI (@google/genai)
-   **Email:** Brevo (@getbrevo/brevo)
-   **Styling:** Bootstrap
-   **Utilities:** `axios`, `cheerio` for web scraping, `node-cron` for scheduled jobs, `connect-flash-plus` for flash messages.

## 🚀 Getting Started

Follow these steps to get a local copy of the project up and running.

### Prerequisites

-   Node.js (v18.0.0 or higher)
-   npm
-   MongoDB (local or a cloud instance like MongoDB Atlas)

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/arsalxan/PortfoliQ.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd PortfoliQue
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```
4.  Create a `.env` file in the root directory and add the necessary environment variables (see below).

### Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

-   `MONGO_URI`: Your MongoDB connection string.
-   `SESSION_SECRET`: A secret key for signing the session ID cookie.
-   `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name.
-   `CLOUDINARY_KEY`: Your Cloudinary API key.
-   `CLOUDINARY_SECRET`: Your Cloudinary API secret.
-   `GOOGLE_API_KEY`: Your Google AI Studio API key.
-   `BREVO_API_KEY`: Your Brevo (formerly Sendinblue) API key for sending emails.
-   `BREVO_SENDER_EMAIL`: The email address you've configured in Brevo to send from.

### Available Scripts

In the project directory, you can run:

-   `npm start`: Starts the application.
-   `npm run adminseed`: Seeds the database with an initial admin user (defined in `adminSeed.js`).

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## Author

-   **Md Arsalan Siddiqui** - _Full Stack Developer_ - [LinkedIn](https://www.linkedin.com/in/md-arsalan-siddiqui/)
