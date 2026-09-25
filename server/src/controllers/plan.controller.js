import { planRequestSchema } from '../validators/plan.schema.js';
import { generatePlanWithGemini } from '../services/gemini.service.js';
import { createTrip } from '../services/trip.service.js';

export async function createPlan(req, res, next) {
  try {
    // 1. Zod validate incoming request body
    const validatedBody = planRequestSchema.parse(req.body);

    // 2. Extract client-provided Gemini or OpenRouter API key if present
    const apiKey = req.headers['x-gemini-api-key'] || req.headers['x-gemini-key'] || req.query.apiKey || null;
    const openRouterKey = req.headers['x-openrouter-api-key'] || req.headers['x-openrouter-key'] || null;

    // 3. Call Gemini service (handles prompt building, timeout, retry, OpenRouter failover & schema validation)
    const aiPlan = await generatePlanWithGemini(validatedBody, { apiKey, openRouterKey });

    // 3. Sanity guard: perPersonCost.max should reasonably fit within budget
    if (aiPlan.perPersonCost?.max && aiPlan.perPersonCost.max > validatedBody.budget) {
      console.warn(
        `[SanityGuard] AI perPersonCost.max (${aiPlan.perPersonCost.max}) exceeded user budget (${validatedBody.budget}).`
      );
    }

    // 4. Save to MongoDB via trip.service (attaching optional userId and generating shareId)
    const userId = req.user?._id || req.user?.id || null;
    const savedTrip = await createTrip(validatedBody, aiPlan, userId);

    // 5. Respond with 200 matching exact frontend contract
    return res.status(200).json(savedTrip);
  } catch (err) {
    next(err);
  }
}
