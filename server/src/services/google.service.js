import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';

/**
 * Verifies a Google ID token (credential) and returns the authenticated user payload.
 *
 * @param {string} credential - ID token sent from the frontend Google Login flow
 * @returns {Promise<{ sub: string, email: string, name: string, picture: string }>}
 */
export async function verifyGoogleToken(credential) {
  const clientId = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const error = new Error('GOOGLE_CLIENT_ID is not configured on the server');
    error.code = 'CONFIG_ERROR';
    throw error;
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      const error = new Error('Invalid Google token payload');
      error.code = 'INVALID_GOOGLE_TOKEN';
      throw error;
    }

    return {
      sub: payload.sub,
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || null,
    };
  } catch (err) {
    if (err.code === 'CONFIG_ERROR') throw err;
    const error = new Error('Google token verification failed');
    error.code = 'INVALID_GOOGLE_TOKEN';
    throw error;
  }
}
