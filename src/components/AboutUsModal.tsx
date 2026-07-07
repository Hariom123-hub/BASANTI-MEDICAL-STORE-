import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { GlobalSettings } from '../types';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: GlobalSettings | null;
}

export function AboutUsModal({ isOpen, onClose, branding }: AboutUsModalProps) {
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
            className="fixed inset-4 md:inset-10 bg-white rounded-3xl z-[101] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: branding.primaryColorHex }}
                >
                  {branding.appName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-800">{branding.appName}</h2>
                  {branding.brandBio && (
                    <p className="text-xs text-slate-500 font-medium">{branding.brandBio}</p>
                  )}
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
            <div className="flex-1 overflow-y-auto bg-slate-50">
              {/* Hero Section */}
              <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12">
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 mb-8 md:mb-16">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="space-y-6">
                      <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                        Govt. registered licensed medical store
                      </div>
                      <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 leading-tight">
                        {branding.aboutUsPageTitle || `Welcome to ${branding.appName}`}
                      </h1>
                      <div className="h-1 w-20 rounded-full" style={{ backgroundColor: branding.primaryColorHex }} />
                      <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                        {branding.aboutUsPageText}
                      </p>
                    </div>
                    {branding.aboutUsPageImage && (
                      <div className="relative rounded-2xl overflow-hidden aspect-video lg:aspect-square shadow-lg">
                        <img 
                          src={branding.aboutUsPageImage} 
                          alt="About Us" 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Facts Section */}
                {branding.aboutUsFacts && branding.aboutUsFacts.length > 0 && (
                  <div className="py-8 md:py-12 rounded-3xl p-6 md:p-10 text-white" style={{ backgroundColor: branding.primaryColorHex }}>
                    <div className="text-center mb-12">
                      <h2 className="text-2xl md:text-4xl font-black mb-4">
                        {branding.aboutUsFactsTitle || `Few facts about ${branding.appName}`}
                      </h2>
                      <div className="h-1 w-20 bg-white/30 rounded-full mx-auto" />
                    </div>

                    <div className="space-y-12 md:space-y-24">
                      {branding.aboutUsFacts.map((fact, index) => (
                        <div 
                          key={fact.id} 
                          className={`flex flex-col gap-8 md:gap-16 items-center ${
                            index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                          }`}
                        >
                          <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight">
                              {fact.title}
                            </h3>
                            <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-xl mx-auto md:mx-0">
                              {fact.description}
                            </p>
                          </div>
                          <div className="flex-1 flex justify-center">
                            <div className="w-48 h-48 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl flex-shrink-0">
                              <img 
                                src={fact.imageUrl} 
                                alt={fact.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
