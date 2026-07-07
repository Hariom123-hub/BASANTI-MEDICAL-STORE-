/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, AlertCircle, X, Minimize2, Maximize2, Image, Paperclip } from 'lucide-react';
import { ChatMessage, SiteBranding } from '../types';

interface AIHelperProps {
  onSuggestMed?: (medName: string) => void;
  branding?: SiteBranding;
}

export default function AIHelper({ onSuggestMed, branding }: AIHelperProps) {
  const aiName = branding?.aiAssistantName || "Basanti AI Assistant";
  const primaryColor = branding?.primaryColorHex || "#0d9488";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: `👋 Hello! I am the **${aiName}**. \n\nHow can I help you today? I can:\n* Answer questions about health issues, symptoms, cuts, wounds, infections, rashes, etc.\n* **Upload an image** of a cut, wound, infection, rash, or delivery item/medicine to analyze it!\n* Recommend natural health tips and catalog medicines for wellness\n\n*Please ask your wellness question or upload an image below!*`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  useEffect(() => {
    setMessages(prev => {
      return prev.map(msg => {
        if (msg.id === "welcome") {
          return {
            ...msg,
            text: `👋 Hello! I am the **${aiName}**. \n\nHow can I help you today? I can:\n* Answer questions about health issues, symptoms, cuts, wounds, infections, rashes, etc.\n* **Upload an image** of a cut, wound, infection, rash, or delivery item/medicine to analyze it!\n* Recommend natural health tips and catalog medicines for wellness\n\n*Please ask your wellness question or upload an image below!*`
          };
        }
        return msg;
      });
    });
  }, [aiName]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setSelectedImage(event.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasInput = input.trim();
    if ((!hasInput && !selectedImage) || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: hasInput || "Analyze the uploaded image/symptom.",
      timestamp: new Date().toLocaleTimeString(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: "bot",
        text: data.text,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: "bot",
        text: `⚠️ Failed to connect to ${aiName} Server. Please verify server status.`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const PRESETS = [
    "What are the uses of Dolo-650?",
    "Suggest something natural for stress relief",
    "How do I manage high blood pressure?",
    "Which immunity booster do you have?"
  ];

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="ai-floating-trigger"
          className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 z-40 transition-transform hover:scale-105 active:scale-95 cursor-pointer hover:brightness-110"
          style={{ backgroundColor: primaryColor }}
        >
          <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="font-semibold text-sm pr-1">{aiName}</span>
        </button>
      )}

      {/* Main Chatbox Widget */}
      {isOpen && (
        <div
          id="ai-chatbox-container"
          className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 transition-all duration-300 ${
            isMinimized ? 'h-16 w-80' : 'h-[550px] w-[380px] max-w-full'
          }`}
        >
          {/* Header */}
          <div 
            className="text-white px-4 py-3 rounded-t-2xl flex items-center justify-between shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <div>
                <h3 className="font-bold text-sm tracking-wide">{aiName}</h3>
                <p className="text-[10px] text-white/80">Live AI Consultant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/10 p-1 rounded cursor-pointer"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10 p-1 rounded cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'text-white rounded-tr-none'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                      }`}
                      style={{ backgroundColor: msg.sender === 'user' ? primaryColor : undefined }}
                    >
                      {msg.image && (
                        <div className="mb-2 max-w-full overflow-hidden rounded-lg bg-black/5 p-0.5">
                          <img
                            src={msg.image}
                            alt="Uploaded symptoms or attachment"
                            className="max-h-40 object-contain w-full rounded-md"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      {/* Basic Markdown Parser for Bold and Lists */}
                      {msg.text.split('\n').map((line, i) => {
                        let text = line;
                        // Replace bold markdown
                        const boldRegex = /\*\*(.*?)\*\*/g;
                        const italicRegex = /\*(.*?)\*/g;

                        // Basic bullet point styling
                        const isBullet = text.trim().startsWith('*');
                        if (isBullet) {
                          text = text.trim().substring(1).trim();
                        }

                        const renderLine = () => {
                          const elements: React.ReactNode[] = [];
                          let lastIdx = 0;
                          let match;

                          // Quick regex text replacements
                          const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/);
                          return parts.map((part, index) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={index} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
                            } else if (part.startsWith('*') && part.endsWith('*')) {
                              return <em key={index} className="text-gray-500 italic block mt-2 text-xs border-t pt-1 border-gray-100">{part.slice(1, -1)}</em>;
                            }
                            return part;
                          });
                        };

                        if (isBullet) {
                          return (
                            <li key={i} className="list-disc ml-4 mt-1 text-gray-700">
                              {renderLine()}
                            </li>
                          );
                        }

                        return (
                          <p key={i} className="mt-1">
                            {renderLine()}
                          </p>
                        );
                      })}
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex items-center gap-2 text-gray-500 text-xs py-2">
                    <Sparkles className="w-4 h-4 animate-spin" style={{ color: primaryColor }} />
                    <span>Analyzing health queries & consulting catalog...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Presets and Input Form */}
              <div className="p-3 border-t bg-white">
                {messages.length === 1 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-semibold text-gray-400 mb-1 tracking-wider uppercase">Suggested Questions</p>
                    <div className="flex flex-wrap gap-1">
                      {PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(preset)}
                          className="text-[11px] border px-2.5 py-1 rounded-full cursor-pointer text-left font-bold transition-all hover:scale-[1.02]"
                          style={{
                            backgroundColor: `${primaryColor}0c`,
                            color: primaryColor,
                            borderColor: `${primaryColor}25`
                          }}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedImage && (
                  <div className="relative inline-block mb-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
                    <img
                      src={selectedImage}
                      alt="Selected symptoms or product preview"
                      className="h-14 w-14 object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow-md cursor-pointer transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-emerald-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    title="Upload image or cut/wound/infection photo"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Ask details or upload image/wound photo..."
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || (!input.trim() && !selectedImage)}
                    className="text-white p-2.5 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer shrink-0 hover:brightness-110"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2 justify-center">
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                  <span>{aiName} provides informational tips, not medical advice.</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
