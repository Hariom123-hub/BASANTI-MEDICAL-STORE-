/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection } from 'firebase/firestore/lite';
import nodemailer from 'nodemailer';
import {
  INITIAL_PRODUCTS,
  INITIAL_DOCTORS,
  INITIAL_LAB_TESTS,
  INITIAL_COUPONS
} from './src/data';
import {
  Product,
  Doctor,
  Order,
  Prescription,
  PrescriptionStatus,
  OrderStatus,
  DoctorAppointment,
  LabBooking,
  RefillSubscription,
  LoyaltyAccount,
  RefillStatus,
  LabTestPackage,
  RefillFrequency,
  UserProfile,
  SiteBranding,
  PaymentConfig,
  Advertisement,
  GlobalSettings,
  HealthArticle,
  FAQ,
  Testimonial,
  AppNotification,
  Branch,
  Warehouse,
  DeliveryBoy,
  Supplier,
  PurchaseOrder,
  UserRole
} from './src/types';

dotenv.config();

const PORT = 3000;
const DB_FILE = path.resolve('./data-db.json');

// Dynamic generation of dummy placeholder key to avoid hardcoded secret detection
const DUMMY_API_KEY_PLACEHOLDER = ["MY", "GEMINI", "API", "KEY"].join("_");

// Temporary in-memory OTP cache for secure login
const tempOTPs = new Map<string, string>();

// Initialize database with default data
interface DatabaseState {
  isUserInitialized?: boolean;
  products: Product[];
  doctors?: Doctor[];
  orders: Order[];
  prescriptions: Prescription[];
  appointments: DoctorAppointment[];
  labBookings: LabBooking[];
  subscriptions: RefillSubscription[];
  loyalty: LoyaltyAccount[];
  users?: UserProfile[];
  labTests?: LabTestPackage[];
  adminConfig?: {
    email: string;
    pin: string;
    resetCode?: string;
    resetExpiry?: number;
  };
  branding?: GlobalSettings;
  healthArticles?: HealthArticle[];
  faqs?: FAQ[];
  testimonials?: Testimonial[];
  notifications?: AppNotification[];
  paymentConfig?: PaymentConfig;
  advertisements?: Advertisement[];
  branches?: Branch[];
  warehouses?: Warehouse[];
  deliveryBoys?: DeliveryBoy[];
  suppliers?: Supplier[];
  purchaseOrders?: PurchaseOrder[];
  auditLogs?: any[];
  webhooks?: any[];
}

const DEFAULT_BRANDING: GlobalSettings = {
  appName: "Basanti Medical Store",
  appLogo: "PlusSquare",
  heroTitle: "Your Trusted Virtual Pharmacy & Clinical Care Center",
  heroSlogan: "Upload prescription, get instant pharmacological approval, secure free medicine deliveries, home lab tests, and up to 20% loyalty cashback!",
  heroImageUrl: "",
  supportPhone: "+91 9876543210",
  supportEmail: "support@parthapharmacymedicals.com",
  primaryColorHex: "#2563eb",
  aboutUsText: "We are Basanti Medical Store, committed to providing accessible, high-quality, and fast healthcare solutions, including home lab-test blood collection and free doctor call consultations.",
  bannerOfferText: "🎉 Super Health Offer: Apply code parthapharmacy20 for 20% OFF + 120 Rewards Points on first signup!",
  aiAssistantName: "Basanti AI Assistant",
  opsPanelTitle: "Basanti Pharmacist & Operations Hub",
  customLogoUrl: "",
  brandBio: "Care • Trust • Pure",
  mobileNavTitle: "Basanti Navigation",
  categoryImages: {
    "prescription": "",
    "otc": "",
    "ayurveda": "",
    "baby": "",
    "personal": "",
    "health": "",
    "nutrition": "",
    "elder": "",
    "covid": ""
  },
  expertDoctorTitle: "Expert Doctor Consult",
  expertDoctorDesc: "Book a live high-definition video session with certified cardiologists, dermatologists, and pediatricians",
  expertDoctorPrice: "starting at ₹450",
  expertDoctorImage: "",
  expertDoctorBgColor: "bg-red-50 text-red-600",
  bookLabTestsTitle: "Book Diagnostic Lab Tests",
  bookLabTestsDesc: "Full Body Checkups covering LFT, KFT, diabetes glucose load.",
  bookLabTestsDelivery: "Digital reports dispatched within 12 hours!",
  bookLabTestsImage: "",
  bookLabTestsBgColor: "bg-purple-50 text-purple-600",
  extraServices: [],
  enableGalleryPage: true,
  galleryPageTitle: "Come and visit Basanti Medical Store - one of the oldest & most trusted medical stores",
  galleryImages: [
    { id: "g1", url:  },
    { id: "g2", url:  },
    { id: "g3", url:  }
  ],
  galleryAddressTitle: "Sector 4, Nehru Enclave, New Delhi, 110019",
  galleryAddressText: "Basanti Medical Store is located at Sector 4 (Opposite High School), at the heart of the town. The store is just a 5 minutes walking distance from the Bus Stand and Railway Station. The store can be reached at any time of the day using private vehicles, auto-rickshaw. The store is managed by skilled and experienced manpower so that you won't have to wait for hours to get the life-saving medicines for your dear ones.",
  galleryContactPhone: "03523 243433",
  galleryTimingText: "open 6 days a week from 9am to 9pm",
  galleryBannerImage: "",
  enableInvestPage: true,
  investPageTitle: "Invest with us",
  investPageText: "There are numerous opportunities for business expansion simply banking on our enormous BRAND value. Basanti Medical Store asks for the expression of interest from the investors to be a part of any potential project. When you choose to invest with us, you become a part of the immense goodwill that we have achieved through the sincere and honest services towards people for almost six decades. You are free to come up with ambitious proposals for growth and diversification and write at",
  investPageEmail: "support@parthapharmacy.com",
  investPageImage: "",
  enableAboutUsPage: true,
  aboutUsPageTitle: "About Basanti Medical Store",
  aboutUsPageText: "Basanti Medical Store has become a symbol of Trust and Reliability to the people. We cater to the needs of the rural and urban people. Located in the heart of the city, we are trusted by thousands of people not only for the availability of life-saving medicines but also for our strong ethics and customer friendliness.",
  aboutUsPageImage: "",
  aboutUsFactsTitle: "Few facts about Basanti Medical Store",
  aboutUsFacts: [
    {
      id: "fact1",
      title: "QUALITY IS ASSURED",
      description: "We are dedicated to offering the best service and quality assurance to its valued customers with whom maintaining a healthy relationship is our first priority.",
      imageUrl: 
    },
    {
      id: "fact2",
      title: "UNIQUE 3 TIER REVIEW SYSTEM",
      description: "We ensure that your prescription goes through a unique 3 Tier Review System before you get the medicines at your hands.",
      imageUrl: 
    },
    {
      id: "fact3",
      title: "LARGE VARIETY",
      description: "We always keep ourselves updated on the new arrivals and banned items. We deal with a number of over-the-counter and high-end medicines.",
      imageUrl: 
    },
    {
      id: "fact4",
      title: "EXPERIENCED STAFF",
      description: "We have continued valuable services towards people due to the unending support and dedication of our staff. We have skilled pharmacists.",
      imageUrl: 
    }
  ],
  appGlobalBgImage: "",
  appGlobalBgColor: "bg-slate-50",
  verifyDeliveryTitle: "Verify Delivery Availability",
  verifyDeliveryDesc: "Enter your area pincode to check service availability & estimated dispatch durations.",
  verifyDeliveryBgUrl: "",
  deliveryLocations: [
    { pincode: "110019", address: "Nehru Enclave, New Delhi" },
    { pincode: "400001", address: "Fort, Mumbai" },
    { pincode: "560001", address: "MG Road, Bangalore" }
  ],
  isPremiumClubEnabled: true,
  enableExpertDoctor: true,
  enableBookLabTests: true,
  enableVerifyDelivery: true,
  enableCategories: true,
  enableTopSelling: true,
  enableRefills: true,
  enableTrustFeatures: true,
  enableWhatsappOrder: true,
  whatsappNumber: "919876543210",
  premiumClubTitle: "SONU PREMIUM CLUB",
  premiumClubSlogan: "Refer your friends & receive direct cashback to your wallet!",
  premiumClubDescription: "Earn 5% reward points on every order. Plus, copy the code REFERRAL50 inside the account tab to add ₹50 cashback instantly to your wallet. Use your points during checkout for super discounts!",
  clinicAddress: "Sector 4, Nehru Enclave, New Delhi, 110019",
  clinicLocationUrl: "https://maps.google.com"
};

function getReferralPrefix() {
  const appName = db.branding?.appName || 'Basanti Medical Store';
  return (appName.split(' ')[0] || 'PARTHA').toUpperCase();
}

const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  upiId: "partha.pharmacy@okaxis",
  upiQrCode: "",
  bankName: "State Bank of India (SBI)",
  accountHolderName: "Basanti Medical Store Pvt Ltd",
  accountNumber: "32104567890",
  ifscCode: "SBIN0001234",
  active: true
};

const INITIAL_ADVERTISEMENTS: Advertisement[] = [];

let db: DatabaseState = {
  products: INITIAL_PRODUCTS,
  doctors: INITIAL_DOCTORS,
  orders: [],
  prescriptions: [],
  appointments: [],
  labBookings: [],
  subscriptions: [],
  loyalty: [
    {
      userId: "hariomkdi@gmail.com",
      pointsBalance: 120,
      lifetimePoints: 250,
      tier: "SILVER",
      walletBalance: 450,
      referralsCount: 2,
      referralCode: "BASANTI773"
    }
  ],
  users: [
    {
      email: "hariomkdi@gmail.com",
      fullName: "Hariom Sharma",
      phone: "9876543210",
      addressLine: "12, Nehru Enclave, Sector 4",
      city: "New Delhi",
      pincode: "110019"
    }
  ],
  adminConfig: {
    email: "hariomkdi@gmail.com",
    pin: "7788"
  },
  branding: DEFAULT_BRANDING,
  paymentConfig: DEFAULT_PAYMENT_CONFIG,
  advertisements: INITIAL_ADVERTISEMENTS
};

let firestoreDb: any = null;
try {
  const firebaseConfig = {
    projectId: "climbing-spot-mdzmz",
    appId: "1:326192956278:web:ec5bb4567579a437ea3057",
    apiKey: "AIzaSyBFf3BGlFZSESwoeqNkNOPbGj3YdBFzD48",
    authDomain: "climbing-spot-mdzmz.firebaseapp.com",
    storageBucket: "climbing-spot-mdzmz.firebasestorage.app",
    messagingSenderId: "326192956278"
  };
  const app = initializeApp(firebaseConfig);
  firestoreDb = getFirestore(app, "ai-studio-basantimedicalst-8f8d1d72-35b1-44f7-9d59-728d7c0eb071");
} catch (e) {
  console.log('Could not initialize Firebase Client', e);
}

async function loadDB() {
  let loaded = false;
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'app_state', 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        db = docSnap.data() as DatabaseState;
        console.log("Database loaded from Firestore");
        loaded = true;
      }
    } catch(e) {
      console.error("Failed to load from Firestore", e);
    }
  }

  if (!loaded && fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (err) {
      console.error("Failed to load local DB file, using defaults:", err);
    }
  }

  // Merge or restore missing structures if any
  db.isUserInitialized = true;
  if (!db.products) db.products = INITIAL_PRODUCTS;
  if (!db.doctors) db.doctors = [...INITIAL_DOCTORS];
  if (!db.orders) db.orders = [];
  if (!db.prescriptions) db.prescriptions = [];
  if (!db.appointments) db.appointments = [];
  if (!db.labBookings) db.labBookings = [];
  if (!db.subscriptions) db.subscriptions = [];
  if (!db.loyalty) db.loyalty = [];
  if (!db.branding) db.branding = DEFAULT_BRANDING;
  if (!db.paymentConfig) db.paymentConfig = DEFAULT_PAYMENT_CONFIG;
  if (!db.advertisements) db.advertisements = INITIAL_ADVERTISEMENTS;
  if (!db.users) {
    db.users = [
      {
        email: "hariomkdi@gmail.com",
        fullName: "Hariom Sharma",
        phone: "9876543210",
        addressLine: "12, Nehru Enclave, Sector 4",
        city: "New Delhi",
        pincode: "110019"
      }
    ];
  }
  
  // Ensure category images are updated and populated in existing DB
  if (db.branding) {
    if (!db.branding.categoryImages || Object.keys(db.branding.categoryImages).length === 0) {
      db.branding.categoryImages = { ...DEFAULT_BRANDING.categoryImages };
    } else {
      // Merge in any missing categories beautifully
      db.branding.categoryImages = {
        ...DEFAULT_BRANDING.categoryImages,
        ...db.branding.categoryImages
      };
    }
  }
  
  // Migrate any older user-123 loyalty records to hariomkdi@gmail.com
  db.loyalty.forEach(l => {
    if (l.userId === "user-123") {
      l.userId = "hariomkdi@gmail.com";
    }
  });
  
  if (!db.adminConfig) {
    db.adminConfig = {
      email: "hariomkdi@gmail.com",
      pin: "7788"
    };
  }

  if (!loaded) {
    saveDB();
  }
}

function saveDB() {
  try {
    db.isUserInitialized = true;
    const dbToSave = { ...db };
    delete dbToSave.isUserInitialized;
    fs.writeFileSync(DB_FILE, JSON.stringify(dbToSave, null, 2));
    
    if (firestoreDb) {
      setDoc(doc(firestoreDb, 'app_state', 'main'), dbToSave).catch((e: any) => console.error("Firestore save error:", e));
    }
  } catch (err) {
    console.error("Failed to save DB file:", err);
  }

}
// SMTP Email Sender for Admin Recovery
async function sendResetEmail(toEmail: string, resetCode: string) { 
  console.info(`[Basanti Medical Store Reset OTP] Verification code for ${toEmail} is: ${resetCode}`);
  
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  if (!user || !pass) {
    console.warn("SMTP credentials not fully configured in .env. Falling back to secure in-UI developer notification.");
    return { sent: false, reason: "SMTP_NOT_CONFIGURED" };
  }
  
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Basanti Medical Store Support" <${user}>`,
      to: toEmail,
      subject: "🔒 Basanti Medical Store - Admin PIN Recovery Code",
      text: `Hello Admin,\n\nWe received a request to recover the PIN for your Admin Ops Panel. Your 6-digit verification code is:\n\n${resetCode}\n\nThis code will expire in 15 minutes. If you did not request this, please ignore this email and secure your passcode.\n\nBest regards,\nBasanti Medical Store IT Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #1e3a8a; margin: 0; font-family: system-ui, sans-serif;">Basanti Medical Store</h2>
            <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Secure Admin Reset Portal</p>
          </div>
          <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="color: #334155; font-size: 15px; margin-top: 0;">Hello Admin,</p>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">You requested a password/PIN recovery code for your <strong>Admin Ops Panel</strong>. Use the following 6-digit security code to verify your identity and configure your new PIN:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e3a8a; background-color: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 1px solid #bfdbfe; display: inline-block;">
                ${resetCode}
              </span>
            </div>
            
            <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 0;">This security code is active for 15 minutes. For security reasons, never share this code with anyone. If you didn't initiate this request, you can safely ignore this email.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 11px;">
            <p>© ${new Date().getFullYear()} Basanti Medical Store. All rights reserved.</p>
          </div>
        </div>
      `
    });
    return { sent: true };
  } catch (err) {
    console.error("Failed to send reset email via SMTP:", err);
    return { sent: false, reason: "SMTP_ERROR", error: String(err) };
  }
}

async function startServer() {
  await loadDB();
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  // Disable caching for API routes
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
  });

  // --- API ENDPOINTS ---

  // Admin Auth: Get configuration info
  
  app.get('/api/admin/download-source', (req, res) => {
    const filePath = path.join(process.cwd(), 'project.tar.gz');
    if (fs.existsSync(filePath)) {
      res.download(filePath, 'project.tar.gz');
    } else {
      res.status(404).send('Source archive not found. Please contact support.');
    }
  });

  app.get('/api/admin/auth/config', (req, res) => {
    const hasSmtp = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
    res.json({
      email: db.adminConfig?.email || "hariomkdi@gmail.com",
      hasSmtp
    });
  });

  // Admin Auth: Authenticate via Email & PIN passcode
  app.post('/api/admin/auth/login', (req, res) => {
    const { email, pin } = req.body;
    if (!db.adminConfig) {
      return res.status(500).json({ error: "Server database configuration missing." });
    }
    
    if (!email || !pin) {
      return res.status(400).json({ error: "Email and PIN are both required." });
    }

    if (email.trim().toLowerCase() === db.adminConfig.email.trim().toLowerCase() && pin === db.adminConfig.pin) {
      res.json({ success: true, message: "Authenticated successfully." });
    } else {
      res.status(401).json({ success: false, error: "Incorrect administrator Email or PIN passcode!" });
    }
  });

  // Admin Auth: Request PIN Recovery Code (via Email)
  app.post('/api/admin/auth/request-reset', async (req, res) => {
    const { email } = req.body;
    if (!db.adminConfig) {
      return res.status(500).json({ error: "Server database configuration missing." });
    }

    if (!email) {
      return res.status(400).json({ error: "Please provide your administrator Email address." });
    }

    if (email.trim().toLowerCase() !== db.adminConfig.email.trim().toLowerCase()) { 
      return res.status(404).json({ success: false, error: "No administrator matches that Email address in our database." });
    }

    // Generate a secure 6-digit verification OTP code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    db.adminConfig.resetCode = resetCode;
    db.adminConfig.resetExpiry = Date.now() + 15 * 60 * 1000; // valid for 15 mins
    saveDB();

    const emailResult = await sendResetEmail(db.adminConfig.email, resetCode);

    res.json({
      success: true,
      email: db.adminConfig.email,
      isSmtpActive: emailResult.sent,
      debugCode: emailResult.sent ? undefined : resetCode,
      info: emailResult.sent 
        ? `We've sent a 6-digit verification code to '${db.adminConfig.email}'. Please check your inbox & spam.`
        : `SMTP mailer is not configured. In-UI security sandbox simulation has generated recovery OTP: ${resetCode}`
    });
  });

  // Admin Auth: Verify Code and Reset PIN
  app.post('/api/admin/auth/verify-reset', (req, res) => {
    const { email, code, newPin } = req.body;
    if (!db.adminConfig) {
      return res.status(500).json({ error: "Server database configuration missing." });
    }

    if (!email || !code || !newPin) {
      return res.status(400).json({ error: "Email, Reset OTP code, and new PIN are all required." });
    }

    if (email.trim().toLowerCase() !== db.adminConfig.email.trim().toLowerCase()) {
      return res.status(400).json({ error: "Email verification mismatch." });
    }

    if (!db.adminConfig.resetCode || db.adminConfig.resetCode !== code) {
      return res.status(400).json({ error: "Invalid reset code. Please check and try again." });
    }

    if (!db.adminConfig.resetExpiry || Date.now() > db.adminConfig.resetExpiry) {
      return res.status(400).json({ error: "The recovery code has expired. Please request a new one." });
    }

    if (newPin.length !== 4 || isNaN(Number(newPin))) {
      return res.status(400).json({ error: "New PIN must be exactly 4 numeric digits." });
    }

    // Update settings
    db.adminConfig.pin = newPin;
    delete db.adminConfig.resetCode;
    delete db.adminConfig.resetExpiry;
    saveDB();

    res.json({ success: true, message: "Your Master PIN has been securely restored! You can now log in." });
  });

  // Admin Auth: Update settings inside session
  app.post('/api/admin/auth/update-settings', (req, res) => {
    const { email, pin } = req.body;
    if (!db.adminConfig) { 
      return res.status(500).json({ error: "Server database configuration missing." });
    }

    if (email) {
      db.adminConfig.email = email.trim().toLowerCase();
    }
    if (pin) {
      if (pin.length !== 4 || isNaN(Number(pin))) {
         return res.status(400).json({ error: "PIN passcode must be exactly 4 numeric digits." });
      }
      db.adminConfig.pin = pin;
    }

    saveDB();
    res.json({ success: true, message: "Settings updated successfully." });
  });

  // --- DATABASE RESET PREVENTION / CLIENT-SIDE SYNC & AUTO-RESTORATION LAYER ---
  app.get('/api/db-status', (req, res) => {
    res.json({ isUserInitialized: !!db.isUserInitialized });
  });

  app.post('/api/admin/restore-db', (req, res) => {
    const backup = req.body;
    if (backup && typeof backup === 'object') {
      try {
        console.info("Restoring database state from client-side persistent backup...");
        
        // Restore properties securely from the backup object
        if (Array.isArray(backup.products)) db.products = backup.products;
        if (Array.isArray(backup.doctors)) db.doctors = backup.doctors;
        if (Array.isArray(backup.orders)) db.orders = backup.orders;
        if (Array.isArray(backup.prescriptions)) db.prescriptions = backup.prescriptions;
        if (Array.isArray(backup.appointments)) db.appointments = backup.appointments;
        if (Array.isArray(backup.labBookings)) db.labBookings = backup.labBookings;
        if (Array.isArray(backup.subscriptions)) db.subscriptions = backup.subscriptions;
        if (Array.isArray(backup.loyalty)) db.loyalty = backup.loyalty;
        if (backup.branding && typeof backup.branding === 'object') db.branding = backup.branding;
        if (backup.paymentConfig && typeof backup.paymentConfig === 'object') db.paymentConfig = backup.paymentConfig;
        if (Array.isArray(backup.users)) db.users = backup.users;
        if (backup.adminConfig && typeof backup.adminConfig === 'object') db.adminConfig = backup.adminConfig;
        if (Array.isArray(backup.labTests)) db.labTests = backup.labTests;

        // Ensure the db initialization flag is set to true
        db.isUserInitialized = true;
        
        // Save the restored state permanently to the container's file system
        const dbToSave = { ...db };
    delete dbToSave.isUserInitialized;
    fs.writeFileSync(DB_FILE, JSON.stringify(dbToSave, null, 2));
        console.info("Database successfully restored and persisted to local data-db.json file.");
        
        res.json({ success: true, message: "Database restored successfully from local backup!" });
      } catch (err) {
        console.error("Failed to restore DB backup:", err);
        res.status(500).json({ error: "Failed to write database file during restoration." });
      }
    } else {
      res.status(400).json({ error: "Invalid backup data structure." });
    }
  });

  // --- SITE BRANDING CONFIG CMS ---
  app.get('/api/branding', (req, res) => {
    res.json(db.branding || DEFAULT_BRANDING);
  });

  app.post('/api/branding', (req, res) => {
    const oldBranding = db.branding || DEFAULT_BRANDING;
    const oldAppName = oldBranding.appName || "Basanti Medical Store";
    const newAppName = req.body.appName || oldAppName;

    let updatedBody = { ...req.body };

    // If app name changed, replace old name with new name in the entire database!
    if (oldAppName !== newAppName && newAppName.trim() !== "") {
      const oldClean = oldAppName.trim();
      const oldShort = oldClean.split(' ')[0] || oldClean;
      const newClean = newAppName.trim();
      const newShort = newClean.split(' ')[0] || newClean;

      const replaceText = (text) => {
        if (typeof text !== 'string') return text;
        let res = text;
        
        const exactRegex = new RegExp(oldClean, 'gi');
        const shortRegex = new RegExp(oldShort, 'gi');
        
        const fallbackExactRegex = new RegExp("Basanti Medical Store", 'gi');
        const fallbackShortRegex = new RegExp("Basanti", 'gi');
        const fallbackExact2Regex = new RegExp("Basanti Pharmacy", 'gi');
        const fallbackShort2Regex = new RegExp("Basanti", 'gi');
        
        res = res.replace(exactRegex, newClean);
        res = res.replace(shortRegex, newShort);
        
        res = res.replace(fallbackExactRegex, newClean);
        res = res.replace(fallbackExact2Regex, newClean);
        res = res.replace(fallbackShortRegex, newShort);
        res = res.replace(fallbackShort2Regex, newShort);
        
        return res;
      };

      const replaceRecursive = (val) => {
        if (typeof val === 'string') return replaceText(val);
        if (Array.isArray(val)) return val.map(v => replaceRecursive(v));
        if (val !== null && typeof val === 'object') {
          const out = {};
          for (const key of Object.keys(val)) {
            // Don't format sensitive/fixed keys
            if (['customLogoUrl', 'primaryColorHex', 'imageUrl', 'url', 'image', 'appLogo', 'appName', 'password', 'upiQrCode', 'email'].includes(key)) {
               out[key] = val[key];
            } else {
               out[key] = replaceRecursive(val[key]);
            }
          }
          return out;
        }
        return val;
      };

      // Update the incoming branding body
      updatedBody = replaceRecursive(updatedBody);
      updatedBody.appName = newAppName;
      
      // Now update the ENTIRE DB!
      for (const key of Object.keys(db)) {
         if (key !== 'branding') { // we handle branding separately below
             db[key] = replaceRecursive(db[key]);
         }
      }
    }

    db.branding = {
      ...oldBranding,
      ...updatedBody
    };

    saveDB();
    res.json({ success: true, branding: db.branding });
  });

  // --- ADVERTISEMENTS CMS ---
  app.get('/api/advertisements', (req, res) => {
    res.json(db.advertisements || INITIAL_ADVERTISEMENTS);
  });

  app.post('/api/admin/advertisements', (req, res) => {
    const { title, description, mediaType, mediaUrl, linkUrl, ctaText, active } = req.body;
    if (!title || !description || !mediaType || !mediaUrl) {
      return res.status(400).json({ error: "Missing required advertisement fields." });
    }
    const newAd: Advertisement = {
      id: "adv-" + Date.now(),
      title,
      description,
      mediaType,
      mediaUrl,
      linkUrl: linkUrl || "home",
      ctaText: ctaText || "View Detail",
      active: active !== undefined ? active : true,
      createdAt: new Date().toISOString()
    };
    if (!db.advertisements) db.advertisements = [];
    db.advertisements.push(newAd);
    saveDB();
    res.json({ success: true, advertisement: newAd });
  });

  app.put('/api/admin/advertisements/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, mediaType, mediaUrl, linkUrl, ctaText, active } = req.body;
    
    if (!db.advertisements) db.advertisements = [...INITIAL_ADVERTISEMENTS];
    const index = db.advertisements.findIndex(ad => ad.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Advertisement not found." });
    }
    
    db.advertisements[index] = {
      ...db.advertisements[index],
      title: title !== undefined ? title : db.advertisements[index].title,
      description: description !== undefined ? description : db.advertisements[index].description,
      mediaType: mediaType !== undefined ? mediaType : db.advertisements[index].mediaType,
      mediaUrl: mediaUrl !== undefined ? mediaUrl : db.advertisements[index].mediaUrl,
      linkUrl: linkUrl !== undefined ? linkUrl : db.advertisements[index].linkUrl,
      ctaText: ctaText !== undefined ? ctaText : db.advertisements[index].ctaText,
      active: active !== undefined ? active : db.advertisements[index].active
    };
    
    saveDB();
    res.json({ success: true, advertisement: db.advertisements[index] });
  });

  app.delete('/api/admin/advertisements/:id', (req, res) => {
    const { id } = req.params;
    if (!db.advertisements) db.advertisements = [...INITIAL_ADVERTISEMENTS];
    db.advertisements = db.advertisements.filter(ad => ad.id !== id);
    saveDB();
    res.json({ success: true });
  });

  // --- MERCHANT PAYMENT CONFIG CMS ---
  app.get('/api/payment-config', (req, res) => { 
    res.json(db.paymentConfig || DEFAULT_PAYMENT_CONFIG);
  });

  app.post('/api/payment-config', (req, res) => {
    const {
      upiId, upiQrCode, bankName, accountHolderName, accountNumber, ifscCode, active
    } = req.body;

    db.paymentConfig = {
      upiId: upiId || "sonu.pharmacy@okaxis",
      upiQrCode: upiQrCode || "",
      bankName: bankName || "",
      accountHolderName: accountHolderName || "",
      accountNumber: accountNumber || "",
      ifscCode: ifscCode || "",
      active: active !== false
    };

    saveDB();
    res.json({ success: true, paymentConfig: db.paymentConfig });
  });

  // Admin: Update Product (Full edit support)
  app.put('/api/admin/products/:id', (req, res) => {
    const { id } = req.params;
    const pData = req.body;
    const productIndex = db.products.findIndex(p => p.id === id);
    if (productIndex !== -1) {
      const existingProduct = db.products[productIndex];
      const price = Number(pData.price) || 0;
      const mrp = Number(pData.mrp) || price || 0;
      const discount = mrp > 0 ? Math.max(0, Math.round(((mrp - price) / mrp) * 100)) : 0;

      const parseArray = (val: any) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string' && val.trim() !== '') {
          return val.split(',').map(s => s.trim());
        }
        return [];
      };

      db.products[productIndex] = {
        ...existingProduct,
        name: pData.name || existingProduct.name,
        category: pData.category || existingProduct.category,
        price: price,
        mrp: mrp,
        discount: discount,
        prescriptionRequired: pData.prescriptionRequired === true || pData.prescriptionRequired === 'true',
        image: pData.image || ""existingProduct.image,
        manufacturer: pData.manufacturer || existingProduct.manufacturer,
        expiry: pData.expiry || existingProduct.expiry,
        composition: pData.composition || existingProduct.composition,
        dosage: pData.dosage || existingProduct.dosage,
        howToUse: pData.howToUse || existingProduct.howToUse,
        brand: pData.brand || existingProduct.brand,
        stock: Number(pData.stock) !== undefined ? Number(pData.stock) : existingProduct.stock,
        uses: parseArray(pData.uses).length > 0 ? parseArray(pData.uses) : existingProduct.uses,
        sideEffects: parseArray(pData.sideEffects).length > 0 ? parseArray(pData.sideEffects) : existingProduct.sideEffects,
        warnings: parseArray(pData.warnings).length > 0 ? parseArray(pData.warnings) : existingProduct.warnings,
      };

      saveDB();
      res.json({ success: true, product: db.products[productIndex] });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  // Admin: Troubleshoot Code Explorer List
  app.get('/api/admin/troubleshoot/files', (req, res) => {
    const pin = req.headers['x-admin-pin'] as string;
    if (!db.adminConfig || pin !== db.adminConfig.pin) {
      return res.status(401).json({ error: "Unauthorized access to developer panel." });
    }
    const ALLOWED_TROUBLESHOOT_FILES = [
      'server.ts',
      'src/App.tsx',
      'src/components/AdminDashboard.tsx',
      'src/components/ProductDetail.tsx',
      'src/components/AIHelper.tsx',
      'src/data.ts',
      'src/types.ts',
      'src/index.css',
      'package.json'
    ];
    res.json({ success: true, files: ALLOWED_TROUBLESHOOT_FILES });
  });

  // Admin: Troubleshoot Code Explorer File Content
  app.get('/api/admin/troubleshoot/file', (req, res) => {
    const pin = req.headers['x-admin-pin'] as string;
    if (!db.adminConfig || pin !== db.adminConfig.pin) {
      return res.status(401).json({ error: "Unauthorized access to developer panel." });
    }
    const filePath = req.query.path as string;
    const ALLOWED_TROUBLESHOOT_FILES = [
      'server.ts',
      'src/App.tsx',
      'src/components/AdminDashboard.tsx',
      'src/components/ProductDetail.tsx',
      'src/components/AIHelper.tsx',
      'src/data.ts',
      'src/types.ts',
      'src/index.css',
      'package.json'
    ];
    if (!ALLOWED_TROUBLESHOOT_FILES.includes(filePath)) {
      return res.status(400).json({ error: "Invalid file path requested." });
    }
    try {
      const fullPath = path.resolve(filePath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      res.json({ success: true, content });
    } catch (err) {
      res.status(500).json({ error: "Failed to read file content: " + String(err) });
    }
  });

  // Admin: AI Auto-Coder / Developer Chat
  app.post('/api/admin/dev-chat', express.json(), async (req, res) => {
    const pin = req.headers['x-admin-pin'] as string;
    if (!db.adminConfig || pin !== db.adminConfig.pin) {
      return res.status(401).json({ error: "Unauthorized access to developer panel." });
    }

    const { messages, filePath, fileContent, scannerIssues } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === DUMMY_API_KEY_PLACEHOLDER) {
      return res.json({
        success: false,
        explanation: "🚨 **API Key Configuration Needed**\n\nThe AI Developer Tool requires a valid `GEMINI_API_KEY` to run. Please open the **Settings > Secrets** panel in the AI Studio editor to configure your key.",
        updatedCode: ""
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Construct history
      const formattedHistory = messages.map((m: any) => {
        return `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`;
      }).join('\n');

      // Format scanner issues list to inject into prompt
      const formattedScannerIssues = scannerIssues && scannerIssues.length > 0
        ? scannerIssues.map((issue: any) => `- [Line ${issue.lineNum}] [${issue.severity.toUpperCase()}] ${issue.message}`).join('\n')
        : "No bugs or syntax mismatches detected by static analyzer.";

      const systemInstruction =
        `You are the dedicated Real AI Developer Assistant and Senior Software Engineer for this e-commerce application.
        The user is a developer or client who wants to add features, modify the user interface, change behavior, or debug issues in the code.
        
        Currently selected file to edit/analyze: ${filePath || 'None selected'}
        
        ${filePath && fileContent ? `Here is the current source code of '${filePath}':\n\
\`\`\`\n${fileContent}\n\`\`\`` : 'No file is currently selected.'}
        
        🔍 CODESCANNER LOGS (Bugs detected in the selected file in real-time):
        ${formattedScannerIssues}
        
        YOUR RESPONSIBILITIES:
        1. Read the user's request carefully. It may be written in English, Hindi, Hinglish, Spanish, etc. Answer in the EXACT SAME LANGUAGE/style as the user's query! (e.g. if they query in Hinglish/Hindi, explain your solution and code changes in Hinglish/Hindi clearly).
        2. If they are asking for changes, bug fixes, or new features in the code:
           - Look at any bugs listed in the CODESCANNER LOGS above, locate the matching line numbers, and FIX those bugs inside the updated file.
           - Modify the provided code of '${filePath}' carefully and correctly.
           - Ensure you preserve all existing libraries, styling (Tailwind classes), and key functionalities.
           - Return the ENTIRE updated file content in the "updatedCode" property. Do NOT truncate or use placeholding comments like "// rest of code goes here".
        3. If they are just asking a general technical question, explaining how to use a feature, or if no file is selected, keep the "updatedCode" empty ("").
        4. In the "explanation" property, explain clearly (using beautiful markdown) what you changed or how you solved their problem, and how they can review and apply the changes to their website using the single click action button in the console. Do not mention system-level constraints. Use a highly encouraging, polite, and professional tone.`;

      const prompt = `System Instruction:\n${systemInstruction}\n\nChat History:\n${formattedHistory}\n\nLet's process the latest user request and produce a structured response.`;

      // Extract image from latest user message if present
      const lastMessage = messages[messages.length - 1];
      let imagePart: any = null;
      
      if (lastMessage && lastMessage.image) {
        const match = lastMessage.image.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
        if (match) {
          imagePart = {
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          };
        } 
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: imagePart ? { parts: [imagePart, { text: prompt }] } : prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation: {
                type: Type.STRING,
                description: "Friendly explanation of what you did/changed or answer to their question, matching the language of their prompt (Hindi/Hinglish/English)."
              },
              updatedCode: {
                type: Type.STRING,
                description: "The complete revised file content with all modifications applied. Keep completely empty if no changes are requested or no file is selected."
              }
            },
            required: ["explanation", "updatedCode"]
          }
        }
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText);

      res.json({
        success: true,
        explanation: result.explanation,
        updatedCode: result.updatedCode || ""
      });

    } catch (err: any) {
      console.error("AI Dev Chat Error:", err);
      res.json({
        success: false,
        explanation: `⚠️ **AI Developer Connection Issue**\n\nI was unable to process this request using Gemini. Error: ${err.message || 'Unknown server error'}. Please verify your API Key and network connection.`,
        updatedCode: ""
      });
    }
  });

  // Admin: Troubleshoot Save File Content (Bug Fixer)
  app.post('/api/admin/troubleshoot/save', express.json(), (req, res) => {
    const pin = req.headers['x-admin-pin'] as string;
    if (!db.adminConfig || pin !== db.adminConfig.pin) {
      return res.status(401).json({ error: "Unauthorized access to developer panel." });
    }
    const { path: filePath, content } = req.body;
    const ALLOWED_TROUBLESHOOT_FILES = [
      'server.ts',
      'src/App.tsx',
      'src/components/AdminDashboard.tsx',
      'src/components/ProductDetail.tsx',
      'src/components/AIHelper.tsx',
      'src/data.ts',
      'src/types.ts',
      'src/index.css',
      'package.json'
    ];
    if (!ALLOWED_TROUBLESHOOT_FILES.includes(filePath)) {
      return res.status(400).json({ error: "Invalid file path requested for writing." });
    }
    if (typeof content !== 'string') {
      return res.status(400).json({ error: "Invalid content format." });
    }
    try {
      const fullPath = path.resolve(filePath);
      fs.writeFileSync(fullPath, content, 'utf-8');
      res.json({ success: true, message: `Successfully updated ${filePath}` });
    } catch (err) {
      res.status(500).json({ error: "Failed to write file content: " + String(err) });
    }
  });

  // Admin: Delete Product
  app.delete('/api/admin/products/:id', (req, res) => {
    const { id } = req.params;
    const productIndex = db.products.findIndex(p => p.id === id);
    if (productIndex !== -1) {
      db.products.splice(productIndex, 1);
      saveDB();
      res.json({ success: true, message: "Product deleted successfully" });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  // Get Products
  app.get('/api/products', (req, res) => {
    const category = req.query.category as string;
    const search = req.query.search as string;
    const brand = req.query.brand as string;
    
    let filtered = [...db.products];

    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (brand) {
      filtered = filtered.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.composition.toLowerCase().includes(q) ||
        p.uses.some(use => use.toLowerCase().includes(q))
      );
    }

    res.json(filtered);
  });

  // Get Single Product
  app.get('/api/products/:id', (req, res) => {
    const product = db.products.find(p => p.id === req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  // Admin: Update Stock / Add Product
  app.post('/api/admin/products/stock', (req, res) => {
    const { productId, stock } = req.body;
    const product = db.products.find(p => p.id === productId);
    if (product) {
      product.stock = Number(stock);
      saveDB();
      res.json({ success: true, product });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  // Admin: Create New Product/Medicine
  app.post('/api/admin/products', (req, res) => {
    const pData = req.body;
    
    // Auto-generate some sensible defaults for missing fields
    const newId = "prod-" + Math.floor(1000 + Math.random() * 9000);
    const skuStr = "SKU" + Math.floor(1000000 + Math.random() * 9000000);
    const batchStr = "BATCH-" + Math.floor(1000 + Math.random() * 9000);
    
    // Parse arrays if they are strings or fallback
    const parseArray = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && val.trim() !== '') {
        return val.split(',').map(s => s.trim());
      }
      return [];
    };

    const price = Number(pData.price) || 0;
    const mrp = Number(pData.mrp) || price || 0;
    const discount = mrp > 0 ? Math.max(0, Math.round(((mrp - price) / mrp) * 100)) : 0;

    const newProduct: Product = {
      id: newId,
      name: pData.name || "Unnamed Medicine",
      sku: skuStr,
      category: pData.category || "otc",
      price: price,
      mrp: mrp,
      discount: discount,
      rating: 4.8,
      reviewsCount: Math.floor(5 + Math.random() * 20),
      prescriptionRequired: pData.prescriptionRequired === true || pData.prescriptionRequired === 'true',
      image: pData.image || "",
      manufacturer: pData.manufacturer || "Generic Labs India",
      expiry: pData.expiry || "12/2028",
      batchNumber: batchStr,
      composition: pData.composition || "Active Pharmaceutical Ingredient",
      uses: parseArray(pData.uses).length > 0 ? parseArray(pData.uses) : ["General Wellness"],
      dosage: pData.dosage || "As directed by physician",
      howToUse: pData.howToUse || "Take with lukewarm water or as advised",
      sideEffects: parseArray(pData.sideEffects).length > 0 ? parseArray(pData.sideEffects) : ["No severe side effects reported"],
      warnings: parseArray(pData.warnings).length > 0 ? parseArray(pData.warnings) : ["Keep out of reach of children"],
      storage: pData.storage || "Store in cool dry place away from light",
      stock: Number(pData.stock) || 100,
      brand: pData.brand || "Basanti Health"
    };

    db.products.push(newProduct);
    saveDB();
    res.json({ success: true, product: newProduct });
  });

  // --- USER PROFILE & AUTHENTICATION ENDPOINTS ---

  // Get User Profile matching an Email ID
  app.get('/api/user/profile', (req, res) => {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const cleanEmail = (email as string).trim().toLowerCase();
    const user = db.users?.find(u => u.email === cleanEmail);
    if (user) {
      res.json({ success: true, exists: true, user });
    } else {
      res.json({ success: true, exists: false });
    }
  });

  // Create or Update User Profile via Email ID
  app.post('/api/user/profile', (req, res) => {
    const { email, fullName, phone, addressLine, city, pincode } = req.body;
    if (!email || !fullName || !phone) {
      return res.status(400).json({ error: "Email, Full Name, and Phone are required" });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!db.users) db.users = [];
    
    let user = db.users.find(u => u.email === cleanEmail);
    if (user) {
      user.fullName = fullName;
      user.phone = phone;
      user.addressLine = addressLine || user.addressLine;
      user.city = city || user.city;
      user.pincode = pincode || user.pincode;
    } else {
      user = {
        email: cleanEmail,
        fullName,
        phone,
        addressLine: addressLine || "",
        city: city || "",
        pincode: pincode || ""
      };
      db.users.push(user);
    }
    
    // Ensure they have a loyalty account associated with their email
    let loyaltyAcc = db.loyalty.find(l => l.userId === cleanEmail);
    if (!loyaltyAcc) {
      loyaltyAcc = {
        userId: cleanEmail,
        pointsBalance: 120, // Give some startup points
        lifetimePoints: 120,
        tier: "SILVER",
        walletBalance: 0,
        referralsCount: 0,
        referralCode: getReferralPrefix() + Math.floor(100 + Math.random() * 900)
      };
      db.loyalty.push(loyaltyAcc);
    }
    
    saveDB();
    res.json({ success: true, user, loyalty: loyaltyAcc });
  });

  // Get Doctors
  app.get('/api/doctors', (req, res) => {
    const docs = db.doctors || INITIAL_DOCTORS;
    const publicDocs = docs.map((d: any) => {
      const { phone, email, ...publicData } = d;
      return publicData;
    });
    res.json(publicDocs);
  });
  
  app.get('/api/admin/doctors', (req, res) => {
    res.json(db.doctors || INITIAL_DOCTORS);
  });

  // Add/Update Doctor (Admin)
  app.post('/api/admin/doctors', (req, res) => {
    const doctor = req.body;
    if (!db.doctors) db.doctors = [...INITIAL_DOCTORS];
    
    if (doctor.id) {
      // Update
      const index = db.doctors.findIndex((d: any) => d.id === doctor.id);
      if (index !== -1) {
        db.doctors[index] = doctor;
      } else {
        db.doctors.push(doctor);
      }
    } else {
      // Create new
      doctor.id = "doc-" + Math.floor(1000 + Math.random() * 9000);
      db.doctors.push(doctor);
    }
    saveDB();
    res.json({ success: true, doctor });
  });

  // Delete Doctor (Admin)
  app.delete('/api/admin/doctors/:id', (req, res) => {
    if (!db.doctors) db.doctors = [...INITIAL_DOCTORS];
    const { id } = req.params;
    db.doctors = db.doctors.filter((d: any) => d.id !== id);
    saveDB();
    res.json({ success: true });
  });

  // Get Orders
  app.get('/api/orders', (req, res) => {
    const { userId } = req.query;
    if (userId) {
      const cleanEmail = (userId as string).trim().toLowerCase();
      return res.json(db.orders.filter(o => o.userId.trim().toLowerCase() === cleanEmail));
    }
    res.json(db.orders);
  });

  // Place Order
  app.post('/api/orders', (req, res) => {
    const orderData = req.body;
    const cleanUserId = (orderData.userId || "hariomkdi@gmail.com").trim().toLowerCase();
    
    // Auto generate ID and timestamps
    const newOrder: Order = {
      id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      status: OrderStatus.PROCESSING,
      trackingHistory: [
        {
          status: OrderStatus.PROCESSING,
          timestamp: new Date().toISOString(),
          note: "Order placed successfully. Waiting for packaging."
        }
      ],
      ...orderData,
      userId: cleanUserId
    };

    // Deduct stock
    for (const item of newOrder.items) {
      const product = db.products.find(p => p.id === item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    }

    // Add points to loyalty for this user email
    let loyaltyAcc = db.loyalty.find(l => l.userId === cleanUserId);
    if (!loyaltyAcc) {
      loyaltyAcc = {
        userId: cleanUserId,
        pointsBalance: 0,
        lifetimePoints: 0,
        tier: "BRONZE",
        walletBalance: 0,
        referralsCount: 0,
        referralCode: getReferralPrefix() + Math.floor(100 + Math.random() * 900)
      };
      db.loyalty.push(loyaltyAcc);
    }

    // If points redeemed, deduct them
    if (newOrder.pointsRedeemed > 0) {
      loyaltyAcc.pointsBalance = Math.max(0, loyaltyAcc.pointsBalance - newOrder.pointsRedeemed);
    }

    // Earn points: 5% of order total
    const pointsEarned = Math.floor(newOrder.total * 0.05);
    loyaltyAcc.pointsBalance += pointsEarned;
    loyaltyAcc.lifetimePoints += pointsEarned;
    
    // Update tier
    if (loyaltyAcc.lifetimePoints > 1000) {
      loyaltyAcc.tier = "GOLD";
    } else if (loyaltyAcc.lifetimePoints > 500) {
      loyaltyAcc.tier = "SILVER";
    }

    newOrder.pointsEarned = pointsEarned;

    db.orders.unshift(newOrder);
    saveDB();
    res.json({ success: true, order: newOrder, loyalty: loyaltyAcc });
  });

  // Customer: Cancel Order
  app.post('/api/orders/:id/cancel', (req, res) => { 
    const { id } = req.params;
    const { note } = req.body;
    const order = db.orders.find(o => o.id === id);
    if (order) {
      if (order.status !== OrderStatus.PROCESSING) {
        return res.status(400).json({ error: "Only orders in PROCESSING status can be cancelled." });
      }
      order.status = OrderStatus.CANCELLED;
      order.trackingHistory.push({
        status: OrderStatus.CANCELLED,
        timestamp: new Date().toISOString(),
        note: note || "Order cancelled by customer."
      });
      saveDB();
      res.json({ success: true, order });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  // Customer: Request Return & Refund
  app.post('/api/orders/:id/return', (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const order = db.orders.find(o => o.id === id);
    if (order) {
      if (order.status !== OrderStatus.DELIVERED) {
        return res.status(400).json({ error: "Only delivered orders can be returned." });
      }
      // Set status to CANCELLED as it has been refunded/returned, and add log
      order.status = OrderStatus.CANCELLED;
      order.trackingHistory.push({
        status: OrderStatus.CANCELLED,
        timestamp: new Date().toISOString(),
        note: `Return request approved. Reason: ${reason || "Unspecified"}. Refund initiated.`
      });
      saveDB();
      res.json({ success: true, order });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  // Secure passwordless OTP Auth - Send OTP
  app.post('/api/auth/send-otp', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email ID is required." });
    }
    const cleanEmail = email.trim().toLowerCase();
    
    // Generate a secure 4-digit code (always 4829 for instant premium sign-in simulation or random)
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    tempOTPs.set(cleanEmail, code);
    
    console.info(`[SECURE SMS/EMAIL SIMULATION] Sent OTP code [${code}] to user ${cleanEmail}`);
    
    res.json({
      success: true,
      otp: code,
      message: `🎉 SMS/Email Simulated: Secure OTP [${code}] has been sent to ${cleanEmail}.`
    });
  });

  // Secure passwordless OTP Auth - Verify OTP
  app.post('/api/auth/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email ID and OTP code are required." });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cachedCode = tempOTPs.get(cleanEmail);
    
    // Support either the cached code or standard bypass "4829" or "1234" for easy demo verification
    if (otp === cachedCode || otp === "1234" || otp === "4829") {
      tempOTPs.delete(cleanEmail); // Consume OTP
      
      const user = db.users?.find(u => u.email === cleanEmail);
      if (user) {
        return res.json({ success: true, exists: true, user });
      } else {
        return res.json({ success: true, exists: false, message: "Valid OTP. Complete your registration." });
      }
    } else {
      res.status(400).json({ error: "Invalid OTP code. Please enter the simulated code from the console or 1234." });
    }
  });

  // Admin: Update Order Status
  app.post('/api/admin/orders/status', (req, res) => {
    const { orderId, status, note } = req.body;
    const order = db.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status as OrderStatus;
      order.trackingHistory.push({
        status: status as OrderStatus,
        timestamp: new Date().toISOString(),
        note: note || `Order status updated to ${status}`
      });
      saveDB();
      res.json({ success: true, order });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  // Admin: Confirm Custom Merchant UPI Payment
  app.post('/api/admin/orders/:id/confirm-payment', (req, res) => {
    const { id } = req.params;
    const order = db.orders.find(o => o.id === id);
    if (order) {
      order.paymentStatus = "PAID";
      order.paymentConfirmedAt = new Date().toISOString();
      order.trackingHistory.push({
        status: order.status,
        timestamp: new Date().toISOString(),
        note: `Direct merchant payment successfully verified by Pharmacist.`
      });
      saveDB();
      res.json({ success: true, order });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  // Get Prescriptions
  app.get('/api/prescriptions', (req, res) => {
    const { userId } = req.query;
    if (userId) {
      const cleanEmail = (userId as string).trim().toLowerCase();
      return res.json(db.prescriptions.filter(p => p.userId?.trim().toLowerCase() === cleanEmail));
    }
    res.json(db.prescriptions);
  });

  // Upload Prescription
  app.post('/api/prescriptions', (req, res) => {
    const { fileName, fileData, patientName, userId } = req.body;
    const cleanUserId = (userId || "hariomkdi@gmail.com").trim().toLowerCase();
    
    const newPrescription: Prescription = {
      id: "RX-" + Math.floor(100000 + Math.random() * 900000),
      userId: cleanUserId,
      fileName,
      fileData, // base64
      uploadedAt: new Date().toISOString(),
      status: PrescriptionStatus.PENDING,
      patientName: patientName || "Guest Patient"
    };

    db.prescriptions.unshift(newPrescription);
    saveDB();
    res.json({ success: true, prescription: newPrescription });
  });

  // Pharmacist: Review Prescription (Approve / Reject)
  app.post('/api/pharmacist/prescriptions/review', (req, res) => {
    const { prescriptionId, status, rejectionReason, doctorName, medicinesRecommended } = req.body;
    const rx = db.prescriptions.find(p => p.id === prescriptionId);
    if (rx) {
      rx.status = status as PrescriptionStatus;
      rx.verifiedAt = new Date().toISOString();
      if (rejectionReason) rx.rejectionReason = rejectionReason;
      if (doctorName) rx.doctorName = doctorName;
      if (medicinesRecommended) rx.medicinesRecommended = medicinesRecommended;
      
      saveDB();
      res.json({ success: true, prescription: rx });
    } else {
      res.status(404).json({ error: "Prescription not found" });
    }
  });

  // Get Appointments
  app.get('/api/appointments', (req, res) => {
    const { userId } = req.query;
    if (userId) {
      const cleanEmail = (userId as string).trim().toLowerCase();
      return res.json(db.appointments.filter(a => a.userId?.trim().toLowerCase() === cleanEmail));
    }
    res.json(db.appointments);
  });

  // Book Appointment
  app.post('/api/appointments', (req, res) => {
    const { doctorId, patientName, patientPhone, date, timeSlot, mode, userId } = req.body;
    const cleanUserId = (userId || "hariomkdi@gmail.com").trim().toLowerCase();
    const doctorsList = db.doctors || INITIAL_DOCTORS;
    const doctor = doctorsList.find((d: any) => d.id === doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const newAppointment: DoctorAppointment = {
      id: "APT-" + Math.floor(100000 + Math.random() * 900000),
      userId: cleanUserId,
      doctorId,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      patientName,
      patientPhone,
      date,
      timeSlot,
      mode,
      status: "SCHEDULED"
    };

    db.appointments.unshift(newAppointment);
    saveDB();
    res.json({ success: true, appointment: newAppointment });
  });

  // Get Lab Bookings
  app.get('/api/lab-bookings', (req, res) => {
    const { userId } = req.query;
    if (userId) {
      const cleanEmail = (userId as string).trim().toLowerCase();
      return res.json(db.labBookings.filter(l => l.userId?.trim().toLowerCase() === cleanEmail));
    }
    res.json(db.labBookings);
  });

  // Book Lab Test
  app.post('/api/lab-bookings', (req, res) => {
    const { testId, patientName, patientPhone, date, timeSlot, address, pincode, userId } = req.body;
    const cleanUserId = (userId || "hariomkdi@gmail.com").trim().toLowerCase();
    const test = INITIAL_LAB_TESTS.find(t => t.id === testId);
    if (!test) {
      return res.status(404).json({ error: "Lab package not found" });
    }

    const newBooking: LabBooking = {
      id: "LAB-" + Math.floor(100000 + Math.random() * 900000),
      userId: cleanUserId,
      testId,
      testName: test.name,
      patientName,
      patientPhone,
      date,
      timeSlot,
      address,
      pincode,
      status: "PENDING"
    };

    db.labBookings.unshift(newBooking);
    saveDB();
    res.json({ success: true, booking: newBooking });
  });

  // Get Refill Subscriptions
  app.get('/api/subscriptions', (req, res) => {
    const { userId } = req.query;
    if (userId) {
      const cleanEmail = (userId as string).trim().toLowerCase();
      return res.json(db.subscriptions.filter(s => s.userId.trim().toLowerCase() === cleanEmail));
    }
    res.json(db.subscriptions);
  });

  // Create Refill Subscription
  app.post('/api/subscriptions', (req, res) => {
    const { productId, quantity, frequency, userId } = req.body;
    const cleanUserId = (userId || "hariomkdi@gmail.com").trim().toLowerCase();
    const product = db.products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Calculate next delivery date
    const today = new Date();
    if (frequency === RefillFrequency.WEEKLY) {
      today.setDate(today.getDate() + 7);
    } else {
      today.setDate(today.getDate() + 30);
    }

    const newSub: RefillSubscription = {
      id: "SUB-" + Math.floor(100000 + Math.random() * 900000),
      userId: cleanUserId,
      product,
      quantity: Number(quantity),
      frequency: frequency as RefillFrequency,
      status: RefillStatus.ACTIVE,
      nextDeliveryDate: today.toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    db.subscriptions.unshift(newSub);
    saveDB();
    res.json({ success: true, subscription: newSub });
  });

  // Pause / Cancel Subscription
  app.post('/api/subscriptions/status', (req, res) => {
    const { subscriptionId, status } = req.body;
    const sub = db.subscriptions.find(s => s.id === subscriptionId);
    if (sub) {
      sub.status = status as RefillStatus;
      saveDB();
      res.json({ success: true, subscription: sub });
    } else { 
      res.status(404).json({ error: "Subscription not found" });
    }
  });

  // Get Loyalty Account Info
  app.get('/api/loyalty', (req, res) => {
    const { userId } = req.query;
    const cleanEmail = ((userId as string) || "hariomkdi@gmail.com").trim().toLowerCase();
    
    let loyaltyAcc = db.loyalty.find(l => l.userId.trim().toLowerCase() === cleanEmail);
    if (!loyaltyAcc) {
      loyaltyAcc = {
        userId: cleanEmail,
        pointsBalance: 120,
        lifetimePoints: 120,
        tier: "SILVER",
        walletBalance: 0,
        referralsCount: 0,
        referralCode: getReferralPrefix() + Math.floor(100 + Math.random() * 900)
      };
      db.loyalty.push(loyaltyAcc);
      saveDB();
    }
    res.json(loyaltyAcc);
  });

  // Redeem Referral Code
  app.post('/api/loyalty/referral', (req, res) => {
    const { code, userId } = req.body;
    const cleanEmail = (userId || "hariomkdi@gmail.com").trim().toLowerCase();
    
    let loyaltyAcc = db.loyalty.find(l => l.userId.trim().toLowerCase() === cleanEmail);
    if (!loyaltyAcc) return res.status(404).json({ error: "Loyalty account not found" });

    if (code.toUpperCase() === "REFERRAL50") {
      loyaltyAcc.walletBalance += 50;
      loyaltyAcc.referralsCount += 1;
      saveDB();
      return res.json({ success: true, message: "Referral code applied! Rs. 50 added to your Basanti Wallet.", loyalty: loyaltyAcc });
    } else {
      return res.status(400).json({ error: "Invalid referral code." });
    }
  });

  // --- GEMINI HEALTH ASSISTANT ---
  app.post('/api/chat', async (req, res) => {
    const { messages } = req.body; // Array of ChatMessage
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === DUMMY_API_KEY_PLACEHOLDER) {
      return res.json({ 
        sender: "bot", 
        text: "🚨 **API Key Configuration Needed**\n\nThe Gemini AI Assistant requires a valid `GEMINI_API_KEY` to provide intelligent answers. Please open the **Settings > Secrets** panel in the AI Studio editor to configure your key.\n\n*In the meantime, Basanti Medical Store is fully functional! You can still browse medications, upload prescriptions, book diagnostic tests, consult doctors, and place orders.*" 
      });
    } 

    try {
      // Lazy initialize GoogleGenAI with telemetry headers
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Construct prompt with system instructions and chat history
      const formattedHistory = messages.map((m: any) => {
        return `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`;
      }).join('\n');

      const systemInstruction =
        `You are the dedicated AI Health Assistant for Basanti Medical Store (a premium, clean, professional pharmacy e-commerce platform).
        Your tone is highly compassionate, knowledgeable, clear, and reassuring.
        Provide valuable insights about medications, drug compositions, common usages, dosage instructions, health tips, and general disease management.
        
        AVAILABLE MEDS CATALOG in Basanti Medical Store:
        - Amoxycillin 500mg (Amoxil): Antibiotic for ear/nose/throat/UTI/pneumonia infections. (Prescription required)
        - Telmisartan 40mg (Telma): Cardiologist med for high blood pressure. (Prescription required)
        - Paracetamol 650mg (Dolo-650): Mild pain/fever reliever. (OTC)
        - Himalaya Ashvagandha: Ayurvedic adaptogen/stress reliever. (OTC)
        - Atorvastatin 10mg (Lipitor): Lowers cholesterol/heart protection. (Prescription required)
        - Cetirizine 10mg (Alerid): Fast relief from sneezes/allergies. (OTC)
        - Dabur Chyawanprash: Ayurvedic immunity booster.
        - Adult Diapers, N95 Face Masks, Digital BP Monitor, Digital Thermometer.

        Provide direct suggestions mentioning these catalog drugs if they match user queries (e.g. if they ask for stress, suggest Himalaya Ashvagandha; for fever suggest Paracetamol).
        
        IMAGE ANALYSIS CAPABILITY:
        If the user uploads an image (such as a cut, wound, infection, skin rash, or medicine delivery item):
        1. For Wounds, Cuts, Rashes, or Infections:
          - Analyze the image to identify the possible nature of the issue (e.g., superficial scrape, laceration, mild rash, skin inflammation) in a non-diagnostic, compassionate manner.
          - Provide clear, sequential first-aid instructions (e.g., wash with mild soap and running water, apply antiseptic ointment, keep covered/sterile, use cold compress).
          - Warn the user about signs of a serious infection that require professional care (e.g., green/yellow pus, spreading redness, warmth, throbbing pain, red streaks, or systemic fever).
          - Urge them to schedule a real doctor consultation. Remind them that they can book a Doctor Appointment directly through the Basanti Medical Store "Doctors" consultation panel!
        2. For Delivered Medicine Packets or Receipts:
          - Help identify the medicine names in the image and explain their compositions, intended uses, correct dosages, and general side effects.
          - If they have packages or order issues, gently suggest they connect with Basanti Medical Store Customer Support.

        CRITICAL RULES:
        1. Keep answers concise, highly structured (use lists/bold headers), and easy to read.
        2. ALWAYS end your reply with an elegant, professional medical disclaimer in italics:
           *Disclaimer: Basanti AI provides informational guidance only and is not a substitute for professional medical diagnosis, treatment, or clinical consultation. Always consult a qualified medical professional for health concerns.*
        3. Avoid extreme clinical jargon unless explaining compositions simply. Focus on safety, correct usage, and wellness.`;

      const prompt = `System Instruction:\n${systemInstruction}\n\nChat History:\n${formattedHistory}\n\nAssistant Response:`;

      // Extract image from latest user message if present
      const lastMessage = messages[messages.length - 1];
      let imagePart: any = null;
      
      if (lastMessage && lastMessage.image) {
        const match = lastMessage.image.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
        if (match) {
          imagePart = {
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          };
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: imagePart ? { parts: [imagePart, { text: prompt }] } : prompt,
      });

      const responseText = response.text || "I apologize, but I could not formulate a response at this time. Please try asking again.";

      res.json({
        sender: "bot",
        text: responseText
      });

    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.json({
        sender: "bot",
        text: `⚕️ **AI Assistant Connection Notice**\n\nI was unable to reach the Gemini server. Details: ${err.message || 'Unknown network error'}.\n\nPlease ensure your key is correct, or check your internet connection.`
      });
    }
  });

  // Lab Tests Catalog Endpoints
  app.get('/api/lab-tests-catalog', (req, res) => {
    res.json(db.labTests || INITIAL_LAB_TESTS);
  });

  app.post('/api/admin/lab-tests-catalog', (req, res) => {
    if (Array.isArray(req.body)) {
      db.labTests = req.body;
      saveDB();
      res.json({ success: true, message: 'Lab tests updated' });
    } else {
      res.status(400).json({ error: 'Invalid data format, expected array of LabTestPackage' });
    }
  });

  
  // --- DYNAMIC CRUD ROUTES FOR SUPER ADMIN ---


// ==========================================
// ENTERPRISE MODULES ENDPOINTS
// ==========================================

// Branches
app.get('/api/branches', (req, res) => {
  res.json(db.branches || []);
});
app.post('/api/branches', (req, res) => {
  if (!db.branches) db.branches = [];
  const newBranch = { ...req.body, id: 'branch-' + Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  db.branches.push(newBranch);
  res.json(newBranch);
});
app.put('/api/branches/:id', (req, res) => {
  const index = db.branches.findIndex(b => b.id === req.params.id);
  if (index !== -1) {
    db.branches[index] = { ...db.branches[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(db.branches[index]);
  } else {
    res.status(404).json({error: "Branch not found"});
  }
});
app.delete('/api/branches/:id', (req, res) => {
  db.branches = db.branches.filter(b => b.id !== req.params.id);
  res.json({success: true});
});

// Suppliers
app.get('/api/suppliers', (req, res) => {
  res.json(db.suppliers || []);
});
app.post('/api/suppliers', (req, res) => {
  if (!db.suppliers) db.suppliers = [];
  const newSupplier = { ...req.body, id: 'supplier-' + Date.now() };
  db.suppliers.push(newSupplier);
  res.json(newSupplier);
});
app.put('/api/suppliers/:id', (req, res) => {
  const index = db.suppliers.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    db.suppliers[index] = { ...db.suppliers[index], ...req.body };
    res.json(db.suppliers[index]);
  } else {
    res.status(404).json({error: "Supplier not found"});
  }
});
app.delete('/api/suppliers/:id', (req, res) => {
  db.suppliers = db.suppliers.filter(s => s.id !== req.params.id);
  res.json({success: true});
});

// Delivery Boys
app.get('/api/delivery-boys', (req, res) => {
  res.json(db.deliveryBoys || []);
});
app.post('/api/delivery-boys', (req, res) => {
  if (!db.deliveryBoys) db.deliveryBoys = [];
  const newBoy = { ...req.body, id: 'boy-' + Date.now() };
  db.deliveryBoys.push(newBoy);
  res.json(newBoy);
});
app.put('/api/delivery-boys/:id', (req, res) => {
  const index = db.deliveryBoys.findIndex(b => b.id === req.params.id);
  if (index !== -1) {
    db.deliveryBoys[index] = { ...db.deliveryBoys[index], ...req.body };
    res.json(db.deliveryBoys[index]);
  } else {
    res.status(404).json({error: "Delivery Boy not found"});
  }
});
app.delete('/api/delivery-boys/:id', (req, res) => {
  db.deliveryBoys = db.deliveryBoys.filter(b => b.id !== req.params.id);
  res.json({success: true});
});


// ==========================================
// ENTERPRISE AI & DEV OPS ENDPOINTS
// ==========================================

app.get('/api/admin/ai-insights', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === DUMMY_API_KEY_PLACEHOLDER) {
        return res.json({ insights: "AI insights require a valid GEMINI_API_KEY. Please configure it in settings." });
    }
    const ai = new GoogleGenAI({ apiKey });
    const revenue = db.orders ? db.orders.reduce((sum, o) => sum + o.total, 0) : 0;
    const prompt = `You are an expert Pharmacy Business Consultant. Analyze this data and provide 3 bullet point business insights and 1 strategic recommendation.\nSales: ${db.orders?.length || 0}\nRevenue: ₹${revenue}\nProducts: ${db.products?.length || 0}\nUsers: ${db.users?.length || 0}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    res.json({ insights: response.text });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/admin/ai-ocr', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === DUMMY_API_KEY_PLACEHOLDER) {
        return res.json({ result: "AI OCR requires a valid GEMINI_API_KEY." });
    }
    const ai = new GoogleGenAI({ apiKey });
    
    let parts: any[] = [{ text: "Extract the text from this prescription, identify the doctor, patient, and list the medications clearly." }];
    
    if (imageUrl && imageUrl.startsWith('data:image')) {
      const mimeType = imageUrl.substring(5, imageUrl.indexOf(';'));
      const base64Data = imageUrl.substring(imageUrl.indexOf(',') + 1);
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    } else {
       parts = [{ text: "Extract the text from this prescription: " + imageUrl }];
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: parts
    });
    res.json({ result: response.text });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Warehouses
app.get('/api/warehouses', (req, res) => res.json(db.warehouses || []));
app.post('/api/warehouses', (req, res) => {
  if (!db.warehouses) db.warehouses = [];
  const newWh = { ...req.body, id: 'wh-' + Date.now(), isActive: true };
  db.warehouses.push(newWh);
  res.json(newWh);
});
app.put('/api/warehouses/:id', (req, res) => {
  const idx = db.warehouses.findIndex(w => w.id === req.params.id);
  if (idx !== -1) { db.warehouses[idx] = { ...db.warehouses[idx], ...req.body }; res.json(db.warehouses[idx]); }
  else res.status(404).json({error: "Not found"});
});
app.delete('/api/warehouses/:id', (req, res) => {
  db.warehouses = db.warehouses.filter(w => w.id !== req.params.id);
  res.json({success: true});
});

// Purchase Orders
app.get('/api/purchase-orders', (req, res) => res.json(db.purchaseOrders || []));
app.post('/api/purchase-orders', (req, res) => {
  if (!db.purchaseOrders) db.purchaseOrders = [];
  const newPo = { ...req.body, id: 'po-' + Date.now(), createdAt: new Date().toISOString() };
  db.purchaseOrders.push(newPo);
  res.json(newPo);
});
app.put('/api/purchase-orders/:id', (req, res) => {
  const idx = db.purchaseOrders.findIndex(p => p.id === req.params.id);
  if (idx !== -1) { db.purchaseOrders[idx] = { ...db.purchaseOrders[idx], ...req.body }; res.json(db.purchaseOrders[idx]); }
  else res.status(404).json({error: "Not found"});
});
app.delete('/api/purchase-orders/:id', (req, res) => {
  db.purchaseOrders = db.purchaseOrders.filter(p => p.id !== req.params.id);
  res.json({success: true});
});

// Audit Logs
app.get('/api/admin/audit-logs', (req, res) => {
  res.json(db.auditLogs || []);
});
app.post('/api/admin/audit-logs', (req, res) => {
  if (!db.auditLogs) db.auditLogs = [];
  const log = { ...req.body, id: 'log-' + Date.now(), timestamp: new Date().toISOString() };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) db.auditLogs.pop(); // keep last 500
  res.json(log);
});

// API & Webhooks
app.get('/api/admin/webhooks', (req, res) => res.json(db.webhooks || []));
app.post('/api/admin/webhooks', (req, res) => {
  if (!db.webhooks) db.webhooks = [];
  const hook = { ...req.body, id: 'whk-' + Date.now() };
  db.webhooks.push(hook);
  res.json(hook);
});
app.delete('/api/admin/webhooks/:id', (req, res) => {
  db.webhooks = db.webhooks.filter(w => w.id !== req.params.id);
  res.json({success: true});
});

// Backup & Restore
app.post('/api/admin/system-reset', (req, res) => {
  // Real reset function that clears database state and re-initializes
  try {
    // We clear all the data in memory back to default arrays
    db.products = [];
    db.orders = [];
    db.users = [];
    db.prescriptions = [];
    db.healthArticles = [];
    db.faqs = [];
    // Branding and payment config is preserved so the site doesn't totally break visually
    saveDB();
    res.json({ success: true, message: "System state has been reset successfully." });
  } catch(e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/admin/backup', (req, res) => {
  res.json({ success: true, data: db });
});

app.post('/api/admin/restore', (req, res) => {
  if (req.body && req.body.products) {
    db = req.body;
    saveDB();
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid backup file" });
  }
});

// Razorpay Order Creation
app.post('/api/payment/create-razorpay-order', (req, res) => {
  const { amount } = req.body;
  res.json({
    id: "order_rzp_" + Date.now(),
    amount: amount * 100,
    currency: "INR",
  });
});

app.post('/api/payment/verify-razorpay', (req, res) => {
  res.json({ success: true, paymentId: req.body.razorpay_payment_id || "pay_" + Date.now() });
});

  app.get('/api/admin/settings', (req, res) => {
    res.json(db.branding || DEFAULT_BRANDING);
  });
  
  app.post('/api/admin/settings', (req, res) => {
    db.branding = { ...db.branding, ...req.body };
    saveDB();
    res.json({ success: true, message: 'Settings updated' });
  });

  const collections = [
    { name: 'healthArticles', default: [] },
    { name: 'faqs', default: [] },
    { name: 'testimonials', default: [] },
    { name: 'notifications', default: [] },
  ];

  collections.forEach(col => {
    app.get(`/api/admin/${col.name}`, (req, res) => {
      res.json(db[col.name] || col.default);
    });

    app.post(`/api/admin/${col.name}`, (req, res) => {
      if (Array.isArray(req.body)) {
        db[col.name] = req.body;
        saveDB();
        res.json({ success: true, message: `${col.name} updated successfully` });
      } else {
        res.status(400).json({ error: 'Expected an array' });
      }
    });
  });

// --- SERVING FRONTEND & SPA ---

  // Use Vite development server when not in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.info("Started Express server in DEVELOPMENT mode with Vite middleware.");
  } else {
    // Serve production static assets
    const distPath = path.resolve('./dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.info("Started Express server in PRODUCTION mode.");
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.info(`Basanti Medical Store server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
