const express = require("express");
const router = express.Router();
const { registerWebhook } = require("../controllers/webhooks.controller");

router.post("/", registerWebhook);

module.exports = router;
