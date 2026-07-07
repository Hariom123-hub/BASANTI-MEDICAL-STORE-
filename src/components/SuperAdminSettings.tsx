import React, { useState, useEffect } from 'react';
import { GlobalSettings, HealthArticle, FAQ, Testimonial, AppNotification } from '../types';
import { Settings, Shield, FileText, Layout, Tag, Megaphone, Check, Zap } from 'lucide-react';

export default function SuperAdminSettings({ branding, onRefresh }: { branding: GlobalSettings, onRefresh: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState('legal');
  const [form, setForm] = useState<GlobalSettings>(branding);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(branding);
  }, [branding]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        alert("Super Admin Config Saved Successfully!");
        onRefresh();
      }
    } catch (e) {
      alert("Error saving settings");
    }
    setIsSaving(false);
  };

  const tabs = [
    { id: 'legal', label: 'Legal & Licenses', icon: <Shield className="w-4 h-4" /> },
    { id: 'pharmacist', label: 'Pharmacist Details', icon: <FileText className="w-4 h-4" /> },
    { id: 'policies', label: 'Store Policies', icon: <FileText className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact & Footer', icon: <Settings className="w-4 h-4" /> },
    { id: 'ui', label: 'UI & Layout', icon: <Layout className="w-4 h-4" /> },
    { id: 'marketing', label: 'Marketing & SEO', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'config', label: 'System Config', icon: <Settings className="w-4 h-4" /> },
    { id: 'diagnostics', label: 'AI System Diagnostics', icon: <Zap className="w-4 h-4" /> },
  ];

  const renderField = (label: string, key: keyof GlobalSettings, type: string = "text", placeholder: string = "") => (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={form[key] as string || ''}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder || `Enter ${label}`}
          className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm min-h-[100px]"
        />
      ) : (
        <input
          type={type}
          value={form[key] as string | number || ''}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder || `Enter ${label}`}
          className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm"
        />
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mt-6 flex flex-col md:flex-row min-h-[800px]">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 shrink-0">
        <h2 className="font-black text-lg text-slate-900 mb-6 px-2">Super Admin Config</h2>
        <div className="space-y-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                activeSubTab === t.id ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 sm:p-10 bg-slate-50/50 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-900">{tabs.find(t => t.id === activeSubTab)?.label}</h3>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-green-200 transition-all"
            >
              <Check className="w-5 h-5" /> {isSaving ? "Saving..." : "Save All Configurations"}
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            
            {activeSubTab === 'legal' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">Leave fields empty if not configured. Do NOT enter fake license numbers.</p>
                {renderField("Drug License Number", "drugLicenseNumber")}
                {renderField("Drug Licensing Authority", "drugLicensingAuthority")}
                {renderField("Drug License Validity / Expiry", "drugLicenseValidity")}
                {renderField("Drug License Document URL (Base64 or Link)", "drugLicenseDocumentUrl")}
              </div>
            )}

            {activeSubTab === 'pharmacist' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">Registered Pharmacist details will appear on verified prescriptions.</p>
                {renderField("Pharmacist Full Name", "pharmacistName")}
                {renderField("Pharmacist Registration Number", "pharmacistRegistrationNumber")}
                {renderField("Pharmacist Qualification (e.g., B.Pharm, D.Pharm)", "pharmacistQualification")}
                {renderField("Pharmacist Photo URL", "pharmacistPhotoUrl")}
              </div>
            )}

            {activeSubTab === 'policies' && (
              <div className="space-y-2">
                {renderField("Privacy Policy", "privacyPolicyText", "textarea")}
                {renderField("Terms & Conditions", "termsConditionsText", "textarea")}
                {renderField("Refund Policy", "refundPolicyText", "textarea")}
                {renderField("Shipping Policy", "shippingPolicyText", "textarea")}
                {renderField("Cancellation Policy", "cancellationPolicyText", "textarea")}
                {renderField("Medical Disclaimer", "medicalDisclaimerText", "textarea")}
              </div>
            )}

            {activeSubTab === 'contact' && (
              <div className="space-y-2">
                {renderField("Footer Text / Description", "footerText", "textarea")}
                {renderField("Contact Address", "contactAddress", "textarea")}
                {renderField("Support Email", "supportEmail", "email")}
                {renderField("Support Phone", "supportPhone", "tel")}
              </div>
            )}

            {activeSubTab === 'ui' && (
              <div className="space-y-2">
                {renderField("App Name", "appName")}
                {renderField("Hero Title", "heroTitle")}
                {renderField("Hero Slogan", "heroSlogan", "textarea")}
                {renderField("Hero Image URL", "heroImageUrl")}
                {renderField("App Logo (Icon Name)", "appLogo")}
                {renderField("Custom Logo URL", "customLogoUrl")}
                {renderField("AI Assistant Name", "aiAssistantName")}
              </div>
            )}

            {activeSubTab === 'marketing' && (
              <div className="space-y-2">
                {renderField("SEO Meta Title", "seoMetaTitle")}
                {renderField("SEO Meta Description", "seoMetaDescription", "textarea")}
                {renderField("SEO Keywords", "seoKeywords", "textarea")}
                {renderField("Banner Offer Text", "bannerOfferText")}
                {renderField("Facebook URL", "socialFacebookUrl")}
                {renderField("Instagram URL", "socialInstagramUrl")}
                {renderField("Twitter URL", "socialTwitterUrl")}
                {renderField("YouTube URL", "socialYoutubeUrl")}
              </div>
            )}

            {activeSubTab === 'config' && (
              <div className="space-y-2">
                {renderField("Base Delivery Charges (₹)", "deliveryChargesBase", "number")}
                {renderField("Free Delivery Threshold (₹)", "freeDeliveryThreshold", "number")}
                {renderField("GST Percentage (%)", "gstPercentage", "number")}
                {renderField("Tax Settings Text (Footer)", "taxSettingsText")}
                {renderField("Prescription Verification Message", "prescriptionVerificationMessage", "textarea")}
                {renderField("Order Confirmation Email Template", "orderConfirmationEmailTemplate", "textarea")}
                {renderField("WhatsApp Notification Template", "whatsappNotificationTemplate", "textarea")}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
