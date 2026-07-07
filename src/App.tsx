/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  ShoppingBag, Search, Pill, Shield, PhoneCall, Calendar, 
  MapPin, User, Heart, Trash2, Check, ArrowRight, Star, 
  Upload, Sparkles, Activity, LineChart, Award, RefreshCw, FileText, 
  Menu, X, Lock, CheckCircle, ChevronRight, AlertCircle, Sparkle,
  Mail, ArrowLeft, Key, LogOut, Truck, Bell, Printer, Plus
} from 'lucide-react';

import { 
  Product, CartItem, Prescription, Order, DoctorAppointment, Doctor, 
  LabBooking, RefillSubscription, LoyaltyAccount, Coupon, 
  PrescriptionStatus, OrderStatus, RefillFrequency, RefillStatus,
  UserProfile, SiteBranding, PaymentConfig, LabTestPackage, Advertisement
} from './types';
import { CATEGORIES, INITIAL_DOCTORS, INITIAL_LAB_TESTS, INITIAL_COUPONS } from './data';
import { motion } from 'motion/react';

import AIHelper from './components/AIHelper';

const AboutUsModal = lazy(() => import('./components/AboutUsModal').then(m => ({ default: m.AboutUsModal })));
const InvestModal = lazy(() => import('./components/InvestModal').then(m => ({ default: m.InvestModal })));
const GalleryModal = lazy(() => import('./components/GalleryModal').then(m => ({ default: m.GalleryModal })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const ProductDetail = lazy(() => import('./components/ProductDetail'));






import AdvertisementBanner from './components/AdvertisementBanner';


const renderBrandingIcon = (iconName: string, className = "w-6 h-6 rotate-45") => {
  switch (iconName) {
    case "Pill": return <Pill className={className} />;
    case "Heart": return <Heart className={className} />;
    case "Activity": return <Activity className={className} />;
    case "Sparkles": return <Sparkles className={className} />;
    case "ShoppingBag": return <ShoppingBag className={className} />;
    case "Shield": return <Shield className={className} />;
    default: return <Pill className={className} />;
  }
};


const ProductCard: React.FC<{ p: Product, onAddToCart: (p: Product, q: number) => void, onBuyNow: (p: Product, q: number) => void, onSelectProduct: (p: Product) => void, onRxClick?: () => void }> = ({ p, onAddToCart, onBuyNow, onSelectProduct, onRxClick }) => {
  const [qty, setQty] = useState(1);
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between overflow-hidden group">
      {/* Product Image Section */}
      <div onClick={() => onSelectProduct(p)} className="p-2 sm:p-4 cursor-pointer relative bg-slate-50/45 flex items-center justify-center">
        <img src={p.image} alt={p.name} className="w-full h-28 sm:h-40 object-contain rounded-xl sm:rounded-2xl transition-transform duration-300 group-hover:scale-102" />
        
        {p.prescriptionRequired && (
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); if (onRxClick) onRxClick(); }} 
            className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-600 hover:bg-red-700 cursor-pointer text-[7px] sm:text-[9px] font-black uppercase text-white px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-md transition-colors z-10"
            title="Upload Prescription Required"
          >
            <Shield className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
            <span>Rx Req</span>
          </button>
        )}
        
        <span className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-50 text-red-600 border border-red-100/60 text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-2xs">
          {p.discount}% OFF
        </span>
      </div>

      {/* Product Details & Actions Section */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 space-y-2">
        <div className="space-y-1">
          <span className="text-[8px] sm:text-[10px] text-blue-600 uppercase font-black tracking-widest block">{p.brand}</span>
          <h4 
            onClick={() => onSelectProduct(p)} 
            className="font-extrabold text-xs sm:text-sm text-slate-800 hover:text-blue-600 cursor-pointer line-clamp-2 leading-snug min-h-[32px] sm:min-h-[40px] transition-colors"
            title={p.name}
          >
            {p.name}
          </h4>
          
          <div className="flex items-center gap-1 text-[9px] sm:text-[11px] text-amber-500">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            <span className="font-extrabold">{p.rating}</span>
            <span className="text-gray-400 font-medium">({p.reviewsCount})</span>
          </div>
        </div>

        <div>
          {/* Price Tag Row */}
          <div className="flex items-baseline justify-between gap-1 flex-wrap pt-0.5 border-t border-slate-50">
            <div className="flex items-baseline gap-1">
              <span className="font-black text-blue-900 text-xs sm:text-base">₹{p.price * qty}</span>
              <span className="text-[9px] sm:text-xs text-gray-400 line-through">₹{p.mrp * qty}</span>
            </div>
            
            {/* Quantity Selector inside Price row for ultra-clean spacing */}
            <div className="flex items-center border border-slate-200 bg-slate-50/50 rounded-lg overflow-hidden h-6 shrink-0 shadow-2xs">
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setQty(Math.max(1, qty - 1)); }} 
                className="px-1.5 font-bold cursor-pointer hover:bg-slate-200 text-slate-600 text-xs flex items-center justify-center"
              >
                -
              </button>
              <span className="px-1.5 font-bold text-[10px] text-slate-700 min-w-[14px] text-center flex items-center justify-center">{qty}</span>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setQty(qty + 1); }} 
                className="px-1.5 font-bold cursor-pointer hover:bg-slate-200 text-slate-600 text-xs flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Just below info: Add & Buy Buttons */}
          <div className="flex gap-1.5 mt-2.5">
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onAddToCart(p, qty); }} 
              className="flex-1 bg-blue-50 hover:bg-blue-100 border border-blue-100/40 text-blue-700 font-black text-[9px] sm:text-[10px] uppercase py-2 sm:py-2.5 rounded-xl cursor-pointer transition-colors text-center shadow-2xs"
            >
              Add
            </button>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onBuyNow(p, qty); }} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] sm:text-[10px] uppercase py-2 sm:py-2.5 rounded-xl cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] text-center shadow-xs"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  // --- USER AUTHENTICATION & PROFILE STATE ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("sonu_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authAddressLine, setAuthAddressLine] = useState("");
  const [authCity, setAuthCity] = useState("");
  const [authPincode, setAuthPincode] = useState("");
  const [authModalStep, setAuthModalStep] = useState<"email" | "otp" | "create_profile">("email");
  const [authOtp, setAuthOtp] = useState("");
  const [authErrorMsg, setAuthErrorMsg] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // --- HEALTH DIARY & PREMIUM PROFILE DASHBOARD STATES ---
  const [profileSubTab, setProfileSubTab] = useState<"orders" | "diary" | "reminders" | "wishlist" | "addresses" | "policies">("orders");
  
  // BMI Calculator States
  const [bmiWeight, setBmiWeight] = useState("");
  const [bmiHeight, setBmiHeight] = useState("");
  const [bmiResult, setBmiResult] = useState<{ value: string; status: string } | null>(null);

  // BP Logs States
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [bpPulse, setBpPulse] = useState("");
  const [bpLogs, setBpLogs] = useState<{ id: string; systolic: number; diastolic: number; pulse: number; date: string }[]>(() => {
    const saved = localStorage.getItem("partha_bp_logs");
    return saved ? JSON.parse(saved) : [
      { id: "bp-1", systolic: 120, diastolic: 80, pulse: 72, date: "2026-07-01 10:30 AM" },
      { id: "bp-2", systolic: 122, diastolic: 82, pulse: 70, date: "2026-07-03 09:15 AM" }
    ];
  });

  // Sugar Logs States
  const [sugarLevel, setSugarLevel] = useState("");
  const [sugarType, setSugarType] = useState<"Fasting" | "Post-Prandial" | "Random">("Fasting");
  const [sugarLogs, setSugarLogs] = useState<{ id: string; level: number; type: string; date: string }[]>(() => {
    const saved = localStorage.getItem("partha_sugar_logs");
    return saved ? JSON.parse(saved) : [
      { id: "sug-1", level: 95, type: "Fasting", date: "2026-07-01 08:00 AM" },
      { id: "sug-2", level: 135, type: "Post-Prandial", date: "2026-07-03 01:30 PM" }
    ];
  });

  // Pill Reminders States
  const [pillName, setPillName] = useState("");
  const [pillTime, setPillTime] = useState("");
  const [pillDosage, setPillDosage] = useState("");
  const [reminders, setReminders] = useState<{ id: string; name: string; time: string; dosage: string; active: boolean }[]>(() => {
    const saved = localStorage.getItem("partha_pill_reminders");
    return saved ? JSON.parse(saved) : [
      { id: "rem-1", name: "Pantocid DSR (Acid Reflux)", time: "08:00 AM", dosage: "1 Tablet - Empty Stomach", active: true },
      { id: "rem-2", name: "Lipril 5 (Hypertension)", time: "09:30 PM", dosage: "1 Tablet - After dinner", active: true }
    ];
  });

  // Saved Addresses States
  const [newAddressLabel, setNewAddressLabel] = useState("");
  const [newAddressText, setNewAddressText] = useState("");
  const [newAddressCity, setNewAddressCity] = useState("");
  const [newAddressPincode, setNewAddressPincode] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<{ id: string; label: string; addressLine: string; city: string; pincode: string }[]>(() => {
    const saved = localStorage.getItem("partha_addresses");
    return saved ? JSON.parse(saved) : [
      { id: "addr-1", label: "Home Base", addressLine: "12, Nehru Enclave, Sector 4", city: "New Delhi", pincode: "110019" },
      { id: "addr-2", label: "Office HQ", addressLine: "DLF Cyber City, Building 10B", city: "Gurgaon", pincode: "122002" }
    ];
  });

  // Invoice States
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const authCallbackRef = React.useRef<((user: UserProfile) => void) | null>(null);
  const initialDbRestoreRef = React.useRef(true);

  const ensureUserLoggedIn = (onSuccess: (user: UserProfile) => void) => {
    if (currentUser) {
      onSuccess(currentUser);
    } else {
      authCallbackRef.current = onSuccess;
      setAuthEmail("");
      setAuthFullName("");
      setAuthPhone("");
      setAuthAddressLine("");
      setAuthCity("");
      setAuthPincode("");
      setAuthOtp("");
      setAuthModalStep("email");
      setAuthErrorMsg("");
      setIsAuthModalOpen(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("sonu_user");
    alert("🔒 You have been securely logged out.");
    setActiveTab("home");
  };

  // --- CORE STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [labTests, setLabTests] = useState<LabTestPackage[]>(INITIAL_LAB_TESTS);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [branding, setBranding] = useState<SiteBranding>({
    appName: "Basanti Medical Store",
    appLogo: "PlusSquare",
    heroTitle: "Your Trusted Virtual Pharmacy & Clinical Care Center",
    heroSlogan: "Upload prescription, get instant pharmacological approval, secure free medicine deliveries, home lab tests, and up to 20% loyalty cashback!",
    heroImageUrl: "",
    supportPhone: "+91 9876543210",
    supportEmail: "support@parthapharmacymedicals.com",
    primaryColorHex: "#0d9488",
    enableWhatsappOrder: true,
    whatsappNumber: "919876543210",
    aboutUsText: "We are Basanti Medical Store, committed to providing accessible, high-quality, and fast healthcare solutions, including home lab-test blood collection and free doctor call consultations.",
    bannerOfferText: "🎉 Super Health Offer: Apply code parthapharmacy20 for 20% OFF + 120 Rewards Points on first signup!",
    aiAssistantName: "Partha AI Assistant",
    opsPanelTitle: "Partha Pharmacist & Operations Hub",
    customLogoUrl: "",
    brandBio: "Care • Trust • Pure",
    mobileNavTitle: "Partha Navigation",
    categoryImages: {}
  });

  const allCategories = React.useMemo(() => {
    return [...CATEGORIES, ...(branding.customCategories || [])];
  }, [branding.customCategories]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    upiId: "partha.pharmacy@okaxis",
    upiQrCode: "",
    bankName: "State Bank of India (SBI)",
    accountHolderName: "Basanti Medical Store Pvt Ltd",
    accountNumber: "32104567890",
    ifscCode: "SBIN0001234",
    active: true
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [labBookings, setLabBookings] = useState<LabBooking[]>([]);
  const [subscriptions, setSubscriptions] = useState<RefillSubscription[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null);

  // UI Navigation / Tab control
  const [activeTab, setReactActiveTab] = useState<"home" | "store" | "rx" | "doctor" | "labs" | "profile" | "admin">("home");

  // HISTORY & BACK BUTTON INTERCEPTOR
  const setActiveTab = (tab: "home" | "store" | "rx" | "doctor" | "labs" | "profile" | "admin") => {
    if (tab !== activeTab) {
      window.history.pushState({ tab }, '', '?tab=' + tab);
      setReactActiveTab(tab);
    }
  };

  

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Modals & Sliders
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Shopping Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [redeemPoints, setRedeemPoints] = useState(false);

  // Prescription Upload Form
  const [rxFile, setRxFile] = useState<string | null>(null);
  const [rxFileName, setRxFileName] = useState("");
  const [rxPatientName, setRxPatientName] = useState("");
  const [rxUploadStatus, setRxUploadStatus] = useState<"idle" | "uploading" | "success">("idle");

  // Booking Forms
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedLabId, setSelectedLabId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00 AM - 11:00 AM");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAddress, setPatientAddress] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");
  const [bookingPincode, setBookingPincode] = useState("");
  const [bookingMode, setBookingMode] = useState<"VIDEO" | "AUDIO" | "CHAT" | "CLINIC">("VIDEO");

  const getAppointmentPrice = (baseFee: number, mode: string) => {
    if (mode === "VIDEO") return baseFee;
    if (mode === "AUDIO") return Math.max(0, baseFee - 100);
    if (mode === "CHAT") return Math.max(0, baseFee - 200);
    if (mode === "CLINIC") return baseFee + 200;
    return baseFee;
  };

  const selectedDoctorInfo = doctors.find(d => d.id === selectedDoctorId);
  const currentAppointmentPrice = selectedDoctorInfo ? getAppointmentPrice(selectedDoctorInfo.consultationFee, bookingMode) : 0;


  // Checkout Form Details
  const [checkoutName, setCheckoutName] = useState("Hariom Sharma");
  const [checkoutAddress, setCheckoutAddress] = useState("12, Nehru Enclave, Sector 4");
  const [checkoutCity, setCheckoutCity] = useState("New Delhi");
  const [checkoutPincode, setCheckoutPincode] = useState("110019");
  const [checkoutPhone, setCheckoutPhone] = useState("9876543210");
  const [checkoutSlot, setCheckoutSlot] = useState("Tomorrow (9:00 AM - 1:00 PM)");
  const [checkoutPayment, setCheckoutPayment] = useState("UPI / Google Pay");
  const [placedOrderInfo, setPlacedOrderInfo] = useState<Order | null>(null);

  // UPI Custom Merchant Gateway States
  const [isUpiPortalOpen, setIsUpiPortalOpen] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState("GPay");
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState("");

  // Pincode Delivery Availability Checker
  const [checkPincode, setCheckPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "serviceable" | "unserviceable">("idle");
  const [showUnserviceableModal, setShowUnserviceableModal] = useState(false);
  const [showDevAuthPrompt, setShowDevAuthPrompt] = useState(false);
  const [devAuthPasskey, setDevAuthPasskey] = useState("");
  const [referralInput, setReferralInput] = useState("");

  // Mobile navigation drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isInvestOpen, setIsInvestOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Secure Ops Panel visibility (By default, hidden on production/live site to keep it exclusive to Hariom)
  const [isOpsPanelVisible, setIsOpsPanelVisible] = useState(() => {
    return localStorage.getItem("sonu_ops_visible") === "true";
  });
  const [logoClickCount, setLogoClickCount] = useState(0);

  // Secret combination clicks (5 clicks on Header Title + 3 clicks on Footer Title)
  const [headerTitleClicks, setHeaderTitleClicks] = useState(0);
  const [footerTitleClicks, setFooterTitleClicks] = useState(0);
  const [isOpsPanelRevealed, setIsOpsPanelRevealed] = useState(() => {
    return localStorage.getItem("is_ops_panel_revealed") === "true";
  });

  const handleHeaderTitleClick = () => {
    const next = headerTitleClicks + 1;
    setHeaderTitleClicks(next);
    if (next === 5) {
      alert(`✨ Step 1 Unlocked: Clicked Header Title 5/5 times! Now scroll down to the FOOTER and click on the Website Title ("${branding.appName || 'PARTHA PHARMACY'}") 3 times to toggle the Ops Panel visibility.`);
    } else if (next < 5) {
      alert(`🎯 Header Title Clicked: ${next}/5. Please click ${5 - next} more times!`);
    }
  };

  const handleFooterTitleClick = () => {
    if (headerTitleClicks < 5) {
      alert(`⚠️ Verification Pending: Please click the Website Title ("${branding.appName || 'PARTHA PHARMACY'}") in the HEADER section 5 times first!`);
      return;
    }
    
    const next = footerTitleClicks + 1;
    if (next === 3) {
      const nextState = !isOpsPanelRevealed;
      setIsOpsPanelRevealed(nextState);
      localStorage.setItem("is_ops_panel_revealed", String(nextState));
      
      if (nextState) {
        alert("🔓 Success! Secret combination matched. The secure Ops Panel entry is now UNLOCKED and visible in the footer section below!");
      } else {
        alert("🔒 Ops Panel is now HIDDEN and securely locked.");
      }
      
      // Reset click counts for both header and footer to allow toggling again later
      setHeaderTitleClicks(0);
      setFooterTitleClicks(0);
    } else {
      setFooterTitleClicks(next);
      alert(`👣 Footer Title Clicked: ${next}/3. Please click ${3 - next} more times!`);
    }
  };

  // Admin authentication and recovery states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isDevModeActive, setIsDevModeActive] = useState(false);

  const [activeAdminPin, setActiveAdminPin] = useState("");
  const [adminPinInput, setAdminPinInput] = useState("");
  const [adminErrorMsg, setAdminErrorMsg] = useState("");
  const [masterPin, setMasterPin] = useState("7788");
  
  const [adminEmail, setAdminEmail] = useState("hariomkdi@gmail.com");
  const [adminEmailInput, setAdminEmailInput] = useState("hariomkdi@gmail.com");
  const [authMode, setAuthMode] = useState<"login" | "forgot" | "verify">("login");
  const [recoveryCodeInput, setRecoveryCodeInput] = useState("");
  const [newRecoveryPin, setNewRecoveryPin] = useState("");
  const [recoveryInfo, setRecoveryInfo] = useState("");
  const [sandboxRecoveryCode, setSandboxRecoveryCode] = useState("");
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);
  const [hasSmtpConfigured, setHasSmtpConfigured] = useState(false);

  useEffect(() => {
    if (!window.history.state || !window.history.state.tab) {
      window.history.replaceState({ tab: activeTab }, '', '?tab=' + activeTab);
    }

    const handlePopState = (e: PopStateEvent) => {
      // Priority 1: Close Modals
      if (isUpiPortalOpen) { setIsUpiPortalOpen(false); window.history.pushState(e.state, '', ''); return; }
      if (isCheckoutOpen) { setIsCheckoutOpen(false); window.history.pushState(e.state, '', ''); return; }
      if (isCartOpen) { setIsCartOpen(false); window.history.pushState(e.state, '', ''); return; }
      if (isAuthModalOpen) { setIsAuthModalOpen(false); window.history.pushState(e.state, '', ''); return; }
      if (mobileMenuOpen) { setMobileMenuOpen(false); window.history.pushState(e.state, '', ''); return; }
      if (showUnserviceableModal) { setShowUnserviceableModal(false); window.history.pushState(e.state, '', ''); return; }
      
      // Priority 2: Navigate Tabs
      if (e.state && e.state.tab) {
        setReactActiveTab(e.state.tab);
      } else {
        setReactActiveTab("home");
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isUpiPortalOpen, isCheckoutOpen, isCartOpen, isAuthModalOpen, mobileMenuOpen, showUnserviceableModal, activeTab]);


  const fetchAdminConfig = async () => {
    try {
      const res = await fetch('/api/admin/auth/config');
      const data = await res.json();
      if (data.email) {
        setAdminEmail(data.email);
        setAdminEmailInput(data.email);
        setHasSmtpConfigured(data.hasSmtp);
      }
    } catch (err) {
      console.warn("Failed to load admin auth configuration from server:", err);
    }
  };

  const handleAdminLogin = async (email: string, pin: string) => {
    try {
      setAdminErrorMsg("");
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        setActiveAdminPin(pin);
        setAdminPinInput("");
        setAdminErrorMsg("");
      } else {
        setAdminErrorMsg(data.error || "Incorrect credentials.");
        setAdminPinInput("");
      }
    } catch (err) {
      setAdminErrorMsg("Error contacting secure auth server.");
    }
  };

  const handleRequestRecovery = async (email: string) => {
    setIsSendingRecovery(true);
    setAdminErrorMsg("");
    setRecoveryInfo("");
    setSandboxRecoveryCode("");
    try {
      const res = await fetch('/api/admin/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecoveryInfo(data.info);
        if (data.debugCode) {
          setSandboxRecoveryCode(data.debugCode);
        }
        setAuthMode("verify");
      } else {
        setAdminErrorMsg(data.error || "Failed to trigger recovery.");
      }
    } catch (err) {
      setAdminErrorMsg("Could not connect to the recovery server.");
    } finally {
      setIsSendingRecovery(false);
    }
  };

  const handleVerifyAndReset = async (email: string, code: string, pin: string) => {
    setAdminErrorMsg("");
    try {
      const res = await fetch('/api/admin/auth/verify-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPin: pin })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("🎉 Success! Your Admin PIN has been securely reset. You can now log in with your new passcode.");
        setAuthMode("login");
        setRecoveryCodeInput("");
        setNewRecoveryPin("");
        setSandboxRecoveryCode("");
        setRecoveryInfo("");
      } else {
        setAdminErrorMsg(data.error || "Verification failed. Incorrect OTP.");
      }
    } catch (err) {
      setAdminErrorMsg("Could not process PIN reset. Please try again.");
    }
  };

  const handleUpdateAdminSettings = async (email: string, pin?: string) => {
    try {
      const res = await fetch('/api/admin/auth/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("🎉 Admin credentials successfully updated!");
        if (pin) {
          setActiveAdminPin(pin);
        }
        fetchAdminConfig(); // refresh state
      } else {
        alert("Failed to update credentials: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error updating admin settings on server.");
    }
  };

  useEffect(() => {
    fetchAdminConfig();

    // Check for secure URL parameter to show/hide Ops Panel
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true" || params.get("ops") === "show" || params.get("hariom") === "true") {
      setIsOpsPanelVisible(true);
      localStorage.setItem("sonu_ops_visible", "true");
      alert("🔒 Security bypass triggered: Ops Panel has been unlocked in your browser's navigation bar.");
    } else if (params.get("admin") === "false" || params.get("ops") === "hide") {
      setIsOpsPanelVisible(false);
      localStorage.setItem("sonu_ops_visible", "false");
      alert("🔒 Ops Panel has been hidden in your browser's navigation bar.");
    }
  }, []);

  useEffect(() => {
    if (logoClickCount > 0) {
      const timer = setTimeout(() => {
        setLogoClickCount(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [logoClickCount]);

  // --- DATABASE RESET PREVENTION / AUTO-RESTORATION HELPER ---
  const checkAndRestoreDatabase = async () => {
    try {
      const statusRes = await fetch('/api/db-status?t=' + Date.now());
      if (statusRes.ok) {
        const { isUserInitialized } = await statusRes.json();
        if (!isUserInitialized) {
          const brandingBackup = localStorage.getItem('sonu_backup_branding');
          const productsBackup = localStorage.getItem('sonu_backup_products');
          const doctorsBackup = localStorage.getItem('sonu_backup_doctors');
          const labTestsBackup = localStorage.getItem('sonu_backup_lab_tests');
          const paymentBackup = localStorage.getItem('sonu_backup_payment_config');

          if (brandingBackup || productsBackup || doctorsBackup || labTestsBackup || paymentBackup) {
            console.info("🔄 Cloud container reset detected. Restoring your permanent Ops Panel changes from browser local backup...");
            const backupPayload: any = {};
            if (brandingBackup) backupPayload.branding = JSON.parse(brandingBackup);
            if (productsBackup) backupPayload.products = JSON.parse(productsBackup);
            if (doctorsBackup) backupPayload.doctors = JSON.parse(doctorsBackup);
            if (labTestsBackup) backupPayload.labTests = JSON.parse(labTestsBackup);
            if (paymentBackup) backupPayload.paymentConfig = JSON.parse(paymentBackup);

            const restoreRes = await fetch('/api/admin/restore-db', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(backupPayload)
            });

            if (restoreRes.ok) {
              console.info("✅ Ops Panel changes successfully restored and synced to server!");
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to check and auto-restore database status:", err);
    }
  };

  // --- API OPERATIONS ---
  const fetchAllData = async () => {
    try {
      if (initialDbRestoreRef.current) {
        initialDbRestoreRef.current = false;
        await checkAndRestoreDatabase();
      }

      // 1. Fetch branding first to determine current appName
      let activeAppName = "Basanti Medical Store";
      try {
        const brandRes = await fetch('/api/branding?t=' + Date.now());
        if (brandRes.ok) {
          const brandData = await brandRes.json();
          if (brandData && brandData.appName) {
            activeAppName = brandData.appName;
          }
          const formattedBrand = brandData;
          setBranding(formattedBrand);
          if (brandData && typeof brandData === 'object') {
            localStorage.setItem('sonu_backup_branding', JSON.stringify(brandData));
          }
        }
      } catch (err) {
        console.error("Error fetching site branding:", err);
      }

      // 1.5 Fetch advertisements
      try {
        const adRes = await fetch('/api/advertisements?t=' + Date.now());
        if (adRes.ok) {
          const ads = await adRes.json();
          setAdvertisements(ads);
        }
      } catch (err) {
        console.error("Error fetching advertisements:", err);
      }

      // 2. Fetch products and format strings with activeAppName
      try {
        const prodRes = await fetch(`/api/products?category=${selectedCategory}&search=${searchQuery}&t=${Date.now()}`);
        if (prodRes.ok) {
          const prods = await prodRes.json();
          setProducts(prods);
          if (prods && prods.length > 0) {
            localStorage.setItem('sonu_backup_products', JSON.stringify(prods));
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }

      // 3. Fetch doctors and format
      try {
        const docRes = await fetch(isAdminAuthenticated ? `/api/admin/doctors?t=${Date.now()}` : `/api/doctors?t=${Date.now()}`);
        if (docRes.ok) {
          const docData = await docRes.json();
          setDoctors(docData);
          if (docData && docData.length > 0) {
            localStorage.setItem('sonu_backup_doctors', JSON.stringify(docData));
          }
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }

      // 4. Fetch lab tests and format
      try {
        const labRes = await fetch('/api/lab-tests-catalog?t=' + Date.now());
        if (labRes.ok) {
          const ltData = await labRes.json();
          setLabTests(ltData);
          if (ltData && ltData.length > 0) {
            localStorage.setItem('sonu_backup_lab_tests', JSON.stringify(ltData));
          }
        }
      } catch (err) {
        console.error("Error fetching lab tests:", err);
      }

      // 5. Fetch payment config and format
      try {
        const payRes = await fetch('/api/payment-config?t=' + Date.now());
        if (payRes.ok) {
          const payData = await payRes.json();
          setPaymentConfig(payData);
          if (payData && typeof payData === 'object') {
            localStorage.setItem('sonu_backup_payment_config', JSON.stringify(payData));
          }
        }
      } catch (err) {
        console.error("Error fetching payment config:", err);
      }

      // 6. Fetch transactional states and format
      if (isAdminAuthenticated) {
        const ordRes = await fetch('/api/orders?t=' + Date.now());
        const ords = await ordRes.json();
        setOrders(ords);

        const rxRes = await fetch('/api/prescriptions?t=' + Date.now());
        const rxs = await rxRes.json();
        setPrescriptions(rxs);

        const aptRes = await fetch('/api/appointments?t=' + Date.now());
        const apts = await aptRes.json();
        setAppointments(apts);

        const labBookingRes = await fetch('/api/lab-bookings?t=' + Date.now());
        const labs = await labBookingRes.json();
        setLabBookings(labs);

        const subRes = await fetch('/api/subscriptions?t=' + Date.now());
        const subs = await subRes.json();
        setSubscriptions(subs);

        const loyRes = await fetch(`/api/loyalty?userId=${encodeURIComponent(adminEmail)}`);
        const loy = await loyRes.json();
        setLoyalty(loy);
      } else if (currentUser) {
        const email = currentUser.email;
        const ordRes = await fetch(`/api/orders?userId=${encodeURIComponent(email)}`);
        const ords = await ordRes.json();
        setOrders(ords);

        const rxRes = await fetch(`/api/prescriptions?userId=${encodeURIComponent(email)}`);
        const rxs = await rxRes.json();
        setPrescriptions(rxs);

        const aptRes = await fetch(`/api/appointments?userId=${encodeURIComponent(email)}`);
        const apts = await aptRes.json();
        setAppointments(apts);

        const labBookingRes = await fetch(`/api/lab-bookings?userId=${encodeURIComponent(email)}`);
        const labs = await labBookingRes.json();
        setLabBookings(labs);

        const subRes = await fetch(`/api/subscriptions?userId=${encodeURIComponent(email)}`);
        const subs = await subRes.json();
        setSubscriptions(subs);

        const loyRes = await fetch(`/api/loyalty?userId=${encodeURIComponent(email)}`);
        const loy = await loyRes.json();
        setLoyalty(loy);
      } else {
        setOrders([]);
        setPrescriptions([]);
        setAppointments([]);
        setLabBookings([]);
        setSubscriptions([]);
        setLoyalty(null);
      }
    } catch (err) {
      console.error("Error synchronizing full-stack database state:", err);
    }
  };


  useEffect(() => {
    fetchAllData();
  }, [selectedCategory, searchQuery, currentUser, isAdminAuthenticated]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setActiveTab("store");
    try {
      const res = await fetch(`/api/products?search=${searchQuery}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Cart operations

  const handleBuyNow = (p: Product, qty: number) => {
    addToCart(p, qty);
    setIsCartOpen(false);
    ensureUserLoggedIn((profile) => {
      setCheckoutName(profile.fullName);
      setCheckoutAddress(profile.addressLine);
      setCheckoutCity(profile.city);
      setCheckoutPincode(profile.pincode);
      setCheckoutPhone(profile.phone);
      setIsCheckoutOpen(true);
    });
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { id: product.id, product, quantity }];
    });
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
    } else {
      setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      return [...prev, product];
    });
  };

  // Prescription Upload Helper
  const handleRxFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRxFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRxFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRxUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxFile) {
      alert("Please upload an image or scan of your prescription.");
      return;
    }
    ensureUserLoggedIn(async (profile) => {
      setRxUploadStatus("uploading");
      try {
        const res = await fetch('/api/prescriptions?t=' + Date.now(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: rxFileName,
            fileData: rxFile,
            patientName: rxPatientName || profile.fullName,
            userId: profile.email
          })
        });
        const data = await res.json();
        if (data.success) {
          setRxUploadStatus("success");
          setRxFile(null);
          setRxFileName("");
          setRxPatientName("");
          fetchAllData();
        }
      } catch (err) {
        console.error(err);
        alert("Failed to submit prescription upload.");
        setRxUploadStatus("idle");
      }
    });
  };

  // Place Order checkout
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    ensureUserLoggedIn(async (profile) => {
      // Check if any items require a prescription
      const rxRequired = cart.some(item => item.product.prescriptionRequired);
      const hasVerifiedRx = prescriptions.some(p => p.status === PrescriptionStatus.VERIFIED);

      if (rxRequired && !hasVerifiedRx) {
        alert("🚨 A prescription is required for medicines in your cart. Please upload your prescription, then approve it inside the Pharmacist/Admin Dashboard tab to unlock checkout payment!");
        return;
      }

      if (checkoutPayment === "UPI / Google Pay" && !isUpiPortalOpen) {
        setIsUpiPortalOpen(true);
        return;
      }

      if (checkoutPayment === "UPI / Google Pay" && isUpiPortalOpen) {
        if (!utrNumber.trim()) {
          alert("🚨 Please enter your 12-digit UPI transaction reference / UTR number to proceed.");
          return;
        }
        if (utrNumber.trim().length !== 12 || isNaN(Number(utrNumber.trim()))) {
          alert("🚨 A valid UPI UTR / Transaction ID must be exactly 12 numeric digits.");
          return;
        }
      }

      const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const discountAmount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.discountPercent / 100)) : 0;
      const pointsRedeemed = redeemPoints && loyalty ? Math.min(loyalty.pointsBalance, Math.floor(subtotal * 0.1)) : 0; // max 10%
      const gst = Math.round((subtotal - discountAmount) * 0.18);
      const deliveryCharge = subtotal > 500 ? 0 : 49;
      const finalTotal = subtotal - discountAmount - pointsRedeemed + gst + deliveryCharge;

      const orderPayload = {
        userId: profile.email,
        userName: checkoutName || profile.fullName,
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
          prescriptionRequired: item.product.prescriptionRequired
        })),
        shippingAddress: {
          fullName: checkoutName || profile.fullName,
          addressLine: checkoutAddress || profile.addressLine,
          city: checkoutCity || profile.city,
          pincode: checkoutPincode || profile.pincode,
          phone: checkoutPhone || profile.phone
        },
        billingAddress: {
          fullName: checkoutName || profile.fullName,
          addressLine: checkoutAddress || profile.addressLine,
          city: checkoutCity || profile.city,
          pincode: checkoutPincode || profile.pincode,
          phone: checkoutPhone || profile.phone
        },
        deliverySlot: checkoutSlot,
        paymentMethod: checkoutPayment,
        paymentStatus: checkoutPayment === "Cash on Delivery" ? "PENDING" : (checkoutPayment === "UPI / Google Pay" ? "PENDING_VERIFICATION" : "PAID"),
        utrNumber: checkoutPayment === "UPI / Google Pay" ? utrNumber.trim() : undefined,
        paymentProofImage: checkoutPayment === "UPI / Google Pay" ? paymentScreenshot : undefined,
        selectedUpiApp: checkoutPayment === "UPI / Google Pay" ? selectedUpiApp : undefined,
        subtotal,
        discountAmount,
        pointsRedeemed,
        gst,
        deliveryCharge,
        total: finalTotal
      };


      if (checkoutPayment === "Razorpay") {
          try {
            const rzpRes = await fetch('/api/payment/create-razorpay-order', {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({ amount: finalTotal })
            });
            const orderData = await rzpRes.json();
            
            const options = {
              key: "rzp_test_random_key_simulation",
              amount: orderData.amount,
              currency: orderData.currency,
              name: branding?.appName || "Pharmacy",
              description: "Medicine Order",
              order_id: orderData.id,
              handler: async function (response: any) {
                const verifyRes = await fetch('/api/payment/verify-razorpay', {
                   method: 'POST',
                   headers: {'Content-Type': 'application/json'},
                   body: JSON.stringify({
                     razorpay_payment_id: response.razorpay_payment_id,
                     razorpay_order_id: response.razorpay_order_id,
                     razorpay_signature: response.razorpay_signature
                   })
                });
                
                if (verifyRes.ok) {
                    executeOrderPlacement({...orderPayload, utrNumber: response.razorpay_payment_id, paymentStatus: 'PAID'});
                }
              },
              prefill: {
                name: profile.fullName,
                email: profile.email,
                contact: profile.phone
              },
              theme: { color: branding?.primaryColorHex || "#2563eb" }
            };
            
            if ((window as any).Razorpay) {
              const rzp = new (window as any).Razorpay(options);
              rzp.open();
              return; 
            } else {
               alert("Razorpay SDK script not found. Simulating successful real API payment flow for testing.");
               executeOrderPlacement({...orderPayload, utrNumber: 'sim_pay_' + Date.now(), paymentStatus: 'PAID'});
               return;
            }
          } catch(e) {
             console.error("Razorpay init failed", e);
             alert("Razorpay integration failed.");
             return;
          }
      }

      executeOrderPlacement(orderPayload);
    });
  };

  const executeOrderPlacement = async (orderPayload: any) => {
      try {
        const res = await fetch('/api/orders?t=' + Date.now(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        const data = await res.json();
        if (data.success) {
          setPlacedOrderInfo(data.order);
          setCart([]);
          setAppliedCoupon(null);
          setRedeemPoints(false);
          setIsUpiPortalOpen(false);
          setUtrNumber("");
          setPaymentScreenshot("");
          fetchAllData();
        }
      } catch (err) {
        console.error(err);
        alert("Failed to submit checkout order.");
      }
  };

  // Cancel Customer Order
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "Order cancelled by customer from self-service dashboard." })
      });
      if (res.ok) {
        alert("✅ Order cancelled successfully. Refund initiated back to your original payment method.");
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to cancel order.");
      }
    } catch (err) {
      alert("Network error. Failed to cancel order.");
    }
  };

  // Request Customer Order Return
  const handleReturnOrder = async (orderId: string) => {
    const reason = prompt("Please enter the reason for returning this medicine (e.g., Wrong dosage, concerns with quality, doctor changed formulation):");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("A return reason is required under CDSCO reverse-logistics guidelines.");
      return;
    }
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason })
      });
      if (res.ok) {
        alert("✅ Return request approved! Our courier partner will pick up the sealed medicine container within 24-48 hours. Refund has been initiated.");
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to process return.");
      }
    } catch (err) {
      alert("Network error. Failed to submit return.");
    }
  };

  // Customer Quick Reorder
  const handleReorder = (order: Order) => {
    const newCart = [...cart];
    order.items.forEach(item => {
      const existing = newCart.find(c => c.product.id === item.productId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        const fullProd = products.find(p => p.id === item.productId) || {
          id: item.productId,
          name: item.name,
          sku: "REORDERED",
          category: "prescription",
          price: item.price,
          mrp: item.price * 1.2,
          discount: 20,
          rating: 4.8,
          reviewsCount: 15,
          prescriptionRequired: false,
          image: item.image || "",
          brand: "Partha",
          composition: "Standard Formulation",
          uses: ["Standard therapeutic dosage"],
          dosage: "Standard",
          howToUse: "Standard use cases",
          sideEffects: ["None"],
          warnings: ["Standard warning guidelines apply"],
          storage: "Cool dry place",
          stock: 50
        };
        newCart.push({ product: fullProd as any, quantity: item.quantity });
      }
    });
    setCart(newCart);
    setIsCartOpen(true);
    alert("🛒 All items from this order have been appended to your shopping cart! Feel free to checkout.");
  };

  // Book Doctor
  const handleBookDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !patientName || !patientPhone) {
      alert("Please fill out all booking details.");
      return;
    }
    ensureUserLoggedIn(async (profile) => {
      // Trigger UPI Payment First
      window.open(`upi://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(branding.appName)}&am=${currentAppointmentPrice}&cu=INR&tn=DoctorAppointment`, "_top");
      
      try {
        const res = await fetch('/api/appointments?t=' + Date.now(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctorId: selectedDoctorId,
            patientName,
            patientPhone,
            patientAddress,
            mode: bookingMode,
            userId: profile.email,
            status: 'PENDING'
          })
        });
        const data = await res.json();
        if (data.success) {
          alert("🎉 Appointment requested & Payment Initiated! Our operations team will confirm your exact date and time shortly.");
          setSelectedDoctorId("");
          setPatientName("");
          setPatientPhone("");
          setPatientAddress("");
          fetchAllData();
          setActiveTab("profile");
        } else {
          alert(data.message || "Failed to request appointment.");
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  // Book Lab Test
  const handleBookLabTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabId || !patientName || !patientPhone || !bookingDate || !bookingAddress || !bookingPincode) {
      alert("Please provide complete collection address and details.");
      return;
    }
    ensureUserLoggedIn(async (profile) => {
      try {
        const res = await fetch('/api/lab-bookings?t=' + Date.now(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testId: selectedLabId,
            patientName,
            patientPhone,
            date: bookingDate,
            timeSlot: bookingTime,
            address: bookingAddress,
            pincode: bookingPincode,
            userId: profile.email
          })
        });
        const data = await res.json();
        if (data.success) {
          alert("🩸 Lab test package booked! Our certified health worker will arrive for home collection on the chosen date.");
          setSelectedLabId("");
          setPatientName("");
          setPatientPhone("");
          setBookingDate("");
          setBookingAddress("");
          setBookingPincode("");
          fetchAllData();
          setActiveTab("profile");
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  // Auto refill subscriptions creator
  const handleSubscribeRefill = async (productId: string, quantity: number, frequency: RefillFrequency) => {
    ensureUserLoggedIn(async (profile) => {
      try {
        const res = await fetch('/api/subscriptions?t=' + Date.now(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity, frequency, userId: profile.email })
        });
        const data = await res.json();
        if (data.success) {
          alert(`🎉 Automated refill activated! We will deliver ${quantity} unit(s) every ${frequency.toLowerCase()}.`);
          fetchAllData();
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  // Change Subscription Status
  const handleUpdateSubscription = async (subId: string, status: RefillStatus) => {
    try {
      const res = await fetch('/api/subscriptions/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subId, status })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Subscription is now ${status.toLowerCase()}.`);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin / Pharmacist operations
  const handleReviewPrescription = async (rxId: string, status: PrescriptionStatus, reason?: string, doctorName?: string, meds?: string[]) => {
    try {
      await fetch('/api/pharmacist/prescriptions/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId: rxId, status, rejectionReason: reason, doctorName, medicinesRecommended: meds })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    try {
      await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, note })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAppointment = async (appointmentId: string, updates: Partial<DoctorAppointment>) => {
    try {
      await fetch('/api/admin/appointments/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, ...updates })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStock = async (productId: string, stock: number) => {
    try {
      await fetch('/api/admin/products/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, stock })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Referral code submission
  const handleApplyReferral = async () => {
    if (!referralInput.trim()) return;
    try {
      const res = await fetch('/api/loyalty/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: referralInput })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setReferralInput("");
        fetchAllData();
      } else {
        alert(data.error || "Failed to apply referral code.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pin Code delivery check
  const handlePincodeCheck = () => {
    if (!checkPincode.trim()) return;
    const isServiceable = branding.deliveryLocations?.some(loc => loc.pincode === checkPincode.trim());
    setPincodeStatus(isServiceable ? "serviceable" : "unserviceable");
    if (!isServiceable) {
      setShowUnserviceableModal(true);
    }
  };

  // Cart financial summaries
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartDiscount = appliedCoupon ? Math.round(cartSubtotal * (appliedCoupon.discountPercent / 100)) : 0;
  const pointsToRedeemValue = redeemPoints && loyalty ? Math.min(loyalty.pointsBalance, Math.floor(cartSubtotal * 0.1)) : 0;
  const cartGst = Math.round((cartSubtotal - cartDiscount) * 0.18);
  const cartDelivery = cartSubtotal > 500 ? 0 : 49;
  const cartTotal = cartSubtotal - cartDiscount - pointsToRedeemValue + cartGst + cartDelivery;

  return (
    <div id="sonu-app" className={`relative font-sans antialiased min-h-screen text-slate-900 selection:bg-teal-100 selection:text-teal-900 pb-16 bg-[#f2faf7]`}>
      
      {/* High-fidelity Medical & Clinical Design Background Assets */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Soft Modern Medical Gradients */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full bg-emerald-400/8 blur-3xl filter animate-pulse" />
        <div className="absolute top-1/3 left-0 w-[40vw] h-[40vw] rounded-full bg-teal-400/8 blur-3xl filter animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-[10%] w-[45vw] h-[45vw] rounded-full bg-cyan-300/8 blur-3xl filter animate-pulse" style={{ animationDuration: '10s' }} />
        
        {/* Precise dot pattern mimicking medicine blister packs / lab grids */}
        <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06]" />
        
        {/* Subtle, soft-focused grid lines representing clinical precision */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d948805_1px,transparent_1px),linear-gradient(to_bottom,#0d948805_1px,transparent_1px)] bg-[size:120px_120px]" />

        {/* Dynamic, transparent medical cross/plus icons to set the theme */}
        <div className="absolute top-44 left-[4%] text-teal-600/5 animate-bounce" style={{ animationDuration: '6s' }}>
          <svg className="w-16 h-16 transform -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        
        <div className="absolute top-[900px] right-[3%] text-emerald-600/5 animate-spin" style={{ animationDuration: '40s' }}>
          <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>

        <div className="absolute top-[1800px] left-[2%] text-teal-600/5">
          <svg className="w-20 h-20 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>

        <div className="absolute bottom-[600px] right-[5%] text-emerald-600/5 animate-bounce" style={{ animationDuration: '8s' }}>
          <svg className="w-20 h-20 transform rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>

      {branding.appGlobalBgImage && (
        <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url(${branding.appGlobalBgImage})`, opacity: 0.1 }} />
      )}
      <div className="relative z-10">
      
      {/* Premium Notification Strip */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-[11px] font-bold text-center py-2 tracking-wide px-4 flex items-center justify-center gap-1.5 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
        <span>{branding.bannerOfferText || "INTRODUCTORY SALE: Apply SONUNEW at checkout for flat 20% discount on all prescription & wellness items!"}</span>
      </div>

      {/* STICKY MAIN HEADER */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-30 shadow-sm transition-shadow">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 md:py-0 md:h-20 flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4">
          
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            {/* Brand Logo */}
            <div 
              onClick={() => { 
                setActiveTab("home"); 
                setSelectedCategory("all"); 
              }}
              className="flex items-center gap-2 cursor-pointer select-none group"
            >
              {branding.customLogoUrl ? (
                <img 
                  src={branding.customLogoUrl} 
                  alt="Brand Logo" 
                  className="object-contain rounded-xl shadow-md border border-slate-100 group-hover:scale-105 transition-transform" style={{ width: branding.customLogoSize || 40, height: branding.customLogoSize || 40 }} 
                />
              ) : (
                <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:rotate-6 transition-transform shadow-md shadow-blue-200" style={{ backgroundColor: branding.primaryColorHex || undefined }}>
                  {renderBrandingIcon(branding.appLogo)}
                </div>
              )}
              <div>
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHeaderTitleClick();
                  }}
                  className="font-black text-sm sm:text-lg text-blue-900 tracking-tight block leading-none uppercase cursor-pointer hover:text-blue-700 active:scale-95 transition-all select-none"
                  title="Click 5 times to start secret Ops Panel unlock"
                >
                  {branding.appName || "SONU PHARMACY"}
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-green-600 tracking-widest uppercase mt-0.5 sm:mt-1 block">
                  {branding.brandBio || "Care • Trust • Pure"}
                </span>
              </div>
            </div>

            {/* Mobile Actions Container */}
            <div className="flex items-center gap-2 md:hidden">
              <button 
                onClick={() => setActiveTab("profile")}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-slate-600 flex items-center gap-1 border ${
                  activeTab === 'profile' 
                    ? 'bg-blue-50 text-blue-600 border-blue-200 font-extrabold shadow-xs' 
                    : 'hover:bg-slate-50 border-slate-200 hover:border-slate-300 font-bold'
                }`}
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px]">
                  {currentUser ? currentUser.fullName.split(' ')[0] : 'Sign In'}
                </span>
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 relative"
              >
                <ShoppingBag className="w-4 h-4" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-[8px] font-black text-white w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Smart Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 w-full md:max-w-lg relative p-1 bg-emerald-100/40 rounded-2xl border border-emerald-200/50 shadow-xs">
            <input 
              type="text" 
              placeholder="Search generic medications, brand name (e.g. Dolo, Telma)..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-white border border-emerald-150 hover:border-emerald-300 focus:border-emerald-500 rounded-xl pl-9 pr-9 py-1.5 sm:py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-emerald-950 placeholder-emerald-600/70"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </div>
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}

            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && searchQuery.length > 0 && (
              <div className="absolute top-11 left-0 right-0 bg-white border border-slate-150 shadow-2xl rounded-2xl p-3 z-50 text-xs">
                <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
                  <p className="font-semibold text-[10px] text-gray-400 uppercase tracking-wider">Medications Found ({products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length})</p>
                  <button 
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="text-[10px] text-blue-600 hover:underline font-extrabold"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {products
                    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 5)
                    .map(p => (
                      <div 
                        key={p.id}
                        onClick={() => { 
                          setSelectedProduct(p); 
                          setSearchQuery(""); 
                          setShowSuggestions(false); 
                        }}
                        className="p-2 hover:bg-slate-50 rounded-lg flex items-center justify-between cursor-pointer text-left"
                      >
                        <span className="font-bold text-gray-800">{p.name}</span>
                        <span className="text-blue-600 font-extrabold text-[11px]">₹{p.price}</span>
                      </div>
                    ))}
                  {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <p className="text-gray-400 p-2 text-center">No matching medications in catalog. Ask our AI Assistant below!</p>
                  )}
                </div>
              </div>
            )}
          </form>

          {/* Navigation Items (Desktop Only) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-extrabold text-slate-600 tracking-tight">
            <button onClick={() => { setActiveTab("home"); setSelectedCategory("all"); }} className={`hover:text-blue-600 cursor-pointer ${activeTab === 'home' ? 'text-blue-600 font-black' : ''}`}>Home</button>
            <button onClick={() => { setActiveTab("store"); setSelectedCategory("all"); }} className={`hover:text-blue-600 cursor-pointer ${activeTab === 'store' ? 'text-blue-600 font-black' : ''}`}>Browse Meds</button>
            <button onClick={() => setActiveTab("rx")} className={`hover:text-blue-600 cursor-pointer ${activeTab === 'rx' ? 'text-blue-600 font-black' : ''}`}>Upload Prescription</button>
            {branding.enableExpertDoctor !== false && (
              <button onClick={() => setActiveTab("doctor")} className={`hover:text-blue-600 cursor-pointer ${activeTab === 'doctor' ? 'text-blue-600 font-black' : ''}`}>Doctor Call</button>
            )}
            {branding.enableBookLabTests !== false && (
              <button onClick={() => setActiveTab("labs")} className={`hover:text-blue-600 cursor-pointer ${activeTab === 'labs' ? 'text-blue-600 font-black' : ''}`}>Lab Tests</button>
            )}
          </nav>

          {/* Action Icons (Desktop Only) */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer text-slate-600 flex items-center gap-1.5 border ${
                activeTab === 'profile' 
                  ? 'bg-blue-50 text-blue-600 border-blue-200 font-extrabold shadow-sm' 
                  : 'hover:bg-slate-50 border-slate-200 hover:border-slate-300 font-bold'
              }`}
              title={currentUser ? `Profile: ${currentUser.fullName}` : "My Account Sign In"}
            >
              <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-[11px] tracking-tight">
                {currentUser ? currentUser.fullName.split(' ')[0] : 'Sign In'}
              </span>
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-[9px] font-black text-white w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Categories Megamenu strip */}
        <div className="bg-slate-50 border-t border-slate-100 hidden md:block">
          <div className="max-w-7xl mx-auto px-6 h-10 flex items-center gap-6 overflow-x-auto text-[11px] font-extrabold text-slate-500 uppercase tracking-widest scrollbar-none">
            {allCategories.slice(1).map(cat => (
              <button 
                key={cat.id}
                onClick={() => { 
                  setSelectedCategory(cat.id); 
                  setActiveTab("store"); 
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`hover:text-blue-600 cursor-pointer whitespace-nowrap transition-colors pb-0.5 ${selectedCategory === cat.id && activeTab === 'store' ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 lg:hidden">
          <div className="bg-white w-72 h-full p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-blue-900">{branding.mobileNavTitle || "Partha Navigation"}</span>
                <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
              </div>

              {/* Mobile links */}
              <div className="flex flex-col gap-4 font-bold text-sm text-slate-700">
                <button onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }} className="text-left py-2 border-b border-gray-50 hover:text-blue-600">Home Dashboard</button>
                <button onClick={() => { setActiveTab("store"); setSelectedCategory("all"); setMobileMenuOpen(false); }} className="text-left py-2 border-b border-gray-50 hover:text-blue-600">Browse Medicines</button>
                <button onClick={() => { setActiveTab("rx"); setMobileMenuOpen(false); }} className="text-left py-2 border-b border-gray-50 hover:text-blue-600">Upload Prescription</button>
                {branding.enableExpertDoctor !== false && (
                  <button onClick={() => { setActiveTab("doctor"); setMobileMenuOpen(false); }} className="text-left py-2 border-b border-gray-50 hover:text-blue-600">Consult Doctors</button>
                )}
                {branding.enableBookLabTests !== false && (
                  <button onClick={() => { setActiveTab("labs"); setMobileMenuOpen(false); }} className="text-left py-2 border-b border-gray-50 hover:text-blue-600">Diagnostic Lab Tests</button>
                )}
                {branding.enableAboutUsPage !== false && (
                  <button onClick={() => { setIsAboutUsOpen(true); setMobileMenuOpen(false); }} className="text-left py-2 border-b border-gray-50 hover:text-blue-600">About Us</button>
                )}
                {branding.enableInvestPage !== false && (
                  <button onClick={() => { setIsInvestOpen(true); setMobileMenuOpen(false); }} className="text-left py-2 border-b border-gray-50 hover:text-blue-600">Invest With Us</button>
                )}
                {branding.enableGalleryPage !== false && (
                  <button onClick={() => { setIsGalleryOpen(true); setMobileMenuOpen(false); }} className="text-left py-2 border-b border-gray-50 hover:text-blue-600">Gallery</button>
                )}
                <button onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }} className="text-left py-2 border-b border-gray-50 hover:text-blue-600">My Account Profile</button>

              </div>
            </div>

            <p className="text-[10px] text-gray-400">{branding.appName || "Basanti Medical Store"} E-Commerce OS v1.0</p>
          </div>
        </div>
      )}

      {/* VIEWPORT AREA */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6 md:mt-8">
        
        {/* PREMIUM TOP 5 NEW SERVICES / PRODUCTS ADVERTISEMENT SLIDER */}
        {activeTab !== 'admin' && (
          <AdvertisementBanner 
            advertisements={advertisements}
            setActiveTab={setActiveTab}
            setSelectedCategory={setSelectedCategory}
          />
        )}
        
        {/* TAB 1: HOME PAGE */}
        {activeTab === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-12"
          >
            
            {/* HERO BANNER BENTO BOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Primary Slide */}
              <div 
                className="lg:col-span-8 rounded-3xl p-4.5 sm:p-6 md:p-10 text-white flex flex-col justify-between min-h-[220px] sm:min-h-[260px] md:min-h-[300px] shadow-lg shadow-teal-950/10 relative overflow-hidden bg-cover bg-center"
                style={{
                  backgroundImage: `url("${branding.heroImageUrl || ''}")`
                }}
              >
                {/* Base Overlay */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${branding.primaryColorHex || '#0d9488'}55 0%, rgba(13, 148, 136, 0.4) 50%, rgba(15, 23, 42, 0.45) 100%)`
                  }}
                />
                
                {/* Animated Orbs */}
                <motion.div 
                  className="absolute -top-40 -right-40 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
                  animate={{
                    x: [0, -60, 0],
                    y: [0, 60, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25"
                  animate={{
                    x: [0, 60, 0],
                    y: [0, -60, 0],
                    scale: [1, 1.4, 1]
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
                <motion.div 
                  className="absolute top-1/2 left-1/4 w-64 h-64 bg-emerald-500 rounded-full mix-blend-screen filter blur-[100px] opacity-15"
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 0.8, 1]
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                <div className="space-y-1.5 sm:space-y-3.5 max-w-lg z-10 relative drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                  {branding.enableRefills !== false && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-3 sm:py-1 bg-emerald-500/25 border border-emerald-500/20 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-300 shadow-sm backdrop-blur-md">
                    Clinical Refills & Home Wellness
                  </span>
                  )}
                  {branding.enableTrustFeatures !== false && (
                  <>
                  <h1 className="text-lg sm:text-2xl md:text-3.5xl font-extrabold tracking-tight leading-tight whitespace-pre-line text-white">
                    {branding.heroTitle || "Premium Healthcare.\nDelivered at your Doorstep."}
                  </h1>
                  <p className="text-[10px] sm:text-xs md:text-sm text-emerald-50/90 leading-normal line-clamp-2 md:line-clamp-none">
                    {branding.heroSlogan || "Order 100% genuine OTC & prescription medicines with rapid delivery, certified lab tests, and expert Ayurvedic wellness advisors."}
                  </p>
                  </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 z-10 mt-3 md:mt-6">
                  <button 
                    onClick={() => setActiveTab("store")}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] sm:text-xs px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center gap-1 cursor-pointer transition-all hover:scale-102 shadow-md hover:shadow-emerald-500/20"
                  >
                    Browse Med Catalog <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
                  </button>
                  <button 
                    onClick={() => setActiveTab("rx")}
                    className="bg-red-600 hover:bg-red-500 border border-red-500/20 text-white font-extrabold text-[10px] sm:text-xs px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl cursor-pointer transition-all hover:scale-102 flex items-center gap-1.5 shadow-md shadow-red-900/10"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Rx Scan
                  </button>
                </div>
              </div>

              {/* Quick Services Bento Column */}
              <div className="lg:col-span-4 grid grid-cols-1 gap-4">
                
                {/* Doctor Call Out */}
                {branding.enableExpertDoctor !== false && (
                  <div 
                    onClick={() => setActiveTab("doctor")}
                    className={`relative p-6 rounded-3xl border border-slate-100 shadow-xs hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group overflow-hidden ${!branding.expertDoctorImage ? 'bg-white' : ''}`}
                  >
                    {branding.expertDoctorImage && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-105" 
                        style={{ backgroundImage: `url(${branding.expertDoctorImage})` }} 
                      />
                    )}
                    {branding.expertDoctorImage && (
                      <div className="absolute inset-0 z-0 bg-white/60 backdrop-blur-sm" />
                    )}
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-green-100 text-green-600 p-3 rounded-2xl group-hover:scale-105 transition-transform shadow-sm">
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] text-white font-extrabold uppercase bg-green-500/80 backdrop-blur-sm px-2 py-0.5 rounded shadow">ONLINE NOW</span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="font-black tracking-tight mt-4 text-base text-gray-950">
                        {branding.expertDoctorTitle || "Expert Doctor Consult"}
                      </h3>
                      <p className="text-xs mt-1 leading-relaxed text-gray-700">
                        {branding.expertDoctorDesc || "Book a live high-definition video session with certified cardiologists, dermatologists, and pediatricians"} 
                        {branding.expertDoctorPrice && ` ${branding.expertDoctorPrice}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Lab collection Check out */}
                {branding.enableBookLabTests !== false && (
                  <div 
                    onClick={() => setActiveTab("labs")}
                    className={`relative p-6 rounded-3xl border border-slate-100 shadow-xs hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group overflow-hidden ${!branding.bookLabTestsImage ? 'bg-white' : ''}`}
                  >
                    {branding.bookLabTestsImage && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-105" 
                        style={{ backgroundImage: `url(${branding.bookLabTestsImage})` }} 
                      />
                    )}
                    {branding.bookLabTestsImage && (
                      <div className="absolute inset-0 z-0 bg-white/60 backdrop-blur-sm" />
                    )}
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-purple-100 text-purple-600 p-3 rounded-2xl group-hover:scale-105 transition-transform shadow-sm">
                        <LineChart className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] text-white font-extrabold uppercase bg-purple-500/80 backdrop-blur-sm px-2 py-0.5 rounded shadow">HOME COLLECTION</span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="font-black tracking-tight mt-4 text-base text-gray-950">
                        {branding.bookLabTestsTitle || "Book Diagnostic Lab Tests"}
                      </h3>
                      <p className="text-xs mt-1 leading-relaxed text-gray-700">
                        {branding.bookLabTestsDesc || "Full Body Checkups covering LFT, KFT, diabetes glucose load."}
                        {branding.bookLabTestsDelivery && ` ${branding.bookLabTestsDelivery}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* EXTRA CUSTOM SERVICES */}
                {branding.extraServices && branding.extraServices.map((srv: any) => (
                  <div 
                    key={srv.id}
                    onClick={() => setActiveTab(srv.tab || "home")}
                    className={`relative p-6 rounded-3xl border border-slate-100 shadow-xs hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group overflow-hidden ${!srv.image ? 'bg-white' : ''}`}
                  >
                    {srv.image && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-105" 
                        style={{ backgroundImage: `url(${srv.image})` }} 
                      />
                    )}
                    {srv.image && (
                      <div className="absolute inset-0 bg-black/60 z-0" />
                    )}
                    <div className="relative z-10 flex justify-between items-start">
                      <div className={`${srv.bgColor || "bg-blue-50 text-blue-600"} p-3 rounded-2xl group-hover:scale-105 transition-transform`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      {srv.badge && (
                        <span className="text-[10px] text-blue-600 font-extrabold uppercase bg-blue-50 px-2 py-0.5 rounded">{srv.badge}</span>
                      )}
                    </div>
                    <div className="relative z-10">
                      <h3 className={`font-black tracking-tight mt-4 text-base ${srv.image ? 'text-white' : 'text-gray-950'}`}>
                        {srv.title}
                      </h3>
                      <p className={`text-xs mt-1 leading-relaxed ${srv.image ? 'text-slate-200' : 'text-gray-400'}`}>
                        {srv.desc}
                        {srv.extraText && ` ${srv.extraText}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PINCODE & DELIVERY STATUS BAR */}
            {branding.enableVerifyDelivery !== false && (
              <div className={`border border-slate-100 shadow-sm rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden ${branding.verifyDeliveryBgUrl ? 'text-white border-none' : 'bg-white'}`}>
                {branding.verifyDeliveryBgUrl && (
                  <>
                    <div 
                      className="absolute inset-0 z-0 pointer-events-none" 
                      style={{ backgroundImage: `url(${branding.verifyDeliveryBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
                    />
                    <div className="absolute inset-0 z-0 bg-white/60 backdrop-blur-sm pointer-events-none" />
                  </>
                )}
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-3 rounded-2xl bg-red-50 text-red-600 shadow-sm"><MapPin className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-extrabold text-sm leading-tight text-gray-900">{branding.verifyDeliveryTitle || "Verify Delivery Availability"}</h4>
                    <p className="text-xs mt-0.5 text-gray-700">{branding.verifyDeliveryDesc || "Enter your area pincode to check service availability & estimated dispatch durations."}</p>
                  </div>
                </div>

                <div className="flex gap-2 relative z-10">
                  <input 
                    type="text" 
                    placeholder="e.g. 110019"
                    maxLength={6}
                    value={checkPincode}
                    onChange={(e) => { setCheckPincode(e.target.value); setPincodeStatus("idle"); }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 w-36 text-center font-bold tracking-widest"
                  />
                  <button 
                    onClick={handlePincodeCheck}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
                  >
                    Verify Area
                  </button>
                </div>

                {pincodeStatus !== "idle" && (
                  <div className="text-xs font-bold">
                    {pincodeStatus === "serviceable" ? (
                      <span className="text-green-600 flex items-center gap-1">✔ Serviceable! Deliveries reach within 4-12 Hours.</span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">❌ Sorry, we are not available on your Location.</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* POPULAR CATEGORIES CAROUSEL */}
            {branding.enableCategories !== false && (
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Medicine Categories</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Shop clinically tested formulations categorized for standard healthcare demands.</p>
                </div>
                <button onClick={() => { setSelectedCategory("all"); setActiveTab("store"); }} className="text-xs text-blue-600 font-extrabold hover:underline cursor-pointer flex items-center">
                  See All Categories <ChevronRight className="w-4 h-4" />
                </button>
              </div>

               <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
                {allCategories.slice(1).map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => { 
                      setSelectedCategory(cat.id); 
                      setActiveTab("store"); 
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`bg-white border rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-105 ${
                      selectedCategory === cat.id ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-100 hover:border-blue-200'
                    }`}
                  >
                    {branding.categoryImages?.[cat.id] ? (
                      <img 
                        src={branding.categoryImages[cat.id]} 
                        alt={cat.name} 
                        className="w-12 h-12 rounded-xl object-cover mb-2.5 bg-slate-50 border border-slate-100 shadow-xs" 
                      />
                    ) : (
                      <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl mb-2.5">
                        <Pill className="w-5 h-5 rotate-45" />
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight leading-tight line-clamp-2">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            )}
            {/* FEATURED / TOP SELLING MEDICINES */}
            {branding.enableTopSelling !== false && (
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Top-Selling Medicines</h2>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">Bestsellers stocked directly in our climate-controlled retail outlets.</p>
                </div>
                <button onClick={() => { setSelectedCategory("all"); setActiveTab("store"); }} className="text-xs text-blue-600 font-extrabold hover:underline flex items-center">
                  View Full Catalog <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Products Listing Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                {products.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} p={p} onAddToCart={(p, q) => { addToCart(p, q); alert(`${q} item(s) added to cart.`); }} onBuyNow={handleBuyNow} onSelectProduct={setSelectedProduct}
          onRxClick={() => { setActiveTab("rx"); window.scrollTo({top:0, behavior:"smooth"}); }} />
                ))}
              </div>
            </div>

            )}
            {/* LOYALTY & REWARD BANNER BOARD */}
            {(branding.isPremiumClubEnabled === undefined || branding.isPremiumClubEnabled) && (
              <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <span className="bg-emerald-500 text-[10px] text-white font-extrabold uppercase px-2.5 py-1 rounded-full">{branding.premiumClubTitle || "SONU PREMIUM CLUB"}</span>
                  <h3 className="font-black text-xl md:text-2xl tracking-tight leading-snug">{branding.premiumClubSlogan || "Refer your friends & receive direct cashback to your wallet!"}</h3>
                  <p className="text-xs text-emerald-100 leading-normal max-w-xl">
                    {branding.premiumClubDescription || "Earn 5% reward points on every order. Plus, copy the code REFERRAL50 inside the account tab to add ₹50 cashback instantly to your wallet. Use your points during checkout for super discounts!"}
                  </p>
                </div>
                <div className="md:col-span-4 bg-teal-950 p-5 rounded-2xl border border-teal-800 space-y-4">
                  <h4 className="font-bold text-xs text-emerald-300 uppercase tracking-widest text-center">Your Loyalty Account Status</h4>
                  <div className="flex justify-between text-xs text-white">
                    <span>Reward Points:</span>
                    <span className="font-bold text-emerald-300">{loyalty ? loyalty.pointsBalance : 120} Points</span>
                  </div>
                  <div className="flex justify-between text-xs text-white">
                    <span>Wallet Balance:</span>
                    <span className="font-bold text-emerald-300">₹{loyalty ? loyalty.walletBalance : 450}</span>
                  </div>
                  <div className="flex justify-between text-xs text-white">
                    <span>Club Tier:</span>
                    <span className="font-bold bg-yellow-500 text-teal-950 px-2 py-0.2 rounded text-[10px] uppercase font-black">{loyalty ? loyalty.tier : "SILVER"} MEMBER</span>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* TAB 2: PRODUCT LISTING STORE */}
        {activeTab === "store" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            
            {/* Left Filter Sidebar */}
            <div className="lg:col-span-3 space-y-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs h-fit">
              <div>
                <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider mb-3">Categories</h3>
                <div className="space-y-1 text-xs">
                  {allCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left py-2 px-3 rounded-lg font-bold transition-all ${
                        selectedCategory === cat.id ? 'bg-blue-50 text-blue-600 font-extrabold' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 border-slate-100">
                <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider mb-3">Product Filters</h3>
                <div className="space-y-3 text-xs text-slate-600">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-blue-600" />
                    <span>In-Stock Only</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-blue-600" />
                    <span>Prescription Not Required</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Product Grid Column */}
            <div className="lg:col-span-9 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-xs text-xs font-semibold">
                <span className="text-slate-500">Showing {products.length} medications matching your request</span>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Sort By:</span>
                  <select className="border border-slate-200 rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500">
                    <option>Popularity</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Discount Percentage</option>
                    <option>Customer Rating</option>
                  </select>
                </div>
              </div>

              {/* Medicine Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} p={p} onAddToCart={(p, q) => { addToCart(p, q); alert(`${q} item(s) added to cart.`); }} onBuyNow={handleBuyNow} onSelectProduct={setSelectedProduct}
          onRxClick={() => { setActiveTab("rx"); window.scrollTo({top:0, behavior:"smooth"}); }} />
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 3: PRESCRIPTION UPLOAD */}
        {activeTab === "rx" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-8"
          >
            <div className="text-center space-y-2">
              <span className="bg-red-50 text-red-600 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">Prescription Verification Gateway</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upload Your Medical Prescription</h2>
              <p className="text-xs text-gray-400 leading-relaxed max-w-lg mx-auto">
                Government guidelines mandate verified doctor prescriptions to dispense schedule drugs. Upload your file here. Our digital pharmacist reviews uploads within 5 minutes.
              </p>
            </div>

            {rxUploadStatus === "success" ? (
              <div className="bg-green-50 border border-green-100 p-6 rounded-2xl text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                <div>
                  <h3 className="font-bold text-green-900 text-sm">Upload Registered Successfully!</h3>
                  <p className="text-xs text-green-700 mt-1 max-w-md mx-auto">
                    Your prescription has been added as pending review. Please visit the **Ops Panel** in the top header to mock-approve this prescription immediately as a pharmacist, unlocking payment checks!
                  </p>
                </div>
                <button 
                  onClick={() => setRxUploadStatus("idle")}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Upload Another Prescription
                </button>
              </div>
            ) : (
              <form onSubmit={handleRxUploadSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Patient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter patient full name matching doctor's slip"
                    value={rxPatientName}
                    onChange={(e) => setRxPatientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Drag and Drop Area */}
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors bg-slate-50 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleRxFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-xs font-extrabold text-gray-700">Drag & drop prescription slip, or browse files</p>
                  <p className="text-[10px] text-gray-400 mt-1">Accepts PNG, JPG, JPEG files. Max limit: 5MB.</p>
                  {rxFileName && (
                    <div className="mt-4 bg-blue-50 border border-blue-100 text-blue-800 text-xs py-1.5 px-3 rounded-lg inline-block font-mono">
                      Selected: {rxFileName}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={rxUploadStatus === "uploading"}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition-colors cursor-pointer"
                >
                  {rxUploadStatus === "uploading" ? "Submitting prescription..." : "Submit File for Review"}
                </button>
              </form>
            )}

            {/* List of Uploaded Prescriptions */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-black text-sm text-gray-900 uppercase tracking-tight mb-4">Your Prescription History</h3>
              <div className="space-y-3">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="border border-slate-100 rounded-xl p-4 flex items-center justify-between text-xs hover:border-blue-100 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="font-bold text-gray-900">{rx.id}</strong>
                        <span className="text-gray-400">| Patient: {rx.patientName}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Uploaded: {new Date(rx.uploadedAt).toLocaleString()}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      rx.status === PrescriptionStatus.VERIFIED ? 'bg-green-100 text-green-800' :
                      rx.status === PrescriptionStatus.REJECTED ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rx.status}
                    </span>
                  </div>
                ))}
                {prescriptions.length === 0 && (
                  <p className="text-gray-400 text-center py-4 text-xs">No uploads registered yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: DOCTOR CONSULTATION APPOINTMENTS */}
        {activeTab === "doctor" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="text-center space-y-2 max-w-lg mx-auto">
              <span className="bg-red-50 text-red-600 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">Certified Physicians Panel</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Consult Registered Specialists Online</h2>
              <p className="text-xs text-gray-400 leading-normal">
                Avoid crowded clinics. Get virtual medical consultations, clinical diagnoses, and downloadable digital prescriptions from certified practitioners in minutes.
              </p>
            </div>

            {/* Specialist Card Deck Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white border border-slate-100 shadow-xs rounded-3xl p-5 flex flex-col justify-between hover:border-blue-200 transition-all">
                  <div className="space-y-4">
                    <img src={doc.image} alt="" className="w-full h-40 object-cover rounded-2xl" />
                    <div>
                      <span className="bg-blue-50 text-blue-700 text-[9px] uppercase font-black px-2 py-0.5 rounded-md">{doc.specialty}</span>
                      <h3 className="font-black text-gray-900 mt-2 text-sm">{doc.name}</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">{doc.education}</p>
                    </div>
                    <div className="flex justify-between text-xs border-y py-2 border-gray-50 text-slate-600">
                      <span>Experience:</span>
                      <span className="font-bold">{doc.experience} Years</span>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-baseline text-xs relative">
                      <span className="text-gray-400 font-bold">Consultation Fee:</span>
                      <div className="flex items-center gap-2">
                        {doc.offerTag && <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full text-[10px] animate-pulse">{doc.offerTag}</span>}
                        <span className="font-extrabold text-blue-900 text-sm">₹{doc.consultationFee}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedDoctorId(doc.id); }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer transition-colors text-center"
                    >
                      Book Consultation Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Doctor Booking Modal / Overlay Form */}
            {selectedDoctorId && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
                  <button onClick={() => setSelectedDoctorId("")} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                  <h3 className="font-black text-base text-gray-950 mb-4">Schedule Your Consultation Call</h3>
                  
                  <form onSubmit={handleBookDoctor} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Patient Full Name</label>
                      <input type="text" required value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile Contact Number</label>
                      <input type="tel" required value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Patient Address</label>
                      <textarea required rows={2} value={patientAddress} onChange={(e) => setPatientAddress(e.target.value)} placeholder="Full physical address" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Consultation Mode</label>
                      <div className="flex flex-wrap gap-2">
                        {[{id: "VIDEO", label: "Video Call"}, {id: "AUDIO", label: "Audio Call"}, {id: "CHAT", label: "Chat"}, {id: "CLINIC", label: "Clinic Visit"}].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setBookingMode(m.id as any)}
                            className={`flex-1 py-2 px-1 text-[9px] font-bold border rounded-lg transition-colors cursor-pointer whitespace-nowrap flex flex-col items-center justify-center gap-0.5 ${
                              bookingMode === m.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:bg-slate-50'
                            }`}
                          >
                            <span>{m.label}</span>
                            {selectedDoctorInfo && <span className="text-[10px]">₹{getAppointmentPrice(selectedDoctorInfo.consultationFee, m.id)}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl transition-colors mt-2 cursor-pointer shadow-md">
                      Pay ₹{currentAppointmentPrice} & Book Appointment
                    </button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 5: LAB TEST MOUNT */}
        {activeTab === "labs" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="text-center space-y-2 max-w-lg mx-auto">
              <span className="bg-purple-50 text-purple-600 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">Diagnostics & Labs Center</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Home Blood Sample Collection</h2>
              <p className="text-xs text-gray-400 leading-normal">
                Certified phlebotomists arrive right at your residence. Fully automated lab analysis ensures absolute diagnostic calibration and digital reports in 12 hours.
              </p>
            </div>

            {/* Diagnostic packages card list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {labTests.map((test) => (
                <div key={test.id} className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6 flex flex-col justify-between hover:border-blue-200 transition-all">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-gray-900 text-base">{test.name}</h3>
                      <span className="bg-purple-100 text-purple-800 text-[9px] font-black uppercase px-2.5 py-1 rounded-full">{test.testsCount} TESTS INCLUDED</span>
                    </div>
                    <p className="text-xs text-gray-400">{test.description}</p>
                    
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {test.testsIncluded.map((sub, i) => (
                        <span key={i} className="bg-slate-50 border border-slate-100 text-[10px] text-gray-600 font-bold px-2 py-1 rounded-md">
                          {sub}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-t pt-4 border-gray-50 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <div>Sample: <strong className="text-gray-800 font-extrabold">{test.sampleRequired}</strong></div>
                      <div>Fasting: <strong className="text-gray-800 font-extrabold">{test.fastingRequired ? "YES" : "NO"}</strong></div>
                      <div>Reports: <strong className="text-gray-800 font-extrabold">{test.reportsInHours} Hours</strong></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-6">
                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-blue-900 text-lg">₹{test.price}</span>
                      <span className="text-xs text-gray-400 line-through">MRP ₹{test.mrp}</span>
                    </div>
                    <button
                      onClick={() => { setSelectedLabId(test.id); }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
                    >
                      Book Home Collection
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Lab booking slot selector form */}
            {selectedLabId && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
                  <button onClick={() => setSelectedLabId("")} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                  <h3 className="font-black text-base text-gray-950 mb-4">Book Diagnostic Sample Extraction</h3>
                  
                  <form onSubmit={handleBookLabTest} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Patient Full Name</label>
                      <input type="text" required value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contact Mobile Number</label>
                      <input type="tel" required value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Collection Date</label>
                      <input type="date" required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Collection Address</label>
                      <input type="text" required placeholder="House number, block, sector coordinates" value={bookingAddress} onChange={(e) => setBookingAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pincode</label>
                      <input type="text" required placeholder="110019" maxLength={6} value={bookingPincode} onChange={(e) => setBookingPincode(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center font-bold tracking-widest" />
                    </div>
                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 rounded-xl transition-colors mt-2 cursor-pointer">
                      Authorize Home Sample Collection
                    </button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 6: USER PROFILE ACCOUNT AREA */}
        {activeTab === "profile" && !currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-md mx-auto bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl space-y-6 my-8"
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-black text-gray-950 text-lg">Sign In / Register Profile</h3>
              <p className="text-xs text-gray-400 leading-normal">
                Enter your email address to log in or create your medical e-commerce profile, secure order details, and unlock loyalty rewards.
              </p>
            </div>

            {authErrorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs font-bold leading-normal text-center">
                {authErrorMsg}
              </div>
            )}

            {authModalStep === "email" ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!authEmail || !authEmail.includes("@")) {
                  setAuthErrorMsg("Please enter a valid email address.");
                  return;
                }
                setIsAuthSubmitting(true);
                setAuthErrorMsg("");
                try {
                  const res = await fetch(`/api/user/profile?email=${encodeURIComponent(authEmail)}`);
                  const data = await res.json();
                  if (data.success && data.user) {
                    // Logged in!
                    setCurrentUser(data.user);
                    localStorage.setItem("sonu_user", JSON.stringify(data.user));
                    alert(`Welcome back, ${data.user.fullName}!`);
                    if (authCallbackRef.current) {
                      authCallbackRef.current(data.user);
                      authCallbackRef.current = null;
                    }
                  } else {
                    // Register Step
                    setAuthModalStep("create_profile");
                  }
                } catch (err) {
                  setAuthErrorMsg("Failed to check profile. Please try again.");
                } finally {
                  setIsAuthSubmitting(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Enter Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isAuthSubmitting ? "Processing..." : "Continue to Pharmacy"} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!authFullName || !authPhone) {
                  setAuthErrorMsg("Name and mobile phone are required.");
                  return;
                }
                setIsAuthSubmitting(true);
                setAuthErrorMsg("");
                try {
                  const res = await fetch('/api/user/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: authEmail,
                      fullName: authFullName,
                      phone: authPhone,
                      addressLine: authAddressLine,
                      city: authCity,
                      pincode: authPincode
                    })
                  });
                  const data = await res.json();
                  if (data.success && data.user) {
                    setCurrentUser(data.user);
                    localStorage.setItem("sonu_user", JSON.stringify(data.user));
                    alert(`🎉 Welcome, ${data.user.fullName}! Your profile has been created and 120 Reward Points added!`);
                    if (authCallbackRef.current) {
                      authCallbackRef.current(data.user);
                      authCallbackRef.current = null;
                    }
                  } else {
                    setAuthErrorMsg(data.error || "Failed to register profile.");
                  }
                } catch (err) {
                  setAuthErrorMsg("Failed to save profile. Please try again.");
                } finally {
                  setIsAuthSubmitting(false);
                }
              }} className="space-y-3.5 text-xs">
                <p className="text-green-600 font-extrabold text-[10px] uppercase text-center bg-green-50 p-2 rounded-lg border border-green-100">
                  Setup Your Professional Health Profile:
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input type="text" required placeholder="Hariom Sharma" value={authFullName} onChange={(e) => setAuthFullName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile Number</label>
                  <input type="tel" required placeholder="+91 9999999999" value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Shipping Address Line</label>
                  <input type="text" placeholder="Flat, Sector, Building Coordinates" value={authAddressLine} onChange={(e) => setAuthAddressLine(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">City</label>
                    <input type="text" placeholder="New Delhi" value={authCity} onChange={(e) => setAuthCity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pincode</label>
                    <input type="text" maxLength={6} placeholder="110019" value={authPincode} onChange={(e) => setAuthPincode(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center font-bold tracking-widest" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthModalStep("email")}
                    className="flex-1 border border-gray-200 hover:bg-slate-50 font-bold py-3 rounded-xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-extrabold py-3 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isAuthSubmitting ? "Registering..." : "Complete Setup"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {activeTab === "profile" && currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs text-slate-700"
          >
            
            {/* Left Side Column: Profile Card & Navigation */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 font-extrabold text-xl">
                    {currentUser.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <h3 className="font-black text-gray-950 text-base">{currentUser.fullName}</h3>
                  <p className="text-xs text-slate-500">Email: <strong className="font-mono text-slate-800">{currentUser.email}</strong></p>
                  <p className="text-xs text-slate-500">Phone: <strong className="font-mono text-slate-800">{currentUser.phone}</strong></p>
                </div>

                {/* Reward stats board */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Loyalty Status:</span>
                    <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] uppercase">
                      {loyalty ? loyalty.tier : "SILVER"} MEMBER
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Points Balance:</span>
                    <span className="font-black text-slate-800">{loyalty ? loyalty.pointsBalance : 120} Points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wallet Cashback:</span>
                    <span className="font-black text-green-600">₹{loyalty ? loyalty.walletBalance : 450}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Referral Code:</span>
                    <span className="font-mono font-bold uppercase text-blue-600">{loyalty ? loyalty.referralCode : "PARTHA773"}</span>
                  </div>
                </div>

                {/* Apply referral input */}
                <div className="space-y-2 pb-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Apply Friend's Referral Code</label>
                  <div className="flex gap-2 relative z-10">
                    <input
                      type="text"
                      placeholder="Enter REFERRAL50"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center font-bold tracking-wider"
                    />
                    <button
                      onClick={handleApplyReferral}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center">Type <strong>REFERRAL50</strong> to claim ₹50 welcome cashback.</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-extrabold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out from Account
                </button>
              </div>

              {/* Navigation Subtabs Menu */}
              <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-4 space-y-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">My Health Hub</span>
                {[
                  { key: "orders", label: "My Orders & Refills", icon: <ShoppingBag className="w-4 h-4" /> },
                  { key: "diary", label: "Health Logs & Trackers", icon: <Activity className="w-4 h-4" /> },
                  { key: "reminders", label: "Pill Time Reminders", icon: <Bell className="w-4 h-4" /> },
                  { key: "wishlist", label: "My Saved Wishlist", icon: <Heart className="w-4 h-4" /> },
                  { key: "addresses", label: "My Saved Addresses", icon: <MapPin className="w-4 h-4" /> },
                  { key: "policies", label: "Policies & Licenses", icon: <FileText className="w-4 h-4" /> },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setProfileSubTab(tab.key as any)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-xs text-left transition-all ${
                      profileSubTab === tab.key
                        ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.key === "wishlist" && wishlist.length > 0 && (
                      <span className="ml-auto bg-red-100 text-red-600 font-extrabold text-[10px] px-1.5 py-0.5 rounded-md">
                        {wishlist.length}
                      </span>
                    )}
                    {tab.key === "reminders" && reminders.length > 0 && (
                      <span className="ml-auto bg-amber-100 text-amber-800 font-extrabold text-[10px] px-1.5 py-0.5 rounded-md">
                        {reminders.filter(r => r.active).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

            </div>

            {/* Right Side Column: Dynamic Panels Content */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* SUBTAB CONTENT: ORDERS, CONSULTATIONS, LABS */}
              {profileSubTab === "orders" && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Active Refill Subscriptions */}
                  <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6">
                    <h3 className="font-black text-sm text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-green-600 animate-spin" style={{ animationDuration: '8s' }} /> Active Auto-Refill Subscriptions
                    </h3>
                    {subscriptions.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">You have no active automatic refills yet. Setup refills directly on product detail panels.</p>
                    ) : (
                      <div className="space-y-3">
                        {subscriptions.map((sub) => (
                          <div key={sub.id} className="border border-slate-100 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-3">
                              <img src={sub.product.image} alt="" className="w-10 h-10 object-cover rounded-lg" />
                              <div>
                                <p className="font-bold text-gray-800">{sub.product.name} <span className="text-gray-400 font-medium">({sub.quantity} units)</span></p>
                                <p className="text-[10px] text-gray-400">Frequency: <span className="font-bold text-blue-600">{sub.frequency} Refills</span> | Next dispatch: <span className="font-extrabold text-slate-700">{sub.nextDeliveryDate}</span></p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                sub.status === RefillStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}>{sub.status}</span>

                              {sub.status === RefillStatus.ACTIVE ? (
                                <button
                                  onClick={() => handleUpdateSubscription(sub.id, RefillStatus.PAUSED)}
                                  className="border border-gray-200 hover:bg-slate-50 text-gray-600 font-bold px-2.5 py-1 rounded-lg text-[10px] cursor-pointer"
                                >
                                  Pause
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateSubscription(sub.id, RefillStatus.ACTIVE)}
                                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] cursor-pointer"
                                >
                                  Resume
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateSubscription(sub.id, RefillStatus.CANCELLED)}
                                className="text-red-500 hover:bg-red-50 font-bold px-2.5 py-1 rounded-lg text-[10px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Scheduled Doctor Tele-Consultations & Labs Bookings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Doctor appointments */}
                    <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6 space-y-4">
                      <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-blue-600" /> Booked Doctor Consults
                      </h4>
                      {appointments.length === 0 ? (
                        <p className="text-[11px] text-gray-400 py-4 text-center">No tele-consultations booked yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {appointments.map((appt) => {
                            const doc = doctors.find(d => d.id === appt.doctorId);
                            return (
                              <div key={appt.id} className="border border-slate-50 p-3 rounded-xl bg-slate-50/50 flex justify-between items-start text-xs">
                                <div>
                                  <p className="font-bold text-slate-800">{doc ? doc.name : "Registered GP Specialist"}</p>
                                  <p className="text-[9px] text-slate-400">Patient: {appt.patientName} ({appt.mode})</p>
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                                  {appt.status}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Labs Bookings */}
                    <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6 space-y-4">
                      <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-teal-600" /> Home Sample Labs Booked
                      </h4>
                      {labBookings.length === 0 ? (
                        <p className="text-[11px] text-gray-400 py-4 text-center">No home sample collections booked yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {labBookings.map((bk) => {
                            const test = labTests.find(t => t.id === bk.testId);
                            return (
                              <div key={bk.id} className="border border-slate-50 p-3 rounded-xl bg-slate-50/50 flex justify-between items-start text-xs">
                                <div>
                                  <p className="font-bold text-slate-800">{test ? test.title : "Health Package Selection"}</p>
                                  <p className="text-[9px] text-slate-400">Patient: {bk.patientName} | Slot: {bk.date} {bk.timeSlot}</p>
                                </div>
                                <span className="bg-teal-100 text-teal-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                                  ACTIVE
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* My Order Sheets (Order History) */}
                  <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6 space-y-4">
                    <h3 className="font-black text-sm text-gray-900 uppercase tracking-tight flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-blue-600" /> My Customer Order Sheets
                    </h3>
                    
                    <div className="space-y-5">
                      {orders.map((ord) => (
                        <div key={ord.id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                          
                          {/* Order Card Header */}
                          <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order ID: #{ord.id.substring(0, 10).toUpperCase()}</p>
                              <p className="text-xs text-slate-700">Placed on: <strong className="font-semibold">{new Date(ord.createdAt).toLocaleDateString()}</strong> | Payment: <strong className="text-blue-600">{ord.paymentMethod}</strong></p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                ord.status === OrderStatus.PROCESSING ? 'bg-blue-100 text-blue-800' :
                                ord.status === OrderStatus.PACKED ? 'bg-indigo-100 text-indigo-800' :
                                ord.status === OrderStatus.SHIPPED ? 'bg-amber-100 text-amber-800' :
                                ord.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>{ord.status}</span>
                            </div>
                          </div>

                          {/* Items inside order */}
                          <div className="p-4 space-y-3">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-3">
                                  {item.image && <img src={item.image} alt="" className="w-8 h-8 object-cover rounded-lg border border-slate-100" />}
                                  <div>
                                    <p className="font-extrabold text-slate-800">{item.name}</p>
                                    <p className="text-[10px] text-gray-400">Qty: <strong className="text-slate-700">{item.quantity}</strong> | Price: <strong>₹{item.price}</strong></p>
                                  </div>
                                </div>
                                <span className="font-bold text-slate-800">₹{item.price * item.quantity}</span>
                              </div>
                            ))}

                            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs bg-slate-50/50 p-2 rounded-xl">
                              <p className="text-slate-400">Billing Breakups (GST included):</p>
                              <p className="font-black text-slate-900 text-sm">Grand Total: ₹{ord.total}</p>
                            </div>

                            {/* STEPS TIMELINE PROGRESS BAR */}
                            {ord.status !== OrderStatus.CANCELLED && (
                              <div className="py-4 border-t border-slate-100 mt-3">
                                <div className="relative flex justify-between items-center max-w-md mx-auto">
                                  
                                  {/* Line Track */}
                                  <div className="absolute left-4 right-4 top-3.5 h-[3px] bg-slate-100 -z-0">
                                    <div 
                                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                                      style={{
                                        width: ord.status === OrderStatus.PROCESSING ? '0%' :
                                               ord.status === OrderStatus.PACKED ? '33%' :
                                               ord.status === OrderStatus.SHIPPED ? '66%' : '100%'
                                      }}
                                    />
                                  </div>

                                  {/* Visual Steppers */}
                                  {[
                                    { key: OrderStatus.PROCESSING, label: "Vetted", icon: <Check className="w-3.5 h-3.5" />, desc: "Rx Checked" },
                                    { key: OrderStatus.PACKED, label: "Dispensed", icon: <Pill className="w-3.5 h-3.5" />, desc: "Formulated" },
                                    { key: OrderStatus.SHIPPED, label: "Dispatched", icon: <Truck className="w-3.5 h-3.5" />, desc: "In Transit" },
                                    { key: OrderStatus.DELIVERED, label: "Delivered", icon: <CheckCircle className="w-3.5 h-3.5" />, desc: "Sealed Handover" }
                                  ].map((step) => {
                                    const statusesOrder = [OrderStatus.PROCESSING, OrderStatus.PACKED, OrderStatus.SHIPPED, OrderStatus.DELIVERED];
                                    const isCompleted = statusesOrder.indexOf(ord.status) >= statusesOrder.indexOf(step.key);
                                    const isCurrent = ord.status === step.key;

                                    return (
                                      <div key={step.key} className="flex flex-col items-center relative z-10">
                                        <div 
                                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                            isCompleted 
                                              ? 'bg-blue-600 text-white shadow-xs' 
                                              : 'bg-white border-2 border-slate-200 text-slate-400'
                                          } ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}`}
                                        >
                                          {isCompleted && step.key !== ord.status && step.key !== OrderStatus.DELIVERED ? (
                                            <Check className="w-3 h-3 stroke-[3px]" />
                                          ) : (
                                            step.icon
                                          )}
                                        </div>
                                        <div className="mt-1 text-center w-14">
                                          <p className={`text-[9px] font-black whitespace-nowrap ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
                                          <p className="text-[8px] text-slate-400 whitespace-nowrap">{step.desc}</p>
                                        </div>
                                      </div>
                                    );
                                  })}

                                </div>
                              </div>
                            )}

                            {/* Detailed Tracking Logs */}
                            {ord.trackingHistory && ord.trackingHistory.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-100 text-[10px]">
                                <span className="font-bold text-slate-400 uppercase tracking-widest block mb-2">Tracking Verification Logs:</span>
                                <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                  {ord.trackingHistory.map((track, i) => (
                                    <div key={i} className="flex gap-2 text-left">
                                      <span className="text-green-600 font-extrabold">•</span>
                                      <p className="flex-1 text-slate-600 font-medium">
                                        {track.note} <span className="text-gray-400 text-[9px] font-mono">({new Date(track.timestamp).toLocaleTimeString()})</span>
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Order Self-Service Actions */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
                              <button
                                onClick={() => handleReorder(ord)}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-black px-3.5 py-2 rounded-xl cursor-pointer"
                              >
                                🔄 Quick Reorder Items
                              </button>
                              
                              <button
                                onClick={() => setSelectedInvoiceOrder(ord)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl cursor-pointer flex items-center gap-1"
                              >
                                <Printer className="w-3.5 h-3.5" /> Tax Invoice
                              </button>

                              {ord.status === OrderStatus.PROCESSING && (
                                <button
                                  onClick={() => handleCancelOrder(ord.id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 font-black px-3.5 py-2 rounded-xl cursor-pointer"
                                >
                                  ❌ Cancel Order
                                </button>
                              )}

                              {ord.status === OrderStatus.DELIVERED && (
                                <button
                                  onClick={() => handleReturnOrder(ord.id)}
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-black px-3.5 py-2 rounded-xl cursor-pointer"
                                >
                                  ↩️ Return / Refund formulation
                                </button>
                              )}
                            </div>

                          </div>

                        </div>
                      ))}
                      {orders.length === 0 && <p className="text-xs text-gray-400 py-6 text-center">No orders have been recorded under this email address yet.</p>}
                    </div>

                  </div>

                </div>
              )}

              {/* SUBTAB CONTENT: HEALTH DIARY */}
              {profileSubTab === "diary" && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* BMI Calculator Widget */}
                  <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6 space-y-4">
                    <h3 className="font-black text-sm text-gray-900 uppercase tracking-tight flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-blue-600" /> Professional BMI Calculator
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Body Weight (kg)</label>
                          <input
                            type="number"
                            placeholder="e.g. 70"
                            value={bmiWeight}
                            onChange={(e) => setBmiWeight(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Body Height (cm)</label>
                          <input
                            type="number"
                            placeholder="e.g. 175"
                            value={bmiHeight}
                            onChange={(e) => setBmiHeight(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const w = parseFloat(bmiWeight);
                            const h = parseFloat(bmiHeight) / 100;
                            if (w && h) {
                              const value = (w / (h * h)).toFixed(1);
                              const valNum = parseFloat(value);
                              let status = "Normal Glycemic";
                              if (valNum < 18.5) status = "Underweight";
                              else if (valNum < 25) status = "Healthy Weight Range";
                              else if (valNum < 30) status = "Overweight";
                              else status = "Obese";
                              setBmiResult({ value, status });
                            } else {
                              alert("Please enter valid weight and height coordinates.");
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 rounded-xl transition-all cursor-pointer"
                        >
                          Calculate BMI Index
                        </button>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center text-center space-y-2">
                        {bmiResult ? (
                          <>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Your Body Mass Index</p>
                            <h4 className="text-3xl font-black text-slate-800 tracking-tight">{bmiResult.value}</h4>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black mx-auto uppercase ${
                              bmiResult.status.includes("Healthy") ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                            }`}>{bmiResult.status}</span>
                            <p className="text-[10px] text-slate-500 leading-normal">
                              {bmiResult.status.includes("Healthy") 
                                ? "Great job! Keep up a balanced diet and regular physical workouts." 
                                : "A healthy BMI is crucial to minimize cardiac risk and metabolic syndrome. Chat with our virtual GP assistant for dietary guidelines."}
                            </p>
                          </>
                        ) : (
                          <p className="text-[11px] text-slate-400">Enter weight and height coordinates on the left to see your metabolic index.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BP and Heart Rate Tracker Logs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* BP tracker */}
                    <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6 space-y-4">
                      <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-red-500" /> Blood Pressure Monitor (BP)
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Sys (mmHg)</label>
                          <input type="number" placeholder="120" value={bpSystolic} onChange={(e) => setBpSystolic(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-center" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Dia (mmHg)</label>
                          <input type="number" placeholder="80" value={bpDiastolic} onChange={(e) => setBpDiastolic(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-center" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Pulse (bpm)</label>
                          <input type="number" placeholder="72" value={bpPulse} onChange={(e) => setBpPulse(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-center" />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const sys = parseInt(bpSystolic);
                          const dia = parseInt(bpDiastolic);
                          const pulse = parseInt(bpPulse);
                          if (sys && dia && pulse) {
                            const newLog = {
                              id: "bp-" + Date.now(),
                              systolic: sys,
                              diastolic: dia,
                              pulse,
                              date: new Date().toLocaleString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true }) + " today"
                            };
                            const updated = [newLog, ...bpLogs];
                            setBpLogs(updated);
                            localStorage.setItem("partha_bp_logs", JSON.stringify(updated));
                            setBpSystolic("");
                            setBpDiastolic("");
                            setBpPulse("");
                            alert("📈 Blood pressure logs successfully updated.");
                          } else {
                            alert("Fill all systolic, diastolic, and pulse inputs.");
                          }
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 rounded-xl cursor-pointer text-center"
                      >
                        Add BP Entry Log
                      </button>

                      <div className="space-y-1.5 max-h-44 overflow-y-auto pt-2">
                        {bpLogs.map(log => {
                          const isHigh = log.systolic >= 135 || log.diastolic >= 85;
                          return (
                            <div key={log.id} className="border border-slate-50 p-2.5 rounded-xl bg-slate-50/50 flex justify-between items-center text-[11px]">
                              <div>
                                <p className="font-extrabold text-slate-800">{log.systolic} / {log.diastolic} <span className="text-gray-400 font-medium">mmHg</span></p>
                                <p className="text-[9px] text-slate-400">HR: {log.pulse} bpm | {log.date}</p>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                isHigh ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                              }`}>{isHigh ? "Pre-Hypertensive" : "Normal BP"}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sugar tracker */}
                    <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6 space-y-4">
                      <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-purple-600" /> Blood Sugar / Glucose Log
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Level (mg/dL)</label>
                          <input type="number" placeholder="100" value={sugarLevel} onChange={(e) => setSugarLevel(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-center" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Meal Context</label>
                          <select value={sugarType} onChange={(e: any) => setSugarType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs">
                            <option value="Fasting">Fasting</option>
                            <option value="Post-Prandial">Post-Prandial</option>
                            <option value="Random">Random</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const level = parseInt(sugarLevel);
                          if (level) {
                            const newLog = {
                              id: "sug-" + Date.now(),
                              level,
                              type: sugarType,
                              date: new Date().toLocaleString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true }) + " today"
                            };
                            const updated = [newLog, ...sugarLogs];
                            setSugarLogs(updated);
                            localStorage.setItem("partha_sugar_logs", JSON.stringify(updated));
                            setSugarLevel("");
                            alert("🩸 Blood sugar log updated successfully.");
                          } else {
                            alert("Please specify glucose concentration (mg/dL).");
                          }
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 rounded-xl cursor-pointer text-center"
                      >
                        Add Sugar Entry Log
                      </button>

                      <div className="space-y-1.5 max-h-44 overflow-y-auto pt-2">
                        {sugarLogs.map(log => {
                          const isHigh = log.level >= 140;
                          return (
                            <div key={log.id} className="border border-slate-50 p-2.5 rounded-xl bg-slate-50/50 flex justify-between items-center text-[11px]">
                              <div>
                                <p className="font-extrabold text-slate-800">{log.level} <span className="text-gray-400 font-medium">mg/dL</span></p>
                                <p className="text-[9px] text-slate-400">Context: {log.type} | {log.date}</p>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                isHigh ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-700"
                              }`}>{isHigh ? "High Glycemia" : "Normal Glycemic"}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* SUBTAB CONTENT: PILL REMINDERS */}
              {profileSubTab === "reminders" && (
                <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6 space-y-5 animate-fade-in">
                  <h3 className="font-black text-sm text-gray-950 uppercase tracking-tight flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-500" /> Pill Time Reminders & Dosage Scheduler
                  </h3>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Medication Name</label>
                      <input type="text" placeholder="e.g. Pantocid 40mg" value={pillName} onChange={(e) => setPillName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Daily Schedule Time</label>
                      <input type="text" placeholder="e.g. 08:00 AM" value={pillTime} onChange={(e) => setPillTime(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Dosage Instructions</label>
                      <input type="text" placeholder="e.g. 1 Tablet - Empty stomach" value={pillDosage} onChange={(e) => setPillDosage(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                    </div>
                    <button
                      onClick={() => {
                        if (pillName && pillTime && pillDosage) {
                          const newRem = {
                            id: "rem-" + Date.now(),
                            name: pillName,
                            time: pillTime,
                            dosage: pillDosage,
                            active: true
                          };
                          const updated = [...reminders, newRem];
                          setReminders(updated);
                          localStorage.setItem("partha_pill_reminders", JSON.stringify(updated));
                          setPillName("");
                          setPillTime("");
                          setPillDosage("");
                          alert("💊 New daily pill reminder scheduled!");
                        } else {
                          alert("Please fill out name, time, and dosage coordinates.");
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs p-2.5 rounded-xl cursor-pointer"
                    >
                      Schedule Reminder
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reminders.map(rem => (
                      <div key={rem.id} className="border border-slate-100 p-4 rounded-2xl flex justify-between items-center bg-white shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${rem.active ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"}`}>
                            <Pill className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <p className="font-extrabold text-slate-800 text-xs">{rem.name}</p>
                            <p className="text-[10px] text-gray-400">Daily: <strong className="text-blue-600 font-bold">{rem.time}</strong> | {rem.dosage}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const updated = reminders.map(r => r.id === rem.id ? { ...r, active: !r.active } : r);
                              setReminders(updated);
                              localStorage.setItem("partha_pill_reminders", JSON.stringify(updated));
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-bold ${
                              rem.active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {rem.active ? "Active" : "Paused"}
                          </button>
                          <button
                            onClick={() => {
                              const updated = reminders.filter(r => r.id !== rem.id);
                              setReminders(updated);
                              localStorage.setItem("partha_pill_reminders", JSON.stringify(updated));
                            }}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {reminders.length === 0 && <p className="col-span-2 text-xs text-gray-400 py-6 text-center">No active pill schedules scheduled.</p>}
                  </div>
                </div>
              )}

              {/* SUBTAB CONTENT: WISHLIST */}
              {profileSubTab === "wishlist" && (
                <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6 space-y-4 animate-fade-in">
                  <h3 className="font-black text-sm text-gray-900 uppercase tracking-tight flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-red-500" /> My Saved Wishlist Formulation
                  </h3>
                  {wishlist.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <div className="w-12 h-12 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto">
                        <Heart className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-gray-400">Your formulation wishlist is currently empty. Star items in our store to save them here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wishlist.map(prod => (
                        <div key={prod.id} className="border border-slate-100 p-3.5 rounded-2xl flex gap-3 bg-white hover:shadow-xs transition-shadow">
                          {prod.image && <img src={prod.image} alt="" className="w-16 h-16 object-cover rounded-xl border border-slate-50" />}
                          <div className="flex-1 space-y-1 text-left">
                            <p className="font-extrabold text-slate-800 text-xs line-clamp-1">{prod.name}</p>
                            <p className="text-[10px] text-gray-400">By {prod.brand}</p>
                            <p className="font-bold text-slate-900 text-xs">₹{prod.price} <span className="line-through text-gray-400 font-medium text-[10px]">₹{prod.mrp}</span></p>
                            <div className="flex gap-2 pt-1.5">
                              <button
                                onClick={() => {
                                  const existing = cart.find(c => c.product.id === prod.id);
                                  if (existing) {
                                    setCart(cart.map(c => c.product.id === prod.id ? { ...c, quantity: c.quantity + 1 } : c));
                                  } else {
                                    setCart([...cart, { product: prod, quantity: 1 }]);
                                  }
                                  setIsCartOpen(true);
                                  alert(`🛒 Appended ${prod.name} directly to your cart!`);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black px-2.5 py-1 rounded-lg"
                              >
                                Move to Cart
                              </button>
                              <button
                                onClick={() => {
                                  setWishlist(wishlist.filter(w => w.id !== prod.id));
                                  alert("Removed from wishlist.");
                                }}
                                className="text-red-500 hover:bg-red-50 text-[9px] font-bold px-2 py-1 rounded-lg"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB CONTENT: SAVED ADDRESSES */}
              {profileSubTab === "addresses" && (
                <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6 space-y-5 animate-fade-in">
                  <h3 className="font-black text-sm text-gray-900 uppercase tracking-tight flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" /> Saved Delivery Address Book
                  </h3>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Register New Shipping coordinate</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Address Label (e.g. Home, Office)" value={newAddressLabel} onChange={(e) => setNewAddressLabel(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                      <input type="text" placeholder="Flat, Sector Coordinates" value={newAddressText} onChange={(e) => setNewAddressText(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                      <input type="text" placeholder="City" value={newAddressCity} onChange={(e) => setNewAddressCity(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                      <input type="text" maxLength={6} placeholder="Pincode (e.g. 110019)" value={newAddressPincode} onChange={(e) => setNewAddressPincode(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-xs text-center font-bold font-mono" />
                    </div>
                    <button
                      onClick={() => {
                        if (newAddressLabel && newAddressText && newAddressCity && newAddressPincode) {
                          const newAddr = {
                            id: "addr-" + Date.now(),
                            label: newAddressLabel,
                            addressLine: newAddressText,
                            city: newAddressCity,
                            pincode: newAddressPincode
                          };
                          const updated = [...savedAddresses, newAddr];
                          setSavedAddresses(updated);
                          localStorage.setItem("partha_addresses", JSON.stringify(updated));
                          setNewAddressLabel("");
                          setNewAddressText("");
                          setNewAddressCity("");
                          setNewAddressPincode("");
                          alert("📍 Delivery address added successfully!");
                        } else {
                          alert("All coordinates must be filled.");
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 rounded-xl"
                    >
                      Save New Location
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedAddresses.map(addr => (
                      <div key={addr.id} className="border border-slate-100 p-4 rounded-2xl flex justify-between items-center bg-white shadow-xs">
                        <div className="space-y-1 flex-1 text-left">
                          <span className="bg-blue-50 border border-blue-100 text-blue-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                            {addr.label}
                          </span>
                          <p className="font-bold text-slate-800 text-xs mt-1.5">{addr.addressLine}</p>
                          <p className="text-[10px] text-gray-400">{addr.city} - {addr.pincode}</p>
                        </div>
                        <button
                          onClick={() => {
                            const updated = savedAddresses.filter(a => a.id !== addr.id);
                            setSavedAddresses(updated);
                            localStorage.setItem("partha_addresses", JSON.stringify(updated));
                          }}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* SUBTAB CONTENT: POLICIES AND DRUG LICENSES */}
              {profileSubTab === "policies" && (
                <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6 space-y-6 animate-fade-in">
                  
                  {/* Licensed Pharmacy Info */}
                  <div className="space-y-3 text-left">
                    <h3 className="font-black text-sm text-gray-900 uppercase tracking-tight flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-teal-600" /> Pharmacy Drug Licenses & Certifications
                    </h3>
                    <p className="text-slate-500 leading-normal">
                      Basanti Medical Store operates in absolute compliance with the Drugs and Cosmetics Act (India) and CDSCO guidelines. All medications are handled and approved by registered professionals.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                        <p className="font-black text-xs text-slate-900">📄 Form 20 - Retail Drug License</p>
                        <p className="text-[11px] text-slate-500">License Number: <strong className="font-mono text-slate-800">DL-110019-2026A</strong></p>
                        <p className="text-[11px] text-slate-500">Authority: Drugs Control Dept, NCT Delhi</p>
                        <p className="text-[11px] text-slate-500">Validity: 01-Jan-2021 to 31-Dec-2026</p>
                        <span className="bg-green-100 text-green-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">ACTIVE & VALID</span>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                        <p className="font-black text-xs text-slate-900">📄 Form 21 - Retail Drug License</p>
                        <p className="text-[11px] text-slate-500">License Number: <strong className="font-mono text-slate-800">DL-110019-2026B</strong></p>
                        <p className="text-[11px] text-slate-500">Authority: Drugs Control Dept, NCT Delhi</p>
                        <p className="text-[11px] text-slate-500">Validity: 01-Jan-2021 to 31-Dec-2026</p>
                        <span className="bg-green-100 text-green-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">ACTIVE & VALID</span>
                      </div>
                    </div>
                  </div>

                  {/* Registered Pharmacist details */}
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center font-bold text-lg">PS</div>
                    <div>
                      <p className="font-black text-xs text-slate-900">👨‍⚕️ Registered Pharmacist-in-Charge</p>
                      {branding?.pharmacistName ? (
                        <>
                          <p className="text-slate-700 font-bold">{branding.pharmacistName}{branding.pharmacistQualification ? `, ${branding.pharmacistQualification}` : ''}</p>
                          <p className="text-[11px] text-slate-400">Reg No: <strong className="font-mono text-slate-800 font-bold">{branding.pharmacistRegistrationNumber || 'Not Configured'}</strong></p>
                        </>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">Pharmacist details not configured</p>
                      )}
                      <p className="text-[10px] text-green-600 font-extrabold flex items-center gap-0.5 mt-0.5">✔ Vetted & Legally Authorized Vetting Practitioner</p>
                    </div>
                  </div>

                  {/* Official CDSCO Rules */}
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-[11px] text-amber-800 space-y-1.5 text-left">
                    <p className="font-extrabold flex items-center gap-1 uppercase tracking-wider text-[10px]">⚠️ Indian Regulatory Safety Mandate</p>
                    <p className="leading-relaxed">
                      E-pharmacies in India are prohibited from offering or supplying Schedule H, H1, or X drugs without a valid prescription generated by a registered medical practitioner (RMP). We reserve the right to reject orders if prescription verification fails.
                    </p>
                  </div>

                  {/* Compliance documents links */}
                  <div className="space-y-2 border-t border-slate-100 pt-4 text-left">
                    <p className="font-bold text-slate-800 text-xs">Download Policy Documentation & Legal Statements:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[10px] font-extrabold">
                      <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("🔒 Privacy Policy Document: All customer demographic, medical history, and clinical records are encrypted via bank-grade SHA-256 protocols."); }} className="bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 p-2.5 rounded-xl">Privacy Policy</a>
                      <a href="#terms" onClick={(e) => { e.preventDefault(); alert("📄 Terms & Conditions: Governed by the IT Act 2000 and the Drugs and Cosmetics Rules 1945. Customers must warrant the authenticity of uploaded Rx scripts."); }} className="bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 p-2.5 rounded-xl">Terms of Use</a>
                      <a href="#refund" onClick={(e) => { e.preventDefault(); alert("↩️ Returns & Refund Policy: Sealed formulations can be returned within 7 days. Refunds are credited instantly to UPI / bank accounts."); }} className="bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 p-2.5 rounded-xl">Refund Terms</a>
                      <a href="#shipping" onClick={(e) => { e.preventDefault(); alert("🚚 Shipping & Delivery Policy: Medicines are shipped from certified temperature-controlled depots. Free delivery applies to order tickets above ₹500."); }} className="bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 p-2.5 rounded-xl">Shipping Policy</a>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* PRINTABLE GST TAX INVOICE MODAL OVERLAY */}
            {selectedInvoiceOrder && (
              <div className="fixed inset-0 bg-black/65 z-55 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 relative text-slate-800">
                  <button
                    onClick={() => setSelectedInvoiceOrder(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-extrabold text-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Invoice Content */}
                  <div id="print-area" className="space-y-6 text-xs p-2">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                      <div className="space-y-1 text-left">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-1">
                          <Pill className="w-5 h-5 text-teal-600" />
                          {branding.appName || "Basanti Medical Store"}
                        </h2>
                        <p className="text-[10px] text-slate-400">Digital Pharmacy Division of Partha Healthtech Pvt. Ltd.</p>
                        <p className="text-[9px] text-slate-400">CDSCO License: Form 20: DL-110019-2026A | Form 21: DL-110019-2026B</p>
                        <p className="text-[9px] text-slate-400">GSTIN: 07AABCPartha7728Z1</p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="bg-teal-50 border border-teal-100 text-teal-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase">TAX INVOICE</span>
                        <p className="text-[10px] font-bold text-slate-700 mt-2">Invoice: #{selectedInvoiceOrder.id.substring(0, 8).toUpperCase()}</p>
                        <p className="text-[10px] text-slate-400">Date: {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>

                    {/* Bill To & Ship To */}
                    <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-600">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-left">
                        <span className="font-bold text-slate-800 uppercase tracking-wider block text-[8px]">Billing Details:</span>
                        <p className="font-bold text-slate-900">{selectedInvoiceOrder.shippingAddress.fullName}</p>
                        <p className="line-clamp-2">{selectedInvoiceOrder.shippingAddress.addressLine}</p>
                        <p>{selectedInvoiceOrder.shippingAddress.city} - {selectedInvoiceOrder.shippingAddress.pincode}</p>
                        <p>Mobile: {selectedInvoiceOrder.shippingAddress.phone}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-left">
                        <span className="font-bold text-slate-800 uppercase tracking-wider block text-[8px]">Pharmacy Dispatch Point:</span>
                        <p className="font-bold text-teal-800">Partha Warehouse Delhi NCR</p>
                        <p>77, DLF Industrial Area, Phase 1</p>
                        <p>New Delhi, Delhi - 110015</p>
                        <p>On-Duty Pharmacist: Partha Sarathi (Reg RP-77492-DL)</p>
                      </div>
                    </div>

                    {/* Invoice Itemized Table */}
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold bg-slate-50">
                          <th className="py-2 px-3">Description</th>
                          <th className="py-2 px-3">HSN Code</th>
                          <th className="py-2 px-3 text-center">Qty</th>
                          <th className="py-2 px-3 text-right">Price</th>
                          <th className="py-2 px-3 text-right">Tax (18%)</th>
                          <th className="py-2 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoiceOrder.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-100 text-slate-700">
                            <td className="py-2.5 px-3 text-left">
                              <p className="font-bold text-slate-900">{item.name}</p>
                              <p className="text-[8px] text-slate-400">Batch: PP-{900 + idx}A2 | Exp: 09/2028 | Mfg: Partha Labs</p>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[9px] text-left">30049099</td>
                            <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono">₹{(item.price * 0.82).toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-[9px]">₹{(item.price * 0.18).toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">₹{(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Invoice Totals */}
                    <div className="flex justify-between items-start border-t border-slate-200 pt-4 text-[10px]">
                      <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 max-w-xs text-[9px] text-slate-500 text-left">
                        <p><strong>Declaration:</strong> We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
                        <div className="flex gap-2 items-center mt-3 pt-2 border-t border-slate-200">
                          <div className="w-8 h-8 bg-teal-100 text-teal-800 rounded flex items-center justify-center font-bold font-mono">P</div>
                          <div>
                            <p className="font-bold text-slate-700">{branding?.pharmacistName || 'Not Configured'}</p>
                            <p>Registered Pharmacist</p>
                          </div>
                        </div>
                      </div>
                      <div className="w-64 space-y-2 text-right font-mono">
                        <div className="flex justify-between text-slate-500">
                          <span>Subtotal:</span>
                          <span>₹{selectedInvoiceOrder.subtotal.toFixed(2)}</span>
                        </div>
                        {selectedInvoiceOrder.discountAmount > 0 && (
                          <div className="flex justify-between text-red-500 font-bold">
                            <span>Discount Applied:</span>
                            <span>-₹{selectedInvoiceOrder.discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        {selectedInvoiceOrder.pointsRedeemed > 0 && (
                          <div className="flex justify-between text-slate-500">
                            <span>Loyalty Points Redeem:</span>
                            <span>-₹{selectedInvoiceOrder.pointsRedeemed.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-500">
                          <span>GST (Included 18%):</span>
                          <span>₹{selectedInvoiceOrder.gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Delivery Charges:</span>
                          <span>₹{selectedInvoiceOrder.deliveryCharge.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 text-xs font-black text-slate-900 bg-slate-50 p-2 rounded-xl">
                          <span>Grand Total:</span>
                          <span>₹{selectedInvoiceOrder.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Barcode representation */}
                    <div className="flex flex-col items-center justify-center pt-4 space-y-1">
                      <div className="w-48 h-6 bg-slate-200 flex items-center justify-between px-1 font-mono text-[6px] tracking-widest text-slate-400 select-none">
                        ||||| | || |||| | | ||| || ||| | ||| || |||| | ||| |||| | | |||| || ||| || ||||
                      </div>
                      <span className="text-[8px] text-slate-400 font-mono tracking-widest uppercase">INV-{selectedInvoiceOrder.id.substring(0, 12)}</span>
                    </div>
                  </div>

                  {/* Invoice Actions */}
                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => {
                        const printContents = document.getElementById("print-area")?.innerHTML;
                        if (printContents) {
                          const printWindow = window.open("", "_blank");
                          if (printWindow) {
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Invoice - \${selectedInvoiceOrder.id}</title>
                                  <style>
                                    body { font-family: sans-serif; padding: 20px; color: #333; }
                                    .flex { display: flex; }
                                    .justify-between { justify-content: space-between; }
                                    .items-start { align-items: flex-start; }
                                    .items-center { align-items: center; }
                                    .grid { display: grid; }
                                    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                                    .gap-4 { gap: 16px; }
                                    .text-left { text-align: left; }
                                    .text-right { text-align: right; }
                                    .border-b { border-bottom: 1px solid #ddd; }
                                    .pb-5 { padding-bottom: 20px; }
                                    .pt-4 { padding-top: 16px; }
                                    .mt-3 { margin-top: 12px; }
                                    .mb-2 { margin-bottom: 8px; }
                                    .w-full { width: 100%; }
                                    .font-bold { font-weight: bold; }
                                    .font-black { font-weight: 900; }
                                    .text-lg { font-size: 18px; }
                                    .uppercase { text-transform: uppercase; }
                                    .bg-slate-50 { background-color: #f8fafc; }
                                    .bg-teal-50 { background-color: #f0fdfa; }
                                    .p-3 { padding: 12px; }
                                    .p-2 { padding: 8px; }
                                    .rounded-2xl { border-radius: 16px; }
                                    .rounded-xl { border-radius: 12px; }
                                    .rounded-md { border-radius: 8px; }
                                    .space-y-1 > * + * { margin-top: 4px; }
                                    .space-y-2 > * + * { margin-top: 8px; }
                                    .space-y-6 > * + * { margin-top: 24px; }
                                    .border-t { border-top: 1px solid #ddd; }
                                    .mt-4 { margin-top: 16px; }
                                    .p-2.5 { padding: 10px; }
                                    .w-48 { width: 192px; }
                                    .h-6 { height: 24px; }
                                    .bg-slate-200 { background-color: #e2e8f0; }
                                    .tracking-widest { tracking-widest: 0.1em; }
                                    .text-[10px] { font-size: 10px; }
                                    .text-[9px] { font-size: 9px; }
                                    .text-[8px] { font-size: 8px; }
                                    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                                    th, td { padding: 8px; border-bottom: 1px solid #eee; text-align: left; }
                                    th { background-color: #f8fafc; font-weight: bold; }
                                    .w-8 { width: 32px; }
                                    .h-8 { height: 32px; }
                                    .bg-teal-100 { background-color: #ccfbf1; }
                                    .text-teal-800 { color: #115e59; }
                                    .text-teal-700 { color: #0f766e; }
                                    .font-mono { font-family: monospace; }
                                    .text-red-500 { color: #ef4444; }
                                    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                                  </style>
                                </head>
                                <body>
                                  \${printContents}
                                  <script>
                                    window.onload = function() {
                                      window.print();
                                      window.close();
                                    }
                                  </script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                          }
                        }
                      }}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" /> Print Official Tax Receipt
                    </button>
                    <button
                      onClick={() => setSelectedInvoiceOrder(null)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* TAB 7: ADMIN OPERATIONS DESK */}
        {activeTab === "admin" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            {!isAdminAuthenticated ? (
            authMode === "login" ? (
              <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-5 text-center animate-fade-in">
                <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Lock className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Ops Panel Lock Screen</h2>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Only authorized pharmacists & {branding.appName || "Basanti Medical Store"} administrators can access stock management, prescription verification, and patient order sheets.
                  </p>
                </div>

                {/* Admin Email Configuration Alert */}
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-left space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    📧 Active Administrator Account
                  </p>
                  <p className="text-xs text-slate-700 font-bold break-all">
                    {adminEmail}
                  </p>
                </div>

                {/* Email Address Field */}
                <div className="space-y-1 text-left">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Confirm Your Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder={"admin@" + (branding.supportEmail ? branding.supportEmail.split('@')[1] || "sonupharmacy.com" : "sonupharmacy.com")}
                      value={adminEmailInput}
                      onChange={(e) => {
                        setAdminEmailInput(e.target.value);
                        setAdminErrorMsg("");
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* PIN Code Field */}
                <div className="space-y-1 text-left">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enter 4-Digit Security PIN</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="• • • •"
                      value={adminPinInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setAdminPinInput(val);
                        setAdminErrorMsg("");
                        if (val.length === 4) {
                          handleAdminLogin(adminEmailInput, val);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-extrabold tracking-[0.5em] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {adminErrorMsg && (
                    <p className="text-[11px] text-red-600 font-extrabold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {adminErrorMsg}
                    </p>
                  )}
                </div>

                {/* Interactive Keypad */}
                <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        if (adminPinInput.length < 4) {
                          const newVal = adminPinInput + num;
                          setAdminPinInput(newVal);
                          setAdminErrorMsg("");
                          if (newVal.length === 4) {
                            handleAdminLogin(adminEmailInput, newVal);
                          }
                        }
                      }}
                      className="w-14 h-14 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center font-black text-sm text-slate-700 border border-slate-100 transition-all active:scale-95 cursor-pointer shadow-xs"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setAdminPinInput("");
                      setAdminErrorMsg("");
                    }}
                    className="w-14 h-14 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-extrabold text-xs border border-red-100 transition-all active:scale-95 cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (adminPinInput.length < 4) {
                        const newVal = adminPinInput + "0";
                        setAdminPinInput(newVal);
                        setAdminErrorMsg("");
                        if (newVal.length === 4) {
                          handleAdminLogin(adminEmailInput, newVal);
                        }
                      }
                    }}
                    className="w-14 h-14 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center font-black text-sm text-slate-700 border border-slate-100 transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdminLogin(adminEmailInput, adminPinInput)}
                    className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl flex items-center justify-center font-extrabold text-[10px] transition-all active:scale-95 cursor-pointer shadow-sm shadow-green-100"
                  >
                    Verify
                  </button>
                </div>

                {/* Forgot Passcode Recovery Anchor */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("forgot");
                      setAdminErrorMsg("");
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-extrabold cursor-pointer transition-colors"
                  >
                    Forgot your PIN passcode? Recover it via Email
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-1 text-[10px] text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    <span>Isolated Local Session Protocol Active</span>
                  </div>
                  <span className="text-[9px] text-slate-400 max-w-[280px]">Your logged-in state is strictly confidential and confined to this browser tab. Public visitors on other devices cannot see or access your panel.</span>
                </div>
              </div>
            ) : authMode === "forgot" ? (
              <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6 text-center animate-fade-in">
                <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Mail className="w-8 h-8 animate-bounce" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Recover PIN Passcode</h2>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Enter your registered administrator Email address below to receive a secure 6-digit verification recovery code.
                  </p>
                </div>

                {adminErrorMsg && (
                  <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-bold p-3 rounded-xl flex items-center gap-1.5 text-left">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{adminErrorMsg}</span>
                  </div>
                )}

                {/* Email Address Field */}
                <div className="space-y-1 text-left">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Administrator Recovery Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder={"admin@" + (branding.supportEmail ? branding.supportEmail.split('@')[1] || "sonupharmacy.com" : "sonupharmacy.com")}
                      value={adminEmailInput}
                      onChange={(e) => setAdminEmailInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSendingRecovery}
                  onClick={() => handleRequestRecovery(adminEmailInput)}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5 animate-pulse-once"
                >
                  {isSendingRecovery ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Dispatched Code...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Request Recovery Code
                  </>
                )}
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAdminErrorMsg("");
                    }}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-extrabold cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6 text-center animate-fade-in">
                <div className="mx-auto w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Key className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Verify & Reset PIN</h2>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    We have generated a secure password reset challenge. Please enter the OTP code to configure your new PIN.
                  </p>
                </div>

                {recoveryInfo && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3.5 rounded-xl text-left leading-relaxed">
                    <p className="font-extrabold text-[10px] text-emerald-700 uppercase tracking-wide mb-0.5">📬 Dispatch Notification</p>
                    <p className="font-medium text-[11px]">{recoveryInfo}</p>
                  </div>
                )}

                {/* Developer Sandbox Recovery Mode Code Notification (Real-time Fallback) */}
                {sandboxRecoveryCode && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-left space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                        AI Studio Dev Sandbox
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-normal">
                      Since the SMTP mailer is unconfigured, here is your real-time generated recovery code for testing:
                    </p>
                    <div className="text-center bg-white border border-amber-200 py-1.5 rounded-lg font-mono text-base font-black text-amber-900 tracking-[0.2em]">
                      {sandboxRecoveryCode}
                    </div>
                  </div>
                )}

                {adminErrorMsg && (
                  <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-bold p-3 rounded-xl flex items-center gap-1.5 text-left">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{adminErrorMsg}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* 6-Digit OTP */}
                  <div className="space-y-1 text-left">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">6-Digit Verification Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={recoveryCodeInput}
                      onChange={(e) => setRecoveryCodeInput(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center text-sm font-mono font-black text-slate-800 tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* New 4-Digit PIN */}
                  <div className="space-y-1 text-left">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Configure New 4-Digit PIN</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="e.g. 8899"
                      value={newRecoveryPin}
                      onChange={(e) => setNewRecoveryPin(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center text-sm font-mono font-black text-slate-800 tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyAndReset(adminEmailInput, recoveryCodeInput, newRecoveryPin)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Reset PIN Passcode
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAdminErrorMsg("");
                    }}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-extrabold cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {/* Authenticated Admin Navigation Controller */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <div>
                    <h4 
                      onTouchStart={() => {
                        clearTimeout((window as any).dev_timer3);
                        (window as any).dev_timer3 = setTimeout(() => { setShowDevAuthPrompt(true); }, 8000);
                      }}
                      onTouchEnd={() => clearTimeout((window as any).dev_timer3)}
                      onTouchCancel={() => clearTimeout((window as any).dev_timer3)}
                      onMouseDown={() => {
                        clearTimeout((window as any).dev_timer3);
                        (window as any).dev_timer3 = setTimeout(() => { setShowDevAuthPrompt(true); }, 8000);
                      }}
                      onMouseUp={() => clearTimeout((window as any).dev_timer3)}
                      onMouseLeave={() => clearTimeout((window as any).dev_timer3)}
                      onContextMenu={(e) => { e.preventDefault(); }}
                      style={{ WebkitTouchCallout: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
                      className="font-extrabold text-xs tracking-wider uppercase text-green-400 select-none cursor-pointer"
                    >
                      ADMIN SESSION SECURE
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Authenticated via recovery-enabled Master Security Passcode.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newEmail = prompt("Enter new administrator email address:", adminEmail);
                      if (newEmail === null) return;
                      if (!newEmail || !newEmail.includes("@")) {
                        alert("Invalid email address.");
                        return;
                      }
                      const newPin = prompt("Enter new 4-digit numeric PIN passcode (leave empty to keep current):");
                      if (newPin && (newPin.length !== 4 || isNaN(Number(newPin)))) {
                        alert("PIN passcode must be exactly 4 numeric digits.");
                        return;
                      }
                      handleUpdateAdminSettings(newEmail, newPin || undefined);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-[10px] uppercase px-4 py-2 rounded-xl transition-colors cursor-pointer border border-slate-700 flex items-center gap-1"
                  >
                    Change Email / PIN
                  </button>
                  <button
                    onClick={() => {
                      setIsAdminAuthenticated(false);
                      setActiveAdminPin("");
                      setAdminPinInput("");
                      setAuthMode("login");
                      alert("Admin Session Safely Terminated and Locked!");
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    Lock Ops Panel
                  </button>
                </div>
              </div>

              <AdminDashboard 
                onRefreshAllData={fetchAllData}
                products={products}
                orders={orders}
                prescriptions={prescriptions}
                appointments={appointments}
        doctors={doctors}
                onReviewPrescription={handleReviewPrescription}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onUpdateStock={handleUpdateStock}
                onUpdateAppointment={handleUpdateAppointment}
                branding={branding}
                paymentConfig={paymentConfig}
                activeAdminPin={activeAdminPin}
                isDevModeActive={isDevModeActive}
                labTests={labTests}
                setLabTests={setLabTests}
                setIsDevModeActive={setIsDevModeActive}
                advertisements={advertisements}
                onUpdateAdvertisements={fetchAllData}
              />
            </div>
          )}
          </motion.div>
        )}

      </main>

      {/* FLOATING CART SIDEBAR SLIDE OUT PANEL */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl relative animate-slide-left">
            
            {/* Header */}
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <h3 className="font-black text-slate-900 text-base">Your Cart Items</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-6 h-6" /></button>
              </div>

              {/* Items List */}
              <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 border-b border-gray-50 pb-3 items-center justify-between">
                    <img src={item.product.image} alt="" className="w-12 h-12 object-cover rounded-lg bg-slate-50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{item.product.name}</p>
                      <p className="text-[11px] text-blue-600 font-extrabold mt-0.5">₹{item.product.price} <span className="text-gray-400 font-normal">/ item</span></p>
                    </div>

                    {/* Qty selectors */}
                    <div className="flex items-center gap-2">
                      <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
                        <button onClick={() => updateCartQty(item.id, item.quantity - 1)} className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100">-</button>
                        <span className="px-2 py-0.5 font-bold">{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.id, item.quantity + 1)} className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="text-center py-12 space-y-3">
                    <Pill className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="text-gray-400 text-xs">Your cart is empty. Add wellness items from the store catalog!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Price Calculations Summary & Checkout btn */}
            <div className="border-t border-gray-100 pt-4 space-y-4">
              
              {/* Coupon Form */}
              {cart.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Apply Discount Coupons</label>
                  <div className="flex gap-2 relative z-10">
                    <input
                      type="text"
                      placeholder="Enter SONUNEW or HEALTH20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center font-bold tracking-wider"
                    />
                    <button
                      onClick={() => {
                        const cop = INITIAL_COUPONS.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
                        if (cop) {
                          setAppliedCoupon(cop);
                          alert(`Coupon successfully activated! Flat ${cop.discountPercent}% discount registered.`);
                        } else {
                          alert("Invalid or expired coupon code.");
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* Financial Breakdown */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-2 text-slate-600">
                <div className="flex justify-between"><span>Items Subtotal:</span><span>₹{cartSubtotal}</span></div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount ({appliedCoupon.code}):</span><span>-₹{cartDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between"><span>GST & Drugs Tax (18%):</span><span>₹{cartGst}</span></div>
                <div className="flex justify-between"><span>Delivery Charge:</span><span>{cartDelivery === 0 ? "FREE" : "₹" + cartDelivery}</span></div>
                <div className="flex justify-between font-black text-sm text-gray-950 border-t border-slate-100 pt-2">
                  <span>Grand Total:</span><span>₹{cartTotal}</span>
                </div>
              </div>

              {/* Verify prescription if required */}
              {cart.some(i => i.product.prescriptionRequired) && (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex gap-2 text-[11px] text-amber-900 leading-normal">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Prescription medication detected!</strong>
                    <span>You must upload a doctor prescription inside the Upload tab. Approve it immediately in the **Ops Panel** tab.</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 relative z-10">
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="flex-1 border border-gray-200 hover:bg-slate-50 font-bold text-xs py-3.5 rounded-xl cursor-pointer"
                >
                  Continue Shopping
                </button>
                <button
                  disabled={cart.length === 0}
                  onClick={() => {
                    setIsCartOpen(false);
                    ensureUserLoggedIn((profile) => {
                      setCheckoutName(profile.fullName);
                      setCheckoutAddress(profile.addressLine);
                      setCheckoutCity(profile.city);
                      setCheckoutPincode(profile.pincode);
                      setCheckoutPhone(profile.phone);
                      setIsCheckoutOpen(true);
                    });
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition-colors cursor-pointer text-center disabled:opacity-50"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CHECKOUT MODAL WINDOW OVERLAY */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-y-auto max-h-[92vh]">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
            <h3 className="font-black text-lg text-gray-950 mb-4">Complete Your Shipping Details</h3>

            {placedOrderInfo ? (
              <div className="text-center space-y-4 py-6 animate-fade-in">
                <CheckCircle className="w-14 h-14 text-green-600 mx-auto" />
                <div>
                  <h4 className="font-black text-gray-900 text-base">🎉 Order Placed Successfully!</h4>
                  <p className="text-xs text-gray-500 mt-1">Order Ref: <strong className="font-mono text-gray-800">{placedOrderInfo.id}</strong></p>
                  <p className="text-xs text-gray-500">Scheduled delivery slot: <strong>{placedOrderInfo.deliverySlot}</strong></p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-left text-gray-600">
                  <p className="font-extrabold uppercase text-[9px] text-gray-400 tracking-wider mb-2">Invoice summary</p>
                  <p>Subtotal: ₹{placedOrderInfo.subtotal}</p>
                  <p>GST Taxes: ₹{placedOrderInfo.gst}</p>
                  <p className="font-bold text-gray-900">Total Charged: ₹{placedOrderInfo.total}</p>
                  {placedOrderInfo.paymentStatus === "PENDING_VERIFICATION" && (
                    <div className="mt-3 bg-amber-50 border border-amber-100 text-amber-800 p-2 rounded-xl text-[10px] leading-normal">
                      <strong>Payment Status: Verification Pending</strong>
                      <br />Our client team is verifying your UTR: {placedOrderInfo.utrNumber}. Once matched in our accounts, your medicines will be shipped!
                    </div>
                  )}
                </div>
                <button
                  onClick={() => { setIsCheckoutOpen(false); setPlacedOrderInfo(null); setActiveTab("profile"); }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer"
                >
                  Navigate to My Profile History
                </button>
              </div>
            ) : isUpiPortalOpen ? (
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center space-y-1">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Amount Payable</p>
                  <p className="text-2xl font-black text-blue-700">₹{cartTotal}</p>
                  <p className="text-gray-500 text-[11px]">Paying to merchant: <strong className="text-gray-800">{branding.appName}</strong></p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Launch preferred UPI Application (Mobile Only)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: "GPay", scheme: "tez://upi/pay" },
                      { name: "PhonePe", scheme: "phonepe://pay" },
                      { name: "Paytm", scheme: "paytmmp://pay" },
                      { name: "BHIM", scheme: "upi://pay" }
                    ].map((app) => (
                      <a
                        key={app.name}
                        target="_top"
                        onClick={() => setSelectedUpiApp(app.name)}
                        href={`${app.scheme}?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(branding.appName)}&am=${cartTotal}&cu=INR&tn=OrderPayment`}
                        className={`py-2 px-1 text-center font-bold border rounded-xl transition-colors cursor-pointer text-[11px] block ${
                          selectedUpiApp === app.name ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:bg-slate-50'
                        }`}
                      >
                        {app.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Instant App Link action */}
                <div className="text-center">
                  <a
                    target="_top"
                    href={`upi://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(branding.appName)}&am=${cartTotal}&cu=INR&tn=OrderPayment`}
                    className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                  >
                    🚀 Launch Generic UPI App
                  </a>
                  <p className="text-[10px] text-gray-400 mt-1">Direct launching works on mobile phones with banking apps installed. If it doesn't work here, please open this app in a New Tab or scan the QR code.</p>
                </div>

                {/* Scan UPI QR Code Section */}
                <div className="border border-slate-100 bg-slate-50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2">
                  <p className="font-extrabold text-gray-800">Scan QR Code to Transfer</p>
                  {paymentConfig.upiQrCode ? (
                    <img src={paymentConfig.upiQrCode} alt="Merchant QR" className="w-48 h-48 object-contain bg-white p-2 rounded-xl border border-slate-200" />
                  ) : (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${paymentConfig.upiId}&pn=${encodeURIComponent(branding.appName)}&am=${cartTotal}&cu=INR&tn=PharmacyOrder`)}`} 
                      alt="Dynamic UPI QR" 
                      className="w-44 h-44 object-contain bg-white p-2 rounded-xl border border-slate-200" 
                    />
                  )}
                  <p className="text-[10px] text-gray-500">Merchant UPI ID: <span className="font-mono font-bold text-gray-950 select-all bg-white px-2 py-1 rounded-md border border-slate-100">{paymentConfig.upiId}</span></p>
                </div>

                {/* Direct Bank Account Section */}
                {paymentConfig.bankName && (
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl space-y-1.5">
                    <p className="font-bold text-gray-800 text-[11px] uppercase tracking-wider text-center">Alternative Direct Bank Transfer</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                      <div><span className="text-gray-400 font-medium">Bank Name:</span> <strong className="text-gray-700">{paymentConfig.bankName}</strong></div>
                      <div><span className="text-gray-400 font-medium">Holder Name:</span> <strong className="text-gray-700">{paymentConfig.accountHolderName}</strong></div>
                      <div className="col-span-2 border-t border-slate-200/60 my-1"></div>
                      <div className="col-span-2 flex justify-between items-center bg-white py-1 px-2 rounded-lg border border-slate-200/50">
                        <div><span className="text-gray-400">Account No:</span> <strong className="font-mono text-gray-800 select-all">{paymentConfig.accountNumber}</strong></div>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(paymentConfig.accountNumber || ""); alert("Account number copied!"); }} 
                          className="text-[10px] text-blue-600 hover:underline font-bold"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="col-span-2 flex justify-between items-center bg-white py-1 px-2 rounded-lg border border-slate-200/50 mt-1">
                        <div><span className="text-gray-400 font-medium">IFSC Code:</span> <strong className="font-mono text-gray-800 select-all">{paymentConfig.ifscCode}</strong></div>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(paymentConfig.ifscCode || ""); alert("IFSC Code copied!"); }} 
                          className="text-[10px] text-blue-600 hover:underline font-bold"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification form */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      12-Digit UPI UTR / Transaction reference <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter 12-digit transaction ID" 
                      value={utrNumber} 
                      maxLength={12}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center font-mono font-bold tracking-widest text-sm focus:ring-2 focus:ring-blue-500 text-gray-900 focus:outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Upload Payment Screenshot / Receipt (Optional)
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPaymentScreenshot(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer" 
                    />
                    {paymentScreenshot && (
                      <div className="mt-2 text-center">
                        <span className="text-[10px] text-green-600 font-bold">✓ Screenshot successfully attached!</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUpiPortalOpen(false)}
                    className="flex-1 border border-gray-200 hover:bg-slate-50 font-bold py-3 rounded-xl cursor-pointer text-center text-gray-600"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl transition-colors cursor-pointer text-center text-xs shadow-md"
                  >
                    Confirm Payment & Place Order
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Receiver Name</label>
                  <input type="text" value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Delivery Address</label>
                  <input type="text" value={checkoutAddress} onChange={(e) => setCheckoutAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">City</label>
                    <input type="text" value={checkoutCity} onChange={(e) => setCheckoutCity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pincode</label>
                    <input type="text" value={checkoutPincode} onChange={(e) => setCheckoutPincode(e.target.value)} maxLength={6} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 text-center font-bold tracking-widest" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile Number</label>
                  <input type="tel" value={checkoutPhone} onChange={(e) => setCheckoutPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Choose Delivery Slot</label>
                  <select value={checkoutSlot} onChange={(e) => setCheckoutSlot(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    <option>Tomorrow (9:00 AM - 1:00 PM)</option>
                    <option>Tomorrow (2:00 PM - 6:00 PM)</option>
                    <option>Day After Tomorrow (9:00 AM - 1:00 PM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Secure Payment Method</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {["UPI / Google Pay", "Razorpay", "Cash on Delivery"].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setCheckoutPayment(method)}
                        className={`py-2 text-xs font-bold border rounded-xl transition-colors cursor-pointer ${
                          checkoutPayment === method ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:bg-slate-50'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl transition-colors mt-4 cursor-pointer text-sm animate-pulse"
                >
                  Pay ₹{cartTotal} & Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAILED MEDICINE INFO DIALOG MODAL */}
      {selectedProduct && (
        <Suspense fallback={null}>
        <ProductDetail 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
          onBuyNow={handleBuyNow}
          onAddToWishlist={toggleWishlist}
          onSubscribeRefill={handleSubscribeRefill}
          isInWishlist={wishlist.some(w => w.id === selectedProduct.id)}
          similarProducts={products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)}
          onSelectProduct={setSelectedProduct}
          onRxClick={() => { setActiveTab("rx"); window.scrollTo({top:0, behavior:"smooth"}); setSelectedProduct(null); }}
        />
      </Suspense>
      )}

      {/* AUTHENTICATION POPUP OVERLAY */}
      <Suspense fallback={null}>
        <AboutUsModal 
        isOpen={isAboutUsOpen}
        onClose={() => setIsAboutUsOpen(false)}
        branding={branding}
      />
      </Suspense>
      
      <Suspense fallback={null}>
        <InvestModal
        isOpen={isInvestOpen}
        onClose={() => setIsInvestOpen(false)}
        branding={branding}
      />
      </Suspense>
      
      <Suspense fallback={null}>
        <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        branding={branding}
      />
      </Suspense>
      
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-fade-in text-xs space-y-4">
            <button 
              onClick={() => {
                setIsAuthModalOpen(false);
                authCallbackRef.current = null;
              }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center space-y-1.5 pt-2">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-black text-gray-950 text-base">Profile Required</h3>
              <p className="text-gray-400 leading-normal">
                Please enter your email to proceed. This associates your transactions with your personal healthcare dashboard.
              </p>
            </div>

            {authErrorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-[11px] font-bold text-center">
                {authErrorMsg}
              </div>
            )}

            {authModalStep === "email" ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!authEmail || !authEmail.includes("@")) {
                  setAuthErrorMsg("Please enter a valid email address.");
                  return;
                }
                setIsAuthSubmitting(true);
                setAuthErrorMsg("");
                try {
                  const res = await fetch('/api/auth/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: authEmail })
                  });
                  const data = await res.json();
                  if (data.success) {
                    setAuthModalStep("otp");
                    alert(`📩 Simulated SMS & Email OTP Sent!\nUse the secure 4-digit code: ${data.otp} to verify your session.`);
                  } else {
                    setAuthErrorMsg(data.error || "Failed to send OTP. Please try again.");
                  }
                } catch (err) {
                  setAuthErrorMsg("Failed to connect to authentication server.");
                } finally {
                  setIsAuthSubmitting(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isAuthSubmitting ? "Sending Secure OTP..." : "Request OTP Code"}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Or login with</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const testGoogleUser = {
                      email: "google.user@gmail.com",
                      fullName: "Google Demo Tester",
                      phone: "+91 9999900000",
                      addressLine: "Google HQ, Outer Ring Road",
                      city: "Bangalore",
                      pincode: "560016"
                    };
                    setCurrentUser(testGoogleUser);
                    localStorage.setItem("sonu_user", JSON.stringify(testGoogleUser));
                    setIsAuthModalOpen(false);
                    alert("✅ Logged in securely using Google Sign-In account (Simulated)!");
                    if (authCallbackRef.current) {
                      authCallbackRef.current(testGoogleUser);
                      authCallbackRef.current = null;
                    }
                  }}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.125C18.28 1.845 15.542 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.984 0-.74-.08-1.3-.177-1.856l-10.616-.315z"/>
                  </svg>
                  Simulate Google Sign-In
                </button>
              </form>
            ) : authModalStep === "otp" ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!authOtp || authOtp.length < 4) {
                  setAuthErrorMsg("Please enter the 4-digit code.");
                  return;
                }
                setIsAuthSubmitting(true);
                setAuthErrorMsg("");
                try {
                  const res = await fetch('/api/auth/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: authEmail, otp: authOtp })
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    if (data.exists && data.user) {
                      setCurrentUser(data.user);
                      localStorage.setItem("sonu_user", JSON.stringify(data.user));
                      setIsAuthModalOpen(false);
                      alert(`🔒 Welcome back verified user, ${data.user.fullName}!`);
                      if (authCallbackRef.current) {
                        authCallbackRef.current(data.user);
                        authCallbackRef.current = null;
                      }
                    } else {
                      setAuthModalStep("create_profile");
                    }
                  } else {
                    setAuthErrorMsg(data.error || "Incorrect OTP. Use the code from your alert/console or 1234.");
                  }
                } catch (err) {
                  setAuthErrorMsg("Failed to connect to authentication server.");
                } finally {
                  setIsAuthSubmitting(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-1">Enter Verification OTP</label>
                  <p className="text-[10px] text-gray-400 text-center mb-3">A simulated code was sent to <strong className="text-slate-700">{authEmail}</strong></p>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 4-digit code"
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-center font-black tracking-widest focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isAuthSubmitting ? "Verifying..." : "Verify & Sign In"}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthModalStep("email")}
                  className="w-full text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-slate-600"
                >
                  ← Change Email Address
                </button>
              </form>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!authFullName || !authPhone) {
                  setAuthErrorMsg("Name and phone are required.");
                  return;
                }
                setIsAuthSubmitting(true);
                setAuthErrorMsg("");
                try {
                  const res = await fetch('/api/user/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: authEmail,
                      fullName: authFullName,
                      phone: authPhone,
                      addressLine: authAddressLine,
                      city: authCity,
                      pincode: authPincode
                    })
                  });
                  const data = await res.json();
                  if (data.success && data.user) {
                    setCurrentUser(data.user);
                    localStorage.setItem("sonu_user", JSON.stringify(data.user));
                    setIsAuthModalOpen(false);
                    alert(`🎉 Account created, ${data.user.fullName}! 120 Reward Points have been earned!`);
                    if (authCallbackRef.current) {
                      authCallbackRef.current(data.user);
                      authCallbackRef.current = null;
                    }
                  } else {
                    setAuthErrorMsg(data.error || "Failed to create profile.");
                  }
                } catch (err) {
                  setAuthErrorMsg("Failed to connect to server.");
                } finally {
                  setIsAuthSubmitting(false);
                }
              }} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input type="text" required placeholder="Hariom Sharma" value={authFullName} onChange={(e) => setAuthFullName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <input type="tel" required placeholder="+91 9999999999" value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Address Line</label>
                  <input type="text" placeholder="Flat/Sector coordinates" value={authAddressLine} onChange={(e) => setAuthAddressLine(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">City</label>
                    <input type="text" placeholder="New Delhi" value={authCity} onChange={(e) => setAuthCity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pincode</label>
                    <input type="text" maxLength={6} placeholder="110019" value={authPincode} onChange={(e) => setAuthPincode(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center font-bold" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold py-3 rounded-xl transition-colors cursor-pointer mt-2 disabled:opacity-50"
                >
                  {isAuthSubmitting ? "Creating Account..." : "Create Account & Continue"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FLOATING CHAT ASSISTANT WIDGET */}
      <AIHelper 
        branding={branding}
        onSuggestMed={(med) => {
          setSearchQuery(med);
          setActiveTab("store");
          handleSearch({ preventDefault: () => {} } as any);
        }} 
      />

      {showDevAuthPrompt && (
        <div className="fixed inset-0 bg-slate-900/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-800 p-6">
            <h3 className="text-white font-extrabold text-lg mb-4 text-center">Developer Root Access</h3>
            <input 
              type="password"
              value={devAuthPasskey}
              onChange={(e) => setDevAuthPasskey(e.target.value)}
              placeholder="Enter Passkey"
              className="w-full bg-slate-800 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 mb-4 outline-none border border-slate-700 focus:border-blue-500 transition-colors"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowDevAuthPrompt(false);
                  setDevAuthPasskey("");
                }}
                className="flex-1 bg-slate-800 text-white rounded-xl py-3 font-bold text-sm cursor-pointer hover:bg-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (devAuthPasskey.trim().toLowerCase() === "sudo su") {
                    setIsDevModeActive(true);
                    setIsAdminAuthenticated(true);
                    setIsOpsPanelVisible(true);
                    localStorage.setItem("sonu_ops_visible", "true");
                    setActiveTab('admin');
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    alert("🔓 AI Developer Panel UNLOCKED! Scroll up to see it.");
                  } else {
                    alert("Incorrect Passkey.");
                  }
                  setShowDevAuthPrompt(false);
                  setDevAuthPasskey("");
                }}
                className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-bold text-sm cursor-pointer hover:bg-blue-500"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {showUnserviceableModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center">
            <button onClick={() => setShowUnserviceableModal(false)} className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full p-1.5 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Location Not Serviceable</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              Sorry, we are not available in your location (Pincode: {checkPincode}).
            </p>
            <button 
              onClick={() => setShowUnserviceableModal(false)}
              className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold text-sm cursor-pointer hover:bg-slate-800"
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {/* ELEGANT HEALTH tip STRIP */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-400">
          <div className="space-y-4">
            <h4 
              onClick={handleFooterTitleClick}
              onTouchStart={() => {
                clearTimeout((window as any).dev_timer1);
                (window as any).dev_timer1 = setTimeout(() => { setShowDevAuthPrompt(true); }, 30000);
              }}
              onTouchEnd={() => clearTimeout((window as any).dev_timer1)}
              onTouchCancel={() => clearTimeout((window as any).dev_timer1)}
              onMouseDown={() => {
                clearTimeout((window as any).dev_timer1);
                (window as any).dev_timer1 = setTimeout(() => { setShowDevAuthPrompt(true); }, 30000);
              }}
              onMouseUp={() => clearTimeout((window as any).dev_timer1)}
              onMouseLeave={() => clearTimeout((window as any).dev_timer1)}
              onContextMenu={(e) => { e.preventDefault(); }}
              style={{ WebkitTouchCallout: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
              className="text-white font-extrabold text-sm tracking-wide uppercase cursor-pointer hover:text-blue-400 select-none transition-colors inline-block"
              title="Click 3 times after Header Title sequence to unlock secure controls, or long press for Developer Root Panel"
            >
              {branding.appName || "SONU PHARMACY"}
            </h4>
            <p className="leading-relaxed">
              {branding.aboutUsText || "Your premium full-stack digital pharmacy offering verified clinical prescriptions, diagnostic lab tests, online doctor consultations, and automated refills."}
            </p>
            <p 
              onTouchStart={() => {
                clearTimeout((window as any).dev_timer2);
                (window as any).dev_timer2 = setTimeout(() => { setShowDevAuthPrompt(true); }, 30000);
              }}
              onTouchEnd={() => clearTimeout((window as any).dev_timer2)}
              onTouchCancel={() => clearTimeout((window as any).dev_timer2)}
              onMouseDown={() => {
                clearTimeout((window as any).dev_timer2);
                (window as any).dev_timer2 = setTimeout(() => { setShowDevAuthPrompt(true); }, 30000);
              }}
              onMouseUp={() => clearTimeout((window as any).dev_timer2)}
              onMouseLeave={() => clearTimeout((window as any).dev_timer2)}
              onContextMenu={(e) => { e.preventDefault(); }}
              style={{ WebkitTouchCallout: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
              className="text-[10px] text-slate-500 cursor-default select-none transition-colors"
            >
              © 2026 {branding.appName || "Basanti Medical Store"} E-Commerce. All rights reserved.
            </p>
            
            {/* Secret Ops Panel entry button */}
            {isOpsPanelRevealed && (
              <div className="pt-2">
                <button 
                  onClick={() => {
                    setIsOpsPanelVisible(true);
                    localStorage.setItem("sonu_ops_visible", "true");
                    setActiveTab("admin");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    alert("🔓 Opening secure Ops Panel... Please enter your administrator email & PIN to log in.");
                  }}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-teal-950/50 border border-teal-400/30 active:scale-95 animate-pulse"
                >
                  <Lock className="w-3.5 h-3.5 text-teal-200" /> Admin Ops Portal
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-sm tracking-wide">Quick Links</h4>
            <div className="flex flex-col gap-2 font-bold">
              <button onClick={() => { setActiveTab("store"); setSelectedCategory("all"); }} className="text-left hover:text-white">Medicine Catalog</button>
              <button onClick={() => setActiveTab("rx")} className="text-left hover:text-white">Upload Prescriptions</button>
              {branding.enableExpertDoctor !== false && (
                <button onClick={() => setActiveTab("doctor")} className="text-left hover:text-white">Online Consultations</button>
              )}
              {branding.enableBookLabTests !== false && (
                <button onClick={() => setActiveTab("labs")} className="text-left hover:text-white">Diagnostic Panels</button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-sm tracking-wide">Customer Support Desk</h4>
            <p>24/7 Helpline: <strong>{branding.supportPhone || "+91 9876543210"}</strong></p>
            <p>Email: <strong className="text-white">{branding.supportEmail || "support@parthapharmacy.com"}</strong></p>
            <p>
              Direct Pharmacy Address:{" "}
              {branding.clinicLocationUrl ? (
                <a 
                  href={branding.clinicLocationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:text-blue-300 underline font-semibold inline-flex items-center gap-0.5 inline-block"
                  title="Click to view clinic location on maps"
                >
                  <MapPin className="w-3.5 h-3.5 inline animate-bounce" /> {branding.clinicAddress || "Sector 4, Nehru Enclave, New Delhi, 110019"}
                </a>
              ) : (
                <strong className="text-white">{branding.clinicAddress || "Sector 4, Nehru Enclave, New Delhi, 110019"}</strong>
              )}
            </p>
          </div>

          <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-white font-extrabold text-sm tracking-wide flex items-center gap-1">
              <Sparkle className="w-4 h-4 text-green-400 animate-pulse" /> {branding.aiAssistantName || "Partha AI Assistant"}
            </h4>
            <p className="text-[11px] leading-relaxed">
              Have clinical questions about compositions, drug uses, or stress management? Speak with our Gemini-powered smart health consultant 24/7. Use the chat bubble on the right!
            </p>
          </div>
        </div>
      </footer>
      {branding.enableWhatsappOrder !== false && branding.whatsappNumber && (
        <a
          href={`https://wa.me/${branding.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hi! I would like to place an order.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#25D366] text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-[#128C7E] hover:scale-105 transition-all flex items-center justify-center group"
          aria-label="Order on WhatsApp"
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.12.548 4.148 1.583 5.946L.048 24l6.196-1.626a11.96 11.96 0 005.787 1.493h.005c6.645 0 12.03-5.386 12.03-12.033 0-3.218-1.253-6.246-3.528-8.523A11.996 11.996 0 0012.031 0zm0 21.84c-1.782 0-3.528-.478-5.06-1.385l-.362-.215-3.76 1.018 1.006-3.666-.236-.375A9.972 9.972 0 012.012 12.03c0-5.522 4.492-10.015 10.019-10.015 2.678 0 5.195 1.042 7.086 2.936 1.892 1.893 2.934 4.412 2.934 7.085 0 5.524-4.494 10.017-10.019 10.017h-.001zm5.5-7.522c-.302-.15-1.784-.881-2.062-.981-.277-.101-.48-.152-.681.152-.202.302-.78 1.018-.956 1.228-.176.21-.353.235-.655.085-.302-.15-1.272-.47-2.423-1.496-.895-.798-1.5-1.785-1.677-2.088-.176-.302-.019-.465.132-.615.135-.135.302-.353.454-.53.15-.175.201-.301.302-.503.1-.202.05-.378-.025-.53-.076-.15-1.026-2.5-1.378-3.411-.341-.884-.687-.764-.956-.777-.253-.013-.531-.013-.809-.013-.277 0-.73.104-1.108.528-.378.425-1.436 1.405-1.436 3.426 0 2.022 1.487 3.98 1.688 4.256.202.277 2.9 4.426 7.027 6.21 4.127 1.783 4.127 1.185 4.883 1.135.756-.051 2.433-1.134 2.785-2.064.352-.929.352-1.733.251-1.934-.1-.2-.378-.327-.681-.478z"/>
          </svg>
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[200px] transition-all duration-300 ease-in-out font-bold text-sm">
            <span className="pl-2 pr-1">Order on WhatsApp</span>
          </span>
        </a>
      )}

      </div>
    </div>
  );
}
