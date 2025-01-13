const express = require('express');
const router = express.Router();
const controller = require('../controllers/audit.controller');
const { inspectorOnly, clientOnly } = require('../middleware/auth.middleware');

// ROUTE: /audit

router.get('/', controller.getAllRecords);

router.get('/inspector', inspectorOnly, controller.getInspectorAudits);

router.get('/client', clientOnly, controller.getClientAudits);

router.patch('/:id/feedback', clientOnly, controller.addFeedback);

router.get('/survey/:id', controller.getSurveyAudits);

router.get('/:id', controller.getRecordById);

router.post('/', inspectorOnly, controller.createRecord);

router.put('/:id', controller.updateRecord);

router.delete('/:id', controller.deleteRecord);

module.exports = router;
