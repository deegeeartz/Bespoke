const express = require('express');
const router = express.Router();

const { auth, onlyAdmin } = require('../middleware/auth.middleware');
const authRoutes = require('./auth.routes');
const categoryRoutes = require('./admin/category.routes');
const inspector = require('./admin/inspector.routes');
const clientRoutes = require('./admin/client.routes');
const surveyRoutes = require('./survey.routes');
const adminRoutes = require('./admin/index.routes');

const auditRoutes = require('./audit.routes');
const inspectorDashboard = require('./inspector/index.routes');
const uploadRoutes = require('./upload.routes');

router.use('/auth', authRoutes);

router.use('/client', auth, onlyAdmin, clientRoutes);
router.use('/inspector', auth, inspector);
router.use('/admin', auth, onlyAdmin, adminRoutes);

router.use('/category', auth, categoryRoutes);
router.use('/survey', auth, surveyRoutes);

router.use('/audit', auth, auditRoutes);
router.use('/upload', uploadRoutes);
router.use('/', auth, inspectorDashboard);

module.exports = router;
