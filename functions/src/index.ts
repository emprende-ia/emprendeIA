
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK if not already done
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

// Define a mapping from Stripe Price ID to your application's Plan ID
const priceToPlanMap: { [key: string]: string } = {
    [process.env.STRIPE_PLUS_PRICE_ID!]: 'oro',
    [process.env.STRIPE_PREMIUM_PRICE_ID!]: 'diamante',
};

/**
 * Cloud Function that triggers when a checkout session document is updated.
 * Specifically, it waits for the Stripe Extension to mark the session as "complete".
 */
export const onCheckoutSessionCompleted = onDocumentWritten(
  "customers/{userId}/checkout_sessions/{sessionId}",
  async (event) => {
    // We only care about updates where the session is marked as 'complete'
    if (!event.data?.after) {
        logger.info("Document deleted or created without data, ignoring.");
        return;
    }

    const sessionData = event.data.after.data();
    const beforeData = event.data.before.data();

    // Prevent re-triggering if the status was already complete
    if (beforeData?.status === 'complete' || sessionData?.status !== 'complete') {
        logger.info(`Session ${event.params.sessionId} status is '${sessionData?.status}', not 'complete'. Ignoring.`);
        return;
    }
    
    // Extract necessary data from the session
    const userId = event.params.userId;
    const priceId = sessionData.price?.id;

    if (!userId || !priceId) {
        logger.error(`Missing userId or priceId for session ${event.params.sessionId}`);
        return;
    }
    
    // Map the Stripe Price ID to your internal Plan ID
    const planId = priceToPlanMap[priceId];
    if (!planId) {
        logger.warn(`No plan mapping found for priceId: ${priceId}`);
        return;
    }

    // Update the user's document in the 'users' collection
    const userDocRef = db.collection('users').doc(userId);

    try {
        await userDocRef.update({
            plan: planId,
            planStatus: 'active',
            updatedAt: FieldValue.serverTimestamp(),
        });
        logger.info(`Successfully updated plan for user ${userId} to '${planId}'.`);
    } catch (error) {
        logger.error(`Failed to update plan for user ${userId}:`, error);
    }
  }
);

    