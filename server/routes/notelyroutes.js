// Creating the router object that will be exported and loaded within app.js

const express = require('express');
const controller = require('./../controllers/notelycontrollers');
const router = express.Router();

router.get('/users', controller.users);
router.get('/api/tutors', controller.tutors);
router.get('/api/tutors/distinct-fields', controller.distinctFields);

module.exports = router;