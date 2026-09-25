import { z } from 'zod';

export const planRequestSchema = z
  .object({
    tripType: z.enum(['friends', 'college', 'vacation'], {
      errorMap: () => ({ message: "tripType must be one of: 'friends', 'college', 'vacation'" }),
    }),
    origin: z
      .string()
      .trim()
      .min(2, { message: 'Origin must be at least 2 characters' })
      .max(50, { message: 'Origin cannot exceed 50 characters' }),
    destination: z
      .string()
      .trim()
      .min(2, { message: 'Destination must be at least 2 characters' })
      .max(50, { message: 'Destination cannot exceed 50 characters' }),
    days: z
      .number({ invalid_type_error: 'Days must be a number' })
      .int({ message: 'Days must be an integer' })
      .min(1, { message: 'Days must be between 1 and 30' })
      .max(30, { message: 'Days must be between 1 and 30' }),
    travellers: z
      .number({ invalid_type_error: 'Travellers must be a number' })
      .int({ message: 'Travellers must be an integer' })
      .min(1, { message: 'Travellers must be between 1 and 20' })
      .max(20, { message: 'Travellers must be between 1 and 20' }),
    luggage: z.enum(['light', 'medium', 'heavy'], {
      errorMap: () => ({ message: "Luggage must be one of: 'light', 'medium', 'heavy'" }),
    }),
    budget: z
      .number({ invalid_type_error: 'Budget must be a number' })
      .int({ message: 'Budget must be an integer' })
      .min(500, { message: 'Budget must be between 500 and 100000' })
      .max(100000, { message: 'Budget must be between 500 and 100000' }),
    transportMode: z.enum(['bus', 'train', 'bike', 'car', 'flight', 'ai'], {
      errorMap: () => ({
        message: "transportMode must be one of: 'bus', 'train', 'bike', 'car', 'flight', 'ai'",
      }),
    }),
  })
  .refine((data) => data.origin.toLowerCase() !== data.destination.toLowerCase(), {
    message: 'Origin and destination cannot be the same',
    path: ['destination'],
  });
