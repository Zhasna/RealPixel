const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const Scan = require('../models/Scan');
const optionalAuth = require('../middleware/optionalAuth');

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
    const verdict = fakeProbability > 0.5 ? 'manipulated' : 'authentic';

    const scan = new Scan({
      user: req.userId,
      filename: req.file.originalname,
      fakeProbability,
      verdict
    });
    await scan.save();

    res.status(201).json(scan);
  } catch (err) {
    res.status(500).json({ message: 'Scan failed', error: err.message });
  }
});

module.exports = router;