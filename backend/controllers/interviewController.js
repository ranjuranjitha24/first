const Interview = require('../models/Interview');

// GET /api/interviews
exports.getInterviews = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;
    const interviews = await Interview.find(query)
      .populate('employee', 'name email role experience')
      .sort({ date: 1, time: 1 });
    res.json({ success: true, data: interviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/interviews/upcoming
exports.getUpcoming = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const interviews = await Interview.find({
      status: 'Scheduled',
      date: { $gte: today }
    })
      .populate('employee', 'name role')
      .sort({ date: 1, time: 1 })
      .limit(5);
    res.json({ success: true, data: interviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/interviews
exports.addInterview = async (req, res) => {
  try {
    const { date, time } = req.body;
    // Check slot conflict
    const conflict = await Interview.findOne({ date, time, status: 'Scheduled' });
    if (conflict) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked. Please choose another time.' });
    }
    const interview = await Interview.create(req.body);
    const populated = await interview.populate('employee', 'name email role');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/interviews/:id
exports.updateInterview = async (req, res) => {
  try {
    const { date, time } = req.body;
    if (date && time) {
      const conflict = await Interview.findOne({
        date, time, status: 'Scheduled', _id: { $ne: req.params.id }
      });
      if (conflict) {
        return res.status(409).json({ success: false, message: 'Slot already taken.' });
      }
    }
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate('employee', 'name email role');
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.json({ success: true, data: interview });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/interviews/:id
exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.json({ success: true, message: 'Interview deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
