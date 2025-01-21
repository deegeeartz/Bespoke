const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/client.controller');

router.get('/', controller.getAllRecords);

router.get('/list', controller.getAllClients);

router.get('/:id', controller.getRecordById);

router.post('/', controller.createRecord);

router.put('/:id', controller.updateRecord);

router.delete('/:id', controller.deleteRecord);

module.exports = router;
