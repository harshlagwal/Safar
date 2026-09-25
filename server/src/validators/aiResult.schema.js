import { z } from 'zod';

const costPairSchema = z
  .object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
  })
  .refine((data) => data.min <= data.max, {
    message: 'min cost must be less than or equal to max cost',
  });

const costItemSchema = z
  .object({
    item: z.string().min(1),
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
  })
  .refine((data) => data.min <= data.max, {
    message: 'min cost must be less than or equal to max cost',
  });

const routeHopSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  state: z.string().min(1),
  km: z.number().positive(),
  hours: z.number().positive(),
  note: z.string().default(''),
});

const dayPlanItemSchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1),
  details: z.string().min(1),
});

export const aiResultSchema = z.object({
  summary: z.string().min(5),
  modeRecommendation: z.object({
    chosen: z.string().min(1),
    reason: z.string().min(5),
  }),
  route: z.array(routeHopSchema).min(1),
  costs: z.array(costItemSchema).min(1),
  totalCost: costPairSchema,
  perPersonCost: costPairSchema,
  dayPlan: z.array(dayPlanItemSchema).min(1),
  checklist: z.array(z.string().min(1)).min(1),
  tips: z.array(z.string().min(1)).min(1),
});
