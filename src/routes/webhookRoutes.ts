import { Router } from "express";
import { WebhookController } from "../controllers/webhookController";

const router = Router();

/**
 * Webhook Routes
 *
 * These routes handle incoming webhooks from external services
 */

/**
 * POST /api/webhooks/clerk
 * Handle Clerk webhooks for user events
 *
 * Events handled:
 * - user.created: When a new user signs up
 * - user.updated: When a user updates their profile
 * - user.deleted: When a user is deleted (optional)
 */
router.post("/clerk", WebhookController.handleClerkWebhook);

export default router;
