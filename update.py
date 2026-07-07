with open("src/App.tsx", "r") as f:
    text = f.read()

text = text.replace(
    """{branding.expertDoctorImage && (
                      <div 
                        className="absolute inset-0 z-0"
                        style={{
                          background: `linear-gradient(135deg, ${branding.primaryColorHex || '#0d9488'}77 0%, ${branding.primaryColorHex || '#0d9488'}22 100%)`
                        }}
                      />
                    )}""",
    """{branding.expertDoctorImage && (
                      <div className="absolute inset-0 z-0 bg-white/60 backdrop-blur-sm" />
                    )}"""
)

text = text.replace(
    """<div className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-2xl group-hover:scale-105 transition-transform shadow-lg shadow-black/20">
                        <PhoneCall className="w-5 h-5" />
                      </div>""",
    """<div className="bg-green-100 text-green-600 p-3 rounded-2xl group-hover:scale-105 transition-transform shadow-sm">
                        <PhoneCall className="w-5 h-5" />
                      </div>"""
)

text = text.replace(
    """<div className="relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                      <h3 className={`font-black tracking-tight mt-4 text-base ${branding.expertDoctorImage ? 'text-white' : 'text-gray-950'}`}>
                        {branding.expertDoctorTitle || "Expert Doctor Consult"}
                      </h3>
                      <p className={`text-xs mt-1 leading-relaxed ${branding.expertDoctorImage ? 'text-slate-100' : 'text-gray-400'}`}>
                        {branding.expertDoctorDesc || "Book a live high-definition video session with certified cardiologists, dermatologists, and pediatricians"} 
                        {branding.expertDoctorPrice && ` ${branding.expertDoctorPrice}`}
                      </p>
                    </div>""",
    """<div className="relative z-10">
                      <h3 className="font-black tracking-tight mt-4 text-base text-gray-950">
                        {branding.expertDoctorTitle || "Expert Doctor Consult"}
                      </h3>
                      <p className="text-xs mt-1 leading-relaxed text-gray-700">
                        {branding.expertDoctorDesc || "Book a live high-definition video session with certified cardiologists, dermatologists, and pediatricians"} 
                        {branding.expertDoctorPrice && ` ${branding.expertDoctorPrice}`}
                      </p>
                    </div>"""
)

text = text.replace(
    """{branding.bookLabTestsImage && (
                      <div 
                        className="absolute inset-0 z-0"
                        style={{
                          background: `linear-gradient(135deg, ${branding.primaryColorHex || '#0d9488'}77 0%, ${branding.primaryColorHex || '#0d9488'}22 100%)`
                        }}
                      />
                    )}""",
    """{branding.bookLabTestsImage && (
                      <div className="absolute inset-0 z-0 bg-white/60 backdrop-blur-sm" />
                    )}"""
)

text = text.replace(
    """<div className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-2xl group-hover:scale-105 transition-transform shadow-lg shadow-black/20">
                        <Activity className="w-5 h-5" />
                      </div>""",
    """<div className="bg-purple-100 text-purple-600 p-3 rounded-2xl group-hover:scale-105 transition-transform shadow-sm">
                        <LineChart className="w-5 h-5" />
                      </div>"""
)

text = text.replace(
    """<div className="relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                      <h3 className={`font-black tracking-tight mt-4 text-base ${branding.bookLabTestsImage ? 'text-white' : 'text-gray-950'}`}>
                        {branding.bookLabTestsTitle || "Book Diagnostic Lab Tests"}
                      </h3>
                      <p className={`text-xs mt-1 leading-relaxed ${branding.bookLabTestsImage ? 'text-slate-100' : 'text-gray-400'}`}>
                        {branding.bookLabTestsDesc || "Full Body Checkups covering LFT, KFT, diabetes glucose load."}
                        {branding.bookLabTestsDelivery && ` ${branding.bookLabTestsDelivery}`}
                      </p>
                    </div>""",
    """<div className="relative z-10">
                      <h3 className="font-black tracking-tight mt-4 text-base text-gray-950">
                        {branding.bookLabTestsTitle || "Book Diagnostic Lab Tests"}
                      </h3>
                      <p className="text-xs mt-1 leading-relaxed text-gray-700">
                        {branding.bookLabTestsDesc || "Full Body Checkups covering LFT, KFT, diabetes glucose load."}
                        {branding.bookLabTestsDelivery && ` ${branding.bookLabTestsDelivery}`}
                      </p>
                    </div>"""
)

text = text.replace(
    """<div className="absolute inset-0 z-0 bg-black/60 pointer-events-none" />""",
    """<div className="absolute inset-0 z-0 bg-white/60 backdrop-blur-sm pointer-events-none" />"""
)

text = text.replace(
    """<div className={`p-3 rounded-2xl ${branding.verifyDeliveryBgUrl ? 'bg-white/20 text-red-500 backdrop-blur-sm' : 'bg-red-50 text-red-600'}`}><MapPin className="w-5 h-5" /></div>""",
    """<div className="p-3 rounded-2xl bg-red-50 text-red-600 shadow-sm"><MapPin className="w-5 h-5" /></div>"""
)

text = text.replace(
    """<h4 className={`font-extrabold text-sm leading-tight ${branding.verifyDeliveryBgUrl ? 'text-white' : 'text-gray-900'}`}>{branding.verifyDeliveryTitle || "Verify Delivery Availability"}</h4>
                    <p className={`text-xs mt-0.5 ${branding.verifyDeliveryBgUrl ? 'text-slate-300' : 'text-gray-400'}`}>{branding.verifyDeliveryDesc || "Enter your area pincode to check service availability & estimated dispatch durations."}</p>""",
    """<h4 className="font-extrabold text-sm leading-tight text-gray-900">{branding.verifyDeliveryTitle || "Verify Delivery Availability"}</h4>
                    <p className="text-xs mt-0.5 text-gray-700">{branding.verifyDeliveryDesc || "Enter your area pincode to check service availability & estimated dispatch durations."}</p>"""
)


with open("src/App.tsx", "w") as f:
    f.write(text)
