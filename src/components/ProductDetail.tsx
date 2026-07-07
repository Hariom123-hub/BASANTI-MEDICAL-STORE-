/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, ShoppingCart, Heart, Shield, Calendar, Award, 
  ChevronRight, Sparkles, RefreshCw, Star, Info, AlertTriangle 
} from 'lucide-react';
import { Product, RefillFrequency } from '../types';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onAddToWishlist: (product: Product) => void;
  onSubscribeRefill: (productId: string, quantity: number, frequency: RefillFrequency) => void;
  isInWishlist: boolean;
  similarProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onRxClick?: () => void;
}

export default function ProductDetail({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onAddToWishlist,
  onSubscribeRefill,
  isInWishlist,
  similarProducts,
  onSelectProduct,
  onRxClick
}: ProductDetailProps) {
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"info" | "safety" | "refill">("info");
  const [refillQty, setRefillQty] = useState(1);
  const [refillFreq, setRefillFreq] = useState<RefillFrequency>(RefillFrequency.MONTHLY);

  const discountAmount = product.mrp - product.price;

  const handleSubscribe = () => {
    onSubscribeRefill(product.id, refillQty, refillFreq);
    alert(`Refill subscription registered! ${refillQty} unit(s) of ${product.name} will automatically dispatch ${refillFreq.toLowerCase()}.`);
    setActiveTab("info");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-gray-500 p-2 rounded-full cursor-pointer z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Images & Quick Info (Left Column) */}
        <div className="w-full md:w-5/12 p-6 md:p-8 bg-slate-50 rounded-t-3xl md:rounded-l-3xl md:rounded-t-none border-r border-gray-100 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="relative bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-64 object-contain rounded-xl hover:scale-105 transition-transform duration-300"
              />
              {product.prescriptionRequired && (
                <button 
                  type="button"
                  onClick={() => { if (onRxClick) onRxClick(); onClose(); }}
                  className="absolute top-3 left-3 bg-red-600 hover:bg-red-700 cursor-pointer text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md transition-colors"
                  title="Upload Prescription"
                >
                  <Shield className="w-3 h-3" /> Rx Required
                </button>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{product.brand}</span>
              <h2 className="text-xl font-black text-gray-950 tracking-tight leading-snug">{product.name}</h2>
              <p className="text-xs text-gray-400">SKU: <span className="font-mono">{product.sku}</span> | Expiry: {product.expiry}</p>
            </div>

            {/* Price Box */}
            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100/50">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-black text-blue-900">₹{product.price * qty}</span>
                <span className="text-sm text-gray-400 line-through">MRP ₹{product.mrp * qty}</span>
                <span className="text-xs bg-green-100 text-green-800 font-extrabold px-2 py-0.5 rounded-md">
                  {product.discount}% OFF
                </span>
              </div>
              <p className="text-[11px] text-green-700 font-medium mt-1">Inclusive of all GST taxes. You save ₹{discountAmount}!</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity:</span>
              <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-1.5 hover:bg-slate-50 font-bold cursor-pointer"
                >-</button>
                <span className="px-4 py-1.5 font-bold text-sm min-w-[40px] text-center">{qty}</span>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="px-3 py-1.5 hover:bg-slate-50 font-bold cursor-pointer"
                >+</button>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">{product.stock} units available</span>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => { onAddToCart(product, qty); alert(`${qty} item(s) added to cart.`); }}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-extrabold text-xs uppercase py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
                <button
                  onClick={() => onBuyNow(product, qty)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-blue-200 cursor-pointer"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => onAddToWishlist(product)}
                  className={`border p-3.5 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                    isInWishlist ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 hover:bg-slate-50 text-gray-400'
                  }`}
                  title="Add to Wishlist"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed In-depth medical info (Right Column) */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
          <div>
            {/* Tabs Selector */}
            <div className="flex border-b border-gray-100 pb-3 gap-6 mb-6">
              <button
                onClick={() => setActiveTab("info")}
                className={`text-sm font-bold tracking-tight pb-1.5 cursor-pointer border-b-2 transition-all ${
                  activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Medical Information
              </button>
              <button
                onClick={() => setActiveTab("safety")}
                className={`text-sm font-bold tracking-tight pb-1.5 cursor-pointer border-b-2 transition-all ${
                  activeTab === 'safety' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Safety & Side Effects
              </button>
              <button
                onClick={() => setActiveTab("refill")}
                className={`text-sm font-bold tracking-tight pb-1.5 cursor-pointer border-b-2 transition-all flex items-center gap-1 ${
                  activeTab === 'refill' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Setup Auto-Refill
              </button>
            </div>

            {/* TAB CONTENT: Basic Medical Info */}
            {activeTab === "info" && (
              <div className="space-y-5 text-sm leading-relaxed text-gray-700">
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1"><Info className="w-4 h-4 text-blue-500" /> Drug Composition</h4>
                  <p className="bg-slate-50 p-2.5 rounded-lg font-mono text-xs border border-slate-100 text-slate-800">{product.composition}</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Key Uses & Indications</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    {product.uses.map((use, i) => <li key={i}>{use}</li>)}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-0.5">Recommended Dosage</h4>
                    <p className="text-xs text-gray-600">{product.dosage}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-0.5">Storage Instruction</h4>
                    <p className="text-xs text-gray-600">{product.storage}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-1">How to Use Effectively</h4>
                  <p className="text-xs text-gray-600 bg-blue-50/40 p-3 rounded-xl border border-blue-50">{product.howToUse}</p>
                </div>

                {/* Frequently Bought Together Combo */}
                <div className="bg-gradient-to-r from-teal-50/40 to-blue-50/40 border border-slate-100 p-4 rounded-2xl space-y-3 mt-2 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Frequently Bought Together</h4>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt="" className="w-10 h-10 object-cover bg-white p-1 rounded-lg border border-slate-100 flex-shrink-0" />
                      <span className="font-bold text-gray-400 text-xs">+</span>
                      <div className="flex items-center gap-2">
                        <img src="" alt="" className="w-10 h-10 object-cover bg-white p-1 rounded-lg border border-slate-100 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">C-Lim Vitamin C Supplement</p>
                          <p className="text-[10px] text-slate-400 leading-tight">Recommended immunity booster combo</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto border-t sm:border-0 pt-2 sm:pt-0">
                      <div className="text-xs">
                        <span className="font-black text-slate-900">Combo Price: ₹{(product.price + 99).toFixed(2)}</span>
                        <span className="text-gray-400 line-through text-[10px] block sm:inline ml-2">₹{(product.mrp + 150).toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => {
                          onAddToCart(product, 1);
                          onAddToCart({
                            id: "supp-vitc",
                            name: "C-Lim Vitamin C Supplement",
                            sku: "VIT-C-15",
                            category: "wellness",
                            price: 99,
                            mrp: 150,
                            discount: 34,
                            rating: 4.8,
                            reviewsCount: 120,
                            prescriptionRequired: false,
                            image: "",
                            brand: "Limca Health",
                            composition: "Vitamin C 500mg, Zinc 5mg Chewable",
                            uses: ["Immunity booster", "Antioxidant skin protection"],
                            dosage: "1 chewable tablet daily",
                            howToUse: "Chew the tablet before swallowing",
                            sideEffects: ["None under recommended limits"],
                            warnings: ["Do not exceed recommended dosage"],
                            storage: "Store in a cool dry place",
                            stock: 500,
                            manufacturer: "Limca Labs Ltd",
                            expiry: "2030-12-31",
                            batchNumber: "B-VC92"
                          }, 1);
                          alert(`🎉 Combo Added! Slashed rate applied. Added both ${product.name} and Vitamin C Booster to your shopping cart!`);
                        }}
                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase px-4 py-2 rounded-xl mt-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        Add Combo Packet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Safety & warnings */}
            {activeTab === "safety" && (
              <div className="space-y-5 text-sm leading-relaxed text-gray-700">
                {/* Indian Regulatory Warning Badges */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3 shadow-xs">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-600" /> Regulatory Safety & Lifestyle Warnings
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">🤰 Pregnancy</span>
                      <span className="font-extrabold text-amber-600 text-xs flex items-center gap-1">
                        ⚠️ CAUTION
                      </span>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Consult a physician before usage during pregnancy.</p>
                    </div>
                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">🍼 Lactation</span>
                      <span className="font-extrabold text-green-600 text-xs flex items-center gap-1">
                        ✅ SAFE
                      </span>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Slightly excreted. Safe under professional advice.</p>
                    </div>
                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">🚗 Driving</span>
                      <span className="font-extrabold text-amber-600 text-xs flex items-center gap-1">
                        ⚠️ CAUTION
                      </span>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">May cause mild drowsiness or lightheadedness.</p>
                    </div>
                    <div className="bg-white border border-slate-100 p-2.5 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">🍷 Alcohol</span>
                      <span className="font-extrabold text-red-600 text-xs flex items-center gap-1">
                        🚫 UNSAFE
                      </span>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Avoid alcohol as it increases liver toxicity risk.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-950 mb-1">Critical Precautions & Warnings</h4>
                    <ul className="list-disc ml-4 space-y-1 text-xs text-amber-900">
                      {product.warnings.map((warn, i) => <li key={i}>{warn}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Drug-Drug Interactions */}
                <div className="bg-red-50/40 border border-red-100/50 p-4 rounded-2xl space-y-2">
                  <h4 className="font-extrabold text-xs text-red-950 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" /> Potential Drug-Drug Interactions
                  </h4>
                  <p className="text-[11px] text-red-800 leading-normal font-medium">
                    Do not take this formulation with <strong>Ketoconazole, Erythromycin, or Monoamine Oxidase Inhibitors (MAOIs)</strong> as it may cause acute pharmaceutical interactions. Always report your active medical ledger to your clinical practitioner.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-1.5">Known Side Effects</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.sideEffects.map((side, i) => (
                      <span key={i} className="bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-full border border-red-100/50 font-medium">
                        • {side}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-3">Note: Consult a physician immediately if side-effects persist or worsen.</p>
                </div>

                <div className="border-t pt-4 border-gray-100 flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-[11px] text-gray-500 leading-normal">
                    This medicine is registered and certified under CDSCO standards. Basanti Medical Store guarantees 100% genuine formulation sourced directly from licensed pharmaceutical units.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Setup Auto-Refill */}
            {activeTab === "refill" && (
              <div className="space-y-5">
                <div className="bg-green-50 text-green-950 p-4 rounded-2xl border border-green-100">
                  <h4 className="font-black text-sm mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-green-600" /> Never Run Out of Chronic Meds
                  </h4>
                  <p className="text-xs leading-relaxed text-green-800">
                    Set up a custom delivery schedule for your medicine. We will automatically place a fresh order and deliver it to your address before your stock runs out!
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Choose Refill Frequency</label>
                    <select
                      value={refillFreq}
                      onChange={(e) => setRefillFreq(e.target.value as RefillFrequency)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-green-500"
                    >
                      <option value={RefillFrequency.WEEKLY}>Weekly Refill</option>
                      <option value={RefillFrequency.MONTHLY}>Monthly Refill</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Quantity per Dispatch</label>
                    <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white w-max">
                      <button 
                        onClick={() => setRefillQty(Math.max(1, refillQty - 1))}
                        className="px-3 py-2 hover:bg-slate-50 font-bold"
                      >-</button>
                      <span className="px-4 py-2 font-bold text-xs min-w-[35px] text-center">{refillQty}</span>
                      <button 
                        onClick={() => setRefillQty(refillQty + 1)}
                        className="px-3 py-2 hover:bg-slate-50 font-bold"
                      >+</button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubscribe}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-green-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Activate Automated Refill Delivery
                </button>
              </div>
            )}
          </div>

          {/* Similar / Alternative Products section */}
          {similarProducts.length > 0 && (
            <div className="border-t border-gray-100 pt-6 mt-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Similar Alternatives Available</h4>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {similarProducts.map((sim) => (
                  <button
                    key={sim.id}
                    onClick={() => { onSelectProduct(sim); setQty(1); }}
                    className="flex-shrink-0 w-44 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all border border-slate-100 p-2.5 rounded-2xl flex items-center gap-2 text-left cursor-pointer"
                  >
                    <img src={sim.image} alt="" className="w-9 h-9 object-cover rounded-lg bg-white" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{sim.name}</p>
                      <p className="text-[10px] text-blue-600 font-extrabold">₹{sim.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
