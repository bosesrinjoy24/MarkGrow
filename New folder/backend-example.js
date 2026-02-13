/**
 * Example Backend Server for MarkGrow Contact Forms
 * 
 * This is a Node.js/Express example. You can adapt this for:
 * - Python (Flask/FastAPI)
 * - PHP
 * - Ruby on Rails
 * - Any other backend framework
 * 
 * Installation:
 * npm install express nodemailer dotenv
 * 
 * Usage:
 * 1. Create a .env file with your email credentials
 * 2. Update email configuration below
 * 3. Run: node backend-example.js
 * 4. Update index.html endpoint to: http://localhost:3000/api/submit-form
 */

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Email transporter configuration
// Option 1: Gmail (requires app password)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS  // Your app password (not regular password)
    }
});

// Option 2: SMTP (works with any email provider)
/*
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,     // e.g., smtp.gmail.com
    port: process.env.SMTP_PORT,     // e.g., 587
    secure: false,                   // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
*/

// Option 3: SendGrid
/*
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
*/

// Form submission endpoint
app.post('/api/submit-form', async (req, res) => {
    try {
        const { name, email, website, phone, service, message } = req.body;
        
        // Validation
        if (!name || !email || !website) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid email address' 
            });
        }
        
        // Prepare email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL || 'hello@markgrow.com', // Where to send notifications
            subject: `New SEO Audit Request from ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Website:</strong> ${website}</p>
                ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                <p><strong>Service:</strong> ${service || 'Not specified'}</p>
                ${message ? `<p><strong>Message:</strong><br>${message}</p>` : ''}
                <hr>
                <p><small>Submitted: ${new Date().toLocaleString()}</small></p>
            `,
            // Optional: Send a copy to the submitter
            replyTo: email
        };
        
        // Send email
        await transporter.sendMail(mailOptions);
        
        // Optional: Save to database
        // await saveToDatabase({ name, email, website, phone, service, message });
        
        // Optional: Send confirmation email to user
        const confirmationEmail = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for your SEO audit request - MarkGrow',
            html: `
                <h2>Thank you, ${name}!</h2>
                <p>We've received your request for a free SEO audit. Our team will review your website (<strong>${website}</strong>) and send you a comprehensive report within 24 hours.</p>
                <p>If you have any questions, feel free to reply to this email.</p>
                <hr>
                <p><strong>MarkGrow Team</strong><br>
                ROI-Driven SEO Services</p>
            `
        };
        
        await transporter.sendMail(confirmationEmail);
        
        // Success response
        res.json({ 
            success: true, 
            message: 'Form submitted successfully' 
        });
        
    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error. Please try again later.' 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Form endpoint: http://localhost:${PORT}/api/submit-form`);
});

/**
 * Example .env file:
 * 
 * EMAIL_USER=your-email@gmail.com
 * EMAIL_PASS=your-app-password
 * RECIPIENT_EMAIL=hello@markgrow.com
 * PORT=3000
 * 
 * For Gmail app password:
 * 1. Enable 2-factor authentication
 * 2. Go to Google Account > Security > App passwords
 * 3. Generate a new app password
 * 4. Use that password in EMAIL_PASS
 */

/**
 * Alternative: Using SendGrid
 * 
 * npm install @sendgrid/mail
 * 
 * Replace transporter.sendMail with:
 * 
 * const msg = {
 *     to: process.env.RECIPIENT_EMAIL,
 *     from: process.env.EMAIL_USER,
 *     subject: `New SEO Audit Request from ${name}`,
 *     html: mailOptions.html
 * };
 * 
 * await sgMail.send(msg);
 */

/**
 * Rate Limiting Example (using express-rate-limit)
 * 
 * npm install express-rate-limit
 * 
 * const rateLimit = require('express-rate-limit');
 * 
 * const limiter = rateLimit({
 *     windowMs: 15 * 60 * 1000, // 15 minutes
 *     max: 5 // limit each IP to 5 requests per windowMs
 * });
 * 
 * app.post('/api/submit-form', limiter, async (req, res) => {
 *     // ... existing code
 * });
 */
