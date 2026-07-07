import React, { useState, useEffect } from 'react';
import { Zap, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AiInsights() {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ai-insights');
      const data = await res.json();
      setInsights(data.insights || 'No insights available.');
    } catch (e) {
      setInsights('Failed to load AI insights. Ensure Gemini API key is configured.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-2xl shadow-lg mt-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black flex items-center gap-2 text-indigo-100">
            <Zap className="w-5 h-5 text-yellow-400" /> AI Business Insights (Gemini Pro)
          </h2>
          <p className="text-xs text-indigo-300 mt-1">Real-time analysis of pharmacy operations, sales trends, and AI recommendations.</p>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="bg-indigo-800 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 border border-indigo-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Analysis
        </button>
      </div>

      <div className="bg-white/10 border border-white/20 p-5 rounded-xl backdrop-blur-sm min-h-[120px]">
        {loading ? (
          <div className="flex items-center gap-3 text-indigo-200 text-sm h-full justify-center">
            <RefreshCw className="w-5 h-5 animate-spin" /> Analyzing entire database patterns...
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none text-indigo-50">
            {insights.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line.replace(/\\*/g, '')}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
