// routes/passwordReset.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

const users = {}; // To store generated tokens and expiration times

// Generate a random alphanumeric string as a token
function generateRandomToken(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }
  return token;
}

// Send password reset email
async function sendPasswordResetEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: email,
    subject: "Password Reset",
    text: `Click the following link to reset your password: ${process.env.APP_URL}/reset-password/${token}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
}

// Request password reset
router.post("/api/request-password-reset", (req, res) => {
  const { email } = req.body;

  // Check if the email exists in your database or user management system
  // If the email exists, generate a token and store it along with the expiration time
  const token = generateRandomToken(20);
  users[email] = {
    token,
    expiration: Date.now() + 3600000, // Expiration time: 1 hour from now
  };

  // Send password reset email
  sendPasswordResetEmail(email, token)
    .then(() => {
      res.json({ message: "Password reset email sent successfully" });
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Error sending email" });
    });
});

// Verify token and reset password
router.post("/api/reset-password", (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = users[email];

  if (user && user.token === token && user.expiration > Date.now()) {
    // Reset the password in your database or user management system
    // Update the user's password with the new one
    res.json({ message: "Password reset successfully" });
  } else {
    res.status(400).json({ error: "Invalid or expired token" });
  }
});

module.exports = router;
