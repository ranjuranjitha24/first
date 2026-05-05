const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Product Manager', 'Data Analyst', 'DevOps Engineer', 'QA Engineer', 'HR Manager']
  },
  experience: {
    type: String,
    required: true,
    enum: ['Fresher (0-1 yr)', 'Junior (1-3 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5-8 yrs)', 'Lead (8+ yrs)']
  },
  skills: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
