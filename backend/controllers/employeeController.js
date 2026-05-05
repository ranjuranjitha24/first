const Employee = require('../models/Employee');

// GET /api/employees
exports.getEmployees = async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }
    const employees = await Employee.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/employees/:id
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/employees
exports.addEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/employees/:id
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/employees/:id
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    // Also delete their interviews
    const Interview = require('../models/Interview');
    await Interview.deleteMany({ employee: req.params.id });
    res.json({ success: true, message: 'Employee and their interviews deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/employees/stats
exports.getStats = async (req, res) => {
  try {
    const Interview = require('../models/Interview');
    const totalEmployees = await Employee.countDocuments();
    const totalInterviews = await Interview.countDocuments();
    const scheduled = await Interview.countDocuments({ status: 'Scheduled' });
    const completed = await Interview.countDocuments({ status: 'Completed' });
    const cancelled = await Interview.countDocuments({ status: 'Cancelled' });
    res.json({ success: true, data: { totalEmployees, totalInterviews, scheduled, completed, cancelled } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
