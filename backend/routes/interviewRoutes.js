const express = require('express');
const router = express.Router();
const {
  getInterviews, getUpcoming, addInterview,
  updateInterview, deleteInterview
} = require('../controllers/interviewController');

router.get('/upcoming', getUpcoming);
router.get('/', getInterviews);
router.post('/', addInterview);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);

module.exports = router;
