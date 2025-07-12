import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fadeaboemad@gmail.com',
      pass: 'fyfp htgx umdx ofit',
    },
  });

  async sendOtpEmail(to: string, otp: string) {
    const mailOptions = {
      from: '"Football Teams App" <fadeaboemad@gmail.com>',
      to,
      subject: 'Your OTP Verification Code',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  background-color: #f5f5f5;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
              }
              .header {
                  background: #1e3a8a;
                  padding: 20px;
                  text-align: center;
              }
              .header img {
                  width: 100px;
                  height: auto;
              }
              .content {
                  padding: 30px;
                  text-align: center;
              }
              h1 {
                  color: #1e3a8a;
                  margin-bottom: 20px;
              }
              .otp-code {
                  background: #f0f4ff;
                  border: 2px dashed #1e3a8a;
                  padding: 15px;
                  font-size: 24px;
                  font-weight: bold;
                  color: #1e3a8a;
                  margin: 20px 0;
                  display: inline-block;
                  border-radius: 5px;
              }
              .footer {
                  background: #f0f4ff;
                  padding: 15px;
                  text-align: center;
                  font-size: 12px;
                  color: #666;
              }
              .button {
                  display: inline-block;
                  padding: 12px 24px;
                  background-color: #1e3a8a;
                  color: white;
                  text-decoration: none;
                  border-radius: 4px;
                  font-weight: bold;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1 style="color: white; margin: 0;">Football Teams App</h1>
              </div>
              
              <div class="content">
                  <h2>OTP Verification Code</h2>
                  <p>Dear User,</p>
                  <p>Thank you for registering with Football Teams App. Please use the following OTP code to verify your account:</p>
                  
                  <div class="otp-code">${otp}</div>
                  
                  <p>This code will expire in 5 minutes.</p>
                  <p>If you didn't request this code, please ignore this email.</p>
                  
                  <a href="#" class="button">Verify Now</a>
              </div>
              
              <div class="footer">
                  <p>© ${new Date().getFullYear()} Football Teams App. All rights reserved.</p>
                  <p>Follow us on social media: 
                      <a href="#" style="color: #1e3a8a;">Twitter</a> | 
                      <a href="#" style="color: #1e3a8a;">Facebook</a> | 
                      <a href="#" style="color: #1e3a8a;">Instagram</a>
                  </p>
              </div>
          </div>
      </body>
      </html>
      `,
      text: `Your OTP code for Football Teams App is: ${otp}\nThis code will expire in 5 minutes.`
    };

    await this.transporter.sendMail(mailOptions);
  }
}