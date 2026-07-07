/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PrescriptionStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED"
}

export enum OrderStatus {
  PROCESSING = "PROCESSING",
  PACKED = "PACKED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED"
}

export enum RefillFrequency {
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  CUSTOM = "CUSTOM"
}

export enum RefillStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED"
}

export enum SupportTicketStatus {
  OPEN = "OPEN",
  RESOLVED = "RESOLVED"
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  mrp: number;
  discount: number;
  rating: number;
  reviewsCount: number;
  prescriptionRequired: boolean;
  image: string;
  manufacturer: string;
  expiry: string;
  batchNumber: string;
  composition: string;
  uses: string[];
  dosage: string;
  howToUse: string;
  sideEffects: string[];
  warnings: string[];
  storage: string;
  stock: number;
  brand: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Prescription {
  id: string;
  userId?: string;
  fileName: string;
  fileData: string; // Base64 or placeholder URL
  uploadedAt: string;
  status: PrescriptionStatus;
  patientName: string;
  doctorName?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  medicinesRecommended?: string[];
}

export interface Order {
  id: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    prescriptionRequired: boolean;
  }[];
  prescriptionId?: string;
  userId: string;
  userName: string;
  shippingAddress: {
    fullName: string;
    addressLine: string;
    city: string;
    pincode: string;
    phone: string;
  };
  billingAddress: {
    fullName: string;
    addressLine: string;
    city: string;
    pincode: string;
    phone: string;
  };
  deliverySlot: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discountAmount: number;
  gst: number;
  deliveryCharge: number;
  pointsEarned: number;
  pointsRedeemed: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  trackingHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
  utrNumber?: string;
  paymentProofImage?: string;
  paymentConfirmedAt?: string;
  selectedUpiApp?: string;
}

export interface PaymentConfig {
  upiId: string;
  upiQrCode?: string; // base64 representation of QR code image uploaded
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  active: boolean;
}

export interface RefillSubscription {
  id: string;
  userId: string;
  product: Product;
  quantity: number;
  frequency: RefillFrequency;
  status: RefillStatus;
  nextDeliveryDate: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  consultationFee: number;
  image: string;
  availability: string[];
  education: string;
  offerTag?: string;
  phone?: string;
  email?: string;
  about?: string;
}

export interface DoctorAppointment {
  id: string;
  userId?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientName: string;
  patientPhone: string;
  patientAddress?: string; // New field for address
  date?: string; // Made optional as admin sets it later
  timeSlot?: string; // Made optional as admin sets it later
  mode: "VIDEO" | "AUDIO" | "CHAT" | "CLINIC";
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  prescriptionPdfUrl?: string;
}

export interface LabTestPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  testsCount: number;
  testsIncluded: string[];
  sampleRequired: string;
  reportsInHours: number;
  fastingRequired: boolean;
}

export interface LabBooking {
  id: string;
  userId?: string;
  testId: string;
  testName: string;
  patientName: string;
  patientPhone: string;
  date: string;
  timeSlot: string;
  address: string;
  pincode: string;
  status: "PENDING" | "SAMPLE_COLLECTED" | "COMPLETED" | "CANCELLED";
  reportUrl?: string;
}

export interface UserProfile {
  email: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  pincode: string;
}

export interface LoyaltyAccount {
  userId: string;
  pointsBalance: number;
  lifetimePoints: number;
  tier: "BRONZE" | "SILVER" | "GOLD";
  walletBalance: number;
  referralsCount: number;
  referralCode: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot" | "pharmacist";
  text: string;
  timestamp: string;
  image?: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minPurchase: number;
  description: string;
  maxDiscount: number;
}

export interface AboutUsFact {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface SiteBranding {
  appName: string;
  appLogo: string; // e.g., "PlusSquare", "Activity", "Heart", "Sparkles", or a custom text/emoji
  heroTitle: string;
  heroSlogan: string;
  heroImageUrl: string;
  supportPhone: string;
  supportEmail: string;
  primaryColorHex: string; // e.g., "#2563eb" (blue-600)
  aboutUsText: string;
  bannerOfferText: string; // Top promo banner text
  aiAssistantName?: string; // Customizable AI Assistant name
  opsPanelTitle?: string; // Customizable Administrator Operations Panel Title
  customLogoUrl?: string; // Base64 or image URL for custom branding logo
  customLogoSize?: number; // Size of the custom branding logo in pixels
  brandBio?: string; // Short slogan/bio to show underneath the appName
  mobileNavTitle?: string; // Customizable mobile drawer navigation title
  categoryImages?: Record<string, string>; // Mapping of category ID to custom image URL or base64 data
  
  // Quick Services Cards
  expertDoctorTitle?: string;
  expertDoctorDesc?: string;
  expertDoctorPrice?: string;
  expertDoctorImage?: string;
  expertDoctorBgColor?: string;
  
  bookLabTestsTitle?: string;
  bookLabTestsDesc?: string;
  bookLabTestsDelivery?: string;
  bookLabTestsImage?: string;
  bookLabTestsBgColor?: string;
  
  verifyDeliveryTitle?: string;
  verifyDeliveryDesc?: string;
  verifyDeliveryBgUrl?: string;
  deliveryLocations?: { pincode: string; address: string }[];
  
  // Premium Club
  isPremiumClubEnabled?: boolean;
  enableExpertDoctor?: boolean;
  enableBookLabTests?: boolean;
  enableVerifyDelivery?: boolean;
  enableCategories?: boolean;
  enableTopSelling?: boolean;
  enableRefills?: boolean;
  enableTrustFeatures?: boolean;
  enableWhatsappOrder?: boolean;
  whatsappNumber?: string;
  premiumClubTitle?: string;
  premiumClubSlogan?: string;
  premiumClubDescription?: string;
  
  // Custom Categories
  customCategories?: { id: string; name: string }[];
  
  // Extra Quick Services
  extraServices?: { id: string; title: string; desc: string; extraText?: string; image?: string; bgColor?: string; badge?: string; tab?: string }[];
  
  // App Global Background
  // Gallery Page Features
  enableGalleryPage?: boolean;
  galleryPageTitle?: string;
  galleryImages?: { id: string; url: string }[];
  galleryAddressTitle?: string;
  galleryAddressText?: string;
  galleryContactPhone?: string;
  galleryTimingText?: string;
  galleryBannerImage?: string;

  // Invest With Us Page Features
  enableInvestPage?: boolean;
  investPageTitle?: string;
  investPageText?: string;
  investPageEmail?: string;
  investPageImage?: string;

  // About Us Page Features
  enableAboutUsPage?: boolean;
  aboutUsPageTitle?: string;
  aboutUsPageText?: string;
  aboutUsPageImage?: string;
  aboutUsFactsTitle?: string;
  aboutUsFacts?: AboutUsFact[];

  appGlobalBgImage?: string;
  appGlobalBgColor?: string;

  // Clinic Details & Location
  clinicAddress?: string;
  clinicLocationUrl?: string;

  // Toggle sections
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  mediaType: "image" | "video";
  mediaUrl: string; // base64 image or video link or embed link
  linkUrl?: string; // e.g., 'doctor', 'labs', 'store'
  ctaText?: string; // e.g. "Book Now", "Check Offer"
  active: boolean;
  createdAt: string;
}



export interface GlobalSettings extends SiteBranding {
  // Legal & Licenses
  drugLicenseNumber?: string;
  drugLicenseDocumentUrl?: string; // base64
  drugLicenseValidity?: string;
  drugLicensingAuthority?: string;
  
  // Pharmacist Details
  pharmacistName?: string;
  pharmacistRegistrationNumber?: string;
  pharmacistQualification?: string;
  pharmacistPhotoUrl?: string; // base64
  
  // Policies & Disclaimers
  privacyPolicyText?: string;
  termsConditionsText?: string;
  refundPolicyText?: string;
  shippingPolicyText?: string;
  cancellationPolicyText?: string;
  medicalDisclaimerText?: string;
  
  // Footer & Contact
  footerText?: string;
  contactAddress?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  // SEO & Social
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoKeywords?: string;
  socialFacebookUrl?: string;
  socialInstagramUrl?: string;
  socialTwitterUrl?: string;
  socialYoutubeUrl?: string;
  
  // Settings Configs
  deliveryChargesBase?: number;
  freeDeliveryThreshold?: number;
  gstPercentage?: number;
  taxSettingsText?: string;
  
  // Notifications & OTP
  prescriptionVerificationMessage?: string;
  otpSmsTemplate?: string;
  orderConfirmationEmailTemplate?: string;
  whatsappNotificationTemplate?: string;
}

export interface HealthArticle {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author?: string;
  createdAt: string;
  active: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  active: boolean;
}

export interface Testimonial {
  id: string;
  customerName: string;
  rating: number;
  reviewText: string;
  imageUrl?: string;
  active: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  createdAt: string;
  active: boolean;
}


// ==========================================
// ENTERPRISE MODULES
// ==========================================

export type UserRole = 
  | "SUPER_ADMIN" 
  | "PHARMACY_OWNER" 
  | "BRANCH_MANAGER" 
  | "PHARMACIST" 
  | "STAFF" 
  | "DELIVERY_BOY" 
  | "CUSTOMER";

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  managerId?: string;
  pharmacistId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  branchId?: string; // Optional if centralized
  location: string;
  managerId?: string;
  isActive: boolean;
}

export interface DeliveryBoy {
  id: string;
  userId: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  licenseNumber: string;
  activeZonePincodes: string[];
  isAvailable: boolean;
  totalDeliveries: number;
  totalEarnings: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber: string;
  address: string;
  outstandingBalance: number;
  isActive: boolean;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  warehouseId: string;
  items: {
    productId: string;
    quantity: number;
    costPrice: number;
    batchNumber: string;
    expiryDate: string;
  }[];
  totalAmount: number;
  status: "DRAFT" | "SENT" | "RECEIVED" | "CANCELLED";
  paymentStatus: "PENDING" | "PARTIAL" | "PAID";
  createdAt: string;
  receivedAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userRole: string;
  details: string;
  timestamp: string;
}

export interface Webhook {
  id: string;
  event: string;
  url: string;
  secret: string;
  isActive: boolean;
}
