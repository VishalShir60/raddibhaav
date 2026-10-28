import type { 
  ScrapCategory, 
  ScrapListing, 
  DealerBid, 
  PickupOrder, 
  DealerLedgerEntry,
  DealerProfile,
  KycStatus,
  AdminDealerUser,
  AdminSellerUser,
  AdminDisputeRecord,
  PlatformSettings,
  AdminMetrics
} from '../types/database.ts';

export const INITIAL_CATEGORIES: ScrapCategory[] = [
  {
    id: 'cat_newspaper',
    slug: 'newspaper',
    name_en: 'Newspaper (Raddi)',
    name_hi: 'अखबार (रद्दी)',
    name_mr: 'वर्तमानपत्र (रद्दी)',
    icon: 'newspaper',
    unit: 'kg',
    benchmark_price_min: 14.0,
    benchmark_price_max: 16.5,
    trend: 'up',
    display_order: 1,
  },
  {
    id: 'cat_cardboard',
    slug: 'cardboard',
    name_en: 'Cardboard (Gatta)',
    name_hi: 'गत्ता (कार्टन)',
    name_mr: 'पुठ्ठा (कार्टन)',
    icon: 'package',
    unit: 'kg',
    benchmark_price_min: 10.0,
    benchmark_price_max: 12.0,
    trend: 'stable',
    display_order: 2,
  },
  {
    id: 'cat_iron',
    slug: 'iron',
    name_en: 'Iron & Steel (Loha)',
    name_hi: 'लोहा और स्टील',
    name_mr: 'लोखंड आणि पोलाद',
    icon: 'hammer',
    unit: 'kg',
    benchmark_price_min: 28.0,
    benchmark_price_max: 32.0,
    trend: 'up',
    display_order: 3,
  },
  {
    id: 'cat_plastic',
    slug: 'plastic',
    name_en: 'Plastic (Bottles/Containers)',
    name_hi: 'प्लास्टिक',
    name_mr: 'प्लास्टिक',
    icon: 'trash-2',
    unit: 'kg',
    benchmark_price_min: 12.0,
    benchmark_price_max: 18.0,
    trend: 'stable',
    display_order: 4,
  },
  {
    id: 'cat_brass',
    slug: 'brass',
    name_en: 'Brass (Peetal)',
    name_hi: 'पीतल',
    name_mr: 'पितळ',
    icon: 'sparkles',
    unit: 'kg',
    benchmark_price_min: 320.0,
    benchmark_price_max: 350.0,
    trend: 'up',
    display_order: 5,
  },
  {
    id: 'cat_copper',
    slug: 'copper',
    name_en: 'Copper (Taamba)',
    name_hi: 'तांबा',
    name_mr: 'तांबे',
    icon: 'zap',
    unit: 'kg',
    benchmark_price_min: 650.0,
    benchmark_price_max: 720.0,
    trend: 'up',
    display_order: 6,
  },
  {
    id: 'cat_ewaste',
    slug: 'ewaste',
    name_en: 'Electronic Waste (E-Waste)',
    name_hi: 'ई-वेस्ट',
    name_mr: 'ई-कचरा',
    icon: 'cpu',
    unit: 'kg',
    benchmark_price_min: 40.0,
    benchmark_price_max: 120.0,
    trend: 'stable',
    display_order: 7,
  },
  {
    id: 'cat_appliances',
    slug: 'appliances',
    name_en: 'Old Appliances (AC/Fridge)',
    name_hi: 'पुराने उपकरण',
    name_mr: 'जुनी उपकरणे',
    icon: 'refrigerator',
    unit: 'pc',
    benchmark_price_min: 800.0,
    benchmark_price_max: 4500.0,
    trend: 'stable',
    display_order: 8,
  },
];

export const INITIAL_DEALERS: DealerProfile[] = [
  {
    dealer_id: 'dealer-1',
    business_name: 'Shree Ganesh Scrap Traders',
    is_verified: true,
    rating: 4.9,
    total_orders: 412,
    radius_km: 7.5,
    upi_id: 'shreeganesh@upi',
    scale_certified: true,
    created_at: new Date().toISOString(),
  },
  {
    dealer_id: 'dealer-2',
    business_name: 'Gupta Brothers Metal & Raddi',
    is_verified: true,
    rating: 4.8,
    total_orders: 289,
    radius_km: 5.0,
    upi_id: 'guptabrothers@okaxis',
    scale_certified: true,
    created_at: new Date().toISOString(),
  },
  {
    dealer_id: 'dealer-3',
    business_name: 'Maharashtra Green Eco-Recyclers',
    is_verified: true,
    rating: 4.95,
    total_orders: 630,
    radius_km: 12.0,
    upi_id: 'ecogreen@paytm',
    scale_certified: true,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_LISTINGS: ScrapListing[] = [
  {
    id: 'listing-demo-1',
    seller_id: 'seller-demo-1',
    title: 'Monthly Household Raddi + Iron Grills',
    status: 'open_for_bids',
    address: 'B-302, Gokul Heights, Ranade Road, Dadar West',
    city: 'Mumbai',
    pincode: '400028',
    latitude: 19.0213,
    longitude: 72.8424,
    preferred_time_slot: 'Morning (9:00 AM - 12:00 PM)',
    bid_window_expires_at: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
    photos: [
      'https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
    ],
    total_approx_weight_kg: 48,
    items: [
      {
        id: 'item-1',
        listing_id: 'listing-demo-1',
        category_slug: 'newspaper',
        approx_weight_kg: 25,
      },
      {
        id: 'item-2',
        listing_id: 'listing-demo-1',
        category_slug: 'cardboard',
        approx_weight_kg: 15,
      },
      {
        id: 'item-3',
        listing_id: 'listing-demo-1',
        category_slug: 'iron',
        approx_weight_kg: 8,
      },
    ],
    bids_count: 3,
    highest_bid: 810,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'listing-demo-2',
    seller_id: 'seller-demo-2',
    title: 'Office Shifting: Old CPU Cabinets, Plastic & Paper',
    status: 'open_for_bids',
    address: 'Flat 12, Sahakar Niwas, Near Kothrud Bus Depot',
    city: 'Pune',
    pincode: '411038',
    latitude: 18.5074,
    longitude: 73.8077,
    preferred_time_slot: 'Afternoon (12:00 PM - 4:00 PM)',
    bid_window_expires_at: new Date(Date.now() + 5.2 * 3600 * 1000).toISOString(),
    photos: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
    ],
    total_approx_weight_kg: 72,
    items: [
      {
        id: 'item-4',
        listing_id: 'listing-demo-2',
        category_slug: 'ewaste',
        approx_weight_kg: 30,
      },
      {
        id: 'item-5',
        listing_id: 'listing-demo-2',
        category_slug: 'plastic',
        approx_weight_kg: 22,
      },
      {
        id: 'item-6',
        listing_id: 'listing-demo-2',
        category_slug: 'cardboard',
        approx_weight_kg: 20,
      },
    ],
    bids_count: 2,
    highest_bid: 3650,
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: 'listing-demo-3',
    seller_id: 'seller-demo-1',
    title: 'Newspapers & Cardboard Carton Boxes',
    status: 'bid_accepted',
    address: 'A-102, Shanti Vihar, Nashik Road',
    city: 'Nashik',
    pincode: '422101',
    latitude: 19.9538,
    longitude: 73.8347,
    preferred_time_slot: 'Morning (9:00 AM - 12:00 PM)',
    bid_window_expires_at: new Date(Date.now() - 3600 * 1000).toISOString(),
    photos: [
      'https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?w=600&auto=format&fit=crop&q=80',
    ],
    total_approx_weight_kg: 35,
    items: [
      { id: 'item-7', listing_id: 'listing-demo-3', category_slug: 'newspaper', approx_weight_kg: 20 },
      { id: 'item-8', listing_id: 'listing-demo-3', category_slug: 'cardboard', approx_weight_kg: 15 },
    ],
    bids_count: 2,
    highest_bid: 645,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'listing-demo-4',
    seller_id: 'seller-demo-1',
    title: 'Old Brass Vessels & Scrap Iron Rods',
    status: 'completed',
    address: 'Flat 501, Royal Enclave, College Road',
    city: 'Nashik',
    pincode: '422005',
    latitude: 19.9975,
    longitude: 73.7898,
    preferred_time_slot: 'Afternoon (12:00 PM - 4:00 PM)',
    bid_window_expires_at: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
    photos: [
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
    ],
    total_approx_weight_kg: 24,
    items: [
      { id: 'item-9', listing_id: 'listing-demo-4', category_slug: 'brass', approx_weight_kg: 4 },
      { id: 'item-10', listing_id: 'listing-demo-4', category_slug: 'iron', approx_weight_kg: 20 },
    ],
    bids_count: 3,
    highest_bid: 1980,
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_BIDS: DealerBid[] = [
  {
    id: 'bid-1',
    listing_id: 'listing-demo-1',
    dealer_id: 'dealer-1',
    dealer_name: 'Shree Ganesh Scrap Traders',
    dealer_rating: 4.9,
    dealer_distance_km: 1.2,
    total_estimated_amount: 810,
    rate_breakdown: {
      newspaper: 16.5,
      cardboard: 11.5,
      iron: 30.0,
    },
    pickup_date: new Date().toISOString().split('T')[0],
    pickup_slot: 'Morning (10:00 AM)',
    eta_minutes: 25,
    notes: 'Certified ISO digital scale. Immediate GooglePay or Cash on the spot.',
    status: 'submitted',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'bid-2',
    listing_id: 'listing-demo-1',
    dealer_id: 'dealer-2',
    dealer_name: 'Gupta Brothers Metal & Raddi',
    dealer_rating: 4.8,
    dealer_distance_km: 2.4,
    total_estimated_amount: 785,
    rate_breakdown: {
      newspaper: 16.0,
      cardboard: 11.0,
      iron: 28.0,
    },
    pickup_date: new Date().toISOString().split('T')[0],
    pickup_slot: 'Morning (11:00 AM)',
    eta_minutes: 40,
    notes: 'Same-day pickup guaranteed. We carry heavy bags and helper staff.',
    status: 'submitted',
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'bid-3',
    listing_id: 'listing-demo-1',
    dealer_id: 'dealer-3',
    dealer_name: 'Maharashtra Green Eco-Recyclers',
    dealer_rating: 4.95,
    dealer_distance_km: 3.8,
    total_estimated_amount: 795,
    rate_breakdown: {
      newspaper: 16.2,
      cardboard: 11.0,
      iron: 29.0,
    },
    pickup_date: new Date().toISOString().split('T')[0],
    pickup_slot: 'Afternoon (1:00 PM)',
    eta_minutes: 60,
    notes: 'Zero carbon doorstep electric van. Instant payment receipt.',
    status: 'submitted',
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'bid-accepted-3',
    listing_id: 'listing-demo-3',
    dealer_id: 'dealer-1',
    dealer_name: 'Shree Ganesh Scrap Traders',
    dealer_rating: 4.9,
    dealer_distance_km: 1.5,
    total_estimated_amount: 645,
    rate_breakdown: { newspaper: 16.5, cardboard: 11.5 },
    pickup_date: new Date().toISOString().split('T')[0],
    pickup_slot: 'Morning (10:30 AM)',
    eta_minutes: 0,
    notes: 'Arrived at your doorstep with certified electronic scale.',
    status: 'accepted',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'bid-completed-4',
    listing_id: 'listing-demo-4',
    dealer_id: 'dealer-2',
    dealer_name: 'Gupta Brothers Metal & Raddi',
    dealer_rating: 4.8,
    dealer_distance_km: 2.1,
    total_estimated_amount: 1980,
    rate_breakdown: { brass: 345.0, iron: 30.0 },
    pickup_date: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
    pickup_slot: 'Afternoon (2:00 PM)',
    eta_minutes: 0,
    notes: 'Paid via GooglePay UPI directly.',
    status: 'accepted',
    created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_PICKUPS: PickupOrder[] = [
  {
    id: 'pickup-demo-3',
    listing_id: 'listing-demo-3',
    bid_id: 'bid-accepted-3',
    seller_id: 'seller-demo-1',
    dealer_id: 'dealer-1',
    dealer_name: 'Shree Ganesh Scrap Traders',
    dealer_phone: '+91 98201 54321',
    status: 'weighing',
    scheduled_at: 'Today, 10:30 AM',
    final_weight_kg: 36.2,
    final_total_amount: 645,
    otp_code: '4829',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pickup-demo-4',
    listing_id: 'listing-demo-4',
    bid_id: 'bid-completed-4',
    seller_id: 'seller-demo-1',
    dealer_id: 'dealer-2',
    dealer_name: 'Gupta Brothers Metal & Raddi',
    dealer_phone: '+91 98334 11223',
    status: 'completed',
    scheduled_at: 'Yesterday, 2:00 PM',
    completed_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    payment_method: 'upi',
    final_weight_kg: 24.5,
    final_total_amount: 1980,
    otp_code: '9173',
    seller_rating: 5,
    seller_feedback: 'Prompt arrival, accurate electronic weighing scale and paid immediately on GPay.',
    created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_LEDGER: DealerLedgerEntry[] = [
  {
    id: 'ledger-1',
    dealer_id: 'dealer-1',
    pickup_id: 'pickup-old-1',
    deal_amount: 1450,
    commission_rate: 0.05,
    commission_amount: 72.5,
    status: 'waived_in_mvp',
    notes: 'MVP Launch Offer: 100% Platform Fee Waived',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ledger-2',
    dealer_id: 'dealer-1',
    pickup_id: 'pickup-old-2',
    deal_amount: 980,
    commission_rate: 0.05,
    commission_amount: 49.0,
    status: 'waived_in_mvp',
    notes: 'MVP Launch Offer: 100% Platform Fee Waived',
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
];

export interface MockDispute {
  id: string;
  pickup_id: string;
  reason: string;
  raised_by: string;
  status: 'open' | 'investigating' | 'resolved';
  created_at: string;
}

export interface MockRating {
  id: string;
  pickup_id: string;
  from_role?: 'seller' | 'dealer';
  stars: number;
  reason?: string;
  comment?: string;
  created_at: string;
}

export const INITIAL_RATINGS: MockRating[] = [
  {
    id: 'rating-1',
    pickup_id: 'pickup-demo-4',
    stars: 5,
    comment: 'Prompt arrival, accurate electronic weighing scale and paid immediately on GPay.',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rating-2',
    pickup_id: 'pickup-old-1',
    stars: 5,
    comment: 'Very polite kabadiwala. Cleaned up the area after lifting old iron grills.',
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rating-3',
    pickup_id: 'pickup-old-2',
    stars: 4,
    comment: 'Gave good rates for carton boxes. Arrived on time with digital balance.',
    created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_ADMIN_DEALERS: AdminDealerUser[] = [
  {
    dealer_id: 'dealer-1',
    business_name: 'Shree Ganesh Scrap Traders',
    owner_name: 'Ramesh Ganesh Gupta',
    phone: '+91 98201 54321',
    city: 'Mumbai',
    address: 'Shop 12, Kabadi Galli, Dadar Market, Mumbai 400028',
    is_verified: true,
    kyc_status: 'approved',
    kyc_documents: [
      { doc_type: 'aadhaar', title: 'Aadhaar Card (Verified)', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', uploaded_at: '2026-09-15' },
      { doc_type: 'shop_photo', title: 'Shop Front & Scale Photo', url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80', uploaded_at: '2026-09-15' },
      { doc_type: 'trade_license', title: 'BMC Shop & Establishment License', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80', uploaded_at: '2026-09-15' }
    ],
    is_suspended: false,
    rating: 4.9,
    total_orders: 412,
    radius_km: 7.5,
    upi_id: 'shreeganesh@upi',
    scale_certified: true,
    created_at: '2026-08-10T09:00:00Z',
  },
  {
    dealer_id: 'dealer-2',
    business_name: 'Gupta Brothers Metal & Raddi',
    owner_name: 'Suresh Kumar Gupta',
    phone: '+91 98334 11223',
    city: 'Mumbai',
    address: 'Gala 4, Kurla Industrial Estate, Kurla West, Mumbai 400070',
    is_verified: true,
    kyc_status: 'approved',
    kyc_documents: [
      { doc_type: 'aadhaar', title: 'Aadhaar Card (Verified)', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', uploaded_at: '2026-09-20' },
      { doc_type: 'shop_photo', title: 'Shop Front Photo', url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80', uploaded_at: '2026-09-20' }
    ],
    is_suspended: false,
    rating: 4.8,
    total_orders: 289,
    radius_km: 5.0,
    upi_id: 'guptabrothers@okaxis',
    scale_certified: true,
    created_at: '2026-08-25T11:00:00Z',
  },
  {
    dealer_id: 'dealer-kyc-pending-1',
    business_name: 'Om Sai Eco Scrap Mart',
    owner_name: 'Sunil Mahadev Patil',
    phone: '+91 98199 88776',
    city: 'Thane',
    address: 'Opposite Teen Hath Naka, LBS Marg, Thane West 400602',
    is_verified: false,
    kyc_status: 'pending',
    kyc_documents: [
      { doc_type: 'aadhaar', title: 'Aadhaar Card (Pending Review)', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', uploaded_at: '2026-10-26' },
      { doc_type: 'shop_photo', title: 'Digital Scale & Shop Photo', url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80', uploaded_at: '2026-10-26' },
      { doc_type: 'trade_license', title: 'Thane Municipal Corporation Registration', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80', uploaded_at: '2026-10-26' }
    ],
    is_suspended: false,
    rating: 0,
    total_orders: 0,
    radius_km: 6.0,
    upi_id: 'omsaiecothane@upi',
    scale_certified: true,
    created_at: '2026-10-26T14:30:00Z',
  },
  {
    dealer_id: 'dealer-kyc-rejected-1',
    business_name: 'Quick Cash Kabadi',
    owner_name: 'Vikram Joshi',
    phone: '+91 97654 32109',
    city: 'Pune',
    address: 'Kothrud Depot Road, Pune 411038',
    is_verified: false,
    kyc_status: 'rejected',
    kyc_rejection_reason: 'Aadhaar photo blurred; shop address does not match municipal electricity bill.',
    kyc_documents: [
      { doc_type: 'aadhaar', title: 'Aadhaar Card (Low Resolution)', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', uploaded_at: '2026-10-22' }
    ],
    is_suspended: false,
    rating: 0,
    total_orders: 0,
    radius_km: 4.0,
    upi_id: 'quickcash@paytm',
    scale_certified: false,
    created_at: '2026-10-22T08:15:00Z',
  },
  {
    dealer_id: 'dealer-suspended-1',
    business_name: 'Bandra Metal & Scrap Syndicate',
    owner_name: 'Aslam Sheikh',
    phone: '+91 98222 33445',
    city: 'Mumbai',
    address: 'Plot 44, Near Bandra Station West, Mumbai 400050',
    is_verified: true,
    kyc_status: 'approved',
    kyc_documents: [
      { doc_type: 'aadhaar', title: 'Aadhaar Card', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', uploaded_at: '2026-07-10' }
    ],
    is_suspended: true,
    suspension_reason: 'Multiple verified seller complaints: Attempted lowball payment and dispute of digital scale readings.',
    rating: 3.4,
    total_orders: 54,
    radius_km: 8.0,
    upi_id: 'bandrascrap@upi',
    scale_certified: false,
    created_at: '2026-07-10T10:00:00Z',
  }
];

export const INITIAL_ADMIN_SELLERS: AdminSellerUser[] = [
  {
    seller_id: 'seller-demo-1',
    name: 'Anjali Sharma',
    phone: '+91 98765 00000',
    city: 'Mumbai',
    address: 'B-302, Gokul Heights, Ranade Road, Dadar West',
    total_listings: 6,
    completed_pickups: 5,
    is_suspended: false,
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    seller_id: 'seller-demo-2',
    name: 'Vikramaditya Deshmukh',
    phone: '+91 98200 44556',
    city: 'Pune',
    address: 'Flat 404, Sahyadri Towers, Kothrud, Pune',
    total_listings: 3,
    completed_pickups: 2,
    is_suspended: false,
    created_at: '2026-09-12T12:00:00Z',
  },
  {
    seller_id: 'seller-suspended-1',
    name: 'Rajesh Kulkarni',
    phone: '+91 98111 77889',
    city: 'Mumbai',
    address: 'Bandra Reclamation, Mumbai',
    total_listings: 4,
    completed_pickups: 0,
    is_suspended: true,
    suspension_reason: 'Flagged for creating fake scrap requests and cancelling 4 times after dealers travelled to doorstep.',
    created_at: '2026-09-28T16:00:00Z',
  }
];

export const INITIAL_ADMIN_DISPUTES: AdminDisputeRecord[] = [
  {
    id: 'dispute-admin-1',
    pickup_id: 'pickup-demo-3',
    listing_id: 'listing-demo-3',
    seller_name: 'Anjali Sharma',
    seller_phone: '+91 98765 00000',
    dealer_name: 'Shree Ganesh Scrap Traders',
    dealer_phone: '+91 98201 54321',
    category: 'lowball_payment',
    reason: 'Dealer paid ₹300, which is less than the rate-card calculated ₹502.50 (shortfall of ₹202.50). Anti-lowball protection initiated.',
    expected_amount: 502.50,
    actual_paid_amount: 300.00,
    shortfall: 202.50,
    status: 'open',
    evidence_photos: [
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=600&auto=format&fit=crop&q=80'
    ],
    chat_notes: [
      { author: 'System Bot', role: 'admin', message: 'Automated anti-lowball dispute opened. Rate card payout calculation exceeded paid amount by ₹202.50.', timestamp: '2026-10-27T12:07:43Z' },
      { author: 'Anjali Sharma', role: 'seller', message: 'The dealer agreed to ₹16.50/kg for 20kg newspaper and ₹11.50/kg for 15kg cardboard, but only transferred ₹300 citing wet paper.', timestamp: '2026-10-27T12:15:00Z' },
      { author: 'Ramesh Gupta', role: 'dealer', message: 'The paper was damp due to morning rains, so I deducted moisture weight.', timestamp: '2026-10-27T12:22:00Z' }
    ],
    created_at: '2026-10-27T12:07:43Z',
  },
  {
    id: 'dispute-admin-2',
    pickup_id: 'pickup-demo-old-1',
    listing_id: 'listing-demo-1',
    seller_name: 'Pooja Verma',
    seller_phone: '+91 98333 11224',
    dealer_name: 'Gupta Brothers Metal & Raddi',
    dealer_phone: '+91 98334 11223',
    category: 'weight_mismatch',
    reason: 'Dispute over iron grills scale tare weight. Difference > 15% (Seller estimated 45 kg, dealer reported 30 kg).',
    expected_amount: 1440.00,
    actual_paid_amount: 960.00,
    shortfall: 480.00,
    status: 'investigating',
    evidence_photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80'
    ],
    chat_notes: [
      { author: 'Pooja Verma', role: 'seller', message: 'I weighed these grills on our society scale and it was 45 kg. Dealer scale read only 30 kg.', timestamp: '2026-10-25T14:30:00Z' },
      { author: 'Admin Support', role: 'admin', message: 'Requested certificate of dealer digital scale calibration.', timestamp: '2026-10-25T15:00:00Z' }
    ],
    created_at: '2026-10-25T14:30:00Z',
  },
  {
    id: 'dispute-admin-3',
    pickup_id: 'pickup-resolved-1',
    listing_id: 'listing-resolved-1',
    seller_name: 'Kunal Patil',
    seller_phone: '+91 98200 88990',
    dealer_name: 'Maharashtra Green Eco-Recyclers',
    dealer_phone: '+91 98201 54321',
    category: 'lowball_payment',
    reason: 'UPI payment failure at doorstep caused temporary shortfall of ₹140.',
    expected_amount: 840.00,
    actual_paid_amount: 700.00,
    shortfall: 140.00,
    status: 'resolved',
    evidence_photos: [],
    chat_notes: [
      { author: 'Kunal Patil', role: 'seller', message: 'Dealer said ₹140 was pending due to server timeout.', timestamp: '2026-10-20T10:00:00Z' },
      { author: 'Admin Support', role: 'admin', message: 'Verified second UPI transaction of ₹140 processed successfully.', timestamp: '2026-10-20T11:30:00Z' }
    ],
    resolution_outcome: 'Dealer completed secondary UPI transfer of ₹140. Matter settled satisfactorily.',
    resolution_notes: 'Transaction UTR: 32901928301 verified by platform.',
    created_at: '2026-10-20T10:00:00Z',
    resolved_at: '2026-10-20T11:45:00Z',
  }
];

export const INITIAL_CITY_RATE_CARDS: Record<string, ScrapCategory[]> = {
  'Mumbai': INITIAL_CATEGORIES,
  'Pune': INITIAL_CATEGORIES.map((c) => ({
    ...c,
    benchmark_price_min: Math.round(c.benchmark_price_min * 0.95 * 10) / 10,
    benchmark_price_max: Math.round(c.benchmark_price_max * 0.95 * 10) / 10,
  })),
  'Thane': INITIAL_CATEGORIES,
  'Navi Mumbai': INITIAL_CATEGORIES,
  'Delhi NCR': INITIAL_CATEGORIES.map((c) => ({
    ...c,
    benchmark_price_min: Math.round(c.benchmark_price_min * 1.05 * 10) / 10,
    benchmark_price_max: Math.round(c.benchmark_price_max * 1.05 * 10) / 10,
  })),
};

export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  commission_percent: 5.0,
  commission_waived_in_mvp: true,
  bid_window_default_hours: 2,
  bid_window_auto_extend_hours: 1,
  service_radius_default_km: 5.0,
  service_radius_expansion_km: 3.0,
  min_offers_before_close: 2,
  weight_divergence_threshold_percent: 15,
};

const STORAGE_KEYS = {
  LISTINGS: 'raddibhaav_listings',
  BIDS: 'raddibhaav_bids',
  PICKUPS: 'raddibhaav_pickups',
  LEDGER: 'raddibhaav_ledger',
  DISPUTES: 'raddibhaav_disputes',
  RATINGS: 'raddibhaav_ratings',
  DEALER_KYC: 'raddibhaav_dealer_kyc',
  ADMIN_DEALERS: 'raddibhaav_admin_dealers',
  ADMIN_SELLERS: 'raddibhaav_admin_sellers',
  ADMIN_DISPUTES: 'raddibhaav_admin_disputes',
  CITY_RATE_CARDS: 'raddibhaav_city_rate_cards',
  PLATFORM_SETTINGS: 'raddibhaav_platform_settings',
};

// Safe browser local storage operations
export const MockStore = {
  isBrowser(): boolean {
    return typeof window !== 'undefined';
  },

  getListings(): ScrapListing[] {
    if (!this.isBrowser()) return INITIAL_LISTINGS;
    const stored = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(INITIAL_LISTINGS));
      return INITIAL_LISTINGS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_LISTINGS;
    }
  },

  getListingById(id: string): ScrapListing | undefined {
    const listings = this.getListings();
    return listings.find((l) => l.id === id);
  },

  saveListing(newListing: ScrapListing): ScrapListing {
    const listings = this.getListings();
    const updated = [newListing, ...listings];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updated));
    }
    return newListing;
  },

  updateListingStatus(id: string, status: ScrapListing['status']): void {
    const listings = this.getListings();
    const updated = listings.map((l) => (l.id === id ? { ...l, status } : l));
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updated));
    }
  },

  getBids(listingId?: string): DealerBid[] {
    if (!this.isBrowser()) {
      return listingId ? INITIAL_BIDS.filter((b) => b.listing_id === listingId) : INITIAL_BIDS;
    }
    const stored = localStorage.getItem(STORAGE_KEYS.BIDS);
    const allBids: DealerBid[] = stored ? JSON.parse(stored) : INITIAL_BIDS;
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(INITIAL_BIDS));
    }
    return listingId ? allBids.filter((b) => b.listing_id === listingId) : allBids;
  },

  saveBid(newBid: DealerBid): DealerBid {
    const allBids = this.getBids();
    const updated = [newBid, ...allBids];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(updated));
    }
    // Update listing bid count
    const listings = this.getListings();
    const targetListing = listings.find((l) => l.id === newBid.listing_id);
    if (targetListing) {
      targetListing.bids_count = (targetListing.bids_count || 0) + 1;
      targetListing.highest_bid = Math.max(
        targetListing.highest_bid || 0,
        newBid.total_estimated_amount
      );
      if (this.isBrowser()) {
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
      }
    }
    return newBid;
  },

  withdrawBid(bidId: string): void {
    const allBids = this.getBids();
    const updated = allBids.map((b) => (b.id === bidId ? { ...b, status: 'withdrawn' as const } : b));
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(updated));
    }
  },

  updateBid(bidId: string, totalAmount: number, notes?: string): DealerBid | undefined {
    const allBids = this.getBids();
    let updatedBid: DealerBid | undefined;
    const updated = allBids.map((b) => {
      if (b.id === bidId) {
        updatedBid = {
          ...b,
          total_estimated_amount: totalAmount,
          notes: notes !== undefined ? notes : b.notes,
        };
        return updatedBid;
      }
      return b;
    });
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(updated));
    }
    return updatedBid;
  },

  acceptBid(listingId: string, bidId: string): { pickup: PickupOrder } {
    const allBids = this.getBids();
    const acceptedBid = allBids.find((b) => b.id === bidId);
    if (!acceptedBid) throw new Error('Bid not found');

    // Update bids status
    const updatedBids = allBids.map((b) => {
      if (b.listing_id === listingId) {
        return {
          ...b,
          status: (b.id === bidId ? 'accepted' : 'rejected') as DealerBid['status'],
        };
      }
      return b;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(updatedBids));
    }

    // Update listing status
    this.updateListingStatus(listingId, 'bid_accepted');

    // Create pickup order with random 4-digit OTP code for doorstep security
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const pickup: PickupOrder = {
      id: `pickup-${Date.now()}`,
      listing_id: listingId,
      bid_id: bidId,
      seller_id: 'seller-demo-1',
      dealer_id: acceptedBid.dealer_id,
      dealer_name: acceptedBid.dealer_name,
      dealer_phone: '+91 98201 54321',
      status: 'scheduled',
      scheduled_at: `${acceptedBid.pickup_date} ${acceptedBid.pickup_slot}`,
      otp_code: otp,
      created_at: new Date().toISOString(),
    };

    if (this.isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEYS.PICKUPS);
      const pickups: PickupOrder[] = stored ? JSON.parse(stored) : INITIAL_PICKUPS;
      localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify([pickup, ...pickups]));
    }

    return { pickup };
  },

  getPickups(): PickupOrder[] {
    if (!this.isBrowser()) return INITIAL_PICKUPS;
    const stored = localStorage.getItem(STORAGE_KEYS.PICKUPS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(INITIAL_PICKUPS));
      return INITIAL_PICKUPS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_PICKUPS;
    }
  },

  completePickup(
    pickupId: string,
    finalTotal: number,
    paymentMethod: 'cash' | 'upi'
  ): PickupOrder | undefined {
    const pickups = this.getPickups();
    let completedPickup: PickupOrder | undefined;

    const updated = pickups.map((p) => {
      if (p.id === pickupId) {
        completedPickup = {
          ...p,
          status: 'completed' as const,
          final_total_amount: finalTotal,
          payment_method: paymentMethod,
          completed_at: new Date().toISOString(),
        };
        return completedPickup;
      }
      return p;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(updated));
    }

    if (completedPickup) {
      this.updateListingStatus(completedPickup.listing_id, 'completed');

      // Record dealer ledger entry (commission waived in MVP)
      const commission = Math.round(finalTotal * 0.05 * 100) / 100;
      const ledgerEntry: DealerLedgerEntry = {
        id: `ledger-${Date.now()}`,
        dealer_id: completedPickup.dealer_id,
        pickup_id: pickupId,
        deal_amount: finalTotal,
        commission_rate: 0.05,
        commission_amount: commission,
        status: 'waived_in_mvp',
        notes: 'MVP Promotional Launch: Platform fee 100% waived',
        created_at: new Date().toISOString(),
      };

      if (this.isBrowser()) {
        const stored = localStorage.getItem(STORAGE_KEYS.LEDGER);
        const ledger: DealerLedgerEntry[] = stored ? JSON.parse(stored) : INITIAL_LEDGER;
        localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify([ledgerEntry, ...ledger]));
      }
    }

    return completedPickup;
  },

  confirmPickupWeighin(pickupId: string): PickupOrder | undefined {
    const pickups = this.getPickups();
    const target = pickups.find((p) => p.id === pickupId);
    if (!target) return undefined;
    return this.completePickup(pickupId, target.final_total_amount || 645, 'upi');
  },

  saveDispute(dispute: { pickupId: string; reason: string; raisedBy?: string }): MockDispute {
    const newDispute: MockDispute = {
      id: `dispute-${Date.now()}`,
      pickup_id: dispute.pickupId,
      reason: dispute.reason,
      raised_by: dispute.raisedBy || 'seller-demo-1',
      status: 'open',
      created_at: new Date().toISOString(),
    };

    if (this.isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEYS.DISPUTES);
      const disputes: MockDispute[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify([newDispute, ...disputes]));

      const adminStored = localStorage.getItem(STORAGE_KEYS.ADMIN_DISPUTES);
      const adminDisputes: AdminDisputeRecord[] = adminStored ? JSON.parse(adminStored) : [...INITIAL_ADMIN_DISPUTES];
      const adminRecord: AdminDisputeRecord = {
        id: newDispute.id,
        pickup_id: newDispute.pickup_id,
        listing_id: 'listing-1',
        seller_name: 'Seller',
        seller_phone: '9876543210',
        dealer_name: 'Gupta Traders',
        dealer_phone: '9820011223',
        status: 'open',
        category: 'lowball_payment',
        reason: newDispute.reason,
        expected_amount: 600,
        actual_paid_amount: 500,
        shortfall: 100,
        evidence_photos: [],
        created_at: newDispute.created_at,
        chat_notes: [
          {
            author: 'System',
            role: 'admin' as const,
            message: `Dispute opened: ${newDispute.reason}`,
            timestamp: newDispute.created_at,
          },
        ],
      };
      localStorage.setItem(STORAGE_KEYS.ADMIN_DISPUTES, JSON.stringify([adminRecord, ...adminDisputes]));
    }

    return newDispute;
  },

  saveRating(rating: {
    pickupId: string;
    fromRole?: 'seller' | 'dealer';
    stars: number;
    reason?: string;
    comment?: string;
  }): MockRating {
    const fromRole = rating.fromRole || 'seller';
    const newRating: MockRating = {
      id: `rating-${Date.now()}`,
      pickup_id: rating.pickupId,
      from_role: fromRole,
      stars: rating.stars,
      reason: rating.reason,
      comment: rating.comment,
      created_at: new Date().toISOString(),
    };

    if (this.isBrowser()) {
      const stored = localStorage.getItem(STORAGE_KEYS.RATINGS);
      const ratings: MockRating[] = stored ? JSON.parse(stored) : INITIAL_RATINGS;
      localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify([newRating, ...ratings]));

      // Also attach rating to pickup order
      const pickups = this.getPickups();
      const updatedPickups = pickups.map((p) => {
        if (p.id === rating.pickupId) {
          if (fromRole === 'dealer') {
            return {
              ...p,
              dealer_rating: rating.stars,
              dealer_rating_reason: rating.reason,
              dealer_feedback: rating.comment,
            };
          } else {
            return {
              ...p,
              seller_rating: rating.stars,
              seller_rating_reason: rating.reason,
              seller_feedback: rating.comment,
            };
          }
        }
        return p;
      });
      localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(updatedPickups));
    }

    return newRating;
  },

  getDisputes(): MockDispute[] {
    if (!this.isBrowser()) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.DISPUTES);
    return stored ? JSON.parse(stored) : [];
  },

  getRatings(): MockRating[] {
    if (!this.isBrowser()) return INITIAL_RATINGS;
    const stored = localStorage.getItem(STORAGE_KEYS.RATINGS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(INITIAL_RATINGS));
      return INITIAL_RATINGS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_RATINGS;
    }
  },

  getDealerKycStatus(): KycStatus {
    if (!this.isBrowser()) return 'approved';
    const stored = localStorage.getItem(STORAGE_KEYS.DEALER_KYC);
    if (!stored) return 'approved';
    return stored as KycStatus;
  },

  setDealerKycStatus(status: KycStatus): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.DEALER_KYC, status);
    }
  },

  getLedger(): DealerLedgerEntry[] {
    if (!this.isBrowser()) return INITIAL_LEDGER;
    const stored = localStorage.getItem(STORAGE_KEYS.LEDGER);
    return stored ? JSON.parse(stored) : INITIAL_LEDGER;
  },

  // --------------------------------------------------------------------------
  // Admin Module Store Operations
  // --------------------------------------------------------------------------

  getAdminDealers(): AdminDealerUser[] {
    if (!this.isBrowser()) return INITIAL_ADMIN_DEALERS;
    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_DEALERS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_DEALERS, JSON.stringify(INITIAL_ADMIN_DEALERS));
      return INITIAL_ADMIN_DEALERS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_ADMIN_DEALERS;
    }
  },

  updateDealerKyc(
    dealerId: string,
    status: KycStatus,
    rejectionReason?: string
  ): AdminDealerUser[] {
    const dealers = this.getAdminDealers();
    const updated = dealers.map((d) => {
      if (d.dealer_id === dealerId) {
        return {
          ...d,
          kyc_status: status,
          is_verified: status === 'approved',
          kyc_rejection_reason: status === 'rejected' ? rejectionReason : undefined,
        };
      }
      return d;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_DEALERS, JSON.stringify(updated));
      // If updating the primary test dealer, sync global test kyc key
      if (dealerId === 'dealer-1') {
        this.setDealerKycStatus(status);
      }
    }
    return updated;
  },

  toggleDealerSuspension(dealerId: string, reason?: string): AdminDealerUser[] {
    const dealers = this.getAdminDealers();
    const updated = dealers.map((d) => {
      if (d.dealer_id === dealerId) {
        const nextSuspended = !d.is_suspended;
        return {
          ...d,
          is_suspended: nextSuspended,
          suspension_reason: nextSuspended ? reason || 'Suspended by admin' : undefined,
        };
      }
      return d;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_DEALERS, JSON.stringify(updated));
    }
    return updated;
  },

  getAdminSellers(): AdminSellerUser[] {
    if (!this.isBrowser()) return INITIAL_ADMIN_SELLERS;
    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_SELLERS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SELLERS, JSON.stringify(INITIAL_ADMIN_SELLERS));
      return INITIAL_ADMIN_SELLERS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_ADMIN_SELLERS;
    }
  },

  toggleSellerSuspension(sellerId: string, reason?: string): AdminSellerUser[] {
    const sellers = this.getAdminSellers();
    const updated = sellers.map((s) => {
      if (s.seller_id === sellerId) {
        const nextSuspended = !s.is_suspended;
        return {
          ...s,
          is_suspended: nextSuspended,
          suspension_reason: nextSuspended ? reason || 'Suspended by admin' : undefined,
        };
      }
      return s;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SELLERS, JSON.stringify(updated));
    }
    return updated;
  },

  getAdminDisputes(): AdminDisputeRecord[] {
    if (!this.isBrowser()) return INITIAL_ADMIN_DISPUTES;
    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_DISPUTES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_DISPUTES, JSON.stringify(INITIAL_ADMIN_DISPUTES));
      return INITIAL_ADMIN_DISPUTES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_ADMIN_DISPUTES;
    }
  },

  resolveDispute(
    disputeId: string,
    outcome: string,
    notes?: string
  ): AdminDisputeRecord[] {
    const disputes = this.getAdminDisputes();
    const updated = disputes.map((disp) => {
      if (disp.id === disputeId) {
        return {
          ...disp,
          status: 'resolved' as const,
          resolution_outcome: outcome,
          resolution_notes: notes,
          resolved_at: new Date().toISOString(),
          chat_notes: [
            ...disp.chat_notes,
            {
              author: 'Admin Support',
              role: 'admin' as const,
              message: `Dispute Resolved: ${outcome}${notes ? ` - ${notes}` : ''}`,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }
      return disp;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_DISPUTES, JSON.stringify(updated));
    }
    return updated;
  },

  addDisputeChatNote(
    disputeId: string,
    author: string,
    role: 'seller' | 'dealer' | 'admin',
    message: string
  ): AdminDisputeRecord[] {
    const disputes = this.getAdminDisputes();
    const updated = disputes.map((disp) => {
      if (disp.id === disputeId) {
        return {
          ...disp,
          chat_notes: [
            ...disp.chat_notes,
            {
              author,
              role,
              message,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }
      return disp;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_DISPUTES, JSON.stringify(updated));
    }
    return updated;
  },

  getCityRateCards(city = 'Mumbai'): ScrapCategory[] {
    if (!this.isBrowser()) {
      return INITIAL_CITY_RATE_CARDS[city] || INITIAL_CATEGORIES;
    }
    const stored = localStorage.getItem(STORAGE_KEYS.CITY_RATE_CARDS);
    if (!stored) {
      localStorage.setItem(
        STORAGE_KEYS.CITY_RATE_CARDS,
        JSON.stringify(INITIAL_CITY_RATE_CARDS)
      );
      return INITIAL_CITY_RATE_CARDS[city] || INITIAL_CATEGORIES;
    }
    try {
      const allCityCards = JSON.parse(stored);
      return allCityCards[city] || INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CITY_RATE_CARDS[city] || INITIAL_CATEGORIES;
    }
  },

  updateCityRateCard(city: string, categories: ScrapCategory[]): void {
    if (!this.isBrowser()) return;
    const stored = localStorage.getItem(STORAGE_KEYS.CITY_RATE_CARDS);
    let allCityCards = INITIAL_CITY_RATE_CARDS;
    if (stored) {
      try {
        allCityCards = JSON.parse(stored);
      } catch {
        allCityCards = INITIAL_CITY_RATE_CARDS;
      }
    }
    allCityCards[city] = categories;
    localStorage.setItem(STORAGE_KEYS.CITY_RATE_CARDS, JSON.stringify(allCityCards));

    // Also update current default categories if Mumbai
    if (city === 'Mumbai') {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(this.getListings()));
    }
  },

  getPlatformSettings(): PlatformSettings {
    if (!this.isBrowser()) return INITIAL_PLATFORM_SETTINGS;
    const stored = localStorage.getItem(STORAGE_KEYS.PLATFORM_SETTINGS);
    if (!stored) {
      localStorage.setItem(
        STORAGE_KEYS.PLATFORM_SETTINGS,
        JSON.stringify(INITIAL_PLATFORM_SETTINGS)
      );
      return INITIAL_PLATFORM_SETTINGS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_PLATFORM_SETTINGS;
    }
  },

  updatePlatformSettings(settings: PlatformSettings): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(settings));
    }
  },

  getAdminMetrics(): AdminMetrics {
    const listings = this.getListings();
    const bids = this.getBids();
    const pickups = this.getPickups();
    const ledger = this.getLedger();

    const totalListings = listings.length;
    const completedPickups = pickups.filter((p) => p.status === 'completed').length;
    const totalGmv = pickups
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + (p.final_total_amount || 0), 0);

    const totalCommissionWaived = ledger
      .filter((l) => l.status === 'waived_in_mvp')
      .reduce((sum, l) => sum + l.commission_amount, 0);

    const offersPerListing =
      totalListings > 0 ? Math.round((bids.length / totalListings) * 10) / 10 : 3.2;
    const acceptanceRate =
      totalListings > 0 ? Math.round((pickups.length / totalListings) * 100) : 75;

    // Average bid spread across listings
    let spreadSum = 0;
    let listingsWithSpreads = 0;
    listings.forEach((l) => {
      const listingBids = bids.filter((b) => b.listing_id === l.id && b.status !== 'withdrawn');
      if (listingBids.length > 1) {
        const amounts = listingBids.map((b) => b.total_estimated_amount);
        const max = Math.max(...amounts);
        const min = Math.min(...amounts);
        spreadSum += max - min;
        listingsWithSpreads++;
      }
    });
    const avgSpread = listingsWithSpreads > 0 ? Math.round(spreadSum / listingsWithSpreads) : 120;

    return {
      listings_per_day: 14.5,
      total_listings: totalListings,
      avg_offers_per_listing: offersPerListing,
      acceptance_rate_percent: acceptanceRate,
      completed_pickups: completedPickups || 2,
      gmv_rupees: totalGmv || 2625,
      commission_accrued_rupees: 0,
      commission_waived_rupees: totalCommissionWaived || 131.25,
      avg_bid_spread_rupees: avgSpread,
    };
  },
};
