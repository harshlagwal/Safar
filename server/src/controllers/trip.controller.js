import {
  findTripById,
  findTripByShareId,
  findUserTrips,
  updateTripWithNewPlan,
  saveTripForUser,
  deleteTripForUser,
} from '../services/trip.service.js';
import { generatePlanWithGemini } from '../services/gemini.service.js';
import { env } from '../config/env.js';
import { sendTripItineraryEmail } from '../services/email.service.js';

export async function saveTrip(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const trip = await saveTripForUser(id, userId);
    if (!trip) {
      const err = new Error(`Trip with ID '${id}' not found`);
      err.code = 'NOT_FOUND';
      throw err;
    }
    return res.status(200).json(trip);
  } catch (err) {
    next(err);
  }
}

export async function listTrips(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const trips = await findUserTrips(userId);
    return res.status(200).json(trips);
  } catch (err) {
    next(err);
  }
}

export async function deleteTrip(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const deleted = await deleteTripForUser(id, userId);
    if (!deleted) {
      const err = new Error(`Trip with ID '${id}' not found`);
      err.code = 'NOT_FOUND';
      throw err;
    }
    return res.status(200).json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getTrip(req, res, next) {
  try {
    const { id } = req.params;
    const trip = await findTripById(id);
    if (!trip) {
      const err = new Error(`Trip with ID '${id}' not found`);
      err.code = 'NOT_FOUND';
      throw err;
    }

    // If trip belongs to a user, only that user (or a share link) can read it
    if (trip.userId) {
      const currentUserId = req.user?._id || req.user?.id;
      if (!currentUserId || currentUserId !== trip.userId) {
        const err = new Error('Access denied: this trip belongs to another user');
        err.code = 'FORBIDDEN';
        throw err;
      }
    }

    return res.status(200).json(trip);
  } catch (err) {
    next(err);
  }
}

export async function regenerateTrip(req, res, next) {
  try {
    const { id } = req.params;
    const existingTrip = await findTripById(id);
    if (!existingTrip) {
      const err = new Error(`Trip with ID '${id}' not found`);
      err.code = 'NOT_FOUND';
      throw err;
    }

    // If trip belongs to a user, ensure ownership before regenerating
    if (existingTrip.userId) {
      const currentUserId = req.user?._id || req.user?.id;
      if (!currentUserId || currentUserId !== existingTrip.userId) {
        const err = new Error('Access denied: this trip belongs to another user');
        err.code = 'FORBIDDEN';
        throw err;
      }
    }

    // Re-run AI planner using the stored form and provided apiKey or openRouterKey
    const apiKey = req.headers['x-gemini-api-key'] || req.headers['x-gemini-key'] || req.query.apiKey || null;
    const openRouterKey = req.headers['x-openrouter-api-key'] || req.headers['x-openrouter-key'] || null;
    const newPlan = await generatePlanWithGemini(existingTrip.form, { apiKey, openRouterKey });

    // Update document in database
    const updatedTrip = await updateTripWithNewPlan(id, newPlan);
    return res.status(200).json(updatedTrip);
  } catch (err) {
    next(err);
  }
}

export async function getSharedTrip(req, res, next) {
  try {
    const { shareId } = req.params;
    const trip = await findTripByShareId(shareId);
    if (!trip) {
      const err = new Error(`Shared trip '${shareId}' not found`);
      err.code = 'NOT_FOUND';
      throw err;
    }
    return res.status(200).json(trip);
  } catch (err) {
    next(err);
  }
}

export async function sendTripEmailHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { toEmail, recipientName, pdfBase64, filename } = req.body || {};

    if (!toEmail || !toEmail.trim()) {
      const err = new Error('Recipient email is required');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    // Try finding by id or by shareId
    let trip = await findTripById(id);
    if (!trip) {
      trip = await findTripByShareId(id);
    }

    if (!trip) {
      const err = new Error(`Trip with ID '${id}' not found`);
      err.code = 'NOT_FOUND';
      throw err;
    }

    const shareUrl = `${env.CORS_ORIGIN || 'http://localhost:3000'}/share/${trip.shareId || trip._id}`;

    let pdfAttachment = null;
    if (pdfBase64 && typeof pdfBase64 === 'string') {
      const cleanName = filename || `Safar-Itinerary-${trip.form?.destination || 'Plan'}.pdf`;
      pdfAttachment = {
        name: cleanName.endsWith('.pdf') ? cleanName : `${cleanName}.pdf`,
        content: pdfBase64,
        contentType: 'application/pdf',
      };
    }

    const result = await sendTripItineraryEmail({
      toEmail: toEmail.trim(),
      recipientName: recipientName || req.user?.name,
      trip,
      shareUrl,
      pdfAttachment,
    });

    if (!result.success) {
      if (result.reason === 'BREVO_API_KEY_NOT_CONFIGURED') {
        return res.status(503).json({
          success: false,
          error: {
            code: 'EMAIL_SERVICE_NOT_CONFIGURED',
            message: 'Brevo email service is not configured on the server. Please check server/.env',
          },
        });
      }
      return res.status(502).json({
        success: false,
        error: {
          code: 'EMAIL_SEND_FAILED',
          message: 'Failed to send itinerary email. Please try again later.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: `Trip itinerary successfully emailed to ${toEmail.trim()}`,
      messageId: result.messageId,
    });
  } catch (err) {
    next(err);
  }
}

