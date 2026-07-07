import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Volume2, Calendar, Pill, Shield, Award, Sparkles, Star } from 'lucide-react';
import { Advertisement } from '../types';

interface AdvertisementBannerProps {
  advertisements: Advertisement[];
  setActiveTab: (tab: string) => void;
  setSelectedCategory?: (cat: string) => void;
}

export default function AdvertisementBanner({
  advertisements,
  setActiveTab,
  setSelectedCategory
}: AdvertisementBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const activeAds = advertisements.filter(ad => ad.active).slice(0, 5);

  useEffect(() => {
    if (!isPlaying || activeAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeAds.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, activeAds.length]);

  if (activeAds.length === 0) return null;

  const currentAd = activeAds[currentIndex];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeAds.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + activeAds.length) % activeAds.length);
  };

  const handleCtaClick = (linkUrl?: string) => {
    if (!linkUrl) return;
    if (linkUrl === 'doctor' || linkUrl === 'labs' || linkUrl === 'rx' || linkUrl === 'store' || linkUrl === 'profile' || linkUrl === 'home') {
      setActiveTab(linkUrl);
      if (linkUrl === 'store' && setSelectedCategory) {
        setSelectedCategory('all');
      }
    }
  };

  // Check if media is a YouTube video link or direct video link
  const renderMedia = (ad: Advertisement) => {
    const isVideo = ad.mediaType === 'video';
    const url = ad.mediaUrl || '';

    if (isVideo) {
      const isYoutube = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('/embed/');
      if (isYoutube) {
        let embedUrl = url;
        // Convert watch?v= format to embed format
        if (url.includes('watch?v=')) {
          const videoId = url.split('v=')[1]?.split('&')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playlist=${videoId}&loop=1&controls=0&modestbranding=1&rel=0`;
        } else if (url.includes('youtu.be/')) {
          const videoId = url.split('youtu.be/')[1]?.split('?')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playlist=${videoId}&loop=1&controls=0&modestbranding=1&rel=0`;
        } else if (!url.includes('?')) {
          embedUrl = `${url}?autoplay=1&mute=1&loop=1&controls=0`;
        }

        return (
          <div className="absolute inset-0 w-full h-full pointer-events-none scale-105 select-none">
            <iframe
              title={ad.title}
              src={embedUrl}
              className="w-full h-full object-cover border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="no-referrer"
            />
          </div>
        );
      } else {
        // Render raw HTML5 Video Tag
        return (
          <video
            src={url}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        );
      }
    }

    // Default to Image
    return (
      <img
        src={url || ''}
        alt={ad.title}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
      />
    );
  };

  const getBadgeIcon = (linkUrl?: string) => {
    switch (linkUrl) {
      case 'doctor': return <Sparkles className="w-3.5 h-3.5 text-yellow-400" />;
      case 'labs': return <Award className="w-3.5 h-3.5 text-purple-400" />;
      case 'store': return <Pill className="w-3.5 h-3.5 text-blue-400" />;
      default: return <Shield className="w-3.5 h-3.5 text-green-400" />;
    }
  };

  return (
    <div 
      id="advertisements-carousel-wrapper" 
      className="relative max-w-7xl mx-auto px-4 md:px-6 mb-8 group animate-fade-in"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-slate-950 shadow-2xl border border-slate-100/50">
        
        {/* Dynamic media layer with anim presence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAd.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full"
          >
            {renderMedia(currentAd)}
            
            {/* Cinematic overlay for legible text spacing */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/30 to-transparent" />
            
            {/* Sliding Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-3.5 xs:p-5 sm:p-8 md:p-12 lg:p-16 text-white z-10">
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.35 }}
                className="max-w-2xl space-y-1 sm:space-y-2 md:space-y-4"
              >
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-3 sm:py-1 bg-white/10 backdrop-blur-md rounded-full text-[8px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-400 border border-white/10 shadow-inner">
                    {getBadgeIcon(currentAd.linkUrl)}
                    NEW EXCLUSIVE SERVICE
                  </span>
                  <span className="bg-yellow-400/90 text-slate-950 text-[7px] sm:text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs">
                    Ad {currentIndex + 1} of {activeAds.length}
                  </span>
                </div>

                <h1 className="text-xs xs:text-sm sm:text-2xl md:text-3xl lg:text-4.5xl font-black tracking-tight leading-tight text-white drop-shadow-md line-clamp-2">
                  {currentAd.title}
                </h1>

                <p className="text-[9px] xs:text-[10px] sm:text-xs md:text-base text-slate-200/95 leading-relaxed font-medium line-clamp-1 sm:line-clamp-2 md:line-clamp-none max-w-xl">
                  {currentAd.description}
                </p>

                <div className="pt-0.5 sm:pt-1.5 md:pt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-4">
                  <button
                    onClick={() => handleCtaClick(currentAd.linkUrl)}
                    className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] sm:text-xs md:text-sm px-2.5 py-1 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 hover:scale-102 cursor-pointer"
                  >
                    {currentAd.ctaText || "Check it out"}
                    <ChevronRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-slate-950" />
                  </button>
                  
                  {currentAd.mediaType === 'video' && (
                    <span className="text-[8px] sm:text-[9px] md:text-xs text-slate-300 font-semibold bg-white/5 backdrop-blur-xs px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-md sm:rounded-lg border border-white/5 flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-current text-red-500" />
                      Video Demo
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel buttons */}
        {activeAds.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white/80 hover:text-white border border-white/10 hover:bg-slate-900/90 transition-all cursor-pointer z-20 opacity-0 sm:group-hover:opacity-100 hidden sm:flex"
              title="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white/80 hover:text-white border border-white/10 hover:bg-slate-900/90 transition-all cursor-pointer z-20 opacity-0 sm:group-hover:opacity-100 hidden sm:flex"
              title="Next slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}

        {/* Bullet indicators bottom right */}
        {activeAds.length > 1 && (
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 md:right-12 z-20 flex gap-1 bg-slate-950/45 backdrop-blur-md p-1 rounded-full border border-white/10">
            {activeAds.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 sm:h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-3 sm:w-4 bg-emerald-400' : 'w-1 sm:w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
