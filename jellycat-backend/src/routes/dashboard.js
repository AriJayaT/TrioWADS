// src/routes/dashboard.js
const express = require('express');
const { getDashboardData } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getDashboardData);

module.exports = router;