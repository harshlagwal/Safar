import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  form: {
    tripType: {
      type: String,
      enum: ['friends', 'college', 'vacation'],
      required: true,
    },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    days: { type: Number, required: true },
    travellers: { type: Number, required: true },
    luggage: {
      type: String,
      enum: ['light', 'medium', 'heavy'],
      required: true,
    },
    budget: { type: Number, required: true },
    transportMode: {
      type: String,
      enum: ['bus', 'train', 'bike', 'car', 'flight', 'ai'],
      required: true,
    },
  },
  plan: {
    summary: { type: String, required: true },
    modeRecommendation: {
      chosen: { type: String, required: true },
      reason: { type: String, required: true },
    },
    route: [
      {
        from: String,
        to: String,
        state: String,
        km: Number,
        hours: Number,
        note: String,
      },
    ],
    costs: [
      {
        item: String,
        min: Number,
        max: Number,
      },
    ],
    totalCost: {
      min: Number,
      max: Number,
    },
    perPersonCost: {
      min: Number,
      max: Number,
    },
    dayPlan: [
      {
        day: Number,
        title: String,
        details: String,
      },
    ],
    checklist: [String],
    tips: [String],
  },
  shareId: {
    type: String,
    unique: true,
    index: true,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

tripSchema.index({ userId: 1, createdAt: -1 });

export const Trip = mongoose.model('Trip', tripSchema);

