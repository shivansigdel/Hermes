# Hermes Messaging App Setup Guide

Welcome to the Hermes Messaging App project! This guide will help you set up the project on your local machine so you can start contributing.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [1. Install Dependencies](#1-install-dependencies)
  - [2. Set Up MongoDB Atlas](#2-set-up-mongodb-atlas)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Run the Backend Server](#4-run-the-backend-server)
  - [5. Run the Frontend Application](#5-run-the-frontend-application)
- [Testing the Application](#testing-the-application)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)
- [Additional Resources](#additional-resources)

---

## Project Overview

The Hermes Messaging App is a web application that allows users to register, log in, and (eventually) send messages and participate in group chats. The current implementation includes:

- **MongoDB Database**: Stores user IDs, emails, and encrypted passwords.
- **Registration Page**: Allows new users to create an account.
- **Login Page**: Includes error messages for invalid credentials.
- **Dashboard Page**: A placeholder page to verify successful login.

---

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (version 14 or higher recommended)
  - Download from [Node.js Official Website](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning the repository)
- **An IDE or Text Editor** (e.g., VS Code)

---

## Project Structure

The project is divided into two main directories:

- **`hermes-backend`**: Contains the backend server code (Node.js, Express).
- **`hermes-frontend`**: Contains the frontend application code (React).

---

## Setup Instructions

### 1. Install Dependencies

**For both the backend and frontend, you need to install the required dependencies.**

#### Backend Dependencies

1. Navigate to the `hermes-backend` directory:

   ```bash
   cd hermes-backend
   ```

2. Install the dependencies listed in `package.json`:

   ```bash
   npm install
   ```

#### Frontend Dependencies

1. Navigate to the `hermes-frontend` directory:

   ```bash
   cd hermes-frontend
   ```

2. Install the dependencies listed in `package.json`:

   ```bash
   npm install
   ```

---

### 2. Set Up MongoDB Atlas

We are using MongoDB Atlas for our database.

#### Create a MongoDB Atlas Account

1. **Sign Up**:

   - Go to [MongoDB Atlas Registration](https://www.mongodb.com/cloud/atlas/register) and create a free account.

2. **Send Your Email**:

   - After registering, send your MongoDB account email to cooperjgilkey@utexas.edu or in the GC (e.g., `youremail@example.com`) so you can be added to the project's database.

3. **Wait for Access**:

   - Cooper will notify you once you've been granted access to the database.

#### Note:

- **Why We Need Your Email**: Adding your email to the MongoDB Atlas project allows you to connect to the shared database securely.

---

### 3. Configure Environment Variables

You need to create a `.env` file in the backend directory to store sensitive information like database credentials and JWT secrets.

#### Create the `.env` File in `hermes-backend`

1. Navigate to the `hermes-backend` directory if you're not already there:

   ```bash
   cd hermes-backend
   ```

2. Create a file named `.env`:

   ```bash
   touch .env
   ```

3. Open `.env` in your text editor and add the following content:

   ```env
   MONGODB_URI=mongodb+srv://<your_mongo_user>:<your_mongo_password>@hermes0.pgeyu.mongodb.net/hermes?retryWrites=true&w=majority
   TOKEN_SECRET=your_jwt_secret
   ```

   - **Replace `<your_mongo_user>`** with your MongoDB Atlas username.
   - **Replace `<your_mongo_password>`** with your MongoDB Atlas password.
   - **Replace `your_jwt_secret`** with a secure, random string (used for JWT authentication).

#### Important:

- **Do Not Commit the `.env` File**: Ensure that the `.env` file is included in `.gitignore` to prevent sensitive information from being pushed to version control.

---

### 4. Run the Backend Server

With the dependencies installed and the `.env` file configured, you can now run the backend server.

1. Navigate to the `hermes-backend` directory (if not already there):

   ```bash
   cd hermes-backend
   ```

2. Start the server:

   ```bash
   node index.js
   ```

3. You should see output similar to:

   ```
   MongoDB connected...
   Server is running on port 5001
   ```

#### Tips:

- **Using Nodemon for Development**:

  - Install nodemon globally if you haven't:

    ```bash
    npm install -g nodemon
    ```

  - Run the server with nodemon to automatically restart on code changes:

    ```bash
    nodemon index.js
    ```

---

### 5. Run the Frontend Application

With the backend server running, you can now start the frontend application.

1. Navigate to the `hermes-frontend` directory:

   ```bash
   cd hermes-frontend
   ```

2. Start the React development server:

   ```bash
   npm start
   ```

3. This should automatically open a browser window at `http://localhost:3000`. If it doesn't, open your browser and navigate to that URL.

---

## Testing the Application

With both servers running, you can test the registration and login functionality.

### Register a New User

1. **Navigate to the Registration Page**:

   - Go to `http://localhost:3000/register`.

2. **Fill Out the Registration Form**:

   - Enter a valid email address and a secure password.

3. **Submit the Form**:

   - Click on the **Register** button.

4. **Verify Registration**:

   - You should see a success message or be redirected to the login page.

### Log In as the User

1. **Navigate to the Login Page**:

   - Go to `http://localhost:3000/login`.

2. **Enter Credentials**:

   - Use the email and password you registered with.

3. **Submit the Form**:

   - Click on the **Login** button.

4. **Access the Dashboard**:

   - Upon successful login, you should be redirected to the dashboard page.

### Dashboard Page

- The dashboard is currently a placeholder and confirms that authentication is working.
- You can log out using the **Logout** button (if implemented).

---

## Troubleshooting

### Common Issues and Solutions

#### Dependencies Not Installed

- **Error**: Module not found or cannot find module.
- **Solution**: Ensure you've run `npm install` in both `hermes-backend` and `hermes-frontend` directories.

#### Backend Server Not Running

- **Error**: Cannot connect to the backend or API calls fail.
- **Solution**: Start the backend server by running `node index.js` or `nodemon index.js` in the `hermes-backend` directory.

#### Environment Variables Not Set

- **Error**: Application crashes or cannot connect to MongoDB.
- **Solution**: Verify that the `.env` file is correctly configured with your MongoDB URI and JWT secret.

#### CORS Errors

- **Error**: Cross-Origin Resource Sharing (CORS) error in the browser console.
- **Solution**: The backend server includes CORS configuration. Ensure the `cors` middleware is correctly set up in `index.js`.

#### MongoDB Connection Issues

- **Error**: Failed to connect to MongoDB.
- **Solutions**:
  - Ensure your IP address is whitelisted in MongoDB Atlas under **Network Access**.
  - Double-check your MongoDB URI in the `.env` file.
  - Verify your MongoDB Atlas username and password.

#### Login Redirect Not Working

- **Error**: After logging in, you remain on the login page.
- **Solution**:
  - Ensure that the JWT token includes an `exp` (expiration) claim.
  - Verify that `jwt-decode` is correctly imported and used in `PrivateRoute.js`.
  - Check for typos in your `PrivateRoute` and routing setup.

#### Port Conflicts

- **Error**: Address already in use `EADDRINUSE`.
- **Solution**: Ensure no other application is using the same port. You can change the port in `index.js` or kill the process using the port.

---

## Next Steps

Now that you have the application running locally, here are some suggested next steps:

- **Implement Real-Time Messaging**:

  - Integrate Socket.io or similar technology for real-time chat functionality.

- **Enhance User Experience**:

  - Improve the UI/UX of the application.
  - Add client-side form validation and error handling.

- **Security Improvements**:

  - Store JWT tokens securely (e.g., in HTTP-only cookies).
  - Implement proper logout functionality.
  - Sanitize and validate all user inputs on both frontend and backend.

- **Database Schemas**:

  - Design and implement schemas for messages, group chats, and other data models.

- **Code Refactoring**:

  - Organize code into more modular components.
  - Add comments and documentation where necessary.

- **Testing**:

  - Write unit and integration tests for both frontend and backend code.

- **Deployment Preparation**:

  - Set up scripts and configurations for deploying the application to a hosting service.

---

## Additional Resources

- **MongoDB Atlas Documentation**:

  - [Getting Started with MongoDB Atlas](https://docs.atlas.mongodb.com/getting-started/)

- **React Documentation**:

  - [React Official Documentation](https://reactjs.org/docs/getting-started.html)

- **Express Documentation**:

  - [Express Official Documentation](https://expressjs.com/)

- **Socket.io Documentation** (if applicable):

  - [Socket.io Official Documentation](https://socket.io/docs/v4)

- **JWT Guide**:

  - [Introduction to JSON Web Tokens](https://jwt.io/introduction/)

---

If you have any questions or need assistance, please reach out to Cooper Gilkey at  via our text.

---
