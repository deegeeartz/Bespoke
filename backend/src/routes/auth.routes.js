const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth/auth.controller');

router.post('/login', controller.userLogin);

// ADMIN SETUP
router.get('/setup', controller.adminSetup);

module.exports = router;
