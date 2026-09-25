export type TripType = 'friends' | 'college' | 'vacation';
export type LuggageType = 'light' | 'medium' | 'heavy';
export type TransportMode = 'bus' | 'train' | 'bike' | 'car' | 'flight' | 'ai';

export interface PlanRequest {
  tripType: TripType;
  origin: string;
  destination: string;
  days: number;
  travellers: number;
  luggage: LuggageType;
  budget: number;
  transportMode: TransportMode;
}

export interface RouteHop {
  from: string;
  to: string;
  state: string;
  km: number;
  hours: number;
  note?: string;
}

export interface CostItem {
  item: string;
  min: number;
  max: number;
}

export interface CostRange {
  min: number;
  max: number;
}

export interface DayPlanItem {
  day: number;
  title: string;
  details: string;
}

export interface PlanResponse {
  tripId: string;
  summary: string;
  modeRecommendation: {
    chosen: string;
    reason: string;
  };
  route: RouteHop[];
  costs: CostItem[];
  totalCost: CostRange;
  perPersonCost: CostRange;
  dayPlan: DayPlanItem[];
  checklist: string[];
  tips: string[];
  shareId?: string;
  createdAt?: string;
  request?: PlanRequest;
}

export interface SavedTrip {
  id: string;
  savedAt: string;
  plan: PlanResponse;
  checkedItems?: string[];
}
