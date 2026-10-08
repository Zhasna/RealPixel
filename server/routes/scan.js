const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const Scan = require('../models/Scan');
const optionalAuth = require('../middleware/optionalAuth');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', optionalAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/predict`,
      formData,
      { headers: formData.getHeaders() }
    );

    const fakeProbability = mlResponse.data.fake_probability;
    const elaScore = mlResponse.data.ela_score;
    const elaHeatmap = mlResponse.data.ela_heatmap;
    const fftScore = mlResponse.data.fft_score;
    const fftHeatmap = mlResponse.data.fft_heatmap;
    const gradcamHeatmap = mlResponse.data.gradcam_heatmap;
    const FAKE_THRESHOLD = 0.35;
    const verdict = fakeProbability > FAKE_THRESHOLD ? 'manipulated' : 'authentic';

    const resultPayload = {
      filename: req.file.originalname,
      fakeProbability,
      verdict,
      elaScore,
      elaHeatmap,
      fftScore,
      fftHeatmap,
      gradcamHeatmap,
      createdAt: new Date()
    };

    try {
      const scan = new Scan({ user: req.userId, ...resultPayload });
      await scan.save();
      return res.status(201).json(scan);
    } catch (dbErr) {
      console.error('Scan succeeded but failed to save to DB:', dbErr.message);
      return res.status(201).json({ ...resultPayload, _id: null, saved: false });
    }
  } catch (err) {
    res.status(500).json({ message: 'Scan failed', error: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const scans = await Scan.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(scans);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history', error: err.message });
  }
});

module.exports = router;