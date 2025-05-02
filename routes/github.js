// // routes/github.js
// import express from 'express';
// import axios from 'axios';
// import { summarizePRChanges } from '../utils/summarizer.js';
// import dotenv from 'dotenv';
// dotenv.config();
// const router = express.Router();

// router.post('/:email', async (req, res) => {
//   try {
//     const { action, pull_request, repository } = req.body;

//     if (!['opened', 'synchronize'].includes(action)) {
//       return res.status(200).json({ message: 'Event ignored.' });
//     }

//     const diffUrl = pull_request.diff_url;
//     const summary = await summarizePRChanges(diffUrl);

//     const commentUrl = `https://api.github.com/repos/${repository.owner.login}/${repository.name}/issues/${pull_request.number}/comments`;
//     await axios.post(commentUrl, { body: `### AI Summary:\n${summary}` }, {
//       headers: {
//         Authorization: `token ${process.env.GITHUB_TOKEN}`,
//         'User-Agent': 'PR-Buddy',
//       },
//     });

//     res.json({ message: 'Summary posted successfully.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Webhook handling failed', details: error.message });
//   }
// });

// export default router;



import express from 'express';
import axios from 'axios';
import {
  summarizePRChanges
} from '../utils/summarizer.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();
const router = express.Router();

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS // app password or real password (not recommended)
    //prtc mgtl jsyg dyss
  }
});

router.post('/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const {
      action,
      pull_request,
      repository
    } = req.body;

    if (!['opened', 'synchronize'].includes(action)) {
      return res.status(200).json({
        message: 'Event ignored.'
      });
    }

    const diffUrl = pull_request.diff_url;
    const summary = await summarizePRChanges(diffUrl);

    // Post AI summary as comment on PR
    const commentUrl = `https://api.github.com/repos/${repository.owner.login}/${repository.name}/issues/${pull_request.number}/comments`;
    await axios.post(commentUrl, {
      body: `### AI Summary:\n${summary}`
    }, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'PR-Buddy',
      },
    });

    const htmlTemplate = fs.readFileSync('/emailTemplate.html', 'utf8') // or embed it directly
      .replace('{{repo}}', repository.full_name)
      .replace('{{title}}', pull_request.title)
      .replace('{{summary}}', summary.replace(/\n/g, '<br>'))
      .replace('{{url}}', pull_request.html_url);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `PR #${pull_request.number} Summary`,
      html: htmlTemplate
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: 'Summary posted to GitHub and emailed successfully.'
    });

  } catch (error) {
    console.error('Webhook handling failed:', error);

    const errorHtmlTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e00; background-color: #fff5f5;">
        <h2 style="color: #d00;">❌ PR Summary Failed</h2>
        <p>Hello,</p>
        <p>Unfortunately, we encountered an error while processing your pull request.</p>
        <h4>Error Details:</h4>
        <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; color: #b30000;">
  ${error.message}
        </pre>
        <p>Please try again later. If the issue persists, contact support or check your integration settings.</p>
        <p style="margin-top: 20px;">Best regards,<br><strong>PR-Buddy Bot</strong></p>
      </div>
    `;

    // Configure mail options for the error
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.params.email,
      subject: '❌ Error Processing Your PR Summary',
      html: errorHtmlTemplate,
    };

    // Send email with nodemailer
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Error sending failure email:', emailError.message);
    }

    // Send response to webhook caller
    res.status(500).json({
      error: 'Webhook handling failed',
      details: error.message
    });
  }

  // catch (error) {
  //   console.error(error);
  //   res.status(500).json({
  //     error: 'Webhook handling failed',
  //     details: error.message
  //   });
  // }
});

export default router;