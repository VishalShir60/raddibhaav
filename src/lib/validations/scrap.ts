import { z } from 'zod';

// Category item input schema
export const scrapItemSchema = z.object({
  category_slug: z.string().min(1, 'Category is required'),
  approx_weight_kg: z.number().min(0.5, 'Minimum weight is 0.5 kg').max(5000, 'Weight exceeds limit'),
});

// Seller scrap listing creation schema
export const createListingSchema = z.object({
  title: z.string().min(3, 'Title is too short').max(100, 'Title is too long'),
  address: z.string().min(8, 'Please provide detailed building/street address').max(250),
  city: z.string().min(2, 'City is required').max(50),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit Indian PIN code'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  preferred_time_slot: z.enum(['Morning', 'Afternoon', 'Evening', 'Weekend']),
  bid_window_hours: z.enum(['2', '6', '24']),
  photos: z.array(z.string()).min(1, 'At least 1 photo of your scrap is required for dealer bidding').max(6, 'Maximum 6 photos allowed'),
  items: z.array(scrapItemSchema).min(1, 'Please select at least one scrap category'),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

// Dealer bid submission schema
export const createBidSchema = z.object({
  listing_id: z.string().uuid('Invalid listing ID'),
  rate_breakdown: z.record(
    z.string(),
    z.number().min(1, 'Rate must be at least ₹1/kg').max(2000, 'Rate exceeds allowed limit')
  ),
  pickup_date: z.string().min(10, 'Valid date required (YYYY-MM-DD)'),
  pickup_slot: z.string().min(3, 'Pickup slot required'),
  eta_minutes: z.number().int().min(15).max(480),
  notes: z.string().max(200).optional(),
});

export type CreateBidInput = z.infer<typeof createBidSchema>;

// Doorstep final weigh-in & settlement schema
export const finalWeighinSchema = z.object({
  pickup_id: z.string().uuid('Invalid pickup ID'),
  otp_code: z.string().regex(/^[0-9]{4}$/, 'Enter the 4-digit verification code from seller'),
  payment_method: z.enum(['cash', 'upi']),
  final_weights: z.record(
    z.string(),
    z.number().min(0.1, 'Weight must be at least 0.1 kg').max(5000)
  ),
});

export type FinalWeighinInput = z.infer<typeof finalWeighinSchema>;

// Phone auth schema (Indian 10-digit mobile)
export const phoneAuthSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
});

export const otpVerifySchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  otp: z.string().regex(/^[0-9]{6}$/, 'Enter 6-digit OTP code'),
  role: z.enum(['seller', 'dealer']),
  name: z.string().min(2, 'Name is required').max(60),
});

// Seller Rating schema
export const reviewDealerSchema = z.object({
  pickup_id: z.string().uuid('Invalid pickup ID'),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(300).optional(),
});
