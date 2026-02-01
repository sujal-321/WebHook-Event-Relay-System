const express = require("express");
const router = express.Router();
const { createEvent } = require("../controllers/events.controller");

router.post("/", createEvent);

module.exports = router;
