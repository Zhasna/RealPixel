const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  filename: {
    type: String,
    required: true
  },
  fakeProbability: {
    type: Number,
    required: true
  },
  verdict: {
    type: String,
    enum: ['authentic', 'manipulated'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  elaScore: {
    type: Number
  },
  elaHeatmap: {
    type: String
  },
  fftScore: {
    type: Number
  },
  fftHeatmap: {
    type: String
  },
  gradcamHeatmap: {
    type: String
  }
});

module.exports = mongoose.model('Scan', ScanSchema);