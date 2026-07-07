import { Product, Doctor, LabTestPackage, Coupon } from "./types";

export const CATEGORIES = [
  { id: "all", name: "All Products" },
  { id: "prescription", name: "Prescription Medicines" },
  { id: "otc", name: "OTC Medicines" },
  { id: "ayurveda", name: "Ayurveda & Herbal" },
  { id: "baby-mother", name: "Baby & Mother Care" },
  { id: "personal-care", name: "Personal Care" },
  { id: "devices", name: "Health Devices" },
  { id: "nutrition", name: "Nutrition & Supplements" },
  { id: "elder-care", name: "Elder Care" },
  { id: "covid", name: "Covid Essentials" }
];

export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_DOCTORS: Doctor[] = [];
export const INITIAL_LAB_TESTS: LabTestPackage[] = [];
export const INITIAL_COUPONS: Coupon[] = [];
