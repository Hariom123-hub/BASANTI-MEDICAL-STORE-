import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Mail } from 'lucide-react';
import type { GlobalSettings } from '../types';

interface InvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: GlobalSettings | null;
}

export function InvestModal({ isOpen, onClose, branding }: InvestModalProps) {
  if (!branding) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-4 md:inset-10 bg-white rounded-3xl z-[101] overflow-hidden flex flex-col shadow-2xl max-w-4xl mx-auto my-auto h-[fit-content] max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: branding.primaryColorHex }}
                >
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-800">{branding.investPageTitle || 'Invest with us'}</h2>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10">
              <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div className="h-1 w-20 rounded-full" style={{ backgroundColor: branding.primaryColorHex }} />
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      {branding.investPageText}
                    </p>
                    
                    {branding.investPageEmail && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0 text-blue-600">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Contact for Proposals</p>
                          <a href={`mailto:${branding.investPageEmail}`} className="text-base md:text-lg font-black text-slate-800 hover:text-blue-600 transition-colors break-all">
                            {branding.investPageEmail}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {branding.investPageImage && (
                    <div className="relative rounded-2xl overflow-hidden aspect-video md:aspect-square shadow-lg">
                      <img 
                        src={branding.investPageImage} 
                        alt="Invest with us" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
