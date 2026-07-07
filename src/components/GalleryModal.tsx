import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, MapPin, Phone } from 'lucide-react';
import type { GlobalSettings } from '../types';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: GlobalSettings | null;
}

export function GalleryModal({ isOpen, onClose, branding }: GalleryModalProps) {
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
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-4 md:inset-10 bg-white rounded-3xl z-[101] overflow-hidden flex flex-col shadow-2xl max-w-5xl mx-auto my-auto h-[fit-content] max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: branding.primaryColorHex || '#3b82f6' }}
                >
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-800">Gallery</h2>
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
              {/* Title Section */}
              <div className="bg-white px-6 py-10 md:py-16 text-center border-b border-slate-100">
                <h3 className="text-xl md:text-3xl font-black text-slate-800 max-w-3xl mx-auto leading-tight">
                  {branding.galleryPageTitle || 'Come and visit us'}
                </h3>
              </div>

              {/* Images Grid */}
              {branding.galleryImages && branding.galleryImages.length > 0 && (
                <div className="p-6 md:p-10 max-w-5xl mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {branding.galleryImages.map((img) => (
                      <div key={img.id} className="aspect-square rounded-2xl overflow-hidden shadow-md group">
                        <img 
                          src={img.url} 
                          alt="Gallery" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Address Section */}
              <div className="bg-white px-6 py-10 md:py-16 border-t border-slate-100">
                <div className="max-w-3xl mx-auto">
                  {branding.galleryAddressTitle && (
                    <div className="flex items-start gap-4 mb-6">
                      <div className="mt-1 flex-shrink-0 text-slate-400">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg md:text-2xl font-black text-slate-800">
                        {branding.galleryAddressTitle}
                      </h4>
                    </div>
                  )}
                  {branding.galleryAddressText && (
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed pl-10">
                      {branding.galleryAddressText}
                    </p>
                  )}
                </div>
              </div>

              {/* Banner Section */}
              <div className="relative h-80 md:h-[400px] w-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/60 z-10" />
                {branding.galleryBannerImage ? (
                  <img src={branding.galleryBannerImage} className="absolute inset-0 w-full h-full object-cover" alt="Store Banner" />
                ) : (
                  <div className="absolute inset-0 bg-slate-800" />
                )}
                
                <div className="relative z-20 text-center px-6 text-white space-y-6">
                  {branding.galleryAddressTitle && (
                    <h2 className="text-xl md:text-3xl font-bold max-w-2xl mx-auto">
                      {branding.galleryAddressTitle}
                    </h2>
                  )}
                  
                  {branding.galleryContactPhone && (
                    <div className="flex items-center justify-center gap-3 text-2xl md:text-5xl font-black" style={{ color: branding.primaryColorHex || '#10b981' }}>
                      <Phone className="w-8 h-8 md:w-10 md:h-10" />
                      {branding.galleryContactPhone}
                    </div>
                  )}

                  {branding.galleryTimingText && (
                    <p className="text-sm md:text-xl font-medium tracking-wide">
                      {branding.galleryTimingText}
                    </p>
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
