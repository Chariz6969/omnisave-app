"use client";

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [upscale, setUpscale] = useState('1x');
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [taskId, setTaskId] = useState('');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<{ result_url: string; original_url: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setStatus('processing');
    setProgress(0);
    setStatusMessage('Initiating process...');
    
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, upscale })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || 'Failed to start task');
      
      setTaskId(data.task_id);
    } catch (err: any) {
      setStatus('error');
      setStatusMessage(err.message);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const checkStatus = async () => {
      if (!taskId) return;
      try {
        const res = await fetch(`/api/status/${taskId}`);
        if (!res.ok) return;
        
        const data = await res.json();
        setProgress(data.progress);
        setStatusMessage(data.status);
        
        if (data.status === 'Completed' || data.progress === 100) {
          setStatus('completed');
          setResult({ result_url: data.result_url, original_url: data.original_url });
          clearInterval(interval);
        } else if (data.status.startsWith('Error')) {
          setStatus('error');
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (status === 'processing' && taskId) {
      interval = setInterval(checkStatus, 1500);
    }

    return () => clearInterval(interval);
  }, [taskId, status]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-gradient-to-br from-platinum via-thistle to-boy-blue text-foreground">
      {/* Decorative background gradients (Subtle) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-boy-blue blur-[120px] opacity-30 mix-blend-multiply flex-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-thistle blur-[120px] opacity-40 mix-blend-multiply flex-none"></div>
      </div>

      <main className="max-w-3xl w-full flex flex-col items-center text-center space-y-10 z-10">
        
        {/* Header / Hero */}
        <div className="space-y-4">
          <div className="inline-block px-5 py-1.5 rounded-full bg-white/60 text-sm font-bold text-liberty backdrop-blur-md mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-white/50">
            ✨ AI-Powered Media Enhancer
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-foreground" style={{ letterSpacing: '-0.04em' }}>
            Download &<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-liberty to-bleu drop-shadow-sm">
              Elevate
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-foreground max-w-xl mx-auto font-medium opacity-85 leading-snug" style={{ letterSpacing: '-0.01em' }}>
            Get high-quality media from TikTok, Instagram, and Facebook. Remove watermarks and manually upscale up to 4x resolution using AI.
          </p>
        </div>

        {/* Dynamic Content Area: Input OR Progress OR Result */}
        {status === 'idle' || status === 'error' ? (
          <form onSubmit={handleSubmit} className="w-full bg-white/50 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-2 sm:p-4 rounded-3xl flex flex-col sm:flex-row items-center gap-3 transition-all duration-300 hover:shadow-[0_12px_48px_rgba(0,0,0,0.08)]">
            <div className="flex-1 w-full relative">
              <svg 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/50" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <input 
                type="url" 
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste video or photo link here..." 
                className="w-full bg-transparent pl-12 pr-4 py-4 sm:py-5 text-base sm:text-lg focus:outline-none placeholder:text-foreground/50 transition-colors rounded-2xl font-medium"
              />
            </div>
            
            {/* Options & Submit */}
            <div className="flex w-full sm:w-auto gap-2 px-2 sm:px-0 pb-2 sm:pb-0">
              <select 
                value={upscale}
                onChange={(e) => setUpscale(e.target.value)}
                className="bg-white/60 backdrop-blur-md px-4 py-3 sm:py-0 h-14 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-liberty/40 text-foreground cursor-pointer appearance-none border border-transparent shadow-sm hover:bg-white/80 transition-colors"
              >
                <option value="1x">Original</option>
                <option value="2x">Upscale 2x</option>
                <option value="4x">Upscale 4x</option>
              </select>

              <button type="submit" className="flex-1 sm:flex-none h-14 px-8 rounded-2xl bg-foreground text-white font-bold hover:scale-[0.98] active:scale-[0.96] transition-transform shadow-xl shadow-foreground/20 flex items-center justify-center gap-2 group">
                <span>Start</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
        ) : status === 'processing' ? (
          <div className="w-full flex flex-col items-center bg-white/40 backdrop-blur-xl border border-white/50 shadow-sm p-8 rounded-3xl gap-6">
            <div className="text-xl font-bold flex items-center gap-3">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-liberty" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {statusMessage || 'Processing...'}
            </div>
            
            {/* Progress Bar Container */}
            <div className="w-full bg-white/50 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-liberty to-bleu h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="font-semibold text-liberty">{progress}%</div>
          </div>
        ) : (
          <div className="w-full flex flex-col bg-white/70 backdrop-blur-2xl border border-white/60 shadow-lg p-6 rounded-3xl gap-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-foreground">✨ Processing Complete!</h2>
            
            {/* Minimalist Results Area */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/5 shadow-inner">
               <img src={result?.result_url} className="w-full h-full object-cover" alt="Processed Result" />
               <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-semibold">
                 Enhanced Result
               </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStatus('idle')}
                className="flex-1 py-4 rounded-xl font-semibold bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Process Another
              </button>
              <a 
                href={result?.result_url || '#'} 
                download 
                target="_blank" 
                className="flex-1 py-4 rounded-xl font-bold bg-foreground text-background hover:scale-[0.98] transition-transform shadow-xl shadow-foreground/20 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Master
              </a>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-red-500 font-semibold p-4 bg-red-50/50 backdrop-blur rounded-xl border border-red-200">
            {statusMessage}
          </div>
        )}

        {/* Features minimal grid */}
        {status === 'idle' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 w-full text-foreground">
            {/* Grid Items same as before */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center text-liberty shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-white/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="font-bold">No Watermark</h3>
              <p className="text-sm opacity-80 font-medium">Clean, unmarked media downloads</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center text-bleu shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-white/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="font-bold">AI Upscaling</h3>
              <p className="text-sm opacity-80 font-medium">Enhance resolution up to 4K</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center text-boy-blue shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-white/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="font-bold">Secure & Fast</h3>
              <p className="text-sm opacity-80 font-medium">Private processing on our servers</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
