import express from "express";
import {
  registerWebhook,
  getWebhooks,
} from "../controllers/webhooks.controller.js";

const router = express.Router();

router.post("/", registerWebhook);
router.get("/", getWebhooks);

export default router;
