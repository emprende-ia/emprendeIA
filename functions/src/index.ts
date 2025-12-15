/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onDocumentWritten} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import {initializeApp, getApps} from "firebase-admin/app";
import {getFirestore, Timestamp} from "firebase-admin/firestore";

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();


setGlobalOptions({maxInstances: 10});

// Define a mapping from Stripe Price ID to your internal plan ID
const priceToPlanMap: {[key: string]: string} = {
  [process.env.STRIPE_PLUS_PRICE_ID || "price_oro_placeholder"]: "oro",
  [process.env.STRIPE_PREMIUM_PRICE_ID || "price_diamante_placeholder"]: "diamante",
};


/**
 * Cloud Function that triggers when a checkout session document is written.
 * It handles successful payments by updating the user's plan in Firestore.
 */
export const onCheckoutSessionCompleted = onDocumentWritten(
  "customers/{userId}/checkout_sessions/{sessionId}",
  async (event) => {
    // Only act on document creation or updates.
    if (!event.data) {
      return;
    }

    const afterData = event.data.after.data();
    logger.info(`Checkout session written for user: ${event.params.userId}`, {
      sessionId: event.params.sessionId,
      data: afterData,
    });

    // Check if the checkout session was successful
    if (afterData && afterData.status === "complete") {
      const priceId = afterData.price?.id;
      const userId = event.params.userId;

      if (!priceId || !userId) {
        logger.error("Missing priceId or userId in checkout session.", {
          userId,
          sessionId: event.params.sessionId,
        });
        return;
      }

      // Map the Stripe Price ID to your internal plan ID
      const planId = priceToPlanMap[priceId];

      if (!planId) {
        logger.warn(`No plan found for priceId: ${priceId}`);
        return;
      }

      // Update the user's document in the 'users' collection
      const userDocRef = db.doc(`users/${userId}`);

      try {
        await userDocRef.update({
          plan: planId,
          planStatus: "active",
          updatedAt: Timestamp.now(),
        });
        logger.info(`Successfully updated plan for user ${userId} to ${planId}.`);
      } catch (error) {
        logger.error(`Failed to update plan for user ${userId}.`, {error});
      }
    }
  }
);
