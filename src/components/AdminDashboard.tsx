/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import SuperAdminSettings from './SuperAdminSettings';
import { 
  BarChart, Activity, ShoppingBag, Pill, CheckCircle, XCircle, 
  AlertTriangle, ArrowUpRight, Truck, PlusCircle, RefreshCw, Layers,
  Trash2, Edit, Sparkles, Save, X, Phone, PhoneCall, Mail, Globe, Palette, Settings, MapPin,
  ChevronDown, ChevronRight, Play, Shield, Cpu, Terminal, History, Check, Zap, Send, FileCode, Building, Package, Store, User
} from 'lucide-react';
import { 
  Product, Order, Prescription, PrescriptionStatus, OrderStatus, SiteBranding, PaymentConfig, DoctorAppointment, Doctor, LabTestPackage, Advertisement
} from '../types';
import { CATEGORIES } from '../data';
import BranchManager from './admin/BranchManager';
import SupplierManager from './admin/SupplierManager';
import DeliveryBoyManager from './admin/DeliveryBoyManager';
import BackupRestore from './admin/BackupRestore';
import AiInsights from './admin/AiInsights';
import WarehouseManager from './admin/WarehouseManager';
import PurchaseOrderManager from './admin/PurchaseOrderManager';
import SecurityAuditManager from './admin/SecurityAuditManager';
import ApiWebhookManager from './admin/ApiWebhookManager';

interface AdminDashboardProps {
  onRefreshAllData: () => void;
  products: Product[];
  orders: Order[];
  prescriptions: Prescription[];
  onReviewPrescription: (prescriptionId: string, status: PrescriptionStatus, reason?: string, doctorName?: string, meds?: string[]) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  onUpdateStock: (productId: string, stock: number) => void;
  branding: SiteBranding;
  paymentConfig?: PaymentConfig;
  activeAdminPin?: string;
  isDevModeActive?: boolean;
  setIsDevModeActive?: (active: boolean | ((curr: boolean) => boolean)) => void;
  appointments?: DoctorAppointment[];
  doctors?: Doctor[];
  labTests?: LabTestPackage[];
  setLabTests?: React.Dispatch<React.SetStateAction<LabTestPackage[]>>;
  onUpdateAppointment?: (id: string, updates: Partial<DoctorAppointment>) => void;
  advertisements?: Advertisement[];
  onUpdateAdvertisements?: () => void;
}

export interface CodeIssue {
  lineNum: number;
  severity: 'error' | 'warning';
  message: string;
  code: string;
}

export const cleanCodeForAnalysis = (content: string): string => {
  let result = '';
  
  interface State {
    type: 'NORMAL' | 'SL_COMMENT' | 'ML_COMMENT' | 'SQ_STR' | 'DQ_STR' | 'BT_STR' | 'INTERPOLATION';
    braceDepth?: number;
  }
  
  const stack: State[] = [{ type: 'NORMAL' }];
  let escape = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1] || '';
    const current = stack[stack.length - 1];
    
    // Helper to check if a state acts like code (can spawn comments, strings, interpolations)
    const isCodeState = current.type === 'NORMAL' || current.type === 'INTERPOLATION';
    
    if (isCodeState) {
      if (char === '/' && nextChar === '/') {
        stack.push({ type: 'SL_COMMENT' });
        result += '  ';
        i++;
      } else if (char === '/' && nextChar === '*') {
        stack.push({ type: 'ML_COMMENT' });
        result += '  ';
        i++;
      } else if (char === '`') {
        stack.push({ type: 'BT_STR' });
        result += ' ';
      } else if (char === "'") {
        stack.push({ type: 'SQ_STR' });
        result += ' ';
        escape = false;
      } else if (char === '"') {
        stack.push({ type: 'DQ_STR' });
        result += ' ';
        escape = false;
      } else if (char === '{') {
        if (current.type === 'INTERPOLATION') {
          current.braceDepth = (current.braceDepth || 0) + 1;
        }
        result += char;
      } else if (char === '}') {
        if (current.type === 'INTERPOLATION') {
          if ((current.braceDepth || 0) > 0) {
            current.braceDepth = (current.braceDepth || 0) - 1;
            result += char;
          } else {
            // End of interpolation
            stack.pop();
            result += ' '; // replace closing brace of interpolation with space
          }
        } else {
          result += char;
        }
      } else {
        result += char;
      }
    } else if (current.type === 'SL_COMMENT') {
      if (char === '\n') {
        stack.pop();
        result += '\n';
      } else {
        result += ' ';
      }
    } else if (current.type === 'ML_COMMENT') {
      if (char === '*' && nextChar === '/') {
        stack.pop();
        result += '  ';
        i++;
      } else {
        result += char === '\n' ? '\n' : ' ';
      }
    } else if (current.type === 'BT_STR') {
      if (escape) {
        escape = false;
        result += char === '\n' ? '\n' : ' ';
      } else if (char === '\\') {
        escape = true;
        result += ' ';
      } else if (char === '$' && nextChar === '{') {
        stack.push({ type: 'INTERPOLATION', braceDepth: 0 });
        result += '  ';
        i++;
      } else if (char === '`') {
        stack.pop();
        result += ' ';
      } else {
        result += char === '\n' ? '\n' : ' ';
      }
    } else if (current.type === 'SQ_STR') {
      if (char === '\n') {
        stack.pop();
        result += '\n';
      } else if (escape) {
        escape = false;
        result += ' ';
      } else if (char === '\\') {
        escape = true;
        result += ' ';
      } else if (char === "'") {
        stack.pop();
        result += ' ';
      } else {
        result += ' ';
      }
    } else if (current.type === 'DQ_STR') {
      if (char === '\n') {
        stack.pop();
        result += '\n';
      } else if (escape) {
        escape = false;
        result += ' ';
      } else if (char === '\\') {
        escape = true;
        result += ' ';
      } else if (char === '"') {
        stack.pop();
        result += ' ';
      } else {
        result += ' ';
      }
    }
  }
  return result;
};

export const scanForErrors = (content: string, filePath: string): CodeIssue[] => {
  const issues: CodeIssue[] = [];
  if (!content) return [];
  const lines = content.split('\n');
  const cleaned = cleanCodeForAnalysis(content);
  const cleanedLines = cleaned.split('\n');
  
  // 1. Check for mismatched braces, brackets, and parentheses in the entire file with line-level tracking
  const bracesStack: { lineNum: number }[] = [];
  const parensStack: { lineNum: number }[] = [];
  const bracketsStack: { lineNum: number }[] = [];
  
  let currentLineNum = 1;
  let hasBraceError = false;
  let hasParenError = false;
  let hasBracketError = false;
  
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char === '\n') {
      currentLineNum++;
    } else if (char === '{') {
      bracesStack.push({ lineNum: currentLineNum });
    } else if (char === '}') {
      if (bracesStack.length > 0) {
        bracesStack.pop();
      } else {
        // Mismatched extra closing curly brace
        issues.push({
          lineNum: currentLineNum,
          severity: 'error',
          message: `Mismatched Curly Braces '{ }' found in file! Extra closing brace '}' at line ${currentLineNum}. Please verify your tags or code blocks are closed.`,
          code: 'BRACE_MISMATCH'
        });
        hasBraceError = true;
      }
    } else if (char === '(') {
      parensStack.push({ lineNum: currentLineNum });
    } else if (char === ')') {
      if (parensStack.length > 0) {
        parensStack.pop();
      } else {
        // Mismatched extra closing parenthesis
        issues.push({
          lineNum: currentLineNum,
          severity: 'error',
          message: `Mismatched Parentheses '( )' found in file! Extra closing parenthesis ')' at line ${currentLineNum}. Verify your function parameters and conditionals.`,
          code: 'PAREN_MISMATCH'
        });
        hasParenError = true;
      }
    } else if (char === '[') {
      bracketsStack.push({ lineNum: currentLineNum });
    } else if (char === ']') {
      if (bracketsStack.length > 0) {
        bracketsStack.pop();
      } else {
        // Mismatched extra closing square bracket
        issues.push({
          lineNum: currentLineNum,
          severity: 'error',
          message: `Mismatched Square Brackets '[ ]' found in file! Extra closing bracket ']' at line ${currentLineNum}. Check your index syntax or array configurations.`,
          code: 'BRACKET_MISMATCH'
        });
        hasBracketError = true;
      }
    }
  }
  
  // If there are unclosed opening symbols remaining at the end of the file
  if (bracesStack.length > 0 && !hasBraceError) {
    const firstUnmatched = bracesStack[bracesStack.length - 1]; // Report the most nested unclosed brace first
    issues.push({
      lineNum: firstUnmatched.lineNum,
      severity: 'error',
      message: `Mismatched Curly Braces '{ }' found in file! Unclosed opening brace '{' at line ${firstUnmatched.lineNum} (total unclosed: ${bracesStack.length}). Please verify your tags or code blocks are closed.`,
      code: 'BRACE_MISMATCH'
    });
  }
  if (parensStack.length > 0 && !hasParenError) {
    const firstUnmatched = parensStack[parensStack.length - 1];
    issues.push({
      lineNum: firstUnmatched.lineNum,
      severity: 'error',
      message: `Mismatched Parentheses '( )' found in file! Unclosed opening parenthesis '(' at line ${firstUnmatched.lineNum} (total unclosed: ${parensStack.length}). Verify your function parameters and conditionals.`,
      code: 'PAREN_MISMATCH'
    });
  }
  if (bracketsStack.length > 0 && !hasBracketError) {
    const firstUnmatched = bracketsStack[bracketsStack.length - 1];
    issues.push({
      lineNum: firstUnmatched.lineNum,
      severity: 'error',
      message: `Mismatched Square Brackets '[ ]' found in file! Unclosed opening bracket '[' at line ${firstUnmatched.lineNum} (total unclosed: ${bracketsStack.length}). Check your index syntax or array configurations.`,
      code: 'BRACKET_MISMATCH'
    });
  }
  
  // 2. Line-by-line validation
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanedLine = cleanedLines[i];
    const lineNum = i + 1;
    const trimmedOriginal = line.trim();
    const trimmedCleaned = cleanedLine.trim();
    
    if (trimmedCleaned === '') {
      continue;
    }
    
    // Check console.log leftovers
    if (trimmedCleaned.includes('console.log(')) {
      issues.push({
        lineNum,
        severity: 'warning',
        message: "Leftover print statement: 'console.log()' was found. Best to clean it up before deployment.",
        code: 'CONSOLE_LOG'
      });
    }
    
    // Unsafe comparisons
    if (/\s==\s/.test(cleanedLine) && !cleanedLine.includes('===') && !cleanedLine.includes('===')) {
      issues.push({
        lineNum,
        severity: 'warning',
        message: "Unsafe loose equality '=='. Use strict comparison '===' to prevent unexpected bugs.",
        code: 'LOOSE_EQUAL'
      });
    }
    if (/\s!=\s/.test(cleanedLine) && !cleanedLine.includes('!==')) {
      issues.push({
        lineNum,
        severity: 'warning',
        message: "Unsafe loose inequality '!='. Use strict comparison '!==' to prevent unexpected bugs.",
        code: 'LOOSE_NOTEQUAL'
      });
    }
    
    // Empty catch blocks
    if (trimmedCleaned.includes('catch') && (trimmedCleaned.includes('{}') || (trimmedCleaned.includes('{') && trimmedCleaned.includes('}') && trimmedCleaned.replace(/\s/g, '').includes('catch(err){}')))) {
      issues.push({
        lineNum,
        severity: 'warning',
        message: "Empty catch block. This swallows errors silently and makes bug-tracking extremely difficult.",
        code: 'EMPTY_CATCH'
      });
    }
    
    // Window.alert check
    if (trimmedCleaned.includes('alert(') && !trimmedOriginal.includes('alert(`🛠️') && !trimmedOriginal.includes('alert("🛠️') && !trimmedOriginal.includes('alert("🎉')) {
      issues.push({
        lineNum,
        severity: 'warning',
        message: "Prohibited API: 'alert()' is not recommended inside standard iframe preview modes.",
        code: 'ALERT_USAGE'
      });
    }
    
    // Inline styling check
    if (trimmedCleaned.includes('style={{') && !filePath.includes('AdminDashboard')) {
      issues.push({
        lineNum,
        severity: 'warning',
        message: "Inline style variable found. The project guidelines recommend using utility-first Tailwind CSS.",
        code: 'INLINE_STYLE'
      });
    }
    
    // Unhandled promise fetch check
    if (trimmedCleaned.includes('fetch(') && !cleanedLine.includes('catch')) {
      let hasCatch = false;
      for (let j = 1; j <= 5; j++) {
        if (cleanedLines[i + j] && (cleanedLines[i + j].includes('.catch') || cleanedLines[i + j].includes('catch'))) {
          hasCatch = true;
          break;
        }
      }
      if (!hasCatch) {
        issues.push({
          lineNum,
          severity: 'warning',
          message: "Unhandled Promise Rejection: fetch network request is missing an attached .catch() handler.",
          code: 'UNHANDLED_FETCH'
        });
      }
    }
    
    // TODO/FIXME markers (we check the original line here because these live inside comments!)
    if (trimmedOriginal.toLowerCase().includes('todo:') || trimmedOriginal.toLowerCase().includes('fixme:') || trimmedOriginal.toLowerCase().includes('// todo') || trimmedOriginal.toLowerCase().includes('// fixme')) {
      issues.push({
        lineNum,
        severity: 'warning',
        message: "Pending Action Item: Found a 'TODO' or 'FIXME' marker left behind in production code.",
        code: 'TODO_FLAG'
      });
    }



    // react-markdown check
    if (trimmedCleaned.includes('react-markdown') && trimmedCleaned.includes('className=')) {
      issues.push({
        lineNum,
        severity: 'error',
        message: "Markdown Style Violation: Avoid passing className to <Markdown>. Place it on a wrapper <div> instead.",
        code: 'MARKDOWN_CLASSNAME'
      });
    }
  }
  
  return issues;
};

export default function AdminDashboard({
  onRefreshAllData,
  products,
  orders,
  prescriptions,
  onReviewPrescription,
  onUpdateOrderStatus,
  onUpdateStock,
  branding,
  paymentConfig,
  activeAdminPin = "",
  isDevModeActive = false,
  setIsDevModeActive = () => {},
  appointments = [],
  onUpdateAppointment,
  doctors,
  labTests = [],
  setLabTests = () => {},
  advertisements = [],
  onUpdateAdvertisements = () => {}
}: AdminDashboardProps) {
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "prescriptions" | "inventory" | "orders" | "add-product" | "branding" | "payment-settings" | "appointments" | "doctors" | "advertisements">("analytics");
  const [stockInput, setStockInput] = useState<{ [key: string]: string }>({});
  const [newDoctorImage, setNewDoctorImage] = useState<string>("");
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<string | null>(null);
  const [editDocFee, setEditDocFee] = useState<number>(0);
  const [editDocOffer, setEditDocOffer] = useState<string>("");
  const [selectedDocProfile, setSelectedDocProfile] = useState<any>(null);
  const [editDocImage, setEditDocImage] = useState<string>("");
  const [docSaveStatus, setDocSaveStatus] = useState<string>("");
  const [docConfirmDelete, setDocConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    if (selectedDocProfile) {
      setEditDocImage(selectedDocProfile.image || "");
    } else {
      setEditDocImage("");
    }
  }, [selectedDocProfile]);

  // Local state for Advertisement Management
  const [adForm, setAdForm] = useState({
    title: "",
    description: "",
    mediaType: "image" as "image" | "video",
    mediaUrl: "",
    ctaText: "",
    linkUrl: "home",
    active: true
  });
  const [isAddingAd, setIsAddingAd] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [isSavingAd, setIsSavingAd] = useState(false);

  // Local state for Payment Gateway settings
  const [pUpiId, setPUpiId] = useState(paymentConfig?.upiId || "");
  const [pUpiQrCode, setPUpiQrCode] = useState(paymentConfig?.upiQrCode || "");
  const [pBankName, setPBankName] = useState(paymentConfig?.bankName || "");
  const [pAccountHolderName, setPAccountHolderName] = useState(paymentConfig?.accountHolderName || "");
  const [pAccountNumber, setPUpiAccountNumber] = useState(paymentConfig?.accountNumber || "");
  const [pIfscCode, setPIfscCode] = useState(paymentConfig?.ifscCode || "");
  const [isSavingPaymentSettings, setIsSavingPaymentSettings] = useState(false);

  useEffect(() => {
    if (paymentConfig) {
      setPUpiId(paymentConfig.upiId || "");
      setPUpiQrCode(paymentConfig.upiQrCode || "");
      setPBankName(paymentConfig.bankName || "");
      setPAccountHolderName(paymentConfig.accountHolderName || "");
      setPUpiAccountNumber(paymentConfig.accountNumber || "");
      setPIfscCode(paymentConfig.ifscCode || "");
    }
  }, [paymentConfig]);

  const handleUpiQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPUpiQrCode(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pUpiId.trim()) {
      alert("🚨 A valid UPI ID is required for custom merchant payments.");
      return;
    }
    setIsSavingPaymentSettings(true);
    try {
      const res = await fetch('/api/payment-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upiId: pUpiId.trim(),
          upiQrCode: pUpiQrCode,
          bankName: pBankName.trim(),
          accountHolderName: pAccountHolderName.trim(),
          accountNumber: pAccountNumber.trim(),
          ifscCode: pIfscCode.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("✨ Custom Merchant UPI Gateway Settings have been saved and are now live!");
        onRefreshAllData();
      } else {
        alert("Failed to save settings: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving payment gateway settings to database.");
    } finally {
      setIsSavingPaymentSettings(false);
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adForm.title.trim() || !adForm.mediaUrl.trim()) {
      alert("🚨 Ad title and image/video URL are required.");
      return;
    }
    setIsSavingAd(true);
    try {
      const url = editingAdId 
        ? `/api/admin/advertisements/${editingAdId}` 
        : '/api/admin/advertisements';
      const method = editingAdId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adForm)
      });

      if (res.ok) {
        alert(editingAdId ? "✨ Advertisement successfully updated!" : "✨ New advertisement successfully launched!");
        setEditingAdId(null);
        setIsAddingAd(false);
        setAdForm({
          title: "",
          description: "",
          mediaType: "image",
          mediaUrl: "",
          ctaText: "",
          linkUrl: "home",
          active: true
        });
        if (onUpdateAdvertisements) {
          onUpdateAdvertisements();
        }
      } else {
        const errData = await res.json();
        alert("Failed to save advertisement: " + (errData.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while saving advertisement.");
    } finally {
      setIsSavingAd(false);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return;
    try {
      const res = await fetch(`/api/admin/advertisements/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("🗑️ Advertisement has been deleted.");
        if (onUpdateAdvertisements) {
          onUpdateAdvertisements();
        }
      } else {
        alert("Failed to delete advertisement.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while deleting advertisement.");
    }
  };

  // Hidden developer code troubleshooter (Activated by clicking header 20 times)
  const [devClicks, setDevClicks] = useState(0);
  const [devFiles, setDevFiles] = useState<string[]>([]);
  const [selectedDevFile, setSelectedDevFile] = useState<string>("");
  const [devFileContent, setDevFileContent] = useState<string>("");
  const [isLoadingDevFile, setIsLoadingDevFile] = useState(false);
  const [devSearchQuery, setDevSearchQuery] = useState("");
  const [devError, setDevError] = useState("");

  const [isEditingDevFile, setIsEditingDevFile] = useState(false);
  const [editingDevContent, setEditingDevContent] = useState("");
  const [isSavingDevFile, setIsSavingDevFile] = useState(false);
  const [devSaveSuccess, setDevSaveSuccess] = useState("");
  const [highlightedIssueLine, setHighlightedIssueLine] = useState<number | null>(null);

  // Real AI Developer tool states
  const [devChatMessages, setDevChatMessages] = useState<Array<{ id: string; sender: 'user' | 'assistant'; text: string }>>([
    {
      id: 'welcome-dev',
      sender: 'assistant',
      text: "👋 **Welcome to the Real AI Developer & Live Code Assistant!**\n\nI am connected directly to your server's backend. You can speak to me in **any language** (Hinglish, Hindi, English, etc.) to request new features, layout updates, bug fixes, or behavioral changes.\n\n### 🚀 How to use:\n1. Select a file from the **File Directory** (e.g., `src/App.tsx` or `src/index.css`).\n2. Type your request (e.g. *'Make the page headers dark blue'* or *'Add a discount calculation function'*).\n3. I will analyze the code, rewrite it with your changes, and provide an action button to **Apply Changes to Live Server** instantly!"
    }
  ]);
  const [devChatInput, setDevChatInput] = useState("");
  const [isDevChatLoading, setIsDevChatLoading] = useState(false);
  const [proposedCode, setProposedCode] = useState("");
  const [isApplyingProposedCode, setIsApplyingProposedCode] = useState(false);
  const [applyProposedSuccess, setApplyProposedSuccess] = useState("");
  const [devMiddleTab, setDevMiddleTab] = useState<'ai' | 'inspect'>('ai');
  const [devUploadedImage, setDevUploadedImage] = useState<string | null>(null);

  const activeContentForScanning = isEditingDevFile ? editingDevContent : devFileContent;
  const devIssues = React.useMemo(() => {
    return scanForErrors(activeContentForScanning, selectedDevFile);
  }, [activeContentForScanning, selectedDevFile]);

  const jumpToLine = (lineNum: number) => {
    setHighlightedIssueLine(lineNum);
    setTimeout(() => {
      const element = document.getElementById(`dev-line-${lineNum}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Site Branding State inside AdminDashboard
  const [bAppName, setBAppName] = useState(branding?.appName || "");
  const [bAppLogo, setBAppLogo] = useState(branding?.appLogo || "");
  const [bHeroTitle, setBHeroTitle] = useState(branding?.heroTitle || "");
  const [bHeroSlogan, setBHeroSlogan] = useState(branding?.heroSlogan || "");
  const [bHeroImageUrl, setBHeroImageUrl] = useState(branding?.heroImageUrl || "");
  const [bSupportPhone, setBSupportPhone] = useState(branding?.supportPhone || "");
  const [bSupportEmail, setBSupportEmail] = useState(branding?.supportEmail || "");
  const [bPrimaryColorHex, setBPrimaryColorHex] = useState(branding?.primaryColorHex || "");
  const [bAboutUsText, setBAboutUsText] = useState(branding?.aboutUsText || "");
  const [bBannerOfferText, setBBannerOfferText] = useState(branding?.bannerOfferText || "");
  const [bAiAssistantName, setBAiAssistantName] = useState(branding?.aiAssistantName || "Partha AI Assistant");
  const [bOpsPanelTitle, setBOpsPanelTitle] = useState(branding?.opsPanelTitle || "Partha Pharmacist & Operations Hub");
  const [bCustomLogoUrl, setBCustomLogoUrl] = useState(branding?.customLogoUrl || "");
  const [bCustomLogoSize, setBCustomLogoSize] = useState(branding?.customLogoSize || 40);
  const [bBrandBio, setBBrandBio] = useState(branding?.brandBio || "");
  const [bMobileNavTitle, setBMobileNavTitle] = useState(branding?.mobileNavTitle || "Partha Navigation");
  const [bCategoryImages, setBCategoryImages] = useState<Record<string, string>>(branding?.categoryImages || {});
  const [bClinicAddress, setBClinicAddress] = useState(branding?.clinicAddress || "Sector 4, Nehru Enclave, New Delhi, 110019");
  const [bClinicLocationUrl, setBClinicLocationUrl] = useState(branding?.clinicLocationUrl || "https://maps.google.com");
  
  const [bExpertDoctorTitle, setBExpertDoctorTitle] = useState(branding?.expertDoctorTitle || "Expert Doctor Consult");
  const [bExpertDoctorDesc, setBExpertDoctorDesc] = useState(branding?.expertDoctorDesc || "Book a live high-definition video session with certified cardiologists, dermatologists, and pediatricians");
  const [bExpertDoctorPrice, setBExpertDoctorPrice] = useState(branding?.expertDoctorPrice || "starting at ₹450");
  const [bExpertDoctorImage, setBExpertDoctorImage] = useState(branding?.expertDoctorImage || "");
  const [bExpertDoctorBgColor, setBExpertDoctorBgColor] = useState(branding?.expertDoctorBgColor || "bg-red-50 text-red-600");
  
  const [bBookLabTestsTitle, setBBookLabTestsTitle] = useState(branding?.bookLabTestsTitle || "Book Diagnostic Lab Tests");
  const [bBookLabTestsDesc, setBBookLabTestsDesc] = useState(branding?.bookLabTestsDesc || "Full Body Checkups covering LFT, KFT, diabetes glucose load.");
  const [bBookLabTestsDelivery, setBBookLabTestsDelivery] = useState(branding?.bookLabTestsDelivery || "Digital reports dispatched within 12 hours!");
  const [bBookLabTestsImage, setBBookLabTestsImage] = useState(branding?.bookLabTestsImage || "");
  const [bBookLabTestsBgColor, setBBookLabTestsBgColor] = useState(branding?.bookLabTestsBgColor || "bg-purple-50 text-purple-600");
  const [bExtraServices, setBExtraServices] = useState<any[]>(branding?.extraServices || []);
  const [bAppGlobalBgImage, setBAppGlobalBgImage] = useState(branding?.appGlobalBgImage || "");
  const [bEnableAboutUsPage, setBEnableAboutUsPage] = useState(branding?.enableAboutUsPage !== false);
  const [bAboutUsPageTitle, setBAboutUsPageTitle] = useState(branding?.aboutUsPageTitle || "");
  const [bAboutUsPageText, setBAboutUsPageText] = useState(branding?.aboutUsPageText || "");
  const [bAboutUsPageImage, setBAboutUsPageImage] = useState(branding?.aboutUsPageImage || "");
  const [bAboutUsFactsTitle, setBAboutUsFactsTitle] = useState(branding?.aboutUsFactsTitle || "");
  const [bAboutUsFacts, setBAboutUsFacts] = useState<any[]>(branding?.aboutUsFacts || []);
  const [bEnableInvestPage, setBEnableInvestPage] = useState(branding?.enableInvestPage !== false);
  const [bInvestPageTitle, setBInvestPageTitle] = useState(branding?.investPageTitle || "");
  const [bInvestPageText, setBInvestPageText] = useState(branding?.investPageText || "");
  const [bInvestPageEmail, setBInvestPageEmail] = useState(branding?.investPageEmail || "");
  const [bInvestPageImage, setBInvestPageImage] = useState(branding?.investPageImage || "");
  const [bEnableGalleryPage, setBEnableGalleryPage] = useState(branding?.enableGalleryPage !== false);
  const [bGalleryPageTitle, setBGalleryPageTitle] = useState(branding?.galleryPageTitle || "");
  const [bGalleryAddressTitle, setBGalleryAddressTitle] = useState(branding?.galleryAddressTitle || "");
  const [bGalleryAddressText, setBGalleryAddressText] = useState(branding?.galleryAddressText || "");
  const [bGalleryContactPhone, setBGalleryContactPhone] = useState(branding?.galleryContactPhone || "");
  const [bGalleryTimingText, setBGalleryTimingText] = useState(branding?.galleryTimingText || "");
  const [bGalleryBannerImage, setBGalleryBannerImage] = useState(branding?.galleryBannerImage || "");
  const [bGalleryImages, setBGalleryImages] = useState<any[]>(branding?.galleryImages || []);
  const [bAppGlobalBgColor, setBAppGlobalBgColor] = useState(branding?.appGlobalBgColor || "bg-slate-50");
  
  const [bVerifyDeliveryTitle, setBVerifyDeliveryTitle] = useState(branding?.verifyDeliveryTitle || "Verify Delivery Availability");
  const [bVerifyDeliveryDesc, setBVerifyDeliveryDesc] = useState(branding?.verifyDeliveryDesc || "Enter your area pincode to check service availability & estimated dispatch durations.");
  const [bVerifyDeliveryBgUrl, setBVerifyDeliveryBgUrl] = useState(branding?.verifyDeliveryBgUrl || "");
  const [bDeliveryLocations, setBDeliveryLocations] = useState<{pincode: string, address: string}[]>(branding?.deliveryLocations || []);
  const [newLocPincode, setNewLocPincode] = useState("");
  const [newLocAddress, setNewLocAddress] = useState("");
  
  const [bIsPremiumClubEnabled, setBIsPremiumClubEnabled] = useState(branding?.isPremiumClubEnabled !== undefined ? branding.isPremiumClubEnabled : true);
  const [bPremiumClubTitle, setBPremiumClubTitle] = useState(branding?.premiumClubTitle || "SONU PREMIUM CLUB");
  const [bPremiumClubSlogan, setBPremiumClubSlogan] = useState(branding?.premiumClubSlogan || "Refer your friends & receive direct cashback to your wallet!");
  const [bPremiumClubDescription, setBPremiumClubDescription] = useState(branding?.premiumClubDescription || "Earn 5% reward points on every order. Plus, copy the code REFERRAL50 inside the account tab to add ₹50 cashback instantly to your wallet. Use your points during checkout for super discounts!");
  const [bCustomCategories, setBCustomCategories] = useState<{id: string, name: string}[]>(branding?.customCategories || []);
  const [bEnableExpertDoctor, setBEnableExpertDoctor] = useState(branding?.enableExpertDoctor !== false);
  const [bEnableBookLabTests, setBEnableBookLabTests] = useState(branding?.enableBookLabTests !== false);
  const [bEnableVerifyDelivery, setBEnableVerifyDelivery] = useState(branding?.enableVerifyDelivery !== false);
  const [bEnableCategories, setBEnableCategories] = useState(branding?.enableCategories !== false);
  const [bEnableTopSelling, setBEnableTopSelling] = useState(branding?.enableTopSelling !== false);
  const [bEnableRefills, setBEnableRefills] = useState(branding?.enableRefills !== false);
  const [bEnableTrustFeatures, setBEnableTrustFeatures] = useState(branding?.enableTrustFeatures !== false);
  const [bEnableWhatsappOrder, setBEnableWhatsappOrder] = useState(branding?.enableWhatsappOrder !== false);
  const [bWhatsappNumber, setBWhatsappNumber] = useState(branding?.whatsappNumber || "");
  const [newCatNameInput, setNewCatNameInput] = useState("");
  const [newCatImageInput, setNewCatImageInput] = useState("");
  const [isSavingCategories, setIsSavingCategories] = useState(false);
  

  const [bLabTests, setBLabTests] = useState<LabTestPackage[]>(labTests);
  const [isSavingLabTests, setIsSavingLabTests] = useState(false);
  const [expandedLabTestId, setExpandedLabTestId] = useState<string>("");

  useEffect(() => {
    setBLabTests(labTests);
  }, [labTests]);

  const handleSaveLabTests = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLabTests(true);
    try {
      const res = await fetch('/api/admin/lab-tests-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bLabTests)
      });
      if (res.ok) {
        setLabTests(bLabTests);
        alert('Lab tests catalog saved successfully!');
      } else {
        alert('Failed to save lab tests.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving lab tests.');
    } finally {
      setIsSavingLabTests(false);
    }
  };

  const [expandedBrandingSection, setExpandedBrandingSection] = useState<string>("core");
  
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  
  useEffect(() => {
    if (branding) {
      setBAppName(branding.appName || "");
      setBAppLogo(branding.appLogo || "");
      setBHeroTitle(branding.heroTitle || "");
      setBHeroSlogan(branding.heroSlogan || "");
      setBHeroImageUrl(branding.heroImageUrl || "");
      setBSupportPhone(branding.supportPhone || "");
      setBSupportEmail(branding.supportEmail || "");
      setBPrimaryColorHex(branding.primaryColorHex || "");
      setBAboutUsText(branding.aboutUsText || "");
      setBBannerOfferText(branding.bannerOfferText || "");
      setBAiAssistantName(branding.aiAssistantName || "Partha AI Assistant");
      setBOpsPanelTitle(branding.opsPanelTitle || "Partha Pharmacist & Operations Hub");
      setBCustomLogoUrl(branding.customLogoUrl || "");
      setBCustomLogoSize(branding.customLogoSize || 40);
      setBBrandBio(branding.brandBio || "");
      setBMobileNavTitle(branding.mobileNavTitle || "Partha Navigation");
      setBCategoryImages(branding.categoryImages || {});
      setBExpertDoctorTitle(branding.expertDoctorTitle || "Expert Doctor Consult");
      setBExpertDoctorDesc(branding.expertDoctorDesc || "Book a live high-definition video session with certified cardiologists, dermatologists, and pediatricians");
      setBExpertDoctorPrice(branding.expertDoctorPrice || "starting at ₹450");
      setBExpertDoctorImage(branding.expertDoctorImage || "");
      setBExpertDoctorBgColor(branding.expertDoctorBgColor || "bg-red-50 text-red-600");
      setBBookLabTestsTitle(branding.bookLabTestsTitle || "Book Diagnostic Lab Tests");
      setBBookLabTestsDesc(branding.bookLabTestsDesc || "Full Body Checkups covering LFT, KFT, diabetes glucose load.");
      setBBookLabTestsDelivery(branding.bookLabTestsDelivery || "Digital reports dispatched within 12 hours!");
      setBBookLabTestsImage(branding.bookLabTestsImage || "");
      setBBookLabTestsBgColor(branding.bookLabTestsBgColor || "bg-purple-50 text-purple-600");
      setBExtraServices(branding.extraServices || []);
      setBAppGlobalBgImage(branding.appGlobalBgImage || "");
      setBEnableAboutUsPage(branding.enableAboutUsPage !== false);
      setBAboutUsPageTitle(branding.aboutUsPageTitle || "");
      setBAboutUsPageText(branding.aboutUsPageText || "");
      setBAboutUsPageImage(branding.aboutUsPageImage || "");
      setBAboutUsFactsTitle(branding.aboutUsFactsTitle || "");
      setBAboutUsFacts(branding.aboutUsFacts || []);
      setBEnableInvestPage(branding.enableInvestPage !== false);
      setBInvestPageTitle(branding.investPageTitle || "");
      setBInvestPageText(branding.investPageText || "");
      setBInvestPageEmail(branding.investPageEmail || "");
      setBInvestPageImage(branding.investPageImage || "");
      setBEnableGalleryPage(branding.enableGalleryPage !== false);
      setBGalleryPageTitle(branding.galleryPageTitle || "");
      setBGalleryAddressTitle(branding.galleryAddressTitle || "");
      setBGalleryAddressText(branding.galleryAddressText || "");
      setBGalleryContactPhone(branding.galleryContactPhone || "");
      setBGalleryTimingText(branding.galleryTimingText || "");
      setBGalleryBannerImage(branding.galleryBannerImage || "");
      setBGalleryImages(branding.galleryImages || []);
      setBAppGlobalBgColor(branding.appGlobalBgColor || "bg-slate-50");
      setBVerifyDeliveryTitle(branding.verifyDeliveryTitle || "Verify Delivery Availability");
      setBVerifyDeliveryDesc(branding.verifyDeliveryDesc || "Enter your area pincode to check service availability & estimated dispatch durations.");
      setBVerifyDeliveryBgUrl(branding.verifyDeliveryBgUrl || "");
      setBDeliveryLocations(branding.deliveryLocations || []);
      setBIsPremiumClubEnabled(branding.isPremiumClubEnabled !== undefined ? branding.isPremiumClubEnabled : true);
      setBEnableExpertDoctor(branding.enableExpertDoctor !== false);
      setBEnableBookLabTests(branding.enableBookLabTests !== false);
      setBEnableVerifyDelivery(branding.enableVerifyDelivery !== false);
      setBEnableCategories(branding.enableCategories !== false);
      setBEnableTopSelling(branding.enableTopSelling !== false);
      setBEnableRefills(branding.enableRefills !== false);
      setBEnableTrustFeatures(branding.enableTrustFeatures !== false);
      setBEnableWhatsappOrder(branding.enableWhatsappOrder !== false);
      setBWhatsappNumber(branding.whatsappNumber || "");
      setBPremiumClubTitle(branding.premiumClubTitle || "SONU PREMIUM CLUB");
      setBPremiumClubSlogan(branding.premiumClubSlogan || "Refer your friends & receive direct cashback to your wallet!");
      setBPremiumClubDescription(branding.premiumClubDescription || "Earn 5% reward points on every order. Plus, copy the code REFERRAL50 inside the account tab to add ₹50 cashback instantly to your wallet. Use your points during checkout for super discounts!");
      setBCustomCategories(branding.customCategories || []);
      setBClinicAddress(branding.clinicAddress || "Sector 4, Nehru Enclave, New Delhi, 110019");
      setBClinicLocationUrl(branding.clinicLocationUrl || "https://maps.google.com");
      setBEnableExpertDoctor(branding.enableExpertDoctor !== false);
      setBEnableBookLabTests(branding.enableBookLabTests !== false);
      setBEnableVerifyDelivery(branding.enableVerifyDelivery !== false);
      setBEnableCategories(branding.enableCategories !== false);
      setBEnableTopSelling(branding.enableTopSelling !== false);
      setBEnableRefills(branding.enableRefills !== false);
      setBEnableTrustFeatures(branding.enableTrustFeatures !== false);
    }
  }, [branding]);

  useEffect(() => {
    if (isDevModeActive) {
      // Load files list
      fetch('/api/admin/troubleshoot/files', {
        headers: {
          'x-admin-pin': activeAdminPin
        }
      })
      .then(res => {
        if (!res.ok) throw new Error("Could not authenticate developer panel");
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setDevFiles(data.files);
          setDevError("");
          if (data.files.length > 0) {
            setSelectedDevFile(data.files[0]);
          }
        } else {
          setDevError(data.error || "Failed to load files.");
        }
      })
      .catch(err => {
        setDevError(err.message || "Unauthorized access.");
      });
    }
  }, [isDevModeActive, activeAdminPin]);

  useEffect(() => {
    if (isDevModeActive && selectedDevFile) {
      setIsLoadingDevFile(true);
      setDevFileContent("");
      setEditingDevContent("");
      setDevError("");
      setHighlightedIssueLine(null);
      fetch(`/api/admin/troubleshoot/file?path=${encodeURIComponent(selectedDevFile)}`, {
        headers: {
          'x-admin-pin': activeAdminPin
        }
      })
      .then(res => {
        if (!res.ok) throw new Error("Could not read file from database server");
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setDevFileContent(data.content);
          setEditingDevContent(data.content);
        } else {
          setDevError(data.error || "Failed to load file content.");
        }
      })
      .catch(err => {
        setDevError(err.message || "Failed to load file.");
      })
      .finally(() => {
        setIsLoadingDevFile(false);
      });
    }
  }, [selectedDevFile, isDevModeActive, activeAdminPin]);

  const handleSaveDevFile = async () => {
    if (!selectedDevFile) return;
    setIsSavingDevFile(true);
    setDevSaveSuccess("");
    setDevError("");
    try {
      const res = await fetch('/api/admin/troubleshoot/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': activeAdminPin
        },
        body: JSON.stringify({
          path: selectedDevFile,
          content: editingDevContent
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDevFileContent(editingDevContent);
        setDevSaveSuccess("🎉 File saved successfully! The app will live-reload automatically.");
        setIsEditingDevFile(false);
        setTimeout(() => setDevSaveSuccess(""), 5000);
      } else {
        setDevError(data.error || "Failed to save file.");
      }
    } catch (err: any) {
      setDevError(err.message || "An error occurred while saving the file.");
    } finally {
      setIsSavingDevFile(false);
    }
  };

  const handleSendDevChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasInput = devChatInput.trim();
    if (!hasInput && !devUploadedImage || isDevChatLoading) return;

    const userMsg = {
      id: Math.random().toString(),
      sender: 'user' as const,
      text: hasInput || "Please make changes based on this uploaded screenshot reference.",
      image: devUploadedImage || undefined
    };

    setDevChatMessages(prev => [...prev, userMsg]);
    setDevChatInput("");
    setDevUploadedImage(null);
    setIsDevChatLoading(true);
    setProposedCode("");
    setApplyProposedSuccess("");

    try {
      const response = await fetch('/api/admin/dev-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': activeAdminPin
        },
        body: JSON.stringify({
          messages: [...devChatMessages, userMsg],
          filePath: selectedDevFile || null,
          fileContent: devFileContent || null,
          scannerIssues: devIssues || []
        })
      });
      const data = await response.json();
      if (data.success) {
        setDevChatMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'assistant' as const,
          text: data.explanation
        }]);
        if (data.updatedCode) {
          setProposedCode(data.updatedCode);
        }
      } else {
        setDevChatMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'assistant' as const,
          text: `❌ **Failed to generate response:**\n\n${data.explanation}`
        }]);
      }
    } catch (err: any) {
      setDevChatMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'assistant' as const,
        text: `⚠️ **Connection Error:**\n\nUnable to reach AI developer server. Details: ${err.message || 'Unknown error'}`
      }]);
    } finally {
      setIsDevChatLoading(false);
    }
  };

  const handleApplyProposedCode = async () => {
    if (!selectedDevFile || !proposedCode) return;
    setIsApplyingProposedCode(true);
    setApplyProposedSuccess("");
    try {
      const res = await fetch('/api/admin/troubleshoot/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': activeAdminPin
        },
        body: JSON.stringify({
          path: selectedDevFile,
          content: proposedCode
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDevFileContent(proposedCode);
        setApplyProposedSuccess("🎉 Real AI changes applied successfully! The web server has refreshed.");
        setProposedCode("");
        setTimeout(() => setApplyProposedSuccess(""), 5000);
      } else {
        setDevError(data.error || "Failed to save file.");
      }
    } catch (err: any) {
      setDevError(err.message || "An error occurred while saving the file.");
    } finally {
      setIsApplyingProposedCode(false);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBranding(true);
    try {
      const res = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: bAppName,
          appLogo: bAppLogo,
          heroTitle: bHeroTitle,
          heroSlogan: bHeroSlogan,
          heroImageUrl: bHeroImageUrl,
          supportPhone: bSupportPhone,
          supportEmail: bSupportEmail,
          primaryColorHex: bPrimaryColorHex,
          aboutUsText: bAboutUsText,
          bannerOfferText: bBannerOfferText,
          aiAssistantName: bAiAssistantName,
          opsPanelTitle: bOpsPanelTitle,
          customLogoUrl: bCustomLogoUrl,
          customLogoSize: bCustomLogoSize,
          brandBio: bBrandBio,
          mobileNavTitle: bMobileNavTitle,
          categoryImages: bCategoryImages,
          expertDoctorTitle: bExpertDoctorTitle,
          expertDoctorDesc: bExpertDoctorDesc,
          expertDoctorPrice: bExpertDoctorPrice,
          expertDoctorImage: bExpertDoctorImage,
          expertDoctorBgColor: bExpertDoctorBgColor,
          bookLabTestsTitle: bBookLabTestsTitle,
          bookLabTestsDesc: bBookLabTestsDesc,
          bookLabTestsDelivery: bBookLabTestsDelivery,
          bookLabTestsImage: bBookLabTestsImage,
          bookLabTestsBgColor: bBookLabTestsBgColor,
          extraServices: bExtraServices,
          appGlobalBgImage: bAppGlobalBgImage,
          appGlobalBgColor: bAppGlobalBgColor,
          verifyDeliveryTitle: bVerifyDeliveryTitle,
          verifyDeliveryDesc: bVerifyDeliveryDesc,
          verifyDeliveryBgUrl: bVerifyDeliveryBgUrl,
          deliveryLocations: bDeliveryLocations,
          isPremiumClubEnabled: bIsPremiumClubEnabled,
          enableCategories: bEnableCategories,
          enableTopSelling: bEnableTopSelling,
          enableRefills: bEnableRefills,
          enableTrustFeatures: bEnableTrustFeatures,
          enableWhatsappOrder: bEnableWhatsappOrder,
          whatsappNumber: bWhatsappNumber,
          premiumClubTitle: bPremiumClubTitle,
          premiumClubSlogan: bPremiumClubSlogan,
          premiumClubDescription: bPremiumClubDescription,
          customCategories: bCustomCategories,
          clinicAddress: bClinicAddress,
          clinicLocationUrl: bClinicLocationUrl,
          enableExpertDoctor: bEnableExpertDoctor,
          enableBookLabTests: bEnableBookLabTests,
          enableVerifyDelivery: bEnableVerifyDelivery,
          enableAboutUsPage: bEnableAboutUsPage,
          aboutUsPageTitle: bAboutUsPageTitle,
          aboutUsPageText: bAboutUsPageText,
          aboutUsPageImage: bAboutUsPageImage,
          aboutUsFactsTitle: bAboutUsFactsTitle,
          aboutUsFacts: bAboutUsFacts,
          enableInvestPage: bEnableInvestPage,
          investPageTitle: bInvestPageTitle,
          investPageText: bInvestPageText,
          investPageEmail: bInvestPageEmail,
          investPageImage: bInvestPageImage,
          enableGalleryPage: bEnableGalleryPage,
          galleryPageTitle: bGalleryPageTitle,
          galleryAddressTitle: bGalleryAddressTitle,
          galleryAddressText: bGalleryAddressText,
          galleryContactPhone: bGalleryContactPhone,
          galleryTimingText: bGalleryTimingText,
          galleryBannerImage: bGalleryBannerImage,
          galleryImages: bGalleryImages
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("✨ Dynamic Site Branding has been saved and is now live across the website!");
        onRefreshAllData();
      } else {
        alert("Failed to save branding: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving branding to the server.");
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleSaveCategories = async () => {
    setIsSavingCategories(true);
    try {
      const res = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...branding,
          customCategories: bCustomCategories,
          categoryImages: bCategoryImages
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("✨ Medicine Categories and Category Images have been successfully updated and are now live!");
        onRefreshAllData();
      } else {
        alert("Failed to save categories: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving categories to the server.");
    } finally {
      setIsSavingCategories(false);
    }
  };

  // Editing existing products state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [epName, setEpName] = useState("");
  const [epBrand, setEpBrand] = useState("");
  const [epCategory, setEpCategory] = useState("");
  const [epPrice, setEpPrice] = useState("");
  const [epMrp, setEpMrp] = useState("");
  const [epStock, setEpStock] = useState("");
  const [epComposition, setEpComposition] = useState("");
  const [epImage, setEpImage] = useState("");
  const [epRxRequired, setEpRxRequired] = useState(false);
  const [epManufacturer, setEpManufacturer] = useState("");
  const [epDosage, setEpDosage] = useState("");
  const [epHowToUse, setEpHowToUse] = useState("");
  const [epUses, setEpUses] = useState("");
  const [epSideEffects, setEpSideEffects] = useState("");
  const [epWarnings, setEpWarnings] = useState("");
  const [isSavingProductEdit, setIsSavingProductEdit] = useState(false);

  const startEditingProduct = (p: Product) => {
    setEditingProduct(p);
    setEpName(p.name);
    setEpBrand(p.brand || "");
    setEpCategory(p.category);
    setEpPrice(p.price.toString());
    setEpMrp((p.mrp || p.price).toString());
    setEpStock(p.stock.toString());
    setEpComposition(p.composition || "");
    setEpImage(p.image);
    setEpRxRequired(p.prescriptionRequired || false);
    setEpManufacturer(p.manufacturer || "");
    setEpDosage(p.dosage || "");
    setEpHowToUse(p.howToUse || "");
    setEpUses(Array.isArray(p.uses) ? p.uses.join(', ') : "");
    setEpSideEffects(Array.isArray(p.sideEffects) ? p.sideEffects.join(', ') : "");
    setEpWarnings(Array.isArray(p.warnings) ? p.warnings.join(', ') : "");
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingProductEdit(true);
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: epName,
          brand: epBrand,
          category: epCategory,
          price: Number(epPrice),
          mrp: Number(epMrp),
          stock: Number(epStock),
          prescriptionRequired: epRxRequired,
          image: epImage,
          manufacturer: epManufacturer,
          composition: epComposition,
          dosage: epDosage,
          howToUse: epHowToUse,
          uses: epUses,
          sideEffects: epSideEffects,
          warnings: epWarnings
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("✨ Medicine updated successfully!");
        setEditingProduct(null);
        onRefreshAllData();
      } else {
        alert("Failed to save: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error saving medicine changes.");
    } finally {
      setIsSavingProductEdit(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`⚠️ Are you absolutely sure you want to delete '${name}' from the pharmacy database? This action is irreversible.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert(`🗑️ '${name}' has been deleted successfully!`);
        onRefreshAllData();
      } else {
        alert("Failed to delete: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting product.");
    }
  };
  
  // States for verification modals
  const [reviewingRx, setReviewingRx] = useState<Prescription | null>(null);
  const [doctorName, setDoctorName] = useState("Dr. Alok Verma, B.Pharm");
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");

  // Product Creation States
  const [newProdName, setNewProdName] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdMrp, setNewProdMrp] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("prescription");
  const [newProdRxRequired, setNewProdRxRequired] = useState(false);
  const [newProdComposition, setNewProdComposition] = useState("");
  const [newProdUses, setNewProdUses] = useState("");
  const [newProdDosage, setNewProdDosage] = useState("");
  const [newProdHowToUse, setNewProdHowToUse] = useState("");
  const [newProdSideEffects, setNewProdSideEffects] = useState("");
  const [newProdWarnings, setNewProdWarnings] = useState("");
  const [newProdStorage, setNewProdStorage] = useState("");
  const [newProdStock, setNewProdStock] = useState("100");
  const [newProdManufacturer, setNewProdManufacturer] = useState("");
  const [newProdExpiry, setNewProdExpiry] = useState("2028-12-31");
  const [newProdImage, setNewProdImage] = useState<string | null>(null);
  const [newProdImageName, setNewProdImageName] = useState("");
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProdImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice.trim() || !newProdBrand.trim()) {
      alert("Please provide at least Name, Brand and Selling Price.");
      return;
    }

    setIsSubmittingProd(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          brand: newProdBrand,
          price: Number(newProdPrice),
          mrp: Number(newProdMrp) || Number(newProdPrice),
          category: newProdCategory,
          prescriptionRequired: newProdRxRequired,
          composition: newProdComposition,
          uses: newProdUses, 
          dosage: newProdDosage,
          howToUse: newProdHowToUse,
          sideEffects: newProdSideEffects,
          warnings: newProdWarnings,
          storage: newProdStorage,
          stock: Number(newProdStock),
          manufacturer: newProdManufacturer,
          expiry: newProdExpiry,
          image: newProdImage
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`🎉 Success! '${data.product.name}' has been added to the ${(branding?.appName || "Basanti Medical Store")} database catalog.`);
        // Reset state
        setNewProdName("");
        setNewProdBrand("");
        setNewProdPrice("");
        setNewProdMrp("");
        setNewProdCategory("prescription");
        setNewProdRxRequired(false);
        setNewProdComposition("");
        setNewProdUses("");
        setNewProdDosage("");
        setNewProdHowToUse("");
        setNewProdSideEffects("");
        setNewProdWarnings("");
        setNewProdStorage("");
        setNewProdStock("100");
        setNewProdManufacturer("");
        setNewProdExpiry("2028-12-31");
        setNewProdImage(null);
        setNewProdImageName("");
        
        // Sync parent states
        onRefreshAllData();
        document.getElementById("inventory")?.scrollIntoView({ behavior: "smooth" });
      } else {
        alert("Failed to add product: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting the pharmacy database.");
    } finally {
      setIsSubmittingProd(false);
    }
  };

  // Calculate high-level stats
  const totalRevenue = orders.reduce((sum, o) => o.status !== OrderStatus.CANCELLED ? sum + o.total : sum, 0);
  const pendingRxCount = prescriptions.filter(p => p.status === PrescriptionStatus.PENDING).length;
  const lowStockCount = products.filter(p => p.stock < 100).length;

  const handleStockSubmit = (productId: string) => {
    const val = Number(stockInput[productId]);
    if (!isNaN(val) && val >= 0) {
      onUpdateStock(productId, val);
      alert("Stock successfully updated!");
    }
  };

  const handleApproveRx = (rxId: string) => {
    onReviewPrescription(
      rxId, 
      PrescriptionStatus.VERIFIED, 
      "", 
      doctorName, 
      selectedMeds.length > 0 ? selectedMeds : ["Amoxycillin 500mg"]
    );
    setReviewingRx(null);
    setSelectedMeds([]);
    alert("Prescription marked as VERIFIED. Order is unlocked for user payment.");
  };

  const handleRejectRx = (rxId: string) => {
    if (!rejectionReason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }
    onReviewPrescription(rxId, PrescriptionStatus.REJECTED, rejectionReason);
    setReviewingRx(null);
    setRejectionReason("");
    alert("Prescription REJECTED. Notification sent to customer.");
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Admin Title Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-5 px-4 sm:py-8 sm:px-6 shadow-md rounded-b-2xl sm:rounded-b-3xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-blue-600 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full text-white">
              Administrator Platform
            </span>
            <button 
              onClick={() => setShowSuperAdmin(!showSuperAdmin)}
              className="ml-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full transition-colors cursor-pointer"
            >
              {showSuperAdmin ? "Return to Dashboard" : "Open Super Admin Config"}
            </button>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" /> {branding?.opsPanelTitle || "Partha Pharmacist & Operations Hub"}
            </h1>
            <p className="text-[11px] sm:text-xs text-blue-200 mt-0.5 sm:mt-1 leading-normal">
              Verify legal prescriptions, manage warehouse stock levels, dispatch customer orders, and trace revenue.
            </p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 flex-wrap">
            <button 
              onClick={() => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all bg-blue-800 hover:bg-blue-700 text-blue-100 whitespace-nowrap relative"
            >
              Sales Reports
            </button>
            <button 
              onClick={() => document.getElementById('lab-tests')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all bg-blue-800 hover:bg-blue-700 text-green-300 whitespace-nowrap relative shadow-md"
            >
              <Activity className="w-3.5 h-3.5" /> Lab Tests Catalog
            </button>
            <button 
              onClick={() => document.getElementById('prescriptions')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all bg-blue-800 hover:bg-blue-700 text-blue-100 whitespace-nowrap relative"
            >
              Rx Verification
              {pendingRxCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-[9px] text-white w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {pendingRxCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => document.getElementById('enterprise')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all bg-indigo-800 hover:bg-indigo-700 text-indigo-100 whitespace-nowrap relative shadow-md"
            >
              <Building className="w-3.5 h-3.5" /> Enterprise Modules
            </button>
            <button 
              onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all bg-blue-800 hover:bg-blue-700 text-blue-100 whitespace-nowrap relative"
            >
              Stock Control
              {lowStockCount > 0 && (
                <span className="ml-1 bg-amber-500 text-[9px] text-black font-extrabold px-1.5 py-0.2 rounded">ALERT</span>
              )}
            </button>
            <button 
              onClick={() => document.getElementById('orders')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all bg-blue-800 hover:bg-blue-700 text-blue-100 whitespace-nowrap relative"
            >
              Orders Desk
            </button>
            <button 
              onClick={() => document.getElementById('appointments')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all bg-blue-800 hover:bg-blue-700 text-blue-100 whitespace-nowrap relative"
            >
              Appointments
              {appointments && appointments.filter(a => a.status === 'PENDING').length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {appointments.filter(a => a.status === 'PENDING').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all bg-blue-800 hover:bg-blue-700 text-blue-100 whitespace-nowrap relative"
            >
              <PlusCircle className="w-3 h-3 text-blue-400" /> Doctors
            </button>
            <button 
              onClick={() => document.getElementById('add-product')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all bg-blue-800 hover:bg-blue-700 text-blue-100 whitespace-nowrap relative"
            >
              <PlusCircle className="w-3 h-3 text-green-400" /> Add Product
            </button>

            <button 
              onClick={() => document.getElementById('admin-categories')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all bg-teal-800 hover:bg-teal-700 text-teal-100 whitespace-nowrap relative shadow-md"
            >
              <Layers className="w-3 h-3 text-green-300" /> Medicine Categories
            </button>

            <button 
              onClick={() => document.getElementById('branding')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all bg-blue-800 hover:bg-blue-700 text-blue-100 whitespace-nowrap relative"
            >
              <Sparkles className="w-3 h-3 text-yellow-400" /> Edit Branding & Content
            </button>
            <button 
              onClick={() => document.getElementById('payment-settings')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all bg-blue-800 hover:bg-blue-700 text-blue-100 whitespace-nowrap relative"
            >
              <Settings className="w-3 h-3 text-orange-400" /> Payment Gateway
              {orders.filter(o => o.paymentStatus === "PENDING_VERIFICATION").length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-[9px] text-slate-950 w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold animate-bounce">
                  {orders.filter(o => o.paymentStatus === "PENDING_VERIFICATION").length}
                </span>
              )}
            </button>
            <button 
              onClick={() => document.getElementById('advertisements')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all bg-emerald-800 hover:bg-emerald-700 text-emerald-100 whitespace-nowrap relative"
            >
              <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" /> Widescreen Ad Desk
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 mt-4 sm:mt-8 space-y-6 sm:space-y-12 pb-16 sm:pb-24">
        {showSuperAdmin ? (
          <SuperAdminSettings branding={branding} onRefresh={onRefreshAllData} />
        ) : (
          <>
        
        {/* Hidden Developer Diagnostics Panel */}
        {isDevModeActive && (
          <div className="bg-slate-950 text-slate-100 p-4 sm:p-8 rounded-3xl border border-slate-850 shadow-2xl mb-8 space-y-6 animate-fade-in font-mono relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/60 pb-5 gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> DEVELOPER MODE ACTIVE
                  </span>
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
                    v2.5
                  </span>
                </div>
                <h2 className="text-xl font-black text-white mt-2 flex items-center gap-2 tracking-tight">
                  <Cpu className="w-5 h-5 text-indigo-400" /> Developer Code Inspector & Live Editor
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
                  Inspect directory files, check syntax health using the integrated bug scanner, and perform real-time code modifications directly on the server.
                </p>
              </div>
              <button
                onClick={() => setIsDevModeActive(false)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg active:scale-95"
              >
                Close Control Panel
              </button>
            </div>

            {devError && (
              <div className="bg-red-950/40 border border-red-900/50 text-red-400 text-xs p-4 rounded-2xl relative z-10">
                ⚠️ {devError}
              </div>
            )}

            {!devError && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 animate-fade-in">
                {/* Column 1: File List & Quality Stats */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      📁 File Directory
                    </h3>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {devFiles.map(file => (
                        <button
                          key={file}
                          onClick={() => setSelectedDevFile(file)}
                          className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-all cursor-pointer truncate flex items-center gap-2 ${
                            selectedDevFile === file 
                              ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30' 
                              : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-850'
                          }`}
                        >
                          <span className="text-slate-400">📄</span>
                          <span>{file}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Code Health Index */}
                  {selectedDevFile && (
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        📊 Code Quality Index
                      </h4>
                      {(() => {
                        const errorsCount = devIssues.filter(i => i.severity === 'error').length;
                        const warningsCount = devIssues.filter(i => i.severity === 'warning').length;
                        const score = Math.max(0, 100 - errorsCount * 15 - warningsCount * 5);
                        
                        let scoreColor = "text-green-400";
                        let scoreBg = "bg-green-500/10 border-green-500/20";
                        let statusText = "Excellent & Safe";
                        
                        if (score < 70) {
                          scoreColor = "text-red-400";
                          scoreBg = "bg-red-500/10 border-red-500/20";
                          statusText = "Action Required (Critical)";
                        } else if (score < 90) {
                          scoreColor = "text-yellow-400";
                          scoreBg = "bg-yellow-500/10 border-yellow-500/20";
                          statusText = "Warnings Detected";
                        }

                        return (
                          <div className="space-y-3 font-sans">
                            <div className={`p-3 rounded-xl border ${scoreBg} flex flex-col items-center justify-center text-center gap-1`}>
                              <span className="text-xs text-slate-400 font-bold">Health Score</span>
                              <span className={`text-3xl font-black font-mono ${scoreColor}`}>{score}%</span>
                              <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-80 mt-1">
                                {statusText}
                              </span>
                            </div>

                            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-center">
                              <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                                <span className="text-red-400 block text-xs font-black font-mono">{errorsCount}</span>
                                <span className="text-slate-400">Errors</span>
                              </div>
                              <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                                <span className="text-yellow-400 block text-xs font-black font-mono">{warningsCount}</span>
                                <span className="text-slate-400">Warnings</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Column 2: Code Viewer / Editor / AI Developer */}
                <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
                  {/* Mode Toggles: AI Developer vs Manual Code Inspector */}
                  <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-850 gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDevMiddleTab('ai')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        devMiddleTab === 'ai'
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI Auto-Coder Pro
                    </button>
                    <button
                      type="button"
                      onClick={() => setDevMiddleTab('inspect')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        devMiddleTab === 'inspect'
                          ? 'bg-slate-800 text-slate-100'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" /> File Inspector
                    </button>
                  </div>

                  {devMiddleTab === 'ai' ? (
                    <div className="bg-slate-900 rounded-3xl border border-slate-850 p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4 min-h-[500px]">
                      {/* Active File Context Alert */}
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2.5 h-2.5 rounded-full ${selectedDevFile ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                          <span className="text-slate-400">Context File:</span>
                          <strong className="text-white truncate">{selectedDevFile || 'No file selected (Select one on left 📁)'}</strong>
                        </div>
                        {selectedDevFile && (
                          <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-lg font-bold border border-slate-800">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Chat Messages Log */}
                      <div className="flex-1 overflow-y-auto max-h-[340px] space-y-3.5 pr-1 select-text scrollbar-thin">
                        {devChatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                          >
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 px-1">
                              {msg.sender === 'user' ? 'Client (You)' : 'Senior AI Developer'}
                            </span>
                            
                            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 border ${
                              msg.sender === 'user'
                                ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none'
                                : 'bg-slate-950 text-slate-200 border-slate-850 rounded-tl-none font-sans'
                            }`}>
                              {msg.image && (
                                <div className="mb-2 max-w-full overflow-hidden rounded-lg bg-black/30 p-1 border border-slate-800">
                                  <img
                                    src={msg.image}
                                    alt="Reference Layout"
                                    className="max-h-40 object-contain w-full rounded-md"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                              {msg.text.split('\n\n').map((paragraph, pIdx) => {
                                if (paragraph.startsWith('### ')) {
                                  return <h4 key={pIdx} className="text-sm font-black text-white mt-1 mb-1 tracking-tight">{paragraph.replace('### ', '')}</h4>;
                                }
                                if (paragraph.startsWith('* ') || paragraph.startsWith('- ') || /^\d+\./.test(paragraph)) {
                                  return (
                                    <ul key={pIdx} className="list-disc pl-4 space-y-1">
                                      {paragraph.split('\n').map((li, liIdx) => (
                                        <li key={liIdx}>{li.replace(/^[\*\-\d\.\s]+/, '')}</li>
                                      ))}
                                    </ul>
                                  );
                                }
                                const boldRegex = /\*\*(.*?)\*\*/g;
                                if (boldRegex.test(paragraph)) {
                                  const parts = paragraph.split(boldRegex);
                                  return (
                                    <p key={pIdx}>
                                      {parts.map((part, partIdx) => partIdx % 2 === 1 ? <strong key={partIdx} className="text-white font-black">{part}</strong> : part)}
                                    </p>
                                  );
                                }
                                return <p key={pIdx}>{paragraph}</p>;
                              })}
                            </div>
                          </div>
                        ))}

                        {isDevChatLoading && (
                          <div className="flex flex-col items-start max-w-[85%] animate-pulse">
                            <span className="text-[10px] text-slate-500 font-bold uppercase mb-1 px-1">Senior AI Developer</span>
                            <div className="bg-slate-950 text-slate-300 border border-slate-850 p-4 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                              <span className="animate-spin text-blue-500">🔄</span> AI is writing server-side code...
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Proposed Changes Activation Deck */}
                      {proposedCode && (
                        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/30 p-4 rounded-2xl space-y-3 relative overflow-hidden animate-fade-in shadow-xl">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                              Proposed Code Ready for {selectedDevFile}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-300 font-sans leading-normal">
                            The AI Developer has completed the code rewrite. Click apply to overwrite <strong>{selectedDevFile}</strong> on the live server instantly.
                          </p>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              type="button"
                              onClick={handleApplyProposedCode}
                              disabled={isApplyingProposedCode}
                              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs py-2 px-4 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {isApplyingProposedCode ? (
                                <>
                                  <span className="animate-spin">🔄</span>
                                  Applying Code...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  Apply Changes to Live Website
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDevContent(proposedCode);
                                setIsEditingDevFile(true);
                                setDevMiddleTab('inspect');
                              }}
                              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer"
                            >
                              Review Code Diff
                            </button>
                          </div>
                        </div>
                      )}

                      {applyProposedSuccess && (
                        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs p-3.5 rounded-2xl font-bold animate-pulse font-sans">
                          {applyProposedSuccess}
                        </div>
                      )}

                      {/* Input Actions Deck */}
                      <form onSubmit={handleSendDevChat} className="border-t border-slate-800/60 pt-3.5 space-y-3">
                        {devUploadedImage && (
                          <div className="relative inline-block bg-slate-950 p-1 rounded-lg border border-slate-850">
                            <img
                              src={devUploadedImage}
                              alt="Attachment preview"
                              className="h-14 w-14 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => setDevUploadedImage(null)}
                              className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-[8px] font-black"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2 items-center">
                          {/* Image Attachment Input */}
                          <input
                            type="file"
                            accept="image/*"
                            id="dev-image-upload"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setDevUploadedImage(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('dev-image-upload')?.click()}
                            className={`p-3 rounded-xl border transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                              devUploadedImage 
                                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' 
                                : 'bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border-slate-850'
                            }`}
                            title="Upload code screenshot or reference image"
                          >
                            <span className="text-base">📸</span>
                          </button>

                          <input
                            type="text"
                            value={devChatInput}
                            onChange={(e) => setDevChatInput(e.target.value)}
                            disabled={isDevChatLoading}
                            placeholder={selectedDevFile ? `Ask AI to modify ${selectedDevFile}...` : "Choose a file, then ask AI to add features..."}
                            className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans placeholder-slate-500"
                          />

                          <button
                            type="submit"
                            disabled={isDevChatLoading || (!devChatInput.trim() && !devUploadedImage)}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white p-3 rounded-xl transition-all font-bold flex items-center justify-center cursor-pointer shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-sans">
                          <span>Real AI Connected to server container</span>
                          <span>Supports Hindi, Hinglish & English</span>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900 p-4 rounded-3xl border border-slate-850">
                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                          <span className="text-xs text-slate-300 font-semibold truncate flex items-center gap-1.5">
                            <span className="text-green-400 animate-pulse">●</span> File: <strong className="text-white">{selectedDevFile}</strong>
                          </span>
                          {devSaveSuccess && (
                            <span className="text-[10px] text-green-400 font-bold animate-pulse mt-0.5">
                              {devSaveSuccess}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 self-start sm:self-auto w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={() => setIsEditingDevFile(false)}
                            className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-colors cursor-pointer ${!isEditingDevFile ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                          >
                            🔍 Inspect
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingDevFile(true);
                              setEditingDevContent(devFileContent);
                            }}
                            className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-colors cursor-pointer ${isEditingDevFile ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                          >
                            📝 Live Patch
                          </button>
                        </div>
                      </div>

                  {isLoadingDevFile ? (
                    <div className="bg-slate-900 h-96 rounded-3xl border border-slate-850 flex items-center justify-center text-xs text-slate-400">
                      <span className="animate-spin text-blue-500 mr-2">🔄</span> Fetching code structure from server...
                    </div>
                  ) : isEditingDevFile ? (
                    <div className="space-y-3">
                      <div className="bg-slate-950 rounded-3xl border border-slate-850 overflow-hidden p-4">
                        <textarea
                          value={editingDevContent}
                          onChange={(e) => setEditingDevContent(e.target.value)}
                          className="w-full h-96 bg-transparent text-slate-200 font-mono text-xs leading-relaxed focus:outline-none resize-y select-text p-1"
                          placeholder="Type or modify source code here..."
                          spellCheck={false}
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-slate-900 p-4 rounded-3xl border border-slate-850">
                        <span className="text-[10px] text-yellow-400 font-semibold leading-normal flex items-center gap-1.5 max-w-md font-sans">
                          ⚠️ Warning: Incorrect structures can stop your dev server. Test bracket pairs before clicking patch.
                        </span>
                        <div className="flex gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => {
                              setEditingDevContent(devFileContent);
                              setIsEditingDevFile(false);
                            }}
                            className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs px-3.5 py-2 rounded-xl font-bold cursor-pointer transition-colors"
                          >
                            Reset
                          </button>
                          <button
                            onClick={handleSaveDevFile}
                            disabled={isSavingDevFile}
                            className="bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white text-xs px-4.5 py-2 rounded-xl font-extrabold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                          >
                            {isSavingDevFile ? <>⏳ Patching...</> : <>💾 Save & Apply Live Patch</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search bar inside Inspector Mode */}
                      <div className="flex items-center gap-3 bg-slate-900 border border-slate-850 px-4 py-2.5 rounded-2xl">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Search:</span>
                        <input
                          type="text"
                          placeholder="Enter keyword or method name (e.g., branding, payment)..."
                          value={devSearchQuery}
                          onChange={(e) => setDevSearchQuery(e.target.value)}
                          className="bg-transparent border-none outline-hidden text-xs text-white focus:ring-0 w-full"
                        />
                        {devSearchQuery && (
                          <button 
                            onClick={() => setDevSearchQuery("")}
                            className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="bg-slate-900 rounded-3xl border border-slate-850 overflow-hidden">
                        {/* Code list with filtered matching lines */}
                        <div className="overflow-auto max-h-[420px] text-xs leading-relaxed p-4 font-mono select-text text-slate-300">
                          {(() => {
                            const lines = devFileContent.split("\n");
                            const filteredLines = lines.map((line, idx) => ({ text: line, num: idx + 1 }));
                            
                            const query = devSearchQuery.toLowerCase().trim();
                            const matches = query 
                              ? filteredLines.filter(l => l.text.toLowerCase().includes(query))
                              : filteredLines;

                            if (matches.length === 0) {
                              return (
                                <div className="text-center text-slate-500 py-12 font-sans">
                                  No matching lines found for "{devSearchQuery}" in this file.
                                </div>
                              );
                            }

                            return (
                              <table className="w-full border-collapse">
                                <tbody>
                                  {matches.map((line) => {
                                    const isMatched = query && line.text.toLowerCase().includes(query);
                                    const issue = devIssues.find(i => i.lineNum === line.num);
                                    const isSelectedIssue = highlightedIssueLine === line.num;
                                    
                                    return (
                                      <React.Fragment key={line.num}>
                                        <tr 
                                          id={`dev-line-${line.num}`}
                                          className={`hover:bg-slate-850 transition-all ${
                                            isSelectedIssue 
                                              ? 'bg-red-950 text-red-100 border-l-4 border-red-500 shadow-lg scale-[1.01]' 
                                              : issue 
                                                ? issue.severity === 'error'
                                                  ? 'bg-red-950/30 text-red-200 border-l-2 border-red-600'
                                                  : 'bg-amber-950/30 text-amber-200 border-l-2 border-amber-600'
                                                : isMatched 
                                                  ? 'bg-blue-950/40 text-blue-100 border-l-2 border-blue-500' 
                                                  : ''
                                          }`}
                                        >
                                          <td className="pr-4 text-right text-slate-600 select-none border-r border-slate-950 w-12 text-[10px] align-top py-1.5 font-bold">
                                            {line.num}
                                          </td>
                                          <td className="pl-4 pr-4 whitespace-pre font-mono py-1.5 text-left select-text break-all relative">
                                            <span className="relative z-10">{line.text}</span>
                                            {issue && (
                                              <span className={`absolute right-4 top-1.5 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                                                issue.severity === 'error' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600 text-black'
                                              }`}>
                                                {issue.severity}
                                              </span>
                                            )}
                                          </td>
                                        </tr>

                                        {/* Dropdown Warning Block right next to the bug line */}
                                        {issue && (
                                          <tr className={`${issue.severity === 'error' ? 'bg-red-950/45' : 'bg-amber-950/45'} border-b border-slate-850`}>
                                            <td className="border-r border-slate-950"></td>
                                            <td className="pl-4 py-2 pr-4 text-[11px] font-sans">
                                              <div className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                                                issue.severity === 'error' 
                                                  ? 'bg-red-900/10 border-red-500/20 text-red-200' 
                                                  : 'bg-amber-900/10 border-amber-500/20 text-amber-200'
                                              }`}>
                                                <span className="text-sm">⚠️</span>
                                                <div className="space-y-1">
                                                  <p className="font-extrabold text-red-400 tracking-tight flex items-center gap-1.5">
                                                    PROBLEM DETECTED:
                                                  </p>
                                                  <p className="font-medium text-slate-300">
                                                    {issue.message}
                                                  </p>
                                                </div>
                                              </div>
                                            </td>
                                          </tr>
                                        )}
                                      </React.Fragment>
                                    );
                                  })}
                                </tbody>
                              </table>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                  </>
                  )}
                </div>

                {/* Column 3: Automated Bug Scanner Logs */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 space-y-4 h-full flex flex-col justify-start">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        🔍 Scanner Logs
                      </h3>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        devIssues.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {devIssues.length} Issues
                      </span>
                    </div>

                    <div className="space-y-2.5 overflow-y-auto max-h-[480px] pr-1">
                      {devIssues.length === 0 ? (
                        <div className="text-center py-10 px-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2 font-sans">
                          <span className="text-3xl">🎉</span>
                          <h5 className="text-xs font-black text-green-400 uppercase tracking-wider">NO BUGS DETECTED</h5>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            All code matches security standards. Fully optimized & operational.
                          </p>
                        </div>
                      ) : (
                        devIssues.map((issue, idx) => (
                          <div 
                            key={idx}
                            onClick={() => jumpToLine(issue.lineNum)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer text-left hover:scale-[1.02] flex flex-col gap-1.5 ${
                              highlightedIssueLine === issue.lineNum
                                ? 'bg-slate-950 border-red-500 shadow-md'
                                : issue.severity === 'error'
                                  ? 'bg-red-950/20 border-red-900/40 hover:border-red-600/50'
                                  : 'bg-amber-950/15 border-amber-900/30 hover:border-amber-600/50'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                issue.severity === 'error' ? 'bg-red-600 text-white' : 'bg-amber-600 text-black'
                              }`}>
                                {issue.severity}
                              </span>
                              <span className="text-[10px] font-bold text-blue-400 hover:underline">
                                Line {issue.lineNum} ➔
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-200 leading-normal font-medium font-sans">
                              {issue.message}
                            </p>
                            <span className="text-[9px] font-bold text-slate-500 mt-0.5 uppercase tracking-wide">
                              Click to jump & fix 🚀
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Section */}
        <div id="analytics" className="w-full bg-white/50 p-6 rounded-3xl border border-slate-200/60 shadow-sm scroll-mt-24">
          <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-gray-400 text-[11px] uppercase font-bold tracking-wider">Total Sales</span>
                    <h3 className="text-2xl font-black text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</h3>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl text-green-600"><ArrowUpRight className="w-5 h-5" /></div>
                </div>
                <div className="text-[11px] text-green-600 font-semibold mt-4">Calculated from settled deliveries</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-gray-400 text-[11px] uppercase font-bold tracking-wider">Volume Orders</span>
                    <h3 className="text-2xl font-black text-gray-900">{orders.length}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><ShoppingBag className="w-5 h-5" /></div>
                </div>
                <div className="text-[11px] text-gray-400 mt-4">Pending checkout & shipping runs</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-gray-400 text-[11px] uppercase font-bold tracking-wider">Unverified Rx</span>
                    <h3 className="text-2xl font-black text-red-600">{pendingRxCount}</h3>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl text-red-600"><Activity className="w-5 h-5" /></div>
                </div>
                <div className="text-[11px] text-red-500 font-semibold mt-4">Requires clinical oversight</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-gray-400 text-[11px] uppercase font-bold tracking-wider">Alert Stock SKU</span>
                    <h3 className="text-2xl font-black text-amber-600">{lowStockCount}</h3>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><AlertTriangle className="w-5 h-5" /></div>
                </div>
                <div className="text-[11px] text-amber-600 font-semibold mt-4">Medicines below 100 count</div>
              </div>
            </div>

            {/* AI Insights */}
            <AiInsights />
            
            {/* Sales Graph & Diagnostics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-1.5"><BarChart className="w-5 h-5 text-blue-600" /> Category Performance Analytics</h3>
                
                <div className="space-y-4 mt-6">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                      <span>Prescription Medicines</span>
                      <span>52% (₹{(totalRevenue * 0.52).toFixed(0)})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '52%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                      <span>OTC Medicines</span>
                      <span>24% (₹{(totalRevenue * 0.24).toFixed(0)})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-green-600 h-full rounded-full" style={{ width: '24%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                      <span>Ayurvedic Wellness</span>
                      <span>14% (₹{(totalRevenue * 0.14).toFixed(0)})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '14%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                      <span>Diagnostic Devices & Care</span>
                      <span>10% (₹{(totalRevenue * 0.1).toFixed(0)})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <h3 className="font-bold text-gray-800 mb-4">🔔 Critical Notifications</h3>
                <div className="space-y-3.5">
                  {pendingRxCount > 0 ? (
                    <div className="bg-red-50 text-red-800 text-xs p-4 rounded-xl flex gap-3">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <strong className="font-bold block">Pharmacist action required!</strong>
                        {pendingRxCount} clinical prescription uploads are waiting for review. Please verify file integrity and match recommended medications.
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 text-green-800 text-xs p-4 rounded-xl flex gap-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <strong className="font-bold block">Clinic database is clear</strong>
                        No pending prescription uploads currently.
                      </div>
                    </div>
                  )}

                  {lowStockCount > 0 && (
                    <div className="bg-amber-50 text-amber-800 text-xs p-4 rounded-xl flex gap-3">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <strong className="font-bold block">Warehouse stock levels running thin</strong>
                        {lowStockCount} medicines have fallen below safety limits. Please trigger reordering or add stock inside the Stock tab.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Verification Tab */}
        <div id="prescriptions" className="w-full bg-white/50 p-6 rounded-3xl border border-slate-200/60 shadow-sm scroll-mt-24">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
            <h2 className="text-lg font-black text-gray-800 mb-6">Prescription Review Panel</h2>
            {prescriptions.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No prescriptions have been uploaded by users yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Rx ID</th>
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Uploaded At</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {prescriptions.map((rx) => (
                      <tr key={rx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-bold text-gray-700">{rx.id}</td>
                        <td className="py-4 px-4 font-medium text-gray-800">{rx.patientName}</td>
                        <td className="py-4 px-4 text-xs text-gray-400">{new Date(rx.uploadedAt).toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            rx.status === PrescriptionStatus.VERIFIED ? 'bg-green-100 text-green-800' :
                            rx.status === PrescriptionStatus.REJECTED ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {rx.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {rx.status === PrescriptionStatus.PENDING ? (
                            <button
                              onClick={() => setReviewingRx(rx)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                            >
                              Examine File
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              {rx.status === PrescriptionStatus.VERIFIED ? `Approved by ${rx.doctorName}` : "Rejected"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Prescription Verification Modal */}
        {reviewingRx && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                <div>
                  <h3 className="font-black text-lg text-gray-900">Clinical Review: {reviewingRx.id}</h3>
                  <p className="text-xs text-gray-400 mt-1">Uploaded by patient: <strong className="font-bold text-gray-700">{reviewingRx.patientName}</strong></p>
                </div>
                <button onClick={() => setReviewingRx(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
              </div>

              {/* AI OCR Actions */}
              <div className="mb-4">
                <button 
                  onClick={async () => {
                     const btn = document.getElementById('ocrBtn');
                     const resultDiv = document.getElementById('ocrResult');
                     if(btn) btn.innerHTML = '<span class="animate-spin mr-2">⏳</span> Analyzing with Gemini AI...';
                     try {
                        const res = await fetch('/api/admin/ai-ocr', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ imageUrl: reviewingRx.fileData || 'simulate' })
                        });
                        const data = await res.json();
                        if(resultDiv) {
                           resultDiv.innerHTML = '<div class="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 mb-4 whitespace-pre-wrap"><strong>AI Analysis:</strong><br/>' + (data.result || 'No result') + '</div>';
                        }
                     } catch(e) {}
                     if(btn) btn.innerHTML = '<span class="mr-1 text-indigo-600">✨</span> Read Prescription with AI';
                  }}
                  id="ocrBtn"
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center w-full transition-colors border border-indigo-300"
                >
                  <span className="mr-1 text-indigo-600">✨</span> Read Prescription with AI
                </button>
                <div id="ocrResult"></div>
              </div>

              {/* Prescription Image/Document Preview */}
              <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-center border-2 border-dashed border-gray-200 mb-6">
                {reviewingRx.fileData ? (
                  <img src={reviewingRx.fileData} alt="Prescription Document" className="max-h-72 object-contain rounded-lg shadow-sm" />
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Pill className="w-12 h-12 mx-auto mb-2" />
                    <span>Clinical document is a simulated PDF attachment.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Approve Form */}
                <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100">
                  <h4 className="font-bold text-green-950 mb-3 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-green-600" /> Approve & Prescribe
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-green-900 uppercase tracking-wider mb-1">Verifying Pharmacist/Doctor</label>
                      <input 
                        type="text" 
                        value={doctorName} 
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="w-full bg-white border border-green-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-green-900 uppercase tracking-wider mb-1">Authorize Recommended Catalog Meds</label>
                      <div className="space-y-2 mt-1">
                        {products.filter(p => p.prescriptionRequired).map(p => (
                          <label key={p.id} className="flex items-center gap-2 text-xs text-gray-700">
                            <input 
                              type="checkbox" 
                              checked={selectedMeds.includes(p.name)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedMeds([...selectedMeds, p.name]);
                                else setSelectedMeds(selectedMeds.filter(m => m !== p.name));
                              }}
                              className="rounded text-green-600 focus:ring-green-500"
                            />
                            {p.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleApproveRx(reviewingRx.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Issue Approval License
                    </button>
                  </div>
                </div>

                {/* Reject Form */}
                <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-red-950 mb-3 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-600" /> Decline Request
                    </h4>
                    <div>
                      <label className="block text-[11px] font-bold text-red-900 uppercase tracking-wider mb-1">Clinical Disqualification Reason</label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Uploaded document is blurred, or doctor signature missing, or prescription is expired."
                        rows={4}
                        className="w-full bg-white border border-red-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleRejectRx(reviewingRx.id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors mt-4 cursor-pointer"
                  >
                    Send Decline Notice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        
        {/* Enterprise Modules */}
        <div id="enterprise" className="w-full bg-slate-50 p-6 rounded-3xl border border-indigo-200 shadow-sm scroll-mt-24">
           <h2 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-2">
             <Building className="w-6 h-6" /> Enterprise Core Operations
           </h2>
           <BranchManager />
           <SupplierManager />
           <DeliveryBoyManager />
           <WarehouseManager />
           <PurchaseOrderManager />
           <SecurityAuditManager />
           <ApiWebhookManager />
           <BackupRestore />
        </div>
        
        {/* Stock Management Tab */}
        <div id="inventory" className="w-full bg-white/50 p-6 rounded-3xl border border-slate-200/60 shadow-sm scroll-mt-24">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
            <h2 className="text-lg font-black text-gray-800 mb-6">Inventory Stock & Alerts</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Medicine Info</th>
                    <th className="py-3 px-4">SKU / Batch</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Replenish stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 flex items-center gap-3">
                        <img src={p.image} alt="" className="w-10 h-10 object-cover rounded-lg" />
                        <div>
                          <p className="font-bold text-gray-800">{p.name}</p>
                          <p className="text-[10px] text-gray-400">{p.manufacturer}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-mono text-xs text-gray-600">{p.sku}</p>
                        <p className="text-[10px] text-gray-400">Batch: {p.batchNumber}</p>
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-700">{p.stock} units</td>
                      <td className="py-4 px-4">
                        {p.stock === 0 ? (
                          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold">OUT OF STOCK</span>
                        ) : p.stock < 100 ? (
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">LOW STOCK</span>
                        ) : (
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-bold">GOOD</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-1.5 justify-end items-center">
                          <input 
                            type="number"
                            placeholder="New qty"
                            value={stockInput[p.id] || ""}
                            onChange={(e) => setStockInput({ ...stockInput, [p.id]: e.target.value })}
                            className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleStockSubmit(p.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg cursor-pointer"
                            title="Update stock count"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => startEditingProduct(p)}
                            className="border border-blue-200 hover:bg-blue-50 text-blue-600 p-1.5 rounded-lg cursor-pointer"
                            title="Edit full medicine specifications"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="border border-red-200 hover:bg-red-50 text-red-500 p-1.5 rounded-lg cursor-pointer"
                            title="Permanently remove medicine from catalog"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Orders Tab */}
        <div id="orders" className="w-full bg-white/50 p-6 rounded-3xl border border-slate-200/60 shadow-sm scroll-mt-24">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
            <h2 className="text-lg font-black text-gray-800 mb-6">Customer Placed Orders Desk</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No orders have been submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-100 rounded-2xl p-5 hover:border-blue-100 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-gray-900">{order.id}</span>
                          <span className="text-xs text-gray-400">| Customer: {order.userName}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Placed: {new Date(order.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800' :
                          order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800' :
                          order.status === OrderStatus.SHIPPED ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>

                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus, `Status updated by Pharmacist to ${e.target.value}.`)}
                          className="border border-gray-200 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={OrderStatus.PROCESSING}>Processing</option>
                          <option value={OrderStatus.PACKED}>Packed & Sealed</option>
                          <option value={OrderStatus.SHIPPED}>Out for Delivery</option>
                          <option value={OrderStatus.DELIVERED}>Delivered</option>
                          <option value={OrderStatus.CANCELLED}>Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Medications</h4>
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs text-gray-700">
                              <span>{item.name} <strong className="font-semibold text-gray-400">x{item.quantity}</strong></span>
                              <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                        <p className="text-gray-400 font-bold uppercase tracking-wider mb-2">Total Breakdown</p>
                        <div className="flex justify-between"><span>Subtotal:</span><span>₹{order.subtotal}</span></div>
                        <div className="flex justify-between text-green-600"><span>Discount:</span><span>-₹{order.discountAmount}</span></div>
                        <div className="flex justify-between"><span>GST (18%):</span><span>₹{order.gst}</span></div>
                        <div className="flex justify-between"><span>Delivery:</span><span>₹{order.deliveryCharge}</span></div>
                        <div className="flex justify-between font-bold border-t pt-1 border-gray-200 text-sm text-gray-900">
                          <span>Total Paid:</span><span>₹{order.total}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">Payment: <strong className="text-gray-700">{order.paymentMethod}</strong></p>
                      </div>
                    </div>

                    {order.paymentMethod === "UPI / Google Pay" && (
                      <div className="mt-4 bg-amber-50/50 border border-amber-100 p-4 rounded-xl space-y-3 text-xs animate-fade-in">
                        <div className="flex items-center gap-2 text-amber-800 font-extrabold text-[11px] uppercase tracking-wider">
                          <CheckCircle className="w-4 h-4 text-amber-600" /> Direct UPI Merchant Payment Verification
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-gray-400 font-medium">Selected UPI App:</span>
                            <p className="font-extrabold text-gray-800 mt-0.5">{order.selectedUpiApp || "GPay"}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">12-Digit Reference / UTR ID:</span>
                            <p className="font-mono font-black text-slate-900 tracking-wider mt-0.5 select-all bg-white py-0.5 px-2 border border-slate-200/50 rounded-md inline-block">{order.utrNumber || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">Payment Status:</span>
                            <p className="mt-0.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide inline-block ${
                                order.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                              }`}>
                                {order.paymentStatus || "PENDING"}
                              </span>
                            </p>
                          </div>
                          {order.paymentConfirmedAt && (
                            <div>
                              <span className="text-gray-400 font-medium">Verified At:</span>
                              <p className="font-medium text-gray-600 mt-0.5">{new Date(order.paymentConfirmedAt).toLocaleString()}</p>
                            </div>
                          )}
                        </div>

                        {order.paymentProofImage && (
                          <div className="pt-2 border-t border-amber-100/60">
                            <span className="text-gray-400 font-medium block mb-1">Attached Receipt Screenshot:</span>
                            <a href={order.paymentProofImage} target="_blank" rel="noreferrer" title="Click to view full image in a new tab">
                              <img src={order.paymentProofImage} alt="User payment receipt" className="max-h-48 rounded-lg border border-slate-200 object-contain bg-white p-1 hover:opacity-90 transition-opacity cursor-zoom-in" />
                            </a>
                          </div>
                        )}

                        {order.paymentStatus === "PENDING_VERIFICATION" && (
                          <div className="pt-3 border-t border-amber-100/60 flex items-center gap-3">
                            <button
                              onClick={async () => {
                                if (confirm(`Approve payment verification for order ${order.id}?`)) {
                                  try {
                                    const res = await fetch(`/api/admin/orders/${order.id}/confirm-payment`, {
                                      method: 'POST'
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                      alert("✨ UPI payment verified! Order status is active and payment is PAID.");
                                      onRefreshAllData();
                                    } else {
                                      alert("Failed to confirm: " + (data.error || "Unknown error"));
                                    }
                                  } catch (err) {
                                    console.error(err);
                                    alert("Error approving payment.");
                                  }
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-4 h-4" /> Approve & Confirm UPI Payment Received
                            </button>
                            <p className="text-[10px] text-gray-400">Match the UTR code: {order.utrNumber} with your business account ledger first before approving.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Product Tab */}
        
        <div id="appointments" className="w-full bg-white/50 p-6 rounded-3xl border border-slate-200/60 shadow-sm scroll-mt-24">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Appointments Hub</h2>
                <p className="text-xs text-slate-500 mt-1">Manage and assign time slots for incoming medical consultations.</p>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">ID & Patient</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">Consultation Type</th>
                      <th className="px-6 py-4">Schedule</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments && appointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium">
                          No appointments found.
                        </td>
                      </tr>
                    ) : (
                      appointments?.map((appt) => (
                        <tr key={appt.id} className={`hover:bg-slate-50 transition-colors ${appt.status === 'COMPLETED' ? 'bg-green-50/50 hover:bg-green-50' : appt.status === 'PENDING' ? 'bg-red-50/30' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="font-mono text-[10px] text-slate-400 mb-1">{appt.id}</div>
                            <div className="font-extrabold text-slate-900">{appt.patientName}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{appt.userId}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-700">{appt.patientPhone}</div>
                            {appt.patientAddress && <div className="text-[10px] text-slate-500 max-w-[150px] truncate mt-1" title={appt.patientAddress}>{appt.patientAddress}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-blue-900">{appt.doctorName}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{appt.doctorSpecialty}</div>
                            <span className="inline-block mt-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                              {appt.mode}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {appt.status === "PENDING" ? (
                              <div className="space-y-2">
                                <input type="date" id={`date-${appt.id}`} className="w-full text-xs px-2 py-1 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500" />
                                <input type="time" id={`time-${appt.id}`} className="w-full text-xs px-2 py-1 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500" />
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="font-bold text-slate-800">{appt.date || "N/A"}</div>
                                <div className="text-slate-500">{appt.timeSlot || "N/A"}</div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {appt.status === 'PENDING' && <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">Pending</span>}
                            {appt.status === 'SCHEDULED' && <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">Scheduled</span>}
                            {appt.status === 'COMPLETED' && <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> Met Doctor</span>}
                            {appt.status === 'CANCELLED' && <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">Cancelled</span>}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {appt.status === 'PENDING' && onUpdateAppointment && (
                              <button 
                                onClick={() => {
                                  const dateVal = (document.getElementById(`date-${appt.id}`) as HTMLInputElement)?.value;
                                  const timeVal = (document.getElementById(`time-${appt.id}`) as HTMLInputElement)?.value;
                                  if (!dateVal || !timeVal) {
                                    alert("Please provide both date and time to approve this appointment.");
                                    return;
                                  }
                                  onUpdateAppointment(appt.id, { date: dateVal, timeSlot: timeVal, status: 'SCHEDULED' });
                                  alert(`Appointment approved! SMS will be sent to ${appt.patientPhone} with details.`);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {appt.status === 'SCHEDULED' && onUpdateAppointment && (
                              <div className="flex justify-end gap-2">
                                <button 
                                  title="Send WhatsApp Message"
                                  onClick={() => {
                                    const text = `Hello ${appt.patientName}, your ${appt.mode} appointment with ${appt.doctorName} is scheduled on ${appt.date} at ${appt.timeSlot}. Please be ready! `;
                                    window.open(`https://wa.me/${appt.patientPhone}?text=${encodeURIComponent(text)}`, '_blank');
                                  }}
                                  className="text-emerald-600 hover:text-emerald-700 p-1.5 bg-emerald-50 rounded-md cursor-pointer transition-colors"
                                >
                                  <Phone className="w-4 h-4" />
                                </button>
                                <button 
                                  title="Mark as Met / Completed"
                                  onClick={() => onUpdateAppointment(appt.id, { status: 'COMPLETED' })}
                                  className="text-green-600 hover:text-green-700 p-1.5 bg-green-50 rounded-md cursor-pointer transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        
        {/* DOCTORS TAB */}
        <div id="doctors" className="w-full bg-white/50 p-6 rounded-3xl border border-slate-200/60 shadow-sm scroll-mt-24">
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-black text-slate-800">Manage Doctors</h2>
                <p className="text-xs text-slate-500 mt-1">Add or remove doctors from the expert consultation list.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Doctor Form */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-sm font-black text-slate-800 mb-4">Add New Doctor</h3>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newDoc = {
                      name: formData.get('name') as string,
                      specialty: formData.get('specialty') as string,
                      experience: parseInt(formData.get('experience') as string),
                      consultationFee: parseInt(formData.get('fee') as string),
                      education: formData.get('education') as string,
                      phone: formData.get('phone') as string,
                      email: formData.get('email') as string,
                      image: newDoctorImage || '',
                      rating: 5.0,
                      availability: ["Monday 10:00 AM - 01:00 PM", "Wednesday 04:00 PM - 07:00 PM"]
                    };
                    try {
                      setIsAddingDoctor(true);
                      const res = await fetch('/api/admin/doctors', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newDoc)
                      });
                      if (res.ok) {
                        alert("✨ Doctor added successfully!");
                        onRefreshAllData();
                        (e.target as HTMLFormElement).reset();
                        setNewDoctorImage("");
                      } else {
                        const errData = await res.json().catch(() => ({}));
                        alert("Failed to add doctor: " + (errData.error || res.statusText || "Unknown Error"));
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Network error: Could not add doctor.");
                    } finally {
                      setIsAddingDoctor(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Name</label>
                      <input name="name" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Specialty</label>
                      <input name="specialty" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Experience (Years)</label>
                      <input name="experience" type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Consultation Fee (₹)</label>
                      <input name="fee" type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Education / Degree</label>
                    <input name="education" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Mobile Number</label>
                      <input name="phone" type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Email (Optional)</label>
                      <input name="email" type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Doctor Image</label>
                    <div className="flex items-center gap-3">
                      <label className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border border-blue-200 transition-colors">
                        Upload from Gallery
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewDoctorImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {newDoctorImage && (
                        <div className="flex items-center gap-2">
                          <img src={newDoctorImage} alt="Preview" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          <button type="button" onClick={() => setNewDoctorImage("")} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <button type="submit" disabled={isAddingDoctor} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm mt-4 disabled:opacity-50">
                    {isAddingDoctor ? "Adding..." : "Add Doctor"}
                  </button>
                </form>
              </div>

              {/* Doctors List */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                <h3 className="text-sm font-black text-slate-800 mb-4">Current Doctors</h3>
                <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-2">
                  {doctors && doctors.length > 0 ? doctors.map(doc => (
                    <div key={doc.id} className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setSelectedDocProfile(doc)}>
                      <div className="flex items-start gap-4">
                        <img src={doc.image} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-sm text-slate-900 truncate">{doc.name}</h4>
                          <p className="text-xs text-slate-500 font-medium mb-1">{doc.specialty}</p>
                          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">₹{doc.consultationFee} Fee</span>
                            {doc.offerTag && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md">{doc.offerTag}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocProfile(doc);
                            }}
                            className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg cursor-pointer transition-colors"
                            title="View/Edit Profile"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-sm text-slate-500 italic">No doctors found.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MEDICINE CATEGORIES MANAGER SECTION */}
        <div id="admin-categories" className="w-full bg-white/50 p-6 rounded-3xl border border-slate-200/60 shadow-sm scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
            <div>
              <span className="bg-teal-50 text-teal-700 border border-teal-100 text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full">
                📦 Inventory Taxonomy
              </span>
              <h2 className="text-xl font-black text-slate-800 tracking-tight mt-1.5 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600 animate-pulse" /> Medicine Categories Manager
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-normal max-w-2xl">
                Add new categories, upload visual banner cover icons, modify existing categories, or delete them. Assign products directly into custom divisions.
              </p>
            </div>
            <div>
              <button
                type="button"
                disabled={isSavingCategories}
                onClick={handleSaveCategories}
                className="bg-teal-600 hover:bg-teal-700 text-white font-black text-xs px-6 py-3 rounded-2xl cursor-pointer transition-all active:scale-95 flex items-center gap-2 shadow-md shadow-teal-100 disabled:bg-teal-300"
              >
                {isSavingCategories ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Category Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Category Panel */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl h-fit space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">Add New Category</h3>
                <p className="text-[11px] text-slate-400">Introduce a brand new medicine category or specialized department.</p>
              </div>

              <div className="space-y-4 text-xs font-bold text-slate-700">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase text-slate-400 tracking-wider">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pain Relief, Heart Care"
                    value={newCatNameInput}
                    onChange={(e) => setNewCatNameInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase text-slate-400 tracking-wider">Cover Image (URL or Upload below)</label>
                  <input
                    type="text"
                    placeholder="Paste visual image URL"
                    value={newCatImageInput}
                    onChange={(e) => setNewCatImageInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="border border-dashed border-slate-300 p-4 rounded-xl space-y-2 bg-white flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                    {newCatImageInput || bCategoryImages[newCatNameInput.toLowerCase().replace(/[^a-z0-9]+/g, '-')] ? (
                      <img
                        src={newCatImageInput || bCategoryImages[newCatNameInput.toLowerCase().replace(/[^a-z0-9]+/g, '-')]}
                        alt=""
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Layers className="w-5 h-5" />
                    )}
                  </div>
                  <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border border-slate-200 whitespace-nowrap transition-colors">
                    Upload Visual Cover
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setNewCatImageInput(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[9px] text-slate-400">Supports PNG, JPG or WEBP formats.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!newCatNameInput.trim()) {
                      alert("Please enter a category name!");
                      return;
                    }
                    const name = newCatNameInput.trim();
                    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    
                    if (CATEGORIES.find(c => c.id === id) || bCustomCategories.find(c => c.id === id)) {
                      alert("This category name or ID already exists!");
                      return;
                    }

                    // Add Custom Category
                    setBCustomCategories(prev => [...prev, { id, name }]);
                    if (newCatImageInput) {
                      setBCategoryImages(prev => ({ ...prev, [id]: newCatImageInput }));
                    }

                    setNewCatNameInput("");
                    setNewCatImageInput("");
                    alert(`🎉 Category "${name}" added to list! Hit the "Save Category Changes" button above to publish live.`);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" /> Add Category to List
                </button>
              </div>
            </div>

            {/* List of Categories Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center bg-slate-50 border border-slate-200/50 p-3 rounded-xl">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Active Divisions ({[...CATEGORIES.slice(1), ...bCustomCategories].length} total)
                </span>
                <span className="text-[10px] text-slate-400 italic">
                  Changes require saving to apply live
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-2">
                {[...CATEGORIES.slice(1), ...bCustomCategories].map((cat) => {
                  const currentImg = bCategoryImages[cat.id] || "";
                  const isCustom = bCustomCategories.some(c => c.id === cat.id);
                  return (
                    <div
                      key={cat.id}
                      className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between gap-4 hover:border-teal-300 transition-all shadow-xs relative"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100/50 shrink-0 overflow-hidden">
                            {currentImg ? (
                              <img src={currentImg} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Pill className="w-5 h-5 rotate-45" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 block uppercase tracking-tight">{cat.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">{cat.id}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isCustom ? (
                            <span className="text-[9px] bg-teal-100 text-teal-800 font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              Custom
                            </span>
                          ) : (
                            <span className="text-[9px] bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              System
                            </span>
                          )}

                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete the category "${cat.name}"?`)) {
                                  setBCustomCategories(prev => prev.filter(c => c.id !== cat.id));
                                  setBCategoryImages(prev => {
                                    const copied = { ...prev };
                                    delete copied[cat.id];
                                    return copied;
                                  });
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Cover Image Controls */}
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <div className="flex gap-1.5 items-center">
                          <input
                            type="text"
                            placeholder="Visual cover URL"
                            value={currentImg.startsWith("data:") ? "[Uploaded Image file]" : currentImg}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val !== "[Uploaded Image file]") {
                                setBCategoryImages(prev => ({ ...prev, [cat.id]: val }));
                              }
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                          <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border border-slate-200 whitespace-nowrap transition-colors">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      setBCategoryImages(prev => ({ ...prev, [cat.id]: reader.result }));
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Direct Product Creation Trigger */}
                      <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold">Add products directly here:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNewProdCategory(cat.id);
                            document.getElementById('add-product')?.scrollIntoView({ behavior: 'smooth' });
                            alert(`✏️ Ready! The Add Product form category has been preset to "${cat.name}". Please scroll down to fill out other product specifications.`);
                          }}
                          className="bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-teal-700 font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-teal-600" /> Add Product
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div id="add-product" className="w-full bg-white/50 p-6 rounded-3xl border border-slate-200/60 shadow-sm scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-6">
              <div>
                <h2 className="text-lg font-black text-gray-800">Add New Medicine or Product</h2>
                <p className="text-xs text-gray-400 mt-1">Register new stock batch, active compositions, uses, and pricing indicators in the master database.</p>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                {/* Image Upload Row */}
                <div className="border border-slate-100 p-4 rounded-xl space-y-3 bg-slate-50">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Product Image & Asset Upload</span>
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="w-24 h-24 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                      {newProdImage ? (
                        <img src={newProdImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Pill className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl cursor-pointer transition-colors">
                        <PlusCircle className="w-3.5 h-3.5" /> Select Medicine Image
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleProductImageChange} 
                          className="hidden" 
                        />
                      </label>
                      <p className="text-[10px] text-gray-400">
                        {newProdImageName ? `Selected: ${newProdImageName}` : "Supports JPG, PNG, WEBP. Transmits securely as Base64 data."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Medicine Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Paracetamol 650mg (Dolo-650)" 
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Brand / Company Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Micro Labs, Cipla" 
                      value={newProdBrand}
                      onChange={(e) => setNewProdBrand(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Selling Price (₹) *</label>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      placeholder="Selling Price in Rs." 
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">MRP / Print Price (₹)</label>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="Original MRP (for discount %)" 
                      value={newProdMrp}
                      onChange={(e) => setNewProdMrp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Initial Stock Count</label>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="e.g. 100" 
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 text-center font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Product Category</label>
                    <select 
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                    >
                      {[...CATEGORIES.slice(1), ...bCustomCategories].map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-5">
                    <input 
                      type="checkbox" 
                      id="rx-required-check"
                      checked={newProdRxRequired}
                      onChange={(e) => setNewProdRxRequired(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <label htmlFor="rx-required-check" className="font-extrabold text-gray-700 cursor-pointer select-none">
                      Requires Doctor's Prescription (Rx)?
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Chemical/Drug Composition</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Paracetamol IP 650mg, Caffeine 30mg" 
                    value={newProdComposition}
                    onChange={(e) => setNewProdComposition(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Uses (Comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="Fever, Mild Pain, Headaches" 
                      value={newProdUses}
                      onChange={(e) => setNewProdUses(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Manufacturer</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Micro Labs Ltd" 
                      value={newProdManufacturer}
                      onChange={(e) => setNewProdManufacturer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dosage Details</label>
                    <input 
                      type="text" 
                      placeholder="e.g. One tablet every 6 hours, max 4 a day" 
                      value={newProdDosage}
                      onChange={(e) => setNewProdDosage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">How To Use</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Take with water after eating meal" 
                      value={newProdHowToUse}
                      onChange={(e) => setNewProdHowToUse(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Side Effects (Comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="Nausea, Sleepiness, Dry Mouth" 
                      value={newProdSideEffects}
                      onChange={(e) => setNewProdSideEffects(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Warnings / Contraindications (Comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="Avoid alcohol, Do not exceed dose, Liver disease" 
                      value={newProdWarnings}
                      onChange={(e) => setNewProdWarnings(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Storage Condition</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Store below 30°C in cool dry place" 
                      value={newProdStorage}
                      onChange={(e) => setNewProdStorage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expiration / Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 12/2028 or 2028-12-31" 
                      value={newProdExpiry}
                      onChange={(e) => setNewProdExpiry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingProd}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-xl cursor-pointer transition-colors flex items-center gap-2 text-xs shadow-md disabled:opacity-50"
                  >
                    {isSubmittingProd ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Adding to DB...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 text-green-400" /> Save Product & Add to Store
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Live Interactive Preview Card */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
                <span className="bg-blue-100 text-blue-800 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
                  Real-time Catalog Preview
                </span>
                <h3 className="font-black text-gray-900 mt-2">Store Card Mockup</h3>
                <p className="text-xs text-gray-400 mt-1">This is how the medicine will be displayed to patients browsing {branding?.appName || "Basanti Medical Store"}.</p>
                
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs mt-6 bg-white flex flex-col">
                  {/* Image section */}
                  <div className="h-44 bg-slate-50 relative flex items-center justify-center">
                    {newProdImage ? (
                      <img src={newProdImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-300">
                        <Pill className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        <span className="text-[10px]">No Image Selected</span>
                      </div>
                    )}
                    {newProdRxRequired && (
                      <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        Rx REQUIRED
                      </span>
                    )}
                    <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                      {newProdCategory.toUpperCase()}
                    </span>
                  </div>

                  {/* Body details */}
                  <div className="p-4 space-y-2">
                    <div>
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">
                        {newProdBrand || "GENERIC BRAND"}
                      </p>
                      <h4 className="font-bold text-gray-800 text-sm truncate">
                        {newProdName || "Medicine Name Placeholder"}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="flex text-amber-400">
                        {"★".repeat(5)}
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold">(12 reviews)</span>
                    </div>

                    <div className="flex items-baseline gap-2 pt-2 border-t border-slate-50">
                      <span className="text-base font-black text-blue-600">
                        ₹{newProdPrice || "0"}
                      </span>
                      {Number(newProdMrp) > Number(newProdPrice) && (
                        <>
                          <span className="text-[11px] line-through text-gray-400 font-medium">
                            ₹{newProdMrp}
                          </span>
                          <span className="text-[10px] text-green-600 font-black">
                            {Math.round(((Number(newProdMrp) - Number(newProdPrice)) / Number(newProdMrp)) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-[10px] text-gray-400 leading-relaxed truncate">
                      {newProdComposition || "Composition placeholder"}
                    </p>

                    <div className="pt-2 flex justify-between items-center text-[10px]">
                      <span className="text-gray-400">Stock Available: <strong className="font-bold text-gray-700">{newProdStock}</strong></span>
                      <span className="text-green-600 font-bold bg-green-50 px-1.5 py-0.2 rounded">In Stock</span>
                    </div>

                    <button
                      type="button"
                      className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold mt-2 hover:bg-blue-700 transition-colors cursor-pointer text-xs"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>

              {/* Tips block */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-md border border-indigo-950">
                <h4 className="font-bold text-xs text-green-400 uppercase tracking-widest flex items-center gap-1.5">
                  💡 Clinician Database Rules
                </h4>
                <ul className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                  <li>• **Prescription Lock**: If "Rx REQUIRED" is checked, users will be required to upload valid medical prescriptions before this item can pass payments.</li>
                  <li>• **Base64 Imaging**: Uploading real, high-resolution medicine images will store them locally so that they display correctly across the store, search suggestions, and invoice files.</li>
                  <li>• **Discount calculation**: Selling Price and MRP are dynamically evaluated to render visual percentage discount tags.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>


        {/* Lab Tests CMS Tab */}
        <div id="lab-tests" className="w-full bg-white/50 p-6 rounded-3xl border border-slate-200/60 shadow-sm scroll-mt-24">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black text-gray-800">Diagnostic Lab Tests Catalog</h2>
                <p className="text-xs text-gray-400 mt-1">Manage health checkup packages and services</p>
              </div>
              <button 
                onClick={() => {
                  const newId = 'lab-' + Date.now();
                  setBLabTests([{
                    id: newId,
                    name: "New Lab Test",
                    description: "",
                    price: 0,
                    mrp: 0,
                    testsCount: 0,
                    testsIncluded: [],
                    sampleRequired: "Blood",
                    reportsInHours: 24,
                    fastingRequired: false
                  }, ...bLabTests]);
                  setExpandedLabTestId(newId);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Add Lab Test
              </button>
            </div>

            <form onSubmit={handleSaveLabTests} className="space-y-4">
              {bLabTests.map((lt, idx) => (
                <div key={lt.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setExpandedLabTestId(expandedLabTestId === lt.id ? "" : lt.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-blue-500" />
                      <span className="font-bold text-sm text-slate-800">{lt.name || 'Unnamed Test'}</span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">₹{lt.price}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm('Delete this lab test?')) {
                            setBLabTests(bLabTests.filter(t => t.id !== lt.id));
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedLabTestId === lt.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {expandedLabTestId === lt.id && (
                    <div className="p-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase">Package Name</label>
                        <input type="text" value={lt.name} onChange={e => {
                          const newTests = [...bLabTests];
                          newTests[idx].name = e.target.value;
                          setBLabTests(newTests);
                        }} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold" required />
                      </div>
                      
                      <div className="space-y-1 md:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase">Description</label>
                        <textarea value={lt.description} onChange={e => {
                          const newTests = [...bLabTests];
                          newTests[idx].description = e.target.value;
                          setBLabTests(newTests);
                        }} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" rows={2} />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase">Selling Price (₹)</label>
                        <input type="number" value={lt.price} onChange={e => {
                          const newTests = [...bLabTests];
                          newTests[idx].price = Number(e.target.value);
                          setBLabTests(newTests);
                        }} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" required />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase">MRP (₹)</label>
                        <input type="number" value={lt.mrp} onChange={e => {
                          const newTests = [...bLabTests];
                          newTests[idx].mrp = Number(e.target.value);
                          setBLabTests(newTests);
                        }} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" required />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase">Tests Included (Comma separated)</label>
                        <input type="text" value={lt.testsIncluded.join(', ')} onChange={e => {
                          const newTests = [...bLabTests];
                          newTests[idx].testsIncluded = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          newTests[idx].testsCount = newTests[idx].testsIncluded.length;
                          setBLabTests(newTests);
                        }} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="e.g. CBC, LFT, KFT" />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase">Sample Required</label>
                        <input type="text" value={lt.sampleRequired} onChange={e => {
                          const newTests = [...bLabTests];
                          newTests[idx].sampleRequired = e.target.value;
                          setBLabTests(newTests);
                        }} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="e.g. Blood & Urine" />
                      </div>

                      <div className="flex gap-4 items-center">
                        <div className="space-y-1 flex-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase">Reports In (Hours)</label>
                          <input type="number" value={lt.reportsInHours} onChange={e => {
                            const newTests = [...bLabTests];
                            newTests[idx].reportsInHours = Number(e.target.value);
                            setBLabTests(newTests);
                          }} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                        </div>
                        <label className="flex items-center gap-2 mt-4 cursor-pointer">
                          <input type="checkbox" checked={lt.fastingRequired} onChange={e => {
                            const newTests = [...bLabTests];
                            newTests[idx].fastingRequired = e.target.checked;
                            setBLabTests(newTests);
                          }} className="w-4 h-4 rounded border-slate-300" />
                          <span className="text-sm font-bold text-slate-700">Fasting Required</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {bLabTests.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No lab tests configured. Add one above.
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={isSavingLabTests} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2 shadow-md">
                  {isSavingLabTests ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSavingLabTests ? 'Saving...' : 'Save Lab Tests Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Site Branding CMS Tab */}
        <div id="branding" className="w-full bg-white/40 p-2 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/50 shadow-xs scroll-mt-24">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100/80 shadow-lg p-4 sm:p-8 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 sm:pb-4">
              <div className="p-2 sm:p-3 bg-yellow-50 text-yellow-600 rounded-xl sm:rounded-2xl shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight">Dynamic Website Branding & Text CMS</h2>
                <p className="text-[10px] sm:text-xs text-slate-400">Edit your pharmacy app's name, logo, banner announcement, main hero title, slogans, image, support channels, and about descriptions. Changes update live instantly!</p>
              </div>
            </div>

            <form onSubmit={handleSaveBranding} className="space-y-6">
              {/* Core Brand Identity Section */}
              <div className="bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpandedBrandingSection(prev => prev === "core" ? "" : "core")}>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-blue-600" /> 1) Core Brand Identity
                  </h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedBrandingSection === "core" ? "rotate-180" : ""}`} />
                </div>
                {expandedBrandingSection === "core" && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Application Name</label>
                        <input type="text" required placeholder="Basanti Medical Store" value={bAppName} onChange={(e) => setBAppName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Theme Accent Color (Hex)</label>
                        <div className="flex gap-2">
                          <input type="color" value={bPrimaryColorHex} onChange={(e) => setBPrimaryColorHex(e.target.value)} className="w-10 h-8 p-0 rounded-lg cursor-pointer border border-slate-200" />
                          <input type="text" maxLength={7} placeholder="#2563eb" value={bPrimaryColorHex} onChange={(e) => setBPrimaryColorHex(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 text-center" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">App Header Logo / Icon Name</label>
                        <select value={bAppLogo} onChange={(e) => setBAppLogo(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500">
                          <option value="PlusSquare">Plus Square ⊞ (Medical default)</option>
                          <option value="Pill">Pill 💊</option>
                          <option value="Heart">Heart ❤️</option>
                          <option value="Activity">Activity 📈</option>
                          <option value="Sparkles">Sparkles ✨</option>
                          <option value="ShoppingBag">Shopping Bag 👜</option>
                          <option value="Shield">Shield 🛡️</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">AI Assistant Name</label>
                        <input type="text" required placeholder="e.g. Partha AI Assistant" value={bAiAssistantName} onChange={(e) => setBAiAssistantName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ops Panel Hub Title</label>
                        <input type="text" required placeholder="e.g. Partha Pharmacist & Operations Hub" value={bOpsPanelTitle} onChange={(e) => setBOpsPanelTitle(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-200/60 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Custom Header Logo Image</label>
                        <div className="flex gap-2 items-center">
                          {bCustomLogoUrl && (
                            <img src={bCustomLogoUrl} alt="Logo preview" className="w-8 h-8 rounded-lg object-contain bg-slate-100 border p-1" />
                          )}
                          <input type="text" placeholder="Paste image URL (or leave empty)" value={bCustomLogoUrl.startsWith("data:") ? "[Uploaded Image File]" : bCustomLogoUrl} onChange={(e) => { const val = e.target.value; if (val !== "[Uploaded Image File]") setBCustomLogoUrl(val); }} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500" />
                          <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border border-slate-200 whitespace-nowrap">
                            Upload File
                            <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setBCustomLogoUrl(reader.result); reader.readAsDataURL(file); } }} className="hidden" />
                          </label>
                          {bCustomLogoUrl && <button type="button" onClick={() => setBCustomLogoUrl("")} className="text-red-500 hover:text-red-600 text-xs font-bold px-2 py-1">Clear</button>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Logo Size (px)</label>
                        <div className="flex gap-2 items-center">
                          <input type="range" min="20" max="120" value={bCustomLogoSize} onChange={(e) => setBCustomLogoSize(Number(e.target.value))} className="w-full" />
                          <span className="text-xs font-bold text-slate-600 w-8">{bCustomLogoSize}px</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Header Slogan / Sub-text</label>
                        <input type="text" placeholder="e.g. Care • Trust • Pure" value={bBrandBio} onChange={(e) => setBBrandBio(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mobile Drawer Menu Header</label>
                        <input type="text" placeholder="e.g. Partha Navigation" value={bMobileNavTitle} onChange={(e) => setBMobileNavTitle(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Medicine Categories Custom Images Editor */}
              <div className="bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpandedBrandingSection(prev => prev === "categories" ? "" : "categories")}>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-500" /> 2) Manage Medicine Categories
                  </h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedBrandingSection === "categories" ? "rotate-180" : ""}`} />
                </div>
                {expandedBrandingSection === "categories" && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...CATEGORIES, ...bCustomCategories].slice(1).map((cat) => {
                        const currentImg = bCategoryImages[cat.id] || "";
                        const isCustom = bCustomCategories.some(c => c.id === cat.id);
                        return (
                          <div key={cat.id} className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-2 flex flex-col justify-between">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                              <span className="text-xs font-extrabold text-blue-900 uppercase tracking-tight">{cat.name}</span>
                              <div className="flex items-center gap-2">
                                {isCustom && (
                                  <button type="button" onClick={() => setBCustomCategories(prev => prev.filter(c => c.id !== cat.id))} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono uppercase">{cat.id}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center">
                              {currentImg ? (
                                <img src={currentImg} alt={cat.name} className="w-10 h-10 rounded-lg object-cover bg-slate-50 border p-0.5 shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-blue-50/50 text-blue-600 flex items-center justify-center shrink-0 border border-dashed border-blue-200"><Pill className="w-5 h-5 rotate-45" /></div>
                              )}
                              <input type="text" placeholder="Paste image URL (or upload)" value={currentImg.startsWith("data:") ? "[Uploaded Image]" : currentImg} onChange={(e) => { const val = e.target.value; if (val !== "[Uploaded Image]") { setBCategoryImages(prev => ({ ...prev, [cat.id]: val })); } }} className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-blue-500 animate-fade-in" />
                              <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border border-slate-200 whitespace-nowrap">
                                Upload
                                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setBCategoryImages(prev => ({ ...prev, [cat.id]: reader.result })); }; reader.readAsDataURL(file); } }} className="hidden" />
                              </label>
                              {currentImg && <button type="button" onClick={() => { setBCategoryImages(prev => { const updated = { ...prev }; delete updated[cat.id]; return updated; }); }} className="text-red-500 hover:text-red-600 text-xs font-bold px-1">Clear</button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="text-sm font-bold text-slate-700 mb-2">Add New Category</h4>
                      <div className="flex gap-2 items-end">
                        <div className="space-y-1 flex-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category Name</label>
                          <input type="text" id="new-category-name" placeholder="e.g. Diabetics Care" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <button type="button" onClick={() => {
                          const input = document.getElementById("new-category-name") as HTMLInputElement;
                          if (input && input.value.trim()) {
                            const name = input.value.trim();
                            const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            if (!CATEGORIES.find(c => c.id === id) && !bCustomCategories.find(c => c.id === id)) {
                              setBCustomCategories(prev => [...prev, { id, name }]);
                              input.value = "";
                            } else {
                              alert("Category already exists!");
                            }
                          }
                        }} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                          <PlusCircle className="w-4 h-4" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Services Cards Customization */}
              <div className="bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpandedBrandingSection(prev => prev === "quick" ? "" : "quick")}>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-500" /> 3) Quick Service Cards
                  </h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedBrandingSection === "quick" ? "rotate-180" : ""}`} />
                </div>
                {expandedBrandingSection === "quick" && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-4 border-b border-slate-200 pb-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-700">Expert Doctor Consult</h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${bEnableExpertDoctor ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {bEnableExpertDoctor ? 'Active' : 'Disabled'}
                          </span>
                          <button 
                            type="button"
                            onClick={() => setBEnableExpertDoctor(!bEnableExpertDoctor)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bEnableExpertDoctor ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bEnableExpertDoctor ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Image Upload for Doctor Section */}
                      <div className="border border-slate-100 p-4 rounded-xl space-y-3 bg-slate-50">
                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Card Background Image</span>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                          <div className="w-32 h-20 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 bg-slate-200 border border-slate-300">
                            {bExpertDoctorImage ? (
                              <img src={bExpertDoctorImage} alt="Expert Doctor Bg" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-slate-500 font-bold">No Image</span>
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl cursor-pointer transition-colors">
                              <PlusCircle className="w-3.5 h-3.5" /> Upload Background Image
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setBExpertDoctorImage(reader.result as string);
                                    reader.readAsDataURL(file);
                                  }
                                }} 
                                className="hidden" 
                              />
                            </label>
                            {bExpertDoctorImage && (
                              <button 
                                type="button"
                                onClick={() => setBExpertDoctorImage("")} 
                                className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold rounded-xl cursor-pointer transition-colors"
                              >
                                Remove
                              </button>
                            )}
                            <p className="text-[10px] text-slate-500">Upload a background image for the Expert Doctor card. It will replace the default white background.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Title</label>
                          <input type="text" value={bExpertDoctorTitle} onChange={e => setBExpertDoctorTitle(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Price / Offer</label>
                          <input type="text" value={bExpertDoctorPrice} onChange={e => setBExpertDoctorPrice(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                        <textarea value={bExpertDoctorDesc} onChange={e => setBExpertDoctorDesc(e.target.value)} rows={2} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div className="space-y-4 border-b border-slate-200 pb-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-700">Book Diagnostic Lab Tests</h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${bEnableBookLabTests ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {bEnableBookLabTests ? 'Active' : 'Disabled'}
                          </span>
                          <button 
                            type="button"
                            onClick={() => setBEnableBookLabTests(!bEnableBookLabTests)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bEnableBookLabTests ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bEnableBookLabTests ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                      <div className="border border-slate-100 p-4 rounded-xl space-y-3 bg-slate-50">
                        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Card Background Image</span>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                          <div className="w-32 h-20 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 bg-slate-200 border border-slate-300">
                            {bBookLabTestsImage ? (
                              <img src={bBookLabTestsImage} alt="Lab Tests Bg" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-slate-500 font-bold">No Image</span>
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl cursor-pointer transition-colors">
                              <PlusCircle className="w-3.5 h-3.5" /> Upload Background Image
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setBBookLabTestsImage(reader.result as string);
                                    reader.readAsDataURL(file);
                                  }
                                }} 
                                className="hidden" 
                              />
                            </label>
                            {bBookLabTestsImage && (
                              <button 
                                type="button"
                                onClick={() => setBBookLabTestsImage("")} 
                                className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold rounded-xl cursor-pointer transition-colors"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Title</label>
                          <input type="text" value={bBookLabTestsTitle} onChange={e => setBBookLabTestsTitle(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Delivery Time</label>
                          <input type="text" value={bBookLabTestsDelivery} onChange={e => setBBookLabTestsDelivery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                        <textarea value={bBookLabTestsDesc} onChange={e => setBBookLabTestsDesc(e.target.value)} rows={2} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    
                    {/* EXTRA SERVICES */}
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-700">Extra Quick Services</h4>
                        <button 
                          type="button"
                          onClick={() => {
                            setBExtraServices([...bExtraServices, {
                              id: Date.now().toString(),
                              title: "New Service",
                              desc: "Service description",
                              extraText: "Offer text",
                              bgColor: "bg-blue-50 text-blue-600",
                              badge: "NEW",
                              tab: "home"
                            }]);
                          }}
                          className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Add Service
                        </button>
                      </div>
                      
                      {bExtraServices.map((srv, idx) => (
                        <div key={srv.id} className="border border-slate-200 rounded-xl p-4 bg-white space-y-3 relative">
                          <button 
                            type="button" 
                            onClick={() => {
                              const newList = [...bExtraServices];
                              newList.splice(idx, 1);
                              setBExtraServices(newList);
                            }}
                            className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-gray-500 uppercase">Title</label>
                              <input type="text" value={srv.title} onChange={e => {
                                const newList = [...bExtraServices];
                                newList[idx].title = e.target.value;
                                setBExtraServices(newList);
                              }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-gray-500 uppercase">Extra Text (Price/Delivery)</label>
                              <input type="text" value={srv.extraText} onChange={e => {
                                const newList = [...bExtraServices];
                                newList[idx].extraText = e.target.value;
                                setBExtraServices(newList);
                              }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <label className="block text-[10px] font-bold text-gray-500 uppercase">Description</label>
                              <input type="text" value={srv.desc} onChange={e => {
                                const newList = [...bExtraServices];
                                newList[idx].desc = e.target.value;
                                setBExtraServices(newList);
                              }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="space-y-1 md:col-span-2 flex items-center gap-4">
                              <div className="w-16 h-12 bg-slate-200 rounded border flex items-center justify-center overflow-hidden">
                                {srv.image ? <img src={srv.image} className="w-full h-full object-cover" /> : <span className="text-[8px] text-slate-500">No Img</span>}
                              </div>
                              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-[10px] font-bold rounded-lg cursor-pointer">
                                Upload Bg Image
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        const newList = [...bExtraServices];
                                        newList[idx].image = reader.result as string;
                                        setBExtraServices(newList);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }} 
                                  className="hidden" 
                                />
                              </label>
                              {srv.image && (
                                <button type="button" onClick={() => {
                                  const newList = [...bExtraServices];
                                  newList[idx].image = "";
                                  setBExtraServices(newList);
                                }} className="text-red-500 text-[10px] font-bold">Clear</button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-700">Verify Delivery Availability</h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${bEnableVerifyDelivery ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {bEnableVerifyDelivery ? 'Active' : 'Disabled'}
                          </span>
                          <button 
                            type="button"
                            onClick={() => setBEnableVerifyDelivery(!bEnableVerifyDelivery)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bEnableVerifyDelivery ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bEnableVerifyDelivery ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Title</label>
                        <input type="text" value={bVerifyDeliveryTitle} onChange={e => setBVerifyDeliveryTitle(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
                        <textarea value={bVerifyDeliveryDesc} onChange={e => setBVerifyDeliveryDesc(e.target.value)} rows={2} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Background Image (Upload from Gallery)</label>
                        <div className="flex items-center gap-4">
                          {bVerifyDeliveryBgUrl && (
                            <img src={bVerifyDeliveryBgUrl} alt="Map Background" className="h-16 w-16 object-cover rounded-lg border border-slate-200 bg-slate-50" />
                          )}
                          <div className="flex-1">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    alert("Image size should be less than 2MB");
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setBVerifyDeliveryBgUrl(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                            />
                          </div>
                          {bVerifyDeliveryBgUrl && (
                            <button
                              type="button"
                              onClick={() => setBVerifyDeliveryBgUrl("")}
                              className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Delivery Locations Manager */}
                      <div className="mt-6 border-t border-slate-200 pt-4">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Serviceable Delivery Locations</label>
                        <div className="space-y-3">
                          {bDeliveryLocations.map((loc, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                              <div>
                                <p className="font-extrabold text-sm text-gray-800">{loc.pincode}</p>
                                <p className="text-xs text-gray-500">{loc.address}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setBDeliveryLocations(prev => prev.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {bDeliveryLocations.length === 0 && (
                            <p className="text-xs text-slate-400 italic">No delivery locations added. All pincodes will be unserviceable.</p>
                          )}
                          
                          <div className="flex gap-2 items-start mt-2 bg-slate-100 p-3 rounded-xl border border-slate-200">
                            <div className="flex-1 space-y-2">
                              <input 
                                type="text" 
                                placeholder="Pincode (e.g. 110019)" 
                                value={newLocPincode}
                                onChange={e => setNewLocPincode(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                              />
                              <input 
                                type="text" 
                                placeholder="Location details (e.g. Nehru Enclave, Delhi)" 
                                value={newLocAddress}
                                onChange={e => setNewLocAddress(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if(newLocPincode.trim() && newLocAddress.trim()) {
                                  setBDeliveryLocations(prev => [...prev, { pincode: newLocPincode.trim(), address: newLocAddress.trim() }]);
                                  setNewLocPincode("");
                                  setNewLocAddress("");
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg cursor-pointer h-full self-stretch flex items-center justify-center font-bold text-[10px] uppercase"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* Promo Banner and Announcement */}
              <div className="bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpandedBrandingSection(prev => prev === "promo" ? "" : "promo")}>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" /> 4) Header Promotion & Offers Banner
                  </h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedBrandingSection === "promo" ? "rotate-180" : ""}`} />
                </div>
                {expandedBrandingSection === "promo" && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Promo Banner Text (Appears at top of all pages)</label>
                      <input type="text" placeholder="e.g. 🎉 Super Offer: Apply code SONU20 for 20% OFF on all prescription medications today!" value={bBannerOfferText} onChange={(e) => setBBannerOfferText(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Hero Banner Section */}
              <div className="bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpandedBrandingSection(prev => prev === "hero" ? "" : "hero")}>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-purple-600" /> 5) Hero Home Banner Content
                  </h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedBrandingSection === "hero" ? "rotate-180" : ""}`} />
                </div>
                {expandedBrandingSection === "hero" && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Main Hero Title Headline</label>
                      <input type="text" required placeholder="Your Trusted Virtual Pharmacy" value={bHeroTitle} onChange={(e) => setBHeroTitle(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Hero Subtitle / Slogan Section */}
              <div className="bg-slate-50/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpandedBrandingSection(prev => prev === "slogan" ? "" : "slogan")}>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-600" /> 6) Hero Subtitle / Slogan
                  </h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedBrandingSection === "slogan" ? "rotate-180" : ""}`} />
                </div>
                {expandedBrandingSection === "slogan" && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Hero Subtitle / Slogan</label>
                      <textarea placeholder="Upload medical prescriptions and get pharmacology checks, express home deliveries, and 15% cashback rewards!" value={bHeroSlogan} onChange={(e) => setBHeroSlogan(e.target.value)} rows={2} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 font-medium" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Hero Cover Image (Green Section Background Image)</label>
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-3 rounded-xl border border-slate-200/80">
                        {bHeroImageUrl && (
                          <div className="relative shrink-0 border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <img src={bHeroImageUrl} alt="Hero cover preview" className="w-20 h-14 object-cover" />
                          </div>
                        )}
                        <div className="flex-1 w-full space-y-2">
                          <div className="flex gap-2 w-full">
                            <input 
                              type="text" 
                              placeholder="Paste image URL or click 'Gallery' ->" 
                              value={bHeroImageUrl.startsWith("data:") ? "[Uploaded Image File]" : bHeroImageUrl} 
                              onChange={(e) => { 
                                const val = e.target.value; 
                                if (val !== "[Uploaded Image File]") setBHeroImageUrl(val); 
                              }} 
                              className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-mono focus:ring-2 focus:ring-blue-500" 
                            />
                            <label className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer whitespace-nowrap flex items-center gap-1 shadow-sm transition-colors shrink-0">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Gallery</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => { 
                                  const file = e.target.files?.[0]; 
                                  if (file) { 
                                    const reader = new FileReader(); 
                                    reader.onloadend = () => setBHeroImageUrl(reader.result as string); 
                                    reader.readAsDataURL(file); 
                                  } 
                                }} 
                                className="hidden" 
                              />
                            </label>
                            {bHeroImageUrl && (
                              <button 
                                type="button" 
                                onClick={() => setBHeroImageUrl("")} 
                                className="text-red-500 hover:text-red-600 text-xs font-black px-2 py-1 shrink-0"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">✨ Highly recommended: Upload real pictures of your doctors, medical staff or shop front from your mobile library for maximum trust!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Support & Footer Info */}
              <div className="bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpandedBrandingSection(prev => prev === "footer" ? "" : "footer")}>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-green-600" /> 7) Patient Support Channels & About Footer
                  </h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedBrandingSection === "footer" ? "rotate-180" : ""}`} />
                </div>
                {expandedBrandingSection === "footer" && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Support Mobile Number</label>
                        <input type="text" placeholder="+91 98765 43210" value={bSupportPhone} onChange={(e) => setBSupportPhone(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Support Email Address</label>
                        <input type="email" placeholder="help@sonupharmacy.com" value={bSupportEmail} onChange={(e) => setBSupportEmail(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">About Us / Store Bio (Footer & App tabs)</label>
                      <textarea placeholder="Explain your pharmacy's license, team, and delivery locations..." value={bAboutUsText} onChange={(e) => setBAboutUsText(e.target.value)} rows={3} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Clinic / Pharmacy Address</label>
                        <input type="text" placeholder="e.g. Sector 4, Nehru Enclave, New Delhi, 110019" value={bClinicAddress} onChange={(e) => setBClinicAddress(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500" /> Clinic Location Link (Google Maps URL)
                        </label>
                        <input type="url" placeholder="e.g. https://maps.app.goo.gl/abc" value={bClinicLocationUrl} onChange={(e) => setBClinicLocationUrl(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Premium Club Section */}
              <div className="bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpandedBrandingSection(prev => prev === "premium" ? "" : "premium")}>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> 8) Premium Loyalty Club
                  </h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedBrandingSection === "premium" ? "rotate-180" : ""}`} />
                </div>
                {expandedBrandingSection === "premium" && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-xl">
                      <input 
                        type="checkbox" 
                        id="enable-premium-club"
                        checked={bIsPremiumClubEnabled} 
                        onChange={(e) => setBIsPremiumClubEnabled(e.target.checked)} 
                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" 
                      />
                      <label htmlFor="enable-premium-club" className="text-sm font-bold text-slate-800 cursor-pointer">
                        Enable Premium Loyalty Club Section on Homepage
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Club Tag / Title</label>
                        <input type="text" placeholder="SONU PREMIUM CLUB" value={bPremiumClubTitle} onChange={(e) => setBPremiumClubTitle(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Highlight Slogan / Headline</label>
                        <input type="text" placeholder="Refer your friends & receive direct cashback..." value={bPremiumClubSlogan} onChange={(e) => setBPremiumClubSlogan(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Benefits Description Text</label>
                      <textarea placeholder="Earn 5% reward points on every order..." value={bPremiumClubDescription} onChange={(e) => setBPremiumClubDescription(e.target.value)} rows={3} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* WHATSAPP ORDER INTEGRATION */}
              <div className="bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpandedBrandingSection(prev => prev === "whatsapp" ? "" : "whatsapp")}>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.12.548 4.148 1.583 5.946L.048 24l6.196-1.626a11.96 11.96 0 005.787 1.493h.005c6.645 0 12.03-5.386 12.03-12.033 0-3.218-1.253-6.246-3.528-8.523A11.996 11.996 0 0012.031 0zm0 21.84c-1.782 0-3.528-.478-5.06-1.385l-.362-.215-3.76 1.018 1.006-3.666-.236-.375A9.972 9.972 0 012.012 12.03c0-5.522 4.492-10.015 10.019-10.015 2.678 0 5.195 1.042 7.086 2.936 1.892 1.893 2.934 4.412 2.934 7.085 0 5.524-4.494 10.017-10.019 10.017h-.001zm5.5-7.522c-.302-.15-1.784-.881-2.062-.981-.277-.101-.48-.152-.681.152-.202.302-.78 1.018-.956 1.228-.176.21-.353.235-.655.085-.302-.15-1.272-.47-2.423-1.496-.895-.798-1.5-1.785-1.677-2.088-.176-.302-.019-.465.132-.615.135-.135.302-.353.454-.53.15-.175.201-.301.302-.503.1-.202.05-.378-.025-.53-.076-.15-1.026-2.5-1.378-3.411-.341-.884-.687-.764-.956-.777-.253-.013-.531-.013-.809-.013-.277 0-.73.104-1.108.528-.378.425-1.436 1.405-1.436 3.426 0 2.022 1.487 3.98 1.688 4.256.202.277 2.9 4.426 7.027 6.21 4.127 1.783 4.127 1.185 4.883 1.135.756-.051 2.433-1.134 2.785-2.064.352-.929.352-1.733.251-1.934-.1-.2-.378-.327-.681-.478z"/></svg>
                    9) WhatsApp Order Integration
                  </h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedBrandingSection === "whatsapp" ? "rotate-180" : ""}`} />
                </div>
                {expandedBrandingSection === "whatsapp" && (
                  <div className="space-y-4 pt-2">
                    {bEnableWhatsappOrder && (
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">WhatsApp Business Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 919876543210 (include country code without +)" 
                          value={bWhatsappNumber} 
                          onChange={(e) => setBWhatsappNumber(e.target.value)} 
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" 
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Make sure to include the country code, e.g., 91 for India.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* ABOUT US CMS INTEGRATION */}
              <div className="bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpandedBrandingSection(prev => prev === "aboutus" ? "" : "aboutus")}>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    10) About Us Page Settings
                  </h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedBrandingSection === "aboutus" ? "rotate-180" : ""}`} />
                </div>
                {expandedBrandingSection === "aboutus" && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Enable About Us Modal</h4>
                        <p className="text-[10px] text-slate-500">Show link in mobile menu.</p>
                      </div>
                      <button type="button" onClick={() => setBEnableAboutUsPage(!bEnableAboutUsPage)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bEnableAboutUsPage ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bEnableAboutUsPage ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Page Title</label>
                      <input type="text" value={bAboutUsPageTitle} onChange={(e) => setBAboutUsPageTitle(e.target.value)} placeholder="About Basanti Medical Store" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800" />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Main Description Text</label>
                      <textarea value={bAboutUsPageText} onChange={(e) => setBAboutUsPageText(e.target.value)} rows={4} placeholder="Description about the pharmacy..." className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700" />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Hero Image URL</label>
                      <div className="relative flex shadow-sm rounded-xl overflow-hidden border border-slate-200 bg-white">
    <input type="text" value={bAboutUsPageImage.startsWith("data:") ? "[Uploaded Image File]" : bAboutUsPageImage} onChange={(e) => { const v = e.target.value; if(v !== "[Uploaded Image File]") setBAboutUsPageImage(v); }} placeholder="Image URL or upload..." className="flex-1 px-3 py-2 text-xs text-slate-700 focus:outline-none" />
    <div className="border-l border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative overflow-hidden flex items-center justify-center px-3">
      <span className="text-[10px] font-bold text-slate-600">Gallery</span>
      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setBAboutUsPageImage(reader.result); reader.readAsDataURL(file); } }} />
    </div>
  </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4 mt-4 space-y-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Facts Title</label>
                        <input type="text" value={bAboutUsFactsTitle} onChange={(e) => setBAboutUsFactsTitle(e.target.value)} placeholder="Few facts about us" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800" />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Facts List</label>
                        {bAboutUsFacts.map((fact, index) => (
                          <div key={fact.id || index} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 relative">
                            <button type="button" onClick={() => {
                              const newFacts = [...bAboutUsFacts];
                              newFacts.splice(index, 1);
                              setBAboutUsFacts(newFacts);
                            }} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                              <X className="w-4 h-4" />
                            </button>
                            <input type="text" value={fact.title} onChange={(e) => {
                              const newFacts = [...bAboutUsFacts];
                              newFacts[index].title = e.target.value;
                              setBAboutUsFacts(newFacts);
                            }} placeholder="Fact Title" className="w-full text-xs p-2 rounded border border-slate-200" />
                            <textarea value={fact.description} onChange={(e) => {
                              const newFacts = [...bAboutUsFacts];
                              newFacts[index].description = e.target.value;
                              setBAboutUsFacts(newFacts);
                            }} placeholder="Fact Description" rows={2} className="w-full text-xs p-2 rounded border border-slate-200" />
                            <div className="relative flex rounded border border-slate-200 bg-white overflow-hidden mt-1">
    <input type="text" value={fact.imageUrl.startsWith("data:") ? "[Uploaded File]" : fact.imageUrl} onChange={(e) => { const v = e.target.value; if (v !== "[Uploaded File]") { const newFacts = [...bAboutUsFacts]; newFacts[index].imageUrl = v; setBAboutUsFacts(newFacts); } }} placeholder="Image URL (square)" className="flex-1 p-2 text-xs focus:outline-none" />
    <div className="bg-slate-50 border-l border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer relative flex items-center px-2">
      <span className="text-[9px] font-bold text-slate-600">Upload</span>
      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { const newFacts = [...bAboutUsFacts]; newFacts[index].imageUrl = reader.result; setBAboutUsFacts(newFacts); }; reader.readAsDataURL(file); } }} />
    </div>
  </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => {
                          setBAboutUsFacts([...bAboutUsFacts, { id: 'fact' + Date.now(), title: '', description: '', imageUrl: '' }]);
                        }} className="w-full bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                          + Add Fact
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* INVEST WITH US CMS INTEGRATION */}
              <div className="bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpandedBrandingSection(prev => prev === "invest" ? "" : "invest")}>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    11) Invest With Us Settings
                  </h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedBrandingSection === "invest" ? "rotate-180" : ""}`} />
                </div>
                {expandedBrandingSection === "invest" && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Enable Invest With Us Modal</h4>
                        <p className="text-[10px] text-slate-500">Show link in mobile menu.</p>
                      </div>
                      <button type="button" onClick={() => setBEnableInvestPage(!bEnableInvestPage)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bEnableInvestPage ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bEnableInvestPage ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Page Title</label>
                      <input type="text" value={bInvestPageTitle} onChange={(e) => setBInvestPageTitle(e.target.value)} placeholder="Invest with us" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800" />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Main Description Text</label>
                      <textarea value={bInvestPageText} onChange={(e) => setBInvestPageText(e.target.value)} rows={5} placeholder="Description about investment opportunities..." className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700" />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Contact Email</label>
                      <input type="email" value={bInvestPageEmail} onChange={(e) => setBInvestPageEmail(e.target.value)} placeholder="contact@example.com" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700" />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Hero Image URL</label>
                      <div className="relative flex shadow-sm rounded-xl overflow-hidden border border-slate-200 bg-white">
    <input type="text" value={bInvestPageImage.startsWith("data:") ? "[Uploaded Image File]" : bInvestPageImage} onChange={(e) => { const v = e.target.value; if(v !== "[Uploaded Image File]") setBInvestPageImage(v); }} placeholder="Image URL or upload..." className="flex-1 px-3 py-2 text-xs text-slate-700 focus:outline-none" />
    <div className="border-l border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative overflow-hidden flex items-center justify-center px-3">
      <span className="text-[10px] font-bold text-slate-600">Gallery</span>
      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setBInvestPageImage(reader.result); reader.readAsDataURL(file); } }} />
    </div>
  </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GALLERY CMS INTEGRATION */}
              <div className="bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpandedBrandingSection(prev => prev === "gallery" ? "" : "gallery")}>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    12) Gallery & Address Page Settings
                  </h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedBrandingSection === "gallery" ? "rotate-180" : ""}`} />
                </div>
                {expandedBrandingSection === "gallery" && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Enable Gallery Modal</h4>
                        <p className="text-[10px] text-slate-500">Show link in mobile menu.</p>
                      </div>
                      <button type="button" onClick={() => setBEnableGalleryPage(!bEnableGalleryPage)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bEnableGalleryPage ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bEnableGalleryPage ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Page Top Title</label>
                      <input type="text" value={bGalleryPageTitle} onChange={(e) => setBGalleryPageTitle(e.target.value)} placeholder="Come and visit us" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800" />
                    </div>

                    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Gallery Images Grid</label>
                        <button type="button" onClick={() => setBGalleryImages([...bGalleryImages, { id: Date.now().toString(), url: "" }])} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-100">
                          + Add Image
                        </button>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {bGalleryImages.map((img, i) => (
                          <div key={img.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {img.url ? <img src={img.url} className="w-10 h-10 rounded object-cover flex-shrink-0 bg-white" /> : <div className="w-10 h-10 rounded bg-slate-200 flex-shrink-0" />}
                            <input 
                              type="text" 
                              value={img.url} 
                              onChange={(e) => {
                                const newImgs = [...bGalleryImages];
                                newImgs[i].url = e.target.value;
                                setBGalleryImages(newImgs);
                              }} 
                              placeholder="Image URL..." 
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-[10px]" 
                            />
                            <button type="button" onClick={() => setBGalleryImages(bGalleryImages.filter(x => x.id !== img.id))} className="text-red-500 p-1 hover:bg-red-50 rounded">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {bGalleryImages.length === 0 && <p className="text-xs text-slate-500 italic text-center py-2">No images added</p>}
                      </div>
                    </div>

                    <div className="space-y-1 mt-4 border-t border-slate-100 pt-4">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Address Title</label>
                      <input type="text" value={bGalleryAddressTitle} onChange={(e) => setBGalleryAddressTitle(e.target.value)} placeholder="Sector 4, New Delhi" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800" />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Address Details Text</label>
                      <textarea value={bGalleryAddressText} onChange={(e) => setBGalleryAddressText(e.target.value)} rows={4} placeholder="Directions and detailed location..." className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Contact Phone</label>
                        <input type="text" value={bGalleryContactPhone} onChange={(e) => setBGalleryContactPhone(e.target.value)} placeholder="Phone number" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Timing Info</label>
                        <input type="text" value={bGalleryTimingText} onChange={(e) => setBGalleryTimingText(e.target.value)} placeholder="open 6 days a week..." className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Bottom Banner Image URL</label>
                      <div className="relative flex shadow-sm rounded-xl overflow-hidden border border-slate-200 bg-white">
    <input type="text" value={bGalleryBannerImage.startsWith("data:") ? "[Uploaded Image File]" : bGalleryBannerImage} onChange={(e) => { const v = e.target.value; if(v !== "[Uploaded Image File]") setBGalleryBannerImage(v); }} placeholder="Image URL or upload..." className="flex-1 px-3 py-2 text-xs text-slate-700 focus:outline-none" />
    <div className="border-l border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative overflow-hidden flex items-center justify-center px-3">
      <span className="text-[10px] font-bold text-slate-600">Gallery</span>
      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setBGalleryBannerImage(reader.result); reader.readAsDataURL(file); } }} />
    </div>
  </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION VISIBILITY TOGGLES */}
              <div className="bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setExpandedBrandingSection(prev => prev === "visibility" ? "" : "visibility")}>
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-500" /> 6) Section Visibility (Show/Hide)
                  </h3>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedBrandingSection === "visibility" ? "rotate-180" : ""}`} />
                </div>
                {expandedBrandingSection === "visibility" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    
                    {/* Toggle Item */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Expert Doctor Consult</h4>
                        <p className="text-[10px] text-slate-500">Enable or disable on home page.</p>
                      </div>
                      <button type="button" onClick={() => setBEnableExpertDoctor(!bEnableExpertDoctor)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bEnableExpertDoctor ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bEnableExpertDoctor ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Toggle Item */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Diagnostic Lab Tests</h4>
                        <p className="text-[10px] text-slate-500">Enable or disable on home page.</p>
                      </div>
                      <button type="button" onClick={() => setBEnableBookLabTests(!bEnableBookLabTests)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bEnableBookLabTests ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bEnableBookLabTests ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Toggle Item */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Verify Delivery</h4>
                        <p className="text-[10px] text-slate-500">Enable or disable pincode checker.</p>
                      </div>
                      <button type="button" onClick={() => setBEnableVerifyDelivery(!bEnableVerifyDelivery)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bEnableVerifyDelivery ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bEnableVerifyDelivery ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Toggle Item */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Medicine Categories</h4>
                        <p className="text-[10px] text-slate-500">Enable or disable categories grid.</p>
                      </div>
                      <button type="button" onClick={() => setBEnableCategories(!bEnableCategories)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bEnableCategories ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bEnableCategories ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Toggle Item */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Top-Selling Medicines</h4>
                        <p className="text-[10px] text-slate-500">Enable or disable popular products.</p>
                      </div>
                      <button type="button" onClick={() => setBEnableTopSelling(!bEnableTopSelling)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bEnableTopSelling ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bEnableTopSelling ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Toggle Item */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Premium Club Section</h4>
                        <p className="text-[10px] text-slate-500">Enable or disable premium club banner.</p>
                      </div>
                      <button type="button" onClick={() => setBIsPremiumClubEnabled(!bIsPremiumClubEnabled)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bIsPremiumClubEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bIsPremiumClubEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Toggle Item */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Clinical Refills & Home Wellness</h4>
                        <p className="text-[10px] text-slate-500">Enable or disable refill subscriptions.</p>
                      </div>
                      <button type="button" onClick={() => setBEnableRefills(!bEnableRefills)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bEnableRefills ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bEnableRefills ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Toggle Item */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">Trusted Virtual Pharmacy Features</h4>
                        <p className="text-[10px] text-slate-500">Enable or disable trusted features section.</p>
                      </div>
                      <button type="button" onClick={() => setBEnableTrustFeatures(!bEnableTrustFeatures)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bEnableTrustFeatures ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bEnableTrustFeatures ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Toggle Item */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div>
                        <h4 className="text-sm font-bold text-slate-700">WhatsApp Button</h4>
                        <p className="text-[10px] text-slate-500">Show floating order button.</p>
                      </div>
                      <button type="button" onClick={() => setBEnableWhatsappOrder(!bEnableWhatsappOrder)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${bEnableWhatsappOrder ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${bEnableWhatsappOrder ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' })} className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingBranding} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black text-xs px-8 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer">
                  {isSavingBranding ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Dynamic Branding</>}
                </button>
              </div>
            </form>
          </div>
        </div>
{/* Payment Gateway settings Tab */}
        <div id="payment-settings" className="w-full bg-white/40 p-2 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/50 shadow-xs scroll-mt-24">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100/80 shadow-lg p-4 sm:p-8 space-y-4 sm:space-y-6 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 sm:pb-4">
              <div className="p-2 sm:p-3 bg-orange-50 text-orange-600 rounded-xl sm:rounded-2xl shrink-0">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight">Direct Client Payment Gateway CMS</h2>
                <p className="text-[10px] sm:text-xs text-slate-400">Configure your direct UPI address, custom QR code, or banking coordinates. Customers will pay directly to these details upon checkout, and rupees will transfer directly into your configured bank account.</p>
              </div>
            </div>

            <form onSubmit={handleSavePaymentSettings} className="space-y-6 text-xs text-slate-700">
              {/* UPI Configuration */}
              <div className="bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600" /> UPI Settings (Instant App & QR)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Merchant UPI ID <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. clientname@okaxis or 9876543210@paytm"
                      value={pUpiId}
                      onChange={(e) => setPUpiId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-gray-400">Customers will be directed to send money to this address.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Upload Merchant QR Code Image (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleUpiQrCodeChange}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer font-semibold"
                    />
                    <p className="text-[10px] text-gray-400">Upload screenshot of GPay/PhonePe business QR. If omitted, a dynamic UPI QR is auto-generated!</p>
                  </div>
                </div>

                {pUpiQrCode && (
                  <div className="mt-2 flex flex-col items-center bg-white p-3 rounded-xl border border-slate-200/50 max-w-[200px] mx-auto text-center space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold">Configured QR Code:</p>
                    <img src={pUpiQrCode} alt="Custom UPI QR" className="w-32 h-32 object-contain" />
                    <button 
                      type="button" 
                      onClick={() => setPUpiQrCode("")} 
                      className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Remove Custom QR
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Bank Account (Optional Alternative) */}
              <div className="bg-slate-50/50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-green-600" /> Direct Bank Account Details (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Bank Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. State Bank of India"
                      value={pBankName}
                      onChange={(e) => setPBankName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Account Holder Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Partha Medical Store"
                      value={pAccountHolderName}
                      onChange={(e) => setPAccountHolderName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Account Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 34098234891"
                      value={pAccountNumber}
                      onChange={(e) => setPUpiAccountNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">IFSC Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. SBIN0001234"
                      value={pIfscCode}
                      onChange={(e) => setPIfscCode(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSavingPaymentSettings}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black text-xs px-8 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  {isSavingPaymentSettings ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Payment Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Dynamic Advertisement Desk CMS Tab */}
        <div id="advertisements" className="w-full bg-white/40 p-2 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/50 shadow-xs scroll-mt-24">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100/80 shadow-lg p-4 sm:p-8 space-y-4 sm:space-y-6 max-w-4xl mx-auto text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight">Widescreen Ad Desk CMS (16:9 Ratio)</h2>
                  <p className="text-[10px] sm:text-xs text-slate-400">Launch, edit, or deactivate interactive banner slides displayed dynamically below the branding header. Supports cinematic 16:9 videos and image banners.</p>
                </div>
              </div>
              
              {!isAddingAd && !editingAdId && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingAd(true);
                    setEditingAdId(null);
                    setAdForm({
                      title: "",
                      description: "",
                      mediaType: "image",
                      mediaUrl: "",
                      ctaText: "Explore Now",
                      linkUrl: "home",
                      active: true
                    });
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-center"
                >
                  <PlusCircle className="w-4 h-4" /> Create New Ad
                </button>
              )}
            </div>

            {/* Ad Add/Edit Form */}
            {(isAddingAd || editingAdId) && (
              <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/50 space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    {editingAdId ? "✏️ Edit Advertisement Campaign" : "🚀 Launch New Advertisement Campaign"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingAd(false);
                      setEditingAdId(null);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold hover:underline"
                  >
                    Cancel Form
                  </button>
                </div>

                <form onSubmit={handleSaveAd} className="space-y-4 text-xs text-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Campaign Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ultra Fast 15-Min Medicine Courier Delivery"
                        value={adForm.title}
                        onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Media Type</label>
                        <select
                          value={adForm.mediaType}
                          onChange={(e) => setAdForm({ ...adForm, mediaType: e.target.value as 'image' | 'video' })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="image">Static Image (16:9)</option>
                          <option value="video">Auto-Play Video (16:9)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Target Page Tab</label>
                        <select
                          value={adForm.linkUrl}
                          onChange={(e) => setAdForm({ ...adForm, linkUrl: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="home">Home Dashboard</option>
                          <option value="store">Store Catalog</option>
                          <option value="rx">Upload Prescription</option>
                          <option value="doctor">Consult Doctor</option>
                          <option value="labs">Diagnostic Lab Tests</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Media URL (YouTube link, Unsplash link, or MP4 URL) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. https://images.unsplash.com/photo-1471864190281-a93a3070b6de or YouTube link"
                      value={adForm.mediaUrl}
                      onChange={(e) => setAdForm({ ...adForm, mediaUrl: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-gray-400">For video, you can paste standard YouTube URLs (e.g. watch?v=...) and the dashboard will convert it to a pristine 16:9 iframe automatically!</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Call-To-Action (CTA) Button Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Book Consultation"
                        value={adForm.ctaText}
                        onChange={(e) => setAdForm({ ...adForm, ctaText: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={adForm.active}
                          onChange={(e) => setAdForm({ ...adForm, active: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="ml-3 text-[11px] font-black text-gray-700 uppercase tracking-wider">Campaign Active & Live</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Campaign Subtitle & Description *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Explain what the product or service is in detail. Highlight discounts, features, and loyalty advantages."
                      value={adForm.description}
                      onChange={(e) => setAdForm({ ...adForm, description: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingAd(false);
                        setEditingAdId(null);
                      }}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAd}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-black rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      {isSavingAd ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Campaign
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of Current Ads */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Current Advertisement Campaigns ({advertisements.length})
              </h3>

              {advertisements.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-medium">
                  No active or inactive advertisement campaigns stored. Click "Create New Ad" above to launch one.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {advertisements.map((ad) => (
                    <div 
                      key={ad.id} 
                      className={`p-4 bg-slate-50 hover:bg-slate-100/70 border rounded-2xl flex flex-col justify-between gap-3 transition-all ${
                        ad.active ? 'border-emerald-200 shadow-emerald-50/50 shadow-sm' : 'border-slate-200'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* 16:9 Thumbnail preview box */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-200/60 shadow-xs">
                          {ad.mediaType === 'video' ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-100 bg-slate-950/85 p-2 text-center">
                              <Play className="w-8 h-8 text-red-500 fill-current mb-1" />
                              <span className="text-[10px] font-bold line-clamp-1">{ad.mediaUrl}</span>
                            </div>
                          ) : (
                            <img 
                              src={ad.mediaUrl} 
                              alt="Ad Thumbnail" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <span className={`absolute top-2 right-2 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs ${
                            ad.active ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                          }`}>
                            {ad.active ? 'LIVE' : 'PAUSED'}
                          </span>
                        </div>

                        <div className="text-left">
                          <h4 className="font-extrabold text-slate-800 text-xs line-clamp-1">{ad.title}</h4>
                          <p className="text-slate-500 text-[10px] line-clamp-2 mt-0.5">{ad.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200/50 pt-2 text-[10px]">
                        <span className="font-bold text-slate-400">
                          Targets: <span className="text-blue-600 uppercase font-extrabold">{ad.linkUrl}</span>
                        </span>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAdId(ad.id);
                              setIsAddingAd(false);
                              setAdForm({
                                title: ad.title,
                                description: ad.description,
                                mediaType: ad.mediaType,
                                mediaUrl: ad.mediaUrl,
                                ctaText: ad.ctaText || "Explore Now",
                                linkUrl: ad.linkUrl,
                                active: ad.active
                              });
                              // Scroll into view of form smoothly
                              document.getElementById('advertisements')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 rounded-lg font-bold transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAd(ad.id)}
                            className="px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Product Full details Edit Modal (Enables admin to change *anything* on products) */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-1.5 text-blue-600">
                <Edit className="w-5 h-5" /> Edit Medicine Catalog details
              </h3>
              <button 
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-600 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Medicine Name</label>
                  <input 
                    type="text" 
                    required
                    value={epName}
                    onChange={(e) => setEpName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Brand Name / Manufacturer</label>
                  <input 
                    type="text" 
                    required
                    value={epBrand}
                    onChange={(e) => setEpBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Selling Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={epPrice}
                    onChange={(e) => setEpPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-blue-600 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Original MRP Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={epMrp}
                    onChange={(e) => setEpMrp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Warehouse Stock Count</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={epStock}
                    onChange={(e) => setEpStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-green-600 text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Catalog Category</label>
                  <select 
                    value={epCategory}
                    onChange={(e) => setEpCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    {[...CATEGORIES.slice(1), ...bCustomCategories].map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-4">
                  <input 
                    type="checkbox" 
                    id="edit-rx-required"
                    checked={epRxRequired}
                    onChange={(e) => setEpRxRequired(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <label htmlFor="edit-rx-required" className="font-extrabold text-xs text-gray-700 cursor-pointer select-none">
                    Requires Doctor's Prescription (Rx)?
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Drug/Chemical Composition</label>
                <input 
                  type="text" 
                  value={epComposition}
                  onChange={(e) => setEpComposition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Medication Image URL</label>
                <input 
                  type="text" 
                  value={epImage}
                  onChange={(e) => setEpImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Uses (Comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Fever, Pain, Headache"
                    value={epUses}
                    onChange={(e) => setEpUses(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Manufacturer Lab</label>
                  <input 
                    type="text" 
                    value={epManufacturer}
                    onChange={(e) => setEpManufacturer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dosage Advice</label>
                  <input 
                    type="text" 
                    value={epDosage}
                    onChange={(e) => setEpDosage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">How To Consume</label>
                  <input 
                    type="text" 
                    value={epHowToUse}
                    onChange={(e) => setEpHowToUse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Side Effects (Comma separated)</label>
                  <input 
                    type="text" 
                    value={epSideEffects}
                    onChange={(e) => setEpSideEffects(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Precautions & Warnings (Comma separated)</label>
                  <input 
                    type="text" 
                    value={epWarnings}
                    onChange={(e) => setEpWarnings(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSavingProductEdit}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl flex items-center gap-1.5"
                >
                  {isSavingProductEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selectedDocProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-gray-900 text-lg">Doctor Profile Details</h3>
              <button type="button" onClick={() => {
                setSelectedDocProfile(null);
                setDocConfirmDelete(false);
                setDocSaveStatus("");
              }} className="text-slate-400 hover:text-slate-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="relative group">
                  <img src={editDocImage || selectedDocProfile.image || ''} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-md" />
                  <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-sm transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setEditDocImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-black text-base text-slate-900">{selectedDocProfile.name}</h4>
                  <p className="text-xs font-bold text-blue-600">{selectedDocProfile.specialty}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tap camera icon to upload photo from mobile gallery</p>
                </div>
              </div>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  setDocSaveStatus("Saving...");
                  const formData = new FormData(e.currentTarget);
                  const updatedDoc = {
                    ...selectedDocProfile,
                    name: formData.get('name'),
                    specialty: formData.get('specialty'),
                    experience: parseInt(formData.get('experience') as string),
                    consultationFee: parseInt(formData.get('fee') as string),
                    education: formData.get('education'),
                    phone: formData.get('phone'),
                    email: formData.get('email'),
                    offerTag: formData.get('offerTag') || undefined,
                    image: editDocImage || selectedDocProfile.image,
                  };
                  try {
                    const res = await fetch('/api/admin/doctors', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(updatedDoc)
                    });
                    if (res.ok) {
                      setDocSaveStatus("Saved successfully!");
                      onRefreshAllData();
                      setTimeout(() => {
                        setSelectedDocProfile(null);
                        setDocSaveStatus("");
                      }, 1000);
                    } else {
                      setDocSaveStatus("Failed to update");
                    }
                  } catch (err) {
                    console.error(err);
                    setDocSaveStatus("Error updating");
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                    <input name="name" defaultValue={selectedDocProfile.name} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Specialty</label>
                    <input name="specialty" defaultValue={selectedDocProfile.specialty} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Experience (Years)</label>
                    <input name="experience" type="number" defaultValue={selectedDocProfile.experience} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Consultation Fee (₹)</label>
                    <input name="fee" type="number" defaultValue={selectedDocProfile.consultationFee} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Education / Degree</label>
                  <input name="education" defaultValue={selectedDocProfile.education} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 text-red-500 flex items-center gap-1">Mobile Number (Private)</label>
                    <input name="phone" type="tel" defaultValue={selectedDocProfile.phone} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" placeholder="Only visible to admin" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 text-red-500 flex items-center gap-1">Email (Private)</label>
                    <input name="email" type="email" defaultValue={selectedDocProfile.email} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" placeholder="Only visible to admin" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Offer Tag</label>
                  <input name="offerTag" defaultValue={selectedDocProfile.offerTag || ""} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium" placeholder="e.g. 50% OFF" />
                </div>
                <div className="pt-4 border-t border-slate-100 mt-6">
                  {docSaveStatus && <div className="text-center text-xs font-bold text-blue-600 mb-3">{docSaveStatus}</div>}
                  <div className="flex justify-between gap-3">
                    {!docConfirmDelete ? (
                      <button
                        type="button"
                        onClick={() => setDocConfirmDelete(true)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Doctor
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          setDocSaveStatus("Deleting...");
                          try {
                            const res = await fetch(`/api/admin/doctors/${selectedDocProfile.id}`, { method: 'DELETE' });
                            if (res.ok) {
                              setDocSaveStatus("Deleted!");
                              onRefreshAllData();
                              setTimeout(() => {
                                setSelectedDocProfile(null);
                                setDocConfirmDelete(false);
                                setDocSaveStatus("");
                              }, 1000);
                            } else {
                              setDocSaveStatus("Failed to delete");
                              setDocConfirmDelete(false);
                            }
                          } catch(err) {
                            console.error(err);
                            setDocSaveStatus("Error deleting");
                            setDocConfirmDelete(false);
                          }
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        Click to Confirm Delete
                      </button>
                    )}
                    <button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
