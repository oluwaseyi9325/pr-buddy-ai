// routes/github.js
import express from 'express';
import axios from 'axios';
import { summarizePRChanges } from '../utils/summarizer.js';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { action, pull_request, repository } = req.body;

    if (!['opened', 'synchronize'].includes(action)) {
      return res.status(200).json({ message: 'Event ignored.' });
    }

    const diffUrl = pull_request.diff_url;
    const summary = await summarizePRChanges(diffUrl);

    const commentUrl = `https://api.github.com/repos/${repository.owner.login}/${repository.name}/issues/${pull_request.number}/comments`;
    await axios.post(commentUrl, { body: `### AI Summary:\n${summary}` }, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'PR-Buddy',
      },
    });

    res.json({ message: 'Summary posted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Webhook handling failed', details: error.message });
  }
});

export default router;
