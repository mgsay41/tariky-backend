import { Request, Response } from "express";
import { Webhook } from "svix";
import prisma from "../utils/prisma";
import { sendSuccess, sendError } from "../utils/response";

/**
 * Webhook Controller for handling Clerk webhooks
 *
 * Handles user.created and user.updated events from Clerk
 * to automatically sync user data with the database
 */
export class WebhookController {
  /**
   * Handle Clerk webhook events
   * POST /api/webhooks/clerk
   *
   * This endpoint receives webhooks from Clerk when:
   * - A user signs up (user.created)
   * - A user updates their profile (user.updated)
   */
  static async handleClerkWebhook(req: Request, res: Response) {
    try {
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error("CLERK_WEBHOOK_SECRET is not configured");
        return sendError(res, "Webhook secret not configured", 500);
      }

      // Get the headers and raw body
      const headers = req.headers;
      const payload = JSON.stringify(req.body);

      // Get the Svix headers for verification
      const svix_id = headers["svix-id"] as string;
      const svix_timestamp = headers["svix-timestamp"] as string;
      const svix_signature = headers["svix-signature"] as string;

      // If there are no Svix headers, error out
      if (!svix_id || !svix_timestamp || !svix_signature) {
        return sendError(res, "Missing Svix headers", 400);
      }

      // Create a new Svix instance with your webhook secret
      const wh = new Webhook(webhookSecret);

      let evt: any;

      // Verify the webhook signature
      try {
        evt = wh.verify(payload, {
          "svix-id": svix_id,
          "svix-timestamp": svix_timestamp,
          "svix-signature": svix_signature,
        });
      } catch (err) {
        console.error("Error verifying webhook:", err);
        return sendError(res, "Invalid webhook signature", 400);
      }

      // Handle the webhook
      const eventType = evt.type;
      console.log(`Received Clerk webhook: ${eventType}`);

      // Handle user.created and user.updated events
      if (eventType === "user.created" || eventType === "user.updated") {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;

        // Get primary email address
        const primaryEmail = email_addresses?.find(
          (email: any) => email.id === evt.data.primary_email_address_id
        );

        if (!primaryEmail) {
          console.error("No primary email found for user");
          return sendError(res, "No primary email found", 400);
        }

        // Upsert user in database
        const user = await prisma.user.upsert({
          where: { clerkId: id },
          update: {
            firstName: first_name || "",
            lastName: last_name || "",
            profilePhoto: image_url || null,
          },
          create: {
            clerkId: id,
            email: primaryEmail.email_address,
            firstName: first_name || "",
            lastName: last_name || "",
            profilePhoto: image_url || null,
            isProfileComplete: false,
          },
        });

        console.log(
          `User ${eventType === "user.created" ? "created" : "updated"}:`,
          user.email
        );

        return sendSuccess(
          res,
          { user },
          `User ${eventType === "user.created" ? "created" : "updated"} successfully`,
          eventType === "user.created" ? 201 : 200
        );
      }

      // Handle user.deleted event (optional)
      if (eventType === "user.deleted") {
        const { id } = evt.data;

        // You can choose to delete the user or mark them as inactive
        // For now, we'll just log it
        console.log(`User deleted from Clerk: ${id}`);
        // Optional: Delete user from database
        // await prisma.user.delete({ where: { clerkId: id } });

        return sendSuccess(res, null, "User deletion acknowledged");
      }

      // For other event types, just acknowledge receipt
      console.log(`Unhandled webhook event type: ${eventType}`);
      return sendSuccess(res, null, "Webhook received");
    } catch (error) {
      console.error("Error handling Clerk webhook:", error);
      return sendError(res, "Failed to process webhook", 500);
    }
  }
}
