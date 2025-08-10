import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
     service:'gmail',
  port: 587,
  auth: {
    user:process.env.SENDER_EMAIL,    // your email address
    pass: process.env.SMTP_PASSWORD, 
  },
});
export default transporter;