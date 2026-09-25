import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    // In test environment we can allow fallback or mock, but in dev/prod we fail fast
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[FATAL] Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }
}

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: process.env.MONGO_URI || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || 'test_jwt_secret_fallback_for_testing_purposes_only_64_characters_min',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  BREVO_API_KEY: process.env.BREVO_API_KEY || process.env.BREVO_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Safar <noreply@safar.app>',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
};

