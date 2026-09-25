import { nanoid } from 'nanoid';
import { Trip } from '../models/Trip.js';

function formatTripResponse(doc) {
  if (!doc) return null;
  const plan = doc.plan?.toObject ? doc.plan.toObject() : doc.plan;
  return {
    tripId: doc._id.toString(),
    summary: plan.summary,
    modeRecommendation: plan.modeRecommendation,
    route: plan.route,
    costs: plan.costs,
    totalCost: plan.totalCost,
    perPersonCost: plan.perPersonCost,
    dayPlan: plan.dayPlan,
    checklist: plan.checklist,
    tips: plan.tips,
    shareId: doc.shareId,
    userId: doc.userId ? doc.userId.toString() : null,
    form: doc.form,
    createdAt: doc.createdAt,
  };
}

export async function createTrip(form, plan, userId = null) {
  // If user is authenticated, check for an identical trip created in the last 5 minutes (retry / re-run deduplication)
  if (userId) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentDuplicate = await Trip.findOne({
      userId,
      'form.origin': form.origin,
      'form.destination': form.destination,
      'form.days': form.days,
      'form.travellers': form.travellers,
      'form.budget': form.budget,
      createdAt: { $gte: fiveMinutesAgo },
    }).sort({ createdAt: -1 });

    if (recentDuplicate) {
      recentDuplicate.plan = plan;
      recentDuplicate.form = form;
      const updated = await recentDuplicate.save();
      return formatTripResponse(updated);
    }
  }

  // Generate 8-character unique shareId
  const shareId = nanoid(8);
  const trip = new Trip({
    form,
    plan,
    shareId,
    userId: userId || null,
  });
  const saved = await trip.save();
  return formatTripResponse(saved);
}

export async function deleteTripForUser(id, userId = null) {
  const trip = await Trip.findById(id);
  if (!trip) return false;

  // If trip belongs to a user, enforce ownership
  if (trip.userId) {
    const tripUserId = trip.userId.toString();
    const currentUserId = userId ? (userId._id || userId.id || userId).toString() : null;
    if (!currentUserId || tripUserId !== currentUserId) {
      const err = new Error('Access denied: this trip belongs to another user');
      err.code = 'FORBIDDEN';
      throw err;
    }
  }

  // Delete directly from MongoDB
  await Trip.findByIdAndDelete(id);
  return true;
}

export async function findTripById(id) {
  const trip = await Trip.findById(id);
  if (!trip) return null;
  return formatTripResponse(trip);
}

export async function findTripByShareId(shareId) {
  const trip = await Trip.findOne({ shareId });
  if (!trip) return null;
  return formatTripResponse(trip);
}

export async function findUserTrips(userId) {
  const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
  return trips.map((doc) => ({
    tripId: doc._id.toString(),
    destination: doc.form?.destination || '',
    tripType: doc.form?.tripType || '',
    transportMode: doc.form?.transportMode || '',
    perPersonCost: doc.plan?.perPersonCost || null,
    shareId: doc.shareId,
    createdAt: doc.createdAt,
  }));
}

export async function updateTripWithNewPlan(id, newPlan) {
  const trip = await Trip.findById(id);
  if (!trip) return null;

  trip.plan = newPlan;
  const saved = await trip.save();
  return formatTripResponse(saved);
}

export async function saveTripForUser(id, userId) {
  const trip = await Trip.findById(id);
  if (!trip) return null;

  trip.userId = userId;
  const saved = await trip.save();
  return formatTripResponse(saved);
}
