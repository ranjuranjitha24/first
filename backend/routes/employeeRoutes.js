const express = require('express');
const router = express.Router();
const {
  getEmployees, getEmployeeById, addEmployee,
  updateEmployee, deleteEmployee, getStats
} = require('../controllers/employeeController');

router.get('/stats', getStats);
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', addEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;
