# Notes Auth Microservice

`notes-auth-micro` is a microservice responsible for **user authentication**, **authorization**, and **user data management** in the Notes Application system. It also handles **email notifications** for signup and password reset functionalities. The service provides essential authentication routes such as signup, login, password management, and exposes an introspection API used by the API Gateway for role-based access control decisions.

## Features

- **Generic Service**: Can be reused in other projects, providing flexibility for user authentication and authorization needs.
- **User Authentication**: Sign up, login, logout, password reset, and token introspection.
- **Token Introspection**: Provides a token introspection API used by the API Gateway to validate users and allow access to protected resources.
- **JWT Authentication**: JSON Web Tokens (JWT) are used for secure stateless authentication.
- **Password Management**: Supports password resets and password changes.
- **User Management**: Admin-level control for creating, updating, deleting, and retrieving user details.
- **Email Notifications**: Sends email notifications for user signup and password reset.

## Tech Stack

- **Node.js** with **Express** for server-side logic.
- **MongoDB** for storing user data.
- **JWT** for authentication.
- **Docker** for containerization.

## API

### Authentication Routes

| **Method** | **Route**                        | **Description**                                       |
| ---------- | -------------------------------- | ----------------------------------------------------- |
| POST       | `/api/v1/signup`                 | Register a new user                                   |
| POST       | `/api/v1/login`                  | Log in an existing user                               |
| POST       | `/api/v1/logout`                 | Log out the current user                              |
| POST       | `/api/v1/introspect`             | Verify the validity of a token and return user claims |
| POST       | `/api/v1/forgetPassword`         | Request a password reset link                         |
| PATCH      | `/api/v1/resetPassword/:token`   | Reset the password using a token                      |
| PATCH      | `/api/v1/changePassword/:userID` | Change the password for a specific user               |

### User Routes

| **Method** | **Route**               | **Description**                     |
| ---------- | ----------------------- | ----------------------------------- |
| GET        | `/api/v1/users/`        | Retrieve a list of all users        |
| POST       | `/api/v1/users/`        | Create a new user                   |
| GET        | `/api/v1/users/:userID` | Retrieve details of a specific user |
| PATCH      | `/api/v1/users/:userID` | Update details of a specific user   |
| DELETE     | `/api/v1/users/:userID` | Delete a specific user              |

## User Model

The `User` model contains the following fields:

| **Field**                   | **Type** | **Required** | **Details**                                          |
| --------------------------- | -------- | ------------ | ---------------------------------------------------- |
| `name`                      | String   | Yes          | 2-64 characters, ASCII only.                         |
| `email`                     | String   | Yes          | Unique, lowercase, valid email format.               |
| `photo`                     | String   | No           | Default is "default.jpg", valid URL format.          |
| `password`                  | String   | Yes          | At least 8 characters long, not selected by default. |
| `role`                      | String   | No           | Can be "user" or "admin", default is "user".         |
| `passwordChangedAt`         | Date     | No           | Date of the last password change.                    |
| `resetPasswordToken`        | String   | No           | Token for password reset.                            |
| `resetPasswordTokenExpires` | Date     | No           | Expiration date for the reset password token.        |
| `active`                    | Boolean  | No           | Default is true, not selected by default.            |

## Environment Variables

To run this service, configure the following environment variables in your `.env` file:

| **Variable**                          | **Description**                                                |
| ------------------------------------- | -------------------------------------------------------------- |
| `NODE_ENV`                            | Node environment (e.g., `development`, `production`).          |
| `PORT`                                | Port on which the service will run (default: `3000`).          |
| `MONGO_DB_URI`                        | MongoDB connection string (e.g.: `mongodb://localhost:27017`). |
| `JWT_SECRET`                          | Secret key for signing JWT tokens.                             |
| `JWT_EXPIRES_IN_DAYS`                 | JWT expiration duration in days.                               |
| `RESET_PASSWORD_TOKEN_EXPIRES_IN_SEC` | Expiration time for reset password tokens.                     |
| `EMAIL_HOST`                          | SMTP server host for email service.                            |
| `EMAIL_PORT`                          | SMTP server port for email service.                            |
| `EMAIL_USERNAME`                      | SMTP username for email service.                               |
| `EMAIL_PASSWORD`                      | SMTP password for email service.                               |
| `EMAIL_FROM`                          | Sender email address.                                          |
| `UI_APP_URL`                          | URL to the frontend application, used in email templates.      |
| `MAILTRAP_EMAIL_HOST`                 | MailTrap SMTP server host for email testing in development.    |
| `MAILTRAP_EMAIL_PORT`                 | MailTrap SMTP port.                                            |
| `MAILTRAP_EMAIL_USERNAME`             | MailTrap SMTP username.                                        |
| `MAILTRAP_EMAIL_PASSWORD`             | MailTrap SMTP password.                                        |

## Email Configuration

- The microservice sends emails such as welcome messages and password reset tokens using a configured SMTP server.
- During development, MailTrap is used to test emails without sending them to real users.

## Setup & Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/notes-auth-micro.git
cd notes-auth-micro
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables by creating a `.env` file in the root directory with the required settings (as outlined in the [Environment Variables](#environment-variables) section).

4. Run the application:

```bash
npm start
```

6. The service will be available at `http://localhost:3000` by default.

## Usage

Once the service is running, you can test the endpoints using tools like **Postman** or **cURL**.
Example: Create a new user via the signup route:

```bash
POST http://localhost:3000/api/v1/signup
Content-Type: application/json
{
    "name": "John Doe",
	"email": "john@example.com",
	"password": "examplepassword"
}
```
