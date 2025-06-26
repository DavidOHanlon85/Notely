// Creating the router object that will be exported and loaded within app.js

const express = require('express');
const controller = require('./../controllers/notelycontrollers');
const router = express.Router();

router.get('/users', controller.users);

module.exports = router;