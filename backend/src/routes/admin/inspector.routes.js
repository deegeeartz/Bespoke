const express = require('express');
const router = express.Router();
const inspectorController = require('../../controllers/admin/inspector.controller');

router.get('/', inspectorController.getAllRecords);

router.get('/list', inspectorController.getAllInspectors);

router.get('/:id', inspectorController.getRecordById);

router.post('/', inspectorController.createRecord);

router.put('/:id', inspectorController.updateRecord);

router.delete('/:id', inspectorController.deleteRecord);

module.exports = router;
