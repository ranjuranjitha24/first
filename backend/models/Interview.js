const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true },       // YYYY-MM-DD
  time: { type: String, required: true },       // HH:MM
  type: {
    type: String,
    required: true,
    enum: ['HR Round', 'Technical', 'Final Round']
  },
  status: {
    type: String,
    default: 'Scheduled',
    enum: ['Scheduled', 'Completed', 'Cancelled']
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
